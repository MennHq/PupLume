import React, { useState, useRef, useEffect } from 'react';
import { 
  COMMUNICATION_PLATFORMS, 
  CommunicationPlatform, 
  detectPlatformFromInput, 
  getPlatformFaviconUrl,
  extractDomainFromUrl 
} from '../../lib/communicationPlatforms';
import { 
  Plus, 
  Trash2, 
  ChevronDown, 
  Search, 
  Globe, 
  Sparkles, 
  Check, 
  ExternalLink,
  MessageCircle,
  AlertCircle
} from 'lucide-react';
import { validateCommunicationLink } from '../../lib/validation';

export interface CommunicationLinkItem {
  id: string;
  platform: string;
  value: string;
  label?: string;
}

interface CommunicationLinksInputProps {
  links: CommunicationLinkItem[];
  onChange: (links: CommunicationLinkItem[]) => void;
  maxRecommended?: number;
}

export const CommunicationLinksInput: React.FC<CommunicationLinksInputProps> = ({
  links,
  onChange,
  maxRecommended = 3,
}) => {
  // Ensure at least 1 field exists initially (WhatsApp by default)
  useEffect(() => {
    if (!links || links.length === 0) {
      onChange([
        {
          id: `link-${Date.now()}`,
          platform: 'whatsapp',
          value: '',
        },
      ]);
    }
  }, [links, onChange]);

  const activeLinks = (links && links.length > 0) ? links : [
    { id: 'default-1', platform: 'whatsapp', value: '' }
  ];

  const handleUpdate = (id: string, updates: Partial<CommunicationLinkItem>) => {
    const updated = activeLinks.map((item) => {
      if (item.id === id) {
        const next = { ...item, ...updates };

        // Auto-detect platform if value changed and user didn't explicitly lock it
        if (updates.value !== undefined) {
          const detected = detectPlatformFromInput(updates.value);
          if (detected && detected !== item.platform) {
            next.platform = detected;
          }
        }
        return next;
      }
      return item;
    });
    onChange(updated);
  };

  const handleAddLink = () => {
    // Pick the next recommended platform not yet added
    const used = new Set(activeLinks.map((l) => l.platform));
    const nextPlatform = ['whatsapp', 'imessage', 'instagram', 'external', 'telegram', 'messenger', 'slack'].find(
      (p) => !used.has(p)
    ) || 'external';

    const newLink: CommunicationLinkItem = {
      id: `link-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      platform: nextPlatform,
      value: '',
    };
    onChange([...activeLinks, newLink]);
  };

  const handleRemoveLink = (id: string) => {
    if (activeLinks.length <= 1) {
      // Don't remove the last one, just clear its value
      onChange([{ ...activeLinks[0], value: '', platform: 'whatsapp' }]);
      return;
    }
    onChange(activeLinks.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-[#5F3E29] flex items-center gap-1.5 uppercase tracking-wider">
          <MessageCircle className="w-4 h-4 text-[#8B5E3C]" />
          Chat & Communication Links
        </label>
        
        {/* Recommendation badge */}
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/80 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-600" />
          Recommended: {activeLinks.length}/{maxRecommended} platforms
        </span>
      </div>

      <p className="text-[11px] text-[#766A63] leading-relaxed">
        Start with WhatsApp or paste any profile URL. The app icon auto-detects automatically from 100+ communication apps.
      </p>

      {/* Dynamic Link Inputs */}
      <div className="space-y-2.5">
        {activeLinks.map((link, idx) => (
          <PlatformLinkRow
            key={link.id}
            item={link}
            index={idx}
            canDelete={activeLinks.length > 1}
            onUpdate={(updates) => handleUpdate(link.id, updates)}
            onDelete={() => handleRemoveLink(link.id)}
          />
        ))}
      </div>

      {/* Add Button */}
      <div className="pt-1 flex items-center justify-between">
        <button
          type="button"
          onClick={handleAddLink}
          disabled={activeLinks.length >= 6}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-dashed border-[#8B5E3C]/40 bg-[#FFF9F2] hover:bg-[#F3E7DA] text-[#5F3E29] text-xs font-bold transition-all cursor-pointer shadow-2xs hover:border-[#8B5E3C]"
        >
          <Plus className="w-3.5 h-3.5 text-[#8B5E3C]" />
          <span>Add Another Link ({activeLinks.length}/{maxRecommended} recommended)</span>
        </button>

        {activeLinks.length >= maxRecommended && (
          <span className="text-[10px] text-[#8B5E3C] font-semibold">
            ✓ Top {activeLinks.length} platforms added
          </span>
        )}
      </div>
    </div>
  );
};

interface PlatformLinkRowProps {
  item: CommunicationLinkItem;
  index: number;
  canDelete: boolean;
  onUpdate: (updates: Partial<CommunicationLinkItem>) => void;
  onDelete: () => void;
}

const PlatformLinkRow: React.FC<PlatformLinkRowProps> = ({
  item,
  index,
  canDelete,
  onUpdate,
  onDelete,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentPlatform =
    COMMUNICATION_PLATFORMS.find((p) => p.id === item.platform) || COMMUNICATION_PLATFORMS[0];

  // Dynamic favicon
  const faviconUrl = getPlatformFaviconUrl(item.platform, item.value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  // Filter 100+ platforms by search query
  const filteredPlatforms = COMMUNICATION_PLATFORMS.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.domain && p.domain.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const linkValidation = validateCommunicationLink(item.platform, item.value);

  return (
    <div className="flex flex-col gap-1">
      <div className={`relative flex items-center gap-2 bg-white rounded-2xl border ${
        !linkValidation.isValid && item.value.trim()
          ? 'border-amber-400 bg-amber-50/20'
          : 'border-[#E8DDD3] hover:border-[#8B5E3C]/50 focus-within:border-[#8B5E3C]'
      } p-1.5 sm:p-2 shadow-2xs transition-colors`}>
      
      {/* Platform Selector Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[#FAF6F0] hover:bg-[#F3E7DA] text-xs font-bold text-[#2C211B] border border-[#E8DDD3] transition-colors cursor-pointer shrink-0"
          title="Change communication platform"
        >
          {/* Favicon / Icon */}
          <div className="w-5 h-5 rounded-md overflow-hidden bg-white flex items-center justify-center shrink-0 border border-neutral-200 shadow-2xs">
            <img
              src={faviconUrl}
              alt={currentPlatform.name}
              className="w-4 h-4 object-contain"
              onError={(e) => {
                // Fallback to Globe
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>

          <span className="hidden sm:inline truncate max-w-[110px]">
            {currentPlatform.name}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-[#766A63] shrink-0" />
        </button>

        {/* Dropdown Menu (100+ Communication Apps) */}
        {isDropdownOpen && (
          <div className="absolute top-full left-0 mt-1.5 w-72 sm:w-80 bg-white rounded-2xl border border-[#E8DDD3] shadow-xl z-50 p-2 text-xs text-[#2C211B] animate-in fade-in zoom-in-95 duration-150">
            {/* Search Input */}
            <div className="relative mb-2">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#766A63]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search 100+ communication apps..."
                className="w-full pl-8 pr-3 py-1.5 bg-[#FAF6F0] border border-[#E8DDD3] rounded-xl text-xs font-medium focus:outline-none focus:border-[#8B5E3C]"
                autoFocus
              />
            </div>

            {/* Platform List */}
            <div className="max-h-60 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
              {!searchQuery && (
                <div className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-[#8B5E3C] bg-[#FFF9F2] rounded-lg mb-1">
                  ⭐ Top Ranked & Most Used
                </div>
              )}

              {filteredPlatforms.map((p, idx) => {
                const isSelected = p.id === item.platform;
                const pFavicon = getPlatformFaviconUrl(p.id);

                return (
                  <React.Fragment key={p.id}>
                    {/* Visual divider after 4th (External URL) when not searching */}
                    {!searchQuery && idx === 4 && (
                      <div className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-[#766A63] bg-[#FAF6F0] rounded-lg mt-2 mb-1">
                        🌍 Global Messaging & Social Apps
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        onUpdate({ platform: p.id });
                        setIsDropdownOpen(false);
                        setSearchQuery('');
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl transition-colors text-left cursor-pointer ${
                        isSelected
                          ? 'bg-[#8B5E3C] text-white font-bold'
                          : 'hover:bg-[#FAF6F0] text-[#2C211B]'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <div className="w-5 h-5 rounded-md bg-white border border-neutral-200 flex items-center justify-center shrink-0">
                          <img
                            src={pFavicon}
                            alt=""
                            className="w-3.5 h-3.5 object-contain"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>
                        <span className="truncate">{p.name}</span>
                        {idx < 3 && !searchQuery && (
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
                          }`}>
                            Top {idx + 1}
                          </span>
                        )}
                        {idx === 3 && !searchQuery && (
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-neutral-200 text-neutral-700'
                          }`}>
                            4th
                          </span>
                        )}
                      </div>

                      {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                    </button>
                  </React.Fragment>
                );
              })}

              {filteredPlatforms.length === 0 && (
                <div className="p-4 text-center text-[#766A63]">
                  No app matched &quot;{searchQuery}&quot;. You can use <strong>External URL</strong> for any custom link!
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Value Input Field (with Auto-detection) */}
      <div className="flex-1 relative">
        <input
          type="text"
          value={item.value}
          onChange={(e) => onUpdate({ value: e.target.value })}
          placeholder={currentPlatform.placeholder}
          className="w-full px-3 py-1.5 bg-transparent text-xs sm:text-sm font-medium text-[#2C211B] placeholder-[#A69B93] focus:outline-none"
        />
      </div>

      {/* Delete / Clear Button */}
      {canDelete ? (
        <button
          type="button"
          onClick={onDelete}
          className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer shrink-0"
          title="Remove this link"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      ) : item.value ? (
        <button
          type="button"
          onClick={() => onUpdate({ value: '' })}
          className="text-[10px] font-bold text-neutral-400 hover:text-neutral-700 px-2 py-1 rounded-md hover:bg-neutral-100 transition-colors shrink-0"
        >
          Clear
        </button>
      ) : null}

      </div>
      {!linkValidation.isValid && item.value.trim() && (
        <span className="text-[10px] text-amber-800 font-medium px-2 flex items-center gap-1">
          <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
          {linkValidation.error}
        </span>
      )}
    </div>
  );
};
