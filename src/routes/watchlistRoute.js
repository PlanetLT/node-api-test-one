import express from "express";
import { addToWatchlist, updateWatchlistItem, removeFromWatchlist, getWatchlist } from "../controllers/watchlistController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validationRequest.js";
import { addToWatchlistSchema } from "../validators/watchlistValidators.js";

const router = express.Router();
router.use(authMiddleware);//for all routes in this router, user must be authenticated

// router.post('/add', authMiddleware,addToWatchlist);//only authenticated users can add to watchlist
router.post('/',validateRequest(addToWatchlistSchema), addToWatchlist);
router.get('/', getWatchlist);
router.put('/:id', updateWatchlistItem);
router.delete('/:id', removeFromWatchlist);
export default router;
