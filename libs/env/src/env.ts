import { z } from 'zod';

export const envSchema = z.object({
  PORT: z.coerce.number().optional().default(3000),
  NODE_ENV: z.string(),
  DB_HOST: z.string(),
  DB_PORT: z.string(),
  DB_USER: z.string(),
  DB_PASS: z.string(),
  DB_NAME: z.string(),
  JWT_SECRET: z.string(),
  // JWT_EXPIRATION: z.coerce
  //   .number()
  //   .optional()
  //   .default(60 * 60 * 24),
});

export type Env = z.infer<typeof envSchema>;
