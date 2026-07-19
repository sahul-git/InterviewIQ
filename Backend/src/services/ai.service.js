const {GoogleGenAI} = require("@google/genai");
const {z} = require("zod");
const { zodToJsonSchema } = require("zod-to-json-schema")
const puppeteer = require("puppeteer")


const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

const interviewReportSchema = z.object({
    matchScore: z.number().min(0).max(100).describe("A score between 0 and 100 indicating how well the candidate's profile matches the job description"),
    technicalQuestions: z.array(z.object({
        question: z.string().min(1).describe("The technical question that can be asked in the interview"),
        intention: z.string().min(1).describe("The intention of the interviewer behind asking this question"),
        answer: z.string().min(1).describe("How to answer this question, what points to cover, and what approach to take")
    })).default([]).describe("Technical questions that can be asked in the interview along with their intention and how to answer them"),
    behavioralQuestions: z.array(z.object({
        question: z.string().min(1).describe("The behavioral question that can be asked in the interview"),
        intention: z.string().min(1).describe("The intention of the interviewer behind asking this question"),
        answer: z.string().min(1).describe("How to answer this question, what points to cover, and what approach to take")
    })).default([]).describe("Behavioral questions that can be asked in the interview along with their intention and how to answer them"),
    skillGaps: z.array(z.object({
        skill: z.string().min(1).describe("The skill which the candidate is lacking"),
        severity: z.enum(["low", "medium", "high"]).describe("The severity of this skill gap, i.e. how important is this skill for the job and how much it can impact the candidate's chances")
    })).default([]).describe("List of skill gaps in the candidate's profile along with their severity"),
    preparationPlan: z.array(z.object({
        day: z.number().int().positive().describe("The day number in the preparation plan, starting from 1"),
        focus: z.string().min(1).describe("The main focus of this day in the preparation plan, e.g. data structures, system design, mock interviews etc."),
        tasks: z.array(z.string().min(1)).default([]).describe("List of tasks to be done on this day to follow the preparation plan")
    })).default([]).describe("A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively"),
    title: z.string().min(1).describe("The title of the job for which the interview report is generated"),
}).strict();

function extractJsonPayload(text) {
    const trimmed = String(text ?? "").trim();
    const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    const candidate = fenced ? fenced[1] : trimmed;
    const start = candidate.indexOf("{");
    const end = candidate.lastIndexOf("}");

    if (start === -1 || end === -1 || end <= start) {
        throw new Error("AI response did not contain a valid JSON object.");
    }

    return candidate.slice(start, end + 1);
}

function normalizeInterviewReport(rawPayload) {
    const parsed = JSON.parse(extractJsonPayload(rawPayload));

    const normalizedPayload = {
        matchScore: typeof parsed.matchScore === "number" ? parsed.matchScore : Number(parsed.matchScore),
        technicalQuestions: Array.isArray(parsed.technicalQuestions) ? parsed.technicalQuestions : [],
        behavioralQuestions: Array.isArray(parsed.behavioralQuestions) ? parsed.behavioralQuestions : [],
        skillGaps: Array.isArray(parsed.skillGaps) ? parsed.skillGaps : [],
        preparationPlan: Array.isArray(parsed.preparationPlan) ? parsed.preparationPlan : [],
        title: typeof parsed.title === "string" && parsed.title.trim() ? parsed.title.trim() : "Interview Report",
    };

    return interviewReportSchema.parse(normalizedPayload);
}

async function generateInterviewReport({resume, selfDescription, jobDescription}){
    const prompt = `Generate an interview report for a candidate with the following details:
Resume: ${resume}
Self Description: ${selfDescription}
Job Description: ${jobDescription}

Return ONLY a valid JSON object that strictly matches this schema:
{
  "matchScore": number,
  "technicalQuestions": [{"question": string, "intention": string, "answer": string}],
  "behavioralQuestions": [{"question": string, "intention": string, "answer": string}],
  "skillGaps": [{"skill": string, "severity": "low" | "medium" | "high"}],
  "preparationPlan": [{"day": number, "focus": string, "tasks": [string]}],
  "title": string
}`;

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            temperature: 0.2,
        }
    });

    return normalizeInterviewReport(response.text);
}

async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch()
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" })

    const pdfBuffer = await page.pdf({
        format: "A4", margin: {
            top: "20mm",
            bottom: "20mm",
            left: "15mm",
            right: "15mm"
        }
    })

    await browser.close()

    return pdfBuffer
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {

    const resumePdfSchema = z.object({
        html: z.string().describe("The HTML content of the resume which can be converted to PDF using any library like puppeteer")
    })

    const prompt = `Generate resume for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}

                        the response should be a JSON object with a single field "html" which contains the HTML content of the resume which can be converted to PDF using any library like puppeteer.
                        The resume should be tailored for the given job description and should highlight the candidate's strengths and relevant experience. The HTML content should be well-formatted and structured, making it easy to read and visually appealing.
                        The content of resume should be not sound like it's generated by AI and should be as close as possible to a real human-written resume.
                        you can highlight the content using some colors or different font styles but the overall design should be simple and professional.
                        The content should be ATS friendly, i.e. it should be easily parsable by ATS systems without losing important information.
                        The resume should not be so lengthy, it should ideally be 1-2 pages long when converted to PDF. Focus on quality rather than quantity and make sure to include all the relevant information that can increase the candidate's chances of getting an interview call for the given job description.
                    `

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(resumePdfSchema),
        }
    })


    const jsonContent = JSON.parse(response.text)

    const pdfBuffer = await generatePdfFromHtml(jsonContent.html)

    return pdfBuffer

}

module.exports = { generateInterviewReport, generateResumePdf };