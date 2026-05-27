import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const pagamento = await prisma.pagamento.update({
    where: { id },
    data: {
      valor: body.valor !== undefined ? Number(body.valor) : undefined,
      desconto: body.desconto !== undefined ? Number(body.desconto) : undefined,
      formaPagamento: body.formaPagamento,
      status: body.status,
      dataVencimento: body.dataVencimento ? new Date(body.dataVencimento) : undefined,
      dataPagamento: body.dataPagamento ? new Date(body.dataPagamento) : undefined,
      descricao: body.descricao,
    },
  });
  return NextResponse.json(pagamento);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.pagamento.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
