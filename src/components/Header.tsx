"use client";

import { Bell, Search, ShieldCheck, Clock, AlertTriangle } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/agenda": "Agenda",
  "/pacientes": "Pacientes",
  "/avaliacoes": "Avaliações",
  "/atendimentos": "Evoluções",
  "/planos": "Plano de Tratamento",
  "/exercicios": "Exercícios",
  "/financeiro": "Financeiro",
  "/relatorios": "Relatórios",
  "/equipe": "Equipe",
  "/configuracoes": "Configurações",
};

interface LicencaStatus {
  ativa: boolean;
  nomeClinica?: string;
  plano?: string;
  diasRestantes?: number;
  dataExpiracao?: string;
}

export default function Header() {
  const pathname = usePathname();
  const [licenca, setLicenca] = useState<LicencaStatus | null>(null);

  const title =
    pageTitles[pathname] ??
    pageTitles[Object.keys(pageTitles).find((k) => pathname.startsWith(k)) ?? ""] ??
    "DomFisio";

  useEffect(() => {
    fetch("/api/saas/ativar")
      .then(r => r.json())
      .then(setLicenca)
      .catch(() => null);
  }, []);

  const diasRestantes = licenca?.diasRestantes ?? null;
  const alertaExpiracao = diasRestantes !== null && diasRestantes <= 7;
  const expirando = diasRestantes !== null && diasRestantes <= 30 && diasRestantes > 7;

  return (
    <header
      className="fixed top-0 right-0 h-14 flex items-center justify-between px-5 z-30"
      style={{
        left: 240,
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #f1f5f9",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      <h2 className="text-sm font-semibold" style={{ color: "#0f172a" }}>{title}</h2>

      <div className="flex items-center gap-3">
        {/* Badge licença */}
        {licenca?.ativa && diasRestantes !== null && (
          <div
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold"
            style={{
              backgroundColor: alertaExpiracao ? "#fef2f2" : expirando ? "#fef3c7" : "#f0fdf4",
              color: alertaExpiracao ? "#dc2626" : expirando ? "#92400e" : "#166534",
              border: `1px solid ${alertaExpiracao ? "#fecaca" : expirando ? "#fde68a" : "#bbf7d0"}`,
            }}
          >
            {alertaExpiracao
              ? <AlertTriangle style={{ width: 11, height: 11 }} />
              : <Clock style={{ width: 11, height: 11 }} />
            }
            {alertaExpiracao
              ? `Licença expira em ${diasRestantes}d!`
              : `Licença ativa · ${diasRestantes} dias`
            }
          </div>
        )}

        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2" style={{ width: 13, height: 13, color: "#94a3b8" }} />
          <input
            type="text"
            placeholder="Buscar paciente..."
            className="pl-8 pr-4 py-1.5 text-xs rounded-lg outline-none"
            style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", color: "#334155", width: 185 }}
            onFocus={(e) => { e.target.style.borderColor = "#0ea5e9"; }}
            onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; }}
          />
        </div>

        {/* Bell */}
        <button
          className="relative w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#f1f5f9"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#f8fafc"; }}
        >
          <Bell style={{ width: 14, height: 14, color: "#64748b" }} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#ef4444" }} />
        </button>
      </div>
    </header>
  );
}
