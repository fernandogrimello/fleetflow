# FleetFlow — Checklist de Desenvolvimento

## Fase 0 — Fundacao ✅ (13/13)
- [x] Repositorio GitHub criado
- [x] Estrutura de pastas (monorepo apps/api + apps/web)
- [x] README.md com badges e screenshots
- [x] CHECKLIST.md
- [x] docs/ com documentacao de arquitetura
- [x] docker-compose.yml com PostgreSQL 16
- [x] .env.example documentado
- [x] .gitignore configurado
- [x] LICENSE restritiva de portfolio
- [x] Schema Prisma com todas as entidades
- [x] Migrations versionadas
- [x] Seed com dados realistas (10 veiculos, 5 clientes, 18 locacoes)
- [x] Deploy local funcional

## Fase 1 — Backend ✅ (10/10 modulos)
- [x] Auth: register, login, /me com JWT e RBAC (ADMIN/CLIENT)
- [x] Equipment: CRUD, upload de fotos, remocao de foto, QR Code, pagina publica
- [x] Rental: checkout, checkin, calculo automatico de dias e valor, webhook
- [x] Maintenance: agendamento, OS com pecas, liberacao com tecnico responsavel
- [x] Financial: ROI por veiculo (receita, custos, lucro, downtime)
- [x] Metrics: ranking, ocupacao, custo por categoria, ROI ranking
- [x] Insurance: apolices, renovacao, sinistros, alertas de vencimento
- [x] Clients: listagem e cadastro
- [x] AI: analise da frota e previsao de manutencao com Gemini 3.6 Flash
- [x] Telemetry: GPS, hodometro, gatilho automatico de OS, mapa da frota

## Fase 2 — Frontend ✅ (10/10 telas)
- [x] Login com redirect automatico
- [x] Painel de Frota com fotos reais, badges de status, busca e filtros
- [x] Mapa da Frota com Leaflet — markers coloridos, alertas de hodometro
- [x] Locacoes com historico completo
- [x] Manutencao com OS, pecas, custos e liberacao pelo frontend
- [x] Financeiro com ROI individual por veiculo
- [x] Metricas com analise da IA integrada
- [x] Seguros com cadastro, renovacao e alertas por cor
- [x] Clientes com busca, paginacao e cadastro
- [x] Pagina publica via QR Code (mobile-first, sem autenticacao)

## Fase 3 — Testes ✅ (32 testes)
- [x] Jest + Supertest configurados
- [x] auth.test.ts: 8 testes (register, login, /me, token invalido)
- [x] equipment.test.ts: 9 testes (CRUD, RBAC, pagina publica)
- [x] telemetry.test.ts: 5 testes (GPS, validacao, mapa)
- [x] rental.test.ts: 5 testes (checkout, checkin, rejeicoes)
- [x] maintenance.test.ts: 5 testes (agendamento, listagem, liberacao)
- [x] k6 load-test.js: carga com 10 VUs, p95 < 500ms
- [x] k6 stress-test.js: estresse com 80 VUs
- [x] k6 spike-test.js: pico com 100 VUs
- [x] k6 soak-test.js: resistencia com 5 VUs por 14 min
- [x] Playwright auth.spec.ts: 4 testes E2E (redirect, login, rejeicao, logout)
- [x] Playwright dashboard.spec.ts: 6 testes E2E (veiculos, busca, detalhe, mapa, clientes, seguros)
- [x] storageState compartilhado entre testes E2E

## Fase 4 — CI/CD ✅
- [x] GitHub Actions: PostgreSQL, migrations, seed, testes e cobertura
- [x] Badge CI verde no README

## Fase 5 — Portfolio ✅
- [x] README com 8 screenshots reais
- [x] Badge CI verde
- [x] Licenca restritiva
- [x] Seed com dados realistas e datas corretas
- [x] Mascaras de telefone no frontend
- [x] Webhook de notificacao em checkout e checkin
- [x] RBAC Admin/Client com bloqueio 403
- [x] Hodometro com barra de progresso
- [x] QR Code gerado para todos os veiculos
