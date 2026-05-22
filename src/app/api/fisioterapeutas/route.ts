import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireClinicaId } from "@/lib/session";

export async function GET() {
  const result = await requireClinicaId();
  if (result instanceof NextResponse) return result;
  const { clinicaId } = result;

  const fisioterapeutas = await prisma.fisioterapeuta.findMany({
    where: { clinicaId, ativo: true },
    orderBy: { nome: "asc" },
  });
  return NextResponse.json(fisioterapeutas);
}

export async function POST(req: NextRequest) {
  const result = await requireClinicaId();
  if (result instanceof NextResponse) return result;
  const { clinicaId } = result;

  const body = await req.json();
  const fisioterapeuta = await prisma.fisioterapeuta.create({
    data: {
      clinicaId,
      nome: body.nome,
      crefito: body.crefito || null,
      especialidade: body.especialidade || null,
      telefone: body.telefone || null,
      email: body.email || null,
    },
  });
  return NextResponse.json(fisioterapeuta, { status: 201 });
}
