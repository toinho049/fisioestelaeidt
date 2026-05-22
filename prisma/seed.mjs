import Database from "better-sqlite3";
import { randomUUID } from "crypto";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { hashSync } from "bcryptjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const db = new Database(join(__dirname, "dev.db"));
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

function id() { return randomUUID().replace(/-/g, "").slice(0, 25); }
function now() { return new Date().toISOString(); }

console.log("🌱 Iniciando seed multi-tenant...");

// Limpa tudo
db.exec("DELETE FROM PrescricaoExercicio");
db.exec("DELETE FROM Exercicio");
db.exec("DELETE FROM Pagamento");
db.exec("DELETE FROM PlanoTratamento");
db.exec("DELETE FROM Avaliacao");
db.exec("DELETE FROM Prontuario");
db.exec("DELETE FROM Agendamento");
db.exec("DELETE FROM Fisioterapeuta");
db.exec("DELETE FROM Paciente");
db.exec("DELETE FROM User");
db.exec("DELETE FROM SolicitacaoLicenca");
db.exec("DELETE FROM Licenca");
db.exec("DELETE FROM Clinica");

// ──────────────────────────────────────────────────────────────
// SUPER ADMIN (sem clínica — acessa /admin)
// ──────────────────────────────────────────────────────────────
const superAdminId = id();
db.prepare(`INSERT INTO User (id,nome,email,senha,role,ativo,clinicaId,criadoEm,atualizadoEm) VALUES (?,?,?,?,?,1,NULL,?,?)`)
  .run(superAdminId, "Super Admin DomFisio", "superadmin@domfisio.com", hashSync("super123", 10), "superadmin", now(), now());

// ──────────────────────────────────────────────────────────────
// CLÍNICA DEMO (para testes)
// ──────────────────────────────────────────────────────────────
const clinicaDemoId = id();
db.prepare(`INSERT INTO Clinica (id,nome,criadoEm) VALUES (?,?,?)`)
  .run(clinicaDemoId, "Clínica Demo DomFisio", now());

// Licença demo ativa por 90 dias
const licencaDemoId = id();
const expDemo = new Date(); expDemo.setDate(expDemo.getDate() + 90);
db.prepare(`INSERT INTO Licenca (id,token,nomeClinica,email,planoNome,diasValidade,status,dataInicio,dataExpiracao,ativadaEm,criadoEm,atualizadoEm) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`)
  .run(licencaDemoId, "DOM-DEMO-DEMO-DEMO", "Clínica Demo DomFisio", "admin@domfisio.com", "Clínica", 90, "ativa", now(), expDemo.toISOString(), now(), now(), now());

// Atualiza clínica demo com a licença ativa
db.prepare(`UPDATE Clinica SET licencaAtivaId=? WHERE id=?`).run(licencaDemoId, clinicaDemoId);

// Admin da clínica demo
const adminDemoId = id();
db.prepare(`INSERT INTO User (id,nome,email,senha,role,ativo,clinicaId,criadoEm,atualizadoEm) VALUES (?,?,?,?,?,1,?,?,?)`)
  .run(adminDemoId, "Administrador Demo", "admin@domfisio.com", hashSync("admin123", 10), "admin", clinicaDemoId, now(), now());

// Fisio da clínica demo
db.prepare(`INSERT INTO User (id,nome,email,senha,role,ativo,clinicaId,criadoEm,atualizadoEm) VALUES (?,?,?,?,?,1,?,?,?)`)
  .run(id(), "Dra. Ana Paula Martins", "ana@domfisio.com", hashSync("fisio123", 10), "fisioterapeuta", clinicaDemoId, now(), now());

console.log("   ✓ Clínica Demo criada (admin@domfisio.com / admin123)");
console.log("   ✓ Licença demo ativa 90 dias (DOM-DEMO-DEMO-DEMO)");
console.log("   ✓ Super admin: superadmin@domfisio.com / super123");

