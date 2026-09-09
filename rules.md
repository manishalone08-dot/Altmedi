# AltMedi AI Engineering Rules & Governance Guide

This document defines the permanent rules, conventions, and engineering standards that **any AI assistant or human engineer must strictly follow** when developing, refactoring, or maintaining the AltMedi codebase.

---

## 0. Golden Rule: Never Break Existing Functionality

> [!CRITICAL]
> **PRESERVE ALL EXISTING FUNCTIONALITY**
> - Never modify, remove, or refactor existing features, types, or services unless explicitly instructed by the user.
> - Always perform non-destructive updates. If adding a new capability, extend existing types and components without breaking current callers.
> - Before modifying any file, inspect all callers and dependencies across the workspace using `grep_search` or `view_file`.
> - Always verify that both **Patient Mobile App** and **Desktop Authoritative Portal** render and function properly after changes.

---

## 1. Coding Standards

### 1.1 TypeScript Strictness
- **Strict Typing Everywhere**: Never use `any` or `unknown` as an escape hatch. If a dynamic payload is returned, define an explicit interface or union type in `src/types/index.ts`.
- **Type Co-location**:
  - Global domain models (e.g., `MedicineEntity`, `MedicineMapping`, `AuthUser`, `VendorOffer`) live in `src/types/index.ts`.
  - Component-specific prop interfaces must be exported from the component file (e.g., `export interface MedicineComparisonViewProps`).
- **Null & Undefined Safety**: Always use optional chaining (`?.`) and nullish coalescing (`??`) when accessing nested properties (e.g., `user?.organization ?? 'Independent'`).

### 1.2 React 19 Best Practices
- **Functional Components**: Write pure functional components with explicit `React.FC<Props>` or destructured typed props.
- **Hook Rules**:
  - Keep hook dependencies exhaustive. Never suppress `eslint-plugin-react-hooks` warnings.
  - Wrap computationally expensive filtering and sorting in `useMemo` (e.g., `displayedAlternatives` in `MedicineComparisonView.tsx`).
  - Use `useCallback` for event handlers passed down to deep list items to prevent re-render thrashing.
- **State Encapsulation**: Prefer local state for transient UI toggles (expanded cards, modal visibility); use `AltMediService` in `src/services/api.ts` or `authService.ts` for domain state and cross-component persistence.

### 1.3 Tailwind CSS v4 Rules
- **Utility-First**: Use Tailwind CSS utilities exclusively. Do not write ad-hoc inline `style={{ ... }}` objects unless calculating dynamic pixel offsets.
- **Class Grouping Order**:
  1. Layout / Positioning (`flex`, `grid`, `absolute`, `relative`, `w-full`, `max-w-md`)
  2. Spacing (`p-4`, `px-3`, `py-2`, `space-y-4`, `gap-2`)
  3. Typography (`text-xs`, `font-bold`, `text-slate-900`)
  4. Visual / Color (`bg-white`, `border`, `border-slate-200`, `rounded-xl`, `shadow-xs`)
  5. Interactive / Pseudo-classes (`hover:bg-slate-50`, `active:scale-95`, `transition-all`, `focus:ring-2`)
- **Semantic Color Usage**: Follow the established AltMedi palette tokens (see Section 4).

### 1.4 Indian Healthcare Standards Compliance
- **Currency Representation**: Always use the Indian Rupee symbol `₹` followed by standard two-decimal precision (e.g., `₹118.50`). For unit prices, specify the unit (e.g., `₹11.85 / tablet`).
- **CDSCO & Formulary Alignment**: Maintain accurate pharmaceutical nomenclature (e.g., *Tablet IP*, *Gastro-resistant*, *Sustained Release*).
- **Patient Privacy**: Never render unmasked patient phone numbers in UI queues or logs. Always mask: `+91 98****4102`.
- **ABHA Identifier Formatting**: Enforce standard 14-digit format: `91-XXXX-XXXX-XXXX`.

---

## 2. Folder Structure Rules

The project adheres to a modular, feature-oriented architecture:

