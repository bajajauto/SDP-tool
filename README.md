# SDP Tool

Internal Self Development Plan application with React, Express, TypeScript, Prisma, and PostgreSQL.

## Local setup

Prerequisites: Node.js 22 or newer and PostgreSQL 17. PostgreSQL is installed locally as the Windows service `postgresql-x64-17`. A Docker Compose alternative is provided in `docker-compose.yml`.

1. Copy `.env.example` to `server/.env` and change local credentials as needed.
2. Install packages with `npm install`.
3. Apply migrations with `npm run db:migrate -- --name init`.
4. Load development data with `npm run db:seed`.
5. Run the API with `npm run dev:server`.
6. In another terminal, run the client with `npm run dev`.

The seeded identities include employee `E0001`, manager `M001`, BUHR `HR001`, and TD Admin `ADMIN001`. In development only, set `VITE_DEV_EMPLOYEE_ID` or send `x-employee-id`. The server refuses development authentication when `NODE_ENV=production`.

## Commands

- `npm run build`: type-check/build server and client.
- `npm test`: run backend unit and integration tests.
- `npm run db:generate`: regenerate the Prisma client.
- `npm run db:migrate`: create/apply a development migration.
- `npm run db:seed`: idempotently seed employees, roles, a cycle, SDPs, and templates.

The committed migration is under `server/prisma/migrations`. API documentation is in `docs/openapi.yaml`.

## Security boundaries

- Journal access is available only through an owner-scoped repository. There is no unscoped journal query API.
- BUHR and TD Admin tracking queries do not load reflection, goal, feedback body, check-in text, or journal relations.
- Manager detail is projected on the server. `GOALS_ONLY` responses do not contain a reflection property.
- Submitted SDP content and shared feedback are immutable at the service/API layer.
- Identity and roles are derived server-side. Production requires the corporate OIDC configuration described below.

## Production configuration still supplied externally

- Bajaj corporate OIDC issuer, client ID, client secret, callback URLs, and claims contract.
- SuccessFactors/Employee Central endpoint, credentials, and confirmed OData field mapping.
- Corporate SMTP or queue provider configuration and approved sender addresses.
- DC Tool API contract and credentials.
- Production PostgreSQL URL, TLS policy, backup/retention, secrets manager, hosting, monitoring, and alerting.
- Final cycle dates, templates, role assignments, privacy approval, and the unresolved decisions in PRD section 21.

Local adapters never send real email or contact Employee Central. They are intentionally separated from production providers.
