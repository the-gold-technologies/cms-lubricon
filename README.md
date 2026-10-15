# Lubricon Specialities India — Headless CMS & Admin Portal

A high-performance, enterprise-grade Headless Content Management System (CMS) and Administration Portal engineered for **Lubricon Specialities India**. This system powers content modeling, industrial product catalogs, technical documentation (TDS & MSDS), multi-page layout configurations, commercial lead pipelines, and automated email notifications for the customer-facing frontend.

---

## 📑 Table of Contents

- [Key Capabilities](#-key-capabilities)
- [System Architecture](#-system-architecture)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#1-prerequisites)
  - [Installation](#2-installation)
  - [Environment Setup](#3-environment-configuration)
  - [Database Initialization & Seeding](#4-database-setup--seeding)
  - [Running the Application](#5-running-the-application)
- [Headless API Endpoints](#-headless-api-endpoints)
- [Available Scripts](#-available-scripts)
- [Security & Environment Variables](#-security--environment-variables)
- [License & Confidentiality](#-license--confidentiality)

---

## 🚀 Key Capabilities

### 1. Unified Admin Dashboard

- Secure NextAuth-powered administrative authentication with session control and route protection middleware.
- Executive overview cards tracking active products, catalog categories, client industries, and inbound commercial enquiries.
- Instant access to recent lead submissions and live status indicators.

### 2. Modular Section & Page Editors

- Visual CMS controls for static and dynamic page sections:
  - **Homepage:** Hero sliders, about strip, industrial lubricant finder, product showcases, industry sectors, procurement highlights, and CTA banners.
  - **About Us:** Corporate hero, stats counter, timeline & milestones, core values, portfolio grid, team hierarchy, and factory/lab galleries.
  - **Contact Us:** Interactive contact details, branch/office locations, dynamic inquiry forms, and categorized FAQ accordions.
  - **Industries:** Specialized industrial sectors (Automotive, Heavy Machinery, Manufacturing, Mining, etc.), operational challenges, tailored solutions, and recommended product pairings.
  - **Privacy Policy:** Rich-text compliant privacy and legal disclosures editor.

### 3. Comprehensive Product Catalog & Document Registry

- **Lubricant Taxonomy:** Categories, subcategories, container images, badges, and classification tags.
- **Dynamic Physico-Chemical Properties Matrix:** Key-value property editor with custom table headers and numerical/text metrics (Viscosity, Flash Point, Pour Point, Density, etc.).
- **Technical Document Management:** Direct upload, hosting, and streaming of Technical Data Sheets (TDS) and Material Safety Data Sheets (MSDS) via Cloudinary.
- **Application & Feature Specs:** Rich-text descriptions, application scopes, performance benefits, and bulleted features.

### 4. Commercial Submissions & Lead Pipeline

- Centralized management of inbound B2B enquiries, distributor applications, and TDS download requests.
- Real-time status workflow (`Pending`, `Contacted`, `In Progress`, `Closed`).
- Filterable data tables with fast search, responsive pagination, and detailed review modals.
- Automated email dispatch to administrators and acknowledgments to prospective clients via Nodemailer.

### 5. SEO Suite & Metadata Automation

- **Global Configuration:** Brand title, meta descriptions, favicon, header/footer custom injection scripts, Google Analytics / GTM IDs, and social media handles.
- **Page-Level SEO Overrides:** Individual OpenGraph titles, meta descriptions, target keywords, canonical URLs, noIndex flags, and JSON-LD structured schema.
- **Dynamic Sitemap & Robots:** Automated generation of `sitemap.xml` and `robots.txt` based on live published records.

### 6. Media Asset Pipeline

- Cloudinary integration for optimized image hosting, thumbnail rendering, and PDF storage.
- Reusable modal image picker and direct drag-and-drop file uploaders.

---

## 🛠️ Technology Stack

| Layer                  | Technology                          | Purpose                                                 |
| :--------------------- | :---------------------------------- | :------------------------------------------------------ |
| **Framework**          | Next.js 16 (App Router / Turbopack) | Server-rendered pages and REST API routes               |
| **Runtime & Language** | Node.js & TypeScript                | Type-safe backend and UI logic                          |
| **Database & ORM**     | PostgreSQL & Prisma ORM             | Relational schema modeling and queries                  |
| **Authentication**     | NextAuth.js v5 (Auth.js)            | Session-based admin authentication and middleware guard |
| **Styling**            | Tailwind CSS v4, Lucide React       | Modern responsive design and iconography                |
| **Media Storage**      | Cloudinary SDK                      | Image upload, CDN delivery, and secure PDF handling     |
| **Email Service**      | Nodemailer                          | Transactional email dispatch for inbound leads          |
| **Rich Text Editor**   | React Quill New                     | WYSIWYG editing for legal copy and descriptions         |
| **Visualizations**     | Recharts                            | Analytics dashboards and metrics visualization          |

---

## 📁 Project Structure

```
lubricon-cms/
├── prisma/
│   ├── schema.prisma          # Database schema definitions
│   └── seed.js                # Database seeding script
├── public/                    # Static public assets
├── src/
│   ├── app/
│   │   ├── api/               # Headless JSON REST API routes
│   │   │   ├── about-us/      # About page API endpoints
│   │   │   ├── auth/          # NextAuth authentication handlers
│   │   │   ├── contact-us/    # Contact page & location endpoints
│   │   │   ├── dashboard/     # CMS metrics and count statistics
│   │   │   ├── download/      # Secure document download proxy
│   │   │   ├── enquiries/     # Submission and lead ingestion endpoints
│   │   │   ├── home/          # Homepage sections API
│   │   │   ├── industries/    # Industry sectors endpoints
│   │   │   ├── nav-links/     # Navigation structure API
│   │   │   ├── privacy-policy/# Privacy policy API
│   │   │   ├── products/      # Products and categories API
│   │   │   ├── profile/       # Admin profile credentials API
│   │   │   ├── seo/           # Global and per-page SEO endpoints
│   │   │   └── upload/        # Cloudinary file upload handler
│   │   ├── components/        # Shared CMS UI components (DataTable, Editors, Pickers)
│   │   ├── navigation/        # Menu links and social media management pages
│   │   ├── seo/               # Global SEO, Page SEO, and Sitemap/Robots interfaces
│   │   ├── settings/          # Admin account profile settings
│   │   ├── static-pages/      # Dedicated page builders (Home, About, Contact, etc.)
│   │   ├── submissions/       # Enquiries and lead review tables
│   │   ├── favicon.ico/       # Dynamic favicon route
│   │   ├── robots.txt/        # Dynamic robots.txt route
│   │   ├── sitemap.xml/       # Dynamic sitemap.xml route
│   │   ├── layout.tsx         # Root layout with providers
│   │   ├── page.tsx           # Dashboard landing view
│   │   └── login/             # Administrator login portal
│   ├── lib/
│   │   ├── cloudinary.ts      # Cloudinary client configuration
│   │   ├── mail.ts            # Nodemailer SMTP transporter and notification templates
│   │   ├── prisma.ts          # Prisma database client singleton
│   │   └── utils.ts           # Shared formatting and utility functions
│   ├── auth.config.ts         # Authentication configuration and credentials provider
│   ├── auth.ts                # NextAuth instance export
│   └── middleware.ts          # Auth route guard and API CORS handling
├── .env.example               # Template for environment configuration
├── package.json               # Node packages and CLI scripts
└── tsconfig.json              # TypeScript compiler configuration
```

---

## ⚙️ Getting Started

### 1. Prerequisites

- **Node.js:** `v18.18.0` or higher (Node 20+ LTS recommended)
- **Package Manager:** `npm` (included with Node)
- **Database:** PostgreSQL database instance (local PostgreSQL, Supabase, Neon, or Railway)
- **Cloudinary Account:** For image and document storage
- **SMTP Account:** For lead notification dispatch (e.g., Mailtrap for local dev, SendGrid/AWS SES for production)

### 2. Installation

Clone the repository and install project dependencies:

```bash
git clone <repository-url>
cd lubricon-cms
npm install
```

### 3. Environment Configuration

Copy the example environment configuration template:

```bash
cp .env.example .env
```

Populate `.env` with your environment parameters. **Do not commit your `.env` file to version control.**

```env
# =========================================================================
# Database Connections (PostgreSQL)
# =========================================================================
DATABASE_URL="postgresql://username:password@localhost:5432/lubricon_cms"
DIRECT_URL="postgresql://username:password@localhost:5432/lubricon_cms"

# =========================================================================
# Authentication (NextAuth.js v5)
# =========================================================================
AUTH_SECRET="your-secure-random-auth-secret"
NEXTAUTH_URL="http://localhost:3001"
ALLOWED_ORIGINS="*"

# =========================================================================
# Customer-Facing Website URL
# =========================================================================
NEXT_PUBLIC_WEBSITE_URL="http://localhost:3000"

# =========================================================================
# Cloudinary Media Storage (Images & PDFs)
# =========================================================================
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# =========================================================================
# SMTP Mail Dispatch Configuration
# =========================================================================
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your_smtp_username"
SMTP_PASS="your_smtp_password"
SMTP_FROM="Lubricon Specialities India <no-reply@lubricon.in>"
ADMIN_NOTIFICATION_EMAIL="admin@lubricon.in"
```

> **Security Note:** Generate a cryptographically secure random string for `AUTH_SECRET` (e.g., via `openssl rand -base64 32`).

### 4. Database Setup & Seeding

Synchronize your Prisma schema with your PostgreSQL database and initialize default seed data:

```bash
# Push schema changes to the database
npx prisma db push

# (Optional) Seed initial site sections, catalog items, and administrator account
npm run seed
```

> **Default Seed Notice:** The seed script creates an initial administrator account for development convenience. For production deployments, immediately update the administrator email and password through the CMS Profile settings or database console.

### 5. Running the Application

Start the development server:

```bash
npm run dev
```

The CMS administration portal will be live at:  
👉 **[http://localhost:3001](http://localhost:3001)**

---

## 🔌 Headless API Endpoints

The CMS exposes headless REST API routes consumed by the customer-facing frontend. All API endpoints include universal CORS handling configured in `middleware.ts`.

| Endpoint                   | Method(s)                        | Description                                                |
| :------------------------- | :------------------------------- | :--------------------------------------------------------- |
| `/api/home`                | `GET`, `PUT`                     | Retrieves or updates homepage section layout blocks        |
| `/api/about-us`            | `GET`, `PUT`                     | Retrieves or updates About Us section layout blocks        |
| `/api/contact-us`          | `GET`, `PUT`                     | Retrieves or updates Contact Us details, offices, and FAQs |
| `/api/industries`          | `GET`, `POST`, `PUT`, `DELETE`   | Manages industrial sectors, solutions, and product links   |
| `/api/products`            | `GET`, `POST`, `PUT`, `DELETE`   | Manages lubricant catalog, specs, and technical PDFs       |
| `/api/products/categories` | `GET`, `POST`, `PUT`, `DELETE`   | Manages product categories and taxonomy                    |
| `/api/enquiries`           | `GET`, `POST`, `PATCH`, `DELETE` | Ingests leads from website & manages status pipeline       |
| `/api/nav-links`           | `GET`, `POST`, `PUT`, `DELETE`   | Retrieves and updates header/footer navigation items       |
| `/api/privacy-policy`      | `GET`, `PUT`                     | Retrieves and updates legal privacy policy content         |
| `/api/seo`                 | `GET`, `PUT`                     | Retrieves and updates global brand SEO configurations      |
| `/api/seo/pages`           | `GET`, `POST`, `PUT`             | Manages per-page SEO overrides and OpenGraph tags          |
| `/api/dashboard/stats`     | `GET`                            | Aggregated count metrics for dashboard widgets             |
| `/api/upload`              | `POST`                           | Uploads media and documents to Cloudinary                  |
| `/api/download`            | `GET`                            | Secure streaming proxy for technical documentation         |
| `/sitemap.xml`             | `GET`                            | Live dynamic sitemap conforming to search engine standards |
| `/robots.txt`              | `GET`                            | Live robots directives based on CMS configuration          |

---

## 📦 Available Scripts

The following commands are defined in `package.json`:

| Command                | Description                                                      |
| :--------------------- | :--------------------------------------------------------------- |
| `npm run dev`          | Boots the Next.js development server with Turbopack on port 3001 |
| `npm run build`        | Generates the Prisma client and compiles the production bundle   |
| `npm run start`        | Launches the compiled production server                          |
| `npm run seed`         | Executes `prisma/seed.js` to populate default layouts and data   |
| `npm run lint`         | Runs ESLint validation across the repository                     |
| `npm run format`       | Automatically formats codebase files using Prettier              |
| `npm run format:check` | Checks code formatting conformity without modifying files        |

---

## 🔒 Security & Environment Variables

- **No Secrets in Source Control:** Never commit `.env` or files containing live credentials, passwords, tokens, or private customer records.
- **Strict Role Verification:** Administrative pages and modification endpoints require authenticated session tokens verified through `NextAuth.js`.
- **CORS Configuration:** In production, restrict `ALLOWED_ORIGINS` in your environment to the exact domains of your frontend applications.
- **Asset Sanitization:** Uploaded files and document attachments are processed and hosted via Cloudinary to prevent unverified local file execution.

---

## 📄 License & Confidentiality

© **Lubricon Specialities India**. All rights reserved.  
This software and documentation are proprietary and confidential to Lubricon Specialities India. Unauthorized reproduction, distribution, reverse engineering, or public exposure of this codebase or its contents is strictly prohibited.
