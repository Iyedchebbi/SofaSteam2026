import React, { useState, useRef, useEffect } from 'react';
import { Icons } from './Icon';
import { generateCleaningAdvice } from '../services/geminiService';
import { ChatMessage, Language } from '../types';
import { CONTENT } from '../constants';

interface ChatAssistantProps {
  language: Language;
  onClose?: () => void;
}

const ChatAssistant: React.FC<ChatAssistantProps> = ({ language, onClose }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const t = CONTENT.assistant;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const { text, sources } = await generateCleaningAdvice(userMsg.text, language);
      
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: text,
        groundingSources: sources
      };
      
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: language === 'ro' 
          ? "Îmi pare rău, am întâmpinat o eroare. Vă rugăm să încercați din nou mai târziu." 
          : "I apologize, I encountered an error. Please try again later.",
        isError: true
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 transition-colors duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-brand-600 text-white">
         <div className="flex items-center gap-2">
            <Icons.Sparkles className="w-5 h-5" />
            <h3 className="font-bold">{t.title[language]}</h3>
         </div>
         {onClose && (
            <button onClick={onClose} className="hover:bg-brand-700 p-1 rounded transition-colors">
               <Icons.X className="w-5 h-5" />
            </button>
         )}
      </div>

      {/* Chat Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60 text-center p-4">
            <Icons.Search className="w-12 h-12 mb-3" />
            <p className="text-sm">
              {language === 'ro' 
                ? "Întreabă orice despre curățenie. Folosesc Google Search!" 
                : "Ask anything about cleaning. I use Google Search!"}
            </p>
          </div>
        )}
        
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`max-w-[90%] rounded-2xl p-3 text-sm ${
                msg.role === 'user' 
                  ? 'bg-brand-600 text-white rounded-br-none' 
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-bl-none shadow-sm dark:text-gray-100'
              } ${msg.isError ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' : ''}`}
            >
              <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
              
              {/* Citations/Grounding */}
              {msg.groundingSources && msg.groundingSources.length > 0 && (
                <div className="mt-3 pt-2 border-t border-gray-200/50 dark:border-gray-700/50">
                  <p className="text-[10px] font-semibold mb-1 opacity-70">
                    {language === 'ro' ? 'Surse:' : 'Sources:'}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {msg.groundingSources.map((source, idx) => (
                      source.web && (
                        <a 
                          key={idx}
                          href={source.web.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 px-1.5 py-0.5 rounded transition-colors flex items-center gap-1 truncate max-w-[150px]"
                        >
                          <Icons.Globe className="w-2.5 h-2.5" />
                          {source.web.title}
                        </a>
                      )
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-bl-none p-3 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex space-x-1.5">
                <div className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce delay-100"></div>
                <div className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={t.placeholder[language]}
            className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all dark:text-white"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-all shadow-md active:scale-95"
          >
            <Icons.Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-center mt-1.5 text-gray-400">
          {t.disclaimer[language]}
        </p>
      </div>
    </div>
  );
};

export default ChatAssistant;