// Fisioterapeutas da clínica demo
const fisio1Id = id(), fisio2Id = id();
db.prepare(`INSERT INTO Fisioterapeuta (id,clinicaId,nome,crefito,especialidade,email,telefone,ativo,criadoEm) VALUES (?,?,?,?,?,?,?,1,?)`)
  .run(fisio1Id, clinicaDemoId, "Dra. Ana Paula Martins", "CREFITO-3/123456-F", "Ortopedia e Traumatologia", "ana.martins@fisio.com", "(47) 99999-1111", now());
db.prepare(`INSERT INTO Fisioterapeuta (id,clinicaId,nome,crefito,especialidade,email,telefone,ativo,criadoEm) VALUES (?,?,?,?,?,?,?,1,?)`)
  .run(fisio2Id, clinicaDemoId, "Dr. Carlos Eduardo Silva", "CREFITO-3/789012-F", "Neurologia", "carlos.silva@fisio.com", "(47) 99999-2222", now());

// Pacientes da clínica demo
const pacs = [
  { nome: "Maria Favero Cetolin", cpf: "123.456.789-00", nasc: "1985-03-15", tel: "(47) 98765-1234", email: "maria@email.com", conv: "Unimed" },
  { nome: "Wilson Trevisan", cpf: "987.654.321-00", nasc: "1972-08-22", tel: "(47) 98765-5678", email: "wilson@email.com", conv: null },
  { nome: "Elisiane Andreolla", cpf: "456.789.123-00", nasc: "1990-12-05", tel: "(47) 98765-9012", email: "elisiane@email.com", conv: "SulAmérica" },
  { nome: "Maique Merlo", cpf: "321.654.987-00", nasc: "1968-07-18", tel: "(47) 98765-3456", email: "maique@email.com", conv: null },
  { nome: "Mara Terezinha Mazui da Rosa", cpf: "654.321.098-00", nasc: "1978-04-30", tel: "(47) 98765-7890", email: "mara@email.com", conv: "Bradesco" },
  { nome: "Sayonara Wronski", cpf: "789.012.345-00", nasc: "1995-01-12", tel: "(47) 98765-2345", email: "sayonara@email.com", conv: "Unimed" },
  { nome: "Natiele Ruschel", cpf: "012.345.678-00", nasc: "1988-09-25", tel: "(47) 98765-6789", email: "natiele@email.com", conv: null },
  { nome: "Ismael Kammler", cpf: "234.567.890-00", nasc: "1962-06-08", tel: "(47) 98765-0123", email: "ismael@email.com", conv: "Amil" },
];

const insertPac = db.prepare(`INSERT INTO Paciente (id,clinicaId,nome,cpf,dataNascimento,telefone,email,convenio,ativo,criadoEm,atualizadoEm) VALUES (?,?,?,?,?,?,?,?,1,?,?)`);
const pacIds = pacs.map(p => {
  const pid = id();
  insertPac.run(pid, clinicaDemoId, p.nome, p.cpf, p.nasc ? new Date(p.nasc).toISOString() : null, p.tel, p.email, p.conv, now(), now());
  return pid;
});

// Agendamentos desta semana
const segunda = new Date();
segunda.setDate(segunda.getDate() - segunda.getDay() + 1);
segunda.setHours(0, 0, 0, 0);
function agData(dias, horas) { return new Date(segunda.getTime() + dias * 86400000 + horas * 3600000).toISOString(); }

