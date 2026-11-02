import React from 'react';
import { ArrowLeft, Shield, Mail, ExternalLink, Heart } from 'lucide-react';
import { Button } from '../components/ui/Button';

interface PrivacyPolicyViewProps {
  onBack: () => void;
}

export const PrivacyPolicyView: React.FC<PrivacyPolicyViewProps> = ({ onBack }) => {
  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="bg-white rounded-3xl border border-[#E8DDD3] p-5 sm:p-6 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] hover:bg-[#F3E7DA] text-[#5F3E29] transition-colors cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#2C211B] tracking-tight flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#8B5E3C]" />
              Privacy Policy
            </h1>
            <p className="text-xs text-[#766A63] mt-0.5">
              Effective Date: November 2, 2026 • PupLume Data Transparency
            </p>
          </div>
        </div>
      </div>

      {/* Main Legal Content Container */}
      <div className="bg-white rounded-3xl border border-[#E8DDD3] p-6 sm:p-8 shadow-xs space-y-8 text-sm text-[#5F3E29] leading-relaxed">
        <div>
          <p className="text-base font-medium text-[#2C211B]">
            Welcome to PupLume (&quot;PupLume,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). PupLume provides a digital puppy care assistant, routine tracker, smart collar tag safety hub, and AI-guided puppy coaching service. This Privacy Policy explains what personal data we collect, why we collect it, how it is handled, and the third-party services we partner with.
          </p>
        </div>

        {/* 1. Information We Collect */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-[#2C211B] flex items-center gap-2 border-b border-[#F3E7DA] pb-2">
            1. Information We Collect
          </h2>
          <p>We collect information that you actively provide to us, as well as data gathered automatically when you use our service:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
            <li><strong>Account Data:</strong> Your name, email address, profile avatar, and authentication credentials (processed securely via Clerk).</li>
            <li><strong>Puppy Profiles:</strong> Puppy names, breeds, dates of birth, photos, gender, and weights.</li>
            <li><strong>Daily Activity Logs:</strong> Potty break records (time, pad/outdoor, notes), feeding logs, sleep/nap times, and completed training habits.</li>
            <li><strong>Pet Health &amp; Medical Records:</strong> Vaccine histories, clinic names, appointment reminders, and health notes you choose to log.</li>
            <li><strong>AI Chat Interactions:</strong> Questions, training queries, and prompts submitted to the PupLume AI Puppy Coach.</li>
            <li><strong>Payment &amp; Transaction Metadata:</strong> Order IDs, pass status, and billing confirmations. <em>PupLume does not collect or store raw credit card numbers; payment data is securely handled directly by our Merchant of Record, Paddle.</em></li>
            <li><strong>Device &amp; Telemetry Data:</strong> IP address, device type, browser settings, and operational telemetry collected automatically to maintain app reliability.</li>
          </ul>
        </section>

        {/* 2. How We Use Information */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-[#2C211B] flex items-center gap-2 border-b border-[#F3E7DA] pb-2">
            2. How We Use Your Information
          </h2>
          <p>Your data is strictly used to provide, maintain, and enhance the PupLume service:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
            <li>To generate personalized daily routines, age-appropriate potty countdowns, and feeding schedules.</li>
            <li>To power interactive AI coaching responses and custom training drills tailored to your puppy&apos;s age and breed.</li>
            <li>To display your puppy&apos;s public Smart QR Collar Tag safety webpage if you choose to activate it.</li>
            <li>To sync puppy progress seamlessly across household members and caregivers in real time.</li>
            <li>To monitor app health, diagnose bugs, and improve user experience.</li>
          </ul>
        </section>

        {/* 3. Third-Party Sub-Processors */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-[#2C211B] flex items-center gap-2 border-b border-[#F3E7DA] pb-2">
            3. Data Sharing and Third-Party Sub-Processors
          </h2>
          <p>
            <strong>We never sell, rent, or trade your personal data.</strong> To operate our application, we share necessary data with trusted third-party providers under strict data privacy agreements:
          </p>
          <div className="overflow-x-auto my-4 border border-[#E8DDD3] rounded-2xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#FFF9F2] border-b border-[#E8DDD3] text-[#2C211B] font-bold">
                <tr>
                  <th className="py-2.5 px-3">Provider</th>
                  <th className="py-2.5 px-3">Role &amp; Purpose</th>
                  <th className="py-2.5 px-3">Data Shared</th>
                  <th className="py-2.5 px-3">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3E7DA]">
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-[#2C211B]">Clerk (clerk.com)</td>
                  <td className="py-2.5 px-3">User Authentication &amp; Identity</td>
                  <td className="py-2.5 px-3">Name, email, session tokens</td>
                  <td className="py-2.5 px-3">USA</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-[#2C211B]">Convex (convex.dev)</td>
                  <td className="py-2.5 px-3">Cloud Database &amp; Realtime Sync</td>
                  <td className="py-2.5 px-3">Puppy profiles, routines, health logs, photos</td>
                  <td className="py-2.5 px-3">USA</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-[#2C211B]">Vercel (vercel.com)</td>
                  <td className="py-2.5 px-3">Cloud Hosting &amp; Serverless Infra</td>
                  <td className="py-2.5 px-3">IP address, request logs</td>
                  <td className="py-2.5 px-3">USA / Global</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-[#2C211B]">Google Gemini API</td>
                  <td className="py-2.5 px-3">AI Puppy Coach Model Inference</td>
                  <td className="py-2.5 px-3">Anonymized chat prompts &amp; puppy context</td>
                  <td className="py-2.5 px-3">USA</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-[#2C211B]">Paddle (paddle.com)</td>
                  <td className="py-2.5 px-3">Merchant of Record &amp; Payment Gateway</td>
                  <td className="py-2.5 px-3">Billing email, country, transaction records</td>
                  <td className="py-2.5 px-3">UK / Global</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-[#2C211B]">PostHog (posthog.com)</td>
                  <td className="py-2.5 px-3">Product Analytics &amp; Error Tracking</td>
                  <td className="py-2.5 px-3">Anonymized events, browser telemetry</td>
                  <td className="py-2.5 px-3">USA / EU</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 4. Veterinary Disclaimer */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-[#2C211B] flex items-center gap-2 border-b border-[#F3E7DA] pb-2">
            4. Special Veterinary &amp; Medical Disclaimer
          </h2>
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-amber-950 text-xs sm:text-sm leading-relaxed">
            <p>
              <strong>Important Notice:</strong> PupLume and its AI Puppy Coach provide educational insights, habit tracking, and puppy development suggestions. <strong>PupLume does not provide licensed veterinary medical diagnosis, medical advice, prescription, or emergency care.</strong> Always consult a qualified, licensed veterinarian for animal health emergencies, medical diagnostics, vaccinations, or dietary treatments.
            </p>
          </div>
        </section>

        {/* 5. Children's Privacy */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-[#2C211B] flex items-center gap-2 border-b border-[#F3E7DA] pb-2">
            5. Children&apos;s Privacy (COPPA &amp; Family Use)
          </h2>
          <p>
            PupLume is designed as a family-friendly puppy care assistant with wholesome content suitable for all ages (3+). However, to comply with the Children&apos;s Online Privacy Protection Act (COPPA) and international digital privacy standards:
          </p>
          <p>
            <strong>Accounts must be created and managed by an adult or parent/legal guardian aged 13 or older</strong> (and 18 or older to complete paid transactions via Paddle). We do not knowingly collect personal information directly from children under 13 without verifiable parental oversight. If you believe a child under 13 has registered without parental authorization, please notify us at <a href="mailto:support@puplume.pet" className="text-[#8B5E3C] underline font-bold">support@puplume.pet</a> for prompt removal.
          </p>
        </section>

        {/* 6. User Rights */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-[#2C211B] flex items-center gap-2 border-b border-[#F3E7DA] pb-2">
            6. Your Privacy Rights (US State Laws &amp; GDPR)
          </h2>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
            <li><strong>Right to Access &amp; Know:</strong> You may request a copy of all personal information we have recorded about you.</li>
            <li><strong>Right to Rectification:</strong> You can edit or correct puppy details and records directly within your profile settings at any time.</li>
            <li><strong>Right to Deletion:</strong> You can request permanent erasure of your account, puppy profiles, and health records.</li>
            <li><strong>Right to Opt-Out:</strong> You may opt out of non-essential analytics tracking or marketing emails.</li>
          </ul>
          <p>To exercise any of these rights, email us at <a href="mailto:support@puplume.pet" className="text-[#8B5E3C] underline font-bold">support@puplume.pet</a>. We respond to verified requests within 30 days without charge.</p>
        </section>

        {/* 7. Contact */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-[#2C211B] flex items-center gap-2 border-b border-[#F3E7DA] pb-2">
            7. Contact Us
          </h2>
          <p>If you have any questions or concerns regarding this Privacy Policy or data handling practices, please contact us:</p>
          <div className="bg-[#FFF9F2] p-4 rounded-2xl border border-[#E8DDD3] inline-block">
            <p className="font-bold text-[#2C211B] mb-1">PupLume Privacy Team</p>
            <p className="text-xs text-[#5F3E29]">Email: <a href="mailto:support@puplume.pet" className="text-[#8B5E3C] font-bold hover:underline">support@puplume.pet</a></p>
            <p className="text-xs text-[#5F3E29]">Web: <a href="https://puplume.pet" target="_blank" rel="noopener noreferrer" className="text-[#8B5E3C] font-bold hover:underline">https://puplume.pet</a></p>
          </div>
        </section>
      </div>
    </div>
  );
};