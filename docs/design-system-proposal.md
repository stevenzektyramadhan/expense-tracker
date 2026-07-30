<!-- Hallmark · pre-emit critique: P5 H5 E4 S5 R5 V5 -->

# kiteCatat design-system proposal

Status: proposal only; no production tokens or components have been implemented  
Design intent: calm, trustworthy, practical, mobile-first, distinctly Indonesian, and fast enough for daily expense entry

## 1. Product voice

kiteCatat should feel like a well-kept personal ledger, not a bank trading terminal and not a generic fintech template. The interface should be friendly without decoration competing with money, dates, and actions.

The system should communicate:

- **calm** through tinted neutral surfaces, restrained borders, and few elevations;
- **trust** through stable layout, explicit money direction, clear errors, and predictable confirmations;
- **speed** through short labels, a strong amount field, recent category shortcuts, and reachable primary actions;
- **local familiarity** through consistent Indonesian language, IDR formatting, and familiar finance terms;
- **clarity** through one dominant value per view rather than a wall of equal cards.

Working internal direction: **Calm Ledger**. This is a design description, not a new product name.

## 2. Design principles

1. **The number leads.** Remaining allowance, expense amount, and period total take precedence over decoration and charts.
2. **One dominant surface.** A route may have one strong overview; secondary values should usually be rows, pairs, or quiet sections rather than more hero cards.
3. **Expense entry is the shortest path.** Amount, category, and save remain visible; optional detail is progressive.
4. **Color has meaning.** Blue is action/navigation, orange is brand character, green is income/success, red is expense/destructive, amber is warning.
5. **Meaning is never color-only.** Signs, labels, icons, and text reinforce every semantic color.
6. **Responsive means rearranged, not duplicated.** The same content/state adapts through CSS; focused table/card or dialog/sheet variants share inputs and callbacks.
7. **Motion explains change.** No decorative bouncing, universal card lift, or repeated scroll reveals.
8. **The installed app is first-class.** Safe areas, offline state, update state, short viewport heights, and touch behavior are part of the system.

## 3. Color system

### Direction

Use a light-first, slightly cool neutral canvas so the existing kiteCatat blue and orange remain recognizable without turning every surface into a gradient. Major authenticated surfaces should be solid. Gradients and glass effects are not part of the base system.

Automatic dark mode should be deferred until every shared component has a complete dark token set. The current split where mobile is dark and desktop/auth are light should not become the permanent system.

### Proposed semantic tokens

Values are implementation starting points and must pass contrast checks in the consuming component. Raw values should exist only in the token declaration; component styles reference token names.

| Token | Proposed value | Role |
| --- | --- | --- |
| `--color-canvas` | `oklch(97.8% 0.006 255)` | Application background |
| `--color-surface` | `oklch(99.2% 0.003 255)` | Primary surface; deliberately off-white |
| `--color-surface-subtle` | `oklch(95.8% 0.009 255)` | Grouping without another card |
| `--color-ink` | `oklch(24% 0.025 255)` | Primary text |
| `--color-ink-muted` | `oklch(50% 0.025 255)` | Secondary text after AA validation |
| `--color-rule` | `oklch(87.5% 0.012 255)` | Borders and dividers |
| `--color-primary` | `oklch(54.6% 0.245 262.9)` | Existing blue identity; primary actions/active navigation |
| `--color-primary-strong` | `oklch(47% 0.22 263)` | Pressed/strong primary state |
| `--color-on-primary` | `oklch(98.5% 0.004 255)` | Text/icon on primary |
| `--color-brand-warm` | `oklch(70.5% 0.213 47.6)` | Existing orange identity; small brand accents only |
| `--color-income` | `oklch(59.6% 0.145 163)` | Incoming money and confirmed success |
| `--color-expense` | `oklch(57.7% 0.245 27.3)` | Outgoing money and destructive actions |
| `--color-warning` | `oklch(66.6% 0.179 58.3)` | Low balance, pending update, or risk |
| `--color-focus` | `oklch(62% 0.19 255)` | Visible keyboard focus ring |

### Usage rules

