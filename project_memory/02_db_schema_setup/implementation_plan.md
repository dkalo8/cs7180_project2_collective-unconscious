# Issue 2: Database schema & Prisma setup (Log, Turn, Writer models)

This plan outlines the required changes to implement the database schema defined in Issue #2. The new schema aligns with the "anonymous, low-pressure" product vibe, moving away from the previous `User`/`Participant` structural prototype.

## User Review Required
> [!WARNING]
> The current `prisma/schema.prisma` contains prototype models (`User`, `Prompt`, `Participant`, `Reaction`) which will be **deleted** and replaced with the new required models: `Log`, `Writer`, and `Turn`. Please confirm if this complete schema replacement is acceptable.

## Proposed Changes

### Database Schema

#### [MODIFY] schema.prisma
File: `/prisma/schema.prisma`
- Remove old models: `User`, `Prompt`, `Participant`, `Reaction`.
- Define `Log` model:
  - id, title, category, accessMode (open/private), turnMode (structured/freestyle), participantLimit, roundLimit, turnTimeout, perTurnLengthLimit, seed/creativeConstraint, status (active/completed), accessCode, createdAt, updatedAt
- Define `Writer` model:
  - id, sessionToken, nickname, colorHex, logId (FK), joinOrder, createdAt, updatedAt
- Define `Turn` model:
  - id, content, turnOrder/sequence, logId (FK), writerId (FK), createdAt

#### [NEW] default seed script
File: `/prisma/seed.ts`
- Create a Prisma DB seed script that populates the database with:
  - 2 sample logs.
  - A few mock writers connected to these logs.
  - Several mock turns representing chains of writing.

#### [MODIFY] package.json
File: `/package.json`
- Add `prisma.seed` configuration pointing to `ts-node prisma/seed.ts`.
- Ensure `ts-node` or `tsx` is available for running the seed script.

## Verification Plan

### Automated Tests
- Run `npx prisma validate` to ensure the schema is structurally correct.
- Run `npx prisma migrate dev --name init_core_schema` to apply the changes to the PostgreSQL database.
- Run `npm run db:seed` (or `npx prisma db seed`) to populate the DB, verifying the seed script completes without errors.

### Manual Verification
- Open `npx prisma studio` and manually verify that the `Log`, `Writer`, and `Turn` tables exist and contain the seeded sample data.
