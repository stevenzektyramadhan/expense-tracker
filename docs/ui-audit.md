<!-- Hallmark · pre-emit critique: P5 H5 E4 S5 R5 V4 -->

# kiteCatat UI audit

Audit date: 18 July 2026  
Method: Hallmark static audit of the existing Next.js implementation  
Scope: audit and documentation only; no production code, dependencies, routes, generated service-worker assets, or data were changed

## Executive verdict

kiteCatat has a working finance core and several good foundations: API ownership is derived from the authenticated user, expense and income balance changes are transactional, the add-expense submission path is shared across viewports, the summary endpoint aggregates on the server, and the mobile shell accounts for the bottom safe area.

The main UI problem is structural. Dashboard and summary routes wait for JavaScript viewport detection and then select different page trees. The dashboard also changes its expense request based on the viewport, so the split affects behavior as well as presentation. This creates loading gaps, inconsistent filters, duplicated formatting and derived calculations, and a high risk that mobile and desktop fixes continue to drift.

The visual system is also split in two: desktop uses a generic light Tailwind dashboard, mobile uses a dark gradient-card application, and authentication uses a third glass/gradient language. The mobile dashboard puts several equally prominent financial cards before recent transactions, while the fastest recurring task—adding a normal expense—still requires scrolling past optional fields to reach save.

Recommended direction: retain every backend and finance invariant, centralize route data and mutations, then migrate page by page to one responsive component tree. Keep focused presentation variants such as desktop navigation/mobile bottom navigation, transaction table/cards, and dialog/sheet containers. Do not delete the current `src/components/mobile/` implementation until replacement routes have been verified.

## Scope inspected

The audit read the complete implementation for:

- `src/app/(dashboard)` including dashboard, allowance, expense, income, and summary routes;
- every component under `src/components/mobile`;
- `src/hooks/useIsMobile.js`, `useAuth.js`, and `useServiceWorkerUpdate.js`;
- root and authenticated layouts, client providers, global styles, and formatting utilities;
- login, registration, forgot-password, and update-password pages;
- expense detail/edit/image overlays, allowance and income modals, SweetAlert dialogs, native alerts, toasts, loading and empty states;
- PWA manifest, update prompt, Next PWA configuration, safe-area handling, and the absence of offline UI;
- related authenticated API handlers for allowances, expenses, incomes, summary, and uploads;
- Prisma finance relationships and the RLS hardening migration.

No `design.md`, Hallmark CSS stamp, or prior `.hallmark/log.json` exists, so there is no locked Hallmark system or prior Hallmark output to compare against.

## Current responsive architecture

| Area | Shared today | Viewport-specific today | Assessment |
| --- | --- | --- | --- |
| Authenticated shell | `useAuth` and route wrapper | Desktop navbar in `DashboardLayout`; mobile pages wrap themselves in `MobileShell` | Two shell systems and duplicated logout/navigation behavior |
| Dashboard | Allowance/expense/income requests and mutation callbacks live in the route | Entire desktop dashboard vs dynamically imported `MobileDashboard`; desktop modal vs mobile sheet | Full-page branching; derived data and filters drift |
| Add expense | Submission, compression, upload, API call, and route transition are shared in `add/page.js` | Desktop form markup vs `MobileAddExpense` markup | Good shared mutation core, duplicated field state and presentation |
| Income history | Fetch/edit/delete state is shared in one route | Separate desktop and mobile markup | Presentational duplication inside one component; safe to consolidate incrementally |
| Monthly summary | `/api/summary`, selected month, and percentage derivation are shared | Desktop chart/list vs dynamically imported `MobileSummary` | Data source is shared, but whole-page viewport gating and duplicated chart formatting remain |
| Feedback | Global `react-hot-toast` provider | SweetAlert2, native `alert`, custom modals/sheets, inline errors | No consistent purpose or accessibility contract |
| PWA | Manifest, generated service worker, update hook | Mobile bottom navigation handles safe area | No offline/degraded banner; update UI can collide with navigation and auto-reload behavior |

## Ranked findings

