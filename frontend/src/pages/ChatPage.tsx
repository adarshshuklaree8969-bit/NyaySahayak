import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  ThumbsUp, 
  ThumbsDown, 
  Flag, 
  RotateCcw, 
  Download, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  Search, 
  Trash2, 
  Plus, 
  ShieldAlert, 
  Info,
  Scale,
  PanelLeftClose,
  PanelLeft,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import { ChatMessage, SourceCitation, ChatSessionItem } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface ChatPageProps {
  initialQuery?: string;
  onClearInitialQuery?: () => void;
}

export const ChatPage: React.FC<ChatPageProps> = ({ initialQuery, onClearInitialQuery }) => {
  const { language, setLanguage, t } = useLanguage();
  
  // State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sessionId, setSessionId] = useState<string>('new');
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState<ChatSessionItem[]>([]);
  const [searchHistoryQuery, setSearchHistoryQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedSources, setExpandedSources] = useState<{ [msgIndex: number]: boolean }>({});
  
  // Audio Speech state
  const [isListening, setIsListening] = useState(false);
  const [currentlySpeakingIndex, setCurrentlySpeakingIndex] = useState<number | null>(null);
  
  // Feedback Modal state
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<number | null>(null);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Active AI Provider info
  const [activeProvider, setActiveProvider] = useState<string>('NyaySahayak Built-in RAG Engine');
  const [isOfflineEngine, setIsOfflineEngine] = useState<boolean>(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Load chat history on mount
  useEffect(() => {
    loadSessions();
  }, []);

  // Handle incoming initialQuery from Homepage
  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      handleSend(initialQuery);
      if (onClearInitialQuery) onClearInitialQuery();
    }
  }, [initialQuery]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      
      // Map app language to speech recognition locale
      const langMap: { [key: string]: string } = {
        en: 'en-IN',
        hi: 'hi-IN',
        pa: 'pa-IN',
        bho: 'bho-IN'
      };
      recognition.lang = langMap[language] || 'en-IN';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputMessage(transcript);
          // Auto send spoken query
          handleSend(transcript);
        }
      };
      recognitionRef.current = recognition;
    }
  }, [language]);

  const loadSessions = async () => {
    try {
      const list = await api.getChatHistory(30);
      setSessions(list);
    } catch (e) {
      console.error('Failed to load sessions', e);
    }
  };

  const handleSelectSession = async (sId: string) => {
    try {
      setIsLoading(true);
      const data = await api.getSessionMessages(sId);
      setSessionId(sId);
      const mapped: ChatMessage[] = data.messages.map((m: any) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        intent: m.intent,
        language: m.language,
        sources: m.sources,
        suggested_followups: m.suggested_followups,
        feedback_rating: m.feedback_rating,
        feedback_comment: m.feedback_comment
      }));
      setMessages(mapped);
    } catch (e) {
      console.error('Error switching session', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setSessionId('new');
    setMessages([]);
    stopSpeaking();
  };

  const handleDeleteSession = async (sId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.deleteSession(sId);
      setSessions(prev => prev.filter(s => s.session_id !== sId));
      if (sessionId === sId) {
        handleNewChat();
      }
    } catch (err) {
      console.error('Failed to delete session', err);
    }
  };

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    setInputMessage('');
    stopSpeaking();

    // Append user message immediately
    const userMsg: ChatMessage = {
      role: 'user',
      content: text,
      language: language
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await api.sendMessage({
        message: text,
        session_id: sessionId,
        language: language,
        user_identifier: 'anonymous'
      });

      setSessionId(response.session_id);
      setActiveProvider(response.provider);
      setIsOfflineEngine(response.is_mock_or_offline);

      const botMsg: ChatMessage = {
        role: 'assistant',
        content: response.message,
        intent: response.intent,
        language: response.language,
        sources: response.sources,
        suggested_followups: response.suggested_followups,
        provider: response.provider,
        is_mock_or_offline: response.is_mock_or_offline
      };

      setMessages(prev => [...prev, botMsg]);
      loadSessions();
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        role: 'assistant',
        content: `Error communicating with AI assistant: ${err.message || 'Network error'}. Please try again.`
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Voice Speech-To-Text toggle
  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech Recognition is not supported on this browser. Please use Chrome, Edge, or Safari.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error('Speech recognition error', e);
      }
    }
  };

  // Text-To-Speech playback
  const handleSpeak = (text: string, index: number) => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported on this browser.');
      return;
    }

    if (currentlySpeakingIndex === index) {
      stopSpeaking();
      return;
    }

    stopSpeaking();

    // Clean markdown before speaking
    const cleanText = text
      .replace(/[*#_`\[\]]/g, '')
      .replace(/https?:\/\/\S+/g, 'link provided')
      .slice(0, 500);

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = language === 'hi' ? 'hi-IN' : language === 'pa' ? 'pa-IN' : language === 'bho' ? 'hi-IN' : 'en-IN';
    utterance.rate = 1.0;
    utterance.onend = () => setCurrentlySpeakingIndex(null);
    utterance.onerror = () => setCurrentlySpeakingIndex(null);

    setCurrentlySpeakingIndex(index);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setCurrentlySpeakingIndex(null);
  };

  // Feedback handling
  const handleFeedback = async (msgIndex: number, rating: number) => {
    const msg = messages[msgIndex];
    setMessages(prev => prev.map((m, idx) => idx === msgIndex ? { ...m, feedback_rating: rating } : m));
    if (msg.id) {
      try {
        await api.submitFeedback({ message_id: msg.id, rating });
      } catch (e) {
        console.error('Error submitting feedback', e);
      }
    }
  };

  const openFlagModal = (msgIndex: number) => {
    const msg = messages[msgIndex];
    if (msg.id) {
      setSelectedMessageId(msg.id);
      setFeedbackComment('');
      setFeedbackSubmitted(false);
      setFeedbackModalOpen(true);
    }
  };

  const submitFlagReport = async () => {
    if (!selectedMessageId) return;
    try {
      await api.submitFeedback({
        message_id: selectedMessageId,
        rating: -1,
        comment: feedbackComment,
        flagged: true
      });
      setFeedbackSubmitted(true);
      setTimeout(() => {
        setFeedbackModalOpen(false);
        setFeedbackSubmitted(false);
      }, 1500);
    } catch (e) {
      console.error('Error reporting', e);
    }
  };

  // Export conversation transcript
  const handleExportChat = () => {
    if (messages.length === 0) return;
    const content = messages.map(m => `[${m.role.toUpperCase()}] (${m.language || 'en'}):\n${m.content}\n\n`).join('---\n\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `NyaySahayak_Chat_Export_${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const toggleSourceAccordion = (index: number) => {
    setExpandedSources(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const filteredSessions = sessions.filter(s => 
    s.title.toLowerCase().includes(searchHistoryQuery.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-130px)] max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-3">
      
      {/* Left Sidebar: Chat History */}
      <div 
        className={`${
          sidebarOpen ? 'w-72 sm:w-80' : 'w-0 hidden'
        } shrink-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl mr-3 flex flex-col overflow-hidden transition-all duration-200 shadow-sm`}
      >
        {/* Sidebar Header */}
        <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Scale className="w-5 h-5 text-orange-500" />
            <span className="font-bold text-sm text-[#0B2545] dark:text-white">
              {t('chatHistory')}
            </span>
          </div>
          <button
            onClick={handleNewChat}
            className="p-1.5 rounded-lg bg-orange-50 dark:bg-slate-800 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-slate-700 transition-colors"
            title={t('newChat')}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-2.5 border-b border-slate-100 dark:border-slate-800">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchHistoryQuery}
              onChange={(e) => setSearchHistoryQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>

        {/* Session List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {filteredSessions.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-400">
              No previous conversations recorded.
            </div>
          ) : (
            filteredSessions.map((s) => (
              <div
                key={s.session_id}
                onClick={() => handleSelectSession(s.session_id)}
                className={`p-2.5 rounded-xl text-xs cursor-pointer flex items-center justify-between group transition-all ${
                  sessionId === s.session_id
                    ? 'bg-[#0B2545] text-white shadow-sm'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="truncate pr-2">
                  <p className="font-medium truncate">{s.title}</p>
                  <span className={`text-[10px] ${sessionId === s.session_id ? 'text-slate-300' : 'text-slate-400'}`}>
                    {new Date(s.updated_at).toLocaleDateString()} • {s.message_count} messages
                  </span>
                </div>
                <button
                  onClick={(e) => handleDeleteSession(s.session_id, e)}
                  className={`opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-500 transition-opacity`}
                  title="Delete Session"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Emergency Helpline Box at bottom of sidebar */}
        <div className="p-3 bg-orange-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 text-xs text-orange-950 dark:text-orange-200 space-y-1">
          <div className="font-bold flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Helpline: 15100</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400">
            24x7 Free Legal Aid by NALSA
          </p>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        
        {/* Chat Header Bar */}
        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Toggle History Sidebar"
            >
              {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
            </button>
            
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm text-[#0B2545] dark:text-white">
                  NyaySahayak AI
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold border border-emerald-300 dark:border-emerald-700">
                  {isOfflineEngine ? 'Zero-Cloud RAG Mode' : 'Cloud LLM Active'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Active Provider: <strong className="text-slate-700 dark:text-slate-300">{activeProvider}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            {currentlySpeakingIndex !== null && (
              <button
                onClick={stopSpeaking}
                className="px-2.5 py-1 text-xs rounded-lg bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 flex items-center space-x-1 font-medium animate-pulse"
              >
                <VolumeX className="w-3.5 h-3.5" />
                <span>Stop Voice</span>
              </button>
            )}

            <button
              onClick={handleNewChat}
              className="p-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-1"
              title={t('newChat')}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('newChat')}</span>
            </button>

            <button
              onClick={handleExportChat}
              disabled={messages.length === 0}
              className="p-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 flex items-center space-x-1"
              title={t('exportChat')}
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        {/* Message Feed Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Welcome Screen if empty */}
          {messages.length === 0 && (
            <div className="max-w-xl mx-auto py-8 text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0B2545] to-[#133E6D] text-white flex items-center justify-center mx-auto shadow-md border border-orange-500/30">
                <Scale className="w-8 h-8 text-[#FF9933]" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-[#0B2545] dark:text-white">
                  Welcome to NyaySahayak (न्याय सहायक)
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  I can assist you with Department of Justice schemes, eCourts tracking, NALSA legal aid eligibility, Tele-Law panel consultations, and judicial services.
                </p>
              </div>

              {/* Starter Suggestions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left pt-2">
                {[
                  "What is Tele-Law and who gets free consultation?",
                  "How to check case status using 16-digit CNR number?",
                  "Who is eligible for free legal aid under Section 12?",
                  "What is Nyaya Bandhu Pro Bono legal service?"
                ].map((promptText, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(promptText)}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-orange-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 hover:border-orange-400 text-xs font-medium text-slate-800 dark:text-slate-200 transition-all text-left flex items-start space-x-2"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
                    <span>{promptText}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message List */}
          {messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            const isExpanded = expandedSources[index];

            return (
              <div
                key={index}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5`}
              >
                {/* Intent Badge for Assistant */}
                {!isUser && msg.intent && (
                  <div className="flex items-center space-x-2 px-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                    <span>Intent: <strong>{msg.intent}</strong></span>
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={`max-w-[88%] sm:max-w-[80%] rounded-2xl px-4 py-3.5 text-sm leading-relaxed shadow-sm ${
                    isUser
                      ? 'bg-[#0B2545] text-white rounded-br-sm'
                      : 'bg-slate-50 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-bl-sm'
                  }`}
                >
                  {/* Markdown text rendered cleanly */}
                  <div className="whitespace-pre-wrap font-sans text-xs sm:text-sm space-y-2">
                    {msg.content}
                  </div>

                  {/* Sources Accordion for Assistant */}
                  {!isUser && msg.sources && msg.sources.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
                      <button
                        onClick={() => toggleSourceAccordion(index)}
                        className="flex items-center justify-between w-full text-xs font-semibold text-orange-600 dark:text-orange-400 hover:text-orange-700 transition-colors"
                      >
                        <span className="flex items-center space-x-1.5">
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>{t('sourcesTitle')} ({msg.sources.length})</span>
                        </span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      {isExpanded && (
                        <div className="mt-2.5 space-y-2">
                          {msg.sources.map((cit, cIdx) => (
                            <div
                              key={cIdx}
                              className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs space-y-1"
                            >
                              <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                                <span>{cit.title}</span>
                                <span className="text-[10px] font-normal px-1.5 py-0.5 rounded bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300">
                                  {cit.category}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-600 dark:text-slate-300 italic">
                                "{cit.relevant_snippet}"
                              </p>
                              <div className="pt-1 flex items-center justify-between text-[10px] text-slate-500">
                                <span>Source: {cit.source_name}</span>
                                <a
                                  href={cit.source_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-orange-600 dark:text-orange-400 font-semibold hover:underline flex items-center space-x-1"
                                >
                                  <span>View Official Link</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Statutory Disclaimer on Assistant Reply */}
                  {!isUser && (
                    <div className="mt-3 pt-2 text-[10px] text-slate-400 dark:text-slate-500 italic border-t border-slate-200/50 dark:border-slate-700/50 flex items-center space-x-1">
                      <Info className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{t('disclaimerNote')}</span>
                    </div>
                  )}
                </div>

                {/* Assistant Action Buttons (TTS, Feedback) */}
                {!isUser && (
                  <div className="flex items-center space-x-3 text-xs text-slate-400 px-1 pt-1">
                    <button
                      onClick={() => handleSpeak(msg.content, index)}
                      className={`hover:text-slate-700 dark:hover:text-slate-200 flex items-center space-x-1 ${
                        currentlySpeakingIndex === index ? 'text-orange-500 font-bold' : ''
                      }`}
                      title="Read Aloud"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span className="text-[11px]">{currentlySpeakingIndex === index ? 'Speaking...' : 'Listen'}</span>
                    </button>

                    <button
                      onClick={() => handleFeedback(index, 1)}
                      className={`hover:text-emerald-600 ${msg.feedback_rating === 1 ? 'text-emerald-600 font-bold' : ''}`}
                      title="Accurate and Helpful"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleFeedback(index, -1)}
                      className={`hover:text-red-500 ${msg.feedback_rating === -1 ? 'text-red-500 font-bold' : ''}`}
                      title="Needs Improvement"
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => openFlagModal(index)}
                      className="hover:text-amber-500"
                      title="Report Incorrect Information"
                    >
                      <Flag className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Suggested Follow-up Questions Pills */}
                {!isUser && msg.suggested_followups && msg.suggested_followups.length > 0 && (
                  <div className="pt-2 flex flex-wrap gap-1.5 max-w-[85%]">
                    {msg.suggested_followups.map((fQuery, fIdx) => (
                      <button
                        key={fIdx}
                        onClick={() => handleSend(fQuery)}
                        className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-orange-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-orange-800 text-xs font-medium border border-slate-200 dark:border-slate-700 transition-all flex items-center space-x-1"
                      >
                        <span>→ {fQuery}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl w-fit animate-pulse border border-slate-200 dark:border-slate-700">
              <Sparkles className="w-4 h-4 text-orange-500 animate-spin" />
              <span>Analyzing verified Department of Justice records...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Listening Active Pulse Bar */}
        {isListening && (
          <div className="bg-orange-500 text-white text-xs px-4 py-2 flex items-center justify-between animate-pulse">
            <span className="flex items-center space-x-2 font-medium">
              <Mic className="w-4 h-4" />
              <span>{t('listening')}</span>
            </span>
            <button onClick={toggleListening} className="underline text-xs">Cancel</button>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2"
          >
            {/* Microphone STT Button */}
            <button
              type="button"
              onClick={toggleListening}
              className={`p-2.5 rounded-xl border transition-all ${
                isListening
                  ? 'bg-red-500 text-white border-red-600 animate-bounce'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
              title="Voice Input (Speech-to-Text)"
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-orange-500" />}
            </button>

            {/* Main Text Input */}
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={t('inputPlaceholder')}
              className="flex-1 px-4 py-3 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:border-orange-500 shadow-inner"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="px-4 py-3 rounded-xl bg-[#0B2545] hover:bg-[#133E6D] disabled:opacity-40 text-white font-semibold transition-all flex items-center justify-center space-x-1.5 shadow-sm"
              title={t('send')}
            >
              <Send className="w-4 h-4 text-orange-400" />
              <span className="hidden sm:inline text-xs">{t('send')}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Flag / Feedback Modal */}
      {feedbackModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Report Inaccurate or Incomplete Information
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Your feedback is audited by the Department of Justice administration to continuously enhance the precision of the RAG knowledge repository.
            </p>

            {feedbackSubmitted ? (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs rounded-xl flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Thank you! Your feedback report has been saved.</span>
              </div>
            ) : (
              <>
                <textarea
                  rows={3}
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder="Describe what was incorrect or what information is missing..."
                  className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:border-orange-500"
                />
                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    onClick={() => setFeedbackModalOpen(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitFlagReport}
                    className="px-4 py-1.5 text-xs font-semibold bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                  >
                    Submit Report
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
