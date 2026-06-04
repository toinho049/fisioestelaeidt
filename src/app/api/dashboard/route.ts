import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireClinicaId } from "@/lib/session";

function monthRange(date: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

function buildLastMonths(count: number) {
  const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const months: { label: string; start: Date; end: Date }[] = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const { start, end } = monthRange(date);
    months.push({ label: `${monthNames[date.getMonth()]}`, start, end });
  }
  return months;
}

export async function GET() {
  const result = await requireClinicaId();
  if (result instanceof NextResponse) return result;
  const { clinicaId } = result;

  const hoje = new Date();
  const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  const fimHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 1);
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0, 23, 59, 59, 999);

  const meses = buildLastMonths(6);

  const [
    totalPacientes,
    pacientesAtivos,
    agendamentosHoje,
    agendamentosMes,
    receitaMes,
    receitaPendente,
    fisioterapeutasAtivos,
    pagamentosMes,
  ] = await Promise.all([
    prisma.paciente.count({ where: { clinicaId } }),
    prisma.paciente.count({ where: { clinicaId, ativo: true } }),
    prisma.agendamento.count({ where: { clinicaId, data: { gte: inicioHoje, lt: fimHoje } } }),
    prisma.agendamento.count({ where: { clinicaId, data: { gte: inicioMes, lte: fimMes } } }),
    prisma.pagamento.aggregate({ _sum: { valor: true }, where: { clinicaId, status: "pago", dataPagamento: { gte: inicioMes, lte: fimMes } } }),
    prisma.pagamento.aggregate({ _sum: { valor: true }, where: { clinicaId, status: "pendente" } }),
    prisma.fisioterapeuta.count({ where: { clinicaId, ativo: true } }),
    prisma.pagamento.findMany({ where: { clinicaId, dataVencimento: { gte: inicioMes, lte: fimMes } }, select: { status: true } }),
  ]);

  const atendimentosPorMes = await Promise.all(meses.map(async (month) => ({
    label: month.label,
    value: await prisma.agendamento.count({ where: { clinicaId, data: { gte: month.start, lte: month.end } } }),
  })));

  const receitaPorMes = await Promise.all(meses.map(async (month) => {
    const total = await prisma.pagamento.aggregate({
      _sum: { valor: true },
      where: { clinicaId, status: "pago", dataPagamento: { gte: month.start, lte: month.end } },
    });
    return { label: month.label, value: total._sum.valor ?? 0 };
  }));

  const totalPagamentosMes = pagamentosMes.length;
  const pendentesMes = pagamentosMes.filter((p) => p.status === "pendente").length;
  const taxaInadimplencia = totalPagamentosMes === 0 ? 0 : Math.round((pendentesMes / totalPagamentosMes) * 100);

  const inicio90dias = new Date(hoje.getTime() - 90 * 24 * 60 * 60 * 1000);
  const agendamentos90dias = await prisma.agendamento.groupBy({
    by: ["pacienteId"],
    where: { clinicaId, data: { gte: inicio90dias, lte: fimHoje } },
    _count: { pacienteId: true },
  });
  const pacientesComRetorno = agendamentos90dias.filter((item) => item._count.pacienteId >= 2).length;
  const pacientesComAtendimento = agendamentos90dias.length;
  const taxaRetorno = pacientesComAtendimento === 0 ? 0 : Math.round((pacientesComRetorno / pacientesComAtendimento) * 100);

  const capacidadeMensal = fisioterapeutasAtivos * 80;
  const taxaOcupacao = capacidadeMensal === 0 ? 0 : Math.min(100, Math.round((agendamentosMes / capacidadeMensal) * 100));

  return NextResponse.json({
    totalPacientes,
    pacientesAtivos,
    agendamentosHoje,
    agendamentosMes,
    receitaMes: receitaMes._sum.valor ?? 0,
    receitaPendente: receitaPendente._sum.valor ?? 0,
    atendimentosPorMes,
    receitaPorMes,
    taxaOcupacao,
    taxaRetorno,
    taxaInadimplencia,
  });
}
