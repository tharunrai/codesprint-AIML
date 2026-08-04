# PlaceMe CredChain 🎓🔗

**PlaceMe CredChain** is an enterprise-grade, blockchain-anchored Smart Placement & Career Tracking Portal designed for educational institutions. It bridges students, faculty placement cells (TPC), and corporate recruiters onto a unified, AI-enhanced platform for campus recruitment drives, credential attestation, placement verification, and automated career coaching.

---

## 🌟 Feature Highlights

### 👨‍🎓 For Students
- **Interactive Placement Dashboard**: Track ongoing drives, application stages, interview rounds timeline, and offer statuses in real time.
- **Secure Credential Vault**: Upload resumes, marksheets, and certificates with SHA-256 integrity hashing and instant document preview capabilities.
- **Unified Master QR Code**: Generate a single scannable Master QR code bundling all verified academic credentials into a public verifiable bundle (`/credential/[id]`).
- **AI-Powered Career Suite**:
  - **ATS Resume Analyzer**: Upload PDF or paste text to receive overall ATS scores, section breakdowns, top strengths, and critical actionable fixes.
  - **Company Research Assistant**: Get automated company briefings, tech stack insights, corporate culture overviews, and recent news summaries.
  - **Round-wise Preparation Coach**: Access tailored preparation topics, likely question types, curated practice resources, and strategic tips for specific interview rounds.
- **Interactive Placement Calendar**: View upcoming drive deadlines, test schedules, and interview rounds.
- **Offer Management**: Upload company offer letters for TPC verification and respond to job offers.

### 👩‍🏫 For Faculty & TPC (Training & Placement Cell)
- **Live PDF Document Inspection**: Review student-submitted academic credentials and offer letters with inline PDF viewing before approving or rejecting.
- **Attestation & Verification Queue**: Add faculty remarks, attest document authenticity, and anchor verified document hashes onto the blockchain.
- **Blockchain Credential Anchoring**: Write tamper-proof attestation hashes directly to Ethereum smart contracts (`CredentialRegistry.sol`).
- **Placement Analytics & Reporting**: Real-time dashboards visualizing placement percentages, average/highest CTC trends, branch-wise statistics, and drive conversion funnels using dynamic charts.
- **Recruitment Drive Management**: Create, edit, and track company drives, eligibility rules, job descriptions, and multi-stage interview rounds.

### 🔍 For Recruiters & Public Verification
- **Standalone Public Verification Portal (`/verify`)**: Verify student document integrity hashes or scan Master QR codes directly against the blockchain without requiring an account.
- **Public Credential Showcase (`/credential/[id]`)**: Independent view of a student's faculty-attested credentials backed by immutable smart contract records.

---

## 🛠️ Tech Stack & Architecture

| Component | Technologies |
|---|---|
| **Web Frontend** | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Framer Motion, Recharts, Leaflet |
| **AI Microservice** | Python 3.10+, FastAPI, Uvicorn, DeepSeek Model (`deepseek-v4-flash-free`) via OpenCode Zen API, PyPDF |
| **Database & ORM** | PostgreSQL via Prisma ORM |
| **Auth & Storage** | Supabase Auth (JWT) & Supabase Storage |
| **Blockchain** | Hardhat (Local Ethereum Node / Sepolia Testnet), Solidity (`CredentialRegistry.sol`), Ethers.js v6 |
| **QR Verification** | QRCode.react, CryptoJS |

### 📐 System Architecture

```
                                  ┌───────────────────────────┐
                                  │      Next.js Frontend     │
                                  │    (React 19 / Tailwind)  │
                                  └─────────────┬─────────────┘
                                                │
                 ┌──────────────────────────────┼──────────────────────────────┐
                 │                              │                              │
                 ▼                              ▼                              ▼
    ┌─────────────────────────┐    ┌─────────────────────────┐    ┌─────────────────────────┐
    │  FastAPI AI Microservice│    │    Supabase / Postgres  │    │ Hardhat Local Ethereum  │
    │  (DeepSeek LLM Engine)  │    │  (Auth, DB & Storage)   │    │  (Credential Registry)  │
    └─────────────────────────┘    └─────────────────────────┘    └─────────────────────────┘
```

---

## 📁 Repository Structure

