# Scaffold Monorepo Structure

We will set up the monorepo for Collective Unconscious with a client, server, and Prisma setup, along with Docker configuration. 

## User Review Required

> [!IMPORTANT]
## User Review Required

> [!IMPORTANT]
> Please review the Prisma schema design below. It is critical to get the data model right before generating the migrations. It was designed based on the entities found in the React prototype and `project-context.md`.
> Note: As specified in `project_memory/decisions.md` and `.antigravityrules`, we are using `Participant` for color assignment and `String` for IDs using `uuid()`. We are also using strings for simple enums for now (like visibility and turnOrder).

### Proposed Prisma Schema

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id           String        @id @default(uuid())
  username     String        @unique
  email        String        @unique
  createdAt    DateTime      @default(now())
  
  prompts      Prompt[]
  logsCreated  Log[]
  participations Participant[]
  reactions    Reaction[]
}

model Prompt {
  id           String   @id @default(uuid())
  text         String
  type         String   // e.g., "PLATFORM", "USER"
  number       String?  // e.g., "VII" for weekly prompts
  creatorId    String?
  creator      User?    @relation(fields: [creatorId], references: [id])
  createdAt    DateTime @default(now())

  logs         Log[]
}

model Log {
  id           String   @id @default(uuid())
  title        String
  promptId     String?
  prompt       Prompt?  @relation(fields: [promptId], references: [id])
  creatorId    String
  creator      User     @relation(fields: [creatorId], references: [id])
  
  // Settings
  visibility   String   @default("PUBLIC") // "PUBLIC" | "INVITE_ONLY"
  turnOrder    String   @default("SEQUENTIAL")
  roundLimit   Int?     // null means unlimited
  
  complete     Boolean  @default(false)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  participants Participant[]
  turns        Turn[]
  reactions    Reaction[]
}

model Participant {
  id           String   @id @default(uuid())
  userId       String
  logId        String
  color        String   // e.g., "amber", "rose", "sky", "violet", "emerald"
  orderIndex   Int?     // For sequential turn order
  
  user         User     @relation(fields: [userId], references: [id])
  log          Log      @relation(fields: [logId], references: [id], onDelete: Cascade)
  turns        Turn[]

  @@unique([userId, logId])
}

model Turn {
  id            String   @id @default(uuid())
  text          String
  logId         String
  participantId String
  createdAt     DateTime @default(now())

  log           Log         @relation(fields: [logId], references: [id], onDelete: Cascade)
  participant   Participant @relation(fields: [participantId], references: [id], onDelete: Cascade)
}

model Reaction {
  id        String   @id @default(uuid())
  type      String   // e.g., "✦", "◎", "∿"
  userId    String
  logId     String
  
  user      User     @relation(fields: [userId], references: [id])
  log       Log      @relation(fields: [logId], references: [id], onDelete: Cascade)

  @@unique([userId, logId, type])
}
```

## Proposed Changes

### Root Configurations
#### [NEW] docker-compose.yml
Setup postgres DB, Node API, and Vite Client.
#### [NEW] .env.example
Define necessary environment variables (e.g., DATABASE_URL).

---

### Client App
#### [NEW] client/package.json
Client dependencies including React 18, Vite, React Router v6, Vitest, ESLint, Prettier.
#### [NEW] client/vite.config.js
Vite configuration with Vitest setup.
#### [NEW] client/src/App.jsx
Copy the prototype `collective-unconscious-v2.jsx` here.
#### [NEW] client/src/components/
Folder for PascalCase React components.
#### [NEW] client/src/hooks/
Folder for camelCase custom hooks.
#### [NEW] client/src/services/
Folder for API communication (no raw fetch in components).

---

### Server App
#### [NEW] server/package.json
Server dependencies including Express, Jest, Supertest, ESLint, Prettier, Passport.js (for OAuth).
#### [NEW] server/src/index.js
Basic Express server API setup with essential config and middleware.
#### [NEW] server/src/controllers/
Folder for endpoint controllers.
#### [NEW] server/src/routes/
Folder for API routes (kebab-case).

---

### Database
#### [NEW] prisma/schema.prisma
Data model specified above.

## Verification Plan

### Automated Tests
- Run `npm run test` in `/client` (Vitest)
- Run `npm run test` in `/server` (Jest)

### Manual Verification
- Run `docker compose up --build` and verify all containers are running successfully.
- Ensure the database is initialized with tables per the Prisma schema.
- Load the client app in a browser to see the baseline prototype.
