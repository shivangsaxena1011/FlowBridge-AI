# FlowBridge AI

> **The intelligent execution layer that converts scattered, unstructured information into prioritized, actionable workflows.**

FlowBridge AI bridges the gap between how thoughts occur (scattered notes, voice memos, whiteboard sketches, meeting minutes) and how high-leverage work gets executed.

---

## ⚡ Core Product Philosophy

$$\text{CAPTURE} \longrightarrow \text{UNDERSTAND} \longrightarrow \text{ORGANIZE} \longrightarrow \text{PRIORITIZE} \longrightarrow \text{EXECUTE}$$

1. **Capture**: Drop voice memos, text notes, screenshots, or documents with zero syntax overhead.
2. **Understand**: The multi-tiered AI engine parses natural language deadlines, collaborators, priorities, and dependencies into structured deliverables.
3. **Organize**: Automatically maps deliverables into projects, sequential checklists, and time estimates.
4. **Prioritize**: Ranks daily commitments into 4 leverage tiers (Top Priority, Must Finish, Nice to Finish, Upcoming) with concrete AI rationale.
5. **Execute**: Singular Focus Mode with sequential micro-step breakdowns and a dedicated, distraction-free timer.

---

## ✨ Features

- **Smart Inbox (`/app/inbox`)**: Multi-modal input supporting freeform text, voice recording (Web Speech API), and screenshot image attachments.
- **Dynamic Task Management (`/app/tasks`)**: Comprehensive task tracking with priority badges, project associations, subtask checklists, and AI-powered task breakdowns.
- **Strategic Project Workspace (`/app/projects`)**: Group work into projects with milestones, progress rings, and the **"Plan this project"** AI roadmap generator.
- **Today's Workspace (`/app/today`)**: Daily prioritized execution view with AI rationale based on deadlines, leverage, and cognitive load.
- **Singular Focus Mode (`/app/focus`)**: 1-click execution mode displaying micro-steps, interactive checklists, flexible timer intervals (15m, 25m Pomodoro, 50m), and session completion telemetry.
- **Execution Calendar (`/app/calendar`)**: Month-at-a-glance schedule tracking deadlines, milestones, and deep work sessions.
- **Real Productivity Telemetry (`/app/insights`)**: Genuine calculated analytics (completion rate, peak productivity hours, deep work volume, urgency distribution) without fake vanity numbers.
- **Command Palette (`⌘K` / `Ctrl+K`)**: Instant search and navigation across tasks, projects, and actions from anywhere in the app.
- **Quick Capture Shortcut (`C`)**: Universal capture modal callable globally with keyboard shortcuts.
- **Data Sovereignty & Local Persistence (`/app/settings`)**: Client-side storage with one-click JSON export/import and seamless reset to realistic seed data.

---

## 🏗️ Architecture & Tech Stack

- **Framework**: [Next.js 15+ (App Router)](https://nextjs.org/)
- **UI & Styling**: [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/), [Lucide React](https://lucide.dev/)
- **Validation**: [Zod](https://zod.dev/) for strict schema validation of all AI outputs and data contracts
- **Animations & Feedback**: Accessible micro-interactions, canvas-confetti, live toast system
- **Deployment**: Optimized for direct zero-config deployment on [Vercel](https://vercel.com/)

### Multi-Tier AI Engine (`lib/ai/`)

FlowBridge employs a hybrid server-side architecture:

1. **Cloud LLM Router (`lib/ai/provider.ts`)**: When configured with `AI_API_KEY`, requests are routed to OpenAI, Google Gemini, Groq, or any OpenAI-compatible provider.
2. **Local Deterministic Fallback (`lib/ai/deterministic.ts`)**: When running without external API credentials or offline, FlowBridge operates seamlessly via an internal natural language parser that resolves relative dates, detects priority keywords, extracts collaborators, and structures phased project roadmaps.
3. **Schema Verification (`lib/ai/parser.ts`)**: All model responses are validated through Zod schemas before reaching the client interface.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18.18+ or 20+ (tested on Node v24)
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/flowbridge-ai.git
cd flowbridge-ai

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚙️ Environment Configuration

FlowBridge AI works out of the box with zero external configuration using its deterministic intelligence engine.

To enable cloud LLM models, copy `.env.example` to `.env.local` and provide your credentials:

```bash
cp .env.example .env.local
```

```env
# Optional external provider API key (OpenAI, Gemini, Groq, etc.)
AI_API_KEY=your_api_key_here

# Target model
AI_MODEL=gpt-4o-mini

# Provider base endpoint (Defaults to OpenAI)
AI_BASE_URL=https://api.openai.com/v1
```

---

## 📦 Production Build & Testing

```bash
# Type check and build production bundle
npm run build

# Start production server
npm run start

# Run ESLint verification
npm run lint
```

---

## 🌐 Deploy to Vercel

FlowBridge is engineered specifically for Vercel deployment:

1. Push your repository to GitHub / GitLab / Bitbucket.
2. Import the project into [Vercel](https://vercel.com/new).
3. (Optional) Add `AI_API_KEY`, `AI_MODEL`, and `AI_BASE_URL` to your Vercel Environment Variables.
4. Deploy! All routes, static pages, and dynamic API handlers deploy without additional configuration.

---

## 📁 Project Structure

```
flowbridge-ai/
├── app/
│   ├── layout.tsx              # Root layout with ToastProvider and font tokens
│   ├── page.tsx                # Startup landing page with live interactive demo
│   ├── api/ai/                 # Server-side AI route handlers
│   │   ├── extract/route.ts    # Unstructured input extraction
│   │   ├── plan/route.ts       # Strategic project roadmap generator
│   │   ├── breakdown/route.ts  # Task micro-step breakdown
│   │   └── prioritize/route.ts # Daily leverage prioritization
│   └── app/                    # Authenticated workspace application
│       ├── layout.tsx          # Workspace shell, sidebar, mobile nav, shortcuts
│       ├── page.tsx            # Dashboard overview
│       ├── inbox/page.tsx      # Multi-modal Smart Inbox
│       ├── tasks/page.tsx      # Task management with filters and AI breakdowns
│       ├── projects/page.tsx   # Project workspaces and AI roadmap planning
│       ├── today/page.tsx      # Daily 4-tier focus plan with AI rationale
│       ├── focus/page.tsx      # Singular Focus Mode with timer & checklist
│       ├── calendar/page.tsx   # Schedule view of deadlines & milestones
│       ├── insights/page.tsx   # Real computed productivity analytics
│       └── settings/page.tsx   # User profile, AI settings, JSON data backup
├── components/
│   ├── ui/                     # Reusable UI primitives (Button, Card, Badge, Modal, Toast)
│   ├── layout/                 # Sidebar, Header, MobileNav, CommandPalette, QuickCapture
│   ├── inbox/                  # CaptureBox component with voice & image support
│   ├── tasks/                  # TaskModal create & edit dialog
│   └── projects/               # ProjectModal & PlanProjectModal
├── lib/
│   ├── ai/                     # AI provider, prompts, parser, and deterministic engine
│   ├── data/                   # Storage abstraction, realistic seed data, and analytics
│   └── utils.ts                # Tailwind merge and date formatting utilities
└── types/
    └── index.ts                # Central TypeScript contracts
```

---

## 📄 License

MIT License. Built for high-leverage execution.
