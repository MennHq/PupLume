import React from 'react';
import { 
  Sparkles, 
  CheckCircle2, 

  GraduationCap, 
  Activity, 
  DollarSign, 
  Users, 
  Smartphone, 
  ArrowRight, 
  ChevronRight, 
  Star, 
  ShieldCheck, 
  Clock, 

} from 'lucide-react';
import { PupLumeLogo } from '../components/common/PupLumeLogo';
import { Button } from '../components/ui/Button';
import { PWAInstallButton } from '../components/pwa/PWAInstallButton';

interface MarketingLandingProps {
  onGetStarted: () => void;
  onSignIn: () => void;
  onExploreDemo: () => void;
}

export const MarketingLanding: React.FC<MarketingLandingProps> = ({
  onGetStarted,
  onSignIn,
  onExploreDemo
}) => {

  return (
    <div className="min-h-screen bg-[#FFF9F2] text-[#2C211B]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#FFF9F2]/90 backdrop-blur-md border-b border-[#E8DDD3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <PupLumeLogo variant="full" size="md" />

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#766A63]">
            <a href="#features" className="hover:text-[#2C211B] transition-colors">Features</a>
            <a href="#training" className="hover:text-[#2C211B] transition-colors">Academy</a>
            <a href="#ai" className="hover:text-[#2C211B] transition-colors">AI Co-Pilot</a>
            <a href="#pricing" className="hover:text-[#2C211B] transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-[#2C211B] transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-2.5">
            <PWAInstallButton variant="outline" className="hidden sm:flex" />

            <button
              id="marketing-login-btn"
              onClick={onSignIn}
              className="text-xs sm:text-sm font-semibold text-[#5F3E29] hover:text-[#2C211B] px-3 py-2 cursor-pointer transition-colors"
            >
              Sign In
            </button>
            <Button
              id="marketing-get-started-header"
              variant="primary"
              size="sm"
              onClick={onGetStarted}
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          {/* Tag badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F3E7DA] text-[#5F3E29] text-xs font-semibold mb-6 border border-[#E8DDD3]">
            <Sparkles className="w-3.5 h-3.5 text-[#8B5E3C]" />
            <span>Next-Gen Puppy Development Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-[#2C211B] tracking-tight leading-[1.1] mb-6">
            Raise your puppy with a little less guesswork.
          </h1>

          <p className="text-lg sm:text-xl text-[#766A63] max-w-3xl mx-auto mb-10 leading-relaxed">
            PupLume brings training routines, smart potty predictions, health records, reminders, expenses, and AI veterinary-informed guidance into one simple, mobile-first puppy manager.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-14">
            <Button
              id="hero-cta-get-started"
              variant="primary"
              size="lg"
              onClick={onGetStarted}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="w-full sm:w-auto shadow-md"
            >
              Get Started with Max
            </Button>
            <Button
              id="hero-cta-demo"
              variant="outline"
              size="lg"
              onClick={onExploreDemo}
              className="w-full sm:w-auto"
            >
              See Live Puppy App
            </Button>
          </div>

          {/* Social Proof */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-[#766A63] pt-4 border-t border-[#E8DDD3]/60 max-w-xl mx-auto">
            <div className="flex items-center gap-1.5">
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                ))}
              </div>
              <span className="font-semibold text-[#2C211B]">Science-backed</span>
              <span>daily puppy care</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#8B5E3C]" />
              <span>Positive reinforcement certified</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Bento Grid */}
      <section id="features" className="py-16 sm:py-24 bg-white border-y border-[#E8DDD3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#8B5E3C] mb-2">
              All-In-One Puppy Life Manager
            </h2>
            <h3 className="text-2xl sm:text-4xl font-extrabold text-[#2C211B] tracking-tight">
              Everything your puppy needs from 8 weeks to adulthood
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: AI Co-Pilot */}
            <div className="p-6 rounded-2xl bg-[#FFF9F2] border border-[#E8DDD3] flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#8B5E3C]/10 text-[#8B5E3C] flex items-center justify-center mb-4">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold text-[#2C211B] mb-2">AI Puppy Assistant</h4>
                <p className="text-sm text-[#766A63] leading-relaxed mb-4">
                  Context-aware intelligence that understands your puppy's exact age, breed, sleep patterns, and upcoming milestones. Proposes one-tap actions for calendar events, tasks, and potty breaks.
                </p>
              </div>
              <div className="text-xs font-semibold text-[#8B5E3C] flex items-center gap-1">
                Explore Assistant <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            {/* Card 2: Training Academy */}
            <div className="p-6 rounded-2xl bg-[#FFF9F2] border border-[#E8DDD3] flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#A8B59A]/20 text-[#5F3E29] flex items-center justify-center mb-4">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold text-[#2C211B] mb-2">Training Academy</h4>
                <p className="text-sm text-[#766A63] leading-relaxed mb-4">
                  Complete positive reinforcement curriculum spanning Foundation, House Training, Shark Teething, Crate Independence, Loose Leash, and 12 critical socialization windows.
                </p>
              </div>
              <div className="text-xs font-semibold text-[#8B5E3C] flex items-center gap-1">
                View Curriculum <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            {/* Card 3: Health Vault */}
            <div className="p-6 rounded-2xl bg-[#FFF9F2] border border-[#E8DDD3] flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center mb-4">
                  <Activity className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold text-[#2C211B] mb-2">Health & Vet Vault</h4>
                <p className="text-sm text-[#766A63] leading-relaxed mb-4">
                  Never miss a DHPP booster or Rabies shot. Track monthly Heartgard chews, weight curves, clinic records, and microchip documents with 1-click export.
                </p>
              </div>
              <div className="text-xs font-semibold text-[#8B5E3C] flex items-center gap-1">
                Check Health Tools <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            {/* Card 4: Potty & Sleep AI Planner */}
            <div className="p-6 rounded-2xl bg-[#FFF9F2] border border-[#E8DDD3] flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-4">
                  <Clock className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold text-[#2C211B] mb-2">Potty & Sleep Predictor</h4>
                <p className="text-sm text-[#766A63] leading-relaxed mb-4">
                  Calculates predicted potty windows based on feeding times and wake cycles to eliminate indoor accidents before they occur.
                </p>
              </div>
            </div>

            {/* Card 5: Expense & Receipt Scanner */}
            <div className="p-6 rounded-2xl bg-[#FFF9F2] border border-[#E8DDD3] flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#F3E7DA] text-[#5F3E29] flex items-center justify-center mb-4">
                  <DollarSign className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold text-[#2C211B] mb-2">Puppy Budget & Expenses</h4>
                <p className="text-sm text-[#766A63] leading-relaxed mb-4">
                  Track vet invoices, food delivery, chew toys, and pet insurance with receipt extraction, monthly analytics, and CSV export.
                </p>
              </div>
            </div>

            {/* Card 6: Family & PWA */}
            <div className="p-6 rounded-2xl bg-[#FFF9F2] border border-[#E8DDD3] flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center mb-4">
                  <Users className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold text-[#2C211B] mb-2">Family & Caregiver Sync</h4>
                <p className="text-sm text-[#766A63] leading-relaxed mb-4">
                  Invite partners, kids, or dog walkers with role permissions. Works offline anywhere with our standalone Progressive Web App.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 sm:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#8B5E3C]/10 text-[#8B5E3C] font-bold text-xs border border-[#8B5E3C]/20 mb-3">
              <span>🔥 Limited-Time Launch Offer</span>
            </div>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-[#2C211B] tracking-tight">
              One Honest Price. Lifetime Care.
            </h3>
            <p className="text-sm sm:text-base text-[#766A63] mt-2">
              Limited introductory offer: pay once and get full lifetime access for your puppy. Never pay a monthly subscription.
            </p>
          </div>

          <div className="max-w-md mx-auto bg-gradient-to-br from-[#FFF9F2] to-white rounded-3xl border-2 border-[#8B5E3C] shadow-xl overflow-hidden p-8 sm:p-10 text-center relative">
            <div className="inline-block px-3.5 py-1 rounded-full bg-[#8B5E3C] text-white text-xs font-bold uppercase tracking-wider mb-5">
              Limited Offer • $24.99 One-Time
            </div>

            <div className="flex items-baseline justify-center gap-1.5 mb-2">
              <span className="text-5xl sm:text-6xl font-black text-[#2C211B]">$24.99</span>
              <span className="text-sm font-bold text-[#766A63]">USD</span>
            </div>

            <p className="text-xs font-semibold text-[#766A63] mb-6">
              One-time payment • Never pay monthly fees
            </p>

            <ul className="space-y-3 text-left mb-8 text-xs sm:text-sm text-[#2C211B]">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>Unlimited 24/7 AI Co-Pilot</strong> with instant advice</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Full 6-module Training Academy curriculum</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Predictive potty countdown &amp; routine tracking</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Complete medical, vaccine &amp; vet record vault</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Multi-caregiver family &amp; sitter sync</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Free future updates &amp; new features forever</span>
              </li>
            </ul>

            <Button 
              variant="primary" 
              size="lg" 
              onClick={onGetStarted} 
              className="w-full py-4 text-base font-bold shadow-md hover:shadow-lg active:scale-95"
            >
              <span>Claim Limited Offer — $24.99</span>
            </Button>

            <p className="text-[11px] text-[#766A63] mt-4 font-medium">
              🔒 14-Day Money-Back Guarantee • Zero Recurring Charges
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E8DDD3] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <PupLumeLogo variant="full" size="sm" />
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs font-bold text-[#766A63]">
            <a href="https://puplume.pet/legal/privacy" target="_blank" rel="noopener noreferrer" className="hover:text-[#8B5E3C] transition-colors">Privacy Policy</a>
            <a href="https://puplume.pet/legal/terms" target="_blank" rel="noopener noreferrer" className="hover:text-[#8B5E3C] transition-colors">Terms of Service</a>
            <a href="https://puplume.pet/legal/refund" target="_blank" rel="noopener noreferrer" className="hover:text-[#8B5E3C] transition-colors">Refund Policy</a>
            <a href="https://puplume.pet/legal/cookies" target="_blank" rel="noopener noreferrer" className="hover:text-[#8B5E3C] transition-colors">Cookies</a>
            <a href="mailto:support@puplume.pet" className="hover:text-[#8B5E3C] transition-colors">Support</a>
          </div>
          <p className="text-xs text-[#766A63] text-center sm:text-right">
            &copy; 2026 PupLume. All rights reserved. Positive reinforcement first.
          </p>
        </div>
      </footer>
    </div>
  );
};
