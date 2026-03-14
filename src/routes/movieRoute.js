import express from "express";
import { sendSuccess } from "../utils/apiResponse.js";
import { cacheMiddleware, invalidateCache } from "../middleware/cacheMiddleware.js";
const router = express.Router();

const movieListCacheKey = "movies:list";

router.get(
    "/",
    cacheMiddleware(() => movieListCacheKey),
    (req, res) => {
    return sendSuccess(res, {
        message: "movie_route_test",
        data: { httpMethod: "GET" },
    });
});

router.post("/", async (req, res) => {
    await invalidateCache(movieListCacheKey);
    return sendSuccess(res, {
        message: "movie_route_test",
        data: { httpMethod: "POST" },
    });
});
router.put("/", async (req, res) => {
    await invalidateCache(movieListCacheKey);
    return sendSuccess(res, {
        message: "movie_route_test",
        data: { httpMethod: "PUT" },
    });
});
router.delete("/", async (req, res) => {
    await invalidateCache(movieListCacheKey);
    return sendSuccess(res, {
        message: "movie_route_test",
        data: { httpMethod: "DELETE" },
    });
});
export default router;
