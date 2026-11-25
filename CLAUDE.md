# SafeDocs: Privacy-First AI Workspace for SMEs

> Claude Code reads this file automatically at the start of every session. The day-by-day plan lives in `docs/ROADMAP.md`.

## What we are building
A privacy-first AI workspace for small businesses with no IT team. Staff ask questions about company documents and get **cited answers**, and use AI for everyday writing (emails, summaries, rewrites, proposals and **memos from company templates**), while every request respects the company's policies and roles, even when its files were never labelled or permission-controlled.

SafeDocs **drafts**; people **send**. It never sends, routes or manages memos or emails. Outputs are drafts for human review, exported by copy, .docx/Markdown download, or "open in email". Memo routing and approval belong to the company's own systems (e.g. an EDMS) and are out of scope.

1. **Policy packs:** each SME is configured by a YAML policy pack (roles, document types, sector-specific sensitive data, rules from its procedures). One engine, many businesses.
2. **Suggested labels:** on upload, documents get suggested sensitivity and role labels from the policy pack; the owner approves or corrects them before they become searchable.
3. **Role-based access enforced in the database** with PostgreSQL row-level security (RLS), not only in application code. Even a successful prompt injection cannot reach documents the user may not see.
4. **Personal data (PII) is masked** with Microsoft Presidio before anything reaches the LLM, and restored only for users allowed to see it.
5. **Every query is audited:** who asked, what was retrieved, which model answered, latency and cost.
6. **AI workspace tasks:** draft email, summarise, rewrite, proposal and memo. Each task runs through the same pipeline: mask PII → check task policy for the user's role → (optionally) retrieve approved, RLS-scoped company documents → generate → unmask only what the user may see → audit. Memos and proposals are generated from per-company templates.
7. **Security is tested:** an automated suite of prompt-injection and data-leak attacks runs in CI.
8. **Research experiment:** measure leakage when 5%, 10% and 20% of labels are wrong, with and without safeguards.
9. **Optional FHE experiment:** a Concrete ML sensitivity classifier on encrypted features, benchmarked against the plain version.

Target user story: *"As an HR assistant, I can ask 'what is our parental leave policy?' and get an answer with sources, but I can never see finance documents or salary data, even if I try to trick the assistant. I can also say 'draft a memo to all staff about the new leave policy' and get a draft based on our template and approved policy, which I review and send myself."*

## Tech stack (do not change without asking)
**Backend**
- Python 3.12, FastAPI, Pydantic v2
- PostgreSQL 16 + pgvector via SQLAlchemy 2.x (psycopg 3); Alembic migrations
- Microsoft Presidio + spaCy `en_core_web_lg` for PII
- LLM + embeddings behind one interface `app/llm/provider.py`: `FoundryProvider` (Microsoft Foundry via `azure-ai-projects` + `openai`, Entra ID auth) and `OllamaProvider` (fully local); a `FakeProvider` for tests and CI
- Auth: JWT with a `roles` claim; seeded demo users; no external identity provider
- Tests: pytest, pytest-asyncio, httpx

**Frontend**
- Next.js (App Router) + TypeScript (strict) + Tailwind CSS
- UI components: shadcn/ui (Radix primitives, copied into `components/ui/` and themed with our tokens), `lucide-react` icons, TanStack Table for data tables. No other UI kit.
- Server Components by default; Client Components only where interactivity is needed (`"use client"`)
- Calls the FastAPI backend from server code via `lib/api.ts`; the JWT lives in an **httpOnly, Secure, SameSite=Lax cookie** set by a Next.js route handler, never in localStorage
- Lint/format: ESLint + Prettier; unit tests: Vitest + React Testing Library; end-to-end: Playwright

**Infra:** Docker Compose (db, api, web, optional ollama); GitHub Actions CI. **Optional:** Concrete ML.

