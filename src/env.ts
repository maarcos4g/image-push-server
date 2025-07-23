import { z } from "zod/v4";

const envSchema = z.object({
  DATABASE_URL: z.url().startsWith('postgresql://'),
  SUPABASE_URL: z.url(),
  SUPABASE_KEY: z.string()
})

export const env = envSchema.parse(process.env)