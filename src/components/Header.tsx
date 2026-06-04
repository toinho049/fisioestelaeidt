"use client";

import { Bell, Search, ShieldCheck, Clock, AlertTriangle } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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
  const [notificacoesAbertas, setNotificacoesAbertas] = useState(false);
  const notificacoesRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificacoesRef.current && !notificacoesRef.current.contains(event.target as Node)) {
        setNotificacoesAbertas(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
        <div ref={notificacoesRef} className="relative">
          <button
            type="button"
            onClick={() => setNotificacoesAbertas((prev) => !prev)}
            className="relative w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#f1f5f9"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#f8fafc"; }}
          >
            <Bell style={{ width: 14, height: 14, color: "#64748b" }} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#ef4444" }} />
          </button>

          {notificacoesAbertas && (
            <div className="absolute right-0 top-full z-20 mt-2 w-80 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
              <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
                <span className="font-semibold text-slate-900">Notificações</span>
                <button
                  type="button"
                  onClick={() => setNotificacoesAbertas(false)}
                  className="text-xs font-medium text-slate-500 hover:text-slate-700"
                >
                  Fechar
                </button>
              </div>
              <div className="px-4 py-4 text-sm text-slate-600">
                <div className="rounded-3xl bg-slate-50 p-3">
                  <p className="font-medium text-slate-900">Sem novas notificações</p>
                  <p className="mt-1 text-xs text-slate-500">Verifique novamente mais tarde.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
