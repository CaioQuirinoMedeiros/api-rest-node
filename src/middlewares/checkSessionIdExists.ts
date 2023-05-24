import { FastifyRequest } from 'fastify'
import { AppError } from '../errors/AppError'

export async function checkSessionIdExists(request: FastifyRequest) {
  const sessionId = request.cookies.sessionId

  if (!sessionId) {
    throw new AppError({ statusCode: 401, message: 'Unauthorized' })
  }
}
