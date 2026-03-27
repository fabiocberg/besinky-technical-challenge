# Smart To-Do List (AI-Powered)

Aplicação fullstack para gestão de tarefas com criação manual e geração assistida por IA. O projeto foi construído com `NestJS + TypeScript` no backend e `Next.js + TypeScript` no frontend, com persistência em `SQLite`, documentação via `Swagger`, testes unitários no backend e suporte a execução com ou sem Docker.

## Sumário

- [Visão Geral](#visão-geral)
- [Principais Funcionalidades](#principais-funcionalidades)
- [Stack Utilizada](#stack-utilizada)
- [Arquitetura do Projeto](#arquitetura-do-projeto)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Decisões Técnicas](#decisões-técnicas)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Como Rodar Sem Docker](#como-rodar-sem-docker)
- [Como Rodar Com Docker](#como-rodar-com-docker)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Uso da API](#uso-da-api)
- [Swagger](#swagger)
- [Testes](#testes)
- [Tratamento de Erros](#tratamento-de-erros)
- [Segurança e Boas Práticas](#segurança-e-boas-práticas)
- [Trade-offs e Limitações](#trade-offs-e-limitações)

## Visão Geral

O objetivo da aplicação é resolver dois problemas centrais:

1. permitir o gerenciamento simples e confiável de tarefas do dia a dia;
2. transformar um objetivo de alto nível em uma lista acionável de subtarefas usando OpenAI.

O fluxo de IA funciona assim:

1. o usuário informa um objetivo e uma OpenAI API key;
2. o backend envia um prompt estruturado para o modelo;
3. o modelo responde em JSON;
4. o backend valida o payload retornado;
5. as tarefas válidas são persistidas no banco.

Esse desenho mantém a integração pequena, explícita e fácil de evoluir.

## Principais Funcionalidades

- criação manual de tarefas
- listagem de tarefas
- marcar e desmarcar tarefas como concluídas
- remoção de tarefas
- geração de tarefas por IA a partir de um objetivo textual
- persistência local em SQLite
- documentação interativa da API com Swagger
- feedback visual de loading, erro e sucesso no frontend
- atualização de estado sem refresh manual

## Stack Utilizada

### Backend

- `NestJS`
- `TypeScript`
- `TypeORM`
- `SQLite`
- `class-validator`
- `Swagger`
- `Jest`

### Frontend

- `Next.js 15`
- `React 19`
- `TypeScript`
- `CSS Modules`

### Infra

- `Docker`
- `docker compose`

## Arquitetura do Projeto

O projeto foi dividido em duas aplicações independentes:

- `backend/`: API REST responsável por regras de negócio, integração com IA, persistência e documentação
- `frontend/`: interface web responsável pela experiência do usuário

### Backend

O backend segue uma organização modular típica do NestJS, com responsabilidades separadas:

- `tasks`
  - controller: expõe os endpoints REST de tarefas
  - service: concentra a lógica de CRUD
  - dto: valida payloads de entrada
  - entity: representa a estrutura persistida no banco
- `ai`
  - controller: expõe o endpoint de geração por IA
  - service: coordena validação, chamada ao provider e persistência
  - contracts: abstração do provedor de IA
  - providers: implementação concreta para OpenAI
- `common`
  - filtros e comportamento transversal da aplicação

### Frontend

O frontend foi mantido propositalmente simples, com baixo acoplamento:

- `src/components/todo-app.tsx`
  - fluxo principal da interface
  - gerenciamento de estado da tela
  - formulários manuais e de IA
- `src/lib/api.ts`
  - cliente HTTP centralizado e tipado
- `src/types/task.ts`
  - contratos compartilhados da UI

## Estrutura de Pastas

```text
.
├── backend
│   ├── src
│   │   ├── ai
│   │   ├── common
│   │   └── tasks
│   ├── data
│   ├── Dockerfile
│   └── .env.example
├── frontend
│   ├── src
│   │   ├── app
│   │   ├── components
│   │   ├── lib
│   │   └── types
│   ├── Dockerfile
│   └── .env.example
├── docker-compose.yml
└── README.md
```

## Decisões Técnicas

- `SQLite + TypeORM`
  - escolha pragmática para o escopo do desafio
  - setup local simples
  - boa legibilidade e manutenção

- `Provider de IA abstraído`
  - o sistema depende da interface `TaskGenerationProvider`
  - a implementação atual usa OpenAI
  - no futuro, a troca para outro provider pode ser feita sem reescrever o fluxo de aplicação

- `OpenAI API key por request`
  - a chave é recebida apenas na chamada atual
  - não é persistida
  - não fica hardcoded no código

- `JSON Schema na resposta do modelo`
  - reduz ambiguidade
  - melhora previsibilidade da integração
  - simplifica validação do payload retornado

- `Validação em camadas`
  - DTO valida entrada HTTP
  - serviço de IA valida o payload retornado pelo modelo antes de persistir

## Pré-requisitos

Para execução local sem Docker:

- `Node.js 22+`
- `npm 10+`

Para execução com Docker:

- `Docker`
- `docker compose`

## Instalação

Clone ou acesse o repositório atual e instale as dependências de cada aplicação.

### Backend

```bash
cd backend
npm install
```

### Frontend

```bash
cd frontend
npm install
```

## Como Rodar Sem Docker

### 1. Configurar ambiente

Backend:

```bash
cd backend
cp .env.example .env
```

Frontend:

```bash
cd frontend
cp .env.example .env.local
```

### 2. Subir o backend

```bash
cd backend
npm run start:dev
```

Backend disponível em:

- API: `http://localhost:3011`
- Swagger: `http://localhost:3011/swagger`

### 3. Subir o frontend

Em outro terminal:

```bash
cd frontend
npm run dev
```

Frontend disponível em:

- App: `http://localhost:3000`

## Como Rodar Com Docker

Na raiz do projeto:

```bash
docker compose up --build
```

Serviços disponíveis em:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3011`
- Swagger: `http://localhost:3011/swagger`

Para rodar em background:

```bash
docker compose up --build -d
```

Para encerrar:

```bash
docker compose down
```

## Variáveis de Ambiente

### Backend

Arquivo: `backend/.env`

| Variável | Descrição | Exemplo |
|---|---|---|
| `PORT` | Porta HTTP do backend | `3011` |
| `DATABASE_PATH` | Caminho do arquivo SQLite | `data/tasks.db` |
| `FRONTEND_ORIGIN` | Origem liberada para CORS | `http://localhost:3000` |
| `OPENAI_MODEL` | Modelo usado na geração | `gpt-4.1-mini` |

### Frontend

Arquivo: `frontend/.env.local`

| Variável | Descrição | Exemplo |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | Base URL do backend | `http://localhost:3011` |

## Uso da API

### Criar tarefa manual

`POST /tasks`

```json
{
  "title": "Comprar passagens"
}
```

### Listar tarefas

`GET /tasks`

### Atualizar status

`PATCH /tasks/:id`

```json
{
  "isCompleted": true
}
```

### Remover tarefa

`DELETE /tasks/:id`

### Gerar tarefas com IA

`POST /ai/generate-tasks`

```json
{
  "goal": "Planejar uma viagem",
  "apiKey": "sk-..."
}
```

Formato esperado da resposta do modelo:

```json
{
  "tasks": [
    { "title": "Escolher destino" },
    { "title": "Reservar hotel" },
    { "title": "Comprar passagens" }
  ]
}
```

## Swagger

A documentação interativa da API fica disponível em:

- `http://localhost:3011/swagger`

Ela permite:

- visualizar os endpoints
- inspecionar schemas de request e response
- testar a API diretamente pela interface

## Testes

### Backend

Executar testes unitários:

```bash
cd backend
npm test
```

Executar lint:

```bash
cd backend
npm run lint
```

Executar build:

```bash
cd backend
npm run build
```

Os testes cobrem os fluxos principais:

- criação de tarefa
- atualização de status
- geração de tarefas por IA
- tratamento de payload inválido retornado pelo provider

### Frontend

Executar lint:

```bash
cd frontend
npm run lint
```

Executar build:

```bash
cd frontend
npm run build
```

## Tratamento de Erros

O backend retorna erros controlados com `statusCode`, `message`, `path` e `timestamp`.

Casos tratados explicitamente:

- API key ausente
- `goal` vazio
- timeout do provider
- falha de rede
- resposta vazia
- JSON inválido
- payload fora do formato esperado
- tentativa de persistir tarefas vazias
- falhas de banco
- recurso não encontrado

## Segurança e Boas Práticas

- nenhuma API key está fixa no código
- a OpenAI API key não é persistida no banco
- a chave não é usada como configuração global do backend
- os inputs são validados no backend
- a integração com IA não faz logs inseguros contendo segredo
- o provider de IA foi isolado atrás de contrato para reduzir acoplamento

## Trade-offs e Limitações

### Trade-offs

- `TypeORM synchronize` foi usado para simplificar bootstrap local
  - para produção, o ideal seria usar migrations versionadas

- o frontend usa `fetch` e estado local
  - para um sistema maior, valeria introduzir uma camada mais robusta de cache e sincronização

- a integração com OpenAI foi mantida enxuta
  - isso favorece clareza e manutenção, mas não cobre estratégias mais avançadas de retry ou observabilidade

### Limitações atuais

- não há autenticação de usuários
- não há deduplicação de tarefas geradas por IA
- SQLite atende bem ao desafio, mas não é a melhor escolha para cenários de alta concorrência

## Observação Operacional

Neste projeto, o backend foi configurado por padrão na porta `3011`, porque a porta `3001` já estava ocupada no ambiente onde a aplicação foi validada. Se necessário, a porta pode ser alterada nos arquivos de ambiente e no `docker-compose.yml`.
