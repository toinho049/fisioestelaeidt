import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const prontuario = await prisma.prontuario.update({
    where: { id },
    data: {
      tipo: body.tipo,
      queixa: body.queixa || null,
      anamnese: body.anamnese || null,
      exame: body.exame || null,
      diagnostico: body.diagnostico || null,
      conduta: body.conduta || null,
      evolucao: body.evolucao || null,
    },
  });
  return NextResponse.json(prontuario);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.prontuario.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
