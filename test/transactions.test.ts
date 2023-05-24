import {
  expect,
  it,
  beforeAll,
  afterAll,
  describe,
  beforeEach,
  afterEach
} from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'

import { app } from '../src/app'

describe('Transactions routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    execSync('yarn knex migrate:rollback --all')
    execSync('yarn knex migrate:latest')
  })

  it('user can create a new transaction', async () => {
    const response = await request(app.server)
      .post('/transactions')
      .send({ title: 'new transaction', amount: 500, type: 'credit' })

    expect(response.statusCode).toBe(201)
  })

  it('should be able to list all transactions', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({ title: 'new transaction', amount: 500, type: 'credit' })

    const cookies = createTransactionResponse.get('Set-Cookie')

    const response = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)

    expect(response.statusCode).toBe(200)
    expect(response.body.transactions).toEqual([
      expect.objectContaining({
        title: 'new transaction',
        amount: 500
      })
    ])
  })

  it('should be able to get a specific transaction', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({ title: 'new transaction', amount: 500, type: 'credit' })

    const cookies = createTransactionResponse.get('Set-Cookie')

    const getTransactionsResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)

    const transaction = getTransactionsResponse.body.transactions[0]

    const response = await request(app.server)
      .get(`/transactions/${transaction.id}`)
      .set('Cookie', cookies)

    expect(response.statusCode).toBe(200)
    expect(response.body.transaction).toEqual(
      expect.objectContaining({
        title: 'new transaction',
        amount: 500
      })
    )
  })

  it('should be able to get the summary', async () => {
    const createTransactionResponse1 = await request(app.server)
      .post('/transactions')
      .send({ title: 'credit transaction', amount: 300, type: 'credit' })

    const cookies = createTransactionResponse1.get('Set-Cookie')

    await request(app.server)
      .post('/transactions')
      .set('Cookie', cookies)
      .send({ title: 'debit transaction', amount: 800, type: 'debit' })

    const response = await request(app.server)
      .get('/transactions/summary')
      .set('Cookie', cookies)

    expect(response.statusCode).toBe(200)
    expect(response.body.summary).toEqual(
      expect.objectContaining({
        amount: -500
      })
    )
  })
})
