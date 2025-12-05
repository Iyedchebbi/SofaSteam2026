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
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const t = CONTENT.auth;
  const isSignUp = type === 'signup';

  const handleSwitch = (newType: 'signin' | 'signup') => {
    setError(null);
    setPassword(''); // Clear password on switch for security/UX
    onSwitchMode(newType);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Robust sanitization: Remove all whitespace including non-breaking spaces (U+00A0)
    // This fixes issues where copy-pasting emails introduces invisible characters
    const cleanedEmail = email.replace(/\s/g, '').trim().toLowerCase();
    const cleanedPassword = password.trim(); // Passwords shouldn't have leading/trailing spaces usually, but be careful here.
    const cleanedName = name.trim();

    // Basic frontend validation
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

        // Check if session was created immediately (Email Confirmation Disabled)
        if (data.session) {
          alert(language === 'ro' ? 'Cont creat cu succes!' : 'Account created successfully!');
          onClose();
        } else if (data.user && !data.session) {
          // Email Confirmation Enabled
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
      console.error("Auth Error:", err);
      // Map common Supabase errors to user-friendly messages
      const msg = err.message || '';
      
      if (msg.includes('already registered')) {
        setError(language === 'ro' ? 'Acest email este deja înregistrat.' : 'This email is already registered.');
      } else if (msg.includes('Invalid login') || msg.includes('Invalid credentials')) {
        setError(language === 'ro' 
          ? 'Date de conectare invalide. Verificați emailul/parola sau creați un cont.' 
          : 'Invalid credentials. Check email/password or create an account.'
        );
      } else if (msg.includes('invalid') && msg.includes('email')) {
         setError(language === 'ro' ? 'Formatul emailului este invalid.' : 'Invalid email format.');
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
    try {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              queryParams: {
                access_type: 'offline',
                prompt: 'consent',
              },
            }
        });
        if (error) throw error;
    } catch (err: any) {
        setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 relative animate-[scaleIn_0.3s_ease-out]">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
        >
          <Icons.X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-brand-700 dark:text-brand-500 text-center">
          {isSignUp ? t.signUp[language] : t.signIn[language]}
        </h2>

        {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-lg border border-red-200 dark:border-red-800 flex items-start gap-2">
                <div className="mt-0.5 min-w-[4px] h-4 bg-red-500 rounded-full"></div>
                <span className="flex-1">{error}</span>
            </div>
        )}

        <div className="mb-6">
            <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-gray-700 font-medium py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm"
            >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                {t.google[language]}
            </button>
        </div>

        <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
                <span className="px-3 py-1 bg-white dark:bg-gray-800 text-gray-500 rounded-full">
                    {language === 'ro' ? 'sau continuă cu email' : 'or continue with email'}
                </span>
            </div>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {isSignUp && (
            <div className="animate-[fadeIn_0.2s_ease-out]">
              <label className="block text-sm font-medium mb-1 dark:text-gray-200">{t.name[language]}</label>
              <div className="relative">
                <Icons.User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  name="name"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-brand-500 outline-none dark:text-white transition-all"
                  placeholder={language === 'ro' ? "Ion Popescu" : "John Doe"}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-200">{t.email[language]}</label>
            <div className="relative">
               <Icons.Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
               <input 
                type="email" 
                name="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-brand-500 outline-none dark:text-white transition-all"
                placeholder="hello@sofasteam.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-200">{t.password[language]}</label>
            <input 
              type="password" 
              name="password"
              autoComplete="current-password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-4 py-2.5 focus:ring-2 focus:ring-brand-500 outline-none dark:text-white transition-all"
              placeholder="••••••••"
            />
          </div>

          <div className="pt-2">
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                isSignUp ? t.submit[language] : t.signIn[language]
              )}
            </button>
          </div>
          
          <div className="text-center mt-4 pt-2 border-t border-gray-100 dark:border-gray-700">
             <p className="text-sm text-gray-600 dark:text-gray-400">
               {isSignUp ? t.haveAccount[language] : t.noAccount[language]}{' '}
               <button 
                 type="button" 
                 onClick={() => handleSwitch(isSignUp ? 'signin' : 'signup')} 
                 className="text-brand-600 hover:text-brand-700 font-bold hover:underline transition-all"
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