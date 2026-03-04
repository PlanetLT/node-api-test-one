import express from 'express';
import movieRoute from './routes/movieRoute.js';
import authRoute from './routes/authRoute.js';
import watchlistRoute from './routes/watchlistRoute.js';
import uploadRoute from './routes/uploadRoute.js';
import { config } from 'dotenv';
import { connectDB, disconnectDB } from './config/db.js';
import path from 'path';
import { fileURLToPath } from 'url';

config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);// project/src

//Body Passing Middleware
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));//path.resolve(__dirname, '../uploads')=project/upload

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
        console.log(`Server is running on port ${PORT}`);
    });
};

startServer();

// Handle unhandled promise rejections(e.g. database connection errors)
process.on("unhandledRejection", (err) => {
    console.error("Unhandled Rejection:", err);
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
    console.error("Uncaught Exception:", err);
    await disconnectDB();
    process.exit(1);
});

// Handle SIGTERM for graceful shutdown
process.on("SIGTERM", (err) => {
    console.error("SIGTERM received:", err);
    if (server) {
        server.close(async () => {
            await disconnectDB();
            process.exit(0);
        });
        return;
    }
    process.exit(0);
});
