import {
  addItem,
  updateItem,
  removeItem,
  getItems,
} from "../services/watchlistService.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";

const addToWatchlist = async (req, res) => {
  try {
    const { movieId, status, rating, notes } = req.body;
    const watchlistItem = await addItem(req.user.id, {
      movieId,
      status,
      rating,
      notes,
    });

    return sendSuccess(res, {
      statusCode: 201,
      message: "watchlist_item_created",
      data: { watchlistItem },
    });
  } catch (error) {
    if (error?.status) {
      return sendError(res, { statusCode: error.status, message: error.message });
    }
    return sendError(res);
  }
};

/**
 * Update watchlist item
 * Updates status, rating, or notes
 * Ensures only owner can update
 * Requires protect middleware
 */
const updateWatchlistItem = async (req, res) => {
  try {
    const { status, rating, notes } = req.body;
    const updatedItem = await updateItem(req.user.id, req.params.id, {
      status,
      rating,
      notes,
    });

    return sendSuccess(res, {
      message: "watchlist_item_updated",
      data: { watchlistItem: updatedItem },
    });
  } catch (error) {
    if (error?.status) {
      return sendError(res, { statusCode: error.status, message: error.message });
    }
    return sendError(res);
  }
};

/**
 * Remove movie from watchlist
 * Deletes watchlist item
 * Ensures only owner can delete
 * Requires protect middleware
 */
const removeFromWatchlist = async (req, res) => {
  try {
    await removeItem(req.user.id, req.params.id);

    return sendSuccess(res, { message: "movie_removed" });
  } catch (error) {
    if (error?.status) {
      return sendError(res, { statusCode: error.status, message: error.message });
    }
    return sendError(res);
  }
};

const getWatchlist = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);

    const data = await getItems(req.user.id, { page, limit });

    return sendSuccess(res, {
      message: "watchlist_fetched",
      data,
    });
  } catch (error) {
    if (error?.status) {
      return sendError(res, { statusCode: error.status, message: error.message });
    }
    return sendError(res);
  }
};

export {
  addToWatchlist,
  updateWatchlistItem,
  removeFromWatchlist,
  getWatchlist,
};
