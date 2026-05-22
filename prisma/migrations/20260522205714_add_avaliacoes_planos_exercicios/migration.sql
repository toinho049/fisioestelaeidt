-- CreateTable
CREATE TABLE "Avaliacao" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    CONSTRAINT "Avaliacao_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PlanoTratamento" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    CONSTRAINT "PlanoTratamento_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Exercicio" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "categoria" TEXT,
    "instrucoes" TEXT,
    "series" INTEGER,
    "repeticoes" TEXT,
    "tempo" TEXT,
    "nivel" TEXT NOT NULL DEFAULT 'moderado',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "PrescricaoExercicio" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pacienteId" TEXT NOT NULL,
    "exercicioId" TEXT NOT NULL,
    "series" INTEGER,
    "repeticoes" TEXT,
    "tempo" TEXT,
    "frequencia" TEXT,
    "observacoes" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PrescricaoExercicio_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PrescricaoExercicio_exercicioId_fkey" FOREIGN KEY ("exercicioId") REFERENCES "Exercicio" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
