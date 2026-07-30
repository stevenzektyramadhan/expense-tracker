<!-- Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V4 -->

# Responsive migration plan

Status: Phases 1–9 implemented; cleanup approval pending
Goal: move kiteCatat to one responsive source of truth without changing routes, backend contracts, finance behavior, authentication, ownership, uploads, or PWA installability

## 1. Current behavior

The authenticated layout renders a desktop-only top navigation. Mobile pages independently wrap content in `MobileShell`, which provides a separate header, logout action, dark theme, and bottom navigation.

Dashboard and summary routes call `useIsMobile()` and delay rendering until the client viewport is known. They then choose full mobile or desktop page trees. On the dashboard, viewport width also changes the expense request: desktop sends current-month date boundaries while mobile fetches all expenses. Both views then implement additional filters and derived totals.

Add-expense and income routes are safer starting points because their mutations already live above the presentation split. Their desktop and mobile markup is duplicated, but they share submission callbacks. The migration must preserve these working cores while removing duplicated field and state ownership.

## 2. Target behavior

- One authenticated application shell owns auth gating, logout, header, content spacing, persistent status UI, and responsive navigation.
- One route tree renders immediately at every width; layout changes through CSS/Tailwind breakpoints.
- One hook or route owner performs each fetch/mutation and provides shared state, selectors, and callbacks.
- One filter model controls API query scope and local filtering; device width never changes business behavior.
- Focused presentation variants remain allowed:
  - desktop navigation and mobile bottom navigation;
  - transaction table/structured list and mobile transaction cards;
  - desktop dialog and mobile sheet, if both receive the same state and callbacks;
  - chart sizing or secondary control density.
- The default mobile expense path is amount → recent/frequent category → save. Date defaults to today; notes and receipt move under “Detail tambahan.”
- Loading, empty, error, offline, update, and mutation states are shared and rendered responsively.
- Existing mobile components remain in the repository until replacements are verified and deletion is separately approved.

## 3. Invariants that must remain true

### Routes and contracts

- Preserve `/`, `/add`, `/allowance`, `/income`, `/income/add`, `/summary`, all auth routes, and all current API routes.
- Preserve request and response shapes for allowances, expenses, incomes, summary, upload, and auth callback.
- Continue using `authenticatedFetch` for authenticated client API requests.

### Finance and ownership

```text
allowances.amount = base allowance + total linked additional incomes
allowances.remaining = allowances.amount - total linked expenses
```

- The server derives `user_id`; the client never supplies trusted ownership.
- Expense creation/update/deletion and income creation/update/deletion retain transactional balance updates.
- Insufficient-balance and too-small-allowance rejection remain server-authoritative.
- The client never becomes authoritative for `remaining`, `allowance_id`, ownership, or authorization.
- `/api/summary` remains the authoritative aggregated report source.

### Auth, storage, and PWA

- Preserve Supabase Auth flows, RLS defense in depth, cookie/bearer validation, and safe auth error behavior.
- Preserve receipt compression behavior, authenticated upload, Cloudinary secret isolation, type/content/size validation, ownership context, and fail-closed deletion.
- Preserve CSP/security headers, manifest metadata unless a dedicated reviewed PWA change approves otherwise, and generated Workbox files.
- Do not claim or implement offline mutation queuing during this migration.
- Preserve existing date storage and timezone behavior; only presentation formatting may be centralized.

## 4. Shared logic versus device-specific presentation

| Responsibility | Must be shared | May differ by device |
| --- | --- | --- |
| Authentication | Session source, redirect rules, logout action, errors | Placement of logout control |
| Dashboard data | Allowance, expenses, incomes, query parameters, retry | Grid density and section placement |
| Finance display derivation | Period totals, base allowance, remaining display, transaction average | Font size and compactness |
| Expense mutations | Validation model, compression/upload, POST/PUT/DELETE, submit phases | Page/dialog/sheet container |
| Filters | Values, options, query meaning, result set, reset | Inline desktop toolbar vs mobile filter sheet |
| Transactions | Data, formatters, edit/delete/select callbacks, confirmation | Table/structured list vs cards |
| Summary | Selected period, API response, category ranking, percentages | Chart size and control density |
| Feedback | Semantic state and message | Toast position or banner layout |
| Overlays | Accessible name, focus lifecycle, dismissal rules | Centered dialog vs bottom sheet geometry |
| Navigation | Route map, active route, signout callback | Desktop navigation vs mobile bottom navigation |

