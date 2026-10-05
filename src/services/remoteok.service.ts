import z from "zod"
import { stripHTMLTags } from "../helpers/text/strip-html.js"
import { RemoteOkJobPostSchema, RemoteOkResponseSchema } from "../schemas/remoteok.schema.js"
import { fetchListings } from "../helpers/http/fetch-listings.js"
import type { JobPost, RemoteOkJobPost } from "../types/index.js"
import { CacheStorage } from "../cache/simple-cache.js"
const REMOTEOK_URL = "https://remoteok.com/api"
const CACHE_OPTIONS = {
    ttlSeconds: 21600,
    maxSize: 500
}
const FAILED_CACHE_OPTIONS = {
    ttlSeconds: 60,
    maxSize: 250
}
const key = `remoteOk`

const remoteOkCache = new CacheStorage<JobPost[]>(CACHE_OPTIONS)
const remoteOkFailCache = new CacheStorage<string>(FAILED_CACHE_OPTIONS)

export const getRemoteOkJobs = async (): Promise<Array<JobPost>> => {
    const cachedJob = remoteOkCache.get(key)
    if (cachedJob) {
        return cachedJob
    }

    const failedCachedJob = remoteOkFailCache.get(key)
    if (failedCachedJob) {
        throw new Error(failedCachedJob)
    }

    const remotOkJobPostResponse = await fetchListings(REMOTEOK_URL)
    const remoteOkApiResponse = RemoteOkResponseSchema.safeParse(remotOkJobPostResponse)

    if (!remoteOkApiResponse.success) {
        const prettifiedError = z.prettifyError(remoteOkApiResponse.error)
        const errorMessage = `Cannot get list of jobs from RemoteOk: ${prettifiedError}`
        remoteOkFailCache.set(key, errorMessage)
        throw new Error(errorMessage)
    }
    const responseObjectWithoutLegal = remoteOkApiResponse.data.slice(1)
    const responseFlatMap = responseObjectWithoutLegal.flatMap(job => {
        const validatedJobPost = RemoteOkJobPostSchema.safeParse(job)
        if (!validatedJobPost.success) {
            console.error("RemoteOk job failed validation:", z.prettifyError(validatedJobPost.error))
            return []
        }
        return [remoteOkJobToJobPost(validatedJobPost.data)]
    })

    if (responseFlatMap.length === 0 && responseObjectWithoutLegal.length > 0) {
        const errorMessage = "RemoteOk job failed. Response has jobs but couldn't process them"
        remoteOkFailCache.set(key, errorMessage)
        throw new Error(errorMessage)
    }
    remoteOkCache.set(key, responseFlatMap)
    return responseFlatMap
}
const formatRemotOkSalary = (salary_min: number, salary_max: number) => !!salary_min && !!salary_max ? String(salary_min) + " " + String(salary_max) : false
const remoteOkJobToJobPost = (remoteOk: RemoteOkJobPost): JobPost => {
    return {
        id: `remoteOK:${remoteOk.id}`,
        source: "remoteok",
        title: remoteOk.position,
        companyName: remoteOk.company,
        description: stripHTMLTags(remoteOk.description),
        location: remoteOk.location,
        url: remoteOk.url,
        postedAt: new Date(remoteOk.date),
        tags: remoteOk.tags,
        salary: formatRemotOkSalary(remoteOk.salary_min!, remoteOk.salary_max!) || "Not disclosed",
        companyLogo: remoteOk.company_logo ?? ""
    }
}