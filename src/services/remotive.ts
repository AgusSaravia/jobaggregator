import { count } from "node:console"
import { fetchJobs, setErrorMessage, stripHTMLTags } from "../helpers/helpers.js"
import type { RemotiveApiResponseSchema } from "../types/index.js"
const REMOTIVE_CATEGORY = "software-dev"
const JOB_LIMIT = 5
const REMOTIVE_URL =  `https://remotive.com/api/remote-jobs?category=${REMOTIVE_CATEGORY}&limit=${JOB_LIMIT}`


const isRemotiveRespose = (data: unknown): data is RemotiveApiResponseSchema => {
    return(
        typeof data === 'object' && 
        data !== null && 
        "jobs" in data && 
        Array.isArray(data.jobs)
    )
}
const getRemotiveJobs = async () =>{
    const remotiveResponse = await fetchJobs(REMOTIVE_URL)
    if (!isRemotiveRespose(remotiveResponse)) {
        throw new Error("Cannot GET Remotive job list")
    }   

    return remotiveResponse.jobs
}

export const formatRemotiveJobCard = async ()=> {
    const jobListings = await getRemotiveJobs()
    return jobListings.map(job => {
        return {
            ...job,
           description: stripHTMLTags(job.description)
        }
    })
}