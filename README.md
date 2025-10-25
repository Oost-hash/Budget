# Budget

A personal finance application with clean architecture. Local-first, your data stays on your machine.

## Status

**Backend - Complete**
- Clean Architecture + DDD
- 5 domains: Category, Account, Payee, Rule, Transaction
- REST API with full CRUD
- SQLite database
- All tests passing

**Frontend - In Progress**
- Svelte 5 + Tailwind CSS setup done
- UI still to be built

## Tech Stack

Backend: Node.js 22, TypeScript, Express, TypeORM, SQLite  
Frontend: Svelte 5, Vite 7, Tailwind CSS 4  
Infrastructure: Docker Compose, hot reload

## Running

```bash
docker compose up
```

- Frontend: http://localhost:5173
- API: http://localhost:3000

## What's Next

- Build the actual UI
- Connect frontend to API
- Transaction management interface
- Budget dashboard
- Reports and visualizations
- Authentication & authorization
- HTTPS support
