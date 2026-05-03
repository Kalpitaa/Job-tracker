import Groq from 'groq-sdk';

const getClient = () => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is missing in .env file');
  }
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
};

export const scoreResume = async (resumeText, jobDescription) => {
  const client = getClient();

  const prompt = `
You are an expert recruiter and ATS system. Analyze this resume against the job description.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Return a JSON object with exactly these fields:
{
  "score": <integer 0-100>,
  "strengths": [<3 bullet strings>],
  "improvements": [<3-5 actionable bullet strings>],
  "keywords_missing": [<list of important keywords from JD not in resume>],
  "summary": "<2-sentence overall assessment>"
}
Return only valid JSON. No markdown, no extra text.
  `.trim();

  const response = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  });

  return JSON.parse(response.choices[0].message.content);
};

export const generateCoverLetter = async ({ company, role, jobDescription, resumeText, tone }) => {
  const client = getClient();

  const prompt = `
You are a professional career coach writing a compelling cover letter.

APPLICANT RESUME:
${resumeText}

JOB: ${role} at ${company}
JOB DESCRIPTION: ${jobDescription}
TONE: ${tone || 'professional and enthusiastic'}

Write a tailored cover letter (3 paragraphs, max 300 words).
- Paragraph 1: Hook and why this specific company
- Paragraph 2: 2-3 concrete achievements from the resume that match the JD
- Paragraph 3: Call to action

Return only the cover letter text. No subject line. No Dear Hiring Manager prefix.
  `.trim();

  const response = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
  });

  return response.choices[0].message.content;
};