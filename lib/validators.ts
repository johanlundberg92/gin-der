import { z } from "zod";

export const createSessionSchema = z.object({
  name: z.string().trim().min(2).max(80),
  eventDate: z.string().optional(),
  adminPin: z.string().trim().max(32).optional(),
  gins: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(80),
        distillery: z.string().trim().max(80).optional().or(z.literal("")),
        abv: z.coerce.number().min(0).max(100).optional().nullable(),
        description: z.string().trim().max(500).optional().or(z.literal("")),
      }),
    )
    .min(1)
    .max(12),
});

export const joinSessionSchema = z.object({
  name: z.string().trim().min(2).max(40),
});

export const advanceSessionSchema = z.object({
  adminPin: z.string().trim().min(1).max(32),
});

export const tastingNoteSchema = z.object({
  participantToken: z.string().trim().min(10),
  ginId: z.string().trim().min(1),
  overallScore: z.coerce.number().int().min(1).max(10),
  juniper: z.coerce.number().int().min(1).max(5),
  citrus: z.coerce.number().int().min(1).max(5),
  floral: z.coerce.number().int().min(1).max(5),
  spice: z.coerce.number().int().min(1).max(5),
  herbal: z.coerce.number().int().min(1).max(5),
  sweetness: z.coerce.number().int().min(1).max(5),
  customNotes: z.string().trim().max(500).optional().or(z.literal("")),
});
