<div align="center">

# FleetFlow (Em construcao)

**Sistema de gestao de frota de veiculos para locacao**

[![License](https://img.shields.io/badge/Licenca-Visualizacao_apenas-red.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?logo=node.js)](https://nodejs.org)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)](https://www.postgresql.org)
[![Gemini](https://img.shields.io/badge/Gemini-3.6_Flash-4285F4?logo=google)](https://aistudio.google.com)

</div>

---

## Sobre o Projeto

FleetFlow e um sistema full-stack de gestao de frota de veiculos para empresas de locacao.
Cobre o ciclo de vida completo de cada veiculo: da aquisicao ao descarte, passando por
locacoes, manutencoes, seguros e analise de ROI.

O sistema inclui rastreamento GPS simulado com mapa interativo, analise preditiva por IA
(Gemini 3.6 Flash), pagina publica via QR Code para operadores de patio e alertas
automaticos de hodometro.

> **Projeto de portfolio** desenvolvido com a mesma seriedade de um produto comercial:
> arquitetura em modulos, documentacao de decisoes tecnicas e dados realistas de demonstracao.

---

## Telas do Sistema

### Painel de Frota
![Painel de Frota](docs/screenshots/01-painel-frota.png)
*Grid visual com fotos reais dos veiculos, badges de status em tempo real e acoes rapidas
de check-in, check-out e manutencao.*

### Mapa da Frota (Telemetria GPS)
![Mapa da Frota](docs/screenshots/02-mapa-frota.png)
*Mapa interativo com posicao de todos os veiculos em Brasilia/DF, alertas de hodometro
e detalhe ao clicar no marker.*

### Metricas e Analise por IA
![Metricas com IA](docs/screenshots/03-metricas-ia.png)
*Gemini 3.6 Flash analisa os dados da frota e entrega recomendacoes estrategicas:
candidatos a baixa, veiculos mais rentaveis e acoes prioritarias.*

### Dashboard Financeiro
![Financeiro](docs/screenshots/04-financeiro.png)
*ROI individual por veiculo com receita total, custo de manutencao, custo de seguro,
lucro liquido e receita perdida por downtime.*

### Pagina Publica via QR Code
![QR Code Publico](docs/screenshots/05-qrcode-publico.png)
*Pagina responsiva acessada via QR Code sem autenticacao: ficha tecnica, status atual
e formulario de abertura de chamado direto do campo.*

---

## Funcionalidades

| Modulo | Descricao |
|--------|-----------|
| Painel de Frota | Grid visual com fotos, badges de status, busca e filtros |
| Check-in / Check-out | Retirada e devolucao de veiculos com registro de condicoes |
| Manutencao | Preventiva e corretiva com OS, pecas, custos e liberacao |
| Financeiro | ROI por veiculo: receita, custos, lucro liquido, downtime |
| Metricas | Rankings, taxa de ocupacao, custo por categoria |
| Telemetria GPS | Mapa interativo, hodometro, alertas e gatilho automatico de OS |
| Seguros | Apolices, sinistros e alertas de vencimento |
| IA (Gemini) | Analise preditiva da frota e recomendacoes estrategicas |
| QR Code | Pagina publica com ficha tecnica e abertura de chamado |
| Upload de Fotos | Galeria por veiculo com visualizacao e remocao |

---

## Stack

**Backend:** Node.js 20 + Express + TypeScript + Prisma 5 + PostgreSQL 16

**Frontend:** Next.js 16 + Tailwind CSS + TypeScript + React Leaflet

**IA:** Google Gemini 3.6 Flash

**Infra:** Docker + Docker Compose

---

## Como rodar localmente

### Pre-requisitos
- Node.js 20+
- Docker e Docker Compose
- gh CLI (para primeiro setup)

### Passos

```bash
# 1. Clone e instale
git clone https://github.com/fernandogrimello/fleetflow.git
cd fleetflow

# 2. Suba o banco
docker-compose up -d postgres

# 3. Configure variaveis de ambiente
cp apps/api/.env.example apps/api/.env
# Edite apps/api/.env com suas credenciais

# 4. Execute as migrations e seed
cd apps/api
npx prisma migrate dev
docker exec -i fleetflow_postgres psql -U fleetflow -d fleetflow_db < prisma/seed.sql

# 5. Inicie os servidores
npm run dev                  # backend na porta 3001
cd ../web && npm run dev     # frontend na porta 3000
```

Acesse: http://localhost:3000

---

## Estrutura do Projeto
fleetflow/
├── apps/
│ ├── api/ # Backend Node.js/Express/Prisma
│ └── web/ # Frontend Next.js
├── docs/
│ ├── screenshots/ # Capturas de tela do sistema
│ └── *.md # Documentacao de arquitetura
├── prisma/ # Schema e migrations
└── docker-compose.yml

---

## Documentacao

| Arquivo | Conteudo |
|---------|----------|
| [01-arquitetura.md](docs/01-arquitetura.md) | Visao geral e decisoes de design |
| [02-banco-de-dados.md](docs/02-banco-de-dados.md) | Modelo de dados e relacionamentos |
| [03-modulos.md](docs/03-modulos.md) | Detalhamento funcional |
| [04-decisoes-tecnicas.md](docs/04-decisoes-tecnicas.md) | ADRs |
| [05-problemas-e-solucoes.md](docs/05-problemas-e-solucoes.md) | Challenges log |

---

## Projetos Relacionados

- [ops-ai-agent](https://github.com/fernandogrimello/ops-ai-agent) — Atendimento via WhatsApp com criacao de tickets (mesma stack)

---

## Licenca

Este repositorio e disponibilizado apenas para visualizacao de portfolio.
Uso, copia ou redistribuicao nao autorizados. Ver [LICENSE](LICENSE).

(c) 2026 Fernando Grimello
