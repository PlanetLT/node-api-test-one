import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import movieRoute from "./routes/movieRoute.js";
import authRoute from "./routes/authRoute.js";
import watchlistRoute from "./routes/watchlistRoute.js";
import uploadRoute from "./routes/uploadRoute.js";
import { config } from "dotenv";
import { connectDB, disconnectDB } from "./config/db.js";
import { connectRedis, disconnectRedis, isRedisReady, redis } from "./config/redis.js";
import path from "path";
import { fileURLToPath } from "url";
import { sendError } from "./utils/apiResponse.js";
import { logger, requestLogger } from "./utils/logger.js";
import { methodNotAllowedMiddleware, notFoundMiddleware } from "./middleware/methodNotAllowedMiddleware.js";
import i18next from "./i18n.js";
import i18nextMiddleware from "i18next-http-middleware";
import { HTTP_STATUS } from "./constants/httpStatus.js";

config();

const isVercel = Boolean(process.env.VERCEL);
const port = Number(process.env.PORT) || 5001;
const app = express();
let server;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const staticUploadsDir = isVercel
    ? path.resolve("/tmp/uploads")
    : path.resolve(__dirname, "../uploads");

const createApiLimiter = () => {
    const store = isRedisReady()
        ? new RedisStore({
            sendCommand: (...args) => redis.sendCommand(args),
        })
        : undefined;

    return rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // limit each IP to 100 requests per window
        handler: (_req, res) => {
            return sendError(res, {
                statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
                message: "too_many_requests_from_ip",
            });
        },
        store,
        standardHeaders: true,
        legacyHeaders: false,
    });
};

const configureMiddleware = () => {
    app.use(requestLogger);
    app.use(i18nextMiddleware.handle(i18next));
    app.use(helmet());
    app.use(createApiLimiter());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    // Vercel can only write to /tmp; local runtime uses project uploads directory.
    app.use("/uploads", express.static(staticUploadsDir));
};

const configureRoutes = () => {
    app.use(methodNotAllowedMiddleware);
    app.use("/movies", movieRoute);
    app.use("/auth", authRoute);
    app.use("/watchlist", watchlistRoute);
    app.use("/upload", uploadRoute);
    app.use(notFoundMiddleware);
    app.use((err, _req, res, next) => {
        if (err instanceof SyntaxError && "body" in err) {
            return sendError(res, {
                statusCode: HTTP_STATUS.BAD_REQUEST,
                message: "invalid_json_payload_with_details",
                messageParams: { details: err.message || "Malformed JSON" },
            });
        }
        return next(err);
    });
};

const closeServerAndExit = (exitCode) => {
    if (!server) {
        process.exit(exitCode);
        return;
    }

    server.close(async () => {
        await disconnectDB();
        await disconnectRedis();
        process.exit(exitCode);
    });
};

const registerProcessHandlers = () => {
    process.on("unhandledRejection", (err) => {
        logger.error({ err }, "Unhandled rejection");
        closeServerAndExit(1);
    });

    process.on("uncaughtException", async (err) => {
        logger.fatal({ err }, "Uncaught exception");
        await disconnectDB();
        await disconnectRedis();
        process.exit(1);
    });

    process.on("SIGTERM", (err) => {
        logger.warn({ err }, "SIGTERM received");
        closeServerAndExit(0);
    });
};

const initializeRuntime = async () => {
    if (isVercel) {
        connectDB().catch((err) => {
            logger.error({ err }, "Database initialization failed");
        });
        connectRedis().catch((err) => {
            logger.error({ err }, "Redis initialization failed");
        });
        configureMiddleware();
        configureRoutes();
        return;
    }

    registerProcessHandlers();
    await connectRedis();
    await connectDB();
    configureMiddleware();
    configureRoutes();
    server = app.listen(port, () => {
        logger.info({ port }, "Server started");
    });
};

initializeRuntime().catch((err) => {
    logger.fatal({ err }, "Runtime initialization failed");
    if (!isVercel) {
        process.exit(1);
    }
});

export default app;
