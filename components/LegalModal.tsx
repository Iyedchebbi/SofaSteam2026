
import React from 'react';
import { CONTENT } from '../constants';
import { Language } from '../types';
import { Icons } from './Icon';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'privacy' | 'terms' | null;
  language: Language;
}

const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose, type, language }) => {
  if (!isOpen || !type) return null;

  const content = CONTENT.legal[type];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col relative overflow-hidden border border-gray-200 dark:border-gray-800 animate-[scaleIn_0.3s_ease-out]">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-900 z-10">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
             <div className="p-2 bg-brand-50 dark:bg-brand-900/20 rounded-lg text-brand-600">
               <Icons.ShieldCheck className="w-6 h-6" />
             </div>
             {content.title[language]}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all"
          >
            <Icons.X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-8 space-y-4 text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
           <div 
             className="prose dark:prose-invert max-w-none prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:mb-4 prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4 prose-a:text-brand-600"
             dangerouslySetInnerHTML={{ __html: content.content[language] }}
           />
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 flex justify-end">
           <button 
             onClick={onClose}
             className="px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95"
           >
             {language === 'en' ? 'Close' : 'Închide'}
           </button>
        </div>
      </div>
    </div>
  );
};

export default LegalModal;
