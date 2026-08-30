import z from "zod"
import { stripHTMLTags } from "../helpers/text/strip-html.js"
import { RemotiveApiResponseSchema, RemotiveJobPostSchema } from "../schemas/remotive-schema.js"
import { fetchListings } from "../helpers/http/fetch-listings.js"
import type { JobPost, RemotiveJobPost } from "../types/index.js"
const REMOTIVE_CATEGORY = "software-dev"
const JOB_LIMIT = 5
const REMOTIVE_URL = `https://remotive.com/api/remote-jobs?category=${REMOTIVE_CATEGORY}&limit=${JOB_LIMIT}`



export const getRemotiveJobs = async (): Promise<JobPost[]> => {
    const remotiveResponseBody = await fetchListings(REMOTIVE_URL)
    const remotiveApiResponse = RemotiveApiResponseSchema.safeParse(remotiveResponseBody)

    if (!remotiveApiResponse.success) {
        throw new Error(`Cannot get list of jobs from Remotive: ${z.prettifyError(remotiveApiResponse.error)}`)
    }
    return remotiveApiResponse.data.jobs.flatMap(job => {
        const validatedJobPost = RemotiveJobPostSchema.safeParse(job)
        if (!validatedJobPost.success) return []
        return [remotiveJobToJobPost(validatedJobPost.data)]
    })
}

//Transforms Remotive to our portal 
const remotiveJobToJobPost = (remotiveJob: RemotiveJobPost): JobPost => {
    return {
        id: `remotive:${remotiveJob.id}`,
        source: "remotive",
        title: remotiveJob.title,
        companyName: remotiveJob.company_name,
        description: stripHTMLTags(remotiveJob.description),
        location: remotiveJob.candidate_required_location,
        category: remotiveJob.category,
        url: remotiveJob.url,
        jobType: remotiveJob.job_type,
        postedAt: new Date(remotiveJob.publication_date),
        tags: remotiveJob.tags,
        salary: remotiveJob.salary || "Not disclosed",
        companyLogo: remotiveJob.company_logo || undefined
    }
}