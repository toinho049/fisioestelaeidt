import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const licencas = await prisma.licenca.findMany({
    orderBy: { criadoEm: "desc" },
    include: { solicitacao: { select: { nomeTitular: true, telefone: true } } },
  });
  return NextResponse.json(licencas);
}
