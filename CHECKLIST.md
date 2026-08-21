# FleetFlow — Checklist de Construcao

## Fase 0 — Fundacao
- [x] Criar repositorio no GitHub
- [x] Criar estrutura de pastas
- [x] README completo
- [x] CHECKLIST.md
- [ ] LICENSE (MIT)
- [x] docs/01-arquitetura.md
- [x] docs/02-banco-de-dados.md
- [x] docs/03-modulos.md
- [x] docs/04-decisoes-tecnicas.md
- [x] docs/05-problemas-e-solucoes.md
- [x] docker-compose.yml
- [x] .env.example
- [x] .gitignore

## Fase 1 — Backend (API)
- [ ] Inicializar apps/api com Express + TypeScript
- [ ] Configurar Prisma ORM + PostgreSQL
- [ ] Autenticacao JWT
- [ ] Helmet, CORS, Rate Limiting, Zod
- [ ] Entidade Equipment
- [ ] Entidade Client
- [ ] Entidade Rental
- [ ] Entidade Maintenance
- [ ] Entidade MaintenancePart
- [ ] Entidade Insurance
- [ ] Entidade Claim
- [ ] Entidade User
- [ ] Migrations e seed
- [ ] GET /equipment
- [ ] POST /equipment
- [ ] GET /equipment/:id
- [ ] PUT /equipment/:id
- [ ] DELETE /equipment/:id
- [ ] Upload de fotos
- [ ] Geracao de QR Code
- [ ] POST /rentals/checkout
- [ ] POST /rentals/:id/checkin
- [ ] GET /rentals
- [ ] GET /rentals/equipment/:id
- [ ] GET /rentals/client/:id
- [ ] POST /maintenance
- [ ] PUT /maintenance/:id/service-order
- [ ] PUT /maintenance/:id/release
- [ ] GET /maintenance/equipment/:id
- [ ] GET /financial/equipment/:id
- [ ] Calculo ROI e lucro liquido
- [ ] Receita perdida por downtime
- [ ] GET /metrics/ranking
- [ ] GET /metrics/occupancy
- [ ] GET /metrics/maintenance-cost
- [ ] GET /metrics/roi
- [ ] POST /insurance
- [ ] GET /insurance/equipment/:id
- [ ] POST /insurance/:id/claim
- [ ] Alertas de vencimento
- [ ] Integrar Gemini API
- [ ] Previsao de proxima manutencao
- [ ] Candidatos a baixa

## Fase 2 — Frontend (Web)
- [ ] Inicializar apps/web com Next.js 14 + Tailwind CSS
- [ ] Layout base (sidebar, header, auth)
- [ ] API client
- [ ] Grid visual de frota com badges
- [ ] Filtros por status e categoria
- [ ] Modal de detalhe do equipamento
- [ ] Listagem e busca de equipamentos
- [ ] Formulario de cadastro e edicao
- [ ] Pagina publica de QR Code
- [ ] Formulario de check-out com fotos
- [ ] Formulario de check-in com avaliacao
- [ ] Historico de locacoes
- [ ] Agendamento de manutencao
- [ ] Ordem de servico
- [ ] Historico de manutencoes
- [ ] Dashboard de ROI
- [ ] Graficos de ocupacao e receita
- [ ] Rankings de uso

## Fase 3 — Testes
- [ ] auth.test.ts
- [ ] equipment.test.ts
- [ ] rental.test.ts
- [ ] maintenance.test.ts
- [ ] insurance.test.ts
- [ ] metrics.test.ts
- [ ] ai.service.test.ts
- [ ] contract.test.ts
- [ ] security.test.ts
- [ ] components.test.tsx
- [ ] auth.spec.ts
- [ ] dashboard.spec.ts
- [ ] equipment.spec.ts
- [ ] rental.spec.ts
- [ ] load-test.js
- [ ] stress-test.js
- [ ] spike-test.js
- [ ] soak-test.js

## Fase 4 — CI/CD
- [ ] GitHub Actions CI backend
- [ ] GitHub Actions CI frontend
- [ ] Badge CI no README
- [ ] Staging (opcional)

## Fase 5 — Portfolio
- [ ] Screenshots reais no README
- [ ] GIF/video demo
- [ ] Documentacao finalizada
- [ ] README com metricas de cobertura

## Progresso Geral

| Fase         | Status        | Concluido |
|--------------|---------------|-----------|
| 0 Fundacao   | Em andamento  | 12 / 13   |
| 1 Backend    | Nao iniciado  | 0 / 38    |
| 2 Frontend   | Nao iniciado  | 0 / 18    |
| 3 Testes     | Nao iniciado  | 0 / 18    |
| 4 CI/CD      | Nao iniciado  | 0 / 4     |
| 5 Portfolio  | Nao iniciado  | 0 / 4     |

Total: 12 / 95 tarefas concluidas
