import {
  getMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
} from "../services/movieService.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";

const createMovieItem = async (req, res) => {
  try {
    const {
      title,
      overview,
      releaseYear,
      genres,
      runTime,
      posterUrl,
      createdBy,
    } = req.body;
    const movieItem = await createMovie(req.user.id, {
      title,
      overview,
      releaseYear,
      genres,
      runTime,
      posterUrl,
      createdBy,
    });

    return sendSuccess(res, {
      statusCode: HTTP_STATUS.CREATED,
      message: "movie_item_created",
      data: { movieItem },
    });
  } catch (error) {
    if (error?.status) {
      return sendError(res, {
        statusCode: error.status,
        message: error.message,
      });
    }
    return sendError(res);
  }
};

const deleteMovieItem = async (req, res) => {
  try {
    await deleteMovie(req.user.id, req.params.id);

    return sendSuccess(res, { message: "movie_removed" });
  } catch (error) {
    if (error?.status) {
      return sendError(res, {
        statusCode: error.status,
        message: error.message,
      });
    }
    return sendError(res);
  }
};

const updateMovieItem = async (req, res) => {
  try {
    const {
      title,
      overview,
      releaseYear,
      genres,
      runTime,
      posterUrl,
      createdBy,
    } = req.body;
    const updatedItem = await updateMovie(req.user.id, req.params.id, {
      title,
      overview,
      releaseYear,
      genres,
      runTime,
      posterUrl,
      createdBy,
    });

    return sendSuccess(res, {
      message: "movie_item_updated",
      data: { watchlistItem: updatedItem },
    });
  } catch (error) {
    if (error?.status) {
      return sendError(res, {
        statusCode: error.status,
        message: error.message,
      });
    }
    return sendError(res);
  }
};

const getMovielist = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit, 10) || 10, 1),
      100,
    );

    const data = await getMovies(req.user.id, { page, limit });

    return sendSuccess(res, {
      message: "movie_fetched",
      data,
    });
  } catch (error) {
    if (error?.status) {
      return sendError(res, {
        statusCode: error.status,
        message: error.message,
      });
    }
    return sendError(res);
  }
};

export { createMovieItem, deleteMovieItem, updateMovieItem, getMovielist };