- Do not use green for neutral decoration; it must continue to mean income/success.
- Do not show an expense amount in green. Use a minus sign or “Pengeluaran” label plus expense treatment.
- Do not use red for a neutral avatar, category, or emphasis.
- Orange is a small brand anchor, not a second primary-action color and not a substitute for warning.
- A category may have a stable categorical marker, but the category name and amount remain visible and chart data has a readable textual equivalent.
- Avoid full-surface blue-to-orange, green, or blue gradients. The wordmark may retain blue/orange text as the existing brand identity.
- Hover, active, focus, disabled, error, and success colors must be tokenized; no one-off hex values inside components.

## 4. Typography and numbers

### Proposed pairing

- **Display and product headings:** Plus Jakarta Sans, upright, weights 600–700.
- **Body, labels, controls, and dense tables:** Geist, weights 400–600.
- **Fallback:** `system-ui`, `Segoe UI`, sans-serif.

Both faces can be self-hosted through `next/font`; no package dependency is required. If build/runtime constraints make the pairing unsuitable, choose another approved self-hosted pair before implementation rather than silently falling back to Arial.

Headings remain roman. Emphasis uses weight, placement, or color—not italic headline words or gradient text.

### Type scale

| Token | Size / line height | Use |
| --- | --- | --- |
| `--text-xs` | 12 / 16 | Supporting metadata only |
| `--text-sm` | 14 / 20 | Labels, secondary actions, dates |
| `--text-body` | 16 / 24 | Forms, descriptions, standard copy |
| `--text-title-sm` | 18 / 24 | Section title, dialog title |
| `--text-title` | 24 / 30 | Route title |
| `--text-amount` | clamp(32, 9vw, 48) / 1.05 | Dominant mobile/desktop amount |
| `--text-report` | 28 / 34 | Desktop report totals |

### Financial figure rules

- Display money with one shared formatter: `id-ID`, `IDR`, `maximumFractionDigits: 0`.
- Use `font-variant-numeric: tabular-nums` for amounts, counts, dates in columns, and report tables.
- Preserve the separate `formatRupiah`/`parseRupiah` input behavior.
- Outgoing values use `−Rp 25.000` or an explicit “Pengeluaran” label; incoming values use `+Rp 25.000` where direction matters.
- Avoid truncating the dominant remaining allowance. Allow wrapping only at safe separators or step the font size down for very large values.

## 5. Spacing, radius, borders, and elevation

### Spacing

Use a 4px base scale with semantic aliases:

| Token | Value | Typical use |
| --- | --- | --- |
| `--space-1` | 4px | Icon/text micro-gap |
| `--space-2` | 8px | Label/control gap |
| `--space-3` | 12px | Compact row padding |
| `--space-4` | 16px | Mobile page gutter and control padding |
| `--space-5` | 20px | Card/section padding |
| `--space-6` | 24px | Section gap |
| `--space-8` | 32px | Desktop section gap |
| `--space-10` | 40px | Major separation only |

Section rhythm should vary by purpose. A route title, dominant overview, transaction list, and report support section should not all receive identical padding.

### Radius

- `--radius-control: 10px` for buttons and inputs;
- `--radius-surface: 14px` for standard surfaces;
- `--radius-prominent: 18px` for the single dominant mobile overview or bottom sheet;
- `--radius-pill: 999px` only for badges/chips, not every button.

The current mixture of small rounded controls and repeated `rounded-3xl` surfaces should converge on this limited scale.

### Borders and elevation

- Use a 1px semantic rule for most grouping.
- Prefer canvas/surface lightness changes over shadows.
- Keep two shadow levels at most: a restrained floating overlay shadow and no/near-zero standard surface shadow.
- Never use colored glow to imply elevation.

## 6. Layout system

### Global frame

- Mobile content gutter: 16px.
- Tablet content gutter: 24px.
- Desktop content gutter: 32px.
- Review/report maximum content width: approximately 1200–1280px.
- Forms use a readable maximum width but remain full-width on small screens.
- `html` and `body` should prevent accidental horizontal overflow using `overflow-x: clip`, not `hidden`, after verifying overlays.
- Image-bearing grid tracks use `minmax(0, 1fr)` and long heading/value containers use `min-width: 0`.

### Breakpoint behavior

- CSS/Tailwind breakpoints control layout and visibility.
- No route waits for `matchMedia` before rendering.
- No API request receives device width as a business input.
- A focused component may use capability/media detection for behavior that CSS cannot express, but it may not own a second fetch/mutation path.

### Mobile navigation and safe areas

