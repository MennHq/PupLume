import React, { useState, useMemo } from 'react';
import { Search, ArrowRight, X } from 'lucide-react';
import { Modal } from './Modal';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate
}) => {
  const [query, setQuery] = useState('');

  const searchResults = useMemo(() => {
    if (!query.trim() || query.length < 1) return null;
    const q = query.toLowerCase();

    const pages = [
      { id: 'nav-home', title: 'Home Dashboard', subtitle: 'Overview & Today\'s Schedule', type: 'Page', icon: <Search className="w-4 h-4 text-[#8B5E3C]" />, targetView: 'home' },
      { id: 'nav-plan', title: 'Plan / Tasks', subtitle: 'Manage your daily routine', type: 'Page', icon: <Search className="w-4 h-4 text-[#8B5E3C]" />, targetView: 'tasks' },
      { id: 'nav-ai', title: 'Ask AI', subtitle: 'AI Puppy Assistant', type: 'Page', icon: <Search className="w-4 h-4 text-[#8B5E3C]" />, targetView: 'ai' },
      { id: 'nav-academy', title: 'Training Academy', subtitle: 'Lessons & Drills', type: 'Page', icon: <Search className="w-4 h-4 text-[#8B5E3C]" />, targetView: 'academy' },
      { id: 'nav-health', title: 'Health Center', subtitle: 'Vaccines & Appointments', type: 'Page', icon: <Search className="w-4 h-4 text-[#8B5E3C]" />, targetView: 'health' },
      { id: 'nav-expenses', title: 'Expenses', subtitle: 'Budget & Cost tracking', type: 'Page', icon: <Search className="w-4 h-4 text-[#8B5E3C]" />, targetView: 'expenses' },
      { id: 'nav-docs', title: 'Document Vault', subtitle: 'Files & Records', type: 'Page', icon: <Search className="w-4 h-4 text-[#8B5E3C]" />, targetView: 'vault' },
      { id: 'nav-potty', title: 'Potty & Activity Log', subtitle: 'Track bathroom habits', type: 'Page', icon: <Search className="w-4 h-4 text-[#8B5E3C]" />, targetView: 'potty' },
      { id: 'nav-profile', title: 'Puppy Profile', subtitle: 'Edit dog details', type: 'Page', icon: <Search className="w-4 h-4 text-[#8B5E3C]" />, targetView: 'puppy' },
      { id: 'nav-social', title: 'Socialization & Grooming', subtitle: 'Social checklists', type: 'Page', icon: <Search className="w-4 h-4 text-[#8B5E3C]" />, targetView: 'socialization' },
      { id: 'nav-settings', title: 'Settings', subtitle: 'App preferences', type: 'Page', icon: <Search className="w-4 h-4 text-[#8B5E3C]" />, targetView: 'settings' },
      { id: 'nav-more', title: 'More Menu', subtitle: 'All other features', type: 'Page', icon: <Search className="w-4 h-4 text-[#8B5E3C]" />, targetView: 'more' },
    ];

    return pages.filter(p => 
      p.title.toLowerCase().includes(q) || 
      p.subtitle.toLowerCase().includes(q) ||
      p.targetView.toLowerCase().includes(q)
    );
  }, [query]);

  const handleSelect = (view: string) => {
    onNavigate(view);
    onClose();
    setQuery('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Global Search" maxWidth="lg">
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#766A63] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages (Home, Plan, Ask AI, Academy...)"
            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-sm text-[#2C211B] focus:outline-none focus:border-[#8B5E3C] focus:bg-white"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#766A63] hover:text-[#2C211B]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Suggested Quick Searches */}
        {!query && (
          <div className="space-y-2 py-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#766A63]">
              Popular Pages
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                'Home',
                'Plan',
                'Ask AI',
                'Academy',
                'Health Center',
                'Expenses'
              ].map((s) => (
                <button
                  key={s}
                  onClick={() => setQuery(s)}
                  className="px-2.5 py-1 rounded-lg bg-[#F3E7DA] hover:bg-[#E8DDD3] text-xs text-[#5F3E29] font-medium transition-colors cursor-pointer"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results List */}
        {searchResults && (
          <div className="space-y-2 max-h-[50vh] overflow-y-auto">
            {searchResults.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#766A63]">
                No records found matching "{query}".
              </div>
            ) : (
              searchResults.map((item) => (
                <div
                  key={`${item.type}-${item.id}`}
                  onClick={() => handleSelect(item.targetView)}
                  className="p-3 rounded-xl border border-[#E8DDD3] bg-white hover:bg-[#FFF9F2] hover:border-[#8B5E3C]/40 transition-all flex items-center justify-between gap-3 cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-[#FFF9F2] border border-[#E8DDD3] flex-shrink-0">
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-[#2C211B] truncate">{item.title}</h4>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-[#F3E7DA] text-[#5F3E29] font-semibold flex-shrink-0">
                          {item.type}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#766A63] truncate mt-0.5">{item.subtitle}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#766A63] group-hover:text-[#8B5E3C] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
