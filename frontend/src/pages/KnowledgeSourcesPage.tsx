import React, { useState, useEffect } from 'react';
import { 
  Database, 
  ExternalLink, 
  Search, 
  Filter, 
  FileText, 
  CheckCircle2, 
  ShieldCheck, 
  Layers,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import { DocumentRecord } from '../types';

interface KnowledgeSourcesPageProps {
  onStartChatWithQuery: (query: string) => void;
}

export const KnowledgeSourcesPage: React.FC<KnowledgeSourcesPageProps> = ({ onStartChatWithQuery }) => {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadDocs();
  }, []);

  const loadDocs = async () => {
    try {
      setIsLoading(true);
      const list = await api.listDocuments();
      setDocuments(list);
    } catch (e) {
      console.error('Failed to load documents', e);
    } finally {
      setIsLoading(false);
    }
  };

  const authoritativePortals = [
    {
      name: 'Department of Justice (DoJ)',
      url: 'https://doj.gov.in/',
      description: 'Official nodal ministry portal for judicial administration, judicial appointments, fast track courts, and Nyaya Vikas.',
      authority: 'Ministry of Law and Justice, Govt. of India'
    },
    {
      name: 'eCourts Mission Mode Project',
      url: 'https://ecourts.gov.in/',
      description: 'Central portal for Pan-India computerization of district and subordinate courts, Case Information Software, and e-Filing 3.0.',
      authority: 'e-Committee, Supreme Court of India'
    },
    {
      name: 'National Legal Services Authority (NALSA)',
      url: 'https://nalsa.gov.in/',
      description: 'Statutory authority executing legal services, free legal aid under Section 12 of LSA Act, and organizing National Lok Adalats.',
      authority: 'Statutory Body under LSA Act, 1987'
    },
    {
      name: 'Tele-Law Portal',
      url: 'https://tele-law.in/',
      description: 'Digital platform connecting rural citizens to panel lawyers via 2.5 Lakh Common Service Centres (CSCs).',
      authority: 'DoJ & CSC e-Governance Services'
    },
    {
      name: 'Nyaya Bandhu (Pro Bono)',
      url: 'https://www.probono-doj.in/',
      description: 'Nationwide registry connecting practicing advocates and law school Pro Bono Clubs with underprivileged litigants.',
      authority: 'Department of Justice'
    },
    {
      name: 'Nyaya Vikas Geo-Portal',
      url: 'https://nyayvikas.gov.in/',
      description: 'ISRO Bhuvan satellite-enabled geo-tracking portal monitoring development of court infrastructure projects.',
      authority: 'Department of Justice & ISRO'
    }
  ];

  const categories = ['All', 'Government Scheme', 'Judicial Services', 'Legal Aid', 'Judicial Infrastructure', 'Department Policies'];

  const filteredDocs = documents.filter(doc => {
    const matchesCategory = selectedCategory === 'All' || doc.category === selectedCategory;
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-semibold border border-emerald-300 dark:border-emerald-800">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Zero Hallucination Grounding</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#0B2545] dark:text-white tracking-tight">
          Authoritative Knowledge Sources
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
          NyaySahayak is powered exclusively by authentic government portals, statutory acts of Parliament, and gazetted schemes of the Department of Justice.
        </p>
      </div>

      {/* Authoritative Portals Grid */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-[#0B2545] dark:text-white flex items-center space-x-2">
          <Database className="w-5 h-5 text-orange-500" />
          <span>Primary Verified Portals</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {authoritativePortals.map((p, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-widest">
                  {p.authority}
                </span>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {p.name}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {p.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <a
                  href={p.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-[#0B2545] dark:text-orange-400 hover:underline flex items-center space-x-1"
                >
                  <span>Visit Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ingested Document Knowledge Base */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#0B2545] dark:text-white flex items-center space-x-2">
              <Layers className="w-5 h-5 text-orange-500" />
              <span>Ingested Document Repositories ({filteredDocs.length})</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live indexed schemes parsed into semantic vector chunks for instant retrieval.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Filter topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-[#0B2545] text-white dark:bg-orange-500 shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Document Cards */}
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-500">
            Loading indexed documents from knowledge base...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDocs.map((doc) => (
              <div
                key={doc.id || doc.doc_id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-semibold px-2 py-0.5 rounded bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300 border border-orange-200 dark:border-orange-900">
                      {doc.category}
                    </span>
                    <span className="flex items-center space-x-1 text-emerald-600 font-semibold">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{doc.status}</span>
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {doc.title}
                  </h4>

                  <div className="flex items-center space-x-3 text-[11px] text-slate-500">
                    <span>{doc.chunk_count} vector chunks</span>
                    <span>•</span>
                    <span>Format: {doc.file_type}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs">
                  <button
                    onClick={() => onStartChatWithQuery(`Tell me about ${doc.title}`)}
                    className="font-semibold text-orange-600 dark:text-orange-400 hover:underline flex items-center space-x-1"
                  >
                    <span>Query Document</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>

                  {doc.source_url && (
                    <a
                      href={doc.source_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center space-x-1 text-[11px]"
                    >
                      <span>Source</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
