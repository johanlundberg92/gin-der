Here is a comprehensive, agent-ready implementation plan for the Gin Tasting Web App. It is structured to provide an AI coding agent with clear architectural boundaries, data models, UI/UX directives, and a sequential execution strategy.

---

# 🍸 Project Blueprint: "Botanica" - Modern Gin Tasting Platform

## 1. Project Overview
"Botanica" is a containerized, full-stack web application designed to facilitate interactive, real-time gin tasting sessions. It features an Admin dashboard for managing sessions and a Participant interface for logging tasting notes. The app requires a highly polished, app-like UI with smooth transitions and robust data aggregation for post-tasting reveals.

## 2. Technology Stack
*   **Frontend & API:** Next.js (App Router, React 18+)
*   **Styling:** Tailwind CSS + Radix UI (or Shadcn/ui) for accessible primitives.
*   **Animations:** Framer Motion (for layout transitions, staggering cards, and micro-interactions).
*   **Icons:** `lucide-react`.
*   **Database:** PostgreSQL.
*   **ORM:** Prisma.
*   **State Management:** Zustand (for client-side tasting state) & SWR/React Query (for data fetching).
*   **Real-time (Optional/Recommended):** Pusher or Server-Sent Events (SSE) for syncing session state (e.g., Admin moves to "Gin 2", all participants' screens update).
*   **Infrastructure:** Docker & Docker Compose.

---

## 3. Database Schema (Prisma)

The agent should implement the following relational data models:

```prisma
model Session {
  id           String        @id @default(uuid())
  name         String
  date         DateTime      @default(now())
  status       SessionStatus @default(SETUP) // SETUP, ACTIVE, COMPLETED
  passcode     String?       // Optional code to join
  gins         Gin[]
  participants Participant[]
  createdAt    DateTime      @default(now())
}

enum SessionStatus {
  SETUP
  ACTIVE
  COMPLETED
}

model Gin {
  id           String        @id @default(uuid())
  sessionId    String
  session      Session       @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  order        Int           // 1st gin, 2nd gin, etc. (Configurable amount)
  name         String        // Revealed later to participants
  distillery   String
  abv          Float
  description  String
  tastingNotes TastingNote[]
}

model Participant {
  id           String        @id @default(uuid())
  sessionId    String
  session      Session       @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  name         String
  tastingNotes TastingNote[]
  joinedAt     DateTime      @default(now())
}

model TastingNote {
  id            String      @id @default(uuid())
  participantId String
  participant   Participant @relation(fields: [participantId], references: [id], onDelete: Cascade)
  ginId         String
  gin           Gin         @relation(fields: [ginId], references: [id], onDelete: Cascade)
  
  // Scoring (1-10 or 1-5)
  overallScore  Int
  
  // Flavor Wheels (1-5 intensity)
  juniper       Int
  citrus        Int
  floral        Int
  spice         Int
  herbal        Int
  sweetness     Int
  
  // Free text
  customNotes   String?     @db.Text
  
  @@unique([participantId, ginId]) // One note per gin per participant
}
```

---

## 4. Flavor Categories & Terminology Library
The app must include a static or database-driven dictionary to explain flavor categories to users via tooltips or bottom sheets.

*   **Juniper:** The quintessential piney, resinous backbone of gin.
*   **Citrus:** Notes of lemon, sweet orange, bitter grapefruit, or lime.
*   **Floral:** Delicate aromas like rose, lavender, chamomile, or violet.
*   **Spice:** Warmth from coriander, cardamom, cinnamon, cubeb berries, or peppercorn.
*   **Herbal/Earthy:** Rooty, vegetal notes like angelica, licorice, rosemary, or thyme.

---

## 5. User Roles & Workflows

### Admin Workflow
1.  **Dashboard:** View past and upcoming sessions.
2.  **Session Creator:** Define a session name, date, and dynamically add $N$ number of gins (configurable array of inputs).
3.  **Lobby Management:** Open the session lobby. See participants join in real-time.
4.  **Tasting Conductor:** Progress the session step-by-step (e.g., "Pouring Gin 1", "Tasting Gin 1", "Reveal Gin 1").
5.  **Analytics Reveal:** Close the session and calculate/display the aggregate data (average scores, radar charts for flavor profiles, top-rated gin).

### Participant Workflow
1.  **Join:** Navigate to `/join`, enter Name and Session ID.
2.  **Lobby:** Wait in a nicely animated lobby until the Admin starts the tasting.
3.  **Tasting Cards:** Presented with a clean, mobile-first "Tasting Card" for the current gin (anonymized as "Gin #1").
    *   Use sliders or tap-to-fill stars/bubbles for flavor intensities.
    *   View "Hints" (explanations) via `lucide-react` info icons.
    *   Submit card.
4.  **Results:** View the grand reveal at the end, comparing their personal notes against the group consensus.

---

## 6. UI/UX & Design Specifications

*   **Theme:** "Modern Speakeasy" / Botanical elegance.
    *   *Colors:* Deep forest greens, charcoal, off-white (cream), with copper/gold accents for active states.
    *   *Typography:* A clean sans-serif for UI (e.g., Inter) and a sophisticated serif for headings (e.g., Playfair Display).
*   **Transitions (Framer Motion):**
    *   **Page Loads:** Fade in and slide up (`y: 20` to `y: 0`, `opacity: 0` to `1`).
    *   **Card Swiping:** When advancing to the next gin, the previous card should slide left and the new card slides in from the right.
    *   **Lobby:** Pulsing or slow-spinning botanical SVGs in the background.
*   **Components:**
    *   **Glassmorphism:** Use subtle frosted glass effects (`backdrop-blur-md`, `bg-white/10`) for tasting cards overlaid on dark, rich backgrounds.
    *   **Icons (`lucide-react`):** Use `Martini` or `Wine` for drinks, `Info` for flavor hints, `Users` for lobby count, `BarChart` for results, `Leaf` for botanical hints.
    *   **Radar Charts:** Use `recharts` or `chart.js` to render beautiful, overlapping radar charts for the flavor profiles (comparing "User Profile" vs "Group Average").

---

## 7. Docker Configuration

The agent must create a `docker-compose.yml` and `Dockerfile` to ensure the app is fully containerized.

**`Dockerfile` (Next.js Multi-stage):**
Needs to handle dependency installation, Prisma client generation, building, and serving via a lightweight Node image (e.g., `node:20-alpine`).

**`docker-compose.yml`:**
```yaml
version: '3.8'
services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: root
      POSTGRES_PASSWORD: password
      POSTGRES_DB: botanica
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  web:
    build:
      context: .
      dockerfile: Dockerfile
    environment:
      DATABASE_URL: postgresql://root:password@db:5432/botanica?schema=public
    ports:
      - "3000:3000"
    depends_on:
      - db

volumes:
  pgdata:
```

---

## 8. Agent Execution Steps

**Phase 1: Setup & Infrastructure**
1.  Initialize Next.js project with Tailwind CSS and TypeScript.
2.  Install dependencies: Prisma, Framer Motion, Lucide React, Zustand, Recharts.
3.  Initialize Prisma, define schema, create initial migration.
4.  Write `Dockerfile` and `docker-compose.yml`.

**Phase 2: Backend API & Data Layer**
1.  Create Next.js Route Handlers (`/api/sessions`, `/api/sessions/[id]/join`, `/api/notes`, `/api/results`).
2.  Implement database queries for creating sessions with $N$ gins, registering participants, and aggregating results.

**Phase 3: Admin Features**
1.  Build Admin Dashboard UI (`/admin`).
2.  Build Session Creation form (dynamic fields for gins).
3.  Build Admin Control Panel (to monitor participants and calculate/trigger results).

**Phase 4: Participant UI & UX**
1.  Build Landing/Join page.
2.  Build the Tasting View: 
    *   Implement Framer Motion transitions for "Tasting Cards".
    *   Create custom slider/rating components for Juniper, Citrus, Floral, etc.
    *   Implement the Info tooltips explaining the flavors.
3.  Wire up form submission to the API.

**Phase 5: Results & Visualization**
1.  Build the Results view using Recharts.
2.  Calculate and display the "Group Consensus" average flavor profile vs. the "Actual" or "User" profile.
3.  Reveal the names, ABV, and descriptions of the anonymized gins.