## Repository layout
```
safedocs/
  CLAUDE.md
  README.md
  docker-compose.yml
  .env.example
  .claude/settings.json          # Claude Code hooks
  .pre-commit-config.yaml
  .github/workflows/ci.yml
  policy_packs/
    food_retail.yaml             # Brindley Bakeries
    care_home.yaml
    accountancy.yaml
  backend/
    pyproject.toml
    app/
      main.py
      config.py
      auth/        # JWT, password hashing, role dependencies
      db/          # engine, session, models, RLS helpers
      policy/      # policy pack schema + loader
      ingest/      # loaders, chunking
      labels/      # label suggestions + review state
      privacy/     # Presidio masking, encrypted PII vault
      llm/         # provider interface + Foundry/Ollama/Fake
      retrieval/   # RLS-scoped vector search
      rag/         # prompt, answer, citations
      workspace/   # task pipeline: email, summarise, rewrite, proposal, memo
      templates/   # memo and proposal templates per company
      export/      # .docx / Markdown export, mailto drafts
      audit/       # audit logging
      api/         # routers
    alembic/
    tests/
      unit/
      integration/
      security/
    eval/          # quality, cost and mislabelling experiments
  frontend/
    package.json
    app/
      globals.css                # design tokens (see docs/design-system.md)
      layout.tsx                 # fonts via next/font: Inter + Space Grotesk
      page.tsx                   # redirects to /chat or /login
      (auth)/login/page.tsx
      (app)/layout.tsx           # AppShell: sidebar nav + header with role and PII badges
      (app)/chat/page.tsx        # Ask documents
      (app)/workspace/page.tsx   # AI tasks + memo/proposal drafting + export
      (app)/documents/page.tsx   # upload + status table
      (app)/review/page.tsx      # approve suggested labels (management)
      (app)/audit/page.tsx       # audit log (management)
      api/auth/login/route.ts    # sets httpOnly cookie
      api/auth/logout/route.ts
    components/
      ui/                        # Button, Input, Textarea, Select, Card, DataTable, StatTile
      chips/                     # LabelChip, StatusChip, RoleBadge, PiiBadge
      shell/                     # AppShell, SidebarNav, PageHeader
      feedback/                  # Notice (warn / danger / info)
      chat/                      # ChatBubble, SourceCard, QuestionBox
      workspace/                 # TaskPicker, TemplateSelect, DraftEditor, ExportBar
    lib/
      api.ts                     # typed fetch wrapper to FastAPI
      session.ts
    tests/                       # Vitest
    e2e/                         # Playwright
  fhe_experiment/                # optional
  docs/
    ROADMAP.md                   # day-by-day plan (source of truth for daily work)
    progress.md                  # one line per day: what was done
    decisions.md                 # why we chose things
    evidence.md                  # published evidence behind design choices
    architecture.md
    design-system.md             # colours, type, components (frontend source of truth)
    threat-model.md
    evaluation.md
    problem-statement.md
```

## Security rules (critical; never break these)
- **The app connects to Postgres as a NON-superuser role without BYPASSRLS** (`safedocs_app`). Superusers and table owners bypass RLS. Migrations run as `safedocs_owner`.
- Enable RLS **and** `FORCE ROW LEVEL SECURITY` on `documents` and `chunks`.
- Per request, set roles inside the transaction with `SELECT set_config('app.user_roles', :roles, true)`. RLS policies read `current_setting('app.user_roles', true)`.
- Documents with label status other than `approved` are never retrievable.
- Never filter access only in Python. The database is the source of truth.
- Never send raw document text or the raw question to the LLM provider. Always pass through `privacy.mask()` first.
- Never log raw PII. Audit logs store masked text plus chunk IDs.
- Secrets only via environment variables; `.env` is never committed; keep `.env.example` current.
- Frontend: never store tokens in localStorage or expose them to client JavaScript; never render model output as raw HTML.
- The LLM must answer only from the provided context, cite chunk IDs, and say when the context is insufficient.
- Every workspace task is checked against the policy pack's task rules for the user's role BEFORE any model call; blocked tasks never reach the model.
- Workspace outputs are always labelled as drafts. SafeDocs never sends email or routes documents itself.
- Templates are role-scoped like documents (RLS); a user only sees templates their role allows.

