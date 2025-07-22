import { reset, seed } from 'drizzle-seed'
import { db, sql } from './connection.ts'
import { schema } from '@/db/schema/index.ts'

await reset(db, schema)

await seed(db, schema).refine(faker => {
  return {
    files: {
      count: 5,
      columns: {
        name: faker.companyName(),
        key: faker.uuid(),
        contentType: faker.default({ defaultValue: 'image/png' })
      }
    },
  }
})

await sql.end()

console.log('🔥 Database reset and seeded successfully!')