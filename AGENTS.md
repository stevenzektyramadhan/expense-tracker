# AGENTS.md — kiteCatat Expense Tracker

This file contains repository-level instructions for Codex and other compatible coding agents. It applies to the entire repository unless a more specific `AGENTS.md` or `AGENTS.override.md` exists in a nested directory.

## 1. Project Mission

kiteCatat is an Indonesian personal-finance PWA for managing:

- allowance or periodic pocket money;
- daily expenses;
- additional income;
- receipt uploads;
- monthly summaries and category reports;
- authenticated user-specific finance data.

The application uses Next.js App Router, React, Tailwind CSS, Supabase Auth/Postgres, Prisma, Cloudinary, Recharts, and `next-pwa`.

The product must feel fast, calm, trustworthy, and practical. It is not a corporate banking dashboard and should not look like a generic AI-generated finance template.

## 2. Primary Product Goals

Prioritize work according to these goals:

1. A returning user should be able to record a normal expense in under 10 seconds.
2. Mobile is the primary day-to-day experience.
3. Desktop is primarily used for reviewing transactions, managing data, and reading reports.
4. Users must immediately understand their remaining allowance, recent spending, and recent transactions.
5. The application must remain usable as an installable PWA and behave clearly during loading, offline, failed, and syncing states.
6. Financial calculations, authorization, ownership checks, and production data safety take priority over visual improvements.

## 3. Non-Negotiable Rules

- Preserve existing backend behavior unless the task explicitly requests a backend change.
- Preserve existing routes unless the task explicitly approves a route migration.
- Do not weaken authentication, authorization, Supabase RLS, input validation, upload validation, CSP, or security headers.
- Never expose server-only environment variables to browser code.
- Never allow client input to control trusted ownership or calculated balance fields.
- Never run destructive database commands against production without explicit user approval.
- Never delete production files, route trees, or the existing mobile implementation merely because a replacement has been created.
- Migrate incrementally, validate the replacement, then remove deprecated code in a separate approved cleanup step.
- Do not add a production dependency when an existing dependency or small local component can solve the problem. Ask for approval before adding a substantial dependency.
- Do not make unrelated formatting, dependency, architecture, or naming changes while implementing a scoped task.
- Do not fabricate user data, financial claims, testimonials, metrics, or product capabilities.

## 4. Required Working Method

### 4.1 Inspect before editing

Before modifying code:

1. Read this file and the relevant README or documentation.
2. Inspect the complete route, its imported components, hooks, API calls, and related server handlers.
3. Identify existing business rules and security assumptions.
4. Search for duplicated desktop/mobile behavior before creating new code.
5. Check whether a shared component or utility already exists.
6. State the exact files expected to be created, modified, deprecated, or deleted.
7. Treat any deletion as requiring explicit approval.

Do not start a broad refactor from a single component without understanding its data flow.

### 4.2 Use a plan for multi-file or risky work

Create or update a plan in `docs/` when work:

- spans multiple routes or features;
- changes responsive architecture;
- changes finance calculations;
- changes authentication or database behavior;
- introduces a design system;
- migrates desktop/mobile implementations;
- is expected to require several independently testable milestones.

A useful plan must include:

- current behavior;
- target behavior;
- files affected per milestone;
- invariants that must remain true;
- validation for each milestone;
- rollback or deprecation strategy;
- known risks and follow-up work.

### 4.3 Keep changes reversible

Prefer small, reviewable phases:

1. introduce shared primitives;
2. reuse them in existing screens;
3. centralize shared data/state logic;
4. create the unified responsive screen;
5. switch the route to the unified screen;
6. validate behavior and layout;
7. deprecate old components;
8. delete old components only in an explicitly approved cleanup.

## 5. Hallmark Design Skill

Use the Hallmark skill for UI design, visual audit, design extraction, and redesign work.

Expected installation location:

- personal: `~/.codex/skills/hallmark/`
- project-scoped: `.codex/skills/hallmark/`

Recommended installation or update command:

```bash
npx skills add nutlope/hallmark
```

### 5.1 When to invoke Hallmark

Use Hallmark explicitly for tasks such as:

