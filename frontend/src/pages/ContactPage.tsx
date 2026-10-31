import React, { useState } from 'react';
import { MapPin, Phone, Mail, ExternalLink, Send, CheckCircle2, Headphones, AlertCircle } from 'lucide-react';

interface ContactPageProps {
  setCurrentPage: (page: string) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ setCurrentPage }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.message) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' });
    }, 4000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0B2545] dark:text-white">
          Contact & Citizen Grievance Portal
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Official communication channels of the Department of Justice, Ministry of Law & Justice, Government of India.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* Left Column: Official Contact Info & Emergency Helpline */}
        <div className="space-y-6">
          
          {/* Toll-free Helpline Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-lg space-y-3">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-white/20 rounded-2xl">
                <Headphones className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xs font-semibold text-orange-100 uppercase tracking-wider">
                  24x7 National Legal Aid Helpline
                </span>
                <div className="text-3xl font-extrabold">15100</div>
              </div>
            </div>
            <p className="text-xs text-orange-50 leading-relaxed">
              Toll-free telephone assistance operated by NALSA to provide immediate free legal assistance and scheme guidance to all eligible citizens.
            </p>
          </div>

          {/* Department Headquarter Details */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-5">
            <h3 className="font-bold text-base text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-3">
              Department of Justice Headquarters
            </h3>

            <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 dark:text-white block text-sm">Jaisalmer House</strong>
                  <span>26, Man Singh Road, New Delhi, Delhi - 110011, India</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-blue-500 shrink-0" />
                <div>
                  <strong className="text-slate-900 dark:text-white block text-sm">Control Room / Reception</strong>
                  <span>+91-11-23383613 / 23383614</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-emerald-500 shrink-0" />
                <div>
                  <strong className="text-slate-900 dark:text-white block text-sm">Official Inquiries</strong>
                  <span>support-doj@gov.in</span>
                </div>
              </div>
            </div>

            {/* CPGRAMS Grievance Portal Link */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
              <a
                href="https://pgportal.gov.in/"
                target="_blank"
                rel="noreferrer"
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center justify-between group"
              >
                <div>
                  <span className="font-bold text-xs text-slate-900 dark:text-white block">
                    CPGRAMS Public Grievance Portal
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Lodge formal grievances directly with Central Government
                  </span>
                </div>
                <ExternalLink className="w-4 h-4 text-orange-500 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>
          </div>

        </div>

        {/* Right Column: Citizen Inquiries / Feedback Form */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 sm:p-10 shadow-sm space-y-6">
          <div className="space-y-1">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
              Send Citizen Feedback or Inquiry
            </h3>
            <p className="text-xs text-slate-500">
              Have a suggestion or request regarding judicial awareness? Reach out to the project team.
            </p>
          </div>

          {submitted ? (
            <div className="p-6 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-center space-y-2 animate-fade-in">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <h4 className="font-bold text-sm">Message Successfully Submitted!</h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-300">
                Thank you for helping improve citizen access to justice.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Your Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Email Address (Optional)</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Topic / Subject</label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="General Inquiry">General Judicial Inquiry</option>
                  <option value="Tele-Law Assistance">Tele-Law Assistance</option>
                  <option value="eCourts Feedback">eCourts Service Feedback</option>
                  <option value="Legal Aid Information">Free Legal Aid Query</option>
                  <option value="Portal Review">Portal Evaluation & Feedback</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Message / Inquiry *</label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Write your comments or questions here..."
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#0B2545] hover:bg-[#133E6D] text-white font-semibold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center space-x-2"
              >
                <Send className="w-4 h-4 text-orange-400" />
                <span>Submit Message</span>
              </button>
            </form>
          )}

        </div>

      </div>

    </div>
  );
};
