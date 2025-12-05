import React from 'react';
import { CONTENT } from '../constants';
import { Language } from '../types';
import { Icons } from './Icon';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
  type: 'signin' | 'signup';
  language: Language;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin, type, language }) => {
  if (!isOpen) return null;

  const t = CONTENT.auth;
  const isSignUp = type === 'signup';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => {
      onLogin();
    }, 500);
  };

  const handleGoogleLogin = () => {
    // Simulate Google Login
    setTimeout(() => {
        onLogin();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 relative animate-[scaleIn_0.3s_ease-out]">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <Icons.X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-brand-700 dark:text-brand-500">
          {isSignUp ? t.signUp[language] : t.signIn[language]}
        </h2>

        <div className="mb-6">
            <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-gray-700 font-medium py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm"
            >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                    />
                    <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                    />
                    <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                    />
                    <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                    />
                </svg>
                {t.google[language]}
            </button>
        </div>

        <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">
                    {language === 'ro' ? 'sau continuă cu email' : 'or continue with email'}
                </span>
            </div>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {isSignUp && (
            <div>
              <label className="block text-sm font-medium mb-1">{t.name[language]}</label>
              <input 
                type="text" 
                required
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-4 py-2 focus:ring-2 focus:ring-brand-500 outline-none"
                placeholder="John Doe"
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium mb-1">{t.email[language]}</label>
            <input 
              type="email" 
              required
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-4 py-2 focus:ring-2 focus:ring-brand-500 outline-none"
              placeholder="hello@sofasteam.ro"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{t.password[language]}</label>
            <input 
              type="password" 
              required
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-4 py-2 focus:ring-2 focus:ring-brand-500 outline-none"
              placeholder="••••••••"
            />
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-xl"
            >
              {t.submit[language]}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;