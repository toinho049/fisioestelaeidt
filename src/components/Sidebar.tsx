"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard, Users, CalendarDays, FileText, DollarSign,
  Settings, BarChart3, ClipboardList, Dumbbell,
  HelpCircle, Building2, Target, LogOut, ShieldCheck, Clock, AlertTriangle,
} from "lucide-react";
import { LogoIcon } from "./Logo";
import { useEffect, useState } from "react";

const navSections = [
  {
    label: "PRINCIPAL",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/agenda", label: "Agenda", icon: CalendarDays },
      { href: "/pacientes", label: "Pacientes", icon: Users },
    ],
  },
  {
    label: "CLÍNICO",
    items: [
      { href: "/avaliacoes", label: "Avaliações", icon: ClipboardList },
      { href: "/atendimentos", label: "Evoluções", icon: FileText },
      { href: "/planos", label: "Plano de Tratamento", icon: Target },
      { href: "/exercicios", label: "Exercícios", icon: Dumbbell },
    ],
  },
  {
    label: "GESTÃO",
    items: [
      { href: "/financeiro", label: "Financeiro", icon: DollarSign },
      { href: "/relatorios", label: "Relatórios", icon: BarChart3 },
    ],
  },
  {
    label: "SISTEMA",
    items: [
      { href: "/equipe", label: "Equipe", icon: Building2 },
      { href: "/configuracoes", label: "Configurações", icon: Settings },
    ],
  },
];

interface LicencaStatus {
  ativa: boolean;
  diasRestantes?: number;
  nomeClinica?: string;
  plano?: string;
}

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [licenca, setLicenca] = useState<LicencaStatus | null>(null);

  useEffect(() => {
    fetch("/api/saas/ativar").then(r => r.json()).then(setLicenca).catch(() => null);
  }, []);

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  const userInitials = session?.user?.name
    ? session.user.name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  const isAdminRole = session?.user?.role === "superadmin";
  const diasRestantes = licenca?.diasRestantes ?? null;
  const alertaExpiracao = diasRestantes !== null && diasRestantes <= 7;

  return (
    <aside
      className="fixed left-0 top-0 h-full w-60 flex flex-col z-40 select-none"
      style={{ backgroundColor: "#0c1427", borderRight: "1px solid rgba(255,255,255,0.06)" }}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-3 px-5 py-4 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <LogoIcon size={34} />
        <div className="leading-none">
          <span className="font-black text-base tracking-tight" style={{ background: "linear-gradient(135deg, #0ea5e9, #10b981)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            Dom
          </span>
          <span className="font-black text-base tracking-tight text-white">Fisio</span>
        </div>
      </Link>

      {/* Licença status widget */}
      {licenca && (
        <div
          className="mx-3 mt-3 px-3 py-2.5 rounded-xl flex items-center gap-2.5"
          style={{
            backgroundColor: alertaExpiracao ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.08)",
            border: `1px solid ${alertaExpiracao ? "rgba(239,68,68,0.25)" : "rgba(16,185,129,0.2)"}`,
          }}
        >
          {alertaExpiracao
            ? <AlertTriangle style={{ width: 14, height: 14, color: "#ef4444", flexShrink: 0 }} />
            : <Clock style={{ width: 14, height: 14, color: "#10b981", flexShrink: 0 }} />
          }
          <div className="flex-1 min-w-0">
            {licenca.ativa ? (
              <>
                <p className="text-xs font-bold truncate" style={{ color: alertaExpiracao ? "#ef4444" : "#10b981" }}>
                  {alertaExpiracao ? `Expira em ${diasRestantes} dias!` : `${diasRestantes} dias restantes`}
                </p>
                <p className="text-xs truncate" style={{ color: alertaExpiracao ? "#fca5a5" : "#6ee7b7", opacity: 0.8 }}>
                  Plano {licenca.plano ?? "—"}
                </p>
              </>
            ) : (
              <>
                <p className="text-xs font-bold" style={{ color: "#ef4444" }}>Sem licença ativa</p>
                <Link href="/ativar" className="text-xs" style={{ color: "#fca5a5" }}>Ativar agora →</Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-4 mt-1">
        {navSections.map((section) => (
          <div key={section.label}>
            <p className="text-xs font-semibold px-2 mb-1.5" style={{ color: "#2d3f5a", letterSpacing: "0.07em" }}>
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map(({ href, label, icon: Icon }) => {
                const active = isActive(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150"
                    style={{
                      backgroundColor: active ? "rgba(14,165,233,0.12)" : "transparent",
                      color: active ? "#38bdf8" : "#64748b",
                      borderLeft: active ? "2px solid #0ea5e9" : "2px solid transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (!active) { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "#94a3b8"; }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#64748b"; }
                    }}
                  >
                    <Icon style={{ width: 15, height: 15, flexShrink: 0 }} />
                    <span className="truncate">{label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* Admin panel link — só para admin/superadmin */}
        {isAdminRole && (
          <div>
            <p className="text-xs font-semibold px-2 mb-1.5" style={{ color: "#2d3f5a", letterSpacing: "0.07em" }}>ADMIN</p>
            <Link
              href="/admin"
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                backgroundColor: pathname.startsWith("/admin") ? "rgba(245,158,11,0.12)" : "transparent",
                color: pathname.startsWith("/admin") ? "#fbbf24" : "#64748b",
                borderLeft: pathname.startsWith("/admin") ? "2px solid #f59e0b" : "2px solid transparent",
              }}
              onMouseEnter={(e) => {
                if (!pathname.startsWith("/admin")) { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "#94a3b8"; }
              }}
              onMouseLeave={(e) => {
                if (!pathname.startsWith("/admin")) { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#64748b"; }
              }}
            >
              <ShieldCheck style={{ width: 15, height: 15, flexShrink: 0 }} />
              <span>Painel Admin</span>
            </Link>
          </div>
        )}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 pt-3 flex-shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <Link href="/ajuda" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all mb-2" style={{ color: "#374151" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#64748b"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "#374151"; }}
        >
          <HelpCircle style={{ width: 14, height: 14 }} />
          Central de Ajuda
        </Link>

        {/* User card */}
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl mb-2" style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: "linear-gradient(135deg, #0ea5e9, #10b981)" }}>
            {userInitials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold truncate leading-none">{session?.user?.name ?? "..."}</p>
            <p className="text-xs mt-0.5 truncate capitalize" style={{ color: "#374151" }}>{session?.user?.role ?? ""}</p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-xs font-medium transition-all"
          style={{ color: "#475569" }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.08)"; e.currentTarget.style.color = "#ef4444"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#475569"; }}
        >
          <LogOut style={{ width: 14, height: 14 }} />
          Sair da conta
        </button>
      </div>
    </aside>
  );
}