No device-specific component may independently fetch, validate, mutate, calculate balances, or authorize access.

## 5. Proposed target organization

This is an incremental destination, not permission to move every file at once.

```text
src/
  features/
    dashboard/
      DashboardPage.js
      FinancialOverview.js
      RecentTransactions.js
      DashboardSkeleton.js
      dashboardSelectors.js
      useDashboardData.js
    expenses/
      ExpenseForm.js
      ExpenseAmountField.js
      CategoryPicker.js
      ReceiptUploader.js
      useExpenseForm.js
    transactions/
      TransactionSection.js
      TransactionCard.js
      TransactionTable.js
    income/
      IncomeForm.js
      IncomeList.js
    reports/
      MonthlySummary.js
      RankedCategoryList.js

  components/
    ui/
      Button.js
      FormField.js
      Dialog.js
      Sheet.js
      EmptyState.js
      ErrorState.js
      Skeleton.js
      StatusBanner.js
    navigation/
      AppShell.js
      AppHeader.js
      DesktopNavigation.js
      MobileBottomNav.js
```

Existing files may be adapted in place when moving them would add risk. New feature folders should be introduced only for the phase actively being migrated.

## 6. Phased migration

### Phase 0 — Audit and behavior contract

Status: completed by this documentation task.

Files created:

- `docs/ui-audit.md`
- `docs/design-system-proposal.md`
- `docs/responsive-migration-plan.md`

Actions:

- Record current mobile/desktop behavior, UI states, API calls, and locked invariants.
- Treat the current mobile directory as legacy migration input, not deletion scope.
- Establish manual baseline scenarios before code changes.

Validation:

- Review the three documents against `AGENTS.md`.
- Confirm `git diff` contains documentation only.

Rollback:

- Documentation can be revised or removed without affecting runtime behavior.

### Phase 1 — Tokens and state primitives

Purpose: create a small shared foundation before changing page composition.

Files to create:

- `src/components/ui/Button.js`
- `src/components/ui/FormField.js`
- `src/components/ui/EmptyState.js`
- `src/components/ui/ErrorState.js`
- `src/components/ui/Skeleton.js`
- `src/components/ui/StatusBanner.js`
- `src/components/finance/CurrencyAmount.js`

Files to modify:

- `src/app/globals.css`
- `src/app/layout.js`
- `src/components/AppClientProviders.js`
- `src/lib/utils.js`

Actions:

- Add semantic color, type, spacing, radius, border, focus, elevation, motion, and chart tokens.
- Configure the approved self-hosted font pairing through `next/font`; do not add a package.
- Make `formatCurrency` the sole display formatter for IDR with zero fraction digits and tabular numeral support in `CurrencyAmount`.
- Keep `formatRupiah`/`parseRupiah` as input helpers; do not conflate input and display formatting.
- Add accessible shared primitives without switching routes wholesale.

Invariants:

- No API, route, auth, database, upload, or finance changes.
- Existing components continue to render if the new primitives are removed.

Validation:

- `npm run lint`
- `npm run build`
- Component state checks: default, hover, focus-visible, active, disabled, loading, error, success.
- Contrast checks for brand, expense, income, warning, focus, text, and muted text.

Rollback:

- New primitives are additive; revert their first consumers and remove only after imports are gone.

### Phase 2 — Shared application shell

Purpose: unify navigation, route spacing, auth loading, and persistent status placement while retaining focused desktop/mobile navigation variants.

Files to create:

- `src/components/navigation/AppShell.js`
- `src/components/navigation/AppHeader.js`
- `src/components/navigation/DesktopNavigation.js`
- `src/components/navigation/MobileBottomNav.js`

Files to modify:

- `src/app/(dashboard)/layout.js`
- `src/components/mobile/MobileShell.js`
- `src/components/UpdatePrompt.js`
- `src/hooks/useServiceWorkerUpdate.js`

