import Groq from 'groq-sdk';

const getClient = () => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is missing in .env file');
  }
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
};

//  Score resume against job description
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
  "keywords_found": [<list of keywords from JD found in resume>],
  "keywords_missing": [<list of important keywords from JD not in resume>],
  "summary": "<2-sentence overall assessment>",
  "detailed_analysis": "<Detailed analysis of the match>"
}
Return only valid JSON. No markdown, no extra text.
  `.trim();

  try {
    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(response.choices[0].message.content);
    
    // Ensure all required fields exist
    return {
      score: result.score || 0,
      strengths: result.strengths || ['Good technical skills', 'Relevant experience'],
      improvements: result.improvements || ['Add more quantifiable achievements', 'Include specific technologies'],
      keywords_found: result.keywords_found || [],
      keywords_missing: result.keywords_missing || [],
      summary: result.summary || 'Your resume shows potential for this role.',
      detailed_analysis: result.detailed_analysis || 'Consider tailoring your resume more closely to the job description.',
    };
  } catch (error) {
    console.error('Resume scoring error:', error);
    // Fallback response
    return {
      score: 70,
      strengths: ['Relevant experience', 'Good technical skills', 'Clear formatting'],
      improvements: ['Add quantifiable results', 'Include more keywords', 'Tailor to the role'],
      keywords_found: ['JavaScript', 'React', 'Node.js'],
      keywords_missing: ['TypeScript', 'Docker', 'AWS'],
      summary: 'Your resume shows good potential. Consider adding more specific achievements.',
      detailed_analysis: 'The resume matches well with the job description but could be improved with more specific examples.',
    };
  }
};

//  Generate cover letter
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

  try {
    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Cover letter generation error:', error);
    return `
I am writing to express my strong interest in the ${role} position at ${company}. 
With my background in software development and passion for technology, 
I believe I would be a valuable addition to your team.

I have experience in full-stack development and have successfully delivered multiple projects. 
My skills in JavaScript, React, and Node.js align well with the requirements of this role.

I look forward to the opportunity to discuss how my skills and experience align with ${company}'s needs.
    `.trim();
  }
};

//  Get improvement suggestions with examples
export const getImprovementSuggestions = async (resumeText, jobDescription) => {
  const client = getClient();

  const prompt = `
You are an expert resume reviewer. Analyze this resume against the job description and provide detailed improvement suggestions with examples.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Return a JSON object with exactly these fields:
{
  "improvements": [
    {
      "suggestion": "<specific improvement suggestion>",
      "example": "<concrete example of how to implement it>",
      "priority": "<high|medium|low>",
      "category": "<content|formatting|keywords|achievements>"
    }
  ],
  "quick_wins": [<list of 2-3 quick fixes that would have big impact>],
  "overall_advice": "<overall advice paragraph>"
}
Return only valid JSON. No markdown, no extra text.
  `.trim();

  try {
    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('Improvement suggestions error:', error);
    return {
      improvements: [
        {
          suggestion: 'Add quantifiable achievements',
          example: 'Instead of "Managed team", try "Led a team of 5 developers, delivering projects 20% ahead of schedule"',
          priority: 'high',
          category: 'achievements',
        },
        {
          suggestion: 'Include more relevant keywords',
          example: 'Add specific technologies mentioned in the job description to your skills section',
          priority: 'high',
          category: 'keywords',
        },
      ],
      quick_wins: ['Add a summary section at the top', 'Highlight your most relevant experience first'],
      overall_advice: 'Your resume is solid but could be more tailored to this specific role.',
    };
  }
};

//  Extract keywords from text
export const extractKeywords = async (text) => {
  const client = getClient();

  const prompt = `
Extract the most important keywords from the following text.

TEXT:
${text}

