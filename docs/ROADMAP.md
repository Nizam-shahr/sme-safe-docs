# SafeDocs Roadmap: 35 working days

> Save as `docs/ROADMAP.md`. One day = one goal = at least one commit. Plan for about 2 hours a day, 5 days a week. Start each Claude Code session with:
> *"Read CLAUDE.md and docs/ROADMAP.md. Today is Day N. Do only Day N. Plan first, then tests, then code, then report."*
>
> Each day gets its own branch named after its task: `<type>/day-NN-<short-task>`, e.g. `build/day-02-backend-tooling`, using the same type as the day's commit. Merge it to `main` by pull request when CI is green.
>
> Tick each day when its commit is pushed and CI is green. If a day overruns, finish it before starting the next one; the dates move, the order does not.

---

## Week 1: Setup and quality foundations

- [ ] **Day 1: Repository skeleton**
  - Folders from CLAUDE.md, `.gitignore`, `.env.example`, `README.md` stub (problem statement in 3 lines), `docs/` files with headings only, `docs/progress.md`.
  - Done when: the tree matches CLAUDE.md; no code yet.
  - Commit: `chore: scaffold repository structure`

- [ ] **Day 2: Backend tooling**
  - `backend/pyproject.toml` with FastAPI, pytest, ruff, mypy, vulture, pytest-cov, bandit, pip-audit; minimal `app/main.py`; one trivial test.
  - Done when: every backend check passes locally.
  - Commit: `build(backend): add Python project and quality tooling`

- [ ] **Day 3: Frontend tooling**
  - `create-next-app` with App Router, TypeScript strict, Tailwind, ESLint. It refuses a non-empty folder, so generate it in a temporary folder, move it into `frontend/` and keep our `app/globals.css` (merge, do not overwrite); add Prettier and Vitest with React Testing Library; one trivial component test.
  - Done when: `eslint`, `prettier --check`, `tsc --noEmit`, `vitest run` all pass.
  - Commit: `build(frontend): scaffold Next.js App Router with lint and tests`

- [ ] **Day 4: Pre-commit, CI and Claude Code hook**
  - `.pre-commit-config.yaml`, `.github/workflows/ci.yml` (backend and frontend jobs), `.claude/settings.json` hook running the fast checks after each edit.
  - Done when: a push to GitHub shows a green CI run.
  - Commit: `ci: add pre-commit, GitHub Actions and Claude Code hook`

- [ ] **Day 5: Running stack**
  - `docker-compose.yml` with Postgres 16 + pgvector, API and web; FastAPI `/health`; home page shows API status.
  - Done when: `docker compose up` works and the home page says "API: ok".
  - Commit: `feat(infra): add docker compose stack and health check`

## Week 2: Database, RLS and auth

- [ ] **Day 6: Models and first migration**
  - SQLAlchemy models and Alembic migration for `users`, `documents`, `chunks`, `pii_vault`, `audit_log` (pgvector enabled).
  - Done when: `alembic upgrade head` creates all tables in Docker.
  - Commit: `feat(db): add models and initial migration`

- [ ] **Day 7: Database roles and RLS**
  - Migration creating `safedocs_owner` and `safedocs_app`, grants, RLS + FORCE RLS policies on `documents` and `chunks`, `approved`-only rule.
  - Done when: migration applies cleanly; app connects as `safedocs_app`.
  - Commit: `feat(db): add database roles and row-level security policies`

- [ ] **Day 8: RLS proof tests**
  - Integration tests: an `hr` session cannot select `finance` rows even with raw SQL; unapproved documents are invisible; missing role setting returns nothing.
  - Done when: tests fail with RLS disabled and pass with it enabled.
  - Commit: `test(db): prove RLS blocks cross-role and unapproved access`

- [ ] **Day 9: Login**
  - Password hashing, `/auth/login` issuing a JWT with roles, seed script with one demo user per role.
  - Done when: tests cover valid login, wrong password and expired token.
  - Commit: `feat(auth): add JWT login and seeded demo users`

- [ ] **Day 10: Per-request role context**
  - Dependency that validates the JWT and runs `set_config('app.user_roles', …, true)` in each request's transaction; `/me` endpoint.
  - Done when: an integration test calls the API as `hr` and as `finance` and sees different rows.
  - Commit: `feat(auth): set database role context per request`

## Week 3: Policy packs, ingestion and privacy

- [ ] **Day 11: Policy packs**
  - Pydantic schema and loader for policy pack YAML; `policy_packs/food_retail.yaml` for Brindley Bakeries.
  - Done when: valid packs load; invalid packs fail with clear errors (tests for both).
  - Commit: `feat(policy): add policy pack schema and food retail pack`

