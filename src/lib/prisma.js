// =============================================================================
// PRISMA CLIENT SINGLETON (with PostgreSQL Driver Adapter)
// =============================================================================
// This file creates a single instance of PrismaClient that is reused across
// all API routes. This is important because:
// 1. Each PrismaClient instance creates a connection pool to the database
// 2. In development, Next.js hot-reloads can create many instances
// 3. Too many instances = "Too many connections" error from PostgreSQL
//
// IMPORTANT: Prisma 7.x uses a new "client" engine type that requires a
// driver adapter for direct database connections. We use @prisma/adapter-pg
// with the 'pg' library (node-postgres) to connect directly to PostgreSQL.
// =============================================================================

// Import PrismaClient from the auto-generated Prisma client
// This client is generated based on your schema.prisma file
import { PrismaClient } from "@prisma/client";

// Import the PostgreSQL adapter for Prisma 7.x
// This adapter translates Prisma queries into pg (node-postgres) driver calls
import { PrismaPg } from "@prisma/adapter-pg";

// Import the Pool class from node-postgres (pg)
// Pool manages a connection pool to PostgreSQL - more efficient than single connections
import pg from "pg";
const { Pool } = pg;

const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL;

export const transactionOptions = {
  maxWait: 10_000,
};

const prismaClientSingleton = () => {
  // ponytail: cap serverless pool at max: 3 to avoid exhausting Supabase pooler limits; tune via env if traffic grows
  const pool = new Pool({
    connectionString: connectionString,
    max: 3,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
  });

  // Create the PostgreSQL adapter using the pool
  // The adapter translates Prisma's query language to PostgreSQL queries
  const adapter = new PrismaPg(pool);

  // Create and return the PrismaClient with the adapter
  // In Prisma 7.x, we MUST provide an adapter for the "client" engine type
  return new PrismaClient({
    adapter: adapter,
    transactionOptions,
    // Uncomment the 'log' option below to see all SQL queries in your terminal
    // Useful for debugging, but can be noisy in production
    // log: ['query', 'info', 'warn', 'error'],
  });
};

// Declare a global variable to store the Prisma instance
// Using 'globalThis' ensures this works in all JavaScript environments
const globalForPrisma = globalThis;

// This is the KEY part of the singleton pattern:
// - If prisma already exists in globalThis, reuse it (prevents new connections)
// - If not, create a new instance using our factory function
// This prevents connection buildup during Next.js hot-reloads in development
const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

export default prisma;

globalForPrisma.prisma = prisma;
