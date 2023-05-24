import { env } from '../env'

export const knexConfig = {
  client: 'sqlite',
  connection: {
    filename: env.DATABASE_URL
  },
  useNullAsDefault: true,
  migrations: {
    extension: 'ts',
    directory: './db/migrations'
  }
}