The Hallmark count below includes named Hallmark tells and product-specific structural/accessibility tells required by the kiteCatat brief.

### Critical

1. **Tell — Default-attractor sameness / full-page viewport bifurcation**  
   **Where —** `src/app/(dashboard)/page.js:19-25, 35, 298-304, 386-417`; `src/app/(dashboard)/summary/page.js:16, 20, 146-161, 250-263`; `src/hooks/useIsMobile.js:5-25`  
   The route initially renders a loading placeholder, waits for `matchMedia`, and then chooses a separate mobile or desktop page tree. The dynamic mobile imports also opt out of SSR.  
   **Fix —** Render one semantic route tree immediately and use CSS breakpoints for layout; keep viewport logic only inside focused components whose behavior truly cannot be expressed with CSS.

2. **Tell — Business-logic bifurcation by viewport**  
   **Where —** `src/app/(dashboard)/page.js:114-149`; `src/components/mobile/MobileDashboard.js:109-145`; `src/app/(dashboard)/components/DashboardFilters.js:4-29`  
   Desktop requests only the selected month while mobile requests all expenses, then each surface applies a different filter model. “Semua Bulan” on desktop can only filter the already month-limited payload, while mobile can discover all loaded months.  
   **Fix —** Move query scope and filter semantics into one viewport-independent dashboard data hook and make user-selected filters—not device width—control API parameters.

3. **Tell — Forced, non-essential modal gate**  
   **Where —** `src/components/mobile/MobileDashboard.js:56-106`  
   A returning mobile user without `full_name` cannot dismiss the profile prompt with outside click, Escape, or cancel. This blocks the primary financial workflow even though the metadata is not required for a transaction.  
   **Fix —** Preserve the Supabase metadata update but expose it as a dismissible, non-blocking profile prompt after the primary dashboard actions.

4. **Tell — Pure black, pure white**  
   **Where —** `src/app/globals.css:3-25`; representative white surfaces at `src/app/(dashboard)/page.js:330-383`  
   The root system starts at pure white and switches to a near-black OS-dark background, while most route surfaces hard-code their own light or dark colors. This creates a flat base and an incomplete dark-mode contract.  
   **Fix —** Define tinted neutral canvas/surface/ink tokens and either implement dark mode completely or defer automatic switching until every shared component supports it.

5. **Tell — Inter-everywhere (default-font equivalent)**  
   **Where —** `src/app/globals.css:8-12, 22-25`; `src/app/layout.js:1-25`  
   Tailwind tokens reference undefined Geist variables, but the body forces Arial; headings, body, labels, controls, and numbers therefore use one unintentional default stack.  
   **Fix —** Configure one intentional, self-hosted font pairing through `next/font`, expose both through tokens, and give financial figures tabular numerals.

6. **Tell — The AI nav**  
   **Where —** `src/app/(dashboard)/layout.js:41-75`  
   The desktop shell is a generic white bar with a wordmark, four inline links, user email, and a red action at the far edge. It has no route-specific active state and does not express the product’s finance hierarchy.  
   **Fix —** Keep the routes but replace the generic bar with a compact application navigation pattern that clearly marks the current route and prioritizes “Tambah Pengeluaran.”

7. **Tell — Card-in-card**  
   **Where —** `src/app/(dashboard)/summary/page.js:191-227, 232-245`; `src/components/mobile/MobileSummary.js:51-119`  
   Summary content uses a large card containing repeated rounded category rows plus a chart container, adding containment without clarifying the ranking.  
   **Fix —** Use one section surface, render categories as a ranked list with rules/bars, and treat the chart as supporting evidence rather than another nested object.

### Major

1. **Tell — Mid-render token improvisation**  
   **Where —** `src/components/AppClientProviders.js:9-32`; `src/app/(dashboard)/summary/page.js:35-36, 202`; `src/components/mobile/MobileSummary.js:7, 97-105`; widespread Tailwind color literals  
   Brand, semantic, focus, chart, toast, border, radius, and shadow values are independently hard-coded, so the same role changes hue between routes.  
   **Fix —** Introduce named design tokens first and require all shared components and chart series to consume semantic roles.

