import { z } from "zod";
import { uuidSchema } from "./common";

export const dispatcherDepotAccessMutationSchema = z.object({
  dispatcherProfileId: uuidSchema,
  depotIds: z.array(uuidSchema).default([]),
  reason: z.string().trim().max(1000).nullable().optional(),
});

export type DispatcherDepotAccessMutationInput = z.infer<
  typeof dispatcherDepotAccessMutationSchema
>;