Actions:

- Centralize route map, active-state logic, signout callback, header, content width, safe-area spacing, and bottom-navigation reservation.
- Render desktop navigation and mobile bottom navigation as CSS breakpoint variants receiving shared routes/callbacks.
- Convert `MobileShell` into a compatibility wrapper so legacy imports remain valid while shell ownership moves to the authenticated layout.
- Keep auth guard behavior and redirect destination unchanged.
- Give update UI a safe-area-aware slot above bottom navigation and clean service-worker listeners.

Invariants:

- Navigation URLs and logout behavior remain unchanged.
- Installed navigation stays reachable.
- Legacy mobile pages remain functional and are not deleted.

Validation:

- Login/logout and unauthenticated redirect.
- Active navigation at `/`, `/add`, `/income`, `/income/add`, and `/summary`.
- Keyboard navigation, focus visibility, and 44px touch targets.
- Standalone safe-area checks at 320, 375, 390, and 414 widths.
- `npm run lint`; `npm run build`.

Rollback:

- Restore the current dashboard layout and original `MobileShell`; additive navigation components can remain unused.

### Phase 3 — Centralize dashboard data and selectors

Purpose: remove viewport-dependent query behavior before changing dashboard markup.

Files to create:

- `src/features/dashboard/useDashboardData.js`
- `src/features/dashboard/dashboardSelectors.js`

Files to modify:

- `src/app/(dashboard)/page.js`
- `src/app/(dashboard)/components/DashboardFilters.js`
- `src/components/mobile/MobileDashboard.js`

Actions:

- Move allowance, expense, and income requests; loading/error/retry state; filter state; and refresh callbacks into one hook.
- Move period totals, base allowance, average transaction, filter, search, and sort operations into pure selectors.
- Remove `isMobile` from request construction.
- Initially use the existing unfiltered `GET /api/expenses` response as the shared dataset so mobile’s all-month capability is retained and desktop’s visible default remains current month through the shared filter.
- Measure large-history payload behavior. If it is unacceptable, use existing `/api/summary` month metadata plus existing expense date-range parameters in a later backward-compatible optimization; do not silently create a viewport-specific shortcut.
- Pass the same filter state, results, totals, errors, and callbacks to both legacy presentations during this phase.

Invariants:

- Current visible default periods and filter labels remain unchanged.
- No authoritative balance is recalculated or written on the client.
- Allowance errors are not treated as “missing allowance.”

Validation:

- Compare legacy mobile and desktop values for the same account and filter.
- Test current month, all months, category, search, every sort option, empty results, and retry.
- Verify no duplicate requests are created by rendering both presentations.
- `npm run lint`; `npm run build`.

Rollback:

- The route can switch back to its local request functions while pure selectors remain unused.

### Phase 4 — Unified responsive dashboard

Purpose: replace the full-page branch with one semantic dashboard tree.

Files to create:

- `src/features/dashboard/DashboardPage.js`
- `src/features/dashboard/FinancialOverview.js`
- `src/features/dashboard/RecentTransactions.js`
- `src/features/dashboard/DashboardSkeleton.js`
- `src/features/transactions/TransactionSection.js`
- `src/features/transactions/TransactionCard.js`
- `src/features/transactions/TransactionTable.js`

Files to modify:

- `src/app/(dashboard)/page.js`
- `src/app/(dashboard)/components/ExpenseDetailModal.js`
- `src/components/mobile/MobileExpenseDetailSheet.js`

Files retained unchanged or as compatibility input:

- `src/components/mobile/MobileDashboard.js`
- `src/app/(dashboard)/components/SummaryCards.js`
- `src/app/(dashboard)/components/ExpenseListItem.js`

Actions:

- Make the route a thin entry to `DashboardPage` and render one overview, action, filter, and transaction section tree.
- Mobile order: remaining allowance → spending today → add expense → recent transactions → secondary totals/income.
- Desktop layout: denser review layout with overview and controls alongside a structured transaction table/list.
- Feed transaction card/table variants the same results and callbacks.
- Consolidate expense details behind one state owner. A dialog and sheet may remain focused geometry variants, but focus, labels, actions, and data stay shared.
- Remove dashboard dependency on `useIsMobile`; do not delete the hook yet because summary may still use it until Phase 7.