2. **Tell — The 3-column feature grid (metric-card variant)**  
   **Where —** `src/app/(dashboard)/components/SummaryCards.js:8-48`; used after two other overview cards at `src/app/(dashboard)/page.js:318-355`  
   Three equal icon cards give total, count, and average equal weight after income and allowance surfaces, producing a template-like wall of summaries.  
   **Fix —** Establish one dominant remaining-balance overview, place supporting metrics in a quieter row, and remove decorative card containment where a label/value pair is enough.

3. **Tell — Flat mobile information hierarchy**  
   **Where —** `src/components/mobile/MobileDashboard.js:191-252, 307-343`  
   Greeting, three large gradient cards, and two metric cards precede transaction history; on common phone heights recent activity is pushed well below the first viewport.  
   **Fix —** Order mobile content as remaining balance, spending today, primary add-expense action, recent transactions, then monthly/secondary analytics.

4. **Tell — Wrap-to-two-lines clickable text / overlong primary path**  
   **Where —** `src/components/mobile/MobileAddExpense.js:48-53, 57-155`; `src/app/(dashboard)/add/page.js:149-154, 280-365`  
   Date, description, and receipt are all expanded before the non-sticky action row; long upload/save status labels share half the row with Cancel and can wrap at narrow widths.  
   **Fix —** Keep amount, recent/frequent category, and save in the default path; collapse optional details and keep a one-line primary action reachable above the safe area.

5. **Tell — Mismatched icon sets**  
   **Where —** `src/app/(dashboard)/components/SummaryCards.js:13-40`; `src/components/mobile/icons.js:1-76`; `src/components/mobile/MobileDashboard.js:6-9`; auth pages import Lucide  
   Handwritten SVGs, custom mobile icons, Lucide icons, text glyphs, and emoji all coexist.  
   **Fix —** Standardize on the already-installed Lucide set and reserve custom SVG only for the kiteCatat brand mark.

6. **Tell — Generic emoji as feature icon**  
   **Where —** `src/components/mobile/MobileDashboard.js:324-326`; `src/app/(dashboard)/summary/page.js:167-174, 254-261`  
   A money-bag emoji is repeated for every expense and a platform-dependent chart emoji represents the summary empty state.  
   **Fix —** Use a consistent category icon/marker or typography-led empty state with one Lucide illustration.

7. **Tell — Glassmorphism without purpose**  
   **Where —** `src/app/(auth)/login/page.js:33-35`; `register/page.js:52-54`; `forgot-password/page.js:42-44`; `update-password/page.js:92-94`  
   Every auth page repeats a translucent card, backdrop blur, gradient canvas, strong shadow, and white border even though there is no underlying content whose depth needs communicating.  
   **Fix —** Use one calm auth shell with a solid tinted surface, restrained border, and the same typography and component voice as the application.

8. **Tell — Celebratory success toasts / fragmented feedback**  
   **Where —** `src/app/(dashboard)/page.js:190-224`; `AllowanceModal.js:45-80`; `EditExpenseModal.js:47-49`; `summary/page.js:102-105`; `income/page.js:14-40`; auth routes use `react-hot-toast`  
   Success, validation, deletion, and failure use SweetAlert2, native `alert`, toasts, inline blocks, and custom overlays interchangeably.  
   **Fix —** Assign one pattern per purpose: inline field errors, fixed toast for non-blocking async feedback, banner for persistent system state, and accessible dialog only for consequential confirmation.

9. **Tell — Inaccessible custom dialogs and sheets**  
   **Where —** `ExpenseDetailModal.js:7-60`; `EditExpenseModal.js:54-98`; `ImageZoomModal.js:5-22`; `AllowanceModal.js:83-135`; `income/page.js:42-159`; partial semantics in `MobileExpenseDetailSheet.js:9-86`  
   Desktop overlays lack dialog roles, accessible names, focus containment/restoration, Escape behavior, and reliable close targets; the mobile sheet has a role but no labelled relationship or focus management.  
   **Fix —** Route every modal/sheet through one accessible overlay primitive with labelled title, initial focus, focus trap, Escape policy, visible close control, and focus restoration.

