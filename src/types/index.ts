import { z } from "zod"
import type { RemotiveApiResponseSchema, RemotiveJobPostSchema } from "../schemas/remotive-schema.js"

export type RemotiveApiResponse = z.infer<typeof RemotiveApiResponseSchema>
export type RemotiveJobPost = z.infer<typeof RemotiveJobPostSchema>
export type JobPost = {
    id: string
    source: JobSource
    title: string
    companyName: string
    description: string
    location: string
    category:string
    url: string
    jobType: string
    postedAt: Date
    tags: string[]
    salary?: string,
    companyLogo?: string
}
export type JobSource = "remotive" | "arbeitnow" | "remoteok" | "hackernews"