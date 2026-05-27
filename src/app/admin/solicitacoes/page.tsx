"use client";

import { useEffect, useState, useCallback } from "react";
import { CheckCircle, X, Clock, Copy, Check, Phone, Mail, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Solicitacao {
  id: string;
  nomeTitular: string;
  email: string;
  nomeClinica: string;
  telefone: string | null;
  planoNome: string;
  diasPlano: number;
  status: string;
  observacoes: string | null;
  criadoEm: string;
  licenca: { token: string; status: string; dataExpiracao: string | null } | null;
}

const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  pendente:  { label: "Pendente",  color: "#92400e", bg: "#fef3c7" },
  aprovado:  { label: "Aprovado",  color: "#065f46", bg: "#d1fae5" },
  rejeitado: { label: "Rejeitado", color: "#991b1b", bg: "#fee2e2" },
};

function TokenBadge({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);

  function copiar() {
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex items-center gap-2 mt-2">
      <code className="text-sm font-mono font-bold px-3 py-1.5 rounded-lg" style={{ backgroundColor: "#0f172a", color: "#38bdf8", letterSpacing: "0.08em" }}>
        {token}
      </code>
      <button
        onClick={copiar}
        className="p-1.5 rounded-lg transition-all"
        style={{ backgroundColor: copied ? "#d1fae5" : "#f1f5f9" }}
        title="Copiar token"
      >
        {copied ? <Check style={{ width: 13, height: 13, color: "#10b981" }} /> : <Copy style={{ width: 13, height: 13, color: "#64748b" }} />}
      </button>
    </div>
  );
}

export default function SolicitacoesPage() {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState("");
  const [processando, setProcessando] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/saas/solicitacoes");
    setSolicitacoes(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function aprovar(id: string) {
    setProcessando(id);
    await fetch(`/api/saas/solicitacoes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "aprovado" }),
    });
    setProcessando(null);
    load();
  }

  async function rejeitar(id: string) {
    if (!confirm("Rejeitar esta solicitação?")) return;
    setProcessando(id);
    await fetch(`/api/saas/solicitacoes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "rejeitado" }),
    });
    setProcessando(null);
    load();
  }

  const filtered = solicitacoes.filter(s => filtroStatus ? s.status === filtroStatus : true);

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold" style={{ color: "#0f172a" }}>Solicitações de Licença</h1>
          <p className="text-sm mt-0.5" style={{ color: "#94a3b8" }}>Aprove e gere tokens para os clientes</p>
        </div>
        <div className="flex gap-2">
          {[["", "Todas"], ["pendente", "Pendentes"], ["aprovado", "Aprovadas"], ["rejeitado", "Rejeitadas"]].map(([v, l]) => (
            <button
              key={v}
              onClick={() => setFiltroStatus(v)}
              className="text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
              style={{
                backgroundColor: filtroStatus === v ? "#0f172a" : "#fff",
                color: filtroStatus === v ? "#fff" : "#64748b",
                border: `1px solid ${filtroStatus === v ? "#0f172a" : "#e2e8f0"}`,
              }}
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
          <Clock style={{ width: 36, height: 36, color: "#cbd5e1", margin: "0 auto 10px" }} />
          <p className="text-sm font-medium" style={{ color: "#64748b" }}>Nenhuma solicitação {filtroStatus || "encontrada"}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((s) => {
            const cfg = STATUS_CFG[s.status] ?? STATUS_CFG.pendente;
            const isProcessando = processando === s.id;
            return (
              <div key={s.id} className="rounded-xl p-5" style={{ backgroundColor: "#fff", border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0"
                      style={{ background: "linear-gradient(135deg, #0ea5e9, #10b981)" }}
                    >
                      {s.nomeClinica.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm" style={{ color: "#0f172a" }}>{s.nomeClinica}</p>
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: cfg.bg, color: cfg.color }}>
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>
                        Titular: {s.nomeTitular} · Plano: <strong>{s.planoNome}</strong> ({s.diasPlano} dias)
                      </p>
                    </div>
                  </div>

                  {/* Ações */}
                  {s.status === "pendente" && (
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => rejeitar(s.id)}
                        disabled={isProcessando}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg font-medium disabled:opacity-50"
                        style={{ border: "1px solid #fee2e2", color: "#ef4444" }}
                      >
                        <X style={{ width: 12, height: 12 }} /> Rejeitar
                      </button>
                      <button
                        onClick={() => aprovar(s.id)}
                        disabled={isProcessando}
                        className="flex items-center gap-1 px-4 py-1.5 text-xs rounded-lg font-medium text-white disabled:opacity-50"
                        style={{ background: "linear-gradient(135deg, #0ea5e9, #10b981)", boxShadow: "0 2px 8px rgba(14,165,233,0.3)" }}
                      >
                        {isProcessando ? (
                          <><span className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Gerando...</>
                        ) : (
                          <><CheckCircle style={{ width: 12, height: 12 }} /> Aprovar + Gerar Token</>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Contato */}
                <div className="flex gap-4 mt-3 text-xs" style={{ color: "#64748b" }}>
                  <span className="flex items-center gap-1">
                    <Mail style={{ width: 11, height: 11 }} />{s.email}
                  </span>
                  {s.telefone && (
                    <span className="flex items-center gap-1">
                      <Phone style={{ width: 11, height: 11 }} />{s.telefone}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar style={{ width: 11, height: 11 }} />
                    {format(new Date(s.criadoEm), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </span>
                </div>

                {/* Token gerado */}
                {s.licenca && (
                  <div className="mt-3 pt-3" style={{ borderTop: "1px solid #f1f5f9" }}>
                    <p className="text-xs font-semibold mb-1" style={{ color: "#64748b" }}>
                      Token Gerado — passe este código ao cliente:
                    </p>
                    <TokenBadge token={s.licenca.token} />
                    {s.licenca.status === "ativa" && (
                      <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: "#10b981" }}>
                        <CheckCircle style={{ width: 11, height: 11 }} />
                        Licença ativa · Expira em {s.licenca.dataExpiracao ? format(new Date(s.licenca.dataExpiracao), "dd/MM/yyyy") : "—"}
                      </p>
                    )}
                    {s.licenca.status === "pendente" && (
                      <p className="text-xs mt-1.5" style={{ color: "#f59e0b" }}>⏳ Aguardando ativação pelo cliente</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
