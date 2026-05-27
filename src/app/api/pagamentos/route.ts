import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireClinicaId } from "@/lib/session";

export async function GET(req: NextRequest) {
  const result = await requireClinicaId();
  if (result instanceof NextResponse) return result;
  const { clinicaId } = result;

  const { searchParams } = new URL(req.url);
  const pacienteId = searchParams.get("pacienteId");
  const status = searchParams.get("status");
  const mes = searchParams.get("mes");
  const ano = searchParams.get("ano");

  let dataFiltro = {};
  if (mes && ano) {
    const inicio = new Date(Number(ano), Number(mes) - 1, 1);
    const fim = new Date(Number(ano), Number(mes), 0, 23, 59, 59);
    dataFiltro = { criadoEm: { gte: inicio, lte: fim } };
  }

  const pagamentos = await prisma.pagamento.findMany({
    where: { clinicaId, ...(pacienteId && { pacienteId }), ...(status && { status }), ...dataFiltro },
    orderBy: { criadoEm: "desc" },
    include: {
      paciente: { select: { nome: true } },
      agendamento: { select: { data: true, tipo: true } },
    },
  });

  const totais = await prisma.pagamento.groupBy({
    by: ["status"],
    _sum: { valor: true },
    where: { clinicaId, ...dataFiltro },
  });

  return NextResponse.json({ pagamentos, totais });
}

export async function POST(req: NextRequest) {
  const result = await requireClinicaId();
  if (result instanceof NextResponse) return result;
  const { clinicaId } = result;

  const body = await req.json();
  const pagamento = await prisma.pagamento.create({
    data: {
      clinicaId,
      pacienteId: body.pacienteId,
      agendamentoId: body.agendamentoId || null,
      valor: Number(body.valor),
      desconto: Number(body.desconto ?? 0),
      formaPagamento: body.formaPagamento ?? "dinheiro",
      status: body.status ?? "pendente",
      dataVencimento: body.dataVencimento ? new Date(body.dataVencimento) : null,
      dataPagamento: body.dataPagamento ? new Date(body.dataPagamento) : null,
      descricao: body.descricao || null,
    },
    include: { paciente: { select: { nome: true } } },
  });
  return NextResponse.json(pagamento, { status: 201 });
}