Invariants:

- Edit/delete/select/zoom behavior and confirmations remain available.
- Delete remains confirmed until a server-safe undo exists.
- No old mobile file is deleted.

Validation:

- Dashboard data parity against Phase 3 baseline.
- Long name, long description, large IDR amount, no allowance, no expenses, API error, retry, and slow network.
- Keyboard activation for every transaction and overlay.
- No horizontal overflow at 320/360/375/390/414/768/1024/1440.
- `npm run lint`; `npm run build`.

Rollback:

- Repoint the route to the legacy desktop/mobile render block; the new feature components are additive.

### Phase 5 — Unified expense form

Purpose: preserve the existing mutation/upload core while making the common mobile path achievable in under 10 seconds.

Files to create:

- `src/features/expenses/useExpenseForm.js`
- `src/features/expenses/ExpenseForm.js`
- `src/features/expenses/ExpenseAmountField.js`
- `src/features/expenses/CategoryPicker.js`
- `src/features/expenses/ReceiptUploader.js`

Files to modify:

- `src/app/(dashboard)/add/page.js`
- `src/app/(dashboard)/components/CategorySelect.js`

Files retained:

- `src/components/mobile/MobileAddExpense.js`

Actions:

- Move amount display, category/custom category, date, description, receipt, validation, submit phase, and retry state into one form hook.
- Render one form tree at all widths.
- Make amount the first/strongest field; expose recent/frequent category chips only when based on real user data.
- Keep date defaulted to today.
- Move date override, notes, and receipt under “Detail tambahan,” while preserving the complete payload.
- Keep the primary submit action above the bottom safe area on small screens; Cancel remains secondary.
- Bind inline errors to fields and keep server error text safe.
- Preserve compression options, authenticated upload order, API payload, and route transitions.

Invariants:

- No change to `/api/upload` or `/api/expenses`.
- Do not widen upload types/sizes or weaken content validation.
- Do not create an offline mutation queue.

Validation:

- Timed manual entry: amount → recent/default category → save.
- Custom category, date override, notes, receipt success/failure, compression fallback, server insufficient balance, missing allowance, duplicate submit prevention, and navigation after save.
- Keyboard labels/errors and small-height sticky-action behavior.
- `npm run lint`; `npm run build`.

Rollback:

- Restore the current route markup and continue passing the existing shared callbacks to `MobileAddExpense`.

### Phase 6 — Income forms and history

Purpose: remove duplicated desktop/mobile form/list markup without altering balance transactions.

Files to create:

- `src/features/income/IncomeForm.js`
- `src/features/income/IncomeList.js`

Files to modify:

- `src/app/(dashboard)/income/page.js`
- `src/app/(dashboard)/income/add/page.js`

Actions:

- Reuse one amount/source/date/note form for add and edit modes.
- Render one responsive list tree with card/table presentation variants sharing callbacks.
- Use the common dialog, feedback, currency, and empty/error primitives.
- Preserve confirmation for deletion because it can be rejected when income has already been spent.

Invariants:

- Preserve `/api/incomes` and `/api/incomes/[id]` payloads and transaction semantics.
- Preserve cross-period allowance reassignment behavior on edited dates.

Validation:

- Add/edit/delete income, including rejection when balance has been spent.
- Month/year filters, empty/error/loading, and allowance totals after each mutation.
- `npm run lint`; `npm run build`.

Rollback:

- Restore current route-local render blocks; shared forms remain additive until unused.

### Phase 7 — Unified summary and report presentation

Purpose: remove the remaining page-level `useIsMobile` branch and make category ranking primary.

Files to create:

- `src/features/reports/MonthlySummary.js`
- `src/features/reports/RankedCategoryList.js`

Files to modify:

- `src/app/(dashboard)/summary/page.js`

Files retained:

- `src/components/mobile/MobileSummary.js`
- `src/hooks/useIsMobile.js`

Actions:

