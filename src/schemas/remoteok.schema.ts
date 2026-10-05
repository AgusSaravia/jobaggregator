import { z } from "zod"

export const RemoteOkJobPostSchema = z.object({
    slug: z.string(),
    id: z.string(),
    date: z.string(),
    company: z.string(),
    company_logo: z.string().optional(),
    position: z.string(),
    tags: z.array(z.string()),
    description: z.string(),
    location: z.string(),
    salary_min: z.number().nullable().optional(),
    salary_max: z.number().nullable().optional(),
    apply_url: z.string(),
    original: z.boolean().optional(),
    logo: z.string().optional(),
    url: z.string()
})


export const RemoteOkResponseSchema = z.array(z.unknown())