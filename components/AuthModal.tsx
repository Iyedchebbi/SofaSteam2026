
import React, { useState } from 'react';
import { CONTENT } from '../constants';
import { Language } from '../types';
import { Icons } from './Icon';
import { supabase } from '../services/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'signin' | 'signup';
  language: Language;
  onSwitchMode: (type: 'signin' | 'signup') => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, type, language, onSwitchMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const t = CONTENT.auth;
  const isSignUp = type === 'signup';

  const handleSwitch = (newType: 'signin' | 'signup') => {
    setError(null);
    setPassword(''); 
    onSwitchMode(newType);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const cleanedEmail = email.replace(/\s/g, '').trim().toLowerCase();
    const cleanedPassword = password.trim();
    const cleanedName = name.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!cleanedEmail || !emailRegex.test(cleanedEmail)) {
      setError(language === 'ro' ? 'Adresă de email invalidă.' : 'Invalid email address format.');
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: cleanedEmail,
          password: cleanedPassword,
          options: {
            data: {
              full_name: cleanedName,
            },
          },
        });
        
        if (error) throw error;

        if (data.session) {
          alert(language === 'ro' ? 'Cont creat cu succes!' : 'Account created successfully!');
          onClose();
        } else if (data.user && !data.session) {
          alert(language === 'ro' 
            ? 'Cont creat! Te rugăm să verifici emailul pentru confirmare.' 
            : 'Account created! Please check your email for confirmation link.'
          );
          onClose();
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: cleanedEmail,
          password: cleanedPassword,
        });
        if (error) throw error;
        onClose();
      }
    } catch (err: any) {
      const msg = err.message || '';
      
      if (msg.includes('already registered')) {
        setError(language === 'ro' ? 'Acest email este deja înregistrat.' : 'This email is already registered.');
      } else if (msg.includes('Invalid login') || msg.includes('Invalid credentials')) {
        setError(language === 'ro' 
          ? 'Date de conectare invalide. Verificați emailul/parola sau creați un cont.' 
          : 'Invalid credentials. Check email/password or create an account.'
        );
      } else if (msg.includes('rate limit')) {
        setError(language === 'ro' ? 'Prea multe încercări. Așteptați puțin.' : 'Too many requests. Please wait.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: window.location.origin,
              queryParams: {
                prompt: 'consent',
              },
            }
        });
        if (error) throw error;
    } catch (err: any) {
        setError(err.message);
        setGoogleLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-[fadeIn_0.3s_ease-out]">
      <div className="bg-white dark:bg-[#0F172A] rounded-3xl shadow-2xl w-full max-w-md p-8 relative animate-[scaleIn_0.3s_ease-out] border border-gray-100 dark:border-gray-800">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white transition-colors"
        >
          <Icons.X className="w-6 h-6" />
        </button>

        <h2 className="text-3xl font-display font-bold mb-8 text-center text-gray-900 dark:text-white tracking-tight">
          {isSignUp ? t.signUp[language] : t.signIn[language]}
        </h2>

        {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 text-sm rounded-xl border border-red-100 dark:border-red-900/30 flex items-start gap-3">
                <div className="mt-0.5 min-w-[4px] h-4 bg-red-500 rounded-full"></div>
                <span className="flex-1 font-medium">{error}</span>
            </div>
        )}

        <div className="mb-8">
            <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={googleLoading || loading}
                className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-bold py-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed group"
            >
                {googleLoading ? (
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-brand-600 rounded-full animate-spin"></div>
                ) : (
                  <>
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    {t.google[language]}
                  </>
                )}
            </button>
        </div>

        <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
                <span className="px-4 py-1 bg-white dark:bg-[#0F172A] text-gray-400 rounded-full">
                    {language === 'ro' ? 'sau cu email' : 'or with email'}
                </span>
            </div>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {isSignUp && (
            <div className="animate-[fadeIn_0.2s_ease-out]">
              <label className="block text-xs font-bold mb-2 uppercase text-gray-500 tracking-wider ml-1">{t.name[language]}</label>
              <div className="relative group">
                <Icons.User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-brand-500 transition-colors" />
                <input 
                  type="text" 
                  name="name"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 pl-12 pr-4 py-4 focus:ring-2 focus:ring-brand-500 outline-none text-base dark:text-white transition-all placeholder-gray-400 focus:bg-white dark:focus:bg-gray-900"
                  placeholder={language === 'ro' ? "Ion Popescu" : "John Doe"}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold mb-2 uppercase text-gray-500 tracking-wider ml-1">{t.email[language]}</label>
            <div className="relative group">
               <Icons.Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-brand-500 transition-colors" />
               <input 
                type="email" 
                name="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 pl-12 pr-4 py-4 focus:ring-2 focus:ring-brand-500 outline-none text-base dark:text-white transition-all placeholder-gray-400 focus:bg-white dark:focus:bg-gray-900"
                placeholder="hello@sofasteam.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold mb-2 uppercase text-gray-500 tracking-wider ml-1">{t.password[language]}</label>
            <div className="relative group">
               <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-500 transition-colors">
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
               </div>
               <input 
                  type="password" 
                  name="password"
                  autoComplete="current-password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 pl-12 pr-4 py-4 focus:ring-2 focus:ring-brand-500 outline-none text-base dark:text-white transition-all placeholder-gray-400 focus:bg-white dark:focus:bg-gray-900"
                  placeholder="••••••••"
                />
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              disabled={loading || googleLoading}
              className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg hover:shadow-brand-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 active:scale-[0.98]"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                isSignUp ? t.submit[language] : t.signIn[language]
              )}
            </button>
          </div>
          
          <div className="text-center mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
             <p className="text-sm text-gray-600 dark:text-gray-400">
               {isSignUp ? t.haveAccount[language] : t.noAccount[language]}{' '}
               <button 
                 type="button" 
                 onClick={() => handleSwitch(isSignUp ? 'signin' : 'signup')} 
                 className="text-brand-600 hover:text-brand-500 font-bold hover:underline transition-all ml-1"
               >
                 {isSignUp ? t.signInLink[language] : t.signUpLink[language]}
               </button>
             </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;
