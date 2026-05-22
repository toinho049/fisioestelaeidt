"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Key, CheckCircle, Clock, AlertCircle, ArrowRight, RefreshCw } from "lucide-react";

interface Stats {
  totalSolicita: number;
  pendentes: number;
  licencasAtivas: number;
  licencasExpiradas: number;
}

interface Solicitacao {
  id: string;
  nomeClinica: string;
  email: string;
  nomeTitular: string;
  planoNome: string;
  diasPlano: number;
  criadoEm: string;
  licenca: { token: string } | null;
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [pendentes, setPendentes] = useState<Solicitacao[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const [solRes, licRes] = await Promise.all([
      fetch("/api/saas/solicitacoes"),
      fetch("/api/saas/licencas"),
    ]);
    const solic: Solicitacao[] = await solRes.json();
    const licencas: Array<{ status: string }> = await licRes.json();

    setStats({
      totalSolicita: solic.length,
      pendentes: solic.filter(s => s.status === "pendente").length,
      licencasAtivas: licencas.filter(l => l.status === "ativa").length,
      licencasExpiradas: licencas.filter(l => l.status === "expirada").length,
    });
    setPendentes(solic.filter(s => s.status === "pendente").slice(0, 5));
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: "#e2e8f0", borderTopColor: "#0ea5e9" }} />
    </div>
  );

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black" style={{ color: "#0f172a" }}>Painel Admin</h1>
          <p className="text-sm mt-0.5" style={{ color: "#64748b" }}>Gerencie licenças e solicitações DomFisio</p>
        </div>
        <button onClick={load} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all" style={{ border: "1px solid #e2e8f0", color: "#64748b", backgroundColor: "#fff" }}>
          <RefreshCw style={{ width: 13, height: 13 }} /> Atualizar
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Solicitações", value: stats?.totalSolicita ?? 0, icon: FileText, color: "#0ea5e9", bg: "#e0f2fe" },
          { label: "Aguardando Aprovação", value: stats?.pendentes ?? 0, icon: Clock, color: "#f59e0b", bg: "#fef3c7" },
          { label: "Licenças Ativas", value: stats?.licencasAtivas ?? 0, icon: CheckCircle, color: "#10b981", bg: "#d1fae5" },
          { label: "Licenças Expiradas", value: stats?.licencasExpiradas ?? 0, icon: AlertCircle, color: "#ef4444", bg: "#fee2e2" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="rounded-xl p-5" style={{ backgroundColor: "#fff", border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: bg }}>
              <Icon style={{ width: 20, height: 20, color }} />
            </div>
            <p className="text-2xl font-black" style={{ color: "#0f172a" }}>{value}</p>
            <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-4">
        <Link
          href="/admin/solicitacoes"
          className="rounded-xl p-5 flex items-center justify-between transition-all group"
          style={{ backgroundColor: "#fff", border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#0ea5e9"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(14,165,233,0.15)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#f1f5f9"; e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)"; }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#fef3c7" }}>
              <FileText style={{ width: 20, height: 20, color: "#f59e0b" }} />
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: "#0f172a" }}>Solicitações</p>
              <p className="text-xs" style={{ color: "#94a3b8" }}>Aprovar e gerar tokens</p>
            </div>
          </div>
          <ArrowRight style={{ width: 16, height: 16, color: "#cbd5e1" }} />
        </Link>

        <Link
          href="/admin/licencas"
          className="rounded-xl p-5 flex items-center justify-between transition-all"
          style={{ backgroundColor: "#fff", border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#10b981"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(16,185,129,0.15)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#f1f5f9"; e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)"; }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#d1fae5" }}>
              <Key style={{ width: 20, height: 20, color: "#10b981" }} />
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: "#0f172a" }}>Licenças</p>
              <p className="text-xs" style={{ color: "#94a3b8" }}>Tokens gerados e status</p>
            </div>
          </div>
          <ArrowRight style={{ width: 16, height: 16, color: "#cbd5e1" }} />
        </Link>
      </div>

      {/* Pendentes recentes */}
      {pendentes.length > 0 && (
        <div className="rounded-xl overflow-hidden" style={{ backgroundColor: "#fff", border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid #f1f5f9" }}>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: "#f59e0b" }} />
              <h2 className="font-semibold text-sm" style={{ color: "#0f172a" }}>Pendentes de Aprovação</h2>
            </div>
            <Link href="/admin/solicitacoes" className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white" style={{ backgroundColor: "#0ea5e9" }}>
              Ver todas
            </Link>
          </div>
          <div>
            {pendentes.map((s, i) => (
              <div key={s.id} className="flex items-center gap-4 px-5 py-4" style={{ borderBottom: i < pendentes.length - 1 ? "1px solid #f8fafc" : "none" }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ background: "linear-gradient(135deg, #0ea5e9, #10b981)" }}>
                  {s.nomeClinica.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: "#0f172a" }}>{s.nomeClinica}</p>
                  <p className="text-xs" style={{ color: "#94a3b8" }}>{s.email} · {s.planoNome} ({s.diasPlano} dias)</p>
                </div>
                <Link href="/admin/solicitacoes" className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors" style={{ backgroundColor: "#f0fdf4", color: "#10b981", border: "1px solid #bbf7d0" }}>
                  Aprovar →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {stats?.pendentes === 0 && (
        <div className="rounded-xl p-10 text-center" style={{ backgroundColor: "#fff", border: "1px solid #f1f5f9" }}>
          <CheckCircle style={{ width: 36, height: 36, color: "#10b981", margin: "0 auto 10px" }} />
          <p className="font-semibold text-sm" style={{ color: "#0f172a" }}>Tudo em dia!</p>
          <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>Nenhuma solicitação pendente.</p>
        </div>
      )}
    </div>
  );
}
