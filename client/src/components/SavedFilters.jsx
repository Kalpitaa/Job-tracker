import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export default function SavedFilters({ filters, onLoad, onDelete }) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="text-xs text-white/40 hover:text-white transition px-3 py-1 bg-white/5 rounded-lg border border-white/10 flex items-center gap-1"
      >
        Saved Filters ({filters.length})
      </button>

      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-2 min-w-[200px] max-w-[300px] bg-slate-800/95 backdrop-blur-sm border border-white/10 rounded-xl shadow-2xl p-2 z-50"
          >
            {filters.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-white/30">
                No saved filters yet
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto">
                {filters.map((filter) => (
                  <div
                    key={filter.id}
                    className="flex items-center justify-between px-3 py-2 hover:bg-white/5 rounded-lg transition group"
                  >
                    <button
                      onClick={() => {
                        onLoad(filter);
                        setShowMenu(false);
                      }}
                      className="text-sm text-white/80 hover:text-white transition flex-1 text-left truncate"
                      title={filter.name}
                    >
                      {filter.name}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(filter.id);
                      }}
                      className="text-red-400 hover:text-red-300 transition opacity-0 group-hover:opacity-100 text-xs px-1"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}