## Data model (starting point)
- `users(id, email, password_hash, roles text[])`
- `documents(id, title, source_path, doc_type, allowed_roles text[], sensitivity text, label_status text, suggested_by text, created_at)` where `label_status` is `suggested | approved | rejected`
- `chunks(id, document_id, content_masked text, embedding vector(N), allowed_roles text[], chunk_index int)`
- `pii_vault(id, chunk_id, placeholder, original_value_encrypted bytea)`
- `templates(id, name, kind, allowed_roles text[], body text, fields jsonb, created_at)` where `kind` is `memo | proposal | email`
- `audit_log(id, user_id, task_type, question_masked, retrieved_chunk_ids int[], template_id, model, latency_ms, prompt_tokens, completion_tokens, est_cost_gbp, blocked_reason, created_at)` where `task_type` is `ask | draft_email | summarise | rewrite | proposal | memo`

RLS policy example on `chunks`:
```sql
ALTER TABLE chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE chunks FORCE ROW LEVEL SECURITY;
CREATE POLICY chunks_role_access ON chunks
  FOR SELECT
  USING (allowed_roles && string_to_array(current_setting('app.user_roles', true), ','));
```

## Coding conventions
- Python: type hints everywhere, small functions, docstrings on public functions.
- TypeScript: `strict: true`, no `any`, typed API responses in `lib/api.ts`.
- Frontend styling follows `docs/design-system.md`: token classes only, no raw hex, no emoji, real buttons and labels.
- Every new module gets unit tests; every endpoint gets an integration test; every page gets at least one component test.
- Prefer clear, boring code over clever code. Record design decisions in `docs/decisions.md`.
- When unsure about a requirement, ask instead of guessing.

## Quality guardrails (mandatory)
**Rules for every task**
- Do only today's task from `docs/ROADMAP.md`. Before writing code, state a short plan: files to change, tests to add.
- Write the test FIRST for any security, auth, RLS, PII or label behaviour; show it failing, then make it pass.
- Make the smallest change that solves the task. No speculative features, unused helpers, "future-proofing" abstractions, commented-out code or leftover TODOs.
- Do not add a dependency without asking and explaining why.
- Never weaken, skip or delete a test to make it pass. No `# type: ignore`, `noqa`, `eslint-disable`, `@ts-ignore` or broad `except Exception` without a one-line justification.
- Never invent APIs: check the library's docs or installed source first.
- End every task with a report: files changed, tests added, commands run and results, anything uncertain.

**Automatic checks**
- Backend: `ruff check`, `ruff format --check`, `mypy --strict app`, `vulture app --min-confidence 80`, `pytest --cov=app --cov-fail-under=80`, `bandit -r app`, `pip-audit`
- Frontend: `eslint`, `prettier --check`, `tsc --noEmit`, `vitest run`, `playwright test` (from week 6)
- All run in `pre-commit` and GitHub Actions CI; red CI = do not merge
- Claude Code hook (`.claude/settings.json`): after every file edit, run the fast linter and unit tests for the part of the repo that changed

## Daily workflow and commits
- **One roadmap day = one goal = at least one commit**, pushed the same day.
- Start a session with: *"Read CLAUDE.md and docs/ROADMAP.md. Today is Day N. Do only Day N."*
- Commit messages use **Conventional Commits**: `type(scope): summary`, e.g. `feat(auth): add JWT login with seeded users`. Types: `feat`, `fix`, `test`, `refactor`, `docs`, `build`, `ci`, `chore`. Add `Day N` in the commit body.
- Branch per week (`week-1-setup`), merged to `main` by pull request when CI is green at the end of the week.
- End of day: all checks green → commit → push → add one line to `docs/progress.md`: date, Day N, what was done, what is left.
- If a day's goal is not finished, commit what works (tests green) with `wip` in the body, and finish it the next day before starting the next goal. Never commit failing tests to `main`.
- The human reviews every diff before committing, especially SQL, RLS, auth, PII and cookie code.

## Demo dataset
Fictional SME "Brindley Bakeries Ltd" (Birmingham): ~25 synthetic documents across roles `staff`, `hr`, `finance`, `management` — HR policies, payroll summaries with fake names and NI numbers, supplier contracts, a board memo, plus original memo and proposal templates (staff notice, policy update, leave approval, supplier proposal). All data and templates must be clearly fake and written for this project, not copied from any real company or product.
