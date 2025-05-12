import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';

let client = postgres(`${process.env.POSTGRES_URL!}?sslmode=require`);
let db = drizzle(client);

export default db;