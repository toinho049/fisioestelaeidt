import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const pacienteId = searchParams.get("pacienteId");

  const prescricoes = await prisma.prescricaoExercicio.findMany({
    where: { ...(pacienteId && { pacienteId }), ativo: true },
    include: {
      exercicio: true,
      paciente: { select: { nome: true } },
    },
    orderBy: { criadoEm: "desc" },
  });
  return NextResponse.json(prescricoes);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const prescricao = await prisma.prescricaoExercicio.create({
    data: {
      clinicaId: body.clinicaId,
      pacienteId: body.pacienteId,
      exercicioId: body.exercicioId,
      series: body.series ? Number(body.series) : null,
      repeticoes: body.repeticoes || null,
      tempo: body.tempo || null,
      frequencia: body.frequencia || null,
      observacoes: body.observacoes || null,
    },
    include: { exercicio: true, paciente: { select: { nome: true } } },
  });
  return NextResponse.json(prescricao, { status: 201 });
}
