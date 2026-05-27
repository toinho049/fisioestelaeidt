import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireClinicaId } from "@/lib/session";

export async function GET(req: NextRequest) {
  const result = await requireClinicaId();
  if (result instanceof NextResponse) return result;
  const { clinicaId } = result;

  const { searchParams } = new URL(req.url);
  const inicio = searchParams.get("inicio");
  const fim = searchParams.get("fim");
  const pacienteId = searchParams.get("pacienteId");
  const status = searchParams.get("status");

  const agendamentos = await prisma.agendamento.findMany({
    where: {
      clinicaId,
      ...(inicio && fim && { data: { gte: new Date(inicio), lte: new Date(fim) } }),
      ...(pacienteId && { pacienteId }),
      ...(status && { status }),
    },
    orderBy: { data: "asc" },
    include: {
      paciente: { select: { id: true, nome: true, telefone: true } },
      fisioterapeuta: { select: { id: true, nome: true } },
    },
  });
  return NextResponse.json(agendamentos);
}

export async function POST(req: NextRequest) {
  const result = await requireClinicaId();
  if (result instanceof NextResponse) return result;
  const { clinicaId } = result;

  const body = await req.json();
  const agendamento = await prisma.agendamento.create({
    data: {
      clinicaId,
      pacienteId: body.pacienteId,
      fisioterapeutaId: body.fisioterapeutaId || null,
      data: new Date(body.data),
      duracao: body.duracao ?? 50,
      status: body.status ?? "agendado",
      tipo: body.tipo ?? "consulta",
      observacoes: body.observacoes || null,
      sala: body.sala || null,
    },
    include: {
      paciente: { select: { id: true, nome: true } },
      fisioterapeuta: { select: { id: true, nome: true } },
    },
  });
  return NextResponse.json(agendamento, { status: 201 });
}
