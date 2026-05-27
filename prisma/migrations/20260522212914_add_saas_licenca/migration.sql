-- CreateTable
CREATE TABLE "PlanoSaaS" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "preco" REAL NOT NULL,
    "diasValidade" INTEGER NOT NULL,
    "maxUsuarios" INTEGER NOT NULL DEFAULT 1,
    "descricao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "SolicitacaoLicenca" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nomeTitular" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nomeClinica" TEXT NOT NULL,
    "telefone" TEXT,
    "planoNome" TEXT NOT NULL,
    "diasPlano" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "observacoes" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Licenca" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "token" TEXT NOT NULL,
    "nomeClinica" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "planoNome" TEXT NOT NULL,
    "diasValidade" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "dataInicio" DATETIME,
    "dataExpiracao" DATETIME,
    "ativadaEm" DATETIME,
    "solicitacaoId" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    CONSTRAINT "Licenca_solicitacaoId_fkey" FOREIGN KEY ("solicitacaoId") REFERENCES "SolicitacaoLicenca" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ConfigSistema" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'singleton',
    "licencaAtivaId" TEXT,
    "nomeClinica" TEXT,
    "atualizadoEm" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Licenca_token_key" ON "Licenca"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Licenca_solicitacaoId_key" ON "Licenca"("solicitacaoId");
