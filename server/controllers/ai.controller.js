// server/controllers/ai.controller.js
import { scoreResume, generateCoverLetter } from '../services/openai.service.js';

// ✅ Use dynamic imports for pdf-parse and mammoth (CommonJS modules)
const parsePDFBuffer = async (buffer) => {
  const pdfParse = await import('pdf-parse');
  return pdfParse.default(buffer);
};

const parseWordBuffer = async (buffer) => {
  const mammoth = await import('mammoth');
  return mammoth.default.extractRawText({ buffer });
};

export const getResumeScore = async (req, res, next) => {
  try {
    const { resumeText, jobDescription } = req.body;

    if (!resumeText || !jobDescription) {
      return res.status(400).json({ 
        message: 'Resume text and job description are required' 
      });
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
      return res.status(400).json({ 
        message: 'All fields are required' 
      });
    }

    const result = await generateCoverLetter({ 
      company, 
      role, 
      jobDescription, 
      resumeText, 
      tone 
    });
    res.json({ coverLetter: result });
  } catch (error) {
    next(error);
  }
};

// ✅ Parse PDF file
export const parsePDF = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    if (req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({ message: 'File must be a PDF' });
    }

    const data = await parsePDFBuffer(req.file.buffer);
    
    if (!data.text || data.text.trim().length === 0) {
      return res.status(400).json({ 
        message: 'No text could be extracted from the PDF' 
      });
    }

    res.json({ 
      text: data.text.trim(),
      fileName: req.file.originalname,
      fileSize: req.file.size,
      pageCount: data.numpages,
    });
  } catch (error) {
    next(error);
  }
};

// ✅ Parse Word file (DOC/DOCX)
export const parseWord = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const allowedTypes = [
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ 
        message: 'File must be a Word document (DOC or DOCX)' 
      });
    }

    const result = await parseWordBuffer(req.file.buffer);
    
    if (!result.value || result.value.trim().length === 0) {
      return res.status(400).json({ 
        message: 'No text could be extracted from the Word document' 
      });
    }

    res.json({ 
      text: result.value.trim(),
      fileName: req.file.originalname,
      fileSize: req.file.size,
    });
  } catch (error) {
    next(error);
  }
};

// ✅ Parse any resume file (PDF or Word) - Auto-detect
export const parseResumeFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileType = req.file.mimetype;
    let text = '';
    let metadata = {};

    // Parse based on file type
    if (fileType === 'application/pdf') {
      const data = await parsePDFBuffer(req.file.buffer);
      text = data.text;
      metadata = {
        pageCount: data.numpages,
        info: data.info,
      };
    } else if (
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileType === 'application/msword'
    ) {
      const result = await parseWordBuffer(req.file.buffer);
      text = result.value;
      metadata = {
        wordCount: text.split(/\s+/).length,
      };
    } else {
      return res.status(400).json({ 
        message: 'Unsupported file type. Please upload PDF or Word document.' 
      });
    }

    // Check if text was extracted
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ 
        message: 'No text could be extracted from the file. Please try pasting the text manually.' 
      });
    }

    // Clean up the text
    text = text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\n{4,}/g, '\n\n')
      .trim();

    res.json({ 
      text,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      fileType: req.file.mimetype,
      ...metadata,
    });

  } catch (error) {
    console.error('File parsing error:', error);
    next(error);
  }
};

// ✅ Parse multiple resume files
export const parseMultipleResumes = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const results = [];
    
    for (const file of req.files) {
      let text = '';
      let success = false;
      let error = null;
      const fileType = file.mimetype;

      try {
        if (fileType === 'application/pdf') {
          const data = await parsePDFBuffer(file.buffer);
          text = data.text;
          success = true;
        } else if (
          fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
          fileType === 'application/msword'
        ) {
          const result = await parseWordBuffer(file.buffer);
          text = result.value;
          success = true;
        } else {
          error = 'Unsupported file type';
        }

        results.push({
          fileName: file.originalname,
          text: success ? text.trim() : '',
          success,
          error,
          fileSize: file.size,
          fileType,
        });
      } catch (err) {
        results.push({
          fileName: file.originalname,
          text: '',
          success: false,
          error: err.message,
          fileSize: file.size,
          fileType,
        });
      }
    }

    res.json({ 
      results,
      totalFiles: req.files.length,
      successfulParses: results.filter(r => r.success).length,
    });
  } catch (error) {
    next(error);
  }
};

// ✅ Get improvement suggestions with examples
export const getImprovementSuggestions = async (req, res, next) => {
  try {
    const { resumeText, jobDescription } = req.body;

    if (!resumeText || !jobDescription) {
      return res.status(400).json({ 
        message: 'Resume text and job description are required' 
      });
    }

    // First get the score to get improvements
    const scoreResult = await scoreResume(resumeText, jobDescription);
    
    // Enhance improvements with examples
    const improvementsWithExamples = (scoreResult.improvements || []).map(improvement => ({
      suggestion: improvement,
      example: `💡 Instead of "${improvement}", try adding quantifiable achievements (e.g., "Increased efficiency by 30%", "Led a team of 5 developers")`,
      priority: 'high',
    }));

    res.json({
      improvements: improvementsWithExamples,
      totalImprovements: improvementsWithExamples.length,
    });
  } catch (error) {
    next(error);
  }
};

// ✅ Extract keywords from text
export const extractKeywords = async (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: 'Text is required' });
    }

    // Simple keyword extraction (can be enhanced with NLP)
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3);

    const wordCount = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });

    const sortedKeywords = Object.entries(wordCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([word, count]) => ({ word, count }));

    res.json({
      keywords: sortedKeywords,
      totalWords: words.length,
      uniqueWords: Object.keys(wordCount).length,
    });
  } catch (error) {
    next(error);
  }
};