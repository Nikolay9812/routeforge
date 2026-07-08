import { z } from "zod";

const depotCodePattern = /^[A-Z0-9-]+$/;
const countryCodePattern = /^[A-Z]{2}$/;

export const depotMutationSchema = z.object({
  name: z.string().trim().min(1).max(160),
  code: z
    .string()
    .trim()
    .transform((value) => value.toUpperCase())
    .pipe(z.string().min(1).max(32).regex(depotCodePattern)),
  addressLine1: z.string().trim().min(1).max(240),
  postalCode: z.string().trim().min(1).max(24),
  city: z.string().trim().min(1).max(120),
  countryCode: z
    .string()
    .trim()
    .transform((value) => value.toUpperCase())
    .pipe(z.string().regex(countryCodePattern)),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  geofenceRadiusMeters: z.number().int().positive(),
  isActive: z.boolean(),
});

export type DepotMutationInput = z.infer<typeof depotMutationSchema>;
