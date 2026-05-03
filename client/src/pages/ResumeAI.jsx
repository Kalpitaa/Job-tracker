import { useState } from 'react';
import Layout from '../components/Layout';
import api from '../api/axios';

export default function ResumeAI() {
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    } catch (err) {
      setError(err.response?.data?.message || 'Scoring failed');
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = (score) => {
    if (score >= 75) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Resume AI Scorer</h1>
        <p className="text-gray-400 text-sm mt-1">Paste your resume and job description to get an ATS score</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Your Resume</label>
          <textarea
            value={resumeText}
            onChange={e => setResumeText(e.target.value)}
            rows={12}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            placeholder="Paste your resume text here..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Job Description</label>
          <textarea
            value={jobDescription}
            onChange={e => setJobDescription(e.target.value)}
            rows={12}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            placeholder="Paste the job description here..."
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>
      )}

      <button
        onClick={handleScore}
        disabled={loading}
        className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50 mb-8"
      >
        {loading ? 'Analyzing...' : '⚡ Analyze Resume'}
      </button>

      {/* Results */}
      {result && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-6">
          {/* Score */}
          <div className="text-center">
            <p className="text-sm text-gray-400 mb-1">ATS Match Score</p>
            <p className={`text-6xl font-bold ${scoreColor(result.score)}`}>{result.score}</p>
            <p className="text-gray-400 text-sm mt-1">out of 100</p>
          </div>

          <hr className="border-gray-100" />

          {/* Summary */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Summary</h3>
            <p className="text-sm text-gray-500">{result.summary}</p>
          </div>

          {/* Strengths */}
          <div>
            <h3 className="text-sm font-semibold text-green-700 mb-2">✓ Strengths</h3>
            <ul className="space-y-1">
              {result.strengths?.map((s, i) => (
                <li key={i} className="text-sm text-gray-600 flex gap-2">
                  <span className="text-green-500 mt-0.5">•</span>{s}
                </li>
              ))}
            </ul>
          </div>

          {/* Improvements */}
          <div>
            <h3 className="text-sm font-semibold text-yellow-700 mb-2">⚠ Improvements</h3>
            <ul className="space-y-1">
              {result.improvements?.map((s, i) => (
                <li key={i} className="text-sm text-gray-600 flex gap-2">
                  <span className="text-yellow-500 mt-0.5">•</span>{s}
                </li>
              ))}
            </ul>
          </div>

          {/* Missing keywords */}
          <div>
            <h3 className="text-sm font-semibold text-red-700 mb-2">✗ Missing Keywords</h3>
            <div className="flex flex-wrap gap-2">
              {result.keywords_missing?.map((k, i) => (
                <span key={i} className="bg-red-50 text-red-600 text-xs px-3 py-1 rounded-full">{k}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}