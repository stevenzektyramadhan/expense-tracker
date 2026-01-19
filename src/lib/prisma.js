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

// Get the database connection URL from environment variables
// DIRECT_URL is typically used for direct database connections (bypassing poolers)
// DATABASE_URL is the fallback if DIRECT_URL is not set
const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

// =============================================================================
// Factory function to create PrismaClient with the PostgreSQL adapter
// =============================================================================
const prismaClientSingleton = () => {
  // Create a connection pool to PostgreSQL
  // The pool manages multiple connections and handles reconnection automatically
  const pool = new Pool({
    connectionString: connectionString,
  });

  // Create the PostgreSQL adapter using the pool
  // The adapter translates Prisma's query language to PostgreSQL queries
  const adapter = new PrismaPg(pool);

  // Create and return the PrismaClient with the adapter
  // In Prisma 7.x, we MUST provide an adapter for the "client" engine type
  return new PrismaClient({
    adapter: adapter,
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

// Export the singleton instance - all API routes will import this same instance
export default prisma;

// In development mode, store the instance in globalThis so it persists
// across hot-reloads. In production, this isn't needed because there's
// no hot-reloading, but it doesn't hurt to have it.
if (process.env.NODE_ENV !== "production") {
  // Store in global so the next hot-reload reuses the same instance
  globalForPrisma.prisma = prisma;
}
