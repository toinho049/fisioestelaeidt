import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireClinicaId } from "@/lib/session";

export async function GET() {
  const result = await requireClinicaId();
  if (result instanceof NextResponse) return result;
  const { clinicaId } = result;

  const hoje = new Date();
  const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  const fimHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 1);
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0, 23, 59, 59);

  const [totalPacientes, pacientesAtivos, agendamentosHoje, agendamentosMes, receitaMes, receitaPendente, ultimosAgendamentos] = await Promise.all([
    prisma.paciente.count({ where: { clinicaId } }),
    prisma.paciente.count({ where: { clinicaId, ativo: true } }),
    prisma.agendamento.count({ where: { clinicaId, data: { gte: inicioHoje, lt: fimHoje } } }),
    prisma.agendamento.count({ where: { clinicaId, data: { gte: inicioMes, lte: fimMes } } }),
    prisma.pagamento.aggregate({ _sum: { valor: true }, where: { clinicaId, status: "pago", dataPagamento: { gte: inicioMes, lte: fimMes } } }),
    prisma.pagamento.aggregate({ _sum: { valor: true }, where: { clinicaId, status: "pendente" } }),
    prisma.agendamento.findMany({ where: { clinicaId, data: { gte: inicioHoje } }, take: 6, orderBy: { data: "asc" }, include: { paciente: { select: { nome: true } } } }),
  ]);

  return NextResponse.json({ totalPacientes, pacientesAtivos, agendamentosHoje, agendamentosMes, receitaMes: receitaMes._sum.valor ?? 0, receitaPendente: receitaPendente._sum.valor ?? 0, ultimosAgendamentos });
}
