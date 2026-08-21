# FleetFlow

Sistema de gestao de frota de equipamentos para locacao.

[![CI](https://github.com/fernandogrimello/fleetflow/actions/workflows/ci.yml/badge.svg)](https://github.com/fernandogrimello/fleetflow/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933)](https://nodejs.org)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6)](https://www.typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791)](https://www.postgresql.org)

## Sobre o Projeto

Sistema full-stack para gerenciamento de frota de equipamentos fisicos.
Cobre todo o ciclo de vida: Compra, Seguro, Locacao, Manutencao e Analise de ROI.

## Stack

- Backend: Node.js 20 + Express + TypeScript + Prisma + PostgreSQL 16
- Frontend: Next.js 14 + TypeScript + Tailwind CSS
- IA: Google Gemini API
- Testes: Jest + Supertest + Playwright + k6
- Infra: Docker + GitHub Actions

## Como rodar

    git clone https://github.com/fernandogrimello/fleetflow.git
    cd fleetflow
    cp .env.example .env
    docker-compose up -d postgres
    npx prisma migrate dev
    npm run dev:api
    npm run dev:web

## Projetos Relacionados

- ops-ai-agent: https://github.com/fernandogrimello/ops-ai-agent

## Licenca

MIT (c) Fernando Grimello
