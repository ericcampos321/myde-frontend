# Myde Inbox

## Resumo executivo

O Myde Inbox foi desenvolvido como resposta a um desafio técnico com duas frentes complementares: uma interface de inbox em Next.js para atendimento WhatsApp com IA e um backend Node.js para ingestão de webhook, persistência, processamento assíncrono e resposta automatizada com grounding em base de conhecimento. Em vez de tratar frontend e backend como entregas isoladas, o projeto foi estruturado como um fluxo operacional completo de atendimento.

O resultado é uma solução fullstack integrada, com frontend, backend, banco de dados, fila, observabilidade, guardrails de IA e controles de idempotência e isolamento por tenant. A implementação cobre os requisitos centrais do desafio e adiciona hardening onde isso melhora previsibilidade operacional, segurança e facilidade de validação.

## Relação com os dois desafios

O projeto atende diretamente aos dois escopos pedidos:

- **Desafio Frontend**: inbox operacional em Next.js App Router, com lista de conversas, chat, envio, sugestão com IA, estados de loading/erro/vazio, atualização otimista, polling, cache e responsividade.
- **Desafio Backend**: API Node.js/TypeScript com webhook Meta, validação HMAC com corpo cru, persistência relacional, worker assíncrono com Redis/BullMQ, integração com OpenAI, idempotência, multi-tenant, retries e logs estruturados.

Além do escopo mínimo, o projeto incorporou decisões conscientes de **production-readiness**: BFF no frontend, constraints compostas no banco, controle de leitura por operador, auditoria de uso da IA, custo estimado por modelo, sanitização de DTOs e testes além do mínimo pedido.

## Entrega do frontend

O frontend não foi tratado como uma tela estática. A aplicação foi construída em **Next.js App Router** com **TypeScript**, **Tailwind**, **React Query** e uma camada **BFF** em `/api/**`, para que o browser consuma contratos já sanitizados e não dependa diretamente do backend operacional.

Principais entregas do frontend:

- lista de conversas com preview, horário, status da última mensagem e indicador de não lidas;
- tela de chat com histórico, agrupamento visual de mensagens e composer funcional;
- envio de mensagem com atualização otimista;
- sugestão de resposta com IA no composer;
- busca de mensagens por termo e data;
- estados de loading, erro e vazio nas superfícies principais;
- polling moderado e cache com React Query;
- navegação responsiva entre lista, contatos e conversa;
- painel `/ai-usage` para auditoria operacional da LLM.

Em termos de arquitetura, a aplicação separa claramente:

- **rotas BFF** (`app/api/**`);
- **serviços server-side** de integração com o backend;
- **sanitização de DTOs** antes de entregar dados ao browser;
- **hooks de dados** por recurso;
- **componentes de domínio** do inbox;
- **componentes visuais reutilizáveis**.

## Entrega do backend

O backend foi implementado em **Node.js + TypeScript**, usando **Fastify**, **PostgreSQL**, **Drizzle ORM**, **Redis/BullMQ**, **OpenAI** e integração com a **Meta WhatsApp Cloud API**.

Principais entregas do backend:

- recebimento de webhook da Meta com validação de assinatura HMAC;
- persistência de tenants, contatos, conversas, mensagens, estados de leitura e logs de IA;
- webhook rápido, sem chamada à OpenAI dentro do request da Meta;
- enfileiramento assíncrono para processamento de mensagens inbound;
- worker dedicado para processamento, geração com IA e auto-reply quando habilitado;
- envio outbound manual e automático via Meta;
- idempotência para evitar duplicidade em reentregas da Meta e reprocessamento de jobs;
- logs estruturados com contexto operacional.

O desenho segue uma premissa simples: **o webhook recebe, valida, persiste e enfileira; o worker processa**. Isso reduz latência no ponto mais sensível da integração e evita acoplamento entre recebimento de evento externo e chamada de IA.

## Decisões de arquitetura

- **Fastify no backend**: escolhido por baixo overhead, boa performance, validação por schema e arquitetura enxuta.
- **BFF no frontend**: evita expor o backend operacional ao browser e centraliza sanitização de contratos.
- **React Query como estado servidor**: cache, polling, invalidação e mutações sem adicionar uma segunda camada de estado global.
- **BullMQ + Redis**: desacoplamento entre webhook inbound e processamento de IA/outbound.
- **PostgreSQL + Drizzle**: modelo relacional com migrations, constraints e tipagem de schema.
- **Knowledge base local em Markdown**: suficiente para grounding do fluxo atual, sem antecipar infraestrutura maior que o necessário.

O projeto evita complexidade que não é necessária para o estágio atual. Não há event sourcing, arquitetura distribuída artificial ou abstrações pesadas sem retorno prático no desafio.

## Segurança, idempotência e multi-tenant

O backend valida a assinatura da Meta com **corpo cru**, usando `X-Hub-Signature-256` e o segredo configurado no servidor. Esse ponto é importante porque o fluxo depende de confiança no webhook recebido.

A idempotência foi tratada como requisito operacional, não como detalhe opcional:

