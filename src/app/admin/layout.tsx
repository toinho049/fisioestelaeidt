"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { LogoDark } from "@/components/Logo";
import { LayoutDashboard, FileText, Key, LogOut, ShieldCheck, ArrowLeft } from "lucide-react";

const navItems = [
  { href: "/admin", label: "Visão Geral", icon: LayoutDashboard },
  { href: "/admin/solicitacoes", label: "Solicitações de Licença", icon: FileText },
  { href: "/admin/licencas", label: "Licenças Geradas", icon: Key },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status === "authenticated") {
      const role = session?.user?.role;
      if (role !== "superadmin") {
        router.push("/dashboard");
      }
    }
  }, [status, session, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#f8fafc" }}>
        <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: "#e2e8f0", borderTopColor: "#0ea5e9" }} />
      </div>
    );
  }

  const isActive = (href: string) => pathname === href || (href !== "/admin" && pathname.startsWith(href));

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#f1f5f9" }}>
      {/* Sidebar */}
      <aside
        className="fixed left-0 top-0 h-full w-60 flex flex-col z-40"
        style={{ backgroundColor: "#09090b", borderRight: "1px solid rgba(255,255,255,0.07)" }}
      >
        {/* Header */}
        <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <LogoDark size={30} showText />
          <div className="mt-2.5 flex items-center gap-1.5 px-1 py-1 rounded-lg" style={{ backgroundColor: "rgba(245,158,11,0.1)" }}>
            <ShieldCheck style={{ width: 12, height: 12, color: "#f59e0b" }} />
            <span className="text-xs font-bold" style={{ color: "#f59e0b" }}>Painel Admin</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{
                  backgroundColor: active ? "rgba(14,165,233,0.15)" : "transparent",
                  color: active ? "#38bdf8" : "#71717a",
                  borderLeft: active ? "2px solid #0ea5e9" : "2px solid transparent",
                }}
              >
                <Icon style={{ width: 15, height: 15, flexShrink: 0 }} />
                <span className="truncate">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="px-3 pb-4 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          {/* Usuário logado */}
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl mb-2" style={{ backgroundColor: "rgba(255,255,255,0.04)" }}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: "linear-gradient(135deg, #f59e0b, #ef4444)" }}>
              {session?.user?.name?.charAt(0) ?? "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate leading-none">{session?.user?.name}</p>
              <p className="text-xs mt-0.5" style={{ color: "#52525b" }}>Administrador</p>
            </div>
          </div>

          <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all w-full mb-1" style={{ color: "#52525b" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#a1a1aa"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#52525b"; }}
          >
            <ArrowLeft style={{ width: 13, height: 13 }} />
            Voltar ao Sistema
          </Link>

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all w-full"
            style={{ color: "#52525b" }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.08)"; e.currentTarget.style.color = "#ef4444"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#52525b"; }}
          >
            <LogOut style={{ width: 13, height: 13 }} />
            Sair
          </button>
        </div>
      </aside>

      <main style={{ marginLeft: 240, padding: 28, flex: 1 }}>
        {children}
      </main>
    </div>
  );
}
