# ENCRYPT CMP

### Blockchain-Anchored Consent Management Platform for India's DPDP Act (2023)

**CSIC 1.0 MVP | Cluster 9 — Governance, Operations & Privacy**

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![DPDP Compliant](https://img.shields.io/badge/DPDP-Compliant-orange.svg)](#dpdp-compliance-coverage)
[![GDPR Ready](https://img.shields.io/badge/GDPR-Ready-blue.svg)](#dpdp-compliance-coverage)



## Overview

ENCRYPT CMP is a lightweight, drop-in **Consent Management Platform (CMP)** built specifically for India's **Digital Personal Data Protection Act (DPDP Act, 2023)**. It enables digital services to collect, manage, and audit user consent in a compliant, verifiable, and user-friendly manner — without requiring complex setup, build tools, or external dependencies.

---

## Table of Contents

- [Live Demo Links](#live-demo-links)
- [Quick Start](#quick-start)
- [Why ENCRYPT CMP](#why-encrypt-cmp)
- [Core Features](#core-features)
- [Repository Structure](#repository-structure)
- [File Descriptions](#file-descriptions)
- [Demo Applications](#demo-applications)
- [JavaScript API](#javascript-api)
- [Backend Schema](#backend-schema-supabase)
- [DPDP Compliance Coverage](#dpdp-compliance-coverage)
- [License](#license)

---

---

## Live Demo Links

| Demo | Description | URL |
|------|-------------|-----|
| Main SDK | Product landing page with interactive demo | [encrypt-cmp-csic-final.vercel.app](https://encrypt-cmp-csic-final.vercel.app) |
| BharatFinance | Digital lending platform demo | [encrypt-cmp-csic-final.vercel.app/bharatfinance.html](https://encrypt-cmp-csic-final.vercel.app/bharatfinance.html) |
| SurakshaSetu | Government FIR filing portal demo | [encrypt-cmp-csic-final.vercel.app/suraksha-setu.html](https://encrypt-cmp-csic-final.vercel.app/suraksha-setu.html) |
| Admin Portal | DPO dashboard for consent management | [encrypt-cmp-csic-final.vercel.app/admin.html](https://encrypt-cmp-csic-final.vercel.app/admin.html) |

---
## Quick Start

Add a single script tag to your website:

```html
<script
  src="./encrypt-cmp.js"
  data-org="YourOrg"
  data-lang="en">
</script>
<script
  src="./encrypt-cmp.js"
  data-org="YourOrg"
  data-lang="en"
  data-supabase-url="https://your-project.supabase.co"
  data-supabase-key="your-anon-key"
  data-policy-version="1.0.0">
</script>

---


## Why ENCRYPT CMP

| Feature | Description |
|---------|-------------|
| **India-First** | Built for DPDP Act, not adapted from GDPR tools |
| **Purpose-Based Consent** | Granular controls per data processing purpose |
| **Revocation Support** | Users can revoke consent at any time |
| **Multilingual** | 6 Indian languages supported |
| **Verifiable Receipts** | Blockchain-anchored consent records |
| **Zero Dependencies** | No build step, no npm, no external dependencies |

---

## Core Features

### 1. Purpose-Based Consent
Five independent consent categories:
- **Necessary** (always enabled)
- **Analytics**
- **Marketing**
- **Personalization**
- **Third-party Sharing**

### 2. Real-Time Consent Management
- Accept / Reject / Customize flows
- Live updates via JavaScript events
- Immediate enforcement on the host application

### 3. Consent Receipts
Each action generates a structured receipt containing:
- Unique ID (UUID)
- Device identifier
- Timestamp and expiry
- Consent model (DPDP / GDPR)
- Purpose-level breakdown

Receipts are downloadable, stored (optional backend), and anchored on **Ethereum Sepolia** (tamper-evident).

### 4. Privacy Risk Meter
Dynamic risk scoring (0–100) based on enabled purposes, helping users make informed decisions.

### 5. Multilingual Support
Supported languages: `English`, `Hindi`, `Telugu`, `Tamil`, `Kannada`, `Malayalam`

---

## Repository Structure

```
encrypt-cmp-csic/
├── LICENSE                 # MIT License
├── README.md               # Project documentation (this file)
├── encrypt-cmp.js          # Core SDK — embeddable consent management script
├── index.html              # Product landing page
├── bharatfinance.html      # Demo: Digital lending platform (NBFC use case)
├── suraksha-setu.html      # Demo: Government FIR filing portal
└── admin.html              # Admin dashboard for DPOs
```

---

## File Descriptions

### Core Files

| File | Description |
|------|-------------|
| **`encrypt-cmp.js`** | The core SDK file (796 lines). A self-contained, embeddable JavaScript module that handles consent collection, storage, UI rendering, risk scoring, multilingual support, Supabase integration, and blockchain anchoring. Drop this single file into any website to enable DPDP-compliant consent management. |
| **`LICENSE`** | MIT License file permitting open-source use, modification, and distribution of the codebase. |
| **`README.md`** | Comprehensive project documentation including setup instructions, API reference, file descriptions, and compliance mapping. |

### Demo Applications

| File | Description |
|------|-------------|
| **`index.html`** | Product landing page (1355 lines). Showcases the ENCRYPT CMP SDK with an interactive demo including language switcher (6 languages), region simulator (India/EU), purpose toggles, privacy risk meter, consent receipts, vendor modal, and data rights panel. Serves as a reference implementation and testing ground. |
| **`bharatfinance.html`** | BharatFinance Demo (800 lines). Simulates a fictional RBI-regulated digital lending platform (NBFC-style). Demonstrates consent collection in high-risk financial data environments including loan calculators, EMI displays, and consent before collecting sensitive data (PAN, Aadhaar, bank statements). Features a purple glassmorphism UI theme. |
| **`suraksha-setu.html`** | SurakshaSetu Demo (803 lines). Simulates a fictional Ministry of Home Affairs FIR filing portal. Demonstrates DPDP compliance in government/public-sector workflows with consent collection before submitting personal complaint data. Features a dark theme with Indian tricolor accents (saffron, white, green). |
| **`admin.html`** | Admin Dashboard (2494 lines). A comprehensive Data Protection Officer (DPO) portal featuring: consent analytics with Chart.js visualizations, audit log viewer, receipt lookup, user management, purpose configuration, blockchain chain vault monitoring, SDK benchmark testing, compliance reports, and notification center. Built with glassmorphism UI. |

---

## Demo Applications

### BharatFinance (Digital Lending)
> **File:** `bharatfinance.html`

Simulates a digital loan lending platform where consent is critical before processing sensitive financial data.

**Key Aspects:**
- Consent before collecting financial data (PAN, Aadhaar, bank statements)
- Purpose-based permissions for credit scoring, analytics, and third-party sharing
- Real-time consent dashboard integrated with the SDK
- Demonstrates compliance in high-risk financial data environments

### SurakshaSetu (FIR Filing System)
> **File:** `suraksha-setu.html`

Represents a citizen-facing police platform for filing First Information Reports (FIRs).

**Key Aspects:**
- Consent collection before submitting personal and sensitive complaint data
- Clear disclosure of how data is used across departments
- Demonstrates DPDP compliance in public-sector workflows
- Highlights consent handling in sensitive legal and identity-related submissions

### Admin Dashboard
> **File:** `admin.html`

Designed for Data Protection Officers (DPOs) to manage consent across the organization.

**Key Aspects:**
- Consent analytics with trend visualization
- Complete audit log for compliance reporting
- Receipt lookup and verification
- Blockchain anchor verification
- SDK performance benchmarks

---

## JavaScript API

```js
// Get current consent state
window.EncryptCMP.getConsent()

// Revoke specific purpose
window.EncryptCMP.revokeConsent('marketing')

// Revoke all non-essential purposes
window.EncryptCMP.revokeAll()

// Get latest consent receipt
window.EncryptCMP.getReceipt()

// Show consent banner again
window.EncryptCMP.showBanner()

// Change language
window.EncryptCMP.setLang('ta')  // Tamil

// Check if consent has been given
window.EncryptCMP.isConsentGiven()
```

### Event Handling

```js
window.addEventListener('encrypt-cmp:accept', (e) => {
  if (e.detail.purposes.analytics) initAnalytics()
})

window.addEventListener('encrypt-cmp:revoke', (e) => {
  console.log('Revoked:', e.detail.purpose)
})
```

---

## Backend Schema (Supabase)

```sql
-- Consent records table
consent_records (
  device_id text PRIMARY KEY,
  purposes jsonb,
  updated_at timestamptz,
  expires_at timestamptz,
  consent_model text
)

-- Consent receipts table
consent_receipts (
  id uuid PRIMARY KEY,
  subject_id text,
  purposes jsonb,
  expires_at timestamptz,
  consent_model text,
  org text,
  policy_version text
)

-- Audit logs table
audit_logs (
  event_type text,
  actor_id text,
  actor_role text,
  details jsonb,
  created_at timestamptz
)
```

---

## DPDP Compliance Coverage

| DPDP Requirement | Implementation |
|------------------|----------------|
| Explicit consent | Banner with clear actions |
| Purpose limitation | Independent toggles per purpose |
| Withdrawal rights | API + UI controls for revocation |
| Notice requirements | Multilingual UI in 6 languages |
| Consent record keeping | JSON receipt + blockchain anchor |
| Time-bound consent | Configurable expiry tracking |
| Data principal rights | Rights information panel |
| Third-party disclosure | Vendor registry modal |
| Auditability | Complete event logging |

---

## How It Works

1. Script loads and reads configuration from `data-*` attributes
2. Generates a device ID (`crypto.randomUUID()`)
3. Detects jurisdiction (DPDP / GDPR) based on region
4. Injects consent UI into the page
5. Loads existing consent state (if available)
6. Emits events for host application logic
7. Stores consent data (if backend configured)
8. Anchors consent hash to Ethereum Sepolia (tamper-evident)

---

## CSIC 1.0 Context

Developed under **Cluster 9 — Governance, Operations & Privacy** for the Cyber Security Innovation Challenge (CSIC) 1.0.

This project provides a working technical reference for implementing DPDP-compliant consent systems in Indian digital applications.

---

## License

MIT License — See [LICENSE](LICENSE) for details.

---

## Disclaimer

**BharatFinance** and **SurakshaSetu** are fictional demo entities created for demonstration purposes only. Any regulatory identifiers, RBI registration numbers, or government references are purely illustrative and do not represent actual licensed entities.

---


