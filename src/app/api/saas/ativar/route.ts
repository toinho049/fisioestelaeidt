import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// GET — verifica status da licença da clínica do usuário logado
export async function GET() {
  const session = await getSession();

  if (!session?.user?.clinicaId) {
    return NextResponse.json({ ativa: false, motivo: "sem_clinica" });
  }

  const clinica = await prisma.clinica.findUnique({
    where: { id: session.user.clinicaId },
  });

  if (!clinica?.licencaAtivaId) {
    return NextResponse.json({ ativa: false, motivo: "sem_licenca" });
  }

  const licenca = await prisma.licenca.findUnique({
    where: { id: clinica.licencaAtivaId },
  });

  if (!licenca) return NextResponse.json({ ativa: false, motivo: "sem_licenca" });

  // Verifica expiração
  if (licenca.dataExpiracao && new Date() > licenca.dataExpiracao) {
    await prisma.licenca.update({ where: { id: licenca.id }, data: { status: "expirada" } });
    await prisma.clinica.update({ where: { id: clinica.id }, data: { licencaAtivaId: null } });
    return NextResponse.json({ ativa: false, motivo: "expirada" });
  }

  const diasRestantes = licenca.dataExpiracao
    ? Math.max(0, Math.ceil((licenca.dataExpiracao.getTime() - Date.now()) / 86400000))
    : null;

  return NextResponse.json({
    ativa: true,
    nomeClinica: licenca.nomeClinica,
    plano: licenca.planoNome,
    dataExpiracao: licenca.dataExpiracao,
    diasRestantes,
    token: licenca.token,
  });
}

// POST — ativa token na clínica do usuário logado
export async function POST(req: NextRequest) {
  const session = await getSession();

  if (!session?.user?.clinicaId) {
    return NextResponse.json({ error: "Faça login primeiro." }, { status: 401 });
  }

  const { token } = await req.json();
  if (!token) return NextResponse.json({ error: "Token obrigatório." }, { status: 400 });

  const licenca = await prisma.licenca.findUnique({
    where: { token: token.trim().toUpperCase() },
  });

  if (!licenca) return NextResponse.json({ error: "Token inválido. Verifique e tente novamente." }, { status: 404 });
  if (licenca.status === "ativa") return NextResponse.json({ error: "Este token já foi ativado." }, { status: 409 });
  if (licenca.status === "expirada") return NextResponse.json({ error: "Este token expirou." }, { status: 410 });
  if (licenca.status === "cancelada") return NextResponse.json({ error: "Esta licença foi cancelada." }, { status: 403 });

  const dataInicio = new Date();
  const dataExpiracao = new Date(dataInicio);
  dataExpiracao.setDate(dataExpiracao.getDate() + licenca.diasValidade);

  const licencaAtivada = await prisma.licenca.update({
    where: { token: token.trim().toUpperCase() },
    data: { status: "ativa", dataInicio, dataExpiracao, ativadaEm: dataInicio },
  });

  // Associa a licença à clínica do usuário logado
  await prisma.clinica.update({
    where: { id: session.user.clinicaId },
    data: { licencaAtivaId: licencaAtivada.id },
  });

  return NextResponse.json({
    ok: true,
    licenca: {
      token: licencaAtivada.token,
      nomeClinica: licencaAtivada.nomeClinica,
      plano: licencaAtivada.planoNome,
      diasValidade: licencaAtivada.diasValidade,
      dataExpiracao: licencaAtivada.dataExpiracao,
    },
  });
}
