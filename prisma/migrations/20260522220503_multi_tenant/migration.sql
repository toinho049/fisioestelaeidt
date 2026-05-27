/*
  Warnings:

  - You are about to drop the `ConfigSistema` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `clinicaId` to the `Agendamento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clinicaId` to the `Avaliacao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clinicaId` to the `Fisioterapeuta` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clinicaId` to the `Paciente` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clinicaId` to the `Pagamento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clinicaId` to the `PlanoTratamento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clinicaId` to the `PrescricaoExercicio` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clinicaId` to the `Prontuario` table without a default value. This is not possible if the table is not empty.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ConfigSistema";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Clinica" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "licencaAtivaId" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Agendamento" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clinicaId" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "fisioterapeutaId" TEXT,
    "data" DATETIME NOT NULL,
    "duracao" INTEGER NOT NULL DEFAULT 50,
    "status" TEXT NOT NULL DEFAULT 'agendado',
    "tipo" TEXT NOT NULL DEFAULT 'consulta',
    "observacoes" TEXT,
    "sala" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    CONSTRAINT "Agendamento_clinicaId_fkey" FOREIGN KEY ("clinicaId") REFERENCES "Clinica" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Agendamento_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Agendamento_fisioterapeutaId_fkey" FOREIGN KEY ("fisioterapeutaId") REFERENCES "Fisioterapeuta" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Agendamento" ("atualizadoEm", "criadoEm", "data", "duracao", "fisioterapeutaId", "id", "observacoes", "pacienteId", "sala", "status", "tipo") SELECT "atualizadoEm", "criadoEm", "data", "duracao", "fisioterapeutaId", "id", "observacoes", "pacienteId", "sala", "status", "tipo" FROM "Agendamento";
DROP TABLE "Agendamento";
ALTER TABLE "new_Agendamento" RENAME TO "Agendamento";
CREATE TABLE "new_Avaliacao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clinicaId" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "data" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tipo" TEXT NOT NULL DEFAULT 'inicial',
    "queixaPrincipal" TEXT,
    "historiaDoenca" TEXT,
    "historiaPregressa" TEXT,
    "medicamentos" TEXT,
    "comorbidades" TEXT,
    "habitosVida" TEXT,
    "inspecao" TEXT,
    "palpacao" TEXT,
    "testesEspeciais" TEXT,
    "postura" TEXT,
    "adm" TEXT,
    "forcaMuscular" TEXT,
    "escalaDor" INTEGER,
    "localizacaoDor" TEXT,
    "funcionalidade" TEXT,
    "diagnostico" TEXT,
    "objetivos" TEXT,
    "numeroSessoes" INTEGER,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    CONSTRAINT "Avaliacao_clinicaId_fkey" FOREIGN KEY ("clinicaId") REFERENCES "Clinica" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Avaliacao_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Avaliacao" ("adm", "atualizadoEm", "comorbidades", "criadoEm", "data", "diagnostico", "escalaDor", "forcaMuscular", "funcionalidade", "habitosVida", "historiaDoenca", "historiaPregressa", "id", "inspecao", "localizacaoDor", "medicamentos", "numeroSessoes", "objetivos", "pacienteId", "palpacao", "postura", "queixaPrincipal", "testesEspeciais", "tipo") SELECT "adm", "atualizadoEm", "comorbidades", "criadoEm", "data", "diagnostico", "escalaDor", "forcaMuscular", "funcionalidade", "habitosVida", "historiaDoenca", "historiaPregressa", "id", "inspecao", "localizacaoDor", "medicamentos", "numeroSessoes", "objetivos", "pacienteId", "palpacao", "postura", "queixaPrincipal", "testesEspeciais", "tipo" FROM "Avaliacao";
DROP TABLE "Avaliacao";
ALTER TABLE "new_Avaliacao" RENAME TO "Avaliacao";
CREATE TABLE "new_Fisioterapeuta" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clinicaId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "crefito" TEXT,
    "especialidade" TEXT,
    "telefone" TEXT,
    "email" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Fisioterapeuta_clinicaId_fkey" FOREIGN KEY ("clinicaId") REFERENCES "Clinica" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Fisioterapeuta" ("ativo", "crefito", "criadoEm", "email", "especialidade", "id", "nome", "telefone") SELECT "ativo", "crefito", "criadoEm", "email", "especialidade", "id", "nome", "telefone" FROM "Fisioterapeuta";
DROP TABLE "Fisioterapeuta";
ALTER TABLE "new_Fisioterapeuta" RENAME TO "Fisioterapeuta";
CREATE TABLE "new_Paciente" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clinicaId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cpf" TEXT,
    "dataNascimento" DATETIME,
    "telefone" TEXT,
    "email" TEXT,
    "endereco" TEXT,
    "convenio" TEXT,
    "numeroConvenio" TEXT,
    "observacoes" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    CONSTRAINT "Paciente_clinicaId_fkey" FOREIGN KEY ("clinicaId") REFERENCES "Clinica" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Paciente" ("ativo", "atualizadoEm", "convenio", "cpf", "criadoEm", "dataNascimento", "email", "endereco", "id", "nome", "numeroConvenio", "observacoes", "telefone") SELECT "ativo", "atualizadoEm", "convenio", "cpf", "criadoEm", "dataNascimento", "email", "endereco", "id", "nome", "numeroConvenio", "observacoes", "telefone" FROM "Paciente";
DROP TABLE "Paciente";
ALTER TABLE "new_Paciente" RENAME TO "Paciente";
CREATE TABLE "new_Pagamento" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clinicaId" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "agendamentoId" TEXT,
    "valor" REAL NOT NULL,
    "desconto" REAL NOT NULL DEFAULT 0,
    "formaPagamento" TEXT NOT NULL DEFAULT 'dinheiro',
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "dataVencimento" DATETIME,
    "dataPagamento" DATETIME,
    "descricao" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    CONSTRAINT "Pagamento_clinicaId_fkey" FOREIGN KEY ("clinicaId") REFERENCES "Clinica" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Pagamento_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Pagamento_agendamentoId_fkey" FOREIGN KEY ("agendamentoId") REFERENCES "Agendamento" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Pagamento" ("agendamentoId", "atualizadoEm", "criadoEm", "dataPagamento", "dataVencimento", "desconto", "descricao", "formaPagamento", "id", "pacienteId", "status", "valor") SELECT "agendamentoId", "atualizadoEm", "criadoEm", "dataPagamento", "dataVencimento", "desconto", "descricao", "formaPagamento", "id", "pacienteId", "status", "valor" FROM "Pagamento";
DROP TABLE "Pagamento";
ALTER TABLE "new_Pagamento" RENAME TO "Pagamento";
CREATE TABLE "new_PlanoTratamento" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clinicaId" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "objetivoCurto" TEXT,
    "objetivoLongo" TEXT,
    "sessoesTotais" INTEGER NOT NULL DEFAULT 10,
    "sessoesRealizadas" INTEGER NOT NULL DEFAULT 0,
    "tecnicas" TEXT,
    "recursos" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ativo',
    "dataInicio" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataFim" DATETIME,
    "observacoes" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    CONSTRAINT "PlanoTratamento_clinicaId_fkey" FOREIGN KEY ("clinicaId") REFERENCES "Clinica" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PlanoTratamento_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_PlanoTratamento" ("atualizadoEm", "criadoEm", "dataFim", "dataInicio", "id", "objetivoCurto", "objetivoLongo", "observacoes", "pacienteId", "recursos", "sessoesRealizadas", "sessoesTotais", "status", "tecnicas", "titulo") SELECT "atualizadoEm", "criadoEm", "dataFim", "dataInicio", "id", "objetivoCurto", "objetivoLongo", "observacoes", "pacienteId", "recursos", "sessoesRealizadas", "sessoesTotais", "status", "tecnicas", "titulo" FROM "PlanoTratamento";
DROP TABLE "PlanoTratamento";
ALTER TABLE "new_PlanoTratamento" RENAME TO "PlanoTratamento";
CREATE TABLE "new_PrescricaoExercicio" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clinicaId" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "exercicioId" TEXT NOT NULL,
    "series" INTEGER,
    "repeticoes" TEXT,
    "tempo" TEXT,
    "frequencia" TEXT,
    "observacoes" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PrescricaoExercicio_clinicaId_fkey" FOREIGN KEY ("clinicaId") REFERENCES "Clinica" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PrescricaoExercicio_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PrescricaoExercicio_exercicioId_fkey" FOREIGN KEY ("exercicioId") REFERENCES "Exercicio" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_PrescricaoExercicio" ("ativo", "criadoEm", "exercicioId", "frequencia", "id", "observacoes", "pacienteId", "repeticoes", "series", "tempo") SELECT "ativo", "criadoEm", "exercicioId", "frequencia", "id", "observacoes", "pacienteId", "repeticoes", "series", "tempo" FROM "PrescricaoExercicio";
DROP TABLE "PrescricaoExercicio";
ALTER TABLE "new_PrescricaoExercicio" RENAME TO "PrescricaoExercicio";
CREATE TABLE "new_Prontuario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clinicaId" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "data" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tipo" TEXT NOT NULL DEFAULT 'evolucao',
    "queixa" TEXT,
    "anamnese" TEXT,
    "exame" TEXT,
    "diagnostico" TEXT,
    "conduta" TEXT,
    "evolucao" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    CONSTRAINT "Prontuario_clinicaId_fkey" FOREIGN KEY ("clinicaId") REFERENCES "Clinica" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Prontuario_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Prontuario" ("anamnese", "atualizadoEm", "conduta", "criadoEm", "data", "diagnostico", "evolucao", "exame", "id", "pacienteId", "queixa", "tipo") SELECT "anamnese", "atualizadoEm", "conduta", "criadoEm", "data", "diagnostico", "evolucao", "exame", "id", "pacienteId", "queixa", "tipo" FROM "Prontuario";
DROP TABLE "Prontuario";
ALTER TABLE "new_Prontuario" RENAME TO "Prontuario";
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'fisioterapeuta',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "clinicaId" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    CONSTRAINT "User_clinicaId_fkey" FOREIGN KEY ("clinicaId") REFERENCES "Clinica" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("ativo", "atualizadoEm", "criadoEm", "email", "id", "nome", "role", "senha") SELECT "ativo", "atualizadoEm", "criadoEm", "email", "id", "nome", "role", "senha" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
