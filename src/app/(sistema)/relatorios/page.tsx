"use client";

import { useEffect, useState } from "react";
import { BarChart3, TrendingUp, Users, CalendarDays, DollarSign, Activity } from "lucide-react";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DashData {
  totalPacientes: number;
  pacientesAtivos: number;
  agendamentosHoje: number;
  agendamentosMes: number;
  receitaMes: number;
  receitaPendente: number;
  atendimentosPorMes: { label: string; value: number }[];
  receitaPorMes: { label: string; value: number }[];
  taxaOcupacao: number;
  taxaRetorno: number;
  taxaInadimplencia: number;
}

function StatCard({ title, value, subtitle, icon: Icon, color }: {
  title: string; value: string | number; subtitle: string; icon: React.ElementType; color: string;
}) {
  return (
    <div className="rounded-xl p-5 flex items-start gap-4" style={{ backgroundColor: "#fff", border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      <div className="rounded-xl p-2.5 flex-shrink-0" style={{ backgroundColor: `${color}18` }}>
        <Icon style={{ width: 20, height: 20, color }} />
      </div>
      <div>
        <p className="text-sm" style={{ color: "#64748b" }}>{title}</p>
        <p className="text-2xl font-bold mt-0.5" style={{ color: "#0f172a" }}>{value}</p>
        <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>{subtitle}</p>
      </div>
    </div>
  );
}

// Mini bar chart component
function BarChart({ data, color }: { data: { label: string; value: number }[]; color: string }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-2 h-28">
      {data.map(({ label, value }) => (
        <div key={label} className="flex-1 flex flex-col items-center gap-1">
          <span className="text-xs font-medium" style={{ color: "#0f172a" }}>{value}</span>
          <div className="w-full rounded-t-md transition-all" style={{ height: `${Math.max(4, (value / max) * 96)}px`, backgroundColor: color, opacity: value === 0 ? 0.2 : 1 }} />
          <span className="text-xs" style={{ color: "#94a3b8" }}>{label}</span>
        </div>
      ))}
    </div>
  );
}

export default function RelatoriosPage() {
  const [data, setData] = useState<DashData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const ultimos6Meses = data?.atendimentosPorMes ?? [];
  const receitaMeses = data?.receitaPorMes ?? [];

  const mesAtual = format(new Date(), "MMMM 'de' yyyy", { locale: ptBR });

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: "#e2e8f0", borderTopColor: "#0ea5e9" }} />
    </div>
  );

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-lg font-bold capitalize" style={{ color: "#0f172a" }}>Relatórios</h1>
        <p className="text-sm mt-0.5 capitalize" style={{ color: "#94a3b8" }}>{mesAtual}</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Pacientes Ativos" value={data?.pacientesAtivos ?? 0} subtitle={`${data?.totalPacientes ?? 0} total cadastrado`} icon={Users} color="#0ea5e9" />
        <StatCard title="Atendimentos no Mês" value={data?.agendamentosMes ?? 0} subtitle={`${data?.agendamentosHoje ?? 0} hoje`} icon={CalendarDays} color="#8b5cf6" />
        <StatCard title="Receita do Mês" value={`R$ ${(data?.receitaMes ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} subtitle="Pagamentos confirmados" icon={DollarSign} color="#10b981" />
        <StatCard title="A Receber" value={`R$ ${(data?.receitaPendente ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} subtitle="Em aberto" icon={TrendingUp} color="#f59e0b" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Atendimentos por mês */}
        <div className="rounded-xl p-5" style={{ backgroundColor: "#fff", border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#ede9fe" }}>
              <BarChart3 style={{ width: 15, height: 15, color: "#8b5cf6" }} />
            </div>
            <div>
              <h3 className="text-sm font-semibold" style={{ color: "#0f172a" }}>Atendimentos por Mês</h3>
              <p className="text-xs" style={{ color: "#94a3b8" }}>Últimos 6 meses</p>
            </div>
          </div>
          <BarChart data={ultimos6Meses} color="#8b5cf6" />
        </div>

        {/* Receita por mês */}
        <div className="rounded-xl p-5" style={{ backgroundColor: "#fff", border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#d1fae5" }}>
              <DollarSign style={{ width: 15, height: 15, color: "#10b981" }} />
            </div>
            <div>
              <h3 className="text-sm font-semibold" style={{ color: "#0f172a" }}>Receita por Mês</h3>
              <p className="text-xs" style={{ color: "#94a3b8" }}>Últimos 6 meses (R$)</p>
            </div>
          </div>
          <BarChart data={receitaMeses} color="#10b981" />
        </div>
      </div>

      {/* Indicadores de desempenho */}
      <div className="rounded-xl p-5" style={{ backgroundColor: "#fff", border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        <div className="flex items-center gap-2 mb-5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#e0f2fe" }}>
            <Activity style={{ width: 15, height: 15, color: "#0ea5e9" }} />
          </div>
          <h3 className="text-sm font-semibold" style={{ color: "#0f172a" }}>Indicadores de Desempenho</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Taxa de Ocupação", value: data?.taxaOcupacao ?? 0, color: "#0ea5e9", desc: "Agenda preenchida este mês" },
            { label: "Taxa de Retorno", value: data?.taxaRetorno ?? 0, color: "#10b981", desc: "Pacientes que retornaram" },
            { label: "Taxa de Inadimplência", value: data?.taxaInadimplencia ?? 0, color: "#f59e0b", desc: "Pagamentos em atraso" },
          ].map(({ label, value, color, desc }) => (
            <div key={label} className="p-4 rounded-xl" style={{ backgroundColor: "#f8fafc" }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium" style={{ color: "#334155" }}>{label}</p>
                <span className="text-lg font-black" style={{ color }}>{value}%</span>
              </div>
              <div className="h-2 rounded-full" style={{ backgroundColor: "#e2e8f0" }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${value}%`, backgroundColor: color }} />
              </div>
              <p className="text-xs mt-2" style={{ color: "#94a3b8" }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
