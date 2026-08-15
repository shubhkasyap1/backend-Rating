import { z } from "zod";

export const createUserSchema = z.object({
  name: z
    .string()
    .min(2)
    .max(100),

  email: z
    .string()
    .email()
    .transform((value) => value.toLowerCase().trim()),

  password: z
    .string()
    .min(8),

  address: z
    .string()
    .max(255)
    .optional(),

  role: z.enum([
    "USER",
    "STORE_OWNER",
  ]),
});