export type Language = 'en' | 'hi' | 'pa' | 'bho';

export interface SourceCitation {
  title: string;
  category: string;
  source_name: string;
  source_url: string;
  secondary_url?: string;
  relevant_snippet: string;
  confidence_score?: number;
}

export interface ChatMessage {
  id?: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  intent?: string;
  language?: string;
  sources?: SourceCitation[];
  suggested_followups?: string[];
  feedback_rating?: number; // 1, -1, 0
  feedback_comment?: string;
  feedback_flagged?: boolean;
  created_at?: string;
  is_mock_or_offline?: boolean;
  provider?: string;
}

export interface ChatSessionItem {
  session_id: string;
  title: string;
  language: string;
  created_at: string;
  updated_at: string;
  message_count: number;
}

export interface ChatResponse {
  session_id: string;
  message: string;
  role: string;
  intent: string;
  language: string;
  sources: SourceCitation[];
  suggested_followups: string[];
  disclaimer: string;
  is_mock_or_offline: boolean;
  provider: string;
}

export interface DocumentRecord {
  id: number;
  doc_id: string;
  filename: string;
  file_type: string;
  title: string;
  category: string;
  source_url?: string;
  chunk_count: number;
  file_size_kb: number;
  status: string;
  uploaded_at: string;
}

export interface AnalyticsSummary {
  total_queries: number;
  daily_active_users: number;
  answered_queries: number;
  unanswered_queries: number;
  user_satisfaction_percentage: number;
  total_indexed_documents: number;
  top_intents: { name: string; count: number }[];
  recent_unanswered: { id: number; query: string; language: string; timestamp: string }[];
  language_distribution: { language: string; count: number }[];
}

export interface AdminUser {
  username: string;
  full_name: string;
  role: string;
}
