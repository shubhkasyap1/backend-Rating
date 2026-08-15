import { z } from "zod";

export const createStoreSchema = z.object({
  name: z
    .string()
    .min(2, "Store name must be at least 2 characters")
    .max(100, "Store name cannot exceed 100 characters"),

  email: z
    .string()
    .email("Invalid store email")
    .transform((value) => value.toLowerCase().trim()),

  address: z
    .string()
    .min(5, "Address must be at least 5 characters")
    .max(255, "Address cannot exceed 255 characters"),

  ownerId: z
    .string()
    .uuid("Invalid owner ID")
    .optional(),
});

export const updateStoreSchema = z.object({
  name: z
    .string()
    .min(2)
    .max(100)
    .optional(),

  email: z
    .string()
    .email()
    .transform((value) => value.toLowerCase().trim())
    .optional(),

  address: z
    .string()
    .min(5)
    .max(255)
    .optional(),

  ownerId: z
    .string()
    .uuid()
    .nullable()
    .optional(),
});

export const ownerUpdateStoreSchema = z.object({
  name: z
    .string()
    .min(2)
    .max(100)
    .optional(),

  email: z
    .string()
    .email()
    .transform((value) =>
      value.toLowerCase().trim()
    )
    .optional(),

  address: z
    .string()
    .min(5)
    .max(255)
    .optional(),
});