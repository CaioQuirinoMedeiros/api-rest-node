import { env } from './env'
import { app } from './app'

app
  .listen({
    port: env.PORT
  })
  .then(() => {
    console.log(`HTTP server running on PORT ${env.PORT}`)
  })
