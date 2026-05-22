"use client";

import { useEffect, useState } from "react";
import { Key, Copy, Check, Clock, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Licenca {
  id: string;
  token: string;
  nomeClinica: string;
  email: string;
  planoNome: string;
  diasValidade: number;
  status: string;
  dataInicio: string | null;
  dataExpiracao: string | null;
  ativadaEm: string | null;
  criadoEm: string;
  solicitacao: { nomeTitular: string; telefone: string | null } | null;
}

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  pendente:  { label: "Aguardando ativação", color: "#92400e", bg: "#fef3c7", icon: Clock },
  ativa:     { label: "Ativa", color: "#065f46", bg: "#d1fae5", icon: CheckCircle },
  expirada:  { label: "Expirada", color: "#92400e", bg: "#fee2e2", icon: AlertCircle },
  cancelada: { label: "Cancelada", color: "#64748b", bg: "#f1f5f9", icon: XCircle },
};

function CopyToken({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);
  function copiar() {
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button onClick={copiar} className="flex items-center gap-2 text-xs font-mono font-bold px-3 py-1.5 rounded-lg transition-all" style={{ backgroundColor: "#0f172a", color: "#38bdf8" }}>
      {token}
      <span style={{ color: copied ? "#10b981" : "#38bdf8" }}>
        {copied ? <Check style={{ width: 12, height: 12 }} /> : <Copy style={{ width: 12, height: 12 }} />}
      </span>
    </button>
  );
}

export default function LicencasPage() {
  const [licencas, setLicencas] = useState<Licenca[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    fetch("/api/saas/licencas").then(r => r.json()).then(d => { setLicencas(d); setLoading(false); });
  }, []);

  const filtered = licencas.filter(l => filtro ? l.status === filtro : true);

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold" style={{ color: "#0f172a" }}>Licenças</h1>
          <p className="text-sm mt-0.5" style={{ color: "#94a3b8" }}>{licencas.length} licença{licencas.length !== 1 ? "s" : ""} gerada{licencas.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex gap-2">
          {[["", "Todas"], ["pendente", "Aguardando"], ["ativa", "Ativas"], ["expirada", "Expiradas"]].map(([v, l]) => (
            <button
              key={v}
              onClick={() => setFiltro(v)}
              className="text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
              style={{ backgroundColor: filtro === v ? "#0f172a" : "#fff", color: filtro === v ? "#fff" : "#64748b", border: `1px solid ${filtro === v ? "#0f172a" : "#e2e8f0"}` }}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: "#e2e8f0", borderTopColor: "#0ea5e9" }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl p-12 text-center" style={{ backgroundColor: "#fff", border: "1px solid #f1f5f9" }}>
          <Key style={{ width: 36, height: 36, color: "#cbd5e1", margin: "0 auto 10px" }} />
          <p className="text-sm" style={{ color: "#64748b" }}>Nenhuma licença encontrada</p>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ backgroundColor: "#fff", border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
                {["Clínica", "Token", "Plano", "Validade", "Status"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold" style={{ color: "#64748b" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((l, i) => {
                const cfg = STATUS_CFG[l.status] ?? STATUS_CFG.pendente;
                const StatusIcon = cfg.icon;
                const diasRestantes = l.dataExpiracao
                  ? Math.max(0, Math.ceil((new Date(l.dataExpiracao).getTime() - Date.now()) / 86400000))
                  : null;
                return (
                  <tr key={l.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid #f8fafc" : "none" }}>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-xs" style={{ color: "#0f172a" }}>{l.nomeClinica}</p>
                      <p className="text-xs" style={{ color: "#94a3b8" }}>{l.email}</p>
                      {l.solicitacao && <p className="text-xs" style={{ color: "#94a3b8" }}>{l.solicitacao.nomeTitular}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <CopyToken token={l.token} />
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs font-medium" style={{ color: "#334155" }}>{l.planoNome}</p>
                      <p className="text-xs" style={{ color: "#94a3b8" }}>{l.diasValidade} dias</p>
                    </td>
                    <td className="px-4 py-3">
                      {l.dataExpiracao ? (
                        <>
                          <p className="text-xs font-medium" style={{ color: "#334155" }}>
                            {format(new Date(l.dataExpiracao), "dd/MM/yyyy")}
                          </p>
                          {l.status === "ativa" && diasRestantes !== null && (
                            <p className="text-xs" style={{ color: diasRestantes <= 7 ? "#ef4444" : "#94a3b8" }}>
                              {diasRestantes}d restantes
                            </p>
                          )}
                        </>
                      ) : (
                        <span className="text-xs" style={{ color: "#94a3b8" }}>Não ativada</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full w-fit" style={{ backgroundColor: cfg.bg, color: cfg.color }}>
                        <StatusIcon style={{ width: 11, height: 11 }} />
                        {cfg.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
