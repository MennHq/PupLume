import React, { useState } from 'react';
import { 
  Home, 
  CalendarCheck, 
  Sparkles, 
  GraduationCap, 
  Menu, 
  Search, 
  Bell, 
  Plus, 
  X, 
  ChevronDown,
  Dog,
  Activity,
  Droplet,
  DollarSign,
  Heart,
  Settings
} from 'lucide-react';
import { PupLumeLogo } from '../common/PupLumeLogo';
import { PuppyProfile } from '../../types';
import { storage } from '../../lib/storage';
import { QuickActionSheet } from '../ui/QuickActionSheet';
import { GlobalSearchModal } from '../ui/GlobalSearchModal';
import { NotificationCenterModal } from '../ui/NotificationCenterModal';
import { ClerkAuthControls } from '../auth/ClerkAuthControls';
import { PWAInstallButton } from '../pwa/PWAInstallButton';
import { OfflineIndicator } from '../pwa/OfflineIndicator';

interface AppLayoutProps {
  currentView: string;
  onNavigate: (view: string) => void;
  puppy: PuppyProfile;
  children: React.ReactNode;
  onSelectLesson?: (lessonId: string) => void;
  onOpenNewPuppyWizard?: () => void;
  isNotificationsOpen?: boolean;
  onOpenNotifications?: () => void;
  onCloseNotifications?: () => void;
  isSearchOpen?: boolean;
  onOpenSearch?: () => void;
  onCloseSearch?: () => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentView,
  onNavigate,
  puppy,
  children,
  onSelectLesson,
  onOpenNewPuppyWizard,
  isNotificationsOpen: propIsNotificationsOpen,
  onOpenNotifications: propOnOpenNotifications,
  onCloseNotifications: propOnCloseNotifications,
  isSearchOpen: propIsSearchOpen,
  onOpenSearch: propOnOpenSearch,
  onCloseSearch: propOnCloseSearch,
}) => {
  const [internalSearchOpen, setInternalSearchOpen] = useState(false);
  const [internalNotifsOpen, setInternalNotifsOpen] = useState(false);
  const [isPuppyDropdownOpen, setIsPuppyDropdownOpen] = useState(false);
  const puppyDropdownRef = React.useRef<HTMLDivElement>(null);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState(() => 
    storage.getNotifications().filter(n => !n.read).length
  );

  const isSearchOpen = propIsSearchOpen !== undefined ? propIsSearchOpen : internalSearchOpen;
  const isNotificationsOpen = propIsNotificationsOpen !== undefined ? propIsNotificationsOpen : internalNotifsOpen;

  const handleOpenSearch = () => {
    if (propOnOpenSearch) propOnOpenSearch();
    else setInternalSearchOpen(true);
  };

  const handleCloseSearch = () => {
    if (propOnCloseSearch) propOnCloseSearch();
    else setInternalSearchOpen(false);
  };

  const handleOpenNotifications = () => {
    if (propOnOpenNotifications) propOnOpenNotifications();
    else setInternalNotifsOpen(true);
  };

  const handleCloseNotifications = () => {
    if (propOnCloseNotifications) propOnCloseNotifications();
    else setInternalNotifsOpen(false);
    setUnreadNotifsCount(storage.getNotifications().filter(n => !n.read).length);
  };

  // Close puppy dropdown when clicking outside or pressing Escape
  React.useEffect(() => {
    if (!isPuppyDropdownOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        puppyDropdownRef.current &&
        !puppyDropdownRef.current.contains(event.target as Node)
      ) {
        setIsPuppyDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsPuppyDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPuppyDropdownOpen]);

  React.useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const isSearchShortcut = 
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') || 
        ((e.ctrlKey || e.metaKey) && e.key === ' '); // Ctrl+Space

      if (isSearchShortcut) {
        e.preventDefault();
        e.stopPropagation();
        handleOpenSearch();
      }
    };
    
    // Use capture phase to catch before other elements
    window.addEventListener('keydown', handleGlobalKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleGlobalKeyDown, { capture: true });
  }, []);

  const navItems = [
    { id: 'home', label: 'Home', icon: <Home className="w-5 h-5" /> },
    { id: 'tasks', label: 'Plan', icon: <CalendarCheck className="w-5 h-5" /> },
    { id: 'ai', label: 'Ask AI', icon: <Sparkles className="w-5 h-5" />, special: true },
    { id: 'academy', label: 'Academy', icon: <GraduationCap className="w-5 h-5" /> },
    { id: 'more', label: 'More', icon: <Menu className="w-5 h-5" /> }
  ];

  const rawPuppies = storage.getPuppies().length > 0 ? storage.getPuppies() : [puppy];
  // Deduplicate puppies in header dropdown by unique name
  const allPuppies = rawPuppies.filter((p, index, self) => {
    const nameKey = (p.name || '').trim().toLowerCase();
    return index === self.findIndex((o) => (
      o.id === p.id || (nameKey && (o.name || '').trim().toLowerCase() === nameKey)
    ));
  });

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#FFF9F2] text-[#2C211B] flex flex-col font-sans">
      {/* Offline Status Alert */}
      <OfflineIndicator />

      
      {/* Desktop & Tablet Top Navigation */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-[#E8DDD3] px-3 sm:px-8 py-2.5 sm:py-3 w-full max-w-full overflow-hidden">
        <div className="max-w-6xl mx-auto w-full flex items-center justify-between gap-2">
          {/* Logo & Puppy Switcher */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <div onClick={() => onNavigate('home')} className="cursor-pointer shrink-0">
              <div className="sm:hidden flex items-center">
                <PupLumeLogo variant="full" size="sm" />
              </div>
              <div className="hidden sm:flex items-center">
                <PupLumeLogo variant="full" size="md" />
              </div>
            </div>

            <div className="hidden sm:block h-6 w-px bg-[#E8DDD3]" />

            {/* Puppy Picker */}
            <div className="relative shrink-0" ref={puppyDropdownRef}>
              <button
                onClick={() => setIsPuppyDropdownOpen(!isPuppyDropdownOpen)}
                className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-2xl border border-[#E8DDD3] bg-[#FFF9F2] hover:bg-[#F3E7DA] transition-colors cursor-pointer"
              >
                <img
                  src={puppy.photoUrl}
                  alt={puppy.name}
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-xl object-cover border border-[#8B5E3C] shrink-0"
                />
                <span className="text-xs font-bold text-[#2C211B] truncate max-w-[65px] sm:max-w-none">{puppy.name}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-[#766A63] transition-transform duration-200 shrink-0 ${isPuppyDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isPuppyDropdownOpen && (
                <div className="absolute left-0 mt-2 w-60 bg-white rounded-2xl border border-[#E8DDD3] shadow-[0_10px_38px_rgba(0,0,0,0.12)] py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#766A63]">
                    Your Puppies
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {allPuppies.map((p) => {
                      const isSelected = p.id === puppy.id;
                      return (
                        <div
                          key={p.id}
                          onClick={() => {
                            setIsPuppyDropdownOpen(false);
                            if (!isSelected) {
                              storage.setActivePuppyId(p.id);
                            }
                          }}
                          className={`flex items-center gap-2.5 px-3 py-2 hover:bg-[#FFF9F2] cursor-pointer transition-colors ${
                            isSelected ? 'bg-[#FFF9F2]/80 font-bold' : ''
                          }`}
                        >
                          <img
                            src={p.photoUrl}
                            alt={p.name}
                            className={`w-8 h-8 rounded-xl object-cover border ${
                              isSelected ? 'border-[#8B5E3C]' : 'border-[#E8DDD3]'
                            }`}
                          />
                          <div className="min-w-0 flex-1">
                            <h5 className="text-xs font-bold text-[#2C211B] truncate">{p.name}</h5>
                            <p className="text-[10px] text-[#766A63] truncate">{p.breed}</p>
                          </div>
                          {isSelected && (
                            <span className="w-2 h-2 rounded-full bg-[#8B5E3C] shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t border-[#E8DDD3] my-1 pt-1">
                    <button
                      onClick={() => {
                        setIsPuppyDropdownOpen(false);
                        if (onOpenNewPuppyWizard) onOpenNewPuppyWizard();
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-[#8B5E3C] hover:bg-[#FFF9F2] flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <Plus className="w-4 h-4" /> Add Another Puppy
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#8B5E3C] text-white shadow-2xs'
                      : 'text-[#766A63] hover:text-[#2C211B] hover:bg-[#FFF9F2]'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={handleOpenSearch}
              className="hidden sm:flex p-2.5 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] hover:bg-[#F3E7DA] text-[#5F3E29] transition-colors cursor-pointer"
              title="Search (⌘K)"
            >
              <Search className="w-4 h-4" />
            </button>

            <button
              onClick={handleOpenNotifications}
              className="hidden sm:flex p-2.5 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] hover:bg-[#F3E7DA] text-[#5F3E29] transition-colors cursor-pointer relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#A45238] text-white text-[9px] font-bold flex items-center justify-center">
                  {unreadNotifsCount}
                </span>
              )}
            </button>

            {/* Settings Quick Access Button (Matches Search & Notifications styling) */}
            <button
              onClick={() => onNavigate('settings')}
              className={`hidden sm:flex p-2.5 rounded-xl border transition-all cursor-pointer group ${
                currentView === 'settings'
                  ? 'border-[#8B5E3C] bg-[#8B5E3C] text-white shadow-2xs'
                  : 'border-[#E8DDD3] bg-[#FFF9F2] hover:bg-[#F3E7DA] text-[#5F3E29]'
              }`}
              title="Settings & Preferences"
              aria-label="Settings"
            >
              <Settings className={`w-4 h-4 ${currentView === 'settings' ? 'rotate-45' : 'group-hover:rotate-45'} transition-transform duration-300`} />
            </button>

            {/* Subtle Divider */}
            <div className="h-5 w-px bg-[#E8DDD3] mx-1 hidden sm:block" />

            {/* Clerk Authentication Controls */}
            <div className="pl-0.5 shrink-0">
              <ClerkAuthControls />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-3 sm:px-8 pt-3 sm:pt-5 pb-28 md:pb-8">
        {children}
      </main>

      {/* Mobile Bottom Tab Bar (Uniform & Clean with iOS Safe Area) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-lg border-t border-[#E8DDD3]/70 shadow-[0_-4px_20px_rgba(0,0,0,0.04)] pb-[env(safe-area-inset-bottom,0px)]">
        <div className="grid grid-cols-5 h-[64px] max-w-md mx-auto items-center px-1">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-all duration-200 cursor-pointer ${
                  isActive ? 'text-[#8B5E3C] -translate-y-0.5' : 'text-[#A39B96] hover:text-[#8B5E3C]'
                }`}
              >
                <div className={`p-1.5 rounded-xl transition-all duration-200 mb-0.5 relative ${
                  isActive ? 'bg-[#FFF9F2] shadow-sm border border-[#E8DDD3]/60' : 'bg-transparent border border-transparent'
                }`}>
                  {/* Clone the icon to inject dynamic stroke width if needed, or just let CSS cascade handle it */}
                  {item.icon}
                  {item.special && !isActive && (
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#8B5E3C]" />
                  )}
                </div>
                <span className={`text-[9px] tracking-wide ${isActive ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Central Quick Logging FAB and Modal (Hidden on Ask AI view to prevent send button collision) */}
      {currentView !== 'ai' && (
        <QuickActionSheet
          onActionComplete={(msg) => {
            // Log complete notification
          }}
        />
      )}

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={handleCloseSearch}
        onNavigate={onNavigate}
      />

      {/* Notification Center Modal */}
      <NotificationCenterModal
        isOpen={isNotificationsOpen}
        onClose={handleCloseNotifications}
        onSelectAction={(url) => {
          const target = url ? url.replace(/^\/+/, '').split('?')[0] : '';
          if (target) {
            onNavigate(target === 'plan' ? 'tasks' : target);
          }
        }}
      />
    </div>
  );
};
