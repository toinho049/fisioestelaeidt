import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const agendamento = await prisma.agendamento.update({
    where: { id },
    data: {
      pacienteId: body.pacienteId,
      fisioterapeutaId: body.fisioterapeutaId || null,
      data: body.data ? new Date(body.data) : undefined,
      duracao: body.duracao,
      status: body.status,
      tipo: body.tipo,
      observacoes: body.observacoes || null,
      sala: body.sala || null,
    },
    include: {
      paciente: { select: { id: true, nome: true } },
    },
  });
  return NextResponse.json(agendamento);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.agendamento.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
