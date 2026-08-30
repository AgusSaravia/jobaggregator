import { htmlToText } from "html-to-text"



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