- Bottom navigation owns `padding-bottom: env(safe-area-inset-bottom)`.
- Page content reserves the measured navigation height plus safe area.
- Sticky form actions sit above bottom navigation and keyboard-safe space.
- Update/offline banners occupy a defined slot above navigation rather than fixed arbitrary corners.
- Every navigation item has a practical 44×44 target and visible active state with text plus icon.

## 7. Component voice

### Buttons

Variants:

- **Primary:** blue fill; one per local decision area.
- **Secondary:** surface with rule; normal non-destructive alternative.
- **Quiet:** text/icon for low-emphasis actions.
- **Destructive:** red, reserved for confirmed destructive intent.
- **Income action:** normally remains primary blue; green is not required merely because the content is income.

Every interactive component implements default, hover, focus-visible, active, disabled, loading, error, and success states. Focus rings appear instantly and meet contrast requirements. Button labels remain one line; shorten labels or reflow the action group before allowing wrapping.

### Form fields

`FormField` owns:

- programmatic label;
- optional/required indicator;
- help text;
- input/select/textarea association;
- inline error association and `aria-invalid`;
- consistent spacing and control height.

`MoneyField` adds:

- `inputMode="numeric"`;
- large tabular amount display;
- stable `Rp` treatment;
- parsing separate from the submitted numeric value;
- an inline validation region that does not shift the entire page unexpectedly.

### Financial overview

One `FinancialOverview` surface should answer:

- how much remains;
- which period it covers;
- how much was spent today/current period;
- how to add an expense;
- whether the value is stale, loading, failed, or offline.

Base allowance and additional income can appear as a quiet breakdown, not separate competing hero cards.

### Transactions

Shared transaction semantics:

- description/source;
- category/type;
- Indonesian date;
- signed, tabular amount;
- receipt indicator when present;
- edit/delete/detail actions from shared callbacks.

Mobile renders touch-friendly cards/list rows. Desktop renders a denser table or structured list. Both use the same formatter, ordering, filter results, and confirmation flow.

### Categories

- `CategoryBadge` uses stable text plus a subtle marker.
- `CategoryPicker` supports recent/frequent chips when real history exists, the complete select list, and custom category input.
- No generic money-bag emoji.
- Category color is secondary to the category label.

### Empty, error, and skeleton states

- `Skeleton` matches final content geometry and preserves layout.
- `EmptyState` explains absence and offers the next relevant action.
- `ErrorState` never masquerades as an empty/zero value; it names the failed area and provides retry where safe.
- Filter-empty and account-empty are distinct states.
- Loading and errors are announced without excessive live-region repetition.

## 8. Feedback and overlays

| Purpose | Pattern | Rule |
| --- | --- | --- |
| Field validation | Inline message | Bound to the field; persists until corrected |
| Local request failure | Inline error or toast | Use inline if the user must act in the same view |
| Cross-route async result | Toast | Fixed overlay; never shifts layout |
| Offline, syncing, update, degraded service | Banner | Persistent and dismissible only when safe |
| Consequential confirmation | Dialog | Clear object/action/consequence; focus managed |
| Mobile contextual detail | Sheet | Same semantic content/actions as desktop dialog |

Prefer visible state change or quiet confirmation over celebratory success toasts. Do not add optimistic delete/undo until the backend can safely reverse balance changes and receipt effects. Existing expense/income deletion confirmation is retained during the UI migration.

Every dialog and sheet requires:

- `role="dialog"`/appropriate primitive semantics and `aria-modal`;
- title connected as the accessible name;
- initial focus, contained Tab order, and focus restoration;
- Escape behavior when dismissal is safe;
- visible labelled close control;
- backdrop dismissal only when it cannot lose destructive or in-progress work;
- small-height scrolling without hiding the primary action.

## 9. Motion

Suggested tokens:

- `--duration-fast: 120ms`;
- `--duration-base: 180ms`;
- `--duration-slow: 240ms`;
- named ease-out/ease-in/ease-in-out curves.

Rules:

- Animate transform and opacity only.
- Do not animate focus rings.
- Do not apply hover lift to every card.
- Use at most one clear entrance for a route; lists do not repeatedly fade on scroll.
- Loading indicators should not flash for very fast operations.
- Under `prefers-reduced-motion: reduce`, spatial motion becomes an immediate or ≤150ms opacity change.

## 10. Charts and reports