```
codesprint-AIML/
├── agent/                # Python FastAPI AI Microservice
│   ├── api/              # Routers (Resume, Company, Coach, Pipeline) & Pydantic Schemas
│   ├── core/             # LLM Client (DeepSeek), JSON parsing, PDF text extraction
│   ├── services/         # Feature business logic & prompt handling
│   ├── prompts/          # System prompts for AI models
│   ├── tests/            # Pytest test suite
│   ├── main.py           # FastAPI application entry point
│   ├── config.py         # Centralized environment configuration
│   └── run.bat           # Automated environment setup & server launcher
├── app/
│   └── web/              # Next.js 16 Full-Stack Application
│       ├── prisma/       # PostgreSQL Schema & migrations
│       ├── scripts/      # Database seeding scripts
│       └── src/
│           └── app/      # App Router (Dashboard, AI Assistant, Faculty, Verify, Public)
├── contracts/            # Hardhat smart contracts & deployment scripts
│   ├── contracts/        # Solidity smart contract (CredentialRegistry.sol)
│   └── scripts/          # Deployment & verification scripts
├── README.md             # Project documentation
├── specs.md              # Technical specification sheet
└── start.bat             # One-click full system startup script
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18.x or higher
- **npm**: v9.x or higher
- **Python**: v3.10 or higher
- **PostgreSQL Database** (or Supabase Postgres connection string)

---

### 2. Environment Configuration

#### Next.js Web App (`app/web/.env.local`):
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# PostgreSQL Connection String
DATABASE_URL=your_postgres_connection_string

# AI Agent Service URL
NEXT_PUBLIC_AI_AGENT_URL=http://127.0.0.1:8000
```

#### AI Agent Microservice (`agent/.env`):
```env
AI_API_KEY=your_opencode_zen_api_key
AI_BASE_URL=https://opencode.ai/zen/v1
AI_MODEL_NAME=deepseek-v4-flash-free
LLM_TIMEOUT=25.0
```

#### Smart Contracts (`contracts/.env`):
```env
COLLEGE_ADDRESS=0x70997970C51812dc3A010C7d01b50e0d17dc79C8
SEPOLIA_URL=your_sepolia_rpc_url
PRIVATE_KEY=your_private_key
ETHERSCAN_API_KEY=your_etherscan_api_key
```

---

### 3. Database Migration & Seeding

Navigate to `app/web` and initialize the schema and seed data:

```bash
cd app/web

# Install dependencies
npm install

# Push database schema
npx prisma db push

# Seed users and placement drives
node scripts/seed-users.mjs
npx tsx scripts/seed-db.ts
```

#### 🔑 Default Demo Logins (Password for all: `password123`):
- **Student Profile**: `arjun.mehta@college.edu`
- **Faculty Profile**: `priya.sharma@college.edu`

---

### 4. Running the Application

#### Option A: One-Click Launch (Windows)
From the root directory, launch the Hardhat node, deploy contracts, and start the Next.js app:
```bash
start.bat
```
To run the AI Microservice, open a terminal in `agent/` and run:
```bash
cd agent
run.bat
```

#### Option B: Terminal-by-Terminal Launch

1. **Terminal 1 — Local Ethereum Blockchain Node**:
   ```bash
   cd contracts
   npm install
   npm run node
   ```

2. **Terminal 2 — Deploy Smart Contract**:
   ```bash
   cd contracts
   npm run deploy:local
   ```

3. **Terminal 3 — FastAPI AI Agent Service**:
   ```bash
   cd agent
   run.bat
   ```
   *(Or activate your venv and run `uvicorn main:app --reload`)*

4. **Terminal 4 — Next.js Web App**:
   ```bash
   cd app/web
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🤖 AI Microservice API Reference

The AI microservice runs on `http://127.0.0.1:8000`. Interactive API documentation is available at **[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)**.

### Key Endpoints:

| Endpoint | Method | Description | Payload |
|---|---|---|---|
| `/api/analyze-resume` | `POST` | Analyze raw resume text against a target role | `{ "resume_text": "...", "target_role": "SDE" }` |
| `/api/analyze-resume-file` | `POST` | Extract & analyze uploaded PDF resume | `multipart/form-data` (`file`, `target_role`) |
| `/api/company-research` | `POST` | Generate company research overview & tech stack | `{ "company": "Google", "role": "Frontend Engineer" }` |
| `/api/prep-coach` | `POST` | Generate round-specific interview prep plan | `{ "company": "Amazon", "role": "SDE-1", "round": "Technical Round 2" }` |
| `/api/pipeline` | `POST` | Run end-to-end resume + research + prep pipeline | `{ "resume_text": "...", "company": "...", "role": "...", "round": "..." }` |

---

## 📄 Document Verification & Blockchain Flow

1. **Student Upload**: Students upload marksheets, certificates, or offer letters in the Credentials panel. Document SHA-256 hashes are automatically computed.
2. **Faculty Review Queue**: Faculty members access the verification queue (`/faculty/documents` or `/faculty/offers`).
3. **Inline PDF Viewer**: Faculty inspects the actual document inside an embedded PDF viewer.
4. **Attestation & Blockchain Anchoring**: Faculty approves the document with verification remarks. The verification status changes to `VERIFIED`, and the document hash is immutably anchored to the `CredentialRegistry` smart contract.
5. **Verification Check**: Anyone can verify the credential by visiting `/verify` or scanning the student's Master QR code.

---

## 📜 License

This project is licensed under the **MIT License**.
