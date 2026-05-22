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

  const planos = await prisma.planoTratamento.findMany({
    where: { clinicaId, ...(pacienteId && { pacienteId }), ...(status && { status }) },
    orderBy: { criadoEm: "desc" },
    include: { paciente: { select: { nome: true } } },
  });
  return NextResponse.json(planos);
}

export async function POST(req: NextRequest) {
  const result = await requireClinicaId();
  if (result instanceof NextResponse) return result;
  const { clinicaId } = result;

  const body = await req.json();
  const plano = await prisma.planoTratamento.create({
    data: {
      clinicaId,
      pacienteId: body.pacienteId,
      titulo: body.titulo,
      objetivoCurto: body.objetivoCurto || null,
      objetivoLongo: body.objetivoLongo || null,
      sessoesTotais: Number(body.sessoesTotais ?? 10),
      sessoesRealizadas: Number(body.sessoesRealizadas ?? 0),
      tecnicas: body.tecnicas || null,
      recursos: body.recursos || null,
      status: body.status ?? "ativo",
      dataInicio: body.dataInicio ? new Date(body.dataInicio) : new Date(),
      dataFim: body.dataFim ? new Date(body.dataFim) : null,
      observacoes: body.observacoes || null,
    },
    include: { paciente: { select: { nome: true } } },
  });
  return NextResponse.json(plano, { status: 201 });
}
