import React from 'react';
import { 
  Bot, 
  FileSearch, 
  Languages, 
  Mic, 
  ShieldCheck, 
  Server, 
  Database, 
  Sparkles,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

interface FeaturesPageProps {
  setCurrentPage: (page: string) => void;
}

export const FeaturesPage: React.FC<FeaturesPageProps> = ({ setCurrentPage }) => {
  const featureList = [
    {
      icon: Bot,
      title: 'Intent-Aware Conversational AI',
      category: 'Core AI Engine',
      color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900',
      description: 'Automatically classifies citizen inquiries into distinct legal domains: Government Schemes, Case Status, Legal Aid, Judicial Infrastructure, and Department Policies.',
      points: [
        'Multi-turn context retention for natural follow-ups',
        'Automatic suggested questions based on query intent',
        'Polite, accessible explanations without legal convolution'
      ]
    },
    {
      icon: FileSearch,
      title: 'Retrieval-Augmented Generation (RAG)',
      category: 'Knowledge Grounding',
      color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-900',
      description: 'Synthesizes responses strictly from official Government of India documentation, preventing hallucinations and ensuring every answer has authoritative grounding.',
      points: [
        'Document chunking with sublinear TF-IDF and vector similarity',
        'Supports dynamic ingestion of PDF, DOCX, and TXT files',
        'Real-time indexing without server downtime'
      ]
    },
    {
      icon: Languages,
      title: 'Multilingual Indian Language Support',
      category: 'Linguistic Accessibility',
      color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900',
      description: 'Fully supports English, Hindi (हिन्दी), and Punjabi (ਪੰਜਾਬੀ), enabling citizens from diverse backgrounds to ask questions in their native language.',
      points: [
        'Devanagari and Gurmukhi script tokenization',
        'Cross-lingual concept mapping (e.g. मुफ्त कानूनी सहायता -> NALSA)',
        'Localized UI labels and disclaimers'
      ]
    },
    {
      icon: Mic,
      title: 'Full Voice Assistant (STT & TTS)',
      category: 'Voice Interaction',
      color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-900',
      description: 'Supports hands-free speech recognition (speech-to-text) and text-to-speech voice read-aloud using the browser-native Web Speech API.',
      points: [
        'Microphone live listening with visualizer pulse',
        'Speech playback in English, Hindi, and Punjabi accents',
        'Accessibility-first design for visually impaired or illiterate citizens'
      ]
    },
    {
      icon: ShieldCheck,
      title: 'Verified Citations & Hallucination Prevention',
      category: 'Trust & Governance',
      color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900',
      description: 'Every answer features explicit citations linking directly to verified Department of Justice portals (doj.gov.in, ecourts.gov.in, nalsa.gov.in).',
      points: [
        'Document title, category, and verbatim snippet cards',
        'Confidence score display and external link validation',
        'Mandatory statutory disclaimer on all informational guidance'
      ]
    },
    {
      icon: Server,
      title: 'Configurable LLM & Zero-Cloud Fallback',
      category: 'Modular Architecture',
      color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-900',
      description: 'Seamlessly works with Google Gemini API, OpenAI GPT, or runs completely offline using the built-in Zero-Cloud RAG domain synthesizer.',
      points: [
        'Automatic fallback if cloud API keys are absent or rate-limited',
        'Honest labeling of provider status (no fake LLM claims)',
        'Extensible adapter for self-hosted HuggingFace or Ollama models'
      ]
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-xs font-semibold border border-blue-300 dark:border-blue-800">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Cutting-Edge Legal AI Capabilities</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#0B2545] dark:text-white tracking-tight">
          System Features & AI Architecture
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
          Engineered to satisfy the highest functional, security, and accessibility standards for official digital judicial services.
        </p>
      </div>

      {/* Grid of 6 Key Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {featureList.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 sm:p-7 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-xl border ${item.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-full">
                    {item.category}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-2 space-y-2">
                  {item.points.map((pt, pIdx) => (
                    <div key={pIdx} className="flex items-start space-x-2 text-xs text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA Box */}
      <div className="bg-[#0B2545] text-white rounded-3xl p-8 sm:p-12 text-center space-y-4 shadow-xl">
        <h2 className="text-2xl sm:text-3xl font-extrabold">
          Experience NyaySahayak in Action
        </h2>
        <p className="text-sm text-slate-300 max-w-2xl mx-auto">
          Test voice inquiries, view source citations, switch languages, or inspect the administrative document ingestion pipeline.
        </p>
        <div className="pt-3">
          <button
            onClick={() => setCurrentPage('chat')}
            className="px-8 py-3.5 rounded-xl bg-[#FF9933] hover:bg-[#E06D14] text-[#0B2545] font-bold text-sm shadow-md transition-all inline-flex items-center space-x-2"
          >
            <span>Launch Assistant</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};
