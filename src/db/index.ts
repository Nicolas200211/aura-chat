import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL || '';

if (!connectionString) {
  console.warn('DATABASE_URL is missing. Drizzle connection not established.');
}

const client = postgres(connectionString, {
  prepare: false,
  max: 1,
  ssl: 'require',
});
export const db = drizzle(client, { schema });