- [ ] **Day 12: Loaders and chunking**
  - PDF, DOCX, TXT and Markdown loaders; chunking (~500 tokens, 50 overlap) with document metadata.
  - Done when: unit tests cover each format and chunk boundaries.
  - Commit: `feat(ingest): add document loaders and chunking`

- [ ] **Day 13: PII masking**
  - `privacy.mask()` with Presidio, consistent placeholders (`<PERSON_1>`), UK patterns (NI number, sort code, UK phone) from the policy pack.
  - Done when: tests show seeded PII is masked and normal text is untouched.
  - Commit: `feat(privacy): mask personal data with Presidio`

- [ ] **Day 14: Encrypted PII vault**
  - Store originals encrypted in `pii_vault` (key from env); `unmask()` only for roles allowed to see that document.
  - Done when: tests show allowed roles see originals and other roles see placeholders.
  - Commit: `feat(privacy): add encrypted PII vault and role-aware unmasking`

- [ ] **Day 15: Demo dataset and ingest CLI**
  - Generate the ~25 fake Brindley Bakeries documents; CLI to ingest a folder.
  - Done when: a test confirms no seeded PII value appears in `chunks`.
  - Commit: `feat(data): add fictional demo dataset and ingest command`

## Week 4: Labels and question answering

- [ ] **Day 16: Label suggestions**
  - Suggest `doc_type`, `sensitivity` and `allowed_roles` from policy pack rules (keywords, document types); new documents start as `suggested`.
  - Done when: tests cover each rule in the food retail pack.
  - Commit: `feat(labels): suggest labels from policy pack rules`

- [ ] **Day 17: Upload and review API**
  - Endpoints: upload document, list suggested labels, approve or correct, reject. Only `management` can approve.
  - Done when: integration tests cover the full suggest, approve and search-visibility flow.
  - Commit: `feat(api): add document upload and label review endpoints`

- [ ] **Day 18: LLM providers and embeddings**
  - Provider interface; Foundry (`azure-ai-projects` + `openai`), Ollama and Fake implementations; embed masked chunks and store vectors.
  - Done when: provider tests pass with a fake provider; one manual run with a real provider works.
  - Commit: `feat(llm): add provider interface with Foundry, Ollama and fake providers`

- [ ] **Day 19: Retrieval**
  - RLS-scoped vector search (top-k) on the app connection only.
  - Done when: the same query returns different chunks for `hr` and `finance`.
  - Commit: `feat(retrieval): add RLS-scoped vector search`

- [ ] **Day 20: Ask endpoint**
  - `/ask`: mask question, retrieve, prompt with context-only and citation rules, answer, role-aware unmask, audit log with tokens, latency and cost.
  - Done when: integration tests check citations and the audit record.
  - Commit: `feat(rag): add ask endpoint with citations and audit log`

## Week 5: AI workspace and memo drafting

- [ ] **Day 21: Task rules in the policy pack**
  - Extend the policy pack schema: which task types each role may use (`ask`, `draft_email`, `summarise`, `rewrite`, `proposal`, `memo`), blocked topics, data types that must never be sent to the model, tasks that always produce a "for review" draft.
  - Done when: tests show allowed, blocked and unknown tasks per role.
  - Commit: `feat(policy): add workspace task rules to policy packs`

- [ ] **Day 22: Workspace task pipeline**
  - `/tasks` endpoint: mask input → check task rules → optionally retrieve approved, RLS-scoped documents → generate → role-aware unmask → audit with `task_type`. Implement `draft_email`, `summarise`, `rewrite`.
  - Done when: integration tests show a blocked task never reaches the model, and audit records include task type and blocked reason.
  - Commit: `feat(workspace): add policy-checked AI task pipeline`

- [ ] **Day 23: Templates**
  - `templates` table with RLS by role; loader for company templates; original Brindley Bakeries memo and proposal templates (staff notice, policy update, leave approval, supplier proposal).
  - Done when: tests show roles only see their own templates.
  - Commit: `feat(templates): add role-scoped memo and proposal templates`

- [ ] **Day 24: Memo and proposal drafting**
  - Generate a memo or proposal from a chosen template plus approved company documents, with citations; output always marked "Draft for review".
  - Done when: tests check the template structure is followed, sources are cited, and restricted documents are never used.
  - Commit: `feat(workspace): draft memos and proposals from templates`

- [ ] **Day 25: Export**
  - Export a draft as `.docx` and Markdown, and as an "open in email" link (mailto with subject and body). SafeDocs never sends anything itself.
  - Done when: tests confirm exports contain only what the user may see and no unmasked data the user may not see.
  - Commit: `feat(export): export drafts as docx, markdown and email links`

