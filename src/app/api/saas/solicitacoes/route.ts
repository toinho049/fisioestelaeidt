import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const solicitacoes = await prisma.solicitacaoLicenca.findMany({
    orderBy: { criadoEm: "desc" },
    include: { licenca: true },
  });
  return NextResponse.json(solicitacoes);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const sol = await prisma.solicitacaoLicenca.create({
    data: {
      nomeTitular: body.nomeTitular,
      email: body.email,
      nomeClinica: body.nomeClinica,
      telefone: body.telefone || null,
      planoNome: body.planoNome,
      diasPlano: Number(body.diasPlano),
    },
  });
  return NextResponse.json(sol, { status: 201 });
}
