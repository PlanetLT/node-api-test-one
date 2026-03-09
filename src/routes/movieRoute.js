import express from 'express';
import { sendSuccess } from "../utils/apiResponse.js";
const router = express.Router();

router.get('/', (req, res) => {
    return sendSuccess(res, {
        message: "movie_route_test",
        data: { httpMethod: "GET" },
    });
});
router.post('/', (req, res) => {
    return sendSuccess(res, {
        message: "movie_route_test",
        data: { httpMethod: "POST" },
    });
});
router.put('/', (req, res) => {
    return sendSuccess(res, {
        message: "movie_route_test",
        data: { httpMethod: "PUT" },
    });
});
router.delete('/', (req, res) => {
    return sendSuccess(res, {
        message: "movie_route_test",
        data: { httpMethod: "DELETE" },
    });
});
export default router;