- Render one month selector, summary, ranked category list, textual total, and optional chart wrapper.
- Use the server-aggregated `/api/summary` response without recomputing from dashboard history.
- Use one stable category/chart color mapping and one currency formatter.
- Keep chart loading optional and layout-stable; do not make it the only representation.
- Replace native alerts and duplicate empty states with shared responsive states.
- Remove route use of `useIsMobile`. Retain the hook file until a repository-wide import check proves it unused and deletion is approved.

Invariants:

- No summary API or aggregation change.
- Selected month and percentage meaning remain unchanged.

Validation:

- Empty, one category, many categories, long category labels, large totals, API error/retry, and slow chart loading.
- Keyboard month selection and readable text without chart interaction.
- `npm run lint`; `npm run build`.

Rollback:

- Restore the previous desktop/mobile render blocks; retained `MobileSummary` makes rollback immediate.

### Phase 8 — Authentication and feedback convergence

Status: completed on 2026-07-30.

Purpose: align auth with the product system and complete the feedback/overlay contract.

Files to create:

- `src/features/auth/AuthShell.js`
- `src/features/auth/PasswordField.js`
- `src/components/ui/Dialog.js`
- `src/components/ui/Sheet.js`

Files to modify:

- `src/app/(auth)/login/page.js`
- `src/app/(auth)/register/page.js`
- `src/app/(auth)/forgot-password/page.js`
- `src/app/(auth)/update-password/page.js`
- `src/app/(dashboard)/components/AllowanceModal.js`
- `src/app/(dashboard)/allowance/page.js`
- `src/app/(dashboard)/components/CategorySelect.js`
- `src/app/(dashboard)/components/EditExpenseModal.js`
- `src/app/(dashboard)/components/ExpenseDetailModal.js`
- `src/app/(dashboard)/components/ImageZoomModal.js`
- `src/app/(dashboard)/income/page.js`
- `src/app/(dashboard)/page.js`
- `src/app/globals.css`
- `src/components/mobile/MobileExpenseDetailSheet.js`
- `src/components/navigation/AppShell.js`

Actions:

- Share auth shell and password field while leaving Supabase calls and redirect behavior in place.
- Add labelled password-visibility controls and inline form errors.
- Migrate custom overlays to shared accessible dialog/sheet primitives.
- Keep one confirmation pattern for consequential expense/income deletion.
- Replace the forced profile prompt with a non-blocking, dismissible prompt while preserving `supabase.auth.updateUser` behavior.

Implementation notes:

- The active dashboard profile prompt was already non-blocking and inline, so its existing behavior was preserved instead of introducing another overlay.
- Logout, allowance editing, expense editing/detail/receipt zoom, expense deletion, income editing/deletion, and the mobile expense-detail sheet now use the shared feedback or overlay contract.
- `MobileDashboard.js` still contains legacy SweetAlert behavior, but it remains unused migration input and was intentionally not deleted or refactored in this phase.

Invariants:

- No account-existence disclosure changes.
- No auth callback, token, cookie, or Supabase configuration changes.
- No destructive action becomes silently reversible unless the backend safely supports it.

Validation:

- Login/register/reset/update flows and invalid-session redirect.
- Focus entry/trap/Escape/close/focus restoration for every overlay.
- Screen-reader labels for password toggles and form errors.
- `npm run lint`; `npm run build`.

Rollback:

- Each auth page can restore its local shell independently; overlay consumers can migrate one at a time.

### Phase 9 — Verification, deprecation, and approved cleanup gate

Status: completed on 2026-07-30; cleanup approval pending.

Files to modify:

- `docs/responsive-migration-plan.md`
- `README.md` only if runtime architecture or authoritative validation commands changed
- legacy files only to add deprecation comments after imports are removed

Candidate legacy files to retain until explicit deletion approval:

- `src/components/mobile/MobileDashboard.js`
- `src/components/mobile/MobileAddExpense.js`
- `src/components/mobile/MobileSummary.js`
- `src/components/mobile/MobileShell.js`
- `src/components/mobile/icons.js`
- `src/hooks/useIsMobile.js`
- replaced dashboard components such as `SummaryCards.js` or `ExpenseListItem.js`

`MobileExpenseDetailSheet.js` is not a cleanup candidate after Phase 8. It is
the active mobile presentation variant backed by the shared `Sheet` primitive
and the dashboard's shared data/actions.

