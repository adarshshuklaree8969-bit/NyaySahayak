import React from 'react';
import { 
  MessageSquare, 
  ArrowRight, 
  Scale, 
  Landmark, 
  FileText, 
  Headphones, 
  ShieldCheck, 
  Users, 
  Sparkles,
  ExternalLink,
  ChevronRight,
  Gavel,
  BookOpen
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface HomePageProps {
  onStartChatWithQuery: (query: string) => void;
  setCurrentPage: (page: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onStartChatWithQuery, setCurrentPage }) => {
  const { t, language } = useLanguage();

  const sampleQueries = [
    {
      category: 'Tele-Law Scheme',
      text: language === 'hi' ? 'टेली-लॉ के जरिए मुफ्त वकील से सलाह कैसे लें?' :
            language === 'pa' ? 'ਟੈਲੀ-ਲਾਅ ਰਾਹੀਂ ਮੁਫ਼ਤ ਵਕੀਲ ਦੀ ਸਲਾਹ ਕਿਵੇਂ ਲਈਏ?' :
            'How can I get free legal advice through Tele-Law?',
      badge: 'Legal Aid'
    },
    {
      category: 'eCourts Services',
      text: language === 'hi' ? '16 अंकों के सीएनआर (CNR) नंबर से केस स्टेटस कैसे चेक करें?' :
            language === 'pa' ? '16 ਅੰਕਾਂ ਦੇ CNR ਨੰਬਰ ਨਾਲ ਕੇਸ ਦੀ ਸਥਿਤੀ ਕਿਵੇਂ ਦੇਖੀਏ?' :
            'How to check court case status using 16-digit CNR number?',
      badge: 'eCourts'
    },
    {
      category: 'NALSA & Legal Aid',
      text: language === 'hi' ? 'नालसा धारा 12 के तहत मुफ्त कानूनी सहायता के लिए कौन पात्र है?' :
            language === 'pa' ? 'ਨਾਲਸਾ ਧਾਰਾ 12 ਤਹਿਤ ਮੁਫ਼ਤ ਕਾਨੂੰਨੀ ਸਹਾਇਤਾ ਲਈ ਕੌਣ ਯੋਗ ਹੈ?' :
            'Who is eligible for free legal aid under Section 12 of LSA Act?',
      badge: 'Section 12'
    },
    {
      category: 'Nyaya Bandhu',
      text: language === 'hi' ? 'न्याय बंधु प्रो-बोनो अधिवक्ता सेवा क्या है और कौन जुड़ सकता है?' :
            language === 'pa' ? 'ਨਿਆਂ ਬੰਧੂ ਪ੍ਰੋ-ਬੋਨੋ ਵਕੀਲ ਸੇਵਾ ਕੀ ਹੈ?' :
            'What is the Nyaya Bandhu Pro Bono legal service scheme?',
      badge: 'Pro Bono'
    },
    {
      category: 'Gram Nyayalaya',
      text: language === 'hi' ? 'ग्रामीण क्षेत्रों में ग्राम न्यायालय कैसे कार्य करते हैं?' :
            language === 'pa' ? 'ਪੇਂਡੂ ਖੇਤਰਾਂ ਵਿੱਚ ਗ੍ਰਾਮ ਨਿਆਂਲਿਆ ਕਿਵੇਂ ਕੰਮ ਕਰਦੇ ਹਨ?' :
            'How do Gram Nyayalayas function in rural villages?',
      badge: 'Grassroots'
    },
    {
      category: 'Fast Track Courts',
      text: language === 'hi' ? 'पॉक्सो और दुष्कर्म मामलों के लिए फास्ट ट्रैक स्पेशल कोर्ट (FTSC) क्या हैं?' :
            language === 'pa' ? 'ਪੋਕਸੋ ਕੇਸਾਂ ਲਈ ਫਾਸਟ ਟਰੈਕ ਵਿਸ਼ੇਸ਼ ਅਦਾਲਤਾਂ (FTSC) ਕੀ ਹਨ?' :
            'What are Fast Track Special Courts (FTSCs) for POCSO cases?',
      badge: 'Speedy Trial'
    }
  ];

  const pillarCards = [
    {
      title: 'Tele-Law Scheme',
      hindi: 'टेली-लॉ योजना',
      desc: 'Connecting marginalized citizens directly to panel advocates via 2.5+ Lakh Common Service Centres (CSCs) and mobile app.',
      icon: Headphones,
      color: 'border-blue-500 text-blue-600 dark:text-blue-400',
      tag: 'Reaching the Unreached',
      link: 'https://tele-law.in'
    },
    {
      title: 'eCourts Mission Mode',
      hindi: 'ई-कोर्ट मिशन मोड',
      desc: 'Pan-India ICT enablement offering Case Status via CNR, National Judicial Data Grid (NJDG), Virtual Courts, and e-Filing.',
      icon: Landmark,
      color: 'border-orange-500 text-orange-600 dark:text-orange-400',
      tag: 'Phases I, II & III',
      link: 'https://ecourts.gov.in'
    },
    {
      title: 'NALSA & Free Legal Aid',
      hindi: 'मुफ्त कानूनी सहायता',
      desc: 'Statutory legal services under Section 12 for women, children, SC/ST, and low-income citizens, plus National Lok Adalats.',
      icon: Scale,
      color: 'border-emerald-500 text-emerald-600 dark:text-emerald-400',
      tag: 'Helpline 15100',
      link: 'https://nalsa.gov.in'
    },
    {
      title: 'Nyaya Bandhu',
      hindi: 'न्याय बंधु प्रो-बोनो',
      desc: 'Institutionalized voluntary pro bono legal service connecting practicing lawyers and law school clinics with needy litigants.',
      icon: Users,
      color: 'border-purple-500 text-purple-600 dark:text-purple-400',
      tag: 'Pro Bono Advocates',
      link: 'https://www.probono-doj.in'
    },
    {
      title: 'Fast Track Special Courts',
      hindi: 'फास्ट ट्रैक विशेष अदालतें',
      desc: 'Dedicated fast track courts under Nirbhaya Fund prioritizing expeditious trial of POCSO and rape cases within 1 year.',
      icon: Gavel,
      color: 'border-amber-500 text-amber-600 dark:text-amber-400',
      tag: '750+ Courts Pan-India',
      link: 'https://doj.gov.in/fast-track-special-court-ftsc/'
    },
    {
      title: 'Gram Nyayalayas',
      hindi: 'ग्राम न्यायालय',
      desc: 'Bringing speedy and accessible justice to rural citizens at their doorstep through Nyayadhikari mobile courts.',
      icon: BookOpen,
      color: 'border-cyan-500 text-cyan-600 dark:text-cyan-400',
      tag: 'Gram Nyayalayas Act 2008',
      link: 'https://doj.gov.in/gram-nyayalaya/'
    }
  ];

  return (
    <div className="space-y-16 pb-20">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0B2545]/5 via-white to-white dark:from-slate-900/60 dark:via-slate-900 dark:to-slate-900 pt-12 pb-16 px-4 sm:px-6 lg:px-8 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-orange-100 text-orange-900 dark:bg-orange-950/80 dark:text-orange-300 text-xs font-semibold border border-orange-300 dark:border-orange-700 shadow-sm animate-fade-in">
            <Sparkles className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
            <span>Official Portal • Ministry of Law & Justice • Government of India</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#0B2545] dark:text-white tracking-tight leading-tight">
            {t('heroTitle')}
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
            {t('heroSubtitle')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => setCurrentPage('chat')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-[#0B2545] to-[#133E6D] hover:from-[#061629] hover:to-[#0B2545] text-white font-semibold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center space-x-2.5 text-base border-t border-orange-400/40"
            >
              <MessageSquare className="w-5 h-5 text-orange-400" />
              <span>{t('ctaStart')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href="#services"
              className="w-full sm:w-auto px-7 py-4 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 shadow-sm transition-all flex items-center justify-center space-x-2 text-base"
            >
              <span>{t('ctaServices')}</span>
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>

          {/* Citizen Security & Multi-Language Pill */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>100% Verified DoJ Knowledge Base</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-orange-500"></span>
              <span>Available in English, हिन्दी & ਪੰਜਾਬੀ</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span>Voice Speech Recognition & Read Aloud</span>
            </span>
          </div>
        </div>
      </section>

      {/* Suggested Questions Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0B2545] dark:text-white">
            Common Citizen Inquiries
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Click any question below to interact with NyaySahayak instantly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sampleQueries.map((item, idx) => (
            <div
              key={idx}
              onClick={() => onStartChatWithQuery(item.text)}
              className="group p-5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-orange-500 dark:hover:border-orange-500 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
                    {item.category}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium">
                    {item.badge}
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                  "{item.text}"
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs text-slate-500 group-hover:text-orange-600 dark:group-hover:text-orange-400 font-medium">
                <span>Ask this query</span>
                <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* National Impact Statistics Bar */}
      <section className="bg-[#0B2545] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
            <div className="space-y-1 py-2">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#FF9933]">65+ Lakh</div>
              <div className="text-xs text-slate-300">Tele-Law Consultations Delivered</div>
            </div>
            <div className="space-y-1 py-2">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#FF9933]">18,000+</div>
              <div className="text-xs text-slate-300">Digitized District & Subordinate Courts</div>
            </div>
            <div className="space-y-1 py-2">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#FF9933]">750+</div>
              <div className="text-xs text-slate-300">Fast Track Special POCSO Courts</div>
            </div>
            <div className="space-y-1 py-2">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#FF9933]">2.5+ Lakh</div>
              <div className="text-xs text-slate-300">Gram Panchayats Covered via CSCs</div>
            </div>
          </div>
        </div>
      </section>

      {/* Department of Justice Pillars & Services */}
      <section id="services" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-widest">
            Authoritative Schemes & Initiatives
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0B2545] dark:text-white">
            Department of Justice Core Pillars
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Official government initiatives designed to ensure accessible and timely justice for all citizens.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pillarCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white group-hover:bg-orange-50 dark:group-hover:bg-orange-950/40 transition-colors">
                      <Icon className="w-6 h-6 text-[#0B2545] dark:text-orange-400" />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-full">
                      {card.tag}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                      {card.hindi}
                    </p>
                    <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                  <button
                    onClick={() => onStartChatWithQuery(`Explain the key features and eligibility of ${card.title}`)}
                    className="text-xs font-semibold text-[#0B2545] dark:text-orange-400 hover:underline flex items-center space-x-1"
                  >
                    <span>Ask NyaySahayak</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  <a
                    href={card.link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center space-x-1"
                  >
                    <span>Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Target Beneficiaries Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#0B2545] to-[#133E6D] rounded-3xl p-8 sm:p-12 text-white shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-[#FF9933]">
                Empowering India
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold leading-tight">
                Who Does NyaySahayak Serve?
              </h2>
              <p className="text-sm text-slate-200 leading-relaxed">
                NyaySahayak breaks down language barriers and complicated legal jargon so every stakeholder can understand their constitutional entitlements and judicial procedures.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setCurrentPage('chat')}
                  className="px-6 py-3 rounded-xl bg-[#FF9933] hover:bg-[#E06D14] text-[#0B2545] font-bold text-sm shadow-md transition-all flex items-center space-x-2"
                >
                  <span>Chat With NyaySahayak</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 space-y-1">
                <h4 className="font-bold text-white text-sm">Rural & Marginalized Citizens</h4>
                <p className="text-slate-300">Step-by-step guidance to connect with free lawyers via CSC Tele-Law and NALSA.</p>
              </div>
              <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 space-y-1">
                <h4 className="font-bold text-white text-sm">Litigants & Under-trial Families</h4>
                <p className="text-slate-300">Understand CNR number case tracking, bail legal aid, and Lok Adalat dispute settlement.</p>
              </div>
              <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 space-y-1">
                <h4 className="font-bold text-white text-sm">Practicing Lawyers</h4>
                <p className="text-slate-300">Register on Nyaya Bandhu for pro bono service and utilize e-filing 3.0 portal facilities.</p>
              </div>
              <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 space-y-1">
                <h4 className="font-bold text-white text-sm">Law Students & Researchers</h4>
                <p className="text-slate-300">Access official Department of Justice schemes, policies, and judicial reform data.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
