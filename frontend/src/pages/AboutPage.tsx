import React from 'react';
import { Scale, ShieldCheck, Target, Award, BookOpen, Layers, Cpu, Globe2, ArrowRight } from 'lucide-react';

interface AboutPageProps {
  setCurrentPage: (page: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ setCurrentPage }) => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Page Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-300 text-xs font-semibold border border-orange-300 dark:border-orange-800">
          <Award className="w-3.5 h-3.5 text-orange-600" />
          <span>Department of Justice Initiative</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#0B2545] dark:text-white tracking-tight">
          About NyaySahayak
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
          AI-Based Interactive Virtual Assistant for the Department of Justice, Ministry of Law & Justice, Government of India.
        </p>
      </div>

      {/* Project Mission Card */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 sm:p-10 shadow-sm space-y-6">
        <div className="flex items-center space-x-3 text-[#0B2545] dark:text-orange-400 font-bold text-xl">
          <Target className="w-7 h-7 text-orange-500" />
          <h2>Mission & Vision</h2>
        </div>
        <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
          India's legal ecosystem is vast and multi-layered. Citizens across rural and urban geographies often face substantial friction in accessing authoritative legal services, understanding their rights to free legal aid, tracking court cases via the eCourts system, or seeking legal advice through Tele-Law. 
        </p>
        <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
          <strong>NyaySahayak</strong> was conceived to solve this critical national challenge by deploying an intelligent conversational assistant that translates complex statutory language and government schemes into clear, context-aware answers in multiple Indian languages (English, Hindi, and Punjabi).
        </p>
      </div>

      {/* Constitutional & Statutory Foundations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
          <div className="text-orange-600 dark:text-orange-400 font-bold text-lg">Article 39A</div>
          <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Equal Justice & Free Legal Aid</h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Directs the State to secure that the operation of the legal system promotes justice on the basis of equal opportunity, ensuring opportunities are not denied by reason of economic disability.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
          <div className="text-blue-600 dark:text-blue-400 font-bold text-lg">LSA Act 1987</div>
          <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Legal Services Authorities</h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Statutory framework establishing NALSA, State Legal Services Authorities, and Lok Adalats to provide free legal representation to marginalized citizens under Section 12.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
          <div className="text-emerald-600 dark:text-emerald-400 font-bold text-lg">eCourts Phase III</div>
          <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Paperless Digital Judiciary</h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            ₹7,210 Crore initiative creating open APIs, National Judicial Data Grid (NJDG), e-Filing 3.0, and AI-assisted case management across 18,000+ computerized courts.
          </p>
        </div>
      </div>

      {/* AI Solution Architecture */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-[#0B2545] dark:text-white">
            End-to-End System Architecture
          </h2>
          <p className="text-xs text-slate-500">
            Engineered for high accuracy, verifiable sources, and zero hallucinations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div className="p-5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2 shadow-sm">
            <Layers className="w-6 h-6 text-orange-500 mx-auto" />
            <h4 className="font-bold text-xs text-slate-900 dark:text-white">1. Knowledge Ingestion</h4>
            <p className="text-[11px] text-slate-500">PDF, DOCX, and TXT parsing from official portals (doj.gov.in, nalsa.gov.in).</p>
          </div>
          <div className="p-5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2 shadow-sm">
            <Cpu className="w-6 h-6 text-blue-500 mx-auto" />
            <h4 className="font-bold text-xs text-slate-900 dark:text-white">2. Semantic Vector RAG</h4>
            <p className="text-[11px] text-slate-500">Multilingual token alignment with sublinear TF-IDF and cosine similarity.</p>
          </div>
          <div className="p-5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2 shadow-sm">
            <Globe2 className="w-6 h-6 text-emerald-500 mx-auto" />
            <h4 className="font-bold text-xs text-slate-900 dark:text-white">3. Multi-Model LLM</h4>
            <p className="text-[11px] text-slate-500">Gemini, OpenAI, or Built-in Zero-Cloud domain synthesis fallback.</p>
          </div>
          <div className="p-5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2 shadow-sm">
            <ShieldCheck className="w-6 h-6 text-purple-500 mx-auto" />
            <h4 className="font-bold text-xs text-slate-900 dark:text-white">4. Citations & Auditing</h4>
            <p className="text-[11px] text-slate-500">Exact source URLs, statutory disclaimers, and admin feedback logging.</p>
          </div>
        </div>
      </div>

      {/* Call to action */}
      <div className="text-center pt-6">
        <button
          onClick={() => setCurrentPage('chat')}
          className="px-8 py-3.5 rounded-xl bg-[#0B2545] hover:bg-[#133E6D] text-white font-semibold shadow-md transition-all inline-flex items-center space-x-2"
        >
          <span>Try NyaySahayak Now</span>
          <ArrowRight className="w-4 h-4 text-orange-400" />
        </button>
      </div>

    </div>
  );
};
