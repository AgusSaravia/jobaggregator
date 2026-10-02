import { z } from "zod"
 
 export const RemotiveJobPostSchema = z.object({
    id: z.number(),
    url: z.string(),
    title: z.string(),
    company_name: z.string(),
    company_logo: z.string(),
    category: z.string(),
    tags: z.string().array(),
    job_type: z.string(),
    publication_date: z.string(),
    candidate_required_location: z.string(),
    salary: z.string(),
    description: z.string(),
})

 export const RemotiveApiResponseSchema = z.object({
    "job-count": z.number(),
    "total-job-count": z.number(),
    jobs: z.array(z.unknown())
})