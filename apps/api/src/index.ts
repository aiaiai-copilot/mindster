import { buildApp } from './app'
import { env } from './shared/lib/env'

async function main() {
  const app = await buildApp()

  try {
    await app.listen({ port: env.PORT, host: env.HOST })
    console.log(`Server running at http://${env.HOST}:${env.PORT}`)
  } catch (error) {
    app.log.error(error)
    process.exit(1)
  }
}

main()
