import React from 'react';
import { ArrowLeft, FileText, Mail, ShieldAlert, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/Button';

interface TermsOfServiceViewProps {
  onBack: () => void;
}

export const TermsOfServiceView: React.FC<TermsOfServiceViewProps> = ({ onBack }) => {
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
              <FileText className="w-5 h-5 text-[#8B5E3C]" />
              Terms of Service & Shield
            </h1>
            <p className="text-xs text-[#766A63] mt-0.5">
              Effective Date: November 2, 2026 • PupLume User Agreement
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="bg-white rounded-3xl border border-[#E8DDD3] p-6 sm:p-8 shadow-xs space-y-8 text-sm text-[#5F3E29] leading-relaxed">
        <div>
          <p className="text-base font-medium text-[#2C211B]">
            Welcome to PupLume (&quot;PupLume,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). These Terms of Service (&quot;Terms&quot;) govern your access to and use of our application, AI tools, routine tracker, puppy vault, and premium passes. By creating an account or using PupLume, you agree to these Terms.
          </p>
        </div>

        {/* 1. Acceptance & Age Requirements */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-[#2C211B] flex items-center gap-2 border-b border-[#F3E7DA] pb-2">
            1. Acceptance & Eligibility
          </h2>
          <p>
            You must be at least 13 years of age to register an account with PupLume. If you are under 18 years of age, you represent that you have the permission and supervision of a parent or legal guardian to use the Service and complete purchases.
          </p>
        </section>

        {/* 2. Veterinary & Medical Emergency Disclaimer */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-[#2C211B] flex items-center gap-2 border-b border-[#F3E7DA] pb-2 text-[#8B5E3C]">
            <ShieldAlert className="w-4 h-4" />
            2. Veterinary & Emergency Shield (Important)
          </h2>
          <div className="bg-[#FFF9F2] border-l-4 border-[#8B5E3C] p-4 rounded-r-xl space-y-2">
            <p className="font-bold text-[#8B5E3C] text-xs uppercase tracking-wider">
              Routine Tracking & Coaching Only
            </p>
            <p className="text-xs sm:text-sm text-[#2C211B] leading-relaxed">
              <strong>PupLume and its AI features are NOT licensed veterinarians, certified clinics, or emergency hospitals.</strong> Our suggestions, potty regression analysis, and feeding guides are for general habit tracking and informational guidance only.
            </p>
          </div>
          <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-xs sm:text-sm text-red-900 leading-relaxed">
            <strong>EMERGENCY NOTICE:</strong> If your puppy ingested toxic substances (chocolate, toxic plants, human pills), is choking, has physical trauma, or is in distress, <strong>DO NOT wait for AI chat or app replies</strong>. Call ASPCA Animal Poison Control (888-426-4435 in the US) or your nearest emergency veterinary hospital immediately.
          </div>
        </section>

        {/* 3. Your Data Ownership */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-[#2C211B] flex items-center gap-2 border-b border-[#F3E7DA] pb-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            3. Your Data & Content Ownership
          </h2>
          <p>
            <strong>You own all your puppy data.</strong> All photos, puppy journal memories, vaccination documents, weights, and daily logs you save belong exclusively to you.
          </p>
          <p>
            You grant PupLume only the limited license required to host, process, and display your data so that you and your shared family co-parents can view it across your devices. We never sell your personal information or pet photos.
          </p>
        </section>

        {/* 4. DMCA & Stolen Photo Shield */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-[#2C211B] flex items-center gap-2 border-b border-[#F3E7DA] pb-2">
            <ShieldCheck className="w-4 h-4 text-[#8B5E3C]" />
            4. DMCA Copyright & Photo Notice
          </h2>
          <p>
            We respect copyright laws. If you believe any photo or content uploaded to PupLume infringes your copyright, email our designated agent at <a href="mailto:support@puplume.pet" className="text-[#8B5E3C] underline font-semibold">support@puplume.pet</a> with details. We will expeditiously review and remove the infringing content. Users who upload unauthorized copyrighted material may be terminated.
          </p>
        </section>

        {/* 5. Billing & Merchant of Record */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-[#2C211B] flex items-center gap-2 border-b border-[#F3E7DA] pb-2">
            5. Payments & Merchant of Record (Paddle)
          </h2>
          <p>
            All premium purchases and subscriptions are processed by our authorized Merchant of Record, <strong>Paddle</strong> (Paddle.com Market Ltd). Paddle manages payment execution, checkout security (PCI-DSS Level 1), billing receipts, and local sales tax/VAT collection.
          </p>
          <p>
            If you subscribe to a recurring plan, it automatically renews until you cancel. You can cancel at any time directly in your account settings or via the link on your Paddle receipt.
          </p>
        </section>

        {/* 6. Refund Policy */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-[#2C211B] flex items-center gap-2 border-b border-[#F3E7DA] pb-2">
            6. Refund Policy & 14-Day Exceptions
          </h2>
          <p>
            Because digital software and AI capabilities are delivered immediately upon checkout, purchases are generally non-refundable. However, we provide <strong>14-day compassionate exceptions</strong>:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
            <li><strong>Hardship / Pet Loss:</strong> If you face the heartbreaking loss or necessary re-homing of your puppy within 14 days of purchase.</li>
            <li><strong>Unresolved Bug:</strong> If a verified technical error completely prevents you from using the app and our engineering team cannot fix it within 72 hours.</li>
            <li><strong>Duplicate Charges:</strong> Any accidental double transaction will be refunded immediately.</li>
          </ul>
          <p className="text-xs">
            To submit a request, email <a href="mailto:support@puplume.pet" className="text-[#8B5E3C] underline font-semibold">support@puplume.pet</a> with your checkout email and Paddle Order ID.
          </p>
        </section>

        {/* 7. Warranty Disclaimer */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-[#2C211B] flex items-center gap-2 border-b border-[#F3E7DA] pb-2">
            7. Warranty Disclaimer (&quot;AS-IS&quot;)
          </h2>
          <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-2xl text-xs sm:text-sm text-zinc-700 uppercase leading-relaxed">
            THE SERVICE IS PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR ACCURACY OF AI GENERATED RESPONSES.
          </div>
        </section>

        {/* 8. Limitation of Liability */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-[#2C211B] flex items-center gap-2 border-b border-[#F3E7DA] pb-2">
            8. Limitation of Liability (Money Cap)
          </h2>
          <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-2xl text-xs sm:text-sm text-zinc-700 uppercase leading-relaxed">
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL PUPLUME OR ITS FOUNDERS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES. OUR TOTAL AGGREGATE LIABILITY FOR ANY CLAIM ARISING OUT OF OR RELATING TO THE SERVICE SHALL BE STRICTLY LIMITED TO THE AMOUNT PAID BY YOU TO PUPLUME IN THE PRECEDING TWELVE (12) MONTHS, OR $50.00 USD, WHICHEVER IS GREATER.
          </div>
        </section>

        {/* 9. Dispute Resolution & Class Action Waiver */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-[#2C211B] flex items-center gap-2 border-b border-[#F3E7DA] pb-2 text-[#8B5E3C]">
            <AlertTriangle className="w-4 h-4" />
            9. Binding Arbitration & Class Action Waiver
          </h2>
          <div className="bg-[#FFF9F2] border border-[#E8DDD3] p-4 rounded-2xl text-xs sm:text-sm text-zinc-800 space-y-2">
            <p>
              <strong>Informal Negotiation First:</strong> You and PupLume agree to attempt to resolve any dispute informally by contacting <a href="mailto:support@puplume.pet" className="text-[#8B5E3C] underline font-semibold">support@puplume.pet</a> for 30 days before taking any formal action.
            </p>
            <p className="font-bold uppercase text-zinc-900">
              NO CLASS ACTIONS: ALL DISPUTES SHALL BE RESOLVED EXCLUSIVELY ON AN INDIVIDUAL BASIS THROUGH BINDING ARBITRATION. YOU EXPRESSLY WAIVE ANY RIGHT TO COMMENCE OR PARTICIPATE IN ANY CLASS ACTION, GROUP ACTION, OR REPRESENTATIVE LAWSUIT AGAINST PUPLUME.
            </p>
          </div>
        </section>

        {/* 10. Contact */}
        <section className="space-y-3 pt-2">
          <h2 className="text-base font-bold text-[#2C211B] flex items-center gap-2 border-b border-[#F3E7DA] pb-2">
            10. Contact Us
          </h2>
          <p>
            If you have questions regarding these Terms or need assistance with your account, please reach out to:
          </p>
          <div className="bg-[#FFF9F2] p-4 rounded-2xl border border-[#E8DDD3] flex items-center gap-3">
            <Mail className="w-5 h-5 text-[#8B5E3C]" />
            <div>
              <p className="font-bold text-[#2C211B]">PupLume Support</p>
              <a href="mailto:support@puplume.pet" className="text-xs sm:text-sm text-[#8B5E3C] hover:underline font-semibold">
                support@puplume.pet
              </a>
            </div>
          </div>
        </section>

        <div className="pt-4 border-t border-[#F3E7DA] flex justify-end">
          <Button onClick={onBack} variant="outline" className="border-[#E8DDD3] text-[#5F3E29]">
            Back to App
          </Button>
        </div>
      </div>
    </div>
  );
};
