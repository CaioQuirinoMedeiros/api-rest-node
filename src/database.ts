import { knex as setupKnex } from 'knex'
import { knexConfig } from './config/knexConfig'

export const knex = setupKnex(knexConfig)