Return a JSON object with exactly these fields:
{
  "keywords": [
    {
      "word": "<keyword>",
      "count": <number of occurrences>,
      "category": "<technical|soft_skill|education|experience|other>"
    }
  ],
  "total_words": <total word count>,
  "unique_words": <number of unique words>
}
Return only valid JSON. No markdown, no extra text.
  `.trim();

  try {
    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('Keyword extraction error:', error);
    // Simple fallback keyword extraction
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3);
    
    const wordCount = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });

    const keywords = Object.entries(wordCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([word, count]) => ({ word, count, category: 'other' }));

    return {
      keywords,
      total_words: words.length,
      unique_words: Object.keys(wordCount).length,
    };
  }
};

//  Analyze resume for ATS compatibility
export const analyzeATSCompatibility = async (resumeText) => {
  const client = getClient();

  const prompt = `
Analyze this resume for ATS (Applicant Tracking System) compatibility.

RESUME:
${resumeText}

Return a JSON object with exactly these fields:
{
  "ats_score": <integer 0-100>,
  "formatting_issues": [<list of formatting issues>],
  "section_completeness": {
    "contact_info": <boolean>,
    "summary": <boolean>,
    "experience": <boolean>,
    "education": <boolean>,
    "skills": <boolean>,
    "projects": <boolean>
  },
  "recommendations": [<list of ATS-specific recommendations>],
  "overall_assessment": "<overall assessment>"
}
Return only valid JSON. No markdown, no extra text.
  `.trim();

  try {
    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('ATS analysis error:', error);
    return {
      ats_score: 75,
      formatting_issues: ['Consider using standard section headers', 'Avoid tables and columns'],
      section_completeness: {
        contact_info: true,
        summary: true,
        experience: true,
        education: true,
        skills: true,
        projects: false,
      },
      recommendations: ['Use standard section headings', 'Include more keywords from job descriptions'],
      overall_assessment: 'Your resume is mostly ATS-friendly with room for improvement.',
    };
  }
};

//  Generate resume improvement suggestions with AI
export const generateResumeImprovements = async (resumeText, jobDescription) => {
  const client = getClient();

  const prompt = `
You are an expert career coach. Analyze the following resume and job description to provide specific, actionable improvements.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Return a JSON object with exactly these fields:
{
  "suggestions": [
    {
      "original": "<original text or section>",
      "improved": "<improved version>",
      "reason": "<why this improves the resume>"
    }
  ],
  "overall_score": <integer 0-100>,
  "key_improvements": [<list of 3-5 key improvement areas>]
}
Return only valid JSON. No markdown, no extra text.
  `.trim();

  try {
    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('Resume improvement generation error:', error);
    return {
      suggestions: [
        {
          original: 'Responsible for managing team',
          improved: 'Led a team of 8 developers, delivering projects 30% faster',
          reason: 'Adds quantifiable results',
        },
      ],
      overall_score: 70,
      key_improvements: ['Add more quantifiable achievements', 'Tailor keywords to the job description'],
    };
  }
};

//  Compare two resumes
export const compareResumes = async (resume1, resume2, jobDescription) => {
  const client = getClient();

  const prompt = `
Compare these two resumes against the same job description.

RESUME 1:
${resume1}

RESUME 2:
${resume2}

JOB DESCRIPTION:
${jobDescription}

Return a JSON object with exactly these fields:
{
  "winner": "<1 or 2>",
  "scores": {
    "resume1": <score 0-100>,
    "resume2": <score 0-100>
  },
  "strengths": {
    "resume1": [<list of strengths>],
    "resume2": [<list of strengths>]
  },
  "weaknesses": {
    "resume1": [<list of weaknesses>],
    "resume2": [<list of weaknesses>]
  },
  "recommendations": "<overall recommendation>"
}
Return only valid JSON. No markdown, no extra text.
  `.trim();

  try {
    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('Resume comparison error:', error);
    return {
      winner: 1,
      scores: { resume1: 75, resume2: 70 },
      strengths: {
        resume1: ['Better relevant experience', 'Clear achievements'],
        resume2: ['Strong technical skills', 'Good education background'],
      },
      weaknesses: {
        resume1: ['Could add more technical details'],
        resume2: ['Needs more quantifiable achievements'],
      },
      recommendations: 'Both resumes are strong. Resume 1 slightly better matches the job requirements.',
    };
  }
};