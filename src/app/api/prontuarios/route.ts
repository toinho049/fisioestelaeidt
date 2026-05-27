import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireClinicaId } from "@/lib/session";

export async function GET(req: NextRequest) {
  const result = await requireClinicaId();
  if (result instanceof NextResponse) return result;
  const { clinicaId } = result;

  const { searchParams } = new URL(req.url);
  const pacienteId = searchParams.get("pacienteId");

  const prontuarios = await prisma.prontuario.findMany({
    where: { clinicaId, ...(pacienteId && { pacienteId }) },
    orderBy: { data: "desc" },
    include: { paciente: { select: { nome: true } } },
  });
  return NextResponse.json(prontuarios);
}

export async function POST(req: NextRequest) {
  const result = await requireClinicaId();
  if (result instanceof NextResponse) return result;
  const { clinicaId } = result;

  const body = await req.json();
  const prontuario = await prisma.prontuario.create({
    data: {
      clinicaId,
      pacienteId: body.pacienteId,
      data: body.data ? new Date(body.data) : new Date(),
      tipo: body.tipo ?? "evolucao",
      queixa: body.queixa || null,
      anamnese: body.anamnese || null,
      exame: body.exame || null,
      diagnostico: body.diagnostico || null,
      conduta: body.conduta || null,
      evolucao: body.evolucao || null,
    },
    include: { paciente: { select: { nome: true } } },
  });
  return NextResponse.json(prontuario, { status: 201 });
}
