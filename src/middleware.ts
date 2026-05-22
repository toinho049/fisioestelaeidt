import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const ROTAS_SISTEMA = [
  "/dashboard", "/agenda", "/pacientes", "/avaliacoes",
  "/atendimentos", "/planos", "/exercicios", "/financeiro",
  "/relatorios", "/equipe", "/configuracoes",
];

const ROTAS_ADMIN = ["/admin"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const eSistema = ROTAS_SISTEMA.some(r => pathname === r || pathname.startsWith(`${r}/`));
  const eAdmin = ROTAS_ADMIN.some(r => pathname === r || pathname.startsWith(`${r}/`));

  if (!eSistema && !eAdmin) return NextResponse.next();

  // 1. Verifica autenticação
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // 2. /admin exige superadmin (só o dono do DomFisio)
  if (eAdmin && token.role !== "superadmin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 3. Sistema exige clínica com licença ativa
  if (eSistema) {
    const clinicaId = token.clinicaId as string | undefined;

    // Superadmin sem clínica: redireciona para admin
    if (!clinicaId) {
      if (token.role === "superadmin") return NextResponse.redirect(new URL("/admin", request.url));
      return NextResponse.redirect(new URL("/ativar", request.url));
    }

    // Verifica licença via API interna
    try {
      const licRes = await fetch(`${request.nextUrl.origin}/api/saas/ativar`, {
        headers: { cookie: request.headers.get("cookie") ?? "" },
      });
      if (licRes.ok) {
        const licData = await licRes.json();
        if (!licData.ativa) {
          return NextResponse.redirect(new URL("/ativar", request.url));
        }
      }
    } catch {
      // Se a API falhar, deixa passar (evita loop)
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|login|cadastro|ativar|$).*)"],
};
