import crypto from "crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "../config/db.js";
import { createServiceError } from "../utils/serviceError.js";
import { paginate } from "../utils/paginationHelper.js";

const coerceNullable = (value) => (value === undefined ? null : value);

const fetchMovieById = async (movieId) => {
  const rows = await prisma.$queryRaw`
        SELECT *
        FROM "Movie"
        WHERE "id" = ${movieId}
        LIMIT 1
    `;
  return rows[0] || null;
};

const getMovieById = async (movieId) => {
  const movie = await fetchMovieById(movieId);
  if (!movie) {
    throw createServiceError(404, "movie_not_found");
  }
  return movie;
};

const getMovies = async ({ page, limit }) => {
  const offset = (page - 1) * limit;

  const [countRows, movies] = await Promise.all([
    prisma.$queryRaw`SELECT COUNT(*)::int AS total FROM "Movie"`,
    prisma.$queryRaw`
            SELECT m.*,
            json_build_object(
              'id', u.id,
              'name', u.name,
              'email', u.email
            ) AS creator
            FROM "Movie" m
            JOIN "User" u
            ON m."createdBy" = u."id"    
            ORDER BY "createdAt" DESC
            LIMIT ${limit}
            OFFSET ${offset}
        `,
  ]);

  const total = Number(countRows?.[0]?.total ?? 0);

  return {
    movies,
    pagination: paginate({total, page, limit}),
  };
};

const createMovie = async (userId, payload) => {
  const { title, overview, releaseYear, genres, runTime, posterUrl } = payload;

  const movieId = crypto.randomUUID();
  const rows = await prisma.$queryRaw`
        INSERT INTO "Movie" (
            "id",
            "title",
            "overview",
            "releaseYear",
            "genres",
            "runTime",
            "posterUrl",
            "createdBy"
        )
        VALUES (
            ${movieId},
            ${title},
            ${coerceNullable(overview)},
            ${releaseYear},
            ${genres ?? []},
            ${coerceNullable(runTime)},
            ${coerceNullable(posterUrl)},
            ${userId}
        )
        RETURNING *
    `;

  return rows[0];
};

const assertMovieOwner = async (userId, movieId) => {
  const rows = await prisma.$queryRaw`
        SELECT "id", "createdBy"
        FROM "Movie"
        WHERE "id" = ${movieId}
        LIMIT 1
    `;

  const movie = rows[0];
  if (!movie) {
    throw createServiceError(404, "movie_not_found");
  }
  if (movie.createdBy !== userId) {
    throw createServiceError(403, "not_allowed_to_update_movie");
  }
};

const updateMovie = async (userId, movieId, payload) => {
  await assertMovieOwner(userId, movieId);

  const data = {};
  if (payload.title !== undefined) {
    data.title = payload.title;
  }
  if (payload.overview !== undefined) {
    data.overview = coerceNullable(payload.overview);
  }
  if (payload.releaseYear !== undefined) {
    data.releaseYear = payload.releaseYear;
  }
  if (payload.genres !== undefined) {
    data.genres = payload.genres;
  }
  if (payload.runTime !== undefined) {
    data.runTime = coerceNullable(payload.runTime);
  }
  if (payload.posterUrl !== undefined) {
    data.posterUrl = coerceNullable(payload.posterUrl);
  }

  if (Object.keys(data).length === 0) {
    return getMovieById(movieId);
  }

  return prisma.movie.update({
    where: { id: movieId },
    data,
  });
};

const deleteMovie = async (userId, movieId) => {
  await assertMovieOwner(userId, movieId);

  const rows = await prisma.$queryRaw`
        DELETE FROM "Movie"
        WHERE "id" = ${movieId}
        RETURNING *
    `;

  return rows[0];
};

export { getMovies, getMovieById, createMovie, updateMovie, deleteMovie };
