import { scoreResume, generateCoverLetter } from '../services/openai.service.js';

export const getResumeScore = async (req, res, next) => {
  try {
    const { resumeText, jobDescription } = req.body;

    if (!resumeText || !jobDescription) {
      return res.status(400).json({ message: 'Resume text and job description are required' });
    }

    const result = await scoreResume(resumeText, jobDescription);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getCoverLetter = async (req, res, next) => {
  try {
    const { company, role, jobDescription, resumeText, tone } = req.body;

    if (!company || !role || !jobDescription || !resumeText) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const result = await generateCoverLetter({ company, role, jobDescription, resumeText, tone });
    res.json({ coverLetter: result });
  } catch (error) {
    next(error);
  }
};