const insertAg = db.prepare(`INSERT INTO Agendamento (id,clinicaId,pacienteId,fisioterapeutaId,data,duracao,status,tipo,sala,criadoEm,atualizadoEm) VALUES (?,?,?,?,?,?,?,?,?,?,?)`);
const ags = [
  { pac: 2, fisio: fisio1Id, d: agData(1, 7), s: "realizado", t: "retorno", sala: "Sala 1" },
  { pac: 3, fisio: fisio1Id, d: agData(1, 8), s: "realizado", t: "retorno", sala: "Sala 1" },
  { pac: 4, fisio: fisio2Id, d: agData(1, 9), s: "realizado", t: "consulta", sala: "Sala 2" },
  { pac: 1, fisio: fisio1Id, d: agData(3, 7), s: "realizado", t: "retorno", sala: "Sala 1" },
  { pac: 0, fisio: fisio2Id, d: agData(3, 8), s: "realizado", t: "avaliacao", sala: "Sala 2" },
  { pac: 6, fisio: fisio2Id, d: agData(3, 9), s: "confirmado", t: "consulta", sala: "Sala 2" },
  { pac: 4, fisio: fisio1Id, d: agData(3, 9.75), s: "agendado", t: "retorno", sala: "Sala 1" },
  { pac: 7, fisio: fisio1Id, d: agData(4, 8), s: "confirmado", t: "consulta", sala: "Sala 1" },
  { pac: 5, fisio: fisio2Id, d: agData(4, 14), s: "agendado", t: "retorno", sala: "Sala 2" },
  { pac: 5, fisio: fisio1Id, d: agData(5, 8), s: "agendado", t: "procedimento", sala: "Sala 1" },
  { pac: 2, fisio: fisio2Id, d: agData(5, 15), s: "agendado", t: "retorno", sala: "Sala 2" },
];
for (const ag of ags) {
  insertAg.run(id(), clinicaDemoId, pacIds[ag.pac], ag.fisio, ag.d, 50, ag.s, ag.t, ag.sala, now(), now());
}

// Pagamentos
const insertPag = db.prepare(`INSERT INTO Pagamento (id,clinicaId,pacienteId,valor,desconto,formaPagamento,status,dataPagamento,descricao,criadoEm,atualizadoEm) VALUES (?,?,?,?,?,?,?,?,?,?,?)`);
const pags = [
  { pac: 0, val: 150, fp: "pix", s: "pago" },
  { pac: 1, val: 180, fp: "cartao_credito", s: "pago" },
  { pac: 2, val: 150, fp: "convenio", s: "pendente" },
  { pac: 3, val: 120, fp: "dinheiro", s: "pago" },
  { pac: 4, val: 200, fp: "transferencia", s: "pendente" },
  { pac: 5, val: 150, fp: "pix", s: "pago" },
  { pac: 6, val: 150, fp: "pix", s: "pendente" },
  { pac: 7, val: 150, fp: "cartao_debito", s: "pago" },
];
for (const p of pags) {
  insertPag.run(id(), clinicaDemoId, pacIds[p.pac], p.val, 0, p.fp, p.s, p.s === "pago" ? now() : null, "Sessão de fisioterapia", now(), now());
}

// Solicitações de exemplo no painel admin
const insertSol = db.prepare(`INSERT INTO SolicitacaoLicenca (id,nomeTitular,email,nomeClinica,telefone,planoNome,diasPlano,status,criadoEm,atualizadoEm) VALUES (?,?,?,?,?,?,?,?,?,?)`);
insertSol.run(id(), "Dr. Roberto Almeida", "roberto@clinicafit.com.br", "Clínica Fit", "(48) 99888-7766", "Clínica", 30, "pendente", now(), now());
insertSol.run(id(), "Dra. Juliana Torres", "juliana@fisiosul.com.br", "FisioSul", "(51) 98777-5544", "Solo", 30, "pendente", now(), now());

db.close();

console.log("✅ Seed concluído!");
console.log(`   ✓ 8 pacientes (clínica demo)`);
console.log(`   ✓ ${ags.length} agendamentos`);
console.log(`   ✓ ${pags.length} pagamentos`);
console.log(`   ✓ 2 solicitações de exemplo no admin`);
console.log("\n📋 Contas de acesso:");
console.log("   🔑 superadmin@domfisio.com / super123 → /admin");
console.log("   🏥 admin@domfisio.com / admin123 → clínica demo");
console.log("   👩‍⚕️ ana@domfisio.com / fisio123 → clínica demo");
