import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireClinicaId } from "@/lib/session";

export async function GET(req: NextRequest) {
  const result = await requireClinicaId();
  if (result instanceof NextResponse) return result;
  const { clinicaId } = result;

  const { searchParams } = new URL(req.url);
  const pacienteId = searchParams.get("pacienteId");

  const avaliacoes = await prisma.avaliacao.findMany({
    where: { clinicaId, ...(pacienteId && { pacienteId }) },
    orderBy: { data: "desc" },
    include: { paciente: { select: { nome: true } } },
  });
  return NextResponse.json(avaliacoes);
}

export async function POST(req: NextRequest) {
  const result = await requireClinicaId();
  if (result instanceof NextResponse) return result;
  const { clinicaId } = result;

  const body = await req.json();
  const avaliacao = await prisma.avaliacao.create({
    data: {
      clinicaId,
      pacienteId: body.pacienteId,
      tipo: body.tipo ?? "inicial",
      data: body.data ? new Date(body.data) : new Date(),
      queixaPrincipal: body.queixaPrincipal || null,
      historiaDoenca: body.historiaDoenca || null,
      historiaPregressa: body.historiaPregressa || null,
      medicamentos: body.medicamentos || null,
      comorbidades: body.comorbidades || null,
      habitosVida: body.habitosVida || null,
      inspecao: body.inspecao || null,
      palpacao: body.palpacao || null,
      testesEspeciais: body.testesEspeciais || null,
      postura: body.postura || null,
      adm: body.adm ? JSON.stringify(body.adm) : null,
      forcaMuscular: body.forcaMuscular ? JSON.stringify(body.forcaMuscular) : null,
      escalaDor: body.escalaDor !== undefined ? Number(body.escalaDor) : null,
      localizacaoDor: body.localizacaoDor || null,
      diagnostico: body.diagnostico || null,
      objetivos: body.objetivos || null,
      numeroSessoes: body.numeroSessoes ? Number(body.numeroSessoes) : null,
    },
    include: { paciente: { select: { nome: true } } },
  });
  return NextResponse.json(avaliacao, { status: 201 });
}
