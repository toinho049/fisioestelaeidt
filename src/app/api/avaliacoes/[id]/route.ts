import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const a = await prisma.avaliacao.findUnique({
    where: { id },
    include: { paciente: { select: { nome: true, dataNascimento: true } } },
  });
  if (!a) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  return NextResponse.json(a);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const avaliacao = await prisma.avaliacao.update({
    where: { id },
    data: {
      queixaPrincipal: body.queixaPrincipal,
      historiaDoenca: body.historiaDoenca,
      historiaPregressa: body.historiaPregressa,
      medicamentos: body.medicamentos,
      comorbidades: body.comorbidades,
      habitosVida: body.habitosVida,
      inspecao: body.inspecao,
      palpacao: body.palpacao,
      testesEspeciais: body.testesEspeciais,
      postura: body.postura,
      adm: body.adm ? JSON.stringify(body.adm) : undefined,
      forcaMuscular: body.forcaMuscular ? JSON.stringify(body.forcaMuscular) : undefined,
      escalaDor: body.escalaDor !== undefined ? Number(body.escalaDor) : undefined,
      localizacaoDor: body.localizacaoDor,
      diagnostico: body.diagnostico,
      objetivos: body.objetivos,
      numeroSessoes: body.numeroSessoes ? Number(body.numeroSessoes) : undefined,
    },
  });
  return NextResponse.json(avaliacao);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.avaliacao.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
