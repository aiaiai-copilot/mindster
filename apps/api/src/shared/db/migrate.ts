import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'

async function runMigrations() {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    console.error('DATABASE_URL is not set')
    process.exit(1)
  }

  const client = postgres(databaseUrl, { max: 1 })
  const db = drizzle(client)

  console.log('Running migrations...')

  await migrate(db, { migrationsFolder: './src/shared/db/migrations' })

  console.log('Migrations completed successfully')

  await client.end()
  process.exit(0)
}

runMigrations().catch((error) => {
  console.error('Migration failed:', error)
  process.exit(1)
})
