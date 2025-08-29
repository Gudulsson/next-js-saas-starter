import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.POSTGRES_URL) {
  throw new Error('POSTGRES_URL environment variable is not set');
}

// Configure postgres client with SSL settings
const client = postgres(process.env.POSTGRES_URL, {
  ssl: {
    rejectUnauthorized: false, // For development - set to true in production
  },
  max: 10, // Connection pool size
  idle_timeout: 20, // Close idle connections after 20 seconds
  connect_timeout: 10, // Connection timeout
});

export { client };
export const db = drizzle(client, { schema });
