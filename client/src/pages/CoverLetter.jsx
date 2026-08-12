import { useState } from 'react';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import api from '../api/axios';

const TONES = ['professional and enthusiastic', 'confident and direct', 'creative and friendly', 'formal and concise'];

export default function CoverLetter() {
  const [form, setForm] = useState({
    company: '',
    role: '',
    jobDescription: '',
    resumeText: '',
    tone: TONES[0],
  });
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleGenerate = async () => {
    if (!form.company || !form.role || !form.jobDescription || !form.resumeText) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/ai/cover-letter', form);
      setResult(res.data.coverLetter);
    } catch (err) {
      setError(err.response?.data?.message || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-2"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">Cover Letter Generator ✉️</h1>
              <p className="text-white/50 text-sm mt-1">
                Generate a tailored cover letter using AI
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* <span className="text-2xl">🤖</span> */}
              <span className="text-white/40 text-sm">AI Powered</span>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input side */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">Company *</label>
                <input
                  name="company"
                  value={form.company}
                  onChange={handleChange}
                  className="w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="Google"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">Role *</label>
                <input
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="Frontend Developer"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/60 mb-1">Tone</label>
              <select
                name="tone"
                value={form.tone}
                onChange={handleChange}
                className="w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              >
                {TONES.map(t => (
                  <option key={t} value={t} className="bg-slate-800 text-white">
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/60 mb-1">Your Resume *</label>
              <textarea
                name="resumeText"
                value={form.resumeText}
                onChange={handleChange}
                rows={6}
                className="w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
                placeholder="Paste your resume text..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/60 mb-1">Job Description *</label>
              <textarea
                name="jobDescription"
                value={form.jobDescription}
                onChange={handleChange}
                rows={6}
                className="w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
                placeholder="Paste the job description..."
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/20 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl"
              >
                {error}
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl text-sm font-semibold transition shadow-lg shadow-indigo-900/50 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Generating...
                </>
              ) : (
                '✉️ Generate Cover Letter'
              )}
            </motion.button>
          </motion.div>

          {/* Output side */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-white/60">Generated Letter</label>
              {result && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCopy}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition"
                >
                  {copied ? '✓ Copied!' : '📋 Copy'}
                </motion.button>
              )}
            </div>
            <div className="w-full h-[500px] bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-4 py-3 text-sm text-white/80 overflow-y-auto whitespace-pre-wrap">
              {result || (
                <span className="text-white/30">Your cover letter will appear here...</span>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}