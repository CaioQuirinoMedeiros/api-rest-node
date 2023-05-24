import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'

import { knex } from '../database'
import { checkSessionIdExists } from '../middlewares/checkSessionIdExists'
import { AppError } from '../errors/AppError'

const createTransactionBodySchema = z.object({
  title: z.string(),
  amount: z.number(),
  type: z.enum(['credit', 'debit'])
})

const getTransactionParamsSchema = z.object({
  transactionId: z.string().uuid()
})

export async function transactionsRoutes(app: FastifyInstance) {
  app.get(
    '/',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const sessionId = request.cookies.sessionId

      const transactions = await knex
        .table('transactions')
        .where({ session_id: sessionId })
        .select()
      return reply.send({ transactions })
    }
  )

  app.get(
    '/summary',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const sessionId = request.cookies.sessionId

      const summary = await knex('transactions')
        .where({ session_id: sessionId })
        .sum('amount', { as: 'amount' })
        .first()

      return reply.send({ summary })
    }
  )

  app.get(
    '/:transactionId',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const sessionId = request.cookies.sessionId
      const { transactionId } = getTransactionParamsSchema.parse(request.params)

      const transaction = await knex
        .table('transactions')
        .where({ id: transactionId, session_id: sessionId })
        .first()

      if (!transaction) {
        throw new AppError({ statusCode: 404, message: 'Not found' })
      }

      return reply.send({transaction})
    }
  )

  app.post('/', async (request, reply) => {
    const { title, amount, type } = createTransactionBodySchema.parse(
      request.body
    )

    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()
      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 dias
      })
    }

    await knex.table('transactions').insert({
      id: randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1,
      session_id: sessionId
    })

    return reply.status(201).send()
  })
}
