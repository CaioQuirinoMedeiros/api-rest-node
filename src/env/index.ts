import { config } from 'dotenv'
import { z } from 'zod'

if (process.env.NODE_ENV === 'test') {
  config({ path: '.env.test' })
} else {
  config()
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('production'),
  DATABASE_URL: z.string(),
  PORT: z.coerce.number().default(3333)
})

const envResult = envSchema.safeParse(process.env)

if (envResult.success === false) {
  console.error('Invalid environment variables!', envResult.error.format())

  throw new Error('Invalid environment variables!')
}

export const env = envResult.data
