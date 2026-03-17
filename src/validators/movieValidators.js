import { z } from "zod";

const createMovieSchema = z.object({
  title: z.coerce
    .string()
    .min(1, "Title must be between 1 and 256 words.")
    .max(256, "Title must be between 1 and 256 words."),
  overview: z.coerce.string().optional(),
  releaseYear: z.coerce.number().int(),
  genres: z.array(z.string()),
  runTime: z.coerce.number().int().min(1, "Run time must be at least 1 digit."),
  posterUrl: z.string().optional(),
});

const updateMovieSchema = z
  .object({
    title: z.coerce
      .string()
      .min(1, "Title must be between 1 and 256 words.")
      .max(256, "Title must be between 1 and 256 words."),
    overview: z.coerce.string().optional(),
    releaseYear: z.coerce.number().int(),
    genres: z.array(z.string()),
    runTime: z.coerce.number().int().min(1, "Run time must be at least 1 digit."),
    posterUrl: z.string().optional(),
  })
  .partial()
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field is required.",
  );

export { createMovieSchema, updateMovieSchema };
