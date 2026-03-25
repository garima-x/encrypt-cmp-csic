# ENCRYPT CMP

### Blockchain-Anchored Consent Management Platform for India’s DPDP Act (2023)

**CSIC 1.0 MVP | Cluster 9 — Governance, Operations & Privacy**

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![DPDP Compliant](https://img.shields.io/badge/DPDP-Compliant-orange.svg)](#dpdp-compliance-coverage)
[![GDPR Ready](https://img.shields.io/badge/GDPR-Ready-blue.svg)](#dpdp-compliance-coverage)

---

## Table of Contents

* [Overview](#overview)
* [Problem Statement](#problem-statement)
* [Why ENCRYPT CMP](#why-encrypt-cmp)
* [Live Demo Links](#live-demo-links)
* [Quick Start](#quick-start)
* [Core Features](#core-features)
* [Why Blockchain Anchoring](#why-blockchain-anchoring)
* [Architecture Overview](#architecture-overview)
* [Repository Structure](#repository-structure)
* [Demo Applications](#demo-applications)
* [JavaScript API](#javascript-api)
* [Event Handling](#event-handling)
* [Backend Schema (Supabase)](#backend-schema-supabase)
* [DPDP Compliance Coverage](#dpdp-compliance-coverage)
* [Who Should Use This](#who-should-use-this)
* [CSIC 1.0 Context](#csic-10-context)
* [License](#license)
* [Disclaimer](#disclaimer)

---

## Overview

ENCRYPT CMP is a lightweight, drop-in **Consent Management Platform (CMP)** designed for India's **Digital Personal Data Protection Act (DPDP Act, 2023)**.

It enables applications to **collect, manage, audit, and verify user consent** in a compliant and user-friendly way — without complex setup, external dependencies, or build tools.

---

## Problem Statement

Most existing Consent Management Platforms are designed for **GDPR**, not India’s **DPDP Act**.

This creates gaps:

* No **purpose-based consent granularity**
* Poor **multilingual accessibility**
* Limited **revocation control**
* Weak **audit and verification mechanisms**

Indian startups, fintech platforms, and government systems lack a **simple, compliant, and scalable solution**.

**ENCRYPT CMP solves this by providing an India-first consent infrastructure.**

---

## Why ENCRYPT CMP

| Feature                   | Description                                  |
| ------------------------- | -------------------------------------------- |
| **India-First**           | Built specifically for DPDP Act requirements |
| **Purpose-Based Consent** | Fine-grained control per data usage          |
| **Revocation Support**    | Users can withdraw consent anytime           |
| **Multilingual**          | Supports 6 Indian languages                  |
| **Verifiable Receipts**   | Blockchain-anchored consent logs             |
| **Zero Dependencies**     | No npm, no frameworks, no build step         |

---

## Live Demo Links

| Demo          | Description                        | URL                                                          |
| ------------- | ---------------------------------- | ------------------------------------------------------------ |
| Main SDK      | Landing page with interactive demo | https://encrypt-cmp-csic-final.vercel.app                    |
| BharatFinance | Digital lending platform demo      | https://encrypt-cmp-csic-final.vercel.app/bharatfinance.html |
| SurakshaSetu  | FIR filing portal demo             | https://encrypt-cmp-csic-final.vercel.app/suraksha-setu.html |
| Admin Portal  | DPO dashboard                      | https://encrypt-cmp-csic-final.vercel.app/admin.html         |

---

## Quick Start

### Basic Integration

```html
<script
  src="./encrypt-cmp.js"
  data-org="YourOrg"
  data-lang="en">
</script>
```

### With Backend Integration (Optional)

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

## Core Features

### 1. Purpose-Based Consent

Five independent consent categories:

* Necessary (always enabled)
* Analytics
* Marketing
* Personalization
* Third-party Sharing

---

### 2. Real-Time Consent Management

* Accept / Reject / Customize flows
* Instant updates via JavaScript events
* Immediate enforcement on host application

---

### 3. Consent Receipts

Each interaction generates a structured receipt containing:

* UUID
* Device ID
* Timestamp & expiry
* Consent model (DPDP / GDPR)
* Purpose-level breakdown

Receipts are:

* Downloadable
* Backend-storable
* Blockchain-anchored

---

### 4. Privacy Risk Meter

Dynamic score (0–100) based on enabled permissions.

---

### 5. Multilingual Support

Supported languages:

* English
* Hindi
* Tamil
* Telugu
* Kannada
* Malayalam

---

## Why Blockchain Anchoring

Traditional logs can be altered or disputed.

ENCRYPT CMP anchors a **hash of each consent receipt** on Ethereum (Sepolia), making records:

* Tamper-evident
* Publicly verifiable
* Suitable for audits and disputes

No personal data is stored on-chain.

---

## Architecture Overview

1. SDK loads via script tag
2. Reads configuration from `data-*` attributes
3. Generates device ID (`crypto.randomUUID()`)
4. Displays consent UI
5. Captures user preferences
6. Stores consent locally or in backend (Supabase)
7. Anchors receipt hash on Ethereum (Sepolia)
8. Admin dashboard analyzes consent data

---

## Repository Structure

```
encrypt-cmp-csic/
├── LICENSE
├── README.md
├── encrypt-cmp.js
├── index.html
├── bharatfinance.html
├── suraksha-setu.html
└── admin.html
```

---

## Demo Applications

### BharatFinance (Digital Lending)

* Consent before collecting PAN, Aadhaar, bank data
* Purpose-based permissions
* High-risk financial use case

### SurakshaSetu (FIR Filing System)

* Consent before submitting complaint data
* Public-sector compliance
* Sensitive data handling

### Admin Dashboard

* Consent analytics
* Audit logs
* Receipt verification
* Blockchain validation
* Compliance reporting

---

## JavaScript API

```js
window.EncryptCMP.getConsent()
window.EncryptCMP.revokeConsent('marketing')
window.EncryptCMP.revokeAll()
window.EncryptCMP.getReceipt()
window.EncryptCMP.showBanner()
window.EncryptCMP.setLang('ta')
window.EncryptCMP.isConsentGiven()
```

---

## Event Handling

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

| Requirement            | Implementation        |
| ---------------------- | --------------------- |
| Explicit consent       | Consent banner        |
| Purpose limitation     | Independent toggles   |
| Withdrawal rights      | UI + API revocation   |
| Notice requirements    | Multilingual UI       |
| Record keeping         | Receipts + blockchain |
| Time-bound consent     | Expiry tracking       |
| Data rights            | Rights panel          |
| Third-party disclosure | Vendor modal          |
| Auditability           | Event logs            |

---

## Who Should Use This

* Startups
* Fintech platforms
* Government portals
* SaaS products

---

## CSIC 1.0 Context

Developed under **Cluster 9 — Governance, Operations & Privacy**
for the **Cyber Security Innovation Challenge (CSIC) 1.0**

---

## License

MIT License — see LICENSE file

---

## Disclaimer

**BharatFinance** and **SurakshaSetu** are fictional demos.
All references are illustrative only.
