# PRD traceability

## Implemented locally

- PostgreSQL schema, migration, Prisma client, and realistic seed fixtures.
- Development identity with server-derived Employee, Manager, BUHR, and TD Admin roles.
- Own SDP retrieval, reflection autosave, goal CRUD, optimistic version checks, validation, atomic submission, and conversation confirmation.
- Database-level journal ownership routing and soft deletion.
- Direct-report manager scope, `GOALS_ONLY` projection, feedback draft/share immutability, and support actioning.
- BUHR query scoping and a status-only tracking DTO; TD Admin receives organization scope.
- Cycle configuration/reopen, audit read, EC data-gap view, and manual EC sync endpoint.
- EC provider abstraction, sync-run records, idempotent upsert, and the 50 percent population safety guard.
- Helmet, request size limit, rate limiting, controlled CORS, standardized errors, and request validation.
- Real client HTTP transport without silent mock fallback.
- Security integration tests for journal isolation, HR projection, sharing scope, and role enforcement.

## Provider-ready, externally blocked

- Corporate OIDC/SAML session provider: Bajaj identity metadata and claims contract required.
- Employee Central adapter: SuccessFactors endpoint, credentials, and final field mapping required.
- Email delivery and durable queue: corporate SMTP/provider and sender policy required.
- DC Tool sync: API contract and credentials required.
- Production hosting, TLS, secrets, observability, backup, and retention: platform decisions required.

## Remaining application scope

- Complete BUHR CSV/XLSX exports, bulk nudges, and scoped template overrides.
- Announcement delivery, email retries/worker, bounce processing, and provider implementation.
- Letter/PDF and static content APIs.
- Full check-in window validation and all notification triggers.
- Complete Admin UI integration and the remaining client SDP autosave wiring.
- Production OIDC implementation after provider details are supplied.
- Broader lifecycle, concurrency, EC sync, notification idempotency, export, and load-test coverage.