- mensagens inbound usam `externalMessageId` para evitar duplicidade;
- jobs de fila usam `jobId` estável para evitar reprocessamento redundante;
- o fluxo tolera reentregas da Meta sem duplicar persistência nem efeitos colaterais.

O isolamento multi-tenant é reforçado em mais de uma camada:

- filtros por `tenantId` nas queries operacionais;
- unicidades compostas por tenant;
- foreign keys compostas para impedir relações cruzadas entre tenants;
- resolução do tenant no servidor, em vez de confiar em `tenantId` vindo do client.

## Integração com IA e controle de custo

A integração com IA foi construída sobre dois casos de uso:

- **sugestão manual** para operador no inbox;
- **auto-reply** no worker quando habilitado.

O projeto usa grounding em base de conhecimento, fallback seguro, regras de guardrail e proteção contra prompt injection. O objetivo aqui não foi apenas “chamar a OpenAI”, mas garantir que a resposta seja contextualizada e previsível dentro do domínio do atendimento.

O painel **`/ai-usage`** demonstra controle operacional da LLM:

- chamadas por período;
- tokens de entrada e saída;
- tokens em cache, quando disponíveis;
- duração média;
- bloqueios por guardrail;
- custo estimado por modelo.

Esse custo é **estimado**, não billing real. Ele existe para dar visibilidade de consumo e apoiar decisões operacionais. O painel também foi desenhado para não expor prompt, mensagem sensível, system prompt, token ou segredo.

## Banco de dados e confiabilidade

O banco foi modelado para sustentar o fluxo operacional real do inbox:

- `tenants`
- `whatsapp_contacts`
- `whatsapp_conversations`
- `whatsapp_messages`
- `conversation_read_states`
- `inbox_recent_searches`
- `ai_interaction_logs`

Além das tabelas, a confiabilidade foi reforçada com:

- migrations explícitas;
- índices por tenant, conversa e data;
- constraints compostas para isolamento e integridade;
- suporte a leitura por operador;
- persistência de auditoria de uso da IA.

No backend, a confiabilidade operacional também passa por:

- retry/backoff na fila;
- logs estruturados com `reqId`, `tenantId`, `conversationId`, `messageId` e `jobId`;
- healthcheck e readiness;
- script de checagem de schema local para evitar erro de migration pendente.

## Testes e validações

O projeto possui cobertura acima do mínimo típico de desafio:

- testes unitários;
- testes de integração com banco;
- testes de integração com Redis/fila;
- testes de sanitização e utilitários no frontend;
- validação de typecheck, lint e build.

Comandos principais de validação:

### Backend

```bash
cd myde-backend
npm run db:migrate
npm run check:db
npm run db:seed
npm run typecheck
npm run test
npm run build
```

### Frontend

```bash
cd myde-frontend
npm run typecheck
npm run lint
npm run test
npm run build
```

## Premissas assumidas

- o inbox opera em contexto **tenant-scoped**;
- o backend é a fonte de verdade dos dados operacionais;
- o browser não deve receber DTO cru quando o BFF pode sanitizar;
- o webhook da Meta precisa responder rápido e não deve esperar IA;
- custo da LLM precisa ser visível operacionalmente, mesmo sem billing real;
- guardrails devem bloquear cenários inseguros sem derrubar o fluxo inteiro.

## O que ficou para depois

Os pontos abaixo ficaram conscientemente fora do escopo desta entrega e formam um roadmap natural de evolução:

- separar API e workers em serviços/deploys independentes;
- pipeline completo de produção com migrations controladas, rollback, health checks e smoke tests;
- observabilidade externa com OpenTelemetry/Grafana/Loki/Datadog/Elastic;
- arquivamento completo de conversas;
- painel administrativo para tenants, operadores, permissões, base de conhecimento e limites de IA;
- versionamento da base de conhecimento;
- testes E2E frontend com Playwright;
- retenção/arquivamento de mensagens e logs de IA para alto volume;
- relatórios avançados de custo por tenant/conversa/operador/modelo.

Esses itens não foram omitidos por descuido; foram deixados para uma etapa posterior para manter o escopo atual coeso e demonstrável.

## Como rodar

### Backend

```bash
cd myde-backend
npm install
./scripts/dev/up-infra.ps1
npm run db:migrate
npm run check:db
npm run db:seed
npm run dev
```

Em outro terminal:

```bash
cd myde-backend
npm run dev:worker
```

API local:

```text
http://localhost:8000
```

### Frontend

```bash
cd myde-frontend
npm install
npm run dev
```

Frontend local:

```text
http://localhost:3000
```

Para testar webhook real da Meta em desenvolvimento, um túnel como `cloudflared` pode ser usado apontando para `http://localhost:8000/webhook`.

## Comandos de validação

### Backend

```bash
npm run typecheck
npm run test
npm run build
curl http://localhost:8000/health
curl http://localhost:8000/ready
```

### Frontend

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

## Conclusão

O Myde Inbox entrega o fluxo real de atendimento WhatsApp com IA em uma arquitetura fullstack coerente, validável e preparada para evolução. Os requisitos centrais dos desafios frontend e backend foram atendidos, e os reforços adicionais foram tratados como decisões de engenharia para tornar a solução mais confiável, auditável e próxima de um ambiente de produção.
