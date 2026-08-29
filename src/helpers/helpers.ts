import { htmlToText } from "html-to-text"

export const fetchJobs = async (url: string): Promise<unknown> => {
    const response = await fetch(url);
    const data = response.json()
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await data
}

export const stripHTMLTags = (textToStrip: string): string => {
    return htmlToText(textToStrip, {
        wordwrap: false,
        selectors: [
            {
                selector: "img",
                format: "skip"
            }
        ]
    })
        .replace(/\n{3,}/g, "\n\n")
        .trim()
}

export const setErrorMessage = (errorMessage: string): never => {
    throw new Error(errorMessage)
}