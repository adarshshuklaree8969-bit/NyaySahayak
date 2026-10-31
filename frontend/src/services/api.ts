import { ChatResponse, ChatSessionItem, DocumentRecord, AnalyticsSummary } from '../types';

const API_BASE = '/api';

export const api = {
  // Chat APIs
  async sendMessage(params: {
    message: string;
    session_id?: string;
    language?: string;
    user_identifier?: string;
  }): Promise<ChatResponse> {
    const res = await fetch(`${API_BASE}/chat/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to send message to AI assistant');
    }
    return res.json();
  },

  async getChatHistory(limit = 20): Promise<ChatSessionItem[]> {
    const res = await fetch(`${API_BASE}/chat/history?limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch chat history');
    return res.json();
  },

  async getSessionMessages(sessionId: string) {
    const res = await fetch(`${API_BASE}/chat/history/${sessionId}`);
    if (!res.ok) throw new Error('Failed to load session messages');
    return res.json();
  },

  async deleteSession(sessionId: string) {
    const res = await fetch(`${API_BASE}/chat/history/${sessionId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete chat session');
    return res.json();
  },

  // Feedback API
  async submitFeedback(params: {
    message_id: number;
    rating: number;
    comment?: string;
    flagged?: boolean;
  }) {
    const res = await fetch(`${API_BASE}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Failed to record feedback');
    return res.json();
  },

  // Documents & Knowledge Base
  async listDocuments(): Promise<DocumentRecord[]> {
    const res = await fetch(`${API_BASE}/documents`);
    if (!res.ok) throw new Error('Failed to fetch documents');
    return res.json();
  },

  async uploadDocument(formData: FormData, token: string) {
    const res = await fetch(`${API_BASE}/documents/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Document upload failed');
    }
    return res.json();
  },

  async deleteDocument(docId: string, token: string) {
    const res = await fetch(`${API_BASE}/documents/${docId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error('Failed to delete document');
    return res.json();
  },

  async reindexDocuments(token: string) {
    const res = await fetch(`${API_BASE}/documents/reindex`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error('Failed to reindex knowledge base');
    return res.json();
  },

  // Analytics
  async getAnalyticsSummary(): Promise<AnalyticsSummary> {
    const res = await fetch(`${API_BASE}/analytics/summary`);
    if (!res.ok) throw new Error('Failed to load analytics summary');
    return res.json();
  },

  // Admin Auth & OTP
  async sendAdminOTP(identifier: string): Promise<{ status: string; message: string; email_sent?: boolean; smtp_configured?: boolean; expires_in_seconds: number }> {
    const res = await fetch(`${API_BASE}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to dispatch verification OTP');
    }
    return res.json();
  },

  async verifyAdminOTP(identifier: string, otp_code: string) {
    const res = await fetch(`${API_BASE}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, otp_code }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Invalid or expired OTP code');
    }
    return res.json();
  },

  async loginAdmin(username: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Invalid administrative credentials');
    }
    return res.json();
  },

  async getAdminProfile(token: string) {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Session expired');
    return res.json();
  },
};
