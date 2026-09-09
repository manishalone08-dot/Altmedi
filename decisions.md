# AltMedi Architecture & Product Decisions (ADR)

This document records every significant architectural, technical, product, and clinical governance decision made for **AltMedi**—the medicine comparison and medication decision-support platform for India.

---

## Decision Index

| ID | Title | Status | Date | Primary Area |
| :--- | :--- | :--- | :--- | :--- |
| **[DEC-001](#dec-001-two-tier-alternative-classification-system)** | Two-Tier Alternative Classification System | **Accepted** | 2026-08-05 | Clinical Governance & Data Model |
| **[DEC-002](#dec-002-dual-ux-architecture-patient-mobile-vs-authoritative-desktop-portal)** | Dual-UX Architecture: Patient Mobile vs Authoritative Desktop Portal | **Accepted** | 2026-08-10 | Frontend & User Experience |
| **[DEC-003](#dec-003-multi-tenant-regional-pilot-architecture-nashik-network)** | Multi-Tenant Regional Pilot Architecture (Nashik Network) | **Accepted** | 2026-08-14 | Systems Architecture & Security |
| **[DEC-004](#dec-004-server-side-gemini-ai-for-handwritten-prescription-ocr--disambiguation)** | Server-Side Gemini AI for Handwritten Prescription OCR & Disambiguation | **Accepted** | 2026-08-18 | AI & Clinical Decision Support |
| **[DEC-005](#dec-005-mandatory-human-in-the-loop-pharmacist-review-workflow)** | Mandatory Human-in-the-Loop Pharmacist Review Workflow | **Accepted** | 2026-08-25 | Regulatory & Medical Safety |
| **[DEC-006](#dec-006-vendor-offer-freshness-tracking--stale-inventory-safeguards)** | Vendor Offer Freshness Tracking & Stale Inventory Safeguards | **Accepted** | 2026-08-28 | Marketplace & Inventory |
| **[DEC-007](#dec-007-immutable-clinical-audit-logging-for-all-governance-events)** | Immutable Clinical Audit Logging for All Governance Events | **Accepted** | 2026-09-01 | Compliance & Legal Defense |
| **[DEC-008](#dec-008-role-adaptive-authentication-with-abha--medical-license-verification)** | Role-Adaptive Authentication with ABHA & Medical License Verification | **Accepted** | 2026-09-08 | Authentication & Identity |

---

## DEC-001: Two-Tier Alternative Classification System

### Date
2026-08-05

### Context / Problem
In India, the pharmaceutical market contains thousands of branded generics, generic-generics (Jan Aushadhi), and combination formulations. Substituting prescribed drugs without clinical distinction between chemically identical molecules versus therapeutic class substitutes poses extreme medical risks (e.g., adverse drug interactions, allergic reactions, altered pharmacokinetic bioavailability). Under Central Drugs Standard Control Organisation (CDSCO) guidelines and the Drugs and Cosmetics Act (1940), an automated platform must never conflate bioequivalent generics with class-level therapeutic alternatives.

### Decision Taken
Enforce a strict, enum-based two-tier classification for all medicine mappings:
1. `same_active_ingredient`: Exact active pharmaceutical ingredient (API), identical strength, and identical or bioequivalent dosage form (e.g., Augmentin 625 Duo $\leftrightarrow$ Moxikind-CV 625 $\leftrightarrow$ Amoxyclav 625).
2. `therapeutic_alternative`: Different chemical entity or subclass within a related therapeutic therapeutic indication (e.g., Augmentin 625 [Amoxicillin + Clavulanate] $\leftrightarrow$ Zifi 200 [Cefixime]).
3. `not_comparable`: Explicit quarantine designation for medicines that must never be presented as substitutes.

### Reasoning
- Bioequivalent generics (`same_active_ingredient`) allow safe substitution under patient consent and standard pharmacy practice, unlocking massive savings (50% to 80%) via Jan Aushadhi or lower-cost Indian generics.
- Therapeutic alternatives (`therapeutic_alternative`) carry differing contraindications, allergy risks, and efficacy profiles. These legally require registered medical practitioner (prescriber) or clinical pharmacist approval before dispensing.
- High-contrast visual indicators (Emerald Green for Same Active Ingredient, Amber/Orange for Therapeutic Alternative) prevent accidental patient or chemist confusion.

### Alternatives Considered
- **Single Flat Alternatives List**: Rejected because mixing bioequivalent generics with broad class alternatives causes dangerous clinical errors and violates CDSCO ethical guidelines.
- **Unconstrained LLM Recommendation Engine**: Rejected because probabilistic LLMs can hallucinate equivalent dosages or suggest contraindicated substitutions without verified pharmacological cross-checks.

### Impact on Project
- Core entity `MedicineMapping` strictly requires `classification: AlternativeClassification` with a confidence score and reviewed clinical rationale.
- UI renders separate comparison tabs/badges and enforces pharmacist review triggers for all therapeutic alternatives.

---

## DEC-002: Dual-UX Architecture: Patient Mobile vs Authoritative Desktop Portal

### Date
2026-08-10

### Context / Problem
AltMedi serves two radically divergent user cohorts with conflicting ergonomic requirements:
1. **Patients & Caregivers**: Overwhelmingly access the service on mobile phones; require simple camera access to snap doctor prescription slips, large touch targets, instant savings calculators, and local pharmacy navigation.
2. **Healthcare Professionals & Administrators**: Doctors, pharmacists, retail chemists, and hospital/government administrators work on widescreen desktop or POS terminals requiring dense data grids, rapid tabular verification, side-by-side clinical monographs, and regulatory audit review.

### Decision Taken
Implement a unified single-page application (SPA) featuring a dual-viewport runtime architecture:
- **Mobile Container Mode**: Constrained, mobile-optimized experience (`max-w-md`) with embedded camera stream, OCR item-review stepper, interactive comparison cards, and reservation modals.
- **Desktop Authoritative Portal Mode**: Full-width high-density multi-role console (`max-w-7xl`) tailored with tabs for Pharmacists (Queue), Prescribers (Clinical View), Chemists/Vendors (Live Inventory), and Platform/Tenant Admins (Catalog Governance & Audit Trail).
- Seamless instant switching via header role selector and viewport toggle.

### Reasoning
- Building two distinct codebases or separate repos would double maintenance overhead, fragment type definitions, and slow down rapid pilot iteration in Nashik.
- A responsive-only layout without distinct mode containers compromises either mobile usability (cramped tables) or desktop productivity (excessive whitespace and mobile-style cards).

### Alternatives Considered
- **Separate Web Apps (Micro-frontends / Subdomains)**: Rejected for MVP/Pilot phase due to deployment complexity, separate session synchronization, and elevated infrastructure overhead.
- **Pure Fluid Responsive Layout**: Tested and rejected; clinical review queues require wide tabular layouts with multi-column audit data that degrade poorly into mobile accordions.

### Impact on Project
- `src/App.tsx` controls top-level mode state (`viewMode: 'mobile' | 'desktop'`).
- Switching to any professional role automatically defaults to the desktop authoritative view, while patient persona defaults to the mobile container.

---

## DEC-003: Multi-Tenant Regional Pilot Architecture (Nashik Network)

### Date
2026-08-14

### Context / Problem
AltMedi is initiating real-world pilot deployments in Nashik, Maharashtra (`pilot-nashik-01`), partnering with local chemists (College Road, Canada Corner, Panchavati) and regional clinic networks. As the platform expands to Pune, Mumbai, and other districts, data must remain partitioned per healthcare network/district authority while sharing a single standardized national drug master database.

### Decision Taken
Incorporate `TenantContext` across all runtime services, database interfaces, and audit events:
- Master Drug Catalog is globally canonical, verified against CDSCO and Jan Aushadhi standards.
- Vendor offers, stock counts, pharmacist review tickets, user accounts, and audit entries are strictly scoped by `tenantId` (e.g., `pilot-nashik-01`).
- Geofenced pharmacy discovery is centered around local Nashik localities (College Road, Canada Corner, Panchavati, Nashik Road, Indira Nagar).

### Reasoning
- Protects commercial confidentiality between competing pharmacy networks.
- Enables localized compliance reporting to district health officers and hospital administrators.
- Permits multi-tenant cloud scaling without rewrites when migrating from pilot to enterprise SaaS.

### Alternatives Considered
- **Single-Tenant Hardcoded Schema**: Fast to prototype, but requires complete architectural refactoring when onboarding secondary clinic networks or hospital chains.
- **Full Database-per-Tenant Multi-Tenancy**: Unnecessary operational overhead for pilot phase; logical isolation via `tenantId` in shared schemas provides sufficient isolation with far simpler operations.

### Impact on Project
- All mutations in `AltMediService` associate operations with `this.tenantContext.tenantId`.
- UI headers and footers display tenant status (`Nashik Central Healthcare Network`) to reinforce operational context.

---

## DEC-004: Server-Side Gemini AI for Handwritten Prescription OCR & Disambiguation

### Date
2026-08-18

### Context / Problem
Indian doctor prescriptions are predominantly handwritten in rapid cursive, frequently contain local brand abbreviations (e.g., "Tab. Pan-D 1 cap OD bb", "Augmentin 625 1 BD x 5d"), and lack standard barcode identifiers. Standard Optical Character Recognition (OCR) engines (e.g., Tesseract) exhibit >65% error rates on doctor handwriting. An incorrect OCR match could suggest a wrong drug, resulting in catastrophic health consequences.

### Decision Taken
Integrate `@google/genai` (Gemini multimodal model) via a secure server-side API interface with strict structured JSON output:
1. Multimodal visual parsing extracts medicine name, dosage strength, form, frequency, and duration.
2. Confidence scoring per extracted line item (`confidence: number`).
3. Explicit ambiguity detection (`isAmbiguous: true` with `ambiguousCandidates: MedicineEntity[]`) whenever optical certainty is below 0.85 or matches multiple brand names (e.g., Calpol 650 vs Dolo 650).
4. Mandatory patient confirmation screen (`ExtractionReview.tsx`) before routing to price comparison.

### Reasoning
- Gemini's multimodal reasoning understands medical abbreviations, doctor handwriting patterns, and dosage context far better than classical OCR.
- The `isAmbiguous` fail-safe prevents automatic wrong matches by empowering the user to choose the correct candidate from a curated list.

### Alternatives Considered
- **Pure Client-Side Tesseract OCR**: Rejected due to unacceptable error rates on Indian physician handwriting and lack of medical context comprehension.
- **Fully Automated Direct Matching without Review**: Rejected as a gross safety hazard. Every extracted item must be confirmed or editable by the human user.

### Impact on Project
- Added `requestFramePermissions: ["camera"]` and `MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API` in `metadata.json`.
- Implemented `PrescriptionCamera.tsx` and `ExtractionReview.tsx` components with ambiguity resolution UI.

---

## DEC-005: Mandatory Human-in-the-Loop Pharmacist Review Workflow

### Date
2026-08-25

### Context / Problem
Section 65 of the Indian Drugs and Cosmetics Rules (1945) mandates that Schedule H and Schedule H1 substances may only be dispensed under the direct supervision of a registered pharmacist upon a valid prescription. Any medicine substitution—even bioequivalent—requires certified professional verification and informed patient consent.

### Decision Taken
Construct an end-to-end Pharmacist Review Subsystem:
1. Patients can click **"Request Pharmacist Review"** on any medicine comparison card.
2. Creates an immediate `PharmacistReview` ticket in status `in_review` with urgency rating (`routine` vs `urgent`).
3. Registered Pharmacists access the ticket in the Authoritative Desktop Portal, review the original and proposed medicine, inspect bioequivalence data, and make an immutable decision (`confirmed` or `rejected`).
4. Requires entry of a mandatory clinical rationale and pharmacist registration license number (e.g., `MH-PH-82194`).

### Reasoning
- Eliminates legal liability for AltMedi by ensuring that software provides decision support rather than automated dispensing.
- Enhances pharmacy partner trust by respecting the pharmacist’s professional expertise and clinical judgment.
- Creates an auditable chain of custody required for NABH (National Accreditation Board for Hospitals & Healthcare Providers) compliance.

### Alternatives Considered
- **Pure Informational Disclaimer ("Consult your doctor")**: Inadequate for patient conversion; patients abandon substitutions when they lack immediate chemist confirmation.
- **Automated AI Substitution Approvals**: Strictly prohibited by Indian drug dispensing laws.

### Impact on Project
- Implemented `PharmacistReviewModal.tsx`, `PharmacistReview` interface, and the dedicated Review Queue in `DesktopAuthoritativePortal.tsx`.

---

## DEC-006: Vendor Offer Freshness Tracking & Stale Inventory Safeguards

### Date
2026-08-28

### Context / Problem
Community pharmacy stock levels and retail discounts in India change daily. If an app advertises a ₹118 generic alternative that is out-of-stock or sold at ₹148 when the patient walks into the shop, user trust collapses and the platform fails.

### Decision Taken
Implement granular inventory freshness tracking:
1. Every `VendorOffer` contains `updatedAt`, `freshness: 'fresh' | 'stale' | 'expired'`, and `isStale: boolean`.
2. Any offer unverified for more than 7 days is automatically marked as `stale` with an Amber alert badge.
3. Offers older than 14 days are downgraded to `expired` and excluded from top recommendations.
4. Added interactive inventory checks ("Check Live Stock") with simulated real-time query latency and pack reservation locks.

### Reasoning
- Protects patients from fruitless trips to out-of-stock pharmacies.
- Motivates partner pharmacies to update their stock feeds and price sheets via the Vendor Portal to stay featured in search results.

### Alternatives Considered
- **Hard Hiding of Any Offer >24h Old**: Rejected during pilot phase because community chemists do not update inventory daily, which would lead to an empty catalog.
- **Static Catalog Pricing Only**: Rejected because street prices in Nashik vary up to 25% across different chemist chains and independent pharmacies.

### Impact on Project
- Color-coded badges in `MedicineComparisonView.tsx`: Emerald for Fresh Stock, Amber for Stale Offer, Red for Out of Stock.
- Vendor quick-update panel in `DesktopAuthoritativePortal.tsx` to refresh live pricing and stock count in 1 click.

---

## DEC-007: Immutable Clinical Audit Logging for All Governance Events

### Date
2026-09-01

### Context / Problem
In clinical healthcare software, every data modification affecting patient care, drug mappings, dispensing decisions, and vendor pricing must be traceable for medical negligence defense, drug recall investigations, and statutory inspections.

### Decision Taken
Implement an immutable event log pattern (`AuditEvent`):
- All status modifications (`MAPPING_APPROVED`, `MAPPING_QUARANTINED`, `SUBSTITUTION_CONFIRMED`, `SUBSTITUTION_REJECTED`, `OFFER_UPDATED`) must generate an audit record.
- Audit entries record `id`, `timestamp`, `actor`, `actorRole`, `tenantId`, `action`, `entityType`, `entityId`, `oldValue`, `newValue`, `reason`, and `sourceIp`.
- Audit logs are read-only and rendered in the Platform Admin dashboard.

### Reasoning
- Meets CDSCO, ISO 27001, and Indian Digital Personal Data Protection Act (DPDP) standards for healthcare informatics.
- Simplifies post-incident forensics if an erroneous substitution or price tampering occurs.

### Alternatives Considered
- **Console Log / Ephemeral Server Logs**: Inadequate because logs are lost upon container restart or rotate out before audit cycles.
- **Relying on Database Update Timestamps**: Insufficient because simple `updated_at` timestamps overwrite historical values without preserving the reason or the previous state.

### Impact on Project
- Centralized `logAudit` pipeline in `src/services/api.ts`.
- Real-time audit stream viewer in `DesktopAuthoritativePortal.tsx`.

---

## DEC-008: Role-Adaptive Authentication with ABHA & Medical License Verification

### Date
2026-09-08

### Context / Problem
AltMedi must authenticate 6 distinct personas: Patients, Doctors, Pharmacists, Chemists/Vendors, Tenant Admins, and Platform Super Admins. Each persona possesses unique clinical identity credentials (ABHA IDs for patients, MMC/NMC medical registration for doctors, State Pharmacy Council licenses for pharmacists, Drug License numbers [Form 20B/21B] for chemists). A generic email/password auth flow fails to capture or validate these medical credentials.

### Decision Taken
Create a comprehensive, role-adaptive authentication system (`AuthScreen.tsx` + `authService.ts`):
1. **Modal & Standalone Auth Screen**: Supports Login, Registration, Demo Quick-Switching, and Guest Mode.
2. **Role-Specific Credential Schema**:
   - Patient: ABHA Health ID (`91-XXXX-XXXX-XXXX`), Known Drug Allergies (Penicillin, Sulfa, NSAIDs), Locality.
   - Doctor: Medical Council License (`MMC-YYYY/MM/XXXX`), Speciality, Hospital/Clinic Name.
   - Pharmacist: State Pharmacy Council Registration (`MH-PH-XXXXX`), Pharmacy Name.
   - Vendor / Chemist: Retail Drug License (`20B/21B-NK-XXXXX`), Pharmacy Chain / Outlet Name.
3. **Session Persistence**: Stored securely in `localStorage` under `altmedi_auth_session` with verified demo profiles pre-seeded for instantaneous testing across all roles.
4. **Header User Status Banner**: Displays active user, verified role badge, organization affiliation, and instant switch/sign-out controls.

### Reasoning
- Eliminates onboarding friction during stakeholder presentations and clinical pilot reviews.
- Lays the exact data foundation needed for future integration with the Ayushman Bharat Digital Mission (ABDM) M1/M2/M3 APIs and National Medical Register (NMR).

### Alternatives Considered
- **OAuth Only (Google / Social)**: Rejected because social logins lack medical council license numbers, pharmacy drug licenses, and ABHA identifiers.
- **Separate Portals with Distinct Login URLs**: Rejected for the pilot to allow frictionless paired demonstrations (e.g. demonstrating a patient requesting a review, then switching to the pharmacist to approve it).

### Impact on Project
- Added `AuthScreen.tsx`, updated `Header.tsx` with user pill and session indicators, added guest mode banner in `App.tsx`, and expanded `types/index.ts` with `AuthUser` profile fields.
