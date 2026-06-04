# DomFisio

Sistema SaaS multi-tenant para clínicas de fisioterapia. Cada clínica tem seus dados completamente isolados e precisa de uma licença ativa para usar o sistema.

## Stack

- **Next.js 16** + **React 19** + **TypeScript**
- **Tailwind CSS 4**
- **Prisma 5** + **SQLite** (banco local em `prisma/dev.db`)
- **NextAuth v4** (autenticação JWT)
- **bcryptjs**, **Zod**, **React Hook Form**, **date-fns**, **Lucide React**

## Pré-requisitos

- Node.js 18+
- npm

## Como subir o projeto

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
DATABASE_URL="file:C:/Users/SEU_USUARIO/Desktop/estela/prisma/dev.db"
NEXTAUTH_SECRET="qualquer-string-secreta-aqui"
NEXTAUTH_URL="http://localhost:3000"
```

> Ajuste o caminho do `DATABASE_URL` para o caminho absoluto correto na sua máquina.

### 3. Gerar o cliente Prisma e criar o banco

```bash
npx prisma generate
npx prisma db push
```

### 4. Popular o banco com dados iniciais

```bash
npm run seed
```

### 5. Iniciar o servidor de desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

---

## Usuários de teste (após o seed)

| Email | Senha | Perfil | Acesso |
|---|---|---|---|
| `superadmin@domfisio.com` | `super123` | Super Admin | Painel `/admin` |
| `admin@domfisio.com` | `admin123` | Admin | Clínica Demo |
| `ana@domfisio.com` | `fisio123` | Fisioterapeuta | Clínica Demo |

---

## Módulos do sistema

| Módulo | Rota |
|---|---|
| Dashboard | `/dashboard` |
| Agenda | `/agenda` |
| Pacientes | `/pacientes` |
| Atendimentos | `/atendimentos` |
| Avaliações | `/avaliacoes` |
| Planos de tratamento | `/planos` |
| Exercícios | `/exercicios` |
| Equipe | `/equipe` |
| Financeiro | `/financeiro` |
| Relatórios | `/relatorios` |
| Configurações | `/configuracoes` |

---

## Fluxo SaaS

1. **Cadastro** → cria uma nova Clínica + usuário admin → redireciona para `/ativar`
2. **Ativação** → insere o token de licença (formato `DOM-XXXX-XXXX-XXXX`) → sistema liberado
3. **Sem licença** → middleware bloqueia acesso e redireciona para `/ativar`
4. **Painel admin** (`/admin`) → super-admin aprova solicitações e gera tokens de licença

## Scripts disponíveis

```bash
npm run dev      # inicia em modo desenvolvimento
npm run build    # build de produção
npm run start    # inicia o build de produção
npm run seed     # popula o banco com dados iniciais
npm run lint     # verificação de lint
```
