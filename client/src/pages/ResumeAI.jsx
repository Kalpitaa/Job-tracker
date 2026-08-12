import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../components/Layout'; 
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';

export default function ResumeAI() {
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedVersion, setSelectedVersion] = useState('v1');
  const [resumeVersions, setResumeVersions] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showSideBySide, setShowSideBySide] = useState(false);
  const [highlightedResume, setHighlightedResume] = useState('');
  const [exporting, setExporting] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [fileName, setFileName] = useState('');
  const { user } = useAuth();
  const resultRef = useRef(null);

  // Load saved resume versions from localStorage
  useEffect(() => {
    const savedVersions = localStorage.getItem('resumeVersions');
    if (savedVersions) {
      setResumeVersions(JSON.parse(savedVersions));
    }
  }, []);

  // Save resume versions to localStorage
  const saveResumeVersion = (text, versionName) => {
    const newVersion = {
      id: Date.now(),
      name: versionName || `Version ${resumeVersions.length + 1}`,
      text: text,
      date: new Date().toISOString(),
      score: result?.score || null,
    };
    const updated = [...resumeVersions, newVersion];
    setResumeVersions(updated);
    localStorage.setItem('resumeVersions', JSON.stringify(updated));
  };

  // Load a specific version
  const loadVersion = (version) => {
    setResumeText(version.text);
    setSelectedVersion(version.name);
    setShowHistory(false);
  };

  // Delete a version
  const deleteVersion = (id) => {
    const updated = resumeVersions.filter(v => v.id !== id);
    setResumeVersions(updated);
    localStorage.setItem('resumeVersions', JSON.stringify(updated));
  };

  // Parse PDF/Word file
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setParsing(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/ai/parse-resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResumeText(res.data.text);
      setError('');
    } catch (err) {
      setError('Failed to parse file. Please paste the text manually.');
      console.error('Parse error:', err);
    } finally {
      setParsing(false);
      e.target.value = '';
    }
  };

  // Handle scoring
  const handleScore = async () => {
    if (!resumeText || !jobDescription) {
      setError('Please fill in both fields');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/ai/score', { resumeText, jobDescription });
      setResult(res.data);
      
      // Highlight keywords
      highlightKeywords(res.data.keywords_found || [], res.data.keywords_missing || []);
      
      // Auto-save version if score is good
      if (res.data.score > 60) {
        saveResumeVersion(resumeText, `Score: ${res.data.score}%`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Scoring failed');
    } finally {
      setLoading(false);
    }
  };

  // Highlight keywords in resume text
  const highlightKeywords = (found, missing) => {
    let highlighted = resumeText;
    const allKeywords = [...found, ...missing];
    
    allKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      if (found.includes(keyword)) {
        highlighted = highlighted.replace(regex, (match) => 
          `<span class="bg-green-500/20 text-green-400 px-1 rounded">${match}</span>`
        );
      } else if (missing.includes(keyword)) {
        highlighted = highlighted.replace(regex, (match) => 
          `<span class="bg-red-500/20 text-red-400 px-1 rounded">${match}</span>`
        );
      }
    });
    
    setHighlightedResume(highlighted);
  };

  // Export as PDF
  const exportAsPDF = async () => {
    if (!result) return;
    setExporting(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Title
      doc.setFontSize(20);
      doc.setTextColor(99, 102, 241);
      doc.text('Resume Score Report', pageWidth / 2, 20, { align: 'center' });
      
      // Score
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text(`ATS Match Score: ${result.score}%`, 20, 45);
      
      // Date
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - 40, 10);
      
      // Summary
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text('Summary:', 20, 60);
      doc.setFontSize(10);
      const summaryLines = doc.splitTextToSize(result.summary || 'N/A', pageWidth - 40);
      doc.text(summaryLines, 25, 70);
      
      let yPos = 80 + (summaryLines.length * 5);
      
      // Strengths
      doc.setFontSize(12);
      doc.setTextColor(34, 197, 94);
      doc.text('✓ Strengths:', 20, yPos);
      yPos += 8;
      doc.setTextColor(0, 0, 0);
      result.strengths?.forEach(s => {
        doc.setFontSize(10);
        const lines = doc.splitTextToSize(`• ${s}`, pageWidth - 50);
        doc.text(lines, 25, yPos);
        yPos += lines.length * 5 + 3;
      });
      
      yPos += 10;
      
      // Improvements
      doc.setFontSize(12);
      doc.setTextColor(234, 179, 8);
      doc.text('⚠ Improvements:', 20, yPos);
      yPos += 8;
      doc.setTextColor(0, 0, 0);
      result.improvements?.forEach(s => {
        doc.setFontSize(10);
        const lines = doc.splitTextToSize(`• ${s}`, pageWidth - 50);
        doc.text(lines, 25, yPos);
        yPos += lines.length * 5 + 3;
      });
      
      yPos += 10;
      
      // Missing Keywords
      if (result.keywords_missing?.length > 0) {
        doc.setFontSize(12);
        doc.setTextColor(239, 68, 68);
        doc.text('✗ Missing Keywords:', 20, yPos);
        yPos += 8;
        doc.setTextColor(0, 0, 0);
        const keywords = result.keywords_missing.join(', ');
        const keywordLines = doc.splitTextToSize(keywords, pageWidth - 40);
        doc.setFontSize(10);
        doc.text(keywordLines, 25, yPos);
      }
      
      doc.save('resume-score-report.pdf');
    } catch (err) {
      console.error('Failed to export PDF:', err);
      setError('Failed to export PDF');
    } finally {
      setExporting(false);
    }
  };

  // Get improvement suggestions with examples
  const getImprovementSuggestions = () => {
    if (!result?.improvements) return [];
    return result.improvements.map(imp => ({
      suggestion: imp,
      example: `💡 Instead of "${imp}", try adding quantifiable achievements (e.g., "Increased sales by 30%")`,
    }));
  };

  const scoreColor = (score) => {
    if (score >= 75) return 'text-green-400';
    if (score >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  const scoreBgColor = (score) => {
    if (score >= 75) return 'from-green-500/20 to-green-600/10 border-green-500/30';
    if (score >= 50) return 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30';
    return 'from-red-500/20 to-red-600/10 border-red-500/30';
  };

  return (
    <Layout> 
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-white">Resume AI Scorer 🤖</h1>
            <p className="text-white/50 text-sm mt-1">
              Upload, analyze, and improve your resume with AI
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="px-3 py-1.5 text-xs text-white/60 hover:text-white border border-white/10 rounded-lg hover:bg-white/5 transition flex items-center gap-1"
            >
              📚 History ({resumeVersions.length})
            </button>
            <span className="text-white/40 text-sm">AI Powered</span>
          </div>
        </motion.div>

        {/* Version History */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 overflow-hidden"
            >
              <h3 className="text-sm font-semibold text-white mb-3"> Resume Versions</h3>
              {resumeVersions.length === 0 ? (
                <p className="text-white/40 text-sm">No saved versions yet.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {resumeVersions.map((version) => (
                    <div
                      key={version.id}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white/80 font-medium">{version.name}</p>
                        <p className="text-xs text-white/30">
                          {new Date(version.date).toLocaleDateString()} • 
                          {version.score ? ` Score: ${version.score}%` : ' Not scored'}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => loadVersion(version)}
                          className="text-xs text-indigo-400 hover:text-indigo-300 transition"
                        >
                          Load
                        </button>
                        <button
                          onClick={() => deleteVersion(version.id)}
                          className="text-xs text-red-400 hover:text-red-300 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* File Upload */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="flex flex-wrap items-center gap-4"
        >
          <label className="cursor-pointer">
            <div className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white/80 hover:bg-white/10 transition flex items-center gap-2">
              {parsing ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Parsing...
                </>
              ) : (
                '📎 Upload Resume'
              )}
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
                disabled={parsing}
              />
            </div>
          </label>
          <span className="text-xs text-white/30">PDF, DOC, DOCX supported</span>
          {fileName && (
            <span className="text-xs text-green-400">✓ {fileName}</span>
          )}
          {resumeText && !fileName && (
            <span className="text-xs text-green-400">✓ Resume loaded ({resumeText.length} chars)</span>
          )}
        </motion.div>

        {/* Input Fields */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-white/60">Your Resume</label>
              <button
                onClick={() => saveResumeVersion(resumeText, `Manual ${new Date().toLocaleDateString()}`)}
                className="text-xs text-indigo-400 hover:text-indigo-300 transition"
                disabled={!resumeText}
              >
                💾 Save Version
              </button>
            </div>
            <textarea
              value={resumeText}
              onChange={e => setResumeText(e.target.value)}
              rows={12}
              className="w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
              placeholder="Paste your resume text here or upload a file..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">Job Description</label>
            <textarea
              value={jobDescription}
              onChange={e => setJobDescription(e.target.value)}
              rows={12}
              className="w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
              placeholder="Paste the job description here..."
            />
          </div>
        </motion.div>

        {/* Compare Side-by-Side Toggle */}
        {result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-wrap items-center gap-4"
          >
            <label className="flex items-center gap-2 text-sm text-white/60 cursor-pointer">
              <input
                type="checkbox"
                checked={showSideBySide}
                onChange={() => setShowSideBySide(!showSideBySide)}
                className="w-4 h-4 bg-white/10 border border-white/10 rounded focus:ring-2 focus:ring-indigo-500"
              />
              Compare Side-by-Side
            </label>
            <button
              onClick={exportAsPDF}
              disabled={exporting}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-xl transition disabled:opacity-50 flex items-center gap-2"
            >
              {exporting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Exporting...
                </>
              ) : (
                '📄 Export PDF'
              )}
            </button>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/20 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl"
          >
            {error}
          </motion.div>
        )}

        {/* Analyze Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleScore}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl text-sm font-semibold transition shadow-lg shadow-indigo-900/50 disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              Analyzing...
            </>
          ) : (
            '⚡ Analyze Resume'
          )}
        </motion.button>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div
              ref={resultRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 space-y-6"
            >
              {/* Score */}
              <div className="text-center">
                <p className="text-sm text-white/40 mb-1">ATS Match Score</p>
                <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br ${scoreBgColor(result.score)} border-4 ${scoreBgColor(result.score).split(' ').slice(2).join(' ')}`}>
                  <p className={`text-4xl font-bold ${scoreColor(result.score)}`}>{result.score}</p>
                </div>
                <p className="text-white/40 text-sm mt-2">out of 100</p>
              </div>

              <hr className="border-white/10" />

              {/* Summary */}
              <div>
                <h3 className="text-sm font-semibold text-white mb-2"> Summary</h3>
                <p className="text-sm text-white/60 leading-relaxed">{result.summary}</p>
              </div>

              {/* Strengths */}
              <div>
                <h3 className="text-sm font-semibold text-green-400 mb-2">✓ Strengths</h3>
                <ul className="space-y-1.5">
                  {result.strengths?.map((s, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="text-sm text-white/60 flex gap-2 items-start"
                    >
                      <span className="text-green-400 mt-0.5">•</span>
                      <span>{s}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>

              {/* Improvements with Examples */}
              <div>
                <h3 className="text-sm font-semibold text-yellow-400 mb-2">⚠ Improvements</h3>
                <ul className="space-y-3">
                  {getImprovementSuggestions().map((item, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="text-sm"
                    >
                      <div className="flex gap-2 items-start">
                        <span className="text-yellow-400 mt-0.5">•</span>
                        <div>
                          <p className="text-white/80">{item.suggestion}</p>
                          <p className="text-white/40 text-xs mt-1 border-l-2 border-indigo-500/30 pl-3">
                            {item.example}
                          </p>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              </div>

              {/* Missing Keywords */}
              <div>
                <h3 className="text-sm font-semibold text-red-400 mb-2">✗ Missing Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {result.keywords_missing?.map((k, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="bg-red-500/20 text-red-400 text-xs px-3 py-1.5 rounded-full border border-red-500/30"
                    >
                      {k}
                    </motion.span>
                  ))}
                </div>
              </div>

              {/* Found Keywords */}
              <div>
                <h3 className="text-sm font-semibold text-green-400 mb-2">✓ Found Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {result.keywords_found?.map((k, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="bg-green-500/20 text-green-400 text-xs px-3 py-1.5 rounded-full border border-green-500/30"
                    >
                      {k}
                    </motion.span>
                  ))}
                </div>
              </div>

              {/* Highlighted Resume */}
              {highlightedResume && showSideBySide && (
                <div>
                  <h3 className="text-sm font-semibold text-white mb-2">📄 Highlighted Resume</h3>
                  <div 
                    className="bg-white/5 rounded-xl p-4 text-sm text-white/80 whitespace-pre-wrap max-h-60 overflow-y-auto"
                    dangerouslySetInnerHTML={{ __html: highlightedResume }}
                  />
                  <div className="mt-2 flex gap-4 text-xs text-white/30">
                    <span>🟢 Found keywords</span>
                    <span>🔴 Missing keywords</span>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout> 
  );
}