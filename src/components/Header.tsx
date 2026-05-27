"use client";

import { Bell, Search, ShieldCheck, Clock, AlertTriangle, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
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
  const [showNotificacoes, setShowNotificacoes] = useState(false);
  const notificacoesRef = useRef<HTMLDivElement>(null);
  const [notificacoes, setNotificacoes] = useState([
    { id: 1, type: "agendamento", title: "Novo agendamento", message: "João Silva agendou para 14:00", time: "Há 5 minutos", read: false },
    { id: 2, type: "pagamento", title: "Pagamento recebido", message: "R$ 150,00 de Maria Santos", time: "Há 1 hora", read: false },
    { id: 3, type: "sistema", title: "Licença expirando", message: "Sua licença vence em 7 dias", time: "Há 2 horas", read: true },
  ]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificacoesRef.current && !notificacoesRef.current.contains(event.target as Node)) {
        setShowNotificacoes(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
        <div ref={notificacoesRef} className="relative">
          <button
            onClick={() => setShowNotificacoes(!showNotificacoes)}
            className="relative w-8 h-8 rounded-lg flex items-center justify-center transition-all"
            style={{
              backgroundColor: showNotificacoes ? "#f1f5f9" : "#f8fafc",
              border: "1px solid #e2e8f0"
            }}
            onMouseEnter={(e) => { if (!showNotificacoes) e.currentTarget.style.backgroundColor = "#f1f5f9"; }}
            onMouseLeave={(e) => { if (!showNotificacoes) e.currentTarget.style.backgroundColor = "#f8fafc"; }}
          >
            <Bell style={{ width: 14, height: 14, color: "#64748b" }} />
            {notificacoes.some(n => !n.read) && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#ef4444" }} />
            )}
          </button>

          {/* Dropdown de notificações */}
          {showNotificacoes && (
            <div
              className="absolute right-0 mt-2 w-80 rounded-lg shadow-lg z-50 overflow-hidden"
              style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}
            >
              <div className="p-4 border-b" style={{ borderColor: "#e2e8f0" }}>
                <h3 className="font-semibold text-sm" style={{ color: "#0f172a" }}>
                  Notificações ({notificacoes.filter(n => !n.read).length})
                </h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notificacoes.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-sm" style={{ color: "#64748b" }}>Nenhuma notificação</p>
                  </div>
                ) : (
                  notificacoes.map((notif) => (
                    <div
                      key={notif.id}
                      className="px-4 py-3 border-b hover:bg-slate-50 transition-colors cursor-pointer"
                      style={{
                        borderColor: "#e2e8f0",
                        backgroundColor: notif.read ? "transparent" : "#f0f9ff",
                      }}
                    >
                      <div className="flex gap-3">
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0 mt-1"
                          style={{
                            backgroundColor:
                              notif.type === "agendamento"
                                ? "#0ea5e9"
                                : notif.type === "pagamento"
                                  ? "#10b981"
                                  : "#f59e0b",
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm" style={{ color: "#0f172a" }}>
                            {notif.title}
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>
                            {notif.message}
                          </p>
                          <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>
                            {notif.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-3 border-t text-center" style={{ borderColor: "#e2e8f0" }}>
                <Link
                  href="/configuracoes"
                  className="text-xs font-medium"
                  style={{ color: "#0ea5e9" }}
                >
                  Configurar notificações →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
