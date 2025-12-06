
import React, { useState, useEffect, useRef } from 'react';
import { CONTENT } from '../constants';
import { Language, UserProfile } from '../types';
import { Icons } from './Icon';
import { supabase } from '../services/supabase';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any; // Auth user object
  profile: UserProfile | null;
  language: Language;
  onProfileUpdate: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, user, profile, language, onProfileUpdate }) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = CONTENT.profile;

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || user?.user_metadata?.full_name || '');
      setPhone(profile.phone || '');
      setAvatarUrl(profile.avatar_url || '');
    } else if (user) {
      setFullName(user.user_metadata?.full_name || '');
    }
  }, [profile, user, isOpen]);

  if (!isOpen) return null;

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    // Use a simpler filename structure to avoid potential path issues
    const fileName = `avatar_${user.id}_${Date.now()}.${fileExt}`;
    
    setUploading(true);

    try {
        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(fileName, file, {
              cacheControl: '3600',
              upsert: true
            });

        if (uploadError) {
             throw new Error(`Upload failed: ${uploadError.message}. (Hint: Check Supabase Storage RLS Policies)`);
        }

        const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
        setAvatarUrl(data.publicUrl); // Update state to preview
    } catch (error: any) {
        console.error("Avatar upload error:", error);
        alert(error.message || 'Error uploading avatar');
    } finally {
        setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updates = {
        id: user.id,
        full_name: fullName,
        phone: phone,
        avatar_url: avatarUrl,
        // Removed updated_at to fix "column not found" error
      };

      const { error } = await supabase.from('profiles').upsert(updates);
      
      if (error) {
        throw error;
      }
      
      onProfileUpdate();
      onClose();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      const errorMessage = error.message || JSON.stringify(error);
      alert(language === 'ro' 
        ? `Eroare la actualizarea profilului: ${errorMessage}` 
        : `Error updating profile: ${errorMessage}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 relative overflow-hidden max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors z-10"
        >
          <Icons.X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold mb-8 text-center text-brand-700 dark:text-brand-500">
          {t.title[language]}
        </h2>

        <div className="flex flex-col items-center mb-8">
           <div 
             className="relative group cursor-pointer w-32 h-32" 
             onClick={() => !uploading && fileInputRef.current?.click()}
           >
               <div className="w-full h-full rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden border-4 border-white dark:border-gray-600 shadow-xl relative">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-500">
                      <Icons.User className="w-16 h-16" />
                    </div>
                  )}
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-[1px]">
                     <Icons.Upload className="w-8 h-8 text-white animate-bounce" />
                  </div>

                  {/* Loading State */}
                  {uploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                      <div className="w-8 h-8 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                    </div>
                  )}
               </div>
               
               <div className="absolute bottom-0 right-0 bg-brand-600 text-white p-2 rounded-full shadow-lg border-2 border-white dark:border-gray-800 group-hover:scale-110 transition-transform">
                  <Icons.Image className="w-4 h-4" />
               </div>
           </div>
           
           <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={uploading}
            />
           
           <p className="mt-4 text-sm text-gray-500 font-medium">
             {uploading ? t.uploading[language] : t.upload[language]}
           </p>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block text-xs font-bold mb-1.5 uppercase text-gray-500 tracking-wider ml-1">{t.fullName[language]}</label>
            <div className="relative">
              <Icons.User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 pl-10 pr-4 py-3 focus:ring-2 focus:ring-brand-500 outline-none text-base dark:text-white transition-all"
                placeholder="John Doe"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold mb-1.5 uppercase text-gray-500 tracking-wider ml-1">{t.phone[language]}</label>
            <div className="relative">
              <Icons.Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="tel" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 pl-10 pr-4 py-3 focus:ring-2 focus:ring-brand-500 outline-none text-base dark:text-white transition-all"
                placeholder="+40 700 000 000"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg mt-6 flex justify-center items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div> : t.save[language]}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;
