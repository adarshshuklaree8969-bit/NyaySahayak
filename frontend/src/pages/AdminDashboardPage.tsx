import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  FileUp, 
  Layers, 
  AlertTriangle, 
  RefreshCw, 
  Trash2, 
  CheckCircle2, 
  ExternalLink, 
  LogOut, 
  UploadCloud, 
  FileText, 
  Users, 
  Smile, 
  HelpCircle,
  Plus
} from 'lucide-react';
import { api } from '../services/api';
import { DocumentRecord, AnalyticsSummary, AdminUser } from '../types';

interface AdminDashboardPageProps {
  token: string;
  adminUser: AdminUser | null;
  onLogout: () => void;
  setCurrentPage: (page: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  token,
  adminUser,
  onLogout,
  setCurrentPage
}) => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'documents' | 'upload' | 'unanswered'>('analytics');
  
  // Data states
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Upload Form states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState('Government Scheme');
  const [uploadSourceUrl, setUploadSourceUrl] = useState('https://doj.gov.in/');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [sum, docs] = await Promise.all([
        api.getAnalyticsSummary(),
        api.listDocuments()
      ]);
      setAnalytics(sum);
      setDocuments(docs);
    } catch (e: any) {
      console.error('Error loading dashboard data', e);
      setStatusMessage({ text: 'Error connecting to analytics database', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReindex = async () => {
    try {
      setIsLoading(true);
      const res = await api.reindexDocuments(token);
      setStatusMessage({ text: res.message, type: 'success' });
      await loadAllData();
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Reindex failed', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDocument = async (docId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to remove "${title}" from the knowledge base?`)) return;
    try {
      await api.deleteDocument(docId, token);
      setStatusMessage({ text: `Document "${title}" removed successfully`, type: 'success' });
      loadAllData();
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Delete failed', type: 'error' });
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !uploadTitle.trim()) {
      setStatusMessage({ text: 'Please select a file and provide a title', type: 'error' });
      return;
    }

    setIsUploading(true);
    setStatusMessage(null);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('title', uploadTitle);
    formData.append('category', uploadCategory);
    formData.append('source_url', uploadSourceUrl);

    try {
      const res = await api.uploadDocument(formData, token);
      setStatusMessage({ text: res.message, type: 'success' });
      // Reset form
      setSelectedFile(null);
      setUploadTitle('');
      setActiveTab('documents');
      loadAllData();
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Upload failed', type: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner / User Bar */}
      <div className="bg-[#0B2545] text-white p-6 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-lg border-b-4 border-orange-500">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
              Administrative Control Center
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/40">
              Role: {adminUser?.role || 'SUPER_ADMIN'}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight mt-1">
            Department of Justice Knowledge Hub
          </h1>
          <p className="text-xs text-slate-300">
            Logged in as: <strong className="text-white">{adminUser?.username || 'admin@doj.gov.in'}</strong>
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setCurrentPage('chat')}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/20"
          >
            Launch Chat UI
          </button>
          <button
            onClick={onLogout}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-red-600 hover:bg-red-700 text-white transition-colors flex items-center space-x-1.5 shadow-sm"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Status Alert Banner */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-xs font-medium border ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
              : 'bg-red-50 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800'
          }`}
        >
          <div className="flex items-center space-x-2">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="underline text-xs">Dismiss</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        {[
          { id: 'analytics', label: 'Analytics & Usage', icon: BarChart3 },
          { id: 'documents', label: `Knowledge Base (${documents.length})`, icon: Layers },
          { id: 'upload', label: 'Ingest Document (PDF/DOCX)', icon: FileUp },
          { id: 'unanswered', label: 'Unanswered & Flags', icon: HelpCircle },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
                isActive
                  ? 'bg-[#0B2545] text-white dark:bg-orange-500 shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Analytics */}
      {activeTab === 'analytics' && analytics && (
        <div className="space-y-8">
          {/* Top 4 Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
              <span className="text-xs font-semibold text-slate-500">Total Queries Handled</span>
              <div className="text-3xl font-extrabold text-[#0B2545] dark:text-white">
                {analytics.total_queries}
              </div>
              <p className="text-[11px] text-emerald-600 font-medium">95.2% Automated resolution</p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
              <span className="text-xs font-semibold text-slate-500">Active Citizen Sessions</span>
              <div className="text-3xl font-extrabold text-[#0B2545] dark:text-white">
                {analytics.daily_active_users}
              </div>
              <p className="text-[11px] text-blue-600 font-medium">Live multi-lingual users</p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
              <span className="text-xs font-semibold text-slate-500">User Satisfaction Score</span>
              <div className="text-3xl font-extrabold text-emerald-600">
                {analytics.user_satisfaction_percentage}%
              </div>
              <p className="text-[11px] text-slate-400">Based on citizen thumbs feedback</p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
              <span className="text-xs font-semibold text-slate-500">Indexed Scheme Documents</span>
              <div className="text-3xl font-extrabold text-orange-500">
                {analytics.total_indexed_documents}
              </div>
              <p className="text-[11px] text-slate-400">Official gazette and SOP docs</p>
            </div>
          </div>

          {/* Breakdown Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Query Intents */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Most Frequent Inquiries by Topic
              </h3>
              <div className="space-y-3">
                {analytics.top_intents.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-slate-700 dark:text-slate-300">{item.name}</span>
                      <span className="font-bold text-slate-900 dark:text-white">{item.count} queries</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-500 rounded-full"
                        style={{ width: `${Math.min(100, (item.count / 150) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Language Breakdown */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Language Distribution
              </h3>
              <div className="space-y-3">
                {analytics.language_distribution.map((item, idx) => {
                  const langLabel = item.language === 'hi' ? 'Hindi (हिन्दी)' : item.language === 'pa' ? 'Punjabi (ਪੰਜਾਬੀ)' : 'English';
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-slate-700 dark:text-slate-300">{langLabel}</span>
                        <span className="font-bold text-slate-900 dark:text-white">{item.count} sessions</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full"
                          style={{ width: `${Math.min(100, (item.count / 250) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Documents List */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-base text-slate-900 dark:text-white">
                Knowledge Base Documents
              </h2>
              <p className="text-xs text-slate-500">
                Manage all ingested government schemes and policies in the vector store.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleReindex}
                disabled={isLoading}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-orange-50 dark:bg-slate-800 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-slate-700 border border-orange-200 dark:border-orange-800 flex items-center space-x-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Re-index Vector Store</span>
              </button>
              <button
                onClick={() => setActiveTab('upload')}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-[#0B2545] hover:bg-[#133E6D] text-white flex items-center space-x-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Upload New</span>
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3.5">Document Title</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Type</th>
                  <th className="p-3.5">Vector Chunks</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-slate-700 dark:text-slate-200">
                {documents.map((doc) => (
                  <tr key={doc.id || doc.doc_id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40">
                    <td className="p-3.5 font-medium text-slate-900 dark:text-white">
                      <div>{doc.title}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-xs">{doc.filename}</div>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                        {doc.category}
                      </span>
                    </td>
                    <td className="p-3.5">{doc.file_type}</td>
                    <td className="p-3.5 font-semibold text-orange-600 dark:text-orange-400">
                      {doc.chunk_count} chunks
                    </td>
                    <td className="p-3.5">
                      <span className="inline-flex items-center space-x-1 text-emerald-600 font-semibold text-[11px]">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{doc.status}</span>
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleDeleteDocument(doc.doc_id, doc.title)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                        title="Remove Document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Document Upload */}
      {activeTab === 'upload' && (
        <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-sm space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <UploadCloud className="w-6 h-6 text-orange-500" />
              <span>Ingest New Document into Vector Knowledge Base</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Upload PDF, DOCX, or TXT government documents. The system will extract text, generate semantic chunks, and update the vector index in real time.
            </p>
          </div>

          <form onSubmit={handleUploadSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Document File (PDF, DOCX, TXT) *
              </label>
              <input
                type="file"
                required
                accept=".pdf,.docx,.doc,.txt,.json"
                onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                className="w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Document Title *
              </label>
              <input
                type="text"
                required
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                placeholder="e.g. Tele-Law Operational Guidelines 2026"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Category
                </label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="Government Scheme">Government Scheme</option>
                  <option value="Judicial Services">Judicial Services</option>
                  <option value="Legal Aid">Legal Aid</option>
                  <option value="Judicial Infrastructure">Judicial Infrastructure</option>
                  <option value="Department Policies">Department Policies</option>
                  <option value="General Awareness">General Awareness</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Authoritative Source URL
                </label>
                <input
                  type="url"
                  value={uploadSourceUrl}
                  onChange={(e) => setUploadSourceUrl(e.target.value)}
                  placeholder="https://doj.gov.in/..."
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            {/* Note on pre-generated sample files */}
            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 text-xs rounded-xl border border-blue-200 dark:border-blue-900">
              💡 <strong>Tip:</strong> Sample official PDF and DOCX files are also pre-generated at: <br/>
              <code className="text-[11px] font-mono">backend/app/data/sample_documents/</code>
            </div>

            <button
              type="submit"
              disabled={isUploading}
              className="w-full py-3 rounded-xl bg-[#0B2545] hover:bg-[#133E6D] text-white font-semibold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isUploading ? (
                <span>Extracting Text & Indexing Chunks...</span>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4 text-orange-400" />
                  <span>Parse & Ingest into RAG Vector Store</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: Unanswered & Flags */}
      {activeTab === 'unanswered' && analytics && (
        <div className="space-y-4">
          <div>
            <h2 className="font-bold text-base text-slate-900 dark:text-white">
              Unanswered Queries & User Flagged Items
            </h2>
            <p className="text-xs text-slate-500">
              Review queries that had low retrieval confidence or were flagged by citizens for administrative audit.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3.5">Query Text</th>
                  <th className="p-3.5">Language</th>
                  <th className="p-3.5">Logged Timestamp</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-slate-700 dark:text-slate-200">
                {analytics.recent_unanswered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40">
                    <td className="p-3.5 font-medium text-slate-900 dark:text-white">
                      "{item.query}"
                    </td>
                    <td className="p-3.5">
                      <span className="uppercase text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700">
                        {item.language}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-400">{item.timestamp}</td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => setActiveTab('upload')}
                        className="text-xs font-semibold text-orange-600 dark:text-orange-400 hover:underline"
                      >
                        + Ingest Knowledge
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
