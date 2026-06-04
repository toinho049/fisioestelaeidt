import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const paciente = await prisma.paciente.findUnique({
    where: { id },
    include: {
      agendamentos: { orderBy: { data: "desc" }, take: 10 },
      prontuarios: { orderBy: { data: "desc" }, take: 10 },
      pagamentos: { orderBy: { criadoEm: "desc" }, take: 10 },
    },
  });
  if (!paciente) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  return NextResponse.json(paciente);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const paciente = await prisma.paciente.update({
    where: { id },
    data: {
      nome: body.nome,
      cpf: body.cpf || null,
      dataNascimento: body.dataNascimento ? new Date(body.dataNascimento) : null,
      telefone: body.telefone || null,
      email: body.email || null,
      endereco: body.endereco || null,
      convenio: body.convenio || null,
      numeroConvenio: body.numeroConvenio || null,
      observacoes: body.observacoes || null,
      ativo: body.ativo ?? true,
    },
  });
  return NextResponse.json(paciente);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  await prisma.$transaction([
    prisma.pagamento.deleteMany({ where: { pacienteId: id } }),
    prisma.prontuario.deleteMany({ where: { pacienteId: id } }),
    prisma.avaliacao.deleteMany({ where: { pacienteId: id } }),
    prisma.prescricaoExercicio.deleteMany({ where: { pacienteId: id } }),
    prisma.planoTratamento.deleteMany({ where: { pacienteId: id } }),
    prisma.agendamento.deleteMany({ where: { pacienteId: id } }),
    prisma.paciente.delete({ where: { id } }),
  ]);

  return NextResponse.json({ ok: true });
}