Actions:

- Search for all imports and runtime references.
- Mark genuinely replaced files as deprecated; do not delete them.
- Complete full regression and viewport checks.
- Present an exact deletion list and wait for explicit approval in a separate cleanup task.

Implementation notes:

- The import audit and exact cleanup candidates are recorded in
  `docs/phase-9-verification.md`.
- Eight files are marked deprecated and retained as rollback input.
- `MobileExpenseDetailSheet.js`, `MobileBottomNav.js`, `DashboardFilters.js`,
  and active domain overlays remain outside cleanup scope.
- No route, API, finance calculation, auth configuration, database behavior, or
  production data was changed.
- No file was deleted and no dependency was removed.

Validation:

- `npm run lint`
- `npm run build`
- Auth, allowance, expense, income, upload, summary, ownership, offline/update, and PWA standalone smoke tests.
- Viewports: 320×800, 360×800, 375×812, 390×844, 414×896, 768×1024, 1024×768, 1440×900.
- Check overflow, safe areas, long content, keyboard, focus, reduced motion, sticky overlap, empty/error/loading/offline, and layout shift.

Rollback:

- Because legacy files remain, route entries can be reverted phase by phase. No cleanup occurs until replacements pass validation and deletion is approved.

## 7. Migration risks and mitigations

| Risk | Why it matters | Mitigation |
| --- | --- | --- |
| Viewport-dependent query behavior is accidentally preserved | A “unified” page could still return different data by width | Remove width from data-hook inputs and test identical filters at mobile/desktop widths |
| Rendering old and new trees together causes duplicate requests/effects | Can duplicate profile prompts, subscriptions, or mutations | Keep one mounted data owner and do not mount both full implementations for visual hiding |
| Auth hooks remain duplicated | Layout and page instances each subscribe to Supabase | Centralize session ownership before removing guards; verify redirects and refresh behavior |
| Date/timezone drift | Existing code mixes ISO dates and local `Date` parsing | Treat date model as locked; centralize display only, with regression fixtures around day/month boundaries |
| Allowance string/number handling changes | Allowance API serializes Decimal fields as strings | Normalize for display in one selector without changing API payloads or server arithmetic |
| Expense history becomes slow when unified | Fetch-all preserves mobile behavior but may grow | Measure with large fixtures; use existing range filters and summary month metadata if needed |
| Receipt flow is visually simplified too aggressively | Could weaken validation or lose upload phase/errors | Keep compression/upload/save sequence and server validation untouched; hide UI only behind progressive disclosure |
| Undo is added without safe inverse operations | Expense/income deletion changes balances; receipt cleanup is not enabled | Retain confirmation until a dedicated backend design safely supports undo |
| Mobile shell migration creates double headers/nav | Legacy pages currently self-wrap | Convert `MobileShell` to a compatibility wrapper in the same reviewed shell phase |
| Chart dynamic imports shift layout | Client-only components can render late | Reserve dimensions and keep textual ranked data primary |
| PWA update reload loses input | `controllerchange` currently reloads automatically | Coordinate update activation, detect unsaved form state, and test standalone mode |
| Automatic dark mode remains partial | Global tokens switch while components hard-code surfaces | Ship one complete mode first; add dark mode only as a complete token/state pass |

## 8. Definition of done for each route

A route is considered migrated only when:

- it has one data/mutation owner;
- no full page is selected through `useIsMobile`;
- responsive differences are limited to presentation;
- loading, empty, error, success, and relevant offline/update states are visible;
- labels, keyboard behavior, focus, contrast, and touch targets meet the project requirements;
- IDR and date formatting use shared utilities;
- existing API, finance, auth, ownership, and upload behavior passes regression checks;
- mobile primary actions remain reachable with safe-area navigation;
- `npm run lint` and `npm run build` complete successfully;
- legacy replacements remain available for rollback until cleanup approval.

## 9. Cleanup approval boundary

This plan does not authorize deletion. After Phase 9, a separate cleanup proposal must list every candidate file, prove it has no imports or runtime references, report lint/build and manual regression results, and request explicit user approval before deletion.
