# 01 — Arquitetura

Monorepo: apps/api (Express/Prisma) + apps/web (Next.js)

Browser -> Next.js (3000) -> Express API (3001) -> PostgreSQL (5432)
                                                 -> Gemini API (externo)

Principios: controllers finos, logica nos services, Zod para validacao,
JWT stateless, Helmet + CORS restrito + rate limiting.
