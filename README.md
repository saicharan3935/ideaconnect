# 💡 IdeaConnect

> **"Where a spark meets the people who’ll help it grow."**

IdeaConnect is an AI-powered collaboration platform designed to turn early-stage ideas into real projects. It brings together innovators, developers, designers, researchers, and creators with complementary skill sets, enabling them to discover synergies, form teams, and build production-ready applications.

![IdeaConnect Logo](logo.png)

---

## 🌟 Core Features

- **⚡ Real-Time Debounced Username Validation**
  - Instant live feedback (`✓ Username available` / `⚠ Username already taken`).
  - Strict formatting validation (no spaces, length limits, allowed characters) with safe database constraint handling.

- **💡 Idea Sharing & "My Ideas" Management**
  - Comprehensive idea creation with problem statement, proposed solution, target technologies, required collaborator skills, tags, and visibility controls (`Public`, `Connections only`, `Private`).
  - Dedicated "My Sparks" manager with sub-tabs for Published Ideas, Drafts, Bookmarked Sparks, and Interested Initiatives.

- **🌌 3D Interactive Idea & Talent Network Graph**
  - High-performance HTML5 Canvas vector mesh rendering live relational links between sparks, required technologies, verified builders, and domain categories with smooth physics and drag interactions.

- **🎯 Semantic Similar-Idea Matching**
  - Real database analysis pairing ideas based on category, technology overlap, and required skills with transparent compatibility percentage breakdowns.

- **👥 Grounded "People Who Can Help" Collaborator Matching**
  - Relational matching linking ideas with real community members whose verified skills and domain interests match the idea's requirements.

- **🚀 Idea → Team → Project Workspace ("Build This Idea")**
  - Seamlessly convert any community idea into an active project workspace with an interactive Kanban board (`Backlog / To-Do`, `In Progress`, `Done`), milestone task tracking, and priority filters.

- **🤖 ✨ IdeaConnect AI Co-Pilot (Zero-Hallucination)**
  - Embedded AI assistant strictly grounded in the real database:
    - *Talent Search*: Finds verified members matching specific skills (*e.g., Python, Machine Learning, UI/UX*).
    - *Spark Discovery*: Searches active community ideas across domains.
    - *Actionable Roadmaps*: Generates structured multi-phase development plans convertible into Kanban tasks.
    - *Zero-Hallucination Guarantee*: If no matching record exists in the database, explicitly notifies the user instead of hallucinating.

- **🛡️ Enterprise-Grade Security (P0 & P1)**
  - Dynamic JWT secret validation ($\ge 32$ characters) with startup blocking.
  - Granular project & task authorization ensuring only project creators or team members can manage tasks and workspace status.
  - Sensitive environment configurations and local databases excluded via `.gitignore`.

---

## 🏗️ Architecture & Tech Stack

```text
ideaconnect/
├── client/                     # Frontend Application
│   ├── src/
│   │   ├── components/         # Reusable UI, 3D Cards, Modals & Network Canvas
│   │   ├── context/            # Authentication & State Management
│   │   ├── pages/              # Feed, Idea Details, Projects, Explore, Auth
│   │   └── types/              # TypeScript Domain Interfaces
│   └── vite.config.ts
│
├── server/                     # Backend API & Real-time Services
│   ├── prisma/
│   │   ├── schema.prisma       # Relational Schema (User, Idea, Project, Task, etc.)
│   │   └── dev.db              # SQLite Database
│   ├── src/
│   │   ├── controllers/        # Auth, Ideas, Projects, AI, Users
│   │   ├── middleware/         # JWT Authentication & Error Handlers
│   │   ├── routes/             # RESTful API Endpoints
│   │   └── server.ts           # Express + Socket.IO Server
│   └── tsconfig.json
```

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, HTML5 Canvas.
- **Backend**: Node.js, Express, TypeScript, Prisma ORM, Socket.IO, JWT Authentication.
- **Database**: SQLite (Managed via Prisma).

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- `npm` or `pnpm`

### 1. Clone the repository

```bash
git clone https://github.com/saicharan3935/ideaconnect.git
cd ideaconnect
```

### 2. Configure Backend Environment

Navigate to the `server/` directory and create `.env`:

```bash
cd server
cp .env.example .env
```

Ensure your `.env` contains:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL="file:./dev.db"
JWT_SECRET="replace-with-a-random-secret-at-least-32-characters-long"
CLIENT_URL="http://localhost:5173"
```

### 3. Initialize the Database

```bash
cd server
npm install
npx prisma db push
npm run db:seed
```

### 4. Run the Application

Start backend server:
```bash
cd server
npm run dev
```

Start frontend client in another terminal:
```bash
cd client
npm install
npm run dev
```

Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## 🔑 Demo Community Accounts

You can test the platform using existing seed profiles (password: `password123`):

| User | Email | Role / Expertise |
| :--- | :--- | :--- |
| **Sai Charan** | `saicharan@ideaconnect.dev` | AI/ML Developer & Builder |
| **Rahul Kumar** | `rahul@ideaconnect.dev` | Senior Computer Vision Engineer |
| **Ananya Sharma** | `ananya@ideaconnect.dev` | Lead Product & UI/UX Designer |
| **Dr. Priya Patel** | `priya@ideaconnect.dev` | Agronomy Researcher & Specialist |

---

## 📜 License

This project is licensed under the MIT License.
