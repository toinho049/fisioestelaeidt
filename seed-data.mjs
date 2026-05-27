import { PrismaClient } from "@prisma/client";
import { hashSync } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed multi-tenant...");

  // Limpa tudo
  await prisma.prescricaoExercicio.deleteMany();
  await prisma.exercicio.deleteMany();
  await prisma.pagamento.deleteMany();
  await prisma.planoTratamento.deleteMany();
  await prisma.avaliacao.deleteMany();
  await prisma.prontuario.deleteMany();
  await prisma.agendamento.deleteMany();
  await prisma.fisioterapeuta.deleteMany();
  await prisma.paciente.deleteMany();
  await prisma.user.deleteMany();
  await prisma.solicitacaoLicenca.deleteMany();
  await prisma.licenca.deleteMany();
  await prisma.clinica.deleteMany();

  // SUPER ADMIN (sem clínica — acessa /admin)
  const superAdmin = await prisma.user.create({
    data: {
      nome: "Super Admin DomFisio",
      email: "superadmin@domfisio.com",
      senha: hashSync("super123", 10),
      role: "superadmin",
      ativo: true,
    },
  });

  // CLÍNICA DEMO
  const clinicaDemo = await prisma.clinica.create({
    data: {
      nome: "Clínica Demo DomFisio",
    },
  });

  // Licença demo ativa por 90 dias
  const expDemo = new Date();
  expDemo.setDate(expDemo.getDate() + 90);
  const licencaDemo = await prisma.licenca.create({
    data: {
      token: "DOM-DEMO-DEMO-DEMO",
      nomeClinica: "Clínica Demo DomFisio",
      email: "admin@domfisio.com",
      planoNome: "Clínica",
      diasValidade: 90,
      status: "ativa",
      dataInicio: new Date(),
      dataExpiracao: expDemo,
      ativadaEm: new Date(),
    },
  });

  // Atualiza clínica demo com a licença ativa
  await prisma.clinica.update({
    where: { id: clinicaDemo.id },
    data: { licencaAtivaId: licencaDemo.id },
  });

  // Admin da clínica demo
  const adminDemo = await prisma.user.create({
    data: {
      nome: "Administrador Demo",
      email: "admin@domfisio.com",
      senha: hashSync("admin123", 10),
      role: "admin",
      ativo: true,
      clinicaId: clinicaDemo.id,
    },
  });

  // Fisio da clínica demo
  await prisma.user.create({
    data: {
      nome: "Dra. Ana Paula Martins",
      email: "ana@domfisio.com",
      senha: hashSync("fisio123", 10),
      role: "fisioterapeuta",
      ativo: true,
      clinicaId: clinicaDemo.id,
    },
  });

  console.log("   ✓ Clínica Demo criada (admin@domfisio.com / admin123)");
  console.log("   ✓ Licença demo ativa 90 dias (DOM-DEMO-DEMO-DEMO)");
  console.log("   ✓ Super admin: superadmin@domfisio.com / super123");

  console.log("✅ Seed concluído!");
  console.log("\n📋 Contas de acesso:");
  console.log("   🔑 superadmin@domfisio.com / super123 → /admin");
  console.log("   🏥 admin@domfisio.com / admin123 → clínica demo");
  console.log("   👩‍⚕️ ana@domfisio.com / fisio123 → clínica demo");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