- auditing the current interface;
- redesigning an existing page;
- creating a new visual direction;
- studying a screenshot or public reference site;
- defining visual hierarchy, typography, color, spacing, motion, and component voice.

Recommended invocations:

```text
Use $hallmark.
hallmark audit <target>
```

```text
Use $hallmark.
hallmark redesign <target>
```

```text
Use $hallmark.
hallmark study <screenshot-or-url>
```

### 5.2 Hallmark boundaries

Hallmark controls the visual and interaction layer. It must not be treated as permission to rewrite the entire application.

During an existing-project redesign:

- preserve routes, content intent, finance rules, API contracts, and brand identity;
- preserve component ownership when practical;
- list files before editing;
- do not delete old production components without approval;
- do not copy a reference site pixel-for-pixel;
- do not copy proprietary branding, logos, illustrations, or paid templates;
- use references for design DNA, not cloning;
- keep the result appropriate for an authenticated finance application, not a marketing landing page.

If Hallmark is unavailable, report that clearly and continue only with a conservative implementation based on this file. Do not pretend the skill was used.

## 6. Responsive Architecture Direction

### 6.1 One source of truth

The target architecture is one responsive application, not separate desktop and mobile applications.

Unify:

- routes;
- data fetching;
- mutations;
- state;
- validation;
- finance calculations;
- form logic;
- loading, empty, error, and success behavior;
- domain components;
- design tokens.

Device-specific presentation may differ, but business behavior must not be duplicated.

### 6.2 Do not select an entire page tree with JavaScript

Avoid this pattern for full pages:

```jsx
const isMobile = useIsMobile();
return isMobile ? <MobileDashboard /> : <DesktopDashboard />;
```

Reasons:

- duplicates implementation and fixes;
- delays rendering until the viewport is known;
- can cause layout shifts;
- produces ambiguous tablet behavior;
- makes server rendering and hydration harder;
- makes AI-assisted changes inconsistent;
- causes desktop and mobile features to drift.

Prefer one component tree with CSS/Tailwind breakpoints:

```jsx
<div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
  <main className="lg:col-span-2">...</main>
  <aside>...</aside>
</div>
```

Use JavaScript viewport checks only when behavior genuinely cannot be expressed with CSS or platform capability detection. Do not use viewport checks merely to choose markup for the whole route.

### 6.3 Acceptable device-specific components

It is acceptable to keep focused presentational differences such as:

- `DesktopSidebar` and `MobileBottomNav`;
- a transaction table on desktop and transaction cards on mobile;
- a desktop dialog and a mobile bottom sheet;
- denser report controls on desktop.

These components must receive shared data and callbacks. They must not independently implement fetching, validation, mutations, calculations, or authorization.

Example:

```jsx
<TransactionSection
  transactions={transactions}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

The section may render responsive presentations, but both presentations use the same source of truth.

## 7. Target Frontend Organization

Prefer organization by feature and responsibility rather than viewport.

Target direction:

```text
src/
  app/
    (auth)/
    (dashboard)/
    api/

  features/
    dashboard/
      DashboardPage.js
      FinancialOverview.js
      RecentTransactions.js
      DashboardSkeleton.js
      useDashboardData.js

    expenses/
      ExpenseForm.js
      ExpenseAmountField.js
      CategoryPicker.js
      ReceiptUploader.js
      ExpenseList.js
      useExpenseForm.js

    transactions/
      TransactionSection.js
      TransactionCard.js
      TransactionTable.js

    allowance/
    income/
    reports/

  components/
    ui/
      Button.js
      Card.js
      Input.js
      Dialog.js
      Sheet.js
      Toast.js
      EmptyState.js
      Skeleton.js

    navigation/
      AppSidebar.js
      MobileBottomNav.js
      AppHeader.js

  hooks/
  lib/
