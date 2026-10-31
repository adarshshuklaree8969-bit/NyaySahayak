import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '../types';

interface Translations {
  [key: string]: {
    en: string;
    hi: string;
    pa: string;
    bho: string;
  };
}

export const translations: Translations = {
  // Navigation
  navHome: { en: 'Home', hi: 'मुख्य पृष्ठ', pa: 'ਮੁੱਖ ਪੰਨਾ', bho: 'मुख्य पृष्ठ' },
  navChat: { en: 'AI Assistant', hi: 'एआई सहायक', pa: 'ਏਆਈ ਸਹਾਇਕ', bho: 'एआई सहायक' },
  navAbout: { en: 'About Project', hi: 'परियोजना परिचय', pa: 'ਪ੍ਰੋਜੈਕਟ ਬਾਰੇ', bho: 'परियोजना परिचय' },
  navFeatures: { en: 'Features', hi: 'विशेषताएं', pa: 'ਵਿਸ਼ੇਸ਼ਤਾਵਾਂ', bho: 'खासियत सभ' },
  navSources: { en: 'Knowledge Sources', hi: 'ज्ञान स्रोत', pa: 'ਗਿਆਨ ਸਰੋਤ', bho: 'ज्ञान स्रोत' },
  navAdmin: { en: 'Admin Portal', hi: 'व्यवस्थापक पोर्टल', pa: 'ਐਡਮਿਨ ਪੋਰਟਲ', bho: 'व्यवस्थापक पोर्टल' },
  navContact: { en: 'Contact & Help', hi: 'संपर्क व सहायता', pa: 'ਸੰਪਰਕ ਅਤੇ ਮਦਦ', bho: 'सम्पर्क आ मदद' },
  navPrivacy: { en: 'Privacy Policy', hi: 'गोपनीयता नीति', pa: 'ਗੋਪਨੀਯਤਾ ਨੀਤੀ', bho: 'गोपनीयता नीति' },

  // Hero
  heroTitle: {
    en: 'Your AI-Powered Justice Information Assistant',
    hi: 'आपका एआई-संचालित न्याय सूचना सहायक',
    pa: 'ਤੁਹਾਡਾ ਏਆਈ-ਅਧਾਰਿਤ ਨਿਆਂ ਸੂਚਨਾ ਸਹਾਇਕ',
    bho: 'रउवा खातिर एआई-संचालित न्याय सूचना सहायक'
  },
  heroSubtitle: {
    en: 'Making justice-related information accessible, understandable, and available to every citizen.',
    hi: 'न्याय-संबंधी सूचनाओं को प्रत्येक नागरिक के लिए सुलभ, समझने योग्य और सरल बनाना।',
    pa: 'ਨਿਆਂ-ਸੰਬੰਧੀ ਜਾਣਕਾਰੀ ਨੂੰ ਹਰ ਨਾਗਰਿਕ ਲਈ ਪਹੁੰਚਯੋਗ, ਸਮਝਣਯੋਗ ਅਤੇ ਆਸਾਨ ਬਣਾਉਣਾ।',
    bho: 'न्याय से जुड़ल जानकारी के हर नागरिक खातिर आसान, सहज आ उपलब्ध बनावल।'
  },
  ctaStart: { en: 'Start Conversation', hi: 'बातचीत शुरू करें', pa: 'ਗੱਲਬਾਤ ਸ਼ੁਰੂ ਕਰੋ', bho: 'बातचीत शुरू करीं' },
  ctaServices: { en: 'Explore Services', hi: 'सेवाएं देखें', pa: 'ਸੇਵਾਵਾਂ ਦੇਖੋ', bho: 'सेवा सभ देखीं' },

  // Schemes
  teleLaw: { en: 'Tele-Law Scheme', hi: 'टेली-लॉ योजना', pa: 'ਟੈਲੀ-ਲਾਅ ਸਕੀਮ', bho: 'टेली-लॉ योजना' },
  eCourts: { en: 'eCourts Mission Mode', hi: 'ई-कोर्ट मिशन मोड', pa: 'ਈ-ਕੋਰਟਸ ਮਿਸ਼ਨ ਮੋਡ', bho: 'ई-कोर्ट मिशन मोड' },
  nalsa: { en: 'Free Legal Aid (NALSA)', hi: 'मुफ्त कानूनी सहायता (नालसा)', pa: 'ਮੁਫ਼ਤ ਕਾਨੂੰਨੀ ਸਹਾਇਤਾ (ਨਾਲਸਾ)', bho: 'मुफ्त कानूनी सहायता (नालसा)' },
  nyayaBandhu: { en: 'Nyaya Bandhu (Pro Bono)', hi: 'न्याय बंधु (निःशुल्क सेवा)', pa: 'ਨਿਆਂ ਬੰਧੂ (ਪ੍ਰੋ ਬੋਨੋ)', bho: 'न्याय बंधु (मुफ्त वकील सेवा)' },
  ftsc: { en: 'Fast Track Courts', hi: 'फास्ट ट्रैक विशेष अदालतें', pa: 'ਫਾਸਟ ਟਰੈਕ ਵਿਸ਼ੇਸ਼ ਅਦਾਲਤਾਂ', bho: 'फास्ट ट्रैक विशेष अदालत' },
  gramNyayalaya: { en: 'Gram Nyayalayas', hi: 'ग्राम न्यायालय', pa: 'ਗ੍ਰਾਮ ਨਿਆਂਲਿਆ', bho: 'ग्राम न्यायालय' },

  // Chat UI
  inputPlaceholder: {
    en: 'Ask any question about legal schemes, eCourts, or legal aid...',
    hi: 'सरकारी योजनाओं, ई-कोर्ट, या मुफ्त कानूनी सहायता के बारे में पूछें...',
    pa: 'ਸਰਕਾਰੀ ਸਕੀਮਾਂ, ਈ-ਕੋਰਟ ਜਾਂ ਮੁਫ਼ਤ ਕਾਨੂੰਨੀ ਸਹਾਇਤਾ ਬਾਰੇ ਪੁੱਛੋ...',
    bho: 'सरकारी योजना, ई-कोर्ट, भा मुफ्त कानूनी सहायता के बारे में कुछ भी पूछीं...'
  },
  send: { en: 'Send', hi: 'भेजें', pa: 'ਭੇਜੋ', bho: 'भेजीं' },
  listening: { en: 'Listening... Speak now', hi: 'सुन रहा है... बोलिए', pa: 'ਸੁਣ ਰਿਹਾ ਹੈ... ਬੋਲੋ', bho: 'सुन रहल बा... बोलीं' },
  sourcesTitle: { en: 'Verified Official Sources', hi: 'सत्यापित आधिकारिक स्रोत', pa: 'ਪ੍ਰਮਾਣਿਤ ਅਧਿਕਾਰਤ ਸਰੋਤ', bho: 'सत्यापित आधिकारिक स्रोत' },
  followupsTitle: { en: 'Suggested Questions', hi: 'सुझाए गए प्रश्न', pa: 'ਸੁਝਾਏ ਗਏ ਸਵਾਲ', bho: 'सुझावल गइल सवाल' },
  disclaimerNote: {
    en: 'Official Notice: Informational guidance only. Not formal legal advice.',
    hi: 'आधिकारिक सूचना: केवल जन-जागरूकता हेतु। औपचारिक कानूनी सलाह नहीं।',
    pa: 'ਅਧਿਕਾਰਤ ਸੂਚਨਾ: ਸਿਰਫ਼ ਜਾਣਕਾਰੀ ਲਈ। ਰਸਮੀ ਕਾਨੂੰਨੀ ਸਲਾਹ ਨਹੀਂ।',
    bho: 'आधिकारिक सूचना: खाली जन-जागरूकता खातिर। औपचारिक कानूनी सलाह ना हटे।'
  },
  newChat: { en: 'New Chat', hi: 'नई बातचीत', pa: 'ਨਵੀਂ ਗੱਲਬਾਤ', bho: 'नया बातचीत' },
  clearChat: { en: 'Clear Chat', hi: 'चैट साफ़ करें', pa: 'ਚੈਟ ਸਾਫ਼ ਕਰੋ', bho: 'चैट साफ करीं' },
  exportChat: { en: 'Export Transcript', hi: 'संवाद डाउनलोड करें', pa: 'ਗੱਲਬਾਤ ਡਾਊਨਲੋਡ ਕਰੋ', bho: 'संवाद डाउनलोड करीं' },
  chatHistory: { en: 'Chat History', hi: 'पूर्व संवाद इतिहास', pa: 'ਪਿਛਲਾ ਗੱਲਬਾਤ ਇਤਿਹਾਸ', bho: 'पुराना बातचीत इतिहास' },

  // Helpline
  nationalHelpline: {
    en: 'National Legal Aid Toll-Free Helpline: 15100',
    hi: 'राष्ट्रीय कानूनी सहायता टोल-फ्री हेल्पलाइन: 15100',
    pa: 'ਰਾਸ਼ਟਰੀ ਕਾਨੂੰਨੀ ਸਹਾਇਤਾ ਟੋਲ-ਫ੍ਰੀ ਹੈਲਪਲਾਈਨ: 15100',
    bho: 'राष्ट्रीय कानूनी सहायता टोल-फ्री हेल्पलाइन: 15100'
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('nyay_lang');
    return (saved as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('nyay_lang', language);
  }, [language]);

  const t = (key: string): string => {
    if (translations[key] && translations[key][language]) {
      return translations[key][language];
    }
    return translations[key]?.en || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
