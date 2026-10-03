import z from "zod"
import { stripHTMLTags } from "../helpers/text/strip-html.js"
import { RemotiveApiResponseSchema, RemotiveJobPostSchema } from "../schemas/remotive.schema.js"
import { fetchListings } from "../helpers/http/fetch-listings.js"
import type { JobPost, RemotiveJobPost } from "../types/index.js"
import { CacheStorage } from "../cache/simple-cache.js"
const REMOTIVE_CATEGORY = "software-dev"
const JOB_LIMIT = 5
const REMOTIVE_URL = `https://remotive.com/api/remote-jobs?category=${REMOTIVE_CATEGORY}&limit=${JOB_LIMIT}`
const CACHE_OPTIONS = {
    ttlSeconds: 21600,
    maxSize: 500
}
const FAILED_CACHE_OPTIONS = {
    ttlSeconds: 60,
    maxSize: 500
}
const key = `remotiveCache|${REMOTIVE_CATEGORY}`

const remotiveCache = new CacheStorage<JobPost[]>(CACHE_OPTIONS)
const remotiveFailCache = new CacheStorage<string>(FAILED_CACHE_OPTIONS)

export const getRemotiveJobs = async (): Promise<Array<JobPost>> => {
    const cachedJob = remotiveCache.get(key)
    if (cachedJob) {
        return cachedJob
    }
    
    const failedCachedJob = remotiveFailCache.get(key)
    if (failedCachedJob) {
        throw new Error(failedCachedJob)
    }

    const remotiveResponseBody = await fetchListings(REMOTIVE_URL)
    const remotiveApiResponse = RemotiveApiResponseSchema.safeParse(remotiveResponseBody)
   
    if (!remotiveApiResponse.success) {
        const prettifiedError = z.prettifyError(remotiveApiResponse.error)
        const errorMessage = `Cannot get list of jobs from Remotive: ${prettifiedError}`
        remotiveFailCache.set(key, errorMessage)
        throw new Error(errorMessage)
    }
   
    const responseFlatMap = remotiveApiResponse.data.jobs.flatMap(job => {
        const validatedJobPost = RemotiveJobPostSchema.safeParse(job)
        if (!validatedJobPost.success){
            console.error("Remotive job failed validation:", z.prettifyError(validatedJobPost.error))
            return []
        }
        return [remotiveJobToJobPost(validatedJobPost.data)]
    })

    if (responseFlatMap.length === 0 && remotiveApiResponse.data.jobs.length > 0) {
        const errorMessage = "Remotive job failed. Response has jobs but couldn't process them"
        remotiveFailCache.set(key,errorMessage)
        throw new Error(errorMessage)
    }
    remotiveCache.set(key, responseFlatMap)
    return responseFlatMap
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