import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireClinicaId } from "@/lib/session";

export async function GET(req: NextRequest) {
  const result = await requireClinicaId();
  if (result instanceof NextResponse) return result;
  const { clinicaId } = result;

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";

  const pacientes = await prisma.paciente.findMany({
    where: { clinicaId, ...(q && { nome: { contains: q } }) },
    orderBy: { nome: "asc" },
    include: { _count: { select: { agendamentos: true, prontuarios: true } } },
  });
  return NextResponse.json(pacientes);
}

export async function POST(req: NextRequest) {
  const result = await requireClinicaId();
  if (result instanceof NextResponse) return result;
  const { clinicaId } = result;

  const body = await req.json();
  const paciente = await prisma.paciente.create({
    data: {
      clinicaId,
      nome: body.nome,
      cpf: body.cpf || null,
      dataNascimento: body.dataNascimento ? new Date(body.dataNascimento) : null,
      telefone: body.telefone || null,
      email: body.email || null,
      endereco: body.endereco || null,
      convenio: body.convenio || null,
      numeroConvenio: body.numeroConvenio || null,
      observacoes: body.observacoes || null,
    },
  });
  return NextResponse.json(paciente, { status: 201 });
}