```text
Altmedi/
├── .env.example                     # Reference environment variables template
├── metadata.json                    # Application metadata and runtime permissions
├── package.json                     # Dependencies, scripts, and build metadata
├── tsconfig.json                    # TypeScript compiler configuration
├── vite.config.ts                   # Vite bundler, React, and Tailwind v4 setup
├── public/
│   └── assets/                      # Static assets, icons, and branding media
├── src/
│   ├── App.tsx                      # Top-level shell, mode switcher, and auth state
│   ├── main.tsx                     # React 19 entry point and DOM mount
│   ├── index.css                    # Tailwind CSS v4 entry point
│   ├── types/
│   │   └── index.ts                 # Canonical domain interfaces, enums, and types
│   ├── services/
│   │   ├── api.ts                   # Domain service layer, API boundary, and audit logging
│   │   ├── authService.ts           # Session manager, demo credentials, and auth API
│   │   └── catalogData.ts           # Pre-seeded canonical medicines, mappings, and reviews
│   └── components/
│       ├── auth/
│       │   └── AuthScreen.tsx       # Modal/standalone login, register, and role switcher
│       ├── layout/
│       │   └── Header.tsx           # Global header, role selector, and user pill
│       ├── patient/
│       │   ├── PatientMobileApp.tsx          # Mobile container shell with camera and search
│       │   ├── PrescriptionCamera.tsx        # Camera viewfinder & simulated photo capture
│       │   ├── ExtractionReview.tsx          # OCR prescription entity confirmation
│       │   ├── MedicineComparisonView.tsx    # Bioequivalence & price comparison engine
│       │   └── PharmacistReviewModal.tsx     # 1-click pharmacist verification request modal
│       └── portal/
│           └── DesktopAuthoritativePortal.tsx # Multi-role professional desktop workspace
```

### Folder Placement Guidelines
1. **New UI Components**:
   - If dedicated to the patient journey $\rightarrow$ `src/components/patient/`
   - If dedicated to professional/admin portals $\rightarrow$ `src/components/portal/`
   - If shared across multiple domains $\rightarrow$ `src/components/common/` or `src/components/layout/`
2. **New Business Logic & Data Fetching**: Place in `src/services/`. Never place raw API calls directly inside component bodies.
3. **New Types & Contracts**: Add to `src/types/index.ts`. Ensure models are backward-compatible.

---

## 3. Naming Conventions

| Entity Type | Convention | Example |
| :--- | :--- | :--- |
| **React Component Files** | PascalCase (`.tsx`) | `MedicineComparisonView.tsx`, `AuthScreen.tsx` |
| **Service & Utility Files** | camelCase (`.ts`) | `api.ts`, `authService.ts`, `catalogData.ts` |
| **React Components** | PascalCase | `export const PatientMobileApp: React.FC = () => {}` |
| **Interfaces & Types** | PascalCase | `MedicineEntity`, `PharmacistReview`, `AuthUser` |
| **Literal Union Types** | snake_case | `'same_active_ingredient' \| 'therapeutic_alternative'` |
| **Functions & Handlers** | camelCase with verb prefix | `handleSearch`, `submitPharmacistDecision`, `calculateSavings` |
| **State Variables** | camelCase | `searchQuery`, `isSubmitting`, `selectedMedicine` |
| **Boolean State** | Prefix with `is`, `has`, `show` | `isLoading`, `hasAllergies`, `showCamera` |
| **Constants** | UPPER_SNAKE_CASE | `INITIAL_MEDICINES`, `DEMO_USERS`, `STORAGE_KEY` |
| **CSS Classes** | kebab-case (Tailwind) | `bg-teal-700`, `rounded-2xl`, `shadow-xs` |

---

## 4. UI/UX Consistency Rules

### 4.1 Color Palette & Semantic Meaning

AltMedi employs a high-contrast, healthcare-authoritative color system:

| Semantic Role | Tailwind Color Token | Purpose / Application |
| :--- | :--- | :--- |
| **Brand Primary** | `teal-600` / `teal-700` / `teal-800` | Navigation headers, primary CTAs, active role pills, verified badges |
| **Bioequivalent / Safe** | `emerald-600` / `emerald-100` / `emerald-800` | Identical active ingredients, high savings highlights, in-stock pills, confirmed reviews |
| **Caution / Clinical Review** | `amber-500` / `amber-100` / `amber-800` | Therapeutic alternatives, stale inventory warnings (>7 days), pending review status |
| **Danger / Alert** | `rose-600` / `rose-100` / `rose-800` | Severe drug allergies, contraindications, rejected substitutions, urgent badges |
| **Neutrals & Surfaces** | `slate-50` / `slate-100` / `slate-200` / `slate-900` | Card borders, subtle backgrounds, dark primary text, muted metadata text |

