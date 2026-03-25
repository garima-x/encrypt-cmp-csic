# ENCRYPT CMP

### Blockchain-Anchored Consent Management Platform for India’s DPDP Act (2023)

CSIC 1.0 MVP | SDK · Admin Dashboard · Smart Contract · Demo Apps

---

## Overview

ENCRYPT CMP is a lightweight, drop-in Consent Management Platform (CMP) built specifically for India’s Digital Personal Data Protection Act (DPDP Act, 2023).

It enables digital services to collect, manage, and audit user consent in a compliant, verifiable, and user-friendly manner — without requiring complex setup, build tools, or external dependencies.

---

## Quick Start

Add a single script tag to your website:

```html
<script
  src="./encrypt-cmp.js"
  data-org="YourOrg"
  data-lang="en">
</script>
```

Optional backend integration:

```html
<script
  src="./encrypt-cmp.js"
  data-org="YourOrg"
  data-lang="en"
  data-supabase-url="https://your-project.supabase.co"
  data-supabase-key="your-anon-key"
  data-policy-version="1.0.0">
</script>
```

---

## Why ENCRYPT CMP

* Built for **India’s DPDP Act**, not adapted from GDPR tools
* **Purpose-based consent** with granular controls
* **Revocation at any time**, per purpose
* **Multilingual notices** (6 Indian languages)
* **Verifiable consent receipts** with blockchain anchoring
* **No build step, no npm, no dependencies**

---

## Core Features

### 1. Purpose-Based Consent

Five independent consent categories:

* Necessary (always enabled)
* Analytics
* Marketing
* Personalization
* Third-party sharing

### 2. Real-Time Consent Management

* Accept / Reject / Customize flows
* Live updates via JavaScript events
* Immediate enforcement on the host application

### 3. Consent Receipts

Each action generates a structured receipt:

* Unique ID (UUID)
* Device identifier
* Timestamp and expiry
* Consent model (DPDP / GDPR)
* Purpose-level breakdown

Receipts are:

* Downloadable by users
* Stored (optional backend)
* Anchored on Ethereum Sepolia (tamper-evident)

### 4. Privacy Risk Meter

Dynamic risk scoring (0–100) based on enabled purposes, helping users make informed decisions.

### 5. Multilingual Support

Supported languages:
`en`, `hi`, `te`, `ta`, `kn`, `ml`

---

## How It Works

1. Script loads and reads configuration from `data-*` attributes
2. Generates a device ID (`crypto.randomUUID()`)
3. Detects jurisdiction (DPDP / GDPR)
4. Injects consent UI into the page
5. Loads existing consent state (if available)
6. Emits events for host application logic
7. Stores consent data (if backend configured)

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
window.EncryptCMP.setLang('ta')

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

## Repository Structure

```
encrypt-cmp-csic/
│
├── encrypt-cmp.js          # Core SDK
├── index.html              # Product page
├── suraksha-setu.html      # Legacy demo
│
├── demo/
│   ├── bharatfinance/      # Fintech demo
│   └── suraksha-setu/      # Government demo
│
└── admin/
    └── index.html          # Admin dashboard
```

---

## Demo Applications

### BharatFinance (Digital Lending)

Simulates a digital loan lending platform (NBFC-style use case) where consent is critical before processing sensitive financial data.

Key aspects:

* Consent before collecting financial data (PAN, Aadhaar, bank statements, etc.)
* Purpose-based permissions for credit scoring, analytics, and third-party sharing
* Real-time consent dashboard integrated with the SDK
* Demonstrates compliance in high-risk financial data environments

### SurakshaSetu (FIR Filing System)

Represents a citizen-facing police platform for filing FIRs (First Information Reports).

Key aspects:

* Consent collection before submitting personal and sensitive complaint data
* Clear disclosure of how data is used across departments
* Demonstrates DPDP compliance in public-sector workflows
* Highlights consent handling in sensitive legal and identity-related submissions

---

#

Provides:

* Consent analytics
* Audit logs
* Receipt lookup

Designed for Data Protection Officers (DPOs).

---

## Backend Schema (Supabase)

```sql
consent_records (
  device_id text PRIMARY KEY,
  purposes jsonb,
  updated_at timestamptz,
  expires_at timestamptz,
  consent_model text
)

consent_receipts (
  id uuid PRIMARY KEY,
  subject_id text,
  purposes jsonb,
  expires_at timestamptz,
  consent_model text,
  org text,
  policy_version text
)

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

| Requirement            | Implementation                   |
| ---------------------- | -------------------------------- |
| Explicit consent       | Banner with clear actions        |
| Purpose limitation     | Independent toggles              |
| Withdrawal             | API + UI controls                |
| Notice                 | Multilingual UI                  |
| Consent record         | JSON receipt + blockchain anchor |
| Time-bound consent     | Expiry tracking                  |
| User rights            | Rights panel                     |
| Third-party disclosure | Vendor registry                  |
| Auditability           | Event logs                       |

---

## CSIC 1.0 Context

Developed under:
**Cluster 9 — Governance, Operations & Privacy**

This project provides a working technical reference for implementing DPDP-compliant consent systems in Indian digital applications.

---

## License

MIT License

---

## Disclaimer

BharatFinance and SurakshaSetu are fictional demo entities. Any regulatory identifiers are illustrative.