10. **Tell — Hover-only affordances / non-keyboard transaction activation**  
    **Where —** `src/app/(dashboard)/components/ExpenseListItem.js:5-18`  
    A clickable `<li>` signals interaction through cursor and hover but has no button/link semantics, focus state, or keyboard activation.  
    **Fix —** Put the row content in a full-width button with a visible `:focus-visible` state and a clear accessible name.

11. **Tell — Unlabelled filters and weak form associations**  
    **Where —** `DashboardFilters.js:31-65`; `CategorySelect.js:13-27`; `AllowanceModal.js:88-115`; mobile dashboard filters at `MobileDashboard.js:254-304`  
    Several selects rely on option text, search relies on placeholder text, and labels are not bound with `htmlFor`/`id`; compact `py-1` controls are also poor touch targets.  
    **Fix —** Use a shared `FormField` that binds label, control, help, and error IDs and enforces at least a 44px practical control height.

12. **Tell — Spinners that flash / loading-induced layout replacement**  
    **Where —** `src/app/(dashboard)/layout.js:26-36`; dashboard `page.js:298-300`; `add/page.js:265-270`; `summary/page.js:146-151`; `income/add/page.js:115-120`  
    Nested auth, viewport, and data gates replace complete pages with unrelated spinners or “Loading...” text; no route skeleton reserves the final hierarchy.  
    **Fix —** Render stable shell and route skeletons immediately, delay tiny action spinners, and announce longer loading states without replacing navigation.

13. **Tell — Missing mobile error and degraded-network states**  
    **Where —** desktop-only error block at `src/app/(dashboard)/page.js:357-362`; silent income/allowance catches at `page.js:83-91, 166-169`; native summary alert at `summary/page.js:102-105`; no online/offline listener in source  
    Mobile can show empty-looking data after failures, and no route distinguishes offline, server failure, stale cache, or an actual empty account.  
    **Fix —** Add shared retryable error/empty states and a persistent offline/degraded banner; do not claim queued offline mutations.

14. **Tell — Tabular data without tabular-nums / inconsistent Rupiah formatting**  
    **Where —** shared formatter `src/lib/utils.js:3-8`; local formatters in `MobileDashboard.js:13-27`, `MobileSummary.js:7-11`, and `summary/page.js:126-132`; manual prefixes at dashboard `page.js:318-343`  
    Amounts alternate among `Rp10.000,00`, `Rp 10.000`, and manually prefixed locale numbers; columns do not opt into tabular figures.  
    **Fix —** Use one `id-ID` IDR formatter with zero fraction digits and tabular numerals for every display amount while retaining the separate input parser.

15. **Tell — Product language drift**  
    **Where —** `MobileShell.js:22-27`; `MobileDashboard.js:193-250, 261, 307-312`; `UpdatePrompt.js:10-14`; English image alt at `ImageZoomModal.js:9-15`  
    “Home,” “Income,” “Welcome back,” “Balance,” “Budget,” “Search here,” “Transactions,” “Latest,” and “Refresh” appear beside Indonesian finance terminology.  
    **Fix —** Adopt a product copy glossary and make user-facing labels consistently Indonesian.

16. **Tell — PWA update/offline interaction gap**  
    **Where —** `UpdatePrompt.js:4-16`; `useServiceWorkerUpdate.js:4-27`; `MobileShell.js:83, 110-132`; `next.config.mjs:39-44`  
    The update prompt is fixed in the same bottom region as mobile navigation, while `controllerchange` reloads automatically and the button merely reloads the page; there is no unsaved-form warning or offline UI. Event listeners are not cleaned up.  
    **Fix —** Place an accessible update banner above safe-area navigation, coordinate activation/reload explicitly, guard unsaved forms, clean listeners, and add honest online/offline status.

### Minor

1. **Tell — Dead responsive chrome**  
   **Where —** `src/app/(dashboard)/layout.js:10, 77-125`  
   Hamburger state and a mobile dropdown remain inside a navbar hidden for the entire mobile breakpoint.  
   **Fix —** Remove the unreachable branch only after the shared shell replaces it and imports are verified.

