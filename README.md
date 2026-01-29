# Cloudflare Workers + React Starter Template

[![Deploy to Cloudflare][![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/onelasttry-ambisyoso/barmaster-ph-elite-bar-exam-prep-platform)]

A production-ready full-stack starter template for Cloudflare Workers featuring a Vite/React frontend, Hono backend, and Durable Objects for scalable entity storage (users, chats, messages). Perfect for building real-time apps with zero-config deployment.

## Features

- **Full-Stack TypeScript**: Shared types between frontend and backend.
- **Durable Objects**: Per-entity storage (e.g., UserEntity, ChatBoardEntity) with automatic indexing and pagination.
- **React + TanStack Query**: Modern frontend with SSR support via Cloudflare Pages/Assets.
- **Shadcn/UI + Tailwind**: Beautiful, customizable UI components.
- **Hono Routing**: Fast, type-safe API routes with CORS and logging.
- **Mock Data Seeding**: Pre-populated users/chats/messages for instant demos.
- **Theme Support**: Light/dark mode with persistence.
- **Error Handling**: Client/server error reporting.
- **Hot Reload**: Vite dev server + Workers dev mode.
- **SPA Assets**: Automatic single-page app handling.

## Tech Stack

- **Frontend**: React 18, Vite, TypeScript, TanStack Query, React Router, Shadcn/UI, Tailwind CSS, Lucide Icons, Sonner (toasts)
- **Backend**: Cloudflare Workers, Hono, Durable Objects, TypeScript
- **State**: Immer, Zustand
- **Build Tools**: Bun, Wrangler, Cloudflare Vite Plugin
- **UI/UX**: Framer Motion, Tailwind Animate, Headless UI

## Quick Start

1. **Clone & Install**:
   ```bash
   git clone <your-repo-url>
   cd <project-name>
   bun install
   ```

2. **Run Development**:
   ```bash
   bun run dev
   ```
   - Frontend: http://localhost:3000
   - API: http://localhost:3000/api/health

3. **Deploy**:
   ```bash
   bun run deploy
   ```

## Installation

Prerequisites:
- [Bun](https://bun.sh/) (package manager)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install/) (Cloudflare deployment)

```bash
bun install
bunx wrangler types  # Generate bindings types (if needed)
```

## Development

### Local Development
```bash
# Start dev server (frontend + Workers proxy)
bun run dev

# Type generation
bun run cf-typegen

# Lint
bun run lint

# Build for preview
bun run build
bun run preview
```

### Project Structure
```
├── src/              # React frontend
├── worker/           # Cloudflare Workers backend
├── shared/           # Shared types/mock data
└── wrangler.jsonc    # Workers config
```

- **Frontend**: Edit `src/pages/HomePage.tsx` and components.
- **Backend**: Add routes in `worker/user-routes.ts`. Use entities from `worker/entities.ts`.
- **Entities**: Extend `IndexedEntity` for new models with auto-indexing/pagination.
- **API Client**: Use `src/lib/api-client.ts` for type-safe fetches.

### API Examples

Test with `curl` or fetch:

```bash
# List users (paginated)
curl "http://localhost:3000/api/users?limit=10"

# Create user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe"}'

# List chats
curl "http://localhost:3000/api/chats"

# Create chat
curl -X POST http://localhost:3000/api/chats \
  -H "Content-Type: application/json" \
  -d '{"title": "My Chat"}'

# Send message
curl -X POST "http://localhost:3000/api/chats/c1/messages" \
  -H "Content-Type: application/json" \
  -d '{"userId": "u1", "text": "Hello!"}'
```

## Deployment

Deploy to Cloudflare Workers with Pages/Assets for the frontend:

1. **Login**:
   ```bash
   bunx wrangler login
   bunx wrangler whoami
   ```

2. **Configure** (edit `wrangler.jsonc`):
   - Set `name` to your project name.

3. **Deploy**:
   ```bash
   bun run build  # Build frontend assets
   bun run deploy
   ```

4. **Custom Domain/Preview**:
   ```bash
   bunx wrangler pages deploy dist --project-name=<your-pages-project>
   ```

[![Deploy to Cloudflare][![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/onelasttry-ambisyoso/barmaster-ph-elite-bar-exam-prep-platform)]

## Customization

- **New Entities**: Extend `IndexedEntity` in `worker/entities.ts`, add routes in `user-routes.ts`.
- **UI Components**: Shadcn components in `src/components/ui/`. Add via `npx shadcn@latest add <component>`.
- **Theme**: Edit `tailwind.config.js` and `src/index.css`.
- **Routes**: Frontend uses React Router (`src/main.tsx`).

## Troubleshooting

- **Types Missing**: Run `bun run cf-typegen`.
- **CORS Issues**: Already configured for `/api/*`.
- **Durable Objects**: Auto-migrated via `wrangler.jsonc`.
- **Bun Issues**: Ensure Bun >=1.0: `bun --version`.

## License

MIT License. See [LICENSE](LICENSE) for details.