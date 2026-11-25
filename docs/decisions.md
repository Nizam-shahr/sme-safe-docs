# Decisions

Record each design decision: date, decision, why, alternatives considered.

## 2026-11-25: Initial stack
- **Decision:** FastAPI + PostgreSQL 16/pgvector with row-level security; Next.js App Router + Tailwind + shadcn/ui; Presidio for PII; providers behind one interface (Foundry, Ollama, Fake).
- **Why:** access control enforced in the database; one database for data and vectors; local-first development; UI kit that uses our own Tailwind tokens.
- **Alternatives:** separate vector database (rejected: second store to secure); Ant Design (rejected: second styling system, admin-dashboard look).