### 4.2 Typography Hierarchy
- Default Font: Clean modern sans-serif (`font-sans`).
- Sizes & Weights:
  - Page/Card Titles: `text-base` or `text-lg` with `font-bold text-slate-900`
  - Body Text: `text-xs` or `text-sm` with `text-slate-700`
  - Metadata & Badges: `text-[10px]` or `text-[11px]` with `font-medium` or `font-semibold`
  - Quantitative Savings: `text-sm font-extrabold text-emerald-700`

### 4.3 Interactive Ergonomics
- **Touch Targets**: All mobile buttons and interactive chips must have minimum touch targets of `44px × 44px` or generous padding (`px-3 py-2`).
- **Micro-interactions**: Use subtle transitions (`transition-all duration-150 active:scale-95`).
- **Icons**: Use `lucide-react` icons with uniform sizing (`w-3.5 h-3.5` for inline text badges, `w-4 h-4` or `w-5 h-5` for cards and buttons).

---

## 5. Git Commit Rules

We follow the **Conventional Commits** specification. All commit messages must be clear, imperative, and structured:

```text
<type>(<scope>): <short imperative summary>

[optional body explaining why this change was made and clinical impact]

[optional footer referencing issue or PRD section]
```

### 5.1 Permitted Types
- `feat`: A new user-facing or API capability (e.g., `feat(auth): add role-based registration modal with ABHA field`).
- `fix`: A bug fix (e.g., `fix(ocr): prevent crash when prescription items lack normalized entity`).
- `docs`: Documentation updates only (e.g., `docs(decisions): add DEC-008 for authentication architecture`).
- `refactor`: Code change that neither fixes a bug nor adds a feature (e.g., `refactor(portal): extract review table into reusable component`).
- `perf`: Performance optimization (e.g., `perf(compare): memoize pharmacy distance sorting`).
- `chore`: Build tools, dependencies, or config changes (e.g., `chore(deps): bump tailwindcss to 4.1.14`).

### 5.2 Commit Formatting Standards
- Subject line must be **lowercase**, imperative mood ("add", not "added" or "adds").
- Maximum length of subject line: 72 characters.
- Never commit broken TypeScript code (`npm run lint` must pass).

---

## 6. Security & Environment Variable Rules

### 6.1 Zero Secret Exposure
- **Never hardcode secrets** in client-side TypeScript or JSX files.
- The `GEMINI_API_KEY` must only be loaded via environment variables on the server-side boundary or injected securely at runtime.
- Never commit `.env` or `.env.local` files to version control. Maintain `.env.example` as the canonical template.

### 6.2 Data Privacy & Compliance (DPDP Act 2023)
- Mask Personally Identifiable Information (PII) before rendering in any portal or shared review queue.
- Prescription images captured via `PrescriptionCamera.tsx` must be treated as sensitive ephemeral health records.
- All administrative and clinical mutations must be tied to a verified `AuthUser` and logged to `AuditEvent`.

### 6.3 Frame & Device Permissions
- Camera stream access must handle denial gracefully: provide a manual text entry fallback or demo prescription selector if the user denies camera permission.
- Declare all hardware requirements in `metadata.json`:
  ```json
  "requestFramePermissions": ["camera"],
  "majorCapabilities": ["MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API"]
  ```

---

## 7. Development & Verification Checklist

Before submitting or completing any task, verify each of the following:

- [ ] `npm run lint` (`tsc --noEmit`) passes with **0 errors**.
- [ ] Patient Mobile App loads correctly in mobile container mode (`max-w-md`).
- [ ] Camera and prescription OCR workflow runs without unhandled rejections.
- [ ] Medicine Comparison view renders both Same Active Ingredient and Therapeutic Alternatives.
- [ ] Pharmacist Review request modal opens, validates input, and updates the review queue.
- [ ] Authoritative Desktop Portal loads across all 5 professional roles without layout breakage.
- [ ] Vendor offer updates publish immediately and generate an `AuditEvent`.
- [ ] Auth modal allows switching between all 6 demo accounts and persisting session in `localStorage`.
