import express from "express";
import { uploadImage } from "../middleware/uploadMiddleware.js";
import { uploadImageFile } from "../controllers/uploadController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/image", authMiddleware, uploadImage, uploadImageFile);

export default router;
