import React from 'react';
import { ShieldCheck, Lock, EyeOff, FileCheck, ArrowRight } from 'lucide-react';

interface PrivacyPageProps {
  setCurrentPage: (page: string) => void;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ setCurrentPage }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-semibold border border-emerald-300 dark:border-emerald-800">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Government Data Protection Compliance</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0B2545] dark:text-white">
          Privacy Policy & Data Protection
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          How NyaySahayak safeguards citizen privacy and upholds the Digital Personal Data Protection (DPDP) standards.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 sm:p-10 shadow-sm space-y-8">
        
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <EyeOff className="w-5 h-5 text-orange-500" />
            <span>1. Anonymous Citizen Access</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Citizens can interact with NyaySahayak freely without requiring mandatory personal registration, Aadhaar linking, or submission of personally identifiable information (PII). Inquiries are processed with temporary, isolated session identifiers.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Lock className="w-5 h-5 text-blue-500" />
            <span>2. No Storage of Confidential Legal Case Records</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            NyaySahayak is designed solely for public legal awareness and information retrieval. Users are advised never to transmit confidential witness statements, private case documents, or sensitive personal data into the chat interface.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <FileCheck className="w-5 h-5 text-emerald-500" />
            <span>3. Zero-Cloud Local Processing Capability</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            When operating in Zero-Cloud RAG Mode, your queries are processed locally within sovereign server infrastructure, ensuring that no conversation data is transmitted to commercial third-party cloud servers without authorization.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-purple-500" />
            <span>4. Feedback & Quality Auditing</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Citizen feedback ratings and optional comments are collected anonymously solely to evaluate model accuracy, identify knowledge gaps, and improve judicial information delivery for the public good.
          </p>
        </div>

      </div>

      <div className="text-center">
        <button
          onClick={() => setCurrentPage('chat')}
          className="px-6 py-3 rounded-xl bg-[#0B2545] hover:bg-[#133E6D] text-white font-semibold text-xs sm:text-sm shadow-md transition-all inline-flex items-center space-x-2"
        >
          <span>Return to Chat Assistant</span>
          <ArrowRight className="w-4 h-4 text-orange-400" />
        </button>
      </div>

    </div>
  );
};
