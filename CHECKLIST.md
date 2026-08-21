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
- [x] Inicializar apps/api com Express + TypeScript
- [ ] Configurar Prisma ORM + PostgreSQL
- [ ] Autenticacao JWT
- [ ] Helmet, CORS, Rate Limiting, Zod
- [x] Entidade Equipment
- [x] Entidade Client
- [x] Entidade Rental
- [x] Entidade Maintenance
- [x] Entidade MaintenancePart
- [x] Entidade Insurance
- [x] Entidade Claim
- [x] Entidade User
- [x] Migrations e seed inicial aplicada
- [x] GET /equipment
- [x] POST /equipment
- [x] GET /equipment/:id
- [x] PUT /equipment/:id
- [x] DELETE /equipment/:id
- [ ] Upload de fotos
- [ ] Geracao de QR Code
- [x] POST /rentals/checkout
- [x] POST /rentals/:id/checkin
- [x] GET /rentals
- [x] GET /rentals/equipment/:id
- [x] GET /rentals/client/:id
- [x] POST /maintenance
- [x] PUT /maintenance/:id/service-order
- [x] PUT /maintenance/:id/release
- [x] GET /maintenance/equipment/:id
- [x] GET /financial/equipment/:id
- [x] Calculo ROI e lucro liquido
- [x] Receita perdida por downtime
- [x] GET /metrics/ranking
- [x] GET /metrics/occupancy
- [x] GET /metrics/maintenance-cost
- [x] GET /metrics/roi
- [x] POST /insurance
- [x] GET /insurance/equipment/:id
- [x] POST /insurance/:id/claim
- [x] Alertas de vencimento
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
