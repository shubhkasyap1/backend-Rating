import { z } from "zod";

export const createRatingSchema = z.object({
  rating: z
    .number()
    .int("Rating must be a whole number")
    .min(1, "Rating must be between 1 and 5")
    .max(5, "Rating must be between 1 and 5"),

  comment: z
    .string()
    .max(1000, "Comment cannot exceed 1000 characters")
    .optional(),
});

export const updateRatingSchema = z.object({
  rating: z
    .number()
    .int("Rating must be a whole number")
    .min(1, "Rating must be between 1 and 5")
    .optional(),

  comment: z
    .string()
    .max(1000, "Comment cannot exceed 1000 characters")
    .nullable()
    .optional(),
});