2. **Tell — Missing navigation state**  
   **Where —** `src/app/(dashboard)/layout.js:53-67`  
   Desktop links have identical inactive borders and no `aria-current`, making location hard to scan.  
   **Fix —** Derive an active presentation from pathname while preserving semantic links.

3. **Tell — Undersized touch targets**  
   **Where —** `DashboardFilters.js:34-60`; `ExpenseDetailModal.js:12-14`; `ImageZoomModal.js:18-20`; `MobileShell.js:119-127`  
   Several controls rely on glyph size or `py-1` rather than a stable 44px target.  
   **Fix —** Give icon buttons and compact controls a minimum 44×44 interactive box.

4. **Tell — Semantic palette drift**  
   **Where —** category maps in `src/lib/finance.js:12-35`; independent chart arrays in summary page and `MobileSummary.js`; expense amount green at `MobileDashboard.js:332-335`  
   Category and chart colors do not share a mapping, and an outgoing expense is colored green, which normally means income/success.  
   **Fix —** Centralize chart/category roles and pair expense direction with a minus sign, label, and expense color.

5. **Tell — Every section padded the same**  
   **Where —** repeated `p-6`, `p-5`, `rounded-2xl`, and `rounded-3xl` throughout `src/components/mobile`  
   Nearly every mobile group uses the same card padding and large radius, flattening section rhythm.  
   **Fix —** Use a small radius/spacing scale and reserve the largest surface treatment for the dominant overview only.

6. **Tell — Floating-orb decoration**  
   **Where —** `src/components/mobile/MobileDashboard.js:191-200`  
   The greeting ends with an empty gradient circle that has no avatar, status, or action meaning.  
   **Fix —** Remove it or replace it with a real, labelled profile affordance when profile UI exists.

7. **Tell — Installed orientation is unnecessarily fixed**  
   **Where —** `public/manifest.json:5-9`  
   `orientation: portrait` limits tablet/desktop review use in standalone mode without a documented task requirement.  
   **Fix —** Validate standalone behavior first, then consider allowing natural orientation in a dedicated PWA configuration change.

**Summary — 7 critical · 16 major · 7 minor**  
**Verdict — requires structural migration before visual polish; do not redesign by reskinning the existing split trees.**

## Information hierarchy and interaction review

### Dashboard

- Mobile correctly makes remaining budget visually prominent, but then gives additional income, total expense, transaction count, and average nearly equal card prominence before the transaction list.
- “Tambah Pengeluaran” is reachable through bottom navigation, but there is no explicit high-priority action in the overview content. The primary action should remain reachable even when installed and when the software keyboard is not present.
- Desktop puts additional income ahead of remaining allowance and follows it with another allowance card plus three equal summary cards. The user must scan several surfaces to answer “how much is left?”
- Expense values on mobile are shown in green without a minus sign, obscuring money direction.
- The allowance prompt opens automatically when allowance is missing; this is relevant to expense creation, but its loading/error state currently cannot distinguish missing allowance from a failed allowance request.

### Add-expense flow

Strengths to preserve:

- amount defaults to a Rupiah-oriented numeric input;
- date defaults to today;
- receipt compression, upload, server call, and phase labels are shared;
- API creation and allowance deduction remain server-side and atomic.

Friction to remove:

- no recent/frequent category shortcut;
- date, description, and receipt are all expanded by default;
- custom-category input is duplicated rather than shared;
- field errors are toast-only and are not linked to fields;
- save is below all optional details and shares equal width with Cancel;
- no safe retry model is shown when upload succeeds but expense creation fails;
- client accepts any image up to 15MB before compression, while the server accepts JPEG/PNG/WebP up to 5MB—redesign copy must not weaken or misstate server validation.

### Transaction history

