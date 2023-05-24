export class AppError extends Error {
  message: string
  statusCode: number

  constructor(errorData: { message: string; statusCode?: number }) {
    super()
    this.message = errorData.message
    this.statusCode = errorData.statusCode || 400
  }
}
