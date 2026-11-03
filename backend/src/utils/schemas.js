import { z } from "zod";

export const emailSchema = z.string().trim().toLowerCase().max(254)
  .pipe(z.email());

export const nameSchema = z.string().trim().min(2).max(80);
