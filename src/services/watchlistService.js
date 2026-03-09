import { prisma } from "../config/db.js";
import { createServiceError } from "../utils/serviceError.js";

const addItem = async (userId, { movieId, status, rating, notes }) => {
    const movie = await prisma.movie.findUnique({
        where: { id: movieId },
    });

    if (!movie) {
        throw createServiceError(404, "Movie not found");
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
        throw createServiceError(400, "Movie already in the watchlist");
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

const updateItem = async (userId, watchlistItemId, { status, rating, notes }) => {
    const watchlistItem = await prisma.watchlistItem.findUnique({
        where: { id: watchlistItemId },
    });

    if (!watchlistItem) {
        throw createServiceError(404, "Watchlist item not found");
    }

    if (watchlistItem.userId !== userId) {
        throw createServiceError(403, "Not allowed to update this watchlist item");
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
        throw createServiceError(404, "Watchlist item not found");
    }

    if (watchlistItem.userId !== userId) {
        throw createServiceError(403, "Not allowed to update this watchlist item");
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
            include: { movie: true },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        }),
    ]);

    return {
        watchlist: watchlistItems,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            hasNextPage: page * limit < total,
            hasPrevPage: page > 1,
        },
    };
};

export { addItem, updateItem, removeItem, getItems };
