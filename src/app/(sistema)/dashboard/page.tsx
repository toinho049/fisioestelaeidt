"use client";

import { useEffect, useState } from "react";
import { Users, CalendarDays, DollarSign, TrendingUp, Clock, CheckCircle2, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DashboardData {
  totalPacientes: number;
  pacientesAtivos: number;
  agendamentosHoje: number;
  agendamentosMes: number;
  receitaMes: number;
  receitaPendente: number;
  ultimosAgendamentos: Array<{
    id: string;
    data: string;
    status: string;
    tipo: string;
    paciente: { nome: string };
  }>;
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  agendado: { label: "Agendado", color: "#0ea5e9", bg: "#e0f2fe" },
  confirmado: { label: "Confirmado", color: "#10b981", bg: "#d1fae5" },
  realizado: { label: "Realizado", color: "#6366f1", bg: "#e0e7ff" },
  cancelado: { label: "Cancelado", color: "#ef4444", bg: "#fee2e2" },
  faltou: { label: "Faltou", color: "#f59e0b", bg: "#fef3c7" },
};

function StatCard({
  title, value, subtitle, icon: Icon, color, href,
}: {
  title: string; value: string | number; subtitle: string;
  icon: React.ElementType; color: string; href?: string;
}) {
  const inner = (
    <div
      className="rounded-xl p-5 flex items-start gap-4 transition-all duration-200"
      style={{ backgroundColor: "#fff", border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
    >
      <div className="rounded-xl p-2.5 flex-shrink-0" style={{ backgroundColor: `${color}18` }}>
        <Icon style={{ width: 22, height: 22, color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium" style={{ color: "#64748b" }}>{title}</p>
        <p className="text-2xl font-bold mt-0.5" style={{ color: "#0f172a" }}>{value}</p>
        <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>{subtitle}</p>
      </div>
      {href && <ArrowUpRight style={{ width: 16, height: 16, color: "#cbd5e1", flexShrink: 0 }} />}
    </div>
  );
  return href ? <Link href={href} className="block hover:scale-[1.01] transition-transform">{inner}</Link> : inner;
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const hoje = format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div
          className="w-8 h-8 rounded-full border-2 animate-spin"
          style={{ borderColor: "#e2e8f0", borderTopColor: "#0ea5e9" }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-xl font-bold" style={{ color: "#0f172a" }}>Bom dia!</h1>
        <p className="text-sm capitalize mt-0.5" style={{ color: "#94a3b8" }}>{hoje}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total de Pacientes" value={data?.totalPacientes ?? 0} subtitle={`${data?.pacientesAtivos ?? 0} ativos`} icon={Users} color="#0ea5e9" href="/pacientes" />
        <StatCard title="Consultas Hoje" value={data?.agendamentosHoje ?? 0} subtitle={`${data?.agendamentosMes ?? 0} este mês`} icon={CalendarDays} color="#6366f1" href="/agenda" />
        <StatCard title="Receita do Mês" value={`R$ ${(data?.receitaMes ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} subtitle="Pagamentos recebidos" icon={DollarSign} color="#10b981" href="/financeiro" />
        <StatCard title="A Receber" value={`R$ ${(data?.receitaPendente ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} subtitle="Pagamentos pendentes" icon={TrendingUp} color="#f59e0b" href="/financeiro" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-xl p-5" style={{ backgroundColor: "#fff", border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm" style={{ color: "#0f172a" }}>Próximos Agendamentos</h3>
            <Link href="/agenda" className="text-xs font-medium" style={{ color: "#0ea5e9" }}>Ver agenda →</Link>
          </div>
          {data?.ultimosAgendamentos?.length ? (
            <div className="space-y-2">
              {data.ultimosAgendamentos.map((ag) => {
                const cfg = statusConfig[ag.status] ?? statusConfig.agendado;
                return (
                  <div key={ag.id} className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: "#f8fafc" }}>
                    <Clock style={{ width: 15, height: 15, color: "#94a3b8", flexShrink: 0 }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: "#0f172a" }}>{ag.paciente.nome}</p>
                      <p className="text-xs" style={{ color: "#94a3b8" }}>{format(new Date(ag.data), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
                    </div>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0" style={{ color: cfg.color, backgroundColor: cfg.bg }}>{cfg.label}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10" style={{ color: "#94a3b8" }}>
              <CalendarDays style={{ width: 36, height: 36, marginBottom: 10, opacity: 0.4 }} />
              <p className="text-sm">Nenhum agendamento encontrado</p>
              <Link href="/agenda" className="text-xs mt-2 font-medium" style={{ color: "#0ea5e9" }}>Criar agendamento</Link>
            </div>
          )}
        </div>

        <div className="rounded-xl p-5" style={{ backgroundColor: "#fff", border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <h3 className="font-semibold text-sm mb-4" style={{ color: "#0f172a" }}>Acesso Rápido</h3>
          <div className="space-y-1.5">
            {[
              { href: "/agenda", label: "Nova Consulta", icon: CalendarDays, color: "#0ea5e9" },
              { href: "/pacientes/novo", label: "Novo Paciente", icon: Users, color: "#6366f1" },
              { href: "/atendimentos", label: "Registrar Atendimento", icon: CheckCircle2, color: "#10b981" },
              { href: "/financeiro", label: "Lançar Pagamento", icon: DollarSign, color: "#f59e0b" },
            ].map(({ href, label, icon: Icon, color }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-colors"
                style={{ color: "#334155" }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#f8fafc"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
              >
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}18` }}>
                  <Icon style={{ width: 14, height: 14, color }} />
                </div>
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
