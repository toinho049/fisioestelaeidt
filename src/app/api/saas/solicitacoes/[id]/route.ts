import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Gera token no formato DOM-XXXX-XXXX-XXXX
function gerarToken(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bloco = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `DOM-${bloco()}-${bloco()}-${bloco()}`;
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  const sol = await prisma.solicitacaoLicenca.findUnique({
    where: { id },
    include: { licenca: true },
  });
  if (!sol) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  if (body.status === "aprovado" && !sol.licenca) {
    // Gera token único
    let token = gerarToken();
    while (await prisma.licenca.findUnique({ where: { token } })) {
      token = gerarToken();
    }

    const licenca = await prisma.licenca.create({
      data: {
        token,
        nomeClinica: sol.nomeClinica,
        email: sol.email,
        planoNome: sol.planoNome,
        diasValidade: sol.diasPlano,
        status: "pendente",
        solicitacaoId: id,
      },
    });

    await prisma.solicitacaoLicenca.update({
      where: { id },
      data: { status: "aprovado", observacoes: body.observacoes || null },
    });

    return NextResponse.json({ solicitacao: { ...sol, status: "aprovado" }, licenca });
  }

  const updated = await prisma.solicitacaoLicenca.update({
    where: { id },
    data: { status: body.status, observacoes: body.observacoes || null },
  });

  return NextResponse.json(updated);
}
