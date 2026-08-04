# PlaceMe CredChain 🎓🔗

**PlaceMe CredChain** is an enterprise-grade, blockchain-anchored Smart Placement & Career Tracking Portal designed for educational institutions. It bridges students, faculty placement cells (TPC), and corporate recruiters onto a unified, AI-enhanced platform for campus recruitment drives, credential attestation, and placement verification.

---

## 🌟 Feature Highlights

### 👨‍🎓 For Students
- **Interactive Placement Dashboard**: Track ongoing drives, application stages, schedule of rounds, and received offers in real time.
- **Secure Credential Vault**: Upload resumes, marksheets, and certificates with SHA-256 integrity hashing and local preview capabilities.
- **Unified Master QR Code**: Generate a single, scannable Master QR code that bundles all verified academic credentials into a verifiable public bundle.
- **Offer Management**: Upload company offer letters for placement cell verification and record accepted/declined responses.

### 👩‍🏫 For Faculty & TPC (Training & Placement Cell)
- **Live PDF Document Viewer**: Review student-submitted credentials and offer letters with built-in inline PDF document inspection before approving or rejecting.
- **Document & Offer Verification Queue**: Add faculty remarks, attest document authenticity, and trigger on-chain anchoring.
- **Blockchain Credential Anchoring (Hardhat / Ethereum)**: Anchors document hashes onto local smart contracts (`CredentialRegistry.sol`) to ensure tamper-proof authenticity.
- **Recruitment & Drive Management**: Create, edit, and track company recruitment drives, eligibility rules, and multi-stage interview rounds.

---

## 🛠️ Tech Stack & Architecture

- **Web Framework**: [Next.js 16 (App Router)](https://nextjs.org/) & React 19
- **Styling**: Tailwind CSS v4, Lucide Icons, Glassmorphism UI
- **Database & ORM**: PostgreSQL via [Prisma ORM](https://www.prisma.io/)
- **Authentication & Storage**: [Supabase Auth](https://supabase.com/) & Supabase Storage
- **Blockchain Integration**: Hardhat (Local Ethereum Node), Ethers.js v6
- **QR Verification**: HTML5-QRCode Scanner & CryptoJS

---

## 📁 Repository Structure

```
codesprint-AIML/
├── agent/                # Background services & runner scripts
├── app/
│   └── web/              # Next.js 16 Full-Stack Application
│       ├── public/       # Public assets, logos, and sample PDF templates
│       ├── prisma/       # Database schema definition
│       ├── src/
│       │   ├── app/      # App Router (Dashboard, Faculty, Auth, Verify)
│       │   ├── components/ # Reusable UI components & layout elements
│       │   ├── context/  # React Context (AuthContext & PlacementContext)
│       │   └── lib/      # Utility helpers & type definitions
├── contracts/            # Hardhat smart contracts & deployment scripts
│   ├── contracts/        # Solidity smart contracts (CredentialRegistry.sol)
│   └── scripts/          # Contract deployment & test scripts
├── README.md             # Project documentation
└── start.bat             # One-click startup batch script
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18.x or higher
- **npm**: v9.x or higher
- **PostgreSQL Database** or Supabase Postgres connection string

### 2. Environment Configuration

Create `.env.local` inside `app/web/.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# PostgreSQL Connection String
DATABASE_URL=your_postgres_connection_string
```

### 3. Database Migration & Seeding

Navigate to `app/web` and set up the schema:

```bash
cd app/web

# Push schema to database
npx prisma db push

# Seed database with initial users and drives
node scripts/seed-users.mjs
npx tsx scripts/seed-db.ts
```

*Default Demo Logins (Password for both: `password123`):*
- **Student Profile**: `arjun.mehta@college.edu`
- **Faculty Profile**: `priya.sharma@college.edu`

### 4. Running the Application

From the root directory, launch the entire monorepo using the provided script:

```bash
start.bat
```

Or start components individually:

1. **Local Blockchain Node (Terminal 1)**:
   ```bash
   cd contracts
   npm run node
   ```
2. **Next.js Web App (Terminal 2)**:
   ```bash
   cd app/web
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📄 Verification & PDF Viewing Flow

1. **Student Upload**: Students upload academic documents or offer letters in the Documents / Credentials panel.
2. **Faculty Verification Queue**: Faculty logs in and navigates to **Document Verification** (`/faculty/documents`) or **Offer Letters** (`/faculty/offers`).
3. **Live PDF Inspection**: Clicking **"Preview"** loads the student's uploaded PDF file directly inside an embedded PDF viewer player.
4. **Attestation & Blockchain Anchoring**: Faculty writes verification remarks and approves the credential, updating its status to `VERIFIED` and anchoring its hash on-chain.

---

## 📄 License
This project is licensed under the MIT License.
