import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4100),
  CLIENT_ORIGIN: z.string().url().default('http://localhost:5173'),
  DATABASE_URL: z.string().min(1),
  // `appservice`: Azure App Service Authentication (Entra ID) signs the user in
  // and injects the principal headers. `oidc` is reserved for a direct SSO
  // integration and rejects every request until it is built.
  AUTH_MODE: z.enum(['development', 'appservice', 'oidc']).default('development'),
  DEV_EMPLOYEE_ID: z.string().min(1).default('E0001'),
  SESSION_SECRET: z.string().min(32).default('development-only-secret-change-me-now'),
  EMAIL_PROVIDER: z.enum(['log', 'smtp']).default('log'),
  EC_PROVIDER: z.enum(['mock', 'successfactors']).default('mock'),
  // Built client served by the API in production (single App Service).
  CLIENT_DIST_DIR: z.string().min(1).optional(),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  throw new Error(`Invalid environment configuration: ${parsed.error.message}`);
}
if (parsed.data.NODE_ENV === 'production' && parsed.data.AUTH_MODE === 'development') {
  throw new Error('Development authentication cannot be enabled in production');
}
// Principal headers are trustworthy only when App Service Authentication is on,
// because the platform then strips any client-supplied X-MS-CLIENT-PRINCIPAL headers.
if (parsed.data.AUTH_MODE === 'appservice' && process.env.WEBSITE_AUTH_ENABLED?.toLowerCase() !== 'true') {
  throw new Error('AUTH_MODE=appservice requires App Service Authentication to be enabled');
}

export const config = parsed.data;
