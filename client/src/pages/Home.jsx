import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

function LoginModal({ onClose, onSwitchToSignup }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      login(res.data, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 24 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md relative overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Top accent bar - without logo */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 text-sm transition"
        >
          ✕
        </button>

        <div className="mb-7">
          {/*  LOGO PLACED HERE - In the content area */}
          <div className="flex justify-center mb-4">
            <img 
              src="/Logo.png" 
              alt="CareerLens Logo" 
              className="w-16 h-16 object-contain rounded-xl"
              onError={(e) => {
                console.log('Logo failed to load. Make sure Logo.png exists in public folder');
                e.target.style.display = 'none';
              }}
            />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 text-center">Welcome back</h2>
          <p className="text-gray-400 text-sm text-center mt-1">Log in to your CareerLens account</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-gray-50"
              placeholder="you@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-gray-50"
              placeholder="••••••••"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl text-sm font-bold hover:opacity-90 transition disabled:opacity-50 shadow-lg shadow-indigo-200 mt-2"
          >
            {loading ? 'Logging in...' : 'Log in →'}
          </motion.button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          Don't have an account?{' '}
          <button onClick={onSwitchToSignup} className="text-indigo-600 hover:underline font-semibold">
            Sign up free
          </button>
        </p>
      </motion.div>
    </motion.div>
  );
}

const features = [
  { icon: '📊', title: 'Smart Dashboard', desc: 'Track all your applications in one place with real-time status updates', color: 'from-blue-500 to-indigo-600' },
  { icon: '🤖', title: 'AI Resume Scorer', desc: 'Get instant ATS score and improvement tips for any job description', color: 'from-purple-500 to-pink-600' },
  { icon: '✉️', title: 'Cover Letter AI', desc: 'Generate tailored cover letters in seconds with AI assistance', color: 'from-emerald-500 to-teal-600' },
  { icon: '📈', title: 'Progress Tracking', desc: 'Visualize your job search journey from Applied to Offer', color: 'from-orange-500 to-red-500' },
];

const stats = [
  { value: '10x', label: 'Faster Applications' },
  { value: '85%', label: 'ATS Pass Rate' },
  { value: '3min', label: 'Cover Letter Time' },
];

const steps = [
  { step: '01', title: 'Add your jobs', desc: 'Paste a job link or add manually in seconds' },
  { step: '02', title: 'Score your resume', desc: 'Get AI feedback vs the job description instantly' },
  { step: '03', title: 'Generate cover letter', desc: 'One click tailored letter, ready to send' },
];

export default function Home() {
  const [showLogin, setShowLogin] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white overflow-hidden">

      <AnimatePresence>
        {showLogin && (
          <LoginModal
            onClose={() => setShowLogin(false)}
            onSwitchToSignup={() => { setShowLogin(false); navigate('/signup'); }}
          />
        )}
      </AnimatePresence>

      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-700/20 rounded-full blur-[120px]" />
        <div className="absolute top-[30%] right-[-10%] w-[500px] h-[500px] bg-purple-700/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[400px] h-[400px] bg-blue-700/15 rounded-full blur-[100px]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-16 py-5 border-b border-white/5 backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          {/* Logo Image */}
          <img 
            src="/Logo.png" 
            alt="CareerLens Logo" 
            className="w-9 h-9 object-contain rounded-xl"
            onError={(e) => {
              console.log('Logo failed to load. Make sure logo.png exists in public folder');
              e.target.style.display = 'none';
            }}
          />
          <span className="font-bold text-xl tracking-tight">
            Career<span className="text-indigo-400">Lens</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowLogin(true)}
            className="px-5 py-2 text-sm text-white/70 hover:text-white transition font-medium"
          >
            Log in
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/signup')}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition shadow-lg shadow-indigo-900/50"
          >
            Get Started Free ✦
          </motion.button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 text-center px-6 pt-24 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-300 text-xs font-semibold mb-8 tracking-wide"
          >
            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></span>
            AI-Powered Job Search Assistant
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.1] mb-6 tracking-tight">
            Land your dream job<br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              smarter & faster
            </span>
          </h1>

          <p className="text-white/50 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
            Track applications, score your resume with AI, and generate tailored cover letters —
            all in one powerful dashboard.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 25px 50px rgba(99,102,241,0.5)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/signup')}
              className="px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-indigo-900 transition"
            >
              Start for Free →
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowLogin(true)}
              className="px-10 py-4 border border-white/10 text-white/80 rounded-2xl font-bold text-lg hover:text-white transition backdrop-blur-sm"
            >
              Log in
            </motion.button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="flex flex-wrap justify-center gap-6 md:gap-12 mt-20"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              className="text-center px-6 py-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm"
            >
              <div className="text-3xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-white/40 text-sm mt-1 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative z-10 px-6 md:px-16 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-indigo-400 text-xs font-bold tracking-widest uppercase mb-3">Features</p>
          <h2 className="text-3xl md:text-5xl font-extrabold mb-4">
            Everything you need to{' '}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              get hired
            </span>
          </h2>
          <p className="text-white/40 text-lg max-w-xl mx-auto">
            Stop losing track of applications — let AI do the heavy lifting
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/8 hover:border-indigo-500/30 transition-all duration-300 group"
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${f.color} rounded-2xl flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <span className="text-xl">{f.icon}</span>
              </div>
              <h3 className="font-bold text-white mb-2 text-lg">{f.title}</h3>
              <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 px-6 md:px-16 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-purple-400 text-xs font-bold tracking-widest uppercase mb-3">How it works</p>
          <h2 className="text-3xl md:text-5xl font-extrabold">
            3 simple steps to{' '}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              your next offer
            </span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-6xl font-extrabold bg-gradient-to-b from-white/20 to-white/5 bg-clip-text text-transparent mb-4">
                {s.step}
              </div>
              <h3 className="font-bold text-white text-lg mb-2">{s.title}</h3>
              <p className="text-white/40 text-sm">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-6 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-3xl blur-xl" />
          <div className="relative bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border border-indigo-500/20 rounded-3xl p-12 backdrop-blur-sm">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
              Ready to supercharge<br />your job search?
            </h2>
            <p className="text-white/50 mb-10 text-lg max-w-lg mx-auto">
              Join thousands of job seekers using AI to land offers faster.
            </p>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 25px 50px rgba(99,102,241,0.5)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/signup')}
              className="px-12 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold text-lg hover:opacity-90 transition shadow-2xl shadow-indigo-900"
            >
              Get Started Free →
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 text-white/20 text-sm border-t border-white/5">
        © 2025 CareerLens. Built with ❤️ for job seekers.
      </footer>
    </div>
  );
}