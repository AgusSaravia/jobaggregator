import http from "node:http"
import { getRemotiveJobs } from "./services/remotive.service.js"
import { getRemoteOkJobs } from "./services/remoteok.service.js"
const urls = {
    "Remotive": "https://remotive.com/api/remote-jobs?category=software-dev&limit=5",
    "RemoteOK": "https://remoteok.com/api",
    "HackerNews": "https://hn.algolia.com/api/v1/search?query=who+is+hiring&tags=story&hitsPerPage=1"
}

const server = http.createServer(async (req, res) => {
    try {
        const jobResults = await Promise.allSettled([
            getRemoteOkJobs(),
            getRemotiveJobs()
        ])
        const toBeShown = []
        for (const result of jobResults) {
            if (result.status === "fulfilled") {
                toBeShown.push(...result.value)
            } else {
                console.error(result.reason)  
            }
        }


        res.writeHead(200, {
            "content-type": "application/json"
        })

        res.end(
            JSON.stringify({
                jobs: toBeShown,
                jobCount: toBeShown.length
            })
        )
    } catch (error) {
        console.error(error)

        res.writeHead(500, {
            "content-type": "application/json"
        })

        res.end(
            JSON.stringify({
                error: "Internal server error"
            })
        )
    }
})

server.listen(3000, () => {
    console.log("Server running on http://localhost:3000")
})