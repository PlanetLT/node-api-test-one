import "dotenv/config";
import prismaClientPkg from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { logger } from "../utils/logger.js";

const { PrismaClient } = prismaClientPkg;
const isDevelopment = process.env.NODE_ENV === "development";
const connectionString = process.env.DATABASE_URL;

const createDbConfigError = () => {
    const error = new Error("DATABASE_URL is not set");
    error.code = "DB_NOT_CONFIGURED";
    return error;
};

const createUnavailablePrismaClient = () =>
    // This keeps imports alive and throws a meaningful error only when DB is actually used.
    new Proxy(
        {},
        {
            get() {
                throw createDbConfigError();
            },
        }
    );

const prisma = connectionString
    ? new PrismaClient({
          log: isDevelopment ? ["query", "error", "warn"] : ["error"],
          adapter: new PrismaPg({ connectionString }),
      })
    : createUnavailablePrismaClient();

const connectDB = async () => {
    if (!connectionString) {
        const error = createDbConfigError();
        logger.error({ err: error }, "Database URL is missing");
        throw error;
    }

    try {
        await prisma.$connect();
        logger.info("Database connected successfully");
    } catch (error) {
        if (error?.code === "ECONNREFUSED") {
            logger.error(
                { err: error },
                "Database connection refused. Verify DATABASE_URL host/port and Postgres reachability."
            );
        } else {
            logger.error({ err: error }, "Error connecting to database");
        }
        throw error;
    }
};

const disconnectDB = async () => {
    if (!connectionString) {
        return;
    }
    await prisma.$disconnect();
};

export { connectDB, prisma, disconnectDB };
