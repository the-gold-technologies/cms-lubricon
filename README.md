# Jai Deva Oil Co. — Headless Content Management System (CMS)

A dedicated, enterprise-grade Headless Content Management System and Administration Portal engineered for **Jai Deva Oil Co.** This service manages live site configuration, product catalogs, TDS/MSDS technical documents, multi-page layout blocks, incoming commercial enquiries, and dynamic notification dispatch.

---

## 🚀 Key Capabilities

- **Unified Admin Portal:** Secure NextAuth-powered administrative dashboard for content editors and administrators.
- **Visual Section Editors:** Real-time CMS controls for Homepage, About Us, Brands, Industries, Events, Blogs, and Contact Us layouts.
- **Interactive First-Time Visitor Popup Manager:**
  - Independent toggles for modal activation and enquiry lead form inclusion.
  - Image flyer configuration with Cloudinary media management.
- **Enterprise Lead Management:**
  - Automated ingestion of B2B enquiries, distributor applications, and TDS download requests.
  - Real-time status tracking, audit logging, and automated SMTP email notifications.
- **Product & Document Registry:**
  - Multi-brand lubricant catalog taxonomy (Categories, Subcategories, Specifications).
  - Secure Cloudinary PDF hosting and delivery for technical documentation (TDS and MSDS).
- **Prisma ORM & PostgreSQL:** Strongly-typed relational data model with database migrations and automated seeding.

---

## 🛠️ Technology Stack

| Layer              | Technologies                                                        |
| :----------------- | :------------------------------------------------------------------ |
| **Framework**      | Next.js 16 (Turbopack / App Router)                                 |
| **Language**       | TypeScript                                                          |
| **ORM & Database** | Prisma ORM, PostgreSQL (Compatible with Supabase / Neon / Local PG) |
| **Authentication** | NextAuth.js v5 (Credentials Provider & Session Tokens)              |
| **Styling**        | Tailwind CSS v4, Lucide React Icons                                 |
| **Media & Assets** | Cloudinary SDK (Image & PDF processing)                             |
| **Email Service**  | Nodemailer (SMTP transport with templated notifications)            |
| **Rich Text**      | React Quill New                                                     |

---

## ⚙️ Getting Started

### 1. Prerequisites

- **Node.js:** `v18.17.0` or higher (Node 20+ recommended)
- **PostgreSQL Database:** Local instance or cloud database provider

### 2. Installation

```bash
# Clone the repository
git clone <repository-url>
cd jai-deva-cms

# Install dependencies
npm install
```

### 3. Environment Configuration

Create a `.env` file in the project root based on `.env.example`:

```bash
cp .env.example .env
```

Set placeholder values with your environment parameters:

```env
# Database Connections
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
DIRECT_URL="postgresql://user:password@localhost:5432/dbname"

# Authentication
AUTH_SECRET="generate-a-secure-random-secret"
NEXTAUTH_URL="http://localhost:3001"
ALLOWED_ORIGINS="*"

# Client Website URL
NEXT_WEBSITE_URL="http://localhost:3000"

# Cloudinary Storage
NEXT_CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
CLOUDINARY_URL="cloudinary://your_api_key:your_api_secret@your_cloud_name"

# SMTP Mail Dispatch Configuration
SMTP_HOST="smtp.provider.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your_smtp_username"
SMTP_PASS="your_smtp_password"
SMTP_FROM="Jai Deva Oil Co. <no-reply@yourdomain.com>"
ADMIN_NOTIFICATION_EMAIL="admin@yourdomain.com"
```

> **Security Reminder:** Never commit real database URLs, Cloudinary secrets, SMTP passwords, or authentication keys to GitHub.

### 4. Database Setup & Seeding

Generate Prisma Client bindings and run database migrations/seeds:

```bash
# Push Prisma schema to your database
npx prisma db push

# (Optional) Seed the database with initial page layouts & admin account
npm run seed
```

### 5. Running the Development Server

```bash
npm run dev
```

The CMS administration interface will be available at [http://localhost:3001](http://localhost:3001).

---

## 📦 Available Scripts

| Command          | Description                                           |
| :--------------- | :---------------------------------------------------- |
| `npm run dev`    | Starts the CMS development server on port 3001        |
| `npm run build`  | Generates Prisma client and compiles production build |
| `npm run start`  | Boots the compiled CMS server                         |
| `npm run seed`   | Seeds default site sections and content records       |
| `npm run lint`   | Runs ESLint verification                              |
| `npm run format` | Runs Prettier code formatting                         |

---

## 📄 License & Confidentiality

© **Jai Deva Oil Co.** All rights reserved.  
This software and documentation are proprietary and confidential. Unauthorized copying, distribution, or deployment is strictly prohibited.
