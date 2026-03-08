import { z } from "zod";

export const jobsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().optional(),
  location: z
    .enum(["new_york", "colorado", "remote"])
    .optional(),
  salary_min: z.coerce.number().int().optional(),
  salary_max: z.coerce.number().int().optional(),
  work_type: z
    .enum(["remote", "hybrid", "in_office"])
    .optional(),
  experience: z.enum(["entry", "mid", "senior"]).optional(),
  new_only: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
  sort: z.enum(["salary_desc"]).default("salary_desc"),
});

export type JobsQuery = z.infer<typeof jobsQuerySchema>;
