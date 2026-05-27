import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { nome, email, senha } = body;

  if (!nome?.trim() || !email?.trim() || !senha?.trim()) {
    return NextResponse.json({ error: "Preencha todos os campos." }, { status: 400 });
  }
  if (senha.length < 6) {
    return NextResponse.json({ error: "A senha deve ter pelo menos 6 caracteres." }, { status: 400 });
  }

  const existe = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existe) {
    return NextResponse.json({ error: "Este email já está cadastrado." }, { status: 409 });
  }

  // Cria uma nova clínica para este usuário
  const clinica = await prisma.clinica.create({
    data: { nome: `Clínica de ${nome.trim().split(" ")[0]}` },
  });

  const senhaHash = await hash(senha, 10);

  const user = await prisma.user.create({
    data: {
      nome: nome.trim(),
      email: email.toLowerCase().trim(),
      senha: senhaHash,
      role: "admin",         // quem se cadastra vira admin da própria clínica
      clinicaId: clinica.id,
    },
  });

  return NextResponse.json({
    id: user.id,
    nome: user.nome,
    email: user.email,
    clinicaId: clinica.id,
    // Instrui o front a redirecionar para /ativar após login
    proximoPasso: "ativar",
  }, { status: 201 });
}
