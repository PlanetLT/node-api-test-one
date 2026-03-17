import { prisma } from "../config/db.js";
import { createServiceError } from "../utils/serviceError.js";
import { paginate } from "../utils/paginationHelper.js";

const addItem = async (userId, { movieId, status, rating, notes }) => {
  const movie = await prisma.movie.findUnique({
    where: { id: movieId },
  });

  if (!movie) {
    throw createServiceError(404, "movie_not_found");
  }

  const existingInWatchlist = await prisma.watchlistItem.findUnique({
    where: {
      userId_movieId: {
        userId,
        movieId,
      },
    },
  });

  if (existingInWatchlist) {
    throw createServiceError(400, "movie_already_in_watchlist");
  }

  return prisma.watchlistItem.create({
    data: {
      userId,
      movieId,
      status: status || "PLANNED",
      rating,
      notes,
    },
  });
};

const updateItem = async (
  userId,
  watchlistItemId,
  { status, rating, notes },
) => {
  const watchlistItem = await prisma.watchlistItem.findUnique({
    where: { id: watchlistItemId },
  });

  if (!watchlistItem) {
    throw createServiceError(404, "watchlist_item_not_found");
  }

  if (watchlistItem.userId !== userId) {
    throw createServiceError(403, "not_allowed_to_update_watchlist_item");
  }

  const updateData = {};
  if (status !== undefined) updateData.status = status.toUpperCase();
  if (rating !== undefined) updateData.rating = rating;
  if (notes !== undefined) updateData.notes = notes;

  return prisma.watchlistItem.update({
    where: { id: watchlistItemId },
    data: updateData,
  });
};

const removeItem = async (userId, watchlistItemId) => {
  const watchlistItem = await prisma.watchlistItem.findUnique({
    where: { id: watchlistItemId },
  });

  if (!watchlistItem) {
    throw createServiceError(404, "watchlist_item_not_found");
  }

  if (watchlistItem.userId !== userId) {
    throw createServiceError(403, "not_allowed_to_update_watchlist_item");
  }

  await prisma.watchlistItem.delete({
    where: { id: watchlistItemId },
  });
};

const getItems = async (userId, { page, limit }) => {
  const skip = (page - 1) * limit;

  const [total, watchlistItems] = await Promise.all([
    prisma.watchlistItem.count({
      where: { userId },
    }),
    prisma.watchlistItem.findMany({
      where: { userId },
      include: { movie: true, user: true },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
  ]);

  return {
    watchlist: watchlistItems,
    pagination: paginate({total, page, limit}),
  };
};

export { addItem, updateItem, removeItem, getItems };
