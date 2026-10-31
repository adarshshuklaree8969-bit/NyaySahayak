import React from 'react';
import { Scale, PhoneCall, ExternalLink, ShieldCheck, Mail, MapPin } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface FooterProps {
  setCurrentPage: (page: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentPage }) => {
  const { t } = useLanguage();

  return (
    <footer className="bg-[#0B2545] text-slate-300 pt-12 pb-8 border-t-4 border-[#FF9933]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          
          {/* Col 1: Brand & Mission */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center border border-orange-400">
                <Scale className="w-6 h-6 text-[#FF9933]" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg tracking-wide">NyaySahayak</h3>
                <p className="text-xs text-orange-300">न्याय सहायक • Department of Justice</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              An intelligent, multilingual AI virtual assistant developed for the Department of Justice, Ministry of Law & Justice, Government of India to empower citizens with accessible legal knowledge.
            </p>
            <div className="inline-flex items-center space-x-2 text-xs text-emerald-400 bg-emerald-950/60 px-3 py-1.5 rounded border border-emerald-800">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified Government Knowledge Base</span>
            </div>
          </div>

          {/* Col 2: Official Portals */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white border-b border-slate-700 pb-2">
              Official Portals
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="https://doj.gov.in" target="_blank" rel="noreferrer" className="flex items-center space-x-1.5 hover:text-white transition-colors">
                  <ExternalLink className="w-3.5 h-3.5 text-orange-400" />
                  <span>Department of Justice (doj.gov.in)</span>
                </a>
              </li>
              <li>
                <a href="https://ecourts.gov.in" target="_blank" rel="noreferrer" className="flex items-center space-x-1.5 hover:text-white transition-colors">
                  <ExternalLink className="w-3.5 h-3.5 text-orange-400" />
                  <span>eCourts Services Portal (ecourts.gov.in)</span>
                </a>
              </li>
              <li>
                <a href="https://nalsa.gov.in" target="_blank" rel="noreferrer" className="flex items-center space-x-1.5 hover:text-white transition-colors">
                  <ExternalLink className="w-3.5 h-3.5 text-orange-400" />
                  <span>National Legal Services Authority (NALSA)</span>
                </a>
              </li>
              <li>
                <a href="https://tele-law.in" target="_blank" rel="noreferrer" className="flex items-center space-x-1.5 hover:text-white transition-colors">
                  <ExternalLink className="w-3.5 h-3.5 text-orange-400" />
                  <span>Tele-Law Portal (tele-law.in)</span>
                </a>
              </li>
              <li>
                <a href="https://www.probono-doj.in" target="_blank" rel="noreferrer" className="flex items-center space-x-1.5 hover:text-white transition-colors">
                  <ExternalLink className="w-3.5 h-3.5 text-orange-400" />
                  <span>Nyaya Bandhu (probono-doj.in)</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Citizen Services Navigation */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white border-b border-slate-700 pb-2">
              Citizen Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => setCurrentPage('chat')} className="hover:text-white transition-colors text-left">
                  → Launch AI Chatbot
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentPage('about')} className="hover:text-white transition-colors text-left">
                  → About NyaySahayak
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentPage('features')} className="hover:text-white transition-colors text-left">
                  → AI Capabilities & RAG Architecture
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentPage('sources')} className="hover:text-white transition-colors text-left">
                  → Verified Knowledge Repository
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentPage('privacy')} className="hover:text-white transition-colors text-left">
                  → Privacy Policy & Data Guidelines
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentPage('contact')} className="hover:text-white transition-colors text-left">
                  → Grievance & Contact Portal
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Emergency Helpline & Contact */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white border-b border-slate-700 pb-2">
              Emergency & Support
            </h4>
            <div className="p-3.5 rounded-lg bg-orange-500/10 border border-orange-500/30 text-xs space-y-2">
              <div className="flex items-center space-x-2 text-orange-300 font-bold text-sm">
                <PhoneCall className="w-4 h-4" />
                <span>Toll-Free Helpline: 15100</span>
              </div>
              <p className="text-slate-300">
                24x7 National Legal Aid Helpline for free advice and aid to eligible citizens under Section 12 of LSA Act.
              </p>
            </div>
            <div className="text-xs space-y-1.5 text-slate-400">
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <span>Jaisalmer House, 26, Man Singh Road, New Delhi - 110011</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-orange-400 shrink-0" />
                <span>contact-doj@gov.in</span>
              </div>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer Box */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 leading-relaxed mb-6">
          <strong className="text-slate-200">Statutory Disclaimer: </strong>
          NyaySahayak (न्याय सहायक) is an AI virtual assistant created for public informational guidance and legal awareness. It does not replace professional legal advice, formal court orders, or official gazette notifications from the Department of Justice, Ministry of Law and Justice, Government of India.
        </div>

        {/* Bottom Copyright & Digital India Badge */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400 gap-3">
          <div>
            © 2026 Department of Justice, Ministry of Law & Justice, Govt. of India. All Rights Reserved.
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-slate-500">Ministry of Law and Justice</span>
            <span>•</span>
            <span className="text-orange-400 font-medium">Digital India Initiative</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
