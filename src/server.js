import express from 'express';
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import movieRoute from './routes/movieRoute.js';
import authRoute from './routes/authRoute.js';
import watchlistRoute from './routes/watchlistRoute.js';
import uploadRoute from './routes/uploadRoute.js';
import { config } from 'dotenv';
import { connectDB, disconnectDB } from './config/db.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { sendError } from "./utils/apiResponse.js";
import { logger, requestLogger } from "./utils/logger.js";

config();

const app = express();
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per window
    handler: (_req, res) => {
        return sendError(res, {
            statusCode: 429,
            message: "Too many requests from this IP, please try again later.",
        });
    },
    standardHeaders: true,
    legacyHeaders: false,
});

//For file upload path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);// project/src
const isVercel = Boolean(process.env.VERCEL);
const staticUploadsDir = isVercel
    ? path.resolve("/tmp/uploads")
    : path.resolve(__dirname, "../uploads");

//Body Passing Middleware
app.use(requestLogger);
app.use(helmet());
app.use(apiLimiter);
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use('/uploads', express.static(staticUploadsDir));

//API Routes
app.use('/movies', movieRoute);
app.use('/auth', authRoute);
app.use('/watchlist', watchlistRoute);
app.use('/upload', uploadRoute);


const PORT = 5001;
let server;

const startServer = async () => {
    await connectDB();
    server = app.listen(PORT, () => {
        logger.info({ port: PORT }, "Server started");
    });
};

if (!isVercel) {
    startServer();
} else {
    connectDB().catch((err) => {
        logger.error({ err }, "Database initialization failed");
    });
}

if (!isVercel) {
    // Handle unhandled promise rejections(e.g. database connection errors)
    process.on("unhandledRejection", (err) => {
        logger.error({ err }, "Unhandled rejection");
        if (server) {
            server.close(async () => {
                await disconnectDB();
                process.exit(1);
            });
            return;
        }
        process.exit(1);
    });

    // Handle uncaught exceptions
    process.on("uncaughtException", async (err) => {
        logger.fatal({ err }, "Uncaught exception");
        await disconnectDB();
        process.exit(1);
    });

    // Handle SIGTERM for graceful shutdown
    process.on("SIGTERM", (err) => {
        logger.warn({ err }, "SIGTERM received");
        if (server) {
            server.close(async () => {
                await disconnectDB();
                process.exit(0);
            });
            return;
        }
        process.exit(0);
    });
}

export default app;
