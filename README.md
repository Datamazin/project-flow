## Atelier Flow

A joy-forward, local-first project management studio built with Next.js 16, TypeScript, and Tailwind CSS. Atelier Flow blends planning and writing tools into a single, atmospheric workspace that keeps all data on-device until Supabase sync arrives.

### Features

- **Todo Studio** – quick capture, due dates, and celebration badges.
- **Kanban Runway** – multi-column board with priorities, tags, and forward/back actions.
- **Document Atelier** – markdown editor with live preview and focus mode, powered by `marked` and `dompurify`.
- **Flow Guide Chat** – a lightweight, context-aware companion that responds using your local data.
- **Local Persistence** – Zustand with storage persistence keeps every change on your device.

### Getting Started

Install dependencies (only required after cloning or deleting `node_modules`):

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to enter the studio.

### Available Scripts

- `npm run dev` – start the local development server.
- `npm run build` – create a production build.
- `npm run start` – serve the production build.
- `npm run lint` – run the ESLint suite.

### Tech Stack

- Next.js 16 (App Router) with TypeScript
- Tailwind CSS v4 for styling
- Zustand for local-first state management
- Marked + DOMPurify for document rendering
- Framer Motion + Lucide React for motion and iconography

### Local-First Notes

All workspace data (todos, kanban cards, documents, chat history) is stored in `localStorage` under the key `atelier-workspace`. Clearing browser storage or clicking **Reset workspace** from the hero section will wipe this data. Supabase integration can be layered in later without refactoring component structure.
