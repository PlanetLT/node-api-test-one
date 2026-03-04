import "dotenv/config";
import { PrismaClient } from "@prisma/client";
// Prisma 7's new "client" engine requires either an adapter or an accelerateUrl.
// For a normal Node.js project connecting to PostgreSQL we use the
// "@prisma/adapter-pg" driver adapter and pass our DATABASE_URL.
// See: https://pris.ly/d/client-constructor
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
}

const prisma = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    adapter: new PrismaPg({ connectionString })
});

const connectDB= async()=>{
    try {
        await prisma.$connect();
        console.log("Database connected successfully");
    } catch (error) {
        if (error?.code === "ECONNREFUSED") {
            console.error("Error connecting to the database: connection refused. Verify DATABASE_URL host/port and that Postgres is reachable.");
        } else {
            console.error("Error connecting to the database:", error);
        }
        process.exit(1);
    }
}

const disconnectDB= async()=>{
    await prisma.$disconnect();
}

export {connectDB,prisma,disconnectDB};
