import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4100),
  CLIENT_ORIGIN: z.string().url().default('http://localhost:5173'),
  DATABASE_URL: z.string().min(1),
  AUTH_MODE: z.enum(['development', 'oidc']).default('development'),
  DEV_EMPLOYEE_ID: z.string().min(1).default('E0001'),
  SESSION_SECRET: z.string().min(32).default('development-only-secret-change-me-now'),
  EMAIL_PROVIDER: z.enum(['log', 'smtp']).default('log'),
  EC_PROVIDER: z.enum(['mock', 'successfactors']).default('mock'),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  throw new Error(`Invalid environment configuration: ${parsed.error.message}`);
}
if (parsed.data.NODE_ENV === 'production' && parsed.data.AUTH_MODE === 'development') {
  throw new Error('Development authentication cannot be enabled in production');
}

export const config = parsed.data;
