import React, { useState } from 'react';
import { 
  Scale, 
  Globe, 
  Moon, 
  Sun, 
  Menu, 
  X, 
  ShieldCheck, 
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { Language } from '../types';

interface HeaderProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  adminLoggedIn?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ currentPage, setCurrentPage, adminLoggedIn }) => {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: t('navHome') },
    { id: 'chat', label: t('navChat'), highlight: true },
    { id: 'about', label: t('navAbout') },
    { id: 'features', label: t('navFeatures') },
    { id: 'sources', label: t('navSources') },
    { id: 'contact', label: t('navContact') },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
      {/* Top Tiranga Tricolor Accent Stripe */}
      <div className="h-1.5 w-full flex">
        <div className="h-full w-1/3 bg-[#FF9933]"></div>
        <div className="h-full w-1/3 bg-white dark:bg-slate-300"></div>
        <div className="h-full w-1/3 bg-[#138808]"></div>
      </div>

      {/* Top Government Information & Accessibility Bar */}
      <div className="bg-[#0B2545] text-slate-100 text-xs py-1.5 px-4 sm:px-8 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <span className="font-medium tracking-wide">भारत सरकार | Government of India</span>
          <span className="text-slate-400 hidden sm:inline">•</span>
          <span className="text-slate-300 hidden sm:inline">Ministry of Law and Justice</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="hidden md:inline text-orange-300 font-medium">
            हेल्पलाइन / National Legal Aid: <strong className="text-white">15100</strong>
          </span>
          <a 
            href="https://doj.gov.in" 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center space-x-1 text-slate-300 hover:text-white transition-colors"
          >
            <span className="hidden sm:inline">doj.gov.in</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Main Brand & Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Department Brand */}
          <div 
            onClick={() => setCurrentPage('home')}
            className="flex items-center space-x-3.5 cursor-pointer group select-none"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0B2545] to-[#133E6D] dark:from-slate-800 dark:to-[#0B2545] flex items-center justify-center text-white shadow-md border border-orange-500/30 group-hover:scale-105 transition-transform">
              <Scale className="w-7 h-7 text-[#FF9933]" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-xl tracking-tight text-[#0B2545] dark:text-white">
                  NyaySahayak
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 border border-orange-300 dark:border-orange-700">
                  Govt. of India
                </span>
              </div>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Department of Justice Virtual Assistant • न्याय सहायक
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => {
              const isActive = currentPage === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => setCurrentPage(link.id)}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#0B2545] text-white dark:bg-orange-500 shadow-sm'
                      : link.highlight
                      ? 'text-orange-600 dark:text-orange-400 font-semibold hover:bg-orange-50 dark:hover:bg-slate-800'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="flex items-center space-x-1.5">
                    {link.highlight && <MessageSquare className="w-4 h-4" />}
                    <span>{link.label}</span>
                  </span>
                </button>
              );
            })}

            {/* Admin Portal Button */}
            <button
              onClick={() => setCurrentPage(adminLoggedIn ? 'admin_dashboard' : 'admin_login')}
              className={`ml-2 px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center space-x-1.5 border ${
                currentPage.startsWith('admin')
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{adminLoggedIn ? 'Admin Panel' : 'Admin'}</span>
            </button>
          </nav>

          {/* Right Action Controls: Language, Theme & Mobile Trigger */}
          <div className="flex items-center space-x-2.5">
            {/* Language Selector */}
            <div className="relative flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
              <Globe className="w-4 h-4 ml-1.5 text-slate-500 dark:text-slate-400 mr-1" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer py-1 pr-1"
                aria-label="Select Language"
              >
                <option value="en" className="dark:bg-slate-800">English</option>
                <option value="hi" className="dark:bg-slate-800">हिन्दी</option>
                <option value="pa" className="dark:bg-slate-800">ਪੰਜਾਬੀ</option>
                <option value="bho" className="dark:bg-slate-800">भोजपुरी</option>
              </select>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-5 space-y-2">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                setCurrentPage(link.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium ${
                currentPage === link.id
                  ? 'bg-[#0B2545] text-white dark:bg-orange-500'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={() => {
              setCurrentPage(adminLoggedIn ? 'admin_dashboard' : 'admin_login');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 flex items-center space-x-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{adminLoggedIn ? 'Admin Panel' : 'Admin Login'}</span>
          </button>
        </div>
      )}
    </header>
  );
};
