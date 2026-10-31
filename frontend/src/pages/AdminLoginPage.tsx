import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  AlertCircle, 
  KeyRound, 
  ArrowRight, 
  RefreshCw, 
  CheckCircle2, 
  ArrowLeft,
  Smartphone,
  MailCheck
} from 'lucide-react';
import { api } from '../services/api';

interface AdminLoginPageProps {
  onLoginSuccess: (token: string, user: any) => void;
  setCurrentPage: (page: string) => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onLoginSuccess, setCurrentPage }) => {
  // Modes: 'otp' | 'password'
  const [authMode, setAuthMode] = useState<'otp' | 'password'>('otp');
  
  // OTP flow stages: 1 = Enter Email, 2 = Enter & Verify OTP
  const [step, setStep] = useState<1 | 2>(1);
  
  // Form fields
  const [identifier, setIdentifier] = useState('admin@doj.gov.in');
  const [otpCode, setOtpCode] = useState('');
  const [password, setPassword] = useState('NyayAdmin@2026');
  
  // State indicators
  const [smtpConfigured, setSmtpConfigured] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Resend cooldown timer
  useEffect(() => {
    let timer: any;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Handle Request OTP
  const handleRequestOTP = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      const res = await api.sendAdminOTP(identifier);
      setSmtpConfigured(!!res.smtp_configured);
      setSuccessMsg(res.message);
      setStep(2);
      setResendCooldown(60);
      setOtpCode('');
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch OTP. Please verify your email address.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Verify OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.length < 4) {
      setError('Please enter the 6-digit OTP received in your Gmail inbox');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const data = await api.verifyAdminOTP(identifier, otpCode.trim());
      onLoginSuccess(data.access_token, data.user);
    } catch (err: any) {
      setError(err.message || 'Invalid or expired OTP code. Please check your inbox or request a new code.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Fallback Password Login
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const data = await api.loginAdmin(identifier, password);
      onLoginSuccess(data.access_token, data.user);
    } catch (err: any) {
      setError(err.message || 'Invalid administrative credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6 bg-white dark:bg-slate-800 p-8 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl transition-all">
        
        {/* Department Branding & Icon */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-[#0B2545] text-white flex items-center justify-center mx-auto shadow-md border border-orange-500/40">
            <ShieldCheck className="w-8 h-8 text-[#FF9933]" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Admin Knowledge Portal
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Department of Justice • Ministry of Law & Justice, Govt. of India
          </p>
        </div>

        {/* 2-Factor Authentication Mode Badge */}
        <div className="flex items-center justify-center space-x-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
          <Smartphone className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Government 2-Factor Authentication (OTP via Email)</span>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-800 dark:text-emerald-300 flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* MODE: OTP AUTHENTICATION */}
        {authMode === 'otp' && (
          <>
            {/* STEP 1: Enter Official Email & Request OTP */}
            {step === 1 && (
              <form onSubmit={handleRequestOTP} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Official Government Email / Officer ID *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-orange-500 shadow-inner"
                      placeholder="admin@doj.gov.in or your.name@gmail.com"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 pt-0.5">
                    A secure 6-digit OTP will be dispatched to this email address.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-[#0B2545] hover:bg-[#133E6D] text-white font-semibold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <span>Dispatching OTP to your Email...</span>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4 text-orange-400" />
                      <span>Send Verification OTP</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* STEP 2: Enter & Verify 6-Digit OTP from Email */}
            {step === 2 && (
              <form onSubmit={handleVerifyOTP} className="space-y-5 animate-fade-in">
                
                {/* Email Delivery Confirmation Card */}
                <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 space-y-2">
                  <div className="flex items-center space-x-2 text-blue-900 dark:text-blue-200 font-semibold text-xs">
                    <MailCheck className="w-4 h-4 text-emerald-600" />
                    <span>OTP Sent to Your Email</span>
                  </div>
                  <p className="text-[12px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    A 6-digit one-time password has been sent to <strong>{identifier}</strong>. Please check your Gmail Inbox or Spam folder and enter the code below.
                  </p>
                  {!smtpConfigured && (
                    <div className="pt-2 border-t border-blue-100 dark:border-blue-900/60 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                      <div>💡 <strong>Note on Live Delivery:</strong> To send emails directly to your Gmail inbox, add your Gmail App Password to <code className="font-mono text-orange-600 dark:text-orange-400">backend/.env</code> (SMTP_USER & SMTP_PASSWORD).</div>
                      <div>For local testing without SMTP, the generated OTP is also safely printed in your backend server terminal.</div>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      Enter 6-Digit Code from Email *
                    </label>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-orange-600 dark:text-orange-400 hover:underline flex items-center space-x-1 text-[11px]"
                    >
                      <ArrowLeft className="w-3 h-3" />
                      <span>Change Email</span>
                    </button>
                  </div>

                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="• • • • • •"
                    className="w-full text-center tracking-[0.5em] font-mono text-xl sm:text-2xl font-bold py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-orange-500 shadow-inner"
                  />
                  <p className="text-[11px] text-slate-500 text-center">
                    Check your email inbox ({identifier}) for the 6-digit code
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otpCode.length < 4}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#0B2545] to-[#133E6D] hover:from-[#061629] hover:to-[#0B2545] text-white font-semibold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <span>Verifying Security Token...</span>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Verify OTP & Access Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="text-center pt-1">
                  {resendCooldown > 0 ? (
                    <span className="text-xs text-slate-400">
                      Resend OTP in <strong className="text-slate-600 dark:text-slate-300">{resendCooldown}s</strong>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleRequestOTP()}
                      className="text-xs font-semibold text-orange-600 dark:text-orange-400 hover:underline flex items-center justify-center space-x-1 mx-auto"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Resend OTP Code</span>
                    </button>
                  )}
                </div>
              </form>
            )}

            {/* Switch Mode to Password */}
            <div className="pt-2 text-center border-t border-slate-100 dark:border-slate-700">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('password');
                  setError(null);
                }}
                className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium"
              >
                Sign in with Password instead
              </button>
            </div>
          </>
        )}

        {/* MODE: PASSWORD FALLBACK AUTHENTICATION */}
        {authMode === 'password' && (
          <form onSubmit={handlePasswordLogin} className="space-y-4 animate-fade-in">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Administrative Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="email"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-[#0B2545] hover:bg-[#133E6D] text-white font-semibold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <KeyRound className="w-4 h-4 text-orange-400" />
                  <span>Sign In with Password</span>
                </>
              )}
            </button>

            <div className="pt-2 text-center border-t border-slate-100 dark:border-slate-700">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('otp');
                  setStep(1);
                  setError(null);
                }}
                className="text-xs text-orange-600 dark:text-orange-400 hover:underline font-semibold"
              >
                ← Back to OTP Authentication
              </button>
            </div>
          </form>
        )}

        {/* Back Link */}
        <div className="text-center pt-2">
          <button
            onClick={() => setCurrentPage('home')}
            className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          >
            ← Return to Citizen Portal
          </button>
        </div>

      </div>
    </div>
  );
};
