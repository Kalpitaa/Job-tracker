import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import JobRow from '../components/JobRow';
import AddJobModal from '../components/AddJobModal';
import SavedFilters from '../components/SavedFilters';
import api from '../api/axios';

const STATUSES = ['all', 'saved', 'applied', 'interview', 'offer', 'rejected'];
const PRIORITIES = ['all', 'low', 'medium', 'high'];
const LOCATIONS = ['all', 'Remote', 'Hybrid', 'On-site', 'Flexible'];
const SORT_OPTIONS = [
  { value: 'date-desc', label: 'Date (Newest)' },
  { value: 'date-asc', label: 'Date (Oldest)' },
  { value: 'company-asc', label: 'Company (A-Z)' },
  { value: 'company-desc', label: 'Company (Z-A)' },
  { value: 'status', label: 'Status' },
  { value: 'priority', label: 'Priority' },
];

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    location: 'all',
    dateRange: {
      from: '',
      to: '',
    },
    company: '',
    minSalary: '',
    maxSalary: '',
    hasDeadline: false,
    hasFollowUp: false,
  });
  const [sortBy, setSortBy] = useState('date-desc');
  const [savedFilters, setSavedFilters] = useState([]);
  const [filterName, setFilterName] = useState('');
  const [showSaveFilter, setShowSaveFilter] = useState(false);
  const { user } = useAuth();

  // Fetch jobs function
  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/jobs');
      setJobs(res.data);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    
    // Load saved filters from localStorage
    const saved = localStorage.getItem('savedFilters');
    if (saved) {
      setSavedFilters(JSON.parse(saved));
    }
  }, []);

  // Apply filters and sorting
  const getFilteredAndSortedJobs = () => {
    let filtered = jobs.filter(job => {
      // Search filter
      const matchesSearch = job.company.toLowerCase().includes(search.toLowerCase()) ||
                           job.role.toLowerCase().includes(search.toLowerCase());
      
      // Status filter
      const matchesStatus = filters.status === 'all' || job.status === filters.status;
      
      // Priority filter
      const matchesPriority = filters.priority === 'all' || job.priority === filters.priority;
      
      // Location filter
      const matchesLocation = filters.location === 'all' || job.location === filters.location;
      
      // Company filter
      const matchesCompany = job.company.toLowerCase().includes(filters.company.toLowerCase());
      
      // Date range filter
      let matchesDateRange = true;
      if (filters.dateRange.from) {
        const jobDate = new Date(job.appliedDate || job.createdAt);
        const fromDate = new Date(filters.dateRange.from);
        matchesDateRange = matchesDateRange && jobDate >= fromDate;
      }
      if (filters.dateRange.to) {
        const jobDate = new Date(job.appliedDate || job.createdAt);
        const toDate = new Date(filters.dateRange.to);
        toDate.setHours(23, 59, 59, 999);
        matchesDateRange = matchesDateRange && jobDate <= toDate;
      }
      
      // Salary range filter
      let matchesSalary = true;
      if (filters.minSalary && job.salaryMin) {
        matchesSalary = matchesSalary && job.salaryMin >= parseInt(filters.minSalary);
      }
      if (filters.maxSalary && job.salaryMax) {
        matchesSalary = matchesSalary && job.salaryMax <= parseInt(filters.maxSalary);
      }
      
      // Deadline filter
      let matchesDeadline = true;
      if (filters.hasDeadline) {
        matchesDeadline = job.deadline !== undefined && job.deadline !== null && job.deadline !== '';
      }
      
      // Follow-up filter
      let matchesFollowUp = true;
      if (filters.hasFollowUp) {
        matchesFollowUp = job.followUp !== undefined && job.followUp !== null && job.followUp !== '';
      }
      
      return matchesSearch && matchesStatus && matchesPriority && matchesLocation &&
             matchesCompany && matchesDateRange && matchesSalary && matchesDeadline && matchesFollowUp;
    });

    // Apply sorting
    const sorted = [...filtered];
    switch (sortBy) {
      case 'date-desc':
        sorted.sort((a, b) => new Date(b.appliedDate || b.createdAt) - new Date(a.appliedDate || a.createdAt));
        break;
      case 'date-asc':
        sorted.sort((a, b) => new Date(a.appliedDate || a.createdAt) - new Date(b.appliedDate || b.createdAt));
        break;
      case 'company-asc':
        sorted.sort((a, b) => a.company.localeCompare(b.company));
        break;
      case 'company-desc':
        sorted.sort((a, b) => b.company.localeCompare(a.company));
        break;
      case 'status':
        const statusOrder = { saved: 0, applied: 1, interview: 2, offer: 3, rejected: 4 };
        sorted.sort((a, b) => (statusOrder[a.status] || 0) - (statusOrder[b.status] || 0));
        break;
      case 'priority':
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        sorted.sort((a, b) => (priorityOrder[a.priority] || 1) - (priorityOrder[b.priority] || 1));
        break;
      default:
        break;
    }
    
    return sorted;
  };

  const filteredJobs = getFilteredAndSortedJobs();

  // Handle adding a new job with refresh triggers
  const handleAddJob = (newJob) => {
    setJobs([newJob, ...jobs]);
    localStorage.setItem('jobAdded', Date.now().toString());
    localStorage.removeItem('jobAdded');
    window.dispatchEvent(new CustomEvent('jobUpdated'));
    window.dispatchEvent(new StorageEvent('storage', { 
      key: 'jobAdded', 
      newValue: Date.now().toString() 
    }));
  };

  // Handle job update with refresh triggers
  const handleUpdateJob = (updatedJob) => {
    setJobs(jobs.map(j => j._id === updatedJob._id ? updatedJob : j));
    localStorage.setItem('jobUpdated', Date.now().toString());
    localStorage.removeItem('jobUpdated');
    window.dispatchEvent(new CustomEvent('jobUpdated'));
  };

  // Handle job delete with refresh triggers
  const handleDeleteJob = (id) => {
    setJobs(jobs.filter(j => j._id !== id));
    localStorage.setItem('jobDeleted', Date.now().toString());
    localStorage.removeItem('jobDeleted');
    window.dispatchEvent(new CustomEvent('jobUpdated'));
  };

  // Save current filters
  const saveCurrentFilters = () => {
    if (!filterName.trim()) {
      alert('Please enter a filter name');
      return;
    }
    
    const newSavedFilter = {
      id: Date.now(),
      name: filterName,
      filters: { ...filters },
      sortBy: sortBy,
      search: search,
    };
    
    const updated = [...savedFilters, newSavedFilter];
    setSavedFilters(updated);
    localStorage.setItem('savedFilters', JSON.stringify(updated));
    setFilterName('');
    setShowSaveFilter(false);
  };

  // Load a saved filter
  const loadSavedFilter = (savedFilter) => {
    setFilters(savedFilter.filters);
    setSortBy(savedFilter.sortBy || 'date-desc');
    setSearch(savedFilter.search || '');
  };

  // Delete a saved filter
  const deleteSavedFilter = (id) => {
    const updated = savedFilters.filter(f => f.id !== id);
    setSavedFilters(updated);
    localStorage.setItem('savedFilters', JSON.stringify(updated));
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      status: 'all',
      priority: 'all',
      location: 'all',
      dateRange: { from: '', to: '' },
      company: '',
      minSalary: '',
      maxSalary: '',
      hasDeadline: false,
      hasFollowUp: false,
    });
    setSearch('');
    setSortBy('date-desc');
  };

  // Status counts
  const statusCounts = {
    total: jobs.length,
    applied: jobs.filter(j => j.status === 'applied').length,
    interview: jobs.filter(j => j.status === 'interview').length,
    offer: jobs.filter(j => j.status === 'offer').length,
    rejected: jobs.filter(j => j.status === 'rejected').length,
    saved: jobs.filter(j => j.status === 'saved').length,
  };

  // Check if any filters are active
  const hasActiveFilters = () => {
    return filters.status !== 'all' ||
           filters.priority !== 'all' ||
           filters.location !== 'all' ||
           filters.company !== '' ||
           filters.dateRange.from !== '' ||
           filters.dateRange.to !== '' ||
           filters.minSalary !== '' ||
           filters.maxSalary !== '' ||
           filters.hasDeadline ||
           filters.hasFollowUp ||
           search !== '';
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">My Applications</h1>
              <p className="text-white/50 text-sm mt-1">
                {filteredJobs.length} of {jobs.length} applications • {statusCounts.interview} in interview
                {hasActiveFilters() && (
                  <span className="ml-2 text-indigo-400 text-xs">(Filtered)</span>
                )}
              </p>
            </div>
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2.5 border border-white/20 text-white/80 hover:text-white text-sm font-semibold rounded-xl transition flex items-center gap-2"
              >
                🔍 Filters
                {hasActiveFilters() && (
                  <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                )}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowModal(true)}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition shadow-lg shadow-indigo-900/50 flex items-center gap-2"
              >
                <span className="text-lg">+</span> Add Job
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Saved Filters */}
        {savedFilters.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap gap-2 items-center"
          >
            <span className="text-xs text-white/40 mr-2">Saved Filters:</span>
            <SavedFilters
              filters={savedFilters}
              onLoad={loadSavedFilter}
              onDelete={deleteSavedFilter}
            />
          </motion.div>
        )}

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 md:grid-cols-6 gap-3"
        >
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3 text-center cursor-pointer hover:bg-white/10 transition"
               onClick={() => setFilters({...filters, status: 'all'})}>
            <div className="text-lg font-bold text-white">{statusCounts.total}</div>
            <div className="text-xs text-white/40">Total</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3 text-center cursor-pointer hover:bg-white/10 transition"
               onClick={() => setFilters({...filters, status: 'saved'})}>
            <div className="text-lg font-bold text-gray-400">{statusCounts.saved}</div>
            <div className="text-xs text-white/40">Saved</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3 text-center cursor-pointer hover:bg-white/10 transition"
               onClick={() => setFilters({...filters, status: 'applied'})}>
            <div className="text-lg font-bold text-blue-400">{statusCounts.applied}</div>
            <div className="text-xs text-white/40">Applied</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3 text-center cursor-pointer hover:bg-white/10 transition"
               onClick={() => setFilters({...filters, status: 'interview'})}>
            <div className="text-lg font-bold text-yellow-400">{statusCounts.interview}</div>
            <div className="text-xs text-white/40">Interview</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3 text-center cursor-pointer hover:bg-white/10 transition"
               onClick={() => setFilters({...filters, status: 'offer'})}>
            <div className="text-lg font-bold text-green-400">{statusCounts.offer}</div>
            <div className="text-xs text-white/40">Offers</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3 text-center cursor-pointer hover:bg-white/10 transition"
               onClick={() => setFilters({...filters, status: 'rejected'})}>
            <div className="text-lg font-bold text-red-400">{statusCounts.rejected}</div>
            <div className="text-xs text-white/40">Rejected</div>
          </div>
        </motion.div>

        {/* Advanced Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 overflow-hidden"
            >
              {/* Filter fields - keeping your existing filter code */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {/* Search */}
                <div>
                  <label className="block text-xs font-medium text-white/40 mb-1">Search</label>
                  <input
                    type="text"
                    placeholder="Company or role..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-medium text-white/40 mb-1">Status</label>
                  <select
                    value={filters.status}
                    onChange={e => setFilters({...filters, status: e.target.value})}
                    className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {STATUSES.map(s => (
                      <option key={s} value={s} className="bg-slate-800 text-white">
                        {s === 'all' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-xs font-medium text-white/40 mb-1">Priority</label>
                  <select
                    value={filters.priority}
                    onChange={e => setFilters({...filters, priority: e.target.value})}
                    className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {PRIORITIES.map(p => (
                      <option key={p} value={p} className="bg-slate-800 text-white">
                        {p === 'all' ? 'All Priority' : p.charAt(0).toUpperCase() + p.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-xs font-medium text-white/40 mb-1">Location</label>
                  <select
                    value={filters.location}
                    onChange={e => setFilters({...filters, location: e.target.value})}
                    className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {LOCATIONS.map(l => (
                      <option key={l} value={l} className="bg-slate-800 text-white">
                        {l === 'all' ? 'All Locations' : l}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Company */}
                <div>
                  <label className="block text-xs font-medium text-white/40 mb-1">Company</label>
                  <input
                    type="text"
                    placeholder="Filter by company..."
                    value={filters.company}
                    onChange={e => setFilters({...filters, company: e.target.value})}
                    className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Date Range - From */}
                <div>
                  <label className="block text-xs font-medium text-white/40 mb-1">From Date</label>
                  <input
                    type="date"
                    value={filters.dateRange.from}
                    onChange={e => setFilters({...filters, dateRange: {...filters.dateRange, from: e.target.value}})}
                    className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Date Range - To */}
                <div>
                  <label className="block text-xs font-medium text-white/40 mb-1">To Date</label>
                  <input
                    type="date"
                    value={filters.dateRange.to}
                    onChange={e => setFilters({...filters, dateRange: {...filters.dateRange, to: e.target.value}})}
                    className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Salary Range */}
                <div>
                  <label className="block text-xs font-medium text-white/40 mb-1">Min Salary</label>
                  <input
                    type="number"
                    placeholder="Min salary"
                    value={filters.minSalary}
                    onChange={e => setFilters({...filters, minSalary: e.target.value})}
                    className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Max Salary */}
                <div>
                  <label className="block text-xs font-medium text-white/40 mb-1">Max Salary</label>
                  <input
                    type="number"
                    placeholder="Max salary"
                    value={filters.maxSalary}
                    onChange={e => setFilters({...filters, maxSalary: e.target.value})}
                    className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Checkboxes */}
                <div className="flex flex-col gap-2 pt-6">
                  <label className="flex items-center gap-2 text-sm text-white/60 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.hasDeadline}
                      onChange={e => setFilters({...filters, hasDeadline: e.target.checked})}
                      className="w-4 h-4 bg-white/10 border border-white/10 rounded focus:ring-2 focus:ring-indigo-500"
                    />
                    Has Deadline
                  </label>
                  <label className="flex items-center gap-2 text-sm text-white/60 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.hasFollowUp}
                      onChange={e => setFilters({...filters, hasFollowUp: e.target.checked})}
                      className="w-4 h-4 bg-white/10 border border-white/10 rounded focus:ring-2 focus:ring-indigo-500"
                    />
                    Has Follow-up
                  </label>
                </div>
              </div>

              {/* Filter Actions */}
              <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-white/10">
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 text-sm text-white/60 hover:text-white transition"
                >
                  Reset All Filters
                </button>

                <button
                  onClick={() => setShowSaveFilter(true)}
                  className="px-4 py-2 text-sm text-indigo-400 hover:text-indigo-300 transition"
                >
                  💾 Save Current Filters
                </button>

                {showSaveFilter && (
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Filter name..."
                      value={filterName}
                      onChange={e => setFilterName(e.target.value)}
                      className="bg-white/10 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      onClick={saveCurrentFilters}
                      className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-xl hover:bg-indigo-500 transition"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setShowSaveFilter(false)}
                      className="px-4 py-2 text-white/40 hover:text-white text-sm transition"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sorting */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-3"
        >
          <span className="text-xs text-white/40">Sort by:</span>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {SORT_OPTIONS.map(option => (
              <option key={option.value} value={option.value} className="bg-slate-800 text-white">
                {option.label}
              </option>
            ))}
          </select>
          {filteredJobs.length > 0 && (
            <span className="text-xs text-white/30 ml-auto">
              Showing {filteredJobs.length} of {jobs.length} applications
            </span>
          )}
        </motion.div>

        {/* Jobs Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden"
        >
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white/40 text-sm">Loading your applications...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-5xl mb-4">📭</div>
              <p className="text-white/40 text-sm">
                {hasActiveFilters() ? 'No jobs match your filters.' : 'No applications yet.'}
              </p>
              {hasActiveFilters() ? (
                <button
                  onClick={resetFilters}
                  className="mt-4 text-indigo-400 hover:text-indigo-300 text-sm transition"
                >
                  Clear all filters →
                </button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowModal(true)}
                  className="mt-4 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition shadow-lg shadow-indigo-900/50"
                >
                  Add Your First Job →
                </motion.button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="border-b border-white/10">
                  <tr className="text-left text-xs text-white/40 uppercase tracking-wider">
                    <th className="px-4 py-3 font-medium whitespace-nowrap">Company</th>
                    <th className="px-4 py-3 font-medium whitespace-nowrap">Role</th>
                    <th className="px-4 py-3 font-medium whitespace-nowrap">Status</th>
                    <th className="px-4 py-3 font-medium whitespace-nowrap hidden lg:table-cell">Priority</th>
                    <th className="px-4 py-3 font-medium whitespace-nowrap hidden md:table-cell">Date</th>
                    <th className="px-4 py-3 font-medium whitespace-nowrap hidden lg:table-cell">Salary</th>
                    <th className="px-4 py-3 font-medium whitespace-nowrap text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <AnimatePresence>
                    {filteredJobs.map((job) => (
                      <JobRow
                        key={job._id}
                        job={job}
                        onUpdate={handleUpdateJob}  
                        onDelete={handleDeleteJob}  
                      />
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>

      {/* Add Job Modal */}
      <AnimatePresence>
        {showModal && (
          <AddJobModal
            onClose={() => setShowModal(false)}
            onAdd={handleAddJob} 
          />
        )}
      </AnimatePresence>
    </Layout>
  );
}