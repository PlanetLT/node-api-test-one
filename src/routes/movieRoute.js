import express from "express";
import { validateRequest } from "../middleware/validationRequest.js";
import {
  cacheMiddleware,
  invalidateCache,
} from "../middleware/cacheMiddleware.js";
import {
  createMovieSchema,
  updateMovieSchema,
} from "../validators/movieValidators.js";
import {
  createMovieItem,
  deleteMovieItem,
  updateMovieItem,
  getMovielist,
} from "../controllers/movieController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
const router = express.Router();

const movieListCacheKey = "movies:list";

router.use(authMiddleware);

router.post(
  "/",
  validateRequest(createMovieSchema),
  invalidateCache(movieListCacheKey),
  createMovieItem,
);
router.get(
  "/",
  cacheMiddleware(() => movieListCacheKey),
  getMovielist,
);
router.put(
  "/:id",
  validateRequest(updateMovieSchema),
  invalidateCache(movieListCacheKey),
  updateMovieItem,
);
router.delete("/:id", invalidateCache(movieListCacheKey), deleteMovieItem);
export default router;