```

This is a target direction, not permission to move every file in one task. Adapt it to the current repository and migrate incrementally.

## 8. Mobile Folder Migration

The current `src/components/mobile/` folder must be treated as legacy migration input, not deleted immediately.

Recommended migration order:

1. Inventory every mobile component and its desktop counterpart.
2. Document duplicated data fetching, state, calculations, actions, and presentation.
3. Extract shared primitives such as currency amounts, category badges, transaction items, skeletons, empty states, and form fields.
4. Extract shared hooks or feature-level state where duplication exists.
5. Build a unified responsive page using the shared logic.
6. Route traffic to the unified page.
7. Validate mobile, tablet, and desktop behavior.
8. Mark replaced mobile components as deprecated.
9. Remove deprecated components only after imports are gone, lint/build pass, and the user approves deletion.

Do not create a new `desktop/` folder as a mirror of `mobile/`. That would preserve the underlying problem.

## 9. Design System Rules

### 9.1 Visual character

The interface should feel:

- calm;
- trustworthy;
- modern;
- lightweight;
- efficient;
- friendly without becoming childish.

Avoid:

- generic fintech template aesthetics;
- excessive gradients;
- glassmorphism on every surface;
- card grids where every item has equal emphasis;
- decorative charts that obscure the actual numbers;
- oversized marketing-style headings inside authenticated product screens;
- random shadows, radii, spacing, and colors;
- animation without a communication purpose.

### 9.2 Semantic colors

Use semantic roles consistently:

- brand/primary: primary actions and active navigation;
- income/success: incoming money and successful completion;
- expense/destructive: outgoing money and destructive actions;
- warning: low remaining allowance, pending sync, or risk states;
- neutral surfaces: most containers and background hierarchy.

Do not use green merely as decoration if it may imply income or success. Do not use red for neutral decoration if it may imply expense, error, or deletion.

Do not communicate meaning by color alone. Pair color with labels, icons, text, or shape.

### 9.3 Tokens

Prefer centralized design tokens for:

- color;
- typography;
- spacing;
- border radius;
- shadows;
- borders;
- focus rings;
- motion duration/easing;
- chart colors.

Do not repeatedly hardcode slightly different values across pages. If a pattern appears three times, consider whether it should be a token or shared component.

### 9.4 Typography and language

- Use one intentional font system across auth and dashboard experiences.
- Avoid mixing browser-default Arial with configured application fonts.
- Keep hierarchy clear through size, weight, spacing, and placement—not through many unrelated colors.
- User-facing product copy should be consistently Indonesian unless the task explicitly changes the product language.
- Avoid mixed labels such as `Welcome back`, `Search here`, and Indonesian finance terminology on the same screen.
- Keep labels direct and familiar to Indonesian users.

### 9.5 Currency and dates

Use shared formatting utilities. Prefer Indonesian locale formatting:

```js
new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});
```

Do not duplicate currency formatting in multiple components.

Preserve the existing date model and timezone behavior unless the task is specifically about dates. Display dates consistently using Indonesian locale conventions.

## 10. Page-Specific UX Direction

### 10.1 Dashboard

Mobile information priority:

1. remaining allowance or balance;
2. spending today;
3. primary add-expense action;
4. recent transactions;
5. monthly totals and secondary analytics.

Do not place many equally prominent gradient cards above recent transactions.

Recommended behavior:

- show one dominant financial overview rather than several competing hero cards;
- make the add-expense action immediately reachable;
- surface recent transactions before secondary charts on mobile;
- keep desktop denser and more analytical without merely enlarging the mobile layout;
- show clear loading skeletons, empty states, API failures, offline state, and sync status;
- avoid blocking profile-completion dialogs on the primary workflow.

Profile completion should be non-blocking unless the information is genuinely required for a financial operation.

### 10.2 Add expense flow

The default path must be optimized for speed:

1. amount;
2. frequently used or recent category;
3. save.

Recommended details:

- amount is the first and visually strongest field;
- use an appropriate numeric input mode;
- autofocus only when it does not cause disruptive mobile behavior;
- default the date to today;
- show recent/frequent category chips when data exists;
- move notes and receipt upload under progressive disclosure such as “Detail tambahan”;
- keep the primary submit action visible on small screens;
- use inline validation near the relevant field;
- show success feedback with an undo option when safely implementable;
- preserve receipt compression, validation, ownership, and upload behavior;
- do not make cancel visually compete with save.

Do not change the data model or submission contract solely to support a visual redesign.

### 10.3 Transaction history

- Use a scannable card/list presentation on mobile.
- Use a denser table or structured list on desktop when appropriate.
- Reuse the same transaction data, formatting, edit action, delete action, and confirmation flow.
- Make amount direction unambiguous with sign, label, and semantic treatment.
- Keep search and filters usable with touch and keyboard.
- Preserve query behavior and avoid filtering only the currently loaded partial data unless that is intentional and documented.

### 10.4 Summary and reports

- Numbers and category ranking are primary; charts are supporting evidence.
- Prefer readable ranked bars or lists when a pie/donut chart becomes difficult to compare.
- Load heavy charts dynamically only when this improves performance without harming layout stability.
- Provide a textual equivalent for important chart information.
- Keep filters consistent between mobile and desktop.
- Clearly distinguish allowance, additional income, expense, remaining amount, and period comparisons.

### 10.5 Authentication screens

- Auth screens should share the same design language as the application shell.
- Avoid a completely unrelated glassmorphism/gradient identity.
- Keep forms readable, accessible, and calm.
- Preserve Supabase Auth flows and error handling.
- Never expose whether an account exists in a way that weakens security unless existing product requirements explicitly allow it.

## 11. Feedback and Overlay Patterns

Use one predictable pattern per purpose:

- toast: lightweight success or non-blocking feedback;
- inline message: form validation and local errors;
- banner: offline, sync, degraded service, or persistent system status;
- dialog: important confirmation, especially destructive actions;
- sheet: contextual mobile details or focused mobile actions;
- modal/dialog: focused desktop interaction.

Avoid using SweetAlert, custom modal, native alert, and toast interchangeably for the same purpose.

When modifying an area, prefer converging toward a single consistent feedback system without rewriting unrelated pages.

All dialogs and sheets must support:

- clear accessible name;
- keyboard focus management;
- Escape behavior when dismissal is safe;
- visible close control;
- focus restoration;
- prevention of accidental dismissal for destructive operations only when justified.

## 12. Accessibility Requirements

Target WCAG AA for normal product use.

Minimum expectations:

- semantic HTML first;
- every input has a programmatic label;
- minimum practical touch target of approximately 44×44 CSS pixels;
- visible keyboard focus states;
- logical tab order;
- no essential hover-only actions;
- adequate text/background contrast;
- icons with accessible labels when meaning is not already expressed by adjacent text;
- reduced-motion preference respected;
- error text linked to its input;
- loading states announced when appropriate;
- charts supplemented by readable text or data;
- destructive actions require clear confirmation and wording;
- bottom navigation accounts for device safe areas.

Do not remove outlines without providing an equally visible focus treatment.

## 13. PWA Requirements

Preserve installability and existing service-worker behavior.

UI work must account for:

- standalone display mode;
- mobile safe-area insets;
- offline status;
- stale cached assets;
- update prompts;
- pending or failed network mutations;
- loading behavior on slow connections;
- touch interaction without hover;
- viewport height behavior on mobile browsers;
- navigation that remains reachable when installed.

Do not edit generated Workbox files directly unless the project explicitly treats them as source. Prefer changing PWA configuration or source files.

Do not claim offline mutation support unless the code actually queues and reconciles mutations safely.

## 14. Data, Finance, and Security Invariants

Important finance invariant:

```text
allowances.amount = base allowance + total additional incomes
allowances.remaining = allowances.amount - total linked expenses
```

Client code must not be trusted to set or authorize:

- `user_id`;
- ownership of a finance row;
- `allowance_id` used for another user's balance;
- authoritative `remaining` values;
- authorization decisions.

For all finance mutations:

- derive the authenticated user on the server;
- verify ownership on the server;
- validate identifiers and payloads;
- keep calculations consistent and atomic where required;
- account for concurrent updates;
- return safe error messages;
- preserve Supabase RLS as defense in depth.

Security focus areas include:

- IDOR/BOLA;
- RLS policy correctness;
- CSRF/origin validation for mutations;
- XSS from notes, descriptions, names, and filenames;
- upload type/size/content validation;
- Cloudinary asset ownership and cleanup;
- secret exposure;
- dependency and supply-chain risk.

Do not put database or Cloudinary secrets in client modules. Only `NEXT_PUBLIC_*` values may be intentionally exposed to the browser.

## 15. Database Safety

Production database work requires explicit approval and careful environment confirmation.

Before a production migration:

1. confirm the target project/environment;
2. confirm a recent backup;
3. run read-only preflight checks;
4. review duplicate, orphaned, and ownership-inconsistent data;
5. test locally or in staging when available;
6. present the exact SQL/migration and risks;
7. wait for explicit approval before applying production changes.

Never run these against production without explicit approval:

```text
supabase db reset
prisma migrate reset
DROP TABLE
DROP SCHEMA
TRUNCATE
unscoped DELETE
unscoped UPDATE
```

Do not edit an already-applied production migration. Create a new forward migration.

## 16. Code Quality Conventions

- Follow the existing JavaScript style unless a scoped migration to TypeScript is explicitly requested.
- Do not convert unrelated JavaScript files to TypeScript during a UI task.
- Prefer small, focused components with clear responsibilities.
- Keep business logic outside purely presentational components.
- Prefer shared hooks or feature-level modules for repeated client behavior.
- Prefer server components by default in App Router; add `"use client"` only where client state, effects, browser APIs, or event handlers are required.
- Minimize client component boundaries.
- Do not dynamically import ordinary lightweight components merely to separate mobile/desktop trees.
- Dynamic import is appropriate for genuinely heavy, optional client-only modules such as some charts or image viewers.
- Reuse `authenticatedFetch` and existing trusted utilities when applicable.
- Avoid creating multiple currency/date formatters with inconsistent options.
- Do not swallow errors. Provide user-safe feedback and retain useful server-side diagnostics.
- Do not log tokens, secrets, complete sensitive payloads, or private user finance data.
- Keep API response shapes stable unless the task includes a coordinated contract change.

## 17. Performance Expectations

- Avoid unnecessary client-side waterfalls.
- Avoid waiting for viewport detection before rendering the main page.
- Avoid duplicate data requests from separate desktop/mobile components.
- Keep chart libraries out of routes that do not need them.
- Reserve layout space for dynamically loaded charts and images.
- Use optimized images or the existing validated Cloudinary flow.
- Avoid premature memoization; measure or identify a concrete rerender problem first.
- Prefer CSS responsiveness over JavaScript responsiveness.
- Keep the primary expense-entry interaction responsive on low- to mid-range mobile devices.

## 18. Validation Commands

Use the package manager already committed to the repository (`npm` with `package-lock.json`).

Common commands:

```bash
npm install
npx prisma generate
npm run dev
npm run lint
npm run build
npm start
```

On Windows, the equivalent `npm.cmd` form may be used.

Current repository validation baseline:

```bash
npm run lint
npm run build
```

There is currently no guaranteed automated test script. Do not claim tests passed when no test suite exists.

When a test framework is added, update this file and `package.json` with the authoritative commands.

## 19. Testing Direction

For behavioral or redesign work, add tests incrementally when the task permits.

Priority end-to-end scenarios:

- unauthenticated redirect;
- login and logout;
- add expense;
- edit expense;
- delete expense;
- add/edit/delete additional income;
- allowance creation/update;
- receipt upload validation and successful upload;
- monthly summary filtering;
- ownership isolation between users;
- offline and PWA update states where reliably testable.

Priority visual viewport checks:

- 360×800;
- 390×844;
- 768×1024;
- 1024×768;
- 1440×900.

During responsive review, check:

- horizontal overflow;
- clipped content;
- safe-area overlap;
- awkward wrapping;
- touch targets;
- keyboard navigation;
- focus visibility;
- sticky elements covering content;
- dialogs/sheets at small heights;
- layout shift;
- empty, loading, error, offline, and long-content states.

Do not add brittle screenshot tests for random animation frames or unstable generated content.

## 20. Recommended Redesign Sequence

Use this order unless the user explicitly scopes a different sequence.

### Phase 1 — Audit and foundation

- Run Hallmark audit without editing.
- Document current UI and responsive duplication.
- Define design tokens and component rules.
- Identify feedback, overlay, loading, and empty-state inconsistencies.

Suggested documents:

```text
docs/ui-audit.md
docs/design-system-proposal.md
docs/responsive-migration-plan.md
```

### Phase 2 — Shared application shell

- create a coherent authenticated shell;
- keep desktop sidebar and mobile bottom navigation as focused presentational variants;
- unify header, content width, spacing, page titles, and global feedback;
- preserve auth and route behavior.

### Phase 3 — Unified dashboard

- centralize dashboard data/state;
- replace full-page mobile/desktop branching with one responsive tree;
- prioritize remaining allowance, today spending, add expense, and recent transactions;
- keep secondary analytics lower on mobile;
- deprecate but do not immediately delete the old mobile dashboard.

### Phase 4 — Unified expense form

- create one shared `ExpenseForm` and shared validation/submission behavior;
- render it in the appropriate page/dialog/sheet container;
- optimize the default flow for under 10 seconds;
- preserve receipt upload and finance behavior.

### Phase 5 — Transactions and reports

- unify data and actions;
- use responsive table/card presentation;
- make summaries readable without relying only on charts;
- keep filters consistent.

### Phase 6 — Cleanup and tests

- remove obsolete imports;
- validate all routes;
- add priority end-to-end tests;
- delete deprecated mobile files only after explicit approval;
- update documentation.

## 21. Review Checklist Before Finishing

Before reporting completion, verify and report:

### Scope

- Did the change remain within the requested scope?
- Were unrelated files left untouched?
- Were all created/modified/deprecated files listed?

### Behavior

- Are API contracts preserved?
- Are finance calculations unchanged or intentionally updated and tested?
- Are auth and ownership checks preserved?
- Are loading, empty, error, and success states present?

### Responsive UI

- Is there one source of truth for data and mutations?
- Is full-page `useIsMobile` branching avoided?
- Are desktop/mobile differences limited to presentation where practical?
- Does mobile prioritize the primary expense workflow?

### Accessibility

- Are labels, focus states, keyboard behavior, contrast, and touch targets acceptable?
- Do dialogs and sheets manage focus correctly?
- Is meaning available without color alone?

### PWA

- Is installed/mobile navigation still reachable?
- Are safe areas and offline/update states preserved?
- Were generated service-worker assets left alone unless intentionally regenerated?

### Validation

- Run `npm run lint`.
- Run `npm run build`.
- Run relevant tests if they exist.
- Manually smoke-test the changed flow.
- State any command that could not run and why.
- Never state that validation passed unless the command actually completed successfully.

## 22. Required Final Report Format

At the end of a coding task, provide:

1. a concise summary of what changed;
2. the files created and modified;
3. deprecated files that remain intentionally;
4. behavior and security invariants preserved;
5. validation commands run and their results;
6. screenshots or viewport checks performed, when relevant;
7. known limitations or follow-up tasks;
8. any deletion or production operation still requiring explicit approval.

## 23. Explicitly Prohibited Shortcuts

Do not:

- redesign the entire application in one unreviewable change;
- copy all code from a design reference repository;
- copy a reference site pixel-for-pixel;
- create parallel `mobile/` and `desktop/` business implementations;
- use Hallmark as justification for changing backend contracts;
- remove security controls to make development easier;
- calculate authoritative balances only in the browser;
- trust client-provided ownership fields;
- silently add dependencies;
- silently change environment configuration;
- edit production data;
- delete legacy components before the replacement is validated;
- use a chart as the only representation of important financial information;
- mark work complete while lint/build failures remain unexplained.

## 24. Preferred First Prompt for the Redesign

A safe first task for this repository is:

```text
Use $hallmark.

Hallmark audit the existing kiteCatat expense-tracking PWA without modifying production code.

Read AGENTS.md and inspect:
- src/app/(dashboard)
- src/components/mobile
- src/hooks
- src/app/globals.css
- the authenticated layout
- dashboard
- add-expense flow
- transaction history
- monthly summary
- feedback, dialog, loading, empty, offline, and PWA update states

Create:
- docs/ui-audit.md
- docs/design-system-proposal.md
- docs/responsive-migration-plan.md

The migration plan must move toward one responsive source of truth, preserve backend and finance behavior, list files per phase, keep changes reversible, and avoid deleting the current mobile implementation until replacements are validated.

Do not edit production code yet.
```
