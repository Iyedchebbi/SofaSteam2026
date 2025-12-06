
import React, { useState, useEffect } from 'react';
import { CONTENT } from '../constants';
import { Language } from '../types';
import { Icons } from './Icon';

interface OnboardingGuideProps {
  language: Language;
}

const OnboardingGuide: React.FC<OnboardingGuideProps> = ({ language }) => {
  const [step, setStep] = useState(0); // 0 = Inactive/Hidden, 1 = Welcome Modal, 2+ = Actual Steps
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  // Define steps linked to DOM IDs
  const guideSteps = [
    { id: 'services-filter', ...CONTENT.guide.steps[0] },
    { id: 'ai-widget', ...CONTENT.guide.steps[1] },
    { id: 'auth-button', ...CONTENT.guide.steps[2] }
  ];

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('hasSeenTour');
    if (!hasSeenTour) {
      const timer = setTimeout(() => {
          setStep(1); // Start with Welcome Modal
      }, 1500); // Slight delay after load
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (step > 1) {
      const targetId = guideSteps[step - 2].id;
      const element = document.getElementById(targetId);
      
      if (element) {
        // Scroll to element
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Wait for scroll to finish then set rect
        const updateRect = () => {
            setTargetRect(element.getBoundingClientRect());
        };
        
        updateRect();
        // Update on resize/scroll
        window.addEventListener('resize', updateRect);
        window.addEventListener('scroll', updateRect);
        
        // Small timeout to allow scroll to settle for exact positioning
        const t = setTimeout(updateRect, 500);

        return () => {
            window.removeEventListener('resize', updateRect);
            window.removeEventListener('scroll', updateRect);
            clearTimeout(t);
        };
      }
    } else {
        setTargetRect(null);
    }
  }, [step]);

  const handleNext = () => {
    if (step - 1 < guideSteps.length) {
      setStep(step + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = () => {
    setStep(0);
    localStorage.setItem('hasSeenTour', 'true');
  };

  if (step === 0) return null;

  // Render Welcome Modal
  if (step === 1) {
      return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-[fadeIn_0.5s_ease-out]">
            <div className="bg-white dark:bg-gray-900 p-8 rounded-[2rem] shadow-2xl max-w-sm text-center border border-white/20 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-400 to-brand-600"></div>
                <div className="mb-6 inline-flex p-4 bg-brand-50 dark:bg-brand-900/20 rounded-full text-brand-600 mb-4">
                    <Icons.Sparkles className="w-8 h-8 animate-pulse" />
                </div>
                <h2 className="text-2xl font-bold mb-3 font-display">{CONTENT.guide.welcome.title[language]}</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-8">{CONTENT.guide.welcome.desc[language]}</p>
                <div className="flex gap-4 justify-center">
                    <button onClick={handleFinish} className="px-6 py-3 text-gray-500 hover:text-gray-800 dark:hover:text-white font-medium transition-colors">
                        {CONTENT.guide.welcome.skip[language]}
                    </button>
                    <button onClick={handleNext} className="px-8 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold shadow-lg shadow-brand-500/30 transition-all hover:scale-105">
                        {CONTENT.guide.welcome.btn[language]}
                    </button>
                </div>
            </div>
        </div>
      );
  }

  // Render Spotlight Steps
  const currentGuide = guideSteps[step - 2];
  const isLastStep = step - 1 === guideSteps.length;

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden pointer-events-none">
       {/* Dark Overlay with Cutout */}
       <div className="absolute inset-0 bg-black/50 transition-all duration-500" style={{ clipPath: targetRect ? `polygon(0% 0%, 0% 100%, ${targetRect.left}px 100%, ${targetRect.left}px ${targetRect.top}px, ${targetRect.right}px ${targetRect.top}px, ${targetRect.right}px ${targetRect.bottom}px, ${targetRect.left}px ${targetRect.bottom}px, ${targetRect.left}px 100%, 100% 100%, 100% 0%)` : 'none' }}></div>
       
       {targetRect && (
         <>
            {/* Spotlight Border */}
            <div 
                className="absolute border-4 border-brand-500 rounded-xl shadow-[0_0_30px_rgba(12,141,233,0.5)] transition-all duration-500 pointer-events-none"
                style={{
                    top: targetRect.top - 4,
                    left: targetRect.left - 4,
                    width: targetRect.width + 8,
                    height: targetRect.height + 8,
                }}
            ></div>

            {/* Tooltip & Arrow */}
            <div 
                className="absolute pointer-events-auto transition-all duration-500 flex flex-col items-center"
                style={{
                    top: targetRect.bottom + 20, // Default below
                    left: targetRect.left + (targetRect.width / 2) - 150, // Centered roughly
                }}
            >
                {/* Hand-drawn Arrow SVG */}
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-12 h-12 text-white animate-bounce">
                   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 19V5" />
                      <path d="M5 12l7 7 7-7" />
                   </svg>
                </div>

                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-2xl w-[300px] border border-gray-200 dark:border-gray-800 relative">
                    {/* Little Triangle Pointer */}
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white dark:bg-gray-900 border-t border-l border-gray-200 dark:border-gray-800 transform rotate-45"></div>
                    
                    <h3 className="font-bold text-lg mb-2 text-brand-600">{currentGuide.title[language]}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                        {currentGuide.desc[language]}
                    </p>
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400 font-bold tracking-widest uppercase">Step {step - 1}/{guideSteps.length}</span>
                        <button 
                            onClick={handleNext}
                            className="bg-brand-600 hover:bg-brand-500 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-md transition-all hover:translate-x-1 flex items-center gap-2"
                        >
                            {isLastStep ? CONTENT.guide.finish[language] : CONTENT.guide.next[language]}
                            <Icons.ArrowRight className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            </div>
         </>
       )}
    </div>
  );
};

export default OnboardingGuide;
