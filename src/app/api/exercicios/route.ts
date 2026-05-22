import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const categoria = searchParams.get("categoria");
  const q = searchParams.get("q");

  const exercicios = await prisma.exercicio.findMany({
    where: {
      ativo: true,
      ...(categoria && { categoria }),
      ...(q && { nome: { contains: q } }),
    },
    orderBy: { nome: "asc" },
    include: { _count: { select: { prescricoes: true } } },
  });
  return NextResponse.json(exercicios);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const exercicio = await prisma.exercicio.create({
    data: {
      nome: body.nome,
      descricao: body.descricao || null,
      categoria: body.categoria || null,
      instrucoes: body.instrucoes || null,
      series: body.series ? Number(body.series) : null,
      repeticoes: body.repeticoes || null,
      tempo: body.tempo || null,
      nivel: body.nivel ?? "moderado",
    },
  });
  return NextResponse.json(exercicio, { status: 201 });
}
