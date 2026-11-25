# SafeDocs design system

Source of truth for how the frontend looks. The tokens live in `frontend/app/globals.css`; the reference screens are the "SafeDocs app screens" design (Sign in, Ask, Workspace, Documents, Review, Audit).

## Principles
- Calm and trustworthy: neutral greys, white cards, one green accent.
- Safety is visible: every answer shows sources, every draft says "Draft for review", every block says why.
- No emoji. Icons are inline stroke SVGs (24px grid, 1.8 stroke), from `lucide-react`.

## Typography
| Use | Font | Size / weight |
|---|---|---|
| Page title (h1) | Space Grotesk | 24px / 600 |
| Card title (h2) | Inter | 15–16px / 600 |
| Body | Inter | 15px / 400, line-height 1.5 |
| Meta, hints, table headers | Inter | 12–13px, `text-ink-muted` |
| Login hero | Space Grotesk | 44px / 600 |

Load both with `next/font/google` in `app/layout.tsx` as CSS variables `--font-inter` and `--font-space-grotesk`.

## Colour
- **Brand** `#0B6E5F`: primary buttons, links, active nav. Nothing else is green.
- **Night** `#11161F`: login side panel, the user's chat bubble, role badge, "Open in email" button.
- **Canvas** `#F6F7F9` page, **Surface** `#FFFFFF` cards, **Line** `#E3E6EB` borders.
- **Status:** ok (green), warn (amber), danger (red), each with a soft background.
- **Labels:** each access label has its own colour pair (see tokens). Always show labels with the `LabelChip` component.

## Spacing and shape
- 4px scale. Page padding 28–32px; card padding 18–24px; gaps 8 / 12 / 16 / 20px.
- Radius: 8px controls, 12px cards, 16px login card, full for chips.
- Controls: height 38px (small) / 40–46px (default) / 48px (login button).

## Component library: shadcn/ui
- Install with `npx shadcn@latest init`, then add only what is needed: `button input textarea select label card badge table dialog sonner tooltip`.
- shadcn/ui components live in `components/ui/` and are our code: restyle them with our token classes (e.g. `Button` default variant = `bg-brand hover:bg-brand-hover`), and map shadcn's own CSS variables (`--primary`, `--border`, `--ring` ...) to our tokens in `globals.css`.
- Build SafeDocs components (`LabelChip`, `Notice`, `SourceCard` ...) on top of these primitives, in the folders below.
- Data tables (Documents, Audit): shadcn `table` + TanStack Table.

## Components (`frontend/components/`)
| Component | Variants / notes |
|---|---|
| `Button` | `primary` (brand), `secondary` (white, line-strong border), `dark` (night), `danger` (white, red text). Sizes `sm` 38px, `md` 44px. |
| `Input`, `Textarea`, `Select` | Always with a visible `<label>`. 1px `line-strong` border, 8px radius. |
| `Card` | Surface, 1px line border, 12px radius. |
| `LabelChip` | One per label: public, staff, hr, finance, management. |
| `StatusChip` | approved / awaiting review / labelling / draft / allowed / blocked / no access. |
| `Notice` | `warn` (no access), `danger` (blocked task), `info` (security note). Icon + bold title + one line. |
| `SourceCard` | Citation number, file name, location, label chip. |
| `ChatBubble` | `user` (night, right) and `assistant` (plain text, left). |
| `DataTable` | Subtle header row, uppercase 12px headers, 12px × 16px cells. |
| `StatTile` | Muted caption + 26px display number. |
| `AppShell` | Sidebar 232px (logo, nav, user card) + header (title, subtitle, PII badge, role badge). |
| `RoleBadge`, `PiiBadge` | Header pills. |

## Rules for Claude Code
- Use token classes only (`bg-brand`, `text-ink-muted`, `border-line`); no raw hex in components.
- Every interactive element is a real `<button>`, `<a>`, `<input>` or `<select>` with an accessible name.
- Never render model output as HTML; render as text or sanitised Markdown.
- Each new component gets a Vitest test.
