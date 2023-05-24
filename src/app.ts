import fastify from 'fastify'
import cookie from '@fastify/cookie'

import { transactionsRoutes } from './routes/transactions'
import { knex } from './database'
import { AppError } from './errors/AppError'

export const app = fastify()

app.register(cookie)
app.register(transactionsRoutes, { prefix: 'transactions' })
app.get('/db', async () => {
  const tables = await knex('sqlite_schema').select()
  return tables
})

app.setErrorHandler(function (error, request, reply) {
  if (error instanceof AppError) {
    this.log.error(error)
    reply.status(error.statusCode).send({ errorMessage: error.message })
  } else {
    reply.status(500).send(error)
  }
})

