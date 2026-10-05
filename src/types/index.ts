import { z } from "zod"
import type { RemotiveApiResponseSchema, RemotiveJobPostSchema } from "../schemas/remotive.schema.js"
import type { RemoteOkJobPostSchema,RemoteOkResponseSchema } from "../schemas/remoteok.schema.js"

export type RemotiveApiResponse = z.infer<typeof RemotiveApiResponseSchema>
export type RemotiveJobPost = z.infer<typeof RemotiveJobPostSchema>
export type RemoteOkJobPost = z.infer<typeof RemoteOkJobPostSchema>
export type RemoteOkApiResponse = z.infer<typeof RemoteOkResponseSchema>

export const JobSourceSchema = z.enum([
    "remotive",
    "remoteok",
    "hackernews",
])

export type JobSource = z.infer<typeof JobSourceSchema>

export const JobPostSchema = z.object({
    id: z.string(),
    source: JobSourceSchema,
    title: z.string(),
    companyName: z.string(),
    description: z.string(),
    location: z.string(),

    category: z.string().optional(),
    jobType: z.string().optional(),

    url: z.string(),
    postedAt: z.coerce.date(),
    tags: z.array(z.string()),
    salary: z.string().optional(),
    companyLogo: z.string().optional(),
})
export type JobPost = z.infer<typeof JobPostSchema>