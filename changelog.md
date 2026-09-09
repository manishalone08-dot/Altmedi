# AltMedi Changelog

All notable changes to the **AltMedi** project are documented chronologically in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- **Phase 4 foundation (in progress):** PostgreSQL environment configuration, validated Prisma data model for the nine documented core tables, database lifecycle scripts, and an Express API bootstrap with a database health endpoint.

### Planned
- Integration of live `@google/genai` Gemini 2.0 Flash multimodal endpoint for processing real camera snapshots of cursive prescriptions.
- PostgreSQL database migration with Prisma schema to replace in-memory catalog data.
- WhatsApp and SMS notifications for reservation confirmations and pharmacist verification status.
- Integration with Ayushman Bharat Digital Mission (ABDM) Milestone 1 & 2 APIs.

---

## [1.2.0] - 2026-09-08

### Added
- **AI Persistent Context & Architecture Repository**:
  - `decisions.md`: Comprehensive Architectural Decision Records (ADRs DEC-001 through DEC-008) documenting rationale, alternatives, and clinical impacts.
  - `rules.md`: Strict AI engineering standards, folder structures, naming conventions, UI/UX consistency guides, git commit rules, and non-destructive modification mandates.
  - `memory.md`: Complete long-term project memory including ER diagram, database schema summary, API endpoints, business logic algorithms, known issues, and roadmap.
  - `changelog.md`: Chronological history of all platform versions.

### Changed
- Refactored internal documentation standards to enforce non-breaking development protocols.

---

## [1.1.0] - 2026-09-08

### Added
- **Clinical Authentication & Identity Subsystem (`src/components/auth/AuthScreen.tsx`)**:
  - Unified modal and standalone login/registration screen supporting 6 roles: Patient, Pharmacist, Doctor, Vendor/Chemist, Tenant Admin, and Platform Super Admin.
  - Role-specific credential collection:
    - **Patient**: ABHA Health ID (`91-XXXX-XXXX-XXXX`), Known drug allergies checklist (Penicillin, Sulfa, NSAIDs, Cephalosporins, Macrolides, Opioids), and Nashik locality picker.
    - **Doctor**: Medical Council Registration number (MMC/NMC), medical speciality, and hospital affiliation.
    - **Pharmacist**: State Pharmacy Council license number (`MH-PH-XXXXX`) and pharmacy affiliation.
    - **Vendor**: Drug License number (Form 20B/21B) and pharmacy establishment name.
  - Quick-switch demo accounts pre-seeded with verified identities for all 6 roles.
  - Guest mode allowing instant evaluation without requiring upfront credentials.
- **Session & Identity Service (`src/services/authService.ts`)**:
  - LocalStorage persistence for user sessions under key `altmedi_auth_session`.
  - Helper methods: `loginWithCredentials`, `loginWithDemoUser`, `registerNewUser`, `logoutUser`, and `getStoredAuthUser`.
- **Adaptive Header & Session Banner (`src/App.tsx`, `src/components/layout/Header.tsx`)**:
  - Top header user pill displaying active user name, verified role badge, and organization.
  - Interactive guest mode notification banner with direct CTA buttons to sign in or create an account.
  - Dynamic user-switching dialog trigger.

### Changed
- Expanded `AuthUser` interface in `src/types/index.ts` with clinical profile fields (`licenseNumber`, `organization`, `speciality`, `abhaId`, `knownAllergies`, `area`, `isVerified`).
- Updated `App.tsx` state to dynamically adapt viewport mode upon role change (switching to professional roles automatically activates the desktop portal).

### Fixed
- Fixed session persistence bug where page refresh cleared logged-in user state.

---

## [1.0.0] - 2026-09-08

### Added
- **Dual-UX Architecture**:
  - Integrated single-page application with toggle between **Patient Mobile App** (`max-w-md`) and **Desktop Authoritative Portal** (`max-w-7xl`).
- **Patient Mobile Experience (`src/components/patient/`)**:
  - **Prescription Camera (`PrescriptionCamera.tsx`)**: Camera viewfinder with simulated video feed, reticle guides, sample doctor slip selectors, and photo capture animation.
  - **Prescription Item Extraction (`ExtractionReview.tsx`)**: OCR confidence scoring, medicine name normalization, and ambiguity resolution (e.g. resolving between Calpol and Dolo).
  - **Medicine Comparison Engine (`MedicineComparisonView.tsx`)**:
    - Two-tier categorization separating *Same Active Ingredient* (bioequivalent) from *Therapeutic Alternatives*.
    - Visual percentage and absolute rupee savings calculator against standard MRP.
    - Active ingredient and dosage strength side-by-side comparison tables.
    - Real-time stock indicators from local Nashik pharmacies (College Road, Canada Corner, Panchavati).
    - Dynamic filter bar (*Same Generic Only*, *Price: Low to High*, *Distance: Nearest First*).
    - Offer freshness tracking marking inventory older than 7 days as `stale`.
    - Safety and adverse reaction monographs with allergy cross-reactivity warnings.
    - Local pharmacy reservation workflow with confirmation receipts.
  - **Pharmacist Review Modal (`PharmacistReviewModal.tsx`)**: 1-click patient substitution verification request with urgency designation.
- **Authoritative Desktop Portal (`src/components/portal/DesktopAuthoritativePortal.tsx`)**:
  - **Pharmacist Review Queue**: Clinical verification workspace for incoming patient substitution requests with side-by-side comparisons and mandatory regulatory rationale recording.
  - **Doctor Prescriber Workspace**: Clinical formulary browser, bioequivalence verification guidelines, and local price variance data.
  - **Vendor Inventory & Pricing**: Real-time price and stock editor for partner pharmacies with instant audit logging.
  - **Super Admin Governance**: Medicine mapping controls (`approved`, `quarantined`, `deprecated`).
  - **Immutable Clinical Audit Log**: Centralized audit log table tracking all clinical decisions, inventory adjustments, and catalog updates.
- **Service Layer & Pre-Seeded Catalog (`src/services/`)**:
  - `api.ts`: Reactive in-memory domain service implementing medicine search, alternatives matching, simulated prescription parsing, review queues, and audit logging.
  - `catalogData.ts`: Realistic pharmaceutical catalog containing Indian brands (Augmentin 625 Duo, Moxikind-CV 625, Pan-D, Pantocid DSR, Calpol 650, Dolo 650, Telma 40, Telmikind 40) mapped to Nashik pharmacies.
- **TypeScript Domain Schema (`src/types/index.ts`)**:
  - Core interfaces: `MedicineEntity`, `MedicineMapping`, `SafetyContent`, `VendorOffer`, `PharmacistReview`, `AuditEvent`, `TenantContext`, `ExtractedPrescriptionItem`.

### Changed
- Configured Vite with `@tailwindcss/vite` (Tailwind CSS v4) and React 19 compiler plugins.

---

## [0.1.0] - 2026-09-08

### Added
- Initial project scaffolding with Vite, React 19, TypeScript, and Tailwind CSS v4.
- Application metadata in `metadata.json` declaring camera permissions and server-side Gemini API capability.
- Environment variables template in `.env.example`.
