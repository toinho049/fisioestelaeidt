# 🏥 DomFisio - Sistema de Gestão de Clínicas de Fisioterapia

Uma plataforma SaaS completa para gerenciamento de clínicas de fisioterapia, com suporte a multi-tenant, agendamentos, prontuários, tratamentos e gerenciamento financeiro.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Stack Tecnológico](#stack-tecnológico)
- [Setup e Instalação](#setup-e-instalação)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Módulos Principais](#módulos-principais)
- [Como Funciona](#como-funciona)
- [Autenticação e Segurança](#autenticação-e-segurança)
- [Contas de Demonstração](#contas-de-demonstração)
- [Ideias de Melhorias](#ideias-de-melhorias)

---

## 🎯 Visão Geral

**DomFisio** é um sistema SaaS (Software as a Service) para gerenciamento completo de clínicas de fisioterapia. Oferece:

✅ **Gestão de Pacientes** - Cadastro, histórico e informações de contato  
✅ **Agendamentos** - Calendário integrado com terapeutas  
✅ **Prontuários** - Registros clínicos e notas de evolução  
✅ **Avaliações** - Avaliações iniciais e de acompanhamento  
✅ **Planos de Tratamento** - Definição de objetivos e técnicas  
✅ **Prescrição de Exercícios** - Catálogo e prescrição personalizada  
✅ **Gestão Financeira** - Pagamentos, recebimentos e relatórios  
✅ **Controle de Equipe** - Gerenciamento de terapeutas e permissões  
✅ **SaaS com Licenças** - Ativação de clínicas via tokens

---

## 🛠 Stack Tecnológico

| Camada           | Tecnologia                  |
| ---------------- | --------------------------- |
| **Framework**    | Next.js 16.2.6 (App Router) |
| **Frontend**     | React 19 + TypeScript       |
| **Styling**      | Tailwind CSS 4              |
| **Database**     | SQLite + Prisma ORM         |
| **Autenticação** | NextAuth 4 (JWT)            |
| **Formulários**  | React Hook Form + Zod       |
| **Icons**        | Lucide React                |
| **Datas**        | date-fns                    |

---

## 🚀 Setup e Instalação

### Pré-requisitos

- Node.js 20+
- npm ou yarn

### Passo 1: Clonar e Instalar Dependências

```bash
# Clonar repositório
git clone <seu-repo>
cd fisioestelaeidt-main

# Instalar dependências
npm install
```

### Passo 2: Configurar Variáveis de Ambiente

Criar arquivo `.env` na raiz do projeto:

```env
# Database
DATABASE_URL="file:./prisma/dev.db"

# NextAuth
NEXTAUTH_SECRET="seu-secret-aleatorio-aqui"
NEXTAUTH_URL="http://localhost:3000"
```

### Passo 3: Setup do Banco de Dados

```bash
# Criar/resetar banco e aplicar migrations
npx prisma db push --force-reset

# Popular com dados de demonstração
node seed-data.mjs
```

### Passo 4: Iniciar o Servidor

```bash
npm run dev
```

Acesse: **http://localhost:3000**

---

## 📁 Estrutura do Projeto

```
src/
├── app/                          # Rotas e páginas
│   ├── (sistema)/               # Rotas protegidas (route group)
│   │   ├── dashboard/           # Dashboard com métricas
│   │   ├── pacientes/           # Gestão de pacientes
│   │   ├── agenda/              # Agendamentos
│   │   ├── avaliacoes/          # Avaliações clínicas
│   │   ├── atendimentos/        # Notas de evolução
│   │   ├── planos/              # Planos de tratamento
│   │   ├── exercicios/          # Catálogo de exercícios
│   │   ├── financeiro/          # Gestão financeira
│   │   ├── relatorios/          # Relatórios
│   │   ├── equipe/              # Gestão de terapeutas
│   │   └── layout.tsx           # Layout com sidebar
│   ├── admin/                   # Painel administrativo
│   ├── api/                     # Rotas API
│   ├── login/                   # Página de login
│   ├── cadastro/                # Registro de novas clínicas
│   ├── ativar/                  # Ativação de licenças
│   └── layout.tsx               # Layout raiz
├── lib/
│   ├── prisma.ts               # Singleton do Prisma Client
│   ├── auth.ts                 # Configuração NextAuth
│   └── session.ts              # Utilidades de sessão
├── types/
│   └── next-auth.d.ts          # Type extensions para NextAuth
└── components/
    ├── Sidebar.tsx             # Navegação lateral
    ├── Header.tsx              # Header superior
    └── AuthProvider.tsx        # Provedor de sessão

prisma/
├── schema.prisma               # Definição do banco de dados
└── migrations/                 # Histórico de migrations

.env                            # Variáveis de ambiente
package.json                    # Dependências
tsconfig.json                   # Configuração TypeScript
next.config.ts                  # Configuração Next.js
```

---

## 📦 Módulos Principais

### 1. **Dashboard** 📊

- Métricas principais (total de pacientes, agendamentos hoje, receita mensal)
- Lista de próximos agendamentos
- Atalhos rápidos para funcionalidades principais
- Dados em tempo real via API

### 2. **Gestão de Pacientes** 👥

- Cadastro completo de pacientes
- Campos: nome, CPF, data de nascimento, telefone, email
- Informações de convênio/plano de saúde
- Status ativo/inativo
- Busca e filtros

### 3. **Agendamentos** 📅

- Calendário integrado
- Agendamento com terapeutas
- Status: agendado, confirmado, realizado, cancelado, faltou
- Duração configurável (padrão 50 min)
- Atribuição de sala
- Observações personalizadas

### 4. **Prontuários** 📝

- Registros clínicos por paciente
- Tipos: evolução, retorno, etc.
- Campos: queixa, anamnese, exame, diagnóstico, conduta
- Histórico completo

### 5. **Avaliações** 🔍

- Avaliações iniciais e de acompanhamento
- Campos clínicos abrangentes
- Queixa principal, história da doença
- Exames físicos, testes especiais
- Escala de dor
- Objetivos do tratamento
- Número de sessões previstas

### 6. **Planos de Tratamento** 🎯

- Definição de objetivos curto e longo prazo
- Registro de técnicas e recursos
- Rastreamento de sessões (realizadas vs. total)
- Status: ativo, concluído
- Observações

### 7. **Exercícios** 💪

- Catálogo completo de exercícios
- Descrição, instruções, nível de dificuldade
- Séries, repetições, tempo
- Prescrição personalizada por paciente
- Frequência de prática

### 8. **Gestão Financeira** 💰

- Registro de pagamentos
- Múltiplas formas de pagamento (dinheiro, cartão, PIX, convênio)
- Status: pendente, pago
- Controle de descontos
- Relatório mensal de receita
- Alertas de pagamentos vencidos

### 9. **Equipe** 👨‍⚕️

- Perfil de terapeutas com CREFITO
- Especialidades
- Contato e disponibilidade
- Controle de ativo/inativo

### 10. **SaaS & Licenças** 🔐

- Ativação de clínicas via token
- Workflow de solicitação de licença
- Planos: Solo, Clínica, Enterprise
- Rastreamento de expiração
- Suporte multi-tenant (cada clínica é isolada)

---

## 🔄 Como Funciona

### Fluxo de Autenticação

```
1. Usuário acessa http://localhost:3000
   ↓
2. Se não autenticado → Redireciona para /login
   ↓
3. Usuário faz login com email e senha
   ↓
4. NextAuth valida credenciais com bcryptjs
   ↓
5. JWT token gerado e armazenado
   ↓
6. Redireciona para /dashboard
   ↓
7. Requisições futuras incluem o token na sessão
```

### Arquitetura Multi-Tenant

Cada clínica é completamente isolada:

```
- Todos os dados (pacientes, agendamentos, etc.) são filtrados por clinicaId
- Usuários só acessam dados de sua clínica
- Admin pode acessar painel global de licenças
```

### Fluxo de Ativação de Licença

```
1. Novo usuário acessa /cadastro
   ↓
2. Preenche dados da clínica e do admin
   ↓
3. Sistema gera solicitação de licença (pendente)
   ↓
4. Admin aprova em /admin/solicitacoes
   ↓
5. Token é gerado (ex: DOM-XXXX-XXXX-XXXX)
   ↓
6. Usuário acessa /ativar e insere o token
   ↓
7. Licença é ativada (válida por 90 dias ou conforme plano)
   ↓
8. Clínica agora tem acesso completo ao sistema
```

---

## 🔐 Autenticação e Segurança

- **Estratégia:** NextAuth com JWT (stateless)
- **Duração da Sessão:** 30 dias
- **Hash de Senha:** bcryptjs (10 rounds)
- **Isolamento de Dados:** Filtrado por `clinicaId` em todas as queries
- **Middleware:** Valida `clinicaId` em todas as rotas protegidas
- **Roles:**
  - `superadmin` - Acesso ao painel administrativo global
  - `admin` - Gerenciador da clínica
  - `fisioterapeuta` - Acesso limitado aos pacientes/agendamentos

---

## 👥 Contas de Demonstração

Após executar `node seed-data.mjs`, use:

| Email                       | Senha    | Acesso                     |
| --------------------------- | -------- | -------------------------- |
| **superadmin@domfisio.com** | super123 | /admin (painel admin)      |
| **admin@domfisio.com**      | admin123 | Dashboard da clínica demo  |
| **ana@domfisio.com**        | fisio123 | Dashboard (fisioterapeuta) |

---

## 🚀 Ideias de Melhorias

### Curto Prazo (1-2 semanas)

1. **Validação de Entrada** - Adicionar validação robusta em todos os formulários
2. **Error Handling** - Melhorar tratamento de erros com toasts/notificações
3. **Loading States** - Adicionar spinners e states de carregamento
4. **Paginação** - Implementar paginação nas listas (pacientes, agendamentos, etc.)
5. **Filtros Avançados** - Data range, status, terapeutas nas listas

### Médio Prazo (1 mês)

1. **Exportar Dados** - PDF e CSV dos prontuários, relatórios e agendamentos
2. **Notificações** - Email/SMS para confirmação de agendamentos
3. **Calendário Visual** - Melhoria da visualização do calendário de agendamentos
4. **Backup Automático** - Sistema de backup automático do banco de dados
5. **Auditoria** - Log de todas as alterações (quem, quando, o quê)
6. **Dark Mode** - Suporte a tema escuro

### Longo Prazo (2-3 meses)

1. **Aplicativo Mobile** - React Native para iOS/Android
2. **Integração com Stripe/PayPal** - Pagamento online
3. **Relatórios Avançados** - Gráficos, dashboards personalizáveis
4. **IA para Análise** - Predição de pacientes com risco de desistência
5. **Agendamento Online** - Pacientes agendam via portal público
6. **Videoconsulta** - Integração com Zoom/Google Meet para telemedicina
7. **App para Pacientes** - Acesso a prescrições, evolução, agendamentos

### Técnicas

1. **Testes Automatizados** - Unit, integration e e2e tests
2. **CI/CD Pipeline** - Automatizar deploy com GitHub Actions
3. **Performance** - Otimizar queries, caching, lazy loading
4. **SEO** - Metadados, sitemap para áreas públicas
5. **Internacionalização** - Suporte a múltiplas línguas (EN, ES, etc.)
6. **Documentação API** - Swagger/OpenAPI para integração com terceiros

### Infraestrutura

1. **Migração para PostgreSQL** - Melhor performance em produção
2. **Redis** - Cache e sessões distribuídas
3. **CDN** - Servir assets estáticos
4. **Monitoring** - Sentry para error tracking
5. **Analytics** - Mixpanel/Amplitude para insights de uso

---

## 📖 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento

# Build
npm run build        # Build para produção
npm run start        # Inicia servidor de produção

# Database
npx prisma db push            # Sincroniza schema com banco
npx prisma db pull            # Puxa schema do banco existente
npx prisma migrate dev --name init  # Cria nova migration
npx prisma studio             # Abre Prisma Studio (GUI)

# Seed
node seed-data.mjs   # Popula banco com dados de demo
```

---

## 🔗 Links Úteis

- [Next.js Docs](https://nextjs.org)
- [Prisma Docs](https://www.prisma.io/docs)
- [NextAuth Docs](https://next-auth.js.org)
- [Tailwind CSS](https://tailwindcss.com)
- [React Hook Form](https://react-hook-form.com)

---

## 📝 Licença

Propriedade privada - Todos os direitos reservados.

---

**Desenvolvido com ❤️ para gestão de clínicas de fisioterapia.**
