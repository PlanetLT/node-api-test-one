import fs from "fs";
import path from "path";
import multer from "multer";
import { fileURLToPath } from "url";
import { sendError } from "../utils/apiResponse.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isVercel = Boolean(process.env.VERCEL);
const uploadsDir = isVercel
    ? path.resolve("/tmp/uploads/images")
    : path.resolve(__dirname, "../../uploads/images");

const ensureUploadsDirectory = () => {
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }
};

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        // Resolve directory at request time to avoid module-load crashes in constrained runtimes.
        ensureUploadsDirectory();
        cb(null, uploadsDir);
    },
    filename: (_req, file, cb) => {
        const extension = path.extname(file.originalname);
        const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
        cb(null, filename);
    },
});

const fileFilter = (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        return cb(null, true);
    }
    return cb(new Error("Only image files are allowed"), false);
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,//5mb
    },
});

const uploadImage = (req, res, next) => {
    upload.single("image")(req, res, (error) => {
        if (!error) {
            return next();
        }

        if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
            return sendError(res, { statusCode: 400, message: "image_size_limit" });
        }

        return sendError(res, {
            statusCode: 400,
            message: error.message ? "invalid_image_type" : "file_upload_error",
        });
    });
};

export { uploadImage };
