import http from "node:http"
import { formatRemotiveJobCard } from "./services/remotive.js"
const urls = {
    "Remotive": "https://remotive.com/api/remote-jobs?category=software-dev&limit=5",
    "Arbeitnow": "https://www.arbeitnow.com/api/job-board-api",
    "RemoteOK": "https://remoteok.com/api",
    "HackerNews": "https://hn.algolia.com/api/v1/search?query=who+is+hiring&tags=story&hitsPerPage=1"
}


const server = http.createServer(async (req, res) => {
    try {
        const remotiveJobCard = await formatRemotiveJobCard()

        res.writeHead(200, {
            "content-type": "application/json"
        })

        res.end(
            JSON.stringify({
                remotiveJobCard
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