- Desktop uses a clickable list rather than the denser table/structured list appropriate for review.
- Mobile cards are visually scannable but repeat a generic emoji, do not constrain long text, and show outgoing amounts with income-like green treatment.
- Desktop and mobile search/filter models differ, and neither communicates result count or active filter summary clearly.
- The existing delete confirmation should remain until a genuinely safe undo transaction exists. Expense and income deletion changes authoritative balances, and receipt cleanup is deliberately fail-closed; Hallmark’s preference for optimistic undo must not override finance and storage safety.

### Monthly summary

- The server aggregation is the correct source of truth and must be preserved.
- Both views include a textual category list, which is an important accessible fallback for the chart.
- Pie slices use an independent positional palette, so category identity can change by month and between mobile and desktop.
- Ranked categories and amounts are more important than the pie chart; a horizontal ranked list/bar presentation would be easier to compare.
- Summary errors use a blocking native alert, while empty states are duplicated and the mobile empty branch does not render `MobileShell`, so it can lose the bottom navigation and dark surface context.

### Authentication

- The four pages repeat nearly identical brand, card, field, icon, and button markup.
- Inputs generally have explicit labels and appropriate autocomplete values—keep these.
- Password visibility buttons lack accessible labels and stable touch-target sizing.
- Validation and server errors appear only in transient toasts rather than being associated with the relevant field/form.
- Auth visual language is unrelated to both the desktop and mobile product shells.
- Supabase behavior, reset callback, session validation, and non-enumerating security posture must remain unchanged.

## Loading, empty, error, offline, and layout-shift inventory

| State | Current behavior | Risk | Target behavior |
| --- | --- | --- | --- |
| Authenticated shell loading | Full-screen spinner, then page | Navigation and page appear late; nested route hooks can repeat the wait | Stable shell skeleton with announced loading region |
| Viewport readiness | Dashboard/summary show placeholder until `matchMedia` runs | Avoidable blank/shift and no SSR mobile content | No page-level viewport gate |
| Dashboard data loading | Text “Loading...” replaces route | No content hierarchy reserved | Dashboard skeleton matching final overview/list geometry |
| Income loading | Text row in each presentation | Duplicate states and possible layout jump | One shared list skeleton rendered responsively |
| Action loading | Immediate spinners/text replacement | Short actions can flash; long labels can wrap | Delayed indicator, disabled state, stable button width, phase text outside narrow label if needed |
| Empty dashboard | Plain text | No next action or distinction from failure | Empty state with add-expense action and clear filter reset |
| Empty summary | Separate desktop/mobile branches | Mobile shell/navigation can disappear | One responsive empty state inside shared shell |
| API failure | Desktop dashboard inline block; mobile mostly silent; summary native alert | Empty-looking finance data can be mistaken for zero | Shared retry state, never silently substitute zero/empty for a failed request |
| Offline | No UI | Mutations fail without context; cached pages may look current | Persistent offline banner; disable or clearly fail mutations; no queue claim |
| PWA update | Fixed bottom-right prompt plus auto controller reload | Navigation overlap and possible unsaved-state loss | Safe-area-aware update banner with explicit activation/reload policy |

No route-level `loading.js`, `error.js`, or `not-found.js` files are present in the audited tree.

## Accessibility priorities

1. Replace clickable non-interactive rows with buttons/links.
2. Consolidate overlays behind an accessible dialog/sheet primitive.
3. Bind every label, hint, and error to its control; add inline validation.
4. Guarantee visible, instant `:focus-visible` rings and 44×44 touch targets.
5. Announce loading, form errors, update availability, and persistent network status appropriately.
6. Do not communicate income/expense/category meaning through color alone.
7. Use tabular numerals and stable alignment for transaction/report figures.
8. Respect `prefers-reduced-motion`; the current source has no reduced-motion policy.
9. Preserve readable text equivalents for every important chart value.
10. Test dialogs and sticky controls at short viewport heights, not only common widths.

## Business-logic duplication and shared-component candidates

### Logic/state to centralize

| Duplication | Current locations | Recommended owner |
| --- | --- | --- |
| Auth session reads/subscriptions | `DashboardLayout`, dashboard, add-expense, summary, add-income via repeated `useAuth()` instances | Authenticated shell/context or server-first route guard, preserving Supabase behavior |
| Expense query/filter/sort semantics | Dashboard route, `DashboardFilters`, `MobileDashboard` | `useDashboardData` plus pure filter/query helpers |
| Dashboard totals and base allowance derivation | Dashboard route and `MobileDashboard` | Pure dashboard selector module fed by shared API data |
| Rupiah display | `utils.js`, dashboard manual prefixes, summary, `MobileDashboard`, `MobileSummary` | One display formatter plus separate input formatter/parser |
| Date/month labels | `utils.js`, `MobileDashboard`, summary endpoint/client | Shared locale display helpers; do not alter stored date/timezone behavior |
| Category selection/custom category | `CategorySelect` and `MobileAddExpense` | Shared `CategoryPicker` receiving value/callbacks |
| Expense amount display state | `add/page.js` and `MobileAddExpense` | One `ExpenseAmountField` or form hook |
| Expense form markup | Desktop add form and `MobileAddExpense` | One `ExpenseForm`; container controls responsive layout |
| Income form markup | Add-income desktop/mobile plus edit modal | Shared `IncomeForm` and amount field |
| Summary percentages/chart data | Summary route component plus mobile render formatting | Shared summary selectors and chart/list adapters |
| Logout | `DashboardLayout` helper and direct Supabase call in `MobileShell` | One shared action passed to presentation navs |
| Toast styling | Global provider plus repeated per-call dark styles | Central toast options and semantic helper |
| Overlay behavior | Five custom overlays plus SweetAlert dialogs | Shared `Dialog`/`Sheet` foundation |

### Shared UI candidates

- `AppShell`, `AppHeader`, `DesktopNavigation`, `MobileBottomNav`;
- `Button`, `IconButton`, `FormField`, `Input`, `Select`, `TextArea`, `MoneyField`;
- `Dialog`, `Sheet`, `ConfirmDialog`, `Toast`, `StatusBanner`;
- `CurrencyAmount`, `CategoryBadge`, `CategoryMarker`, `PeriodLabel`;
- `FinancialOverview`, `MetricPair`, `TransactionSection`, `TransactionCard`, `TransactionTable`;
- `ExpenseForm`, `CategoryPicker`, `ReceiptUploader`, `ExpenseSubmitStatus`;
- `IncomeForm`, `IncomeList`;
- `RankedCategoryList`, optional responsive chart wrapper;
- `Skeleton`, `EmptyState`, `ErrorState`, `OfflineBanner`, `UpdateBanner`.

Device-specific components may remain where they are truly presentational. Desktop navigation and mobile bottom navigation, transaction table and mobile cards, or dialog and bottom sheet may receive the same data and callbacks. They must not own independent fetching, validation, finance calculations, or authorization decisions.

## Locked areas for the redesign

The UI migration must not change:

- existing routes or user flow endpoints;
- API methods, request fields, response shapes, and authenticated-fetch behavior;
- server derivation of the authenticated user and all ownership filters;
- Supabase Auth flows, RLS policies, cookie/bearer validation, or security headers;
- Prisma schema, migrations, production data, or environment variables;
- the finance invariant: stored allowance amount equals base allowance plus linked additional income, and remaining equals that amount minus linked expenses;
- transactionality and insufficient-balance rejection for expense/income/allowance mutations;
- server-side rounding and existing date/timezone semantics;
- Cloudinary secret isolation, upload content/size/type validation, ownership context, or fail-closed receipt deletion;
- `/api/summary` server aggregation and user scoping;
- PWA installability, manifest link, service-worker generation/registration, and generated Workbox files;
- the rule that offline mutations are not promised or queued unless a safe reconciliation system is deliberately added later.

## Audit limitations

This was a code-level Hallmark audit. No authenticated test account was supplied, so no live finance data, screenshot capture, keyboard walkthrough, screen-reader pass, or runtime viewport inspection was performed. The migration plan therefore requires explicit manual checks at 320, 360, 375, 390, 414, 768, 1024, and 1440 CSS pixels before any replacement is considered verified.