## Week 6: Frontend

- [ ] **Day 26: Login and session**
  - Set up shadcn/ui (`npx shadcn@latest init`), map its variables to our tokens, add `button input label card`; build `AppShell`.
  - `(auth)/login` page; `api/auth/login` and `logout` route handlers setting an httpOnly cookie; protected `(app)` layout redirecting signed-out users.
  - Done when: component tests and a manual check confirm the cookie is httpOnly and not readable from JavaScript.
  - Commit: `feat(web): add login with httpOnly session cookie`

- [ ] **Day 27: Chat with sources**
  - `(app)/chat`: ask a question, show the answer, citations panel, role badge, "data stayed local" indicator in Ollama mode; loading and error states.
  - Done when: tests cover success, empty and error states, and model output is rendered as text, not HTML.
  - Commit: `feat(web): add chat page with sources and trust signals`

- [ ] **Day 28: Workspace page**
  - `(app)/workspace`: choose a task (email, summarise, rewrite, proposal, memo), pick a template, see the draft in an editable box marked "Draft for review", export buttons (.docx, Markdown, open in email). Blocked tasks show the policy reason.
  - Done when: component tests cover each task type and a blocked task.
  - Commit: `feat(web): add AI workspace page with drafting and export`

- [ ] **Day 29: Upload and review screens**
  - `(app)/documents` upload page; `(app)/review` page to approve or correct suggested labels (management only).
  - Done when: non-management users cannot open the review page.
  - Commit: `feat(web): add document upload and label review screens`

- [ ] **Day 30: End-to-end tests**
  - Playwright: log in → ask → see citations; `hr` user cannot see finance content; draft a memo from a template and export it; approve a document and find it in search.
  - Done when: Playwright runs in CI and passes.
  - Commit: `test(web): add end-to-end tests for key flows`

## Week 7: Security, evaluation and release

- [ ] **Day 31: Prompt-injection tests**
  - 15 cases across chat and workspace tasks: direct injection, role-play, "ignore previous instructions", requests for other roles' data, attempts to unlock blocked tasks.
  - Done when: each test checks retrieval, output and audit log for unauthorised chunk IDs or blocked tasks.
  - Commit: `test(security): add prompt injection test suite`

- [ ] **Day 32: Leak tests and threat model**
  - 15 more cases: instructions hidden in uploaded documents or templates, data exfiltration through "summarise" or "draft email", PII extraction, SQL injection via input, label and template tampering; write `docs/threat-model.md`.
  - Done when: 30+ attacks blocked or documented as known limitations.
  - Commit: `test(security): add data leak tests and threat model`

- [ ] **Day 33: Quality and cost evaluation**
  - 40 question–answer pairs with expected sources, plus 15 workspace tasks scored with a simple rubric (follows template, factually grounded, no leaked data); latency and cost per request for both providers; results in `docs/evaluation.md`.
  - Done when: the results tables are generated by a script, not typed by hand.
  - Commit: `feat(eval): add quality and cost evaluation`

- [ ] **Day 34: Mislabelling experiment**
  - Randomly mislabel 5%, 10% and 20% of documents; measure unauthorised retrievals in chat and workspace tasks, with and without safeguards (PII masking, review of high-sensitivity labels).
  - Done when: results table and short write-up in `docs/evaluation.md`.
  - Commit: `feat(eval): measure leakage under mislabelled documents`

- [ ] **Day 35: Release v0.1.0**
  - README: problem, architecture diagram, demo GIF, how to run, results; add `care_home.yaml` pack; tag `v0.1.0`.
  - Done when: a fresh clone runs with `docker compose up` by following the README.
  - Commit: `docs: complete README and release v0.1.0`

## Optional, after v0.1.0

- **Pilot with a former employer** (after Day 32): installed on their own machine with Ollama, non-personal documents only, free research pilot, data deleted at the end. Check Student visa position with university advisers first.
- **FHE experiment** in `fhe_experiment/`: Concrete ML sensitivity classifier, encrypted vs plain accuracy and latency. Commit: `feat(fhe): benchmark encrypted sensitivity classifier`
- **Accountancy policy pack** and tests. Commit: `feat(policy): add accountancy policy pack`
- **Foundry IQ comparison:** push approved labels into a Foundry IQ knowledge base and rerun the mislabelling experiment against it.
- **Connectors:** read documents from existing systems (an EDMS, SharePoint, Google Drive) instead of manual upload.
- **Live demo deployment** (fake data only). Commit: `ci: deploy demo environment`

## Future work (not in v1)
- An agent that submits approved drafts into a company's own routing system, with enforced human approval and dedicated policy-enforcement testing. SafeDocs v1 only drafts; people send.