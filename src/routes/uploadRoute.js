import express from "express";
import { uploadImage } from "../middleware/uploadMiddleware.js";
import { uploadImageFile } from "../controllers/uploadController.js";

const router = express.Router();

router.post("/image", uploadImage, uploadImageFile);

export default router;