- Category ranking and numbers are primary; charts are secondary.
- Default to ranked rows or horizontal bars for comparison.
- Use a stable, tokenized categorical palette; do not assign meaning solely by slice color.
- Keep category name, amount, percentage, and transaction count in readable text.
- Reserve chart dimensions before a dynamic import resolves.
- Tooltips must supplement, not contain the only version of a value.
- Avoid decorative charts on the dashboard when the same information is clearer as a number or list.

## 11. Page patterns

### Mobile dashboard order

1. Remaining allowance and period.
2. Spending today/current period.
3. Primary “Tambah Pengeluaran” action.
4. Recent transactions.
5. Additional income and secondary monthly analytics.

### Desktop dashboard order

- Compact route header and actions.
- Overview aligned with filter/review controls.
- Dense transaction table/structured list as the main body.
- Secondary metrics available without competing with remaining allowance.

### Add expense

Default visible flow:

1. `Jumlah`.
2. Recent/frequent categories plus `Kategori`.
3. `Simpan Pengeluaran`.

“Detail tambahan” contains date override, description, and receipt. Date remains today by default. Receipt compression, validation, ownership, upload, and submit phases remain unchanged.

### Income

Use the same amount/date/form language as expense entry, while clearly marking incoming direction. Add and edit reuse the same fields and validation owner.

### Summary

Period control, total, ranked categories, and monthly history come before the optional chart. Desktop may show more columns; mobile remains a single scan path.

### Authentication

Use one calm `AuthShell` with solid surface and restrained brand mark. Retain explicit labels, autocomplete, loading state, Supabase errors, reset callback, and session verification. Add accessible password toggles and inline validation without changing security behavior.

## 12. Indonesian product-copy glossary

| Avoid/mixed label | Preferred label |
| --- | --- |
| Home | Beranda |
| Income | Pendapatan |
| Welcome back | Selamat datang kembali |
| Balance | Sisa uang saku |
| Budget | Uang saku |
| Search here | Cari transaksi |
| Transactions | Transaksi |
| Sort by: Latest | Urutkan: Terbaru |
| Refresh | Muat ulang / Perbarui sekarang, depending on action |
| Logout | Keluar |

Use direct sentence case. Avoid exclamation marks in routine success messages. Keep server-safe error messages user-friendly without exposing internals or account existence.

## 13. Accessibility requirements

- WCAG AA contrast for normal use.
- Semantic elements before ARIA.
- Every input has a programmatic label.
- Practical 44×44 minimum touch target.
- Visible, instant keyboard focus.
- Logical DOM/tab order that remains correct when layout changes.
- No essential hover-only controls.
- Error text associated with controls.
- Status and loading announced at an appropriate scope.
- Signed labels/icons reinforce semantic colors.
- Charts always have readable data equivalents.
- Bottom navigation and sticky actions account for safe areas.
- Verify no horizontal scrolling at 320, 375, 414, and 768px as the Hallmark floor, plus project baseline widths.

## 14. PWA and network-state rules

- Offline banner states that current data may be cached/stale.
- Mutating actions fail clearly or are disabled when offline; do not claim background sync or queueing.
- Update banner identifies a new version and offers an explicit safe update action.
- Do not auto-reload while a form has unsaved changes.
- Keep installed navigation reachable at all times.
- Test `100dvh`/short-height behavior without relying on a full-viewport centered layout.
- Never edit generated `public/sw.js` or Workbox output directly; change source configuration/hooks.

## 15. Adoption rules

1. Add tokens and shared primitives first.
2. Migrate one route/feature at a time.
3. Keep old mobile components importable until the replacement passes lint, build, behavior, accessibility, PWA, and viewport checks.
4. Do not introduce page-specific raw colors, fonts, radii, shadows, or chart arrays after tokens exist.
5. A pattern repeated three times should be evaluated for a token or shared component.
6. Do not add a dependency for a component that can be built with React, Tailwind, the installed Lucide icons, and local code.
7. Do not change backend/API/schema/auth/upload behavior to make the visual system easier.
8. Deletions require a separate exact list and explicit approval.

## 16. Non-goals

This proposal does not authorize:

- a route migration;
- a database or Prisma change;
- finance calculation changes;
- Supabase or Cloudinary changes;
- production data changes;
- an offline mutation queue;
- dependency installation;
- deletion of `src/components/mobile` or generated PWA files;
- copying a reference product or replacing kiteCatat’s existing brand identity.

The design system is successful only if it makes the current product easier to use while leaving the trusted finance and security core intact.
