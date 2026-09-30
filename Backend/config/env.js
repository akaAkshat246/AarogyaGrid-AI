import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
export const root = fileURLToPath(new URL('../', import.meta.url));
dotenv.config({ path: root + '.env', quiet: true });
const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  HOST: z.string().default('127.0.0.1'),
  PORT: z.coerce.number().int().min(1).max(65535).default(5000),
  DEV_SKIP_AUTH: z.enum(['true', 'false']).default('false'),
  AI_URL: z.url().refine(v => /^https?:\/\//.test(v), 'AI_URL must be HTTP(S)'),
  AI_PREDICT_PATH: z.string().regex(/^\/(?!\/)/).default('/predict'),
  AI_TIMEOUT_MS: z.coerce.number().int().min(100).max(120000).default(15000),
  AI_API_KEY: z.string().default(''),
  CORS_ORIGINS: z.string().default('http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000')
});
export function parseEnv(input) {
  const data = schema.parse(input);
  if (data.NODE_ENV === 'production' && data.DEV_SKIP_AUTH === 'true') {
    throw new Error('DEV_SKIP_AUTH must be false in production');
  }
  return { ...data, skipAuth: data.DEV_SKIP_AUTH === 'true',
    origins: data.CORS_ORIGINS.split(',').map(v => v.trim()).filter(Boolean) };
}
export const env = parseEnv(process.env);
