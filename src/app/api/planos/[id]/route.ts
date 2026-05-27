import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const plano = await prisma.planoTratamento.update({
    where: { id },
    data: {
      titulo: body.titulo,
      objetivoCurto: body.objetivoCurto,
      objetivoLongo: body.objetivoLongo,
      sessoesTotais: body.sessoesTotais !== undefined ? Number(body.sessoesTotais) : undefined,
      sessoesRealizadas: body.sessoesRealizadas !== undefined ? Number(body.sessoesRealizadas) : undefined,
      tecnicas: body.tecnicas,
      recursos: body.recursos,
      status: body.status,
      dataFim: body.dataFim ? new Date(body.dataFim) : undefined,
      observacoes: body.observacoes,
    },
  });
  return NextResponse.json(plano);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.planoTratamento.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
