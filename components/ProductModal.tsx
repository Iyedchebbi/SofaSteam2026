
import React, { useState, useEffect, useRef } from 'react';
import { CONTENT } from '../constants';
import { Language, Product, ProductCategory } from '../types';
import { Icons } from './Icon';
import { supabase } from '../services/supabase';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
  onSaved: () => void;
  language: Language;
}

const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, product, onSaved, language }) => {
  const [formData, setFormData] = useState({
    name_en: '',
    name_ro: '',
    description_en: '',
    description_ro: '',
    price: '',
    category: 'general' as ProductCategory,
    promotion_percentage: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (product) {
      setFormData({
        name_en: product.name_en,
        name_ro: product.name_ro,
        description_en: product.description_en,
        description_ro: product.description_ro,
        price: product.price.toString(),
        category: product.category as ProductCategory,
        promotion_percentage: product.promotion_percentage ? product.promotion_percentage.toString() : ''
      });
      setPreviewUrl(product.image);
    } else {
      setFormData({
        name_en: '', name_ro: '', description_en: '', description_ro: '',
        price: '', category: 'general', promotion_percentage: ''
      });
      setPreviewUrl('');
    }
    setImageFile(null);
  }, [product, isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const calculateDiscountedPrice = () => {
    const price = parseFloat(formData.price);
    const promo = parseFloat(formData.promotion_percentage);
    if (!isNaN(price) && !isNaN(promo) && promo > 0) {
      return (price * (1 - promo / 100)).toFixed(2);
    }
    return null;
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = product?.image || '';

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `service_${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(fileName, imageFile, {
            cacheControl: '3600',
            upsert: true
          });

        if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

        const { data } = supabase.storage.from('products').getPublicUrl(fileName);
        imageUrl = data.publicUrl;
      } else if (!imageUrl) {
        alert(language === 'ro' ? 'Vă rugăm să selectați o imagine.' : 'Please select an image.');
        setLoading(false);
        return;
      }

      const payload = {
        name_en: formData.name_en,
        name_ro: formData.name_ro,
        description_en: formData.description_en,
        description_ro: formData.description_ro,
        price: parseFloat(formData.price),
        image: imageUrl,
        category: formData.category,
        promotion_percentage: formData.promotion_percentage ? parseFloat(formData.promotion_percentage) : null
      };

      if (product) {
        const { error } = await supabase
          .from('products')
          .update(payload)
          .eq('id', product.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('products')
          .insert([payload]);
        if (error) throw error;
      }

      onSaved();
      onClose();
    } catch (error: any) {
      console.error('Error saving service:', error);
      alert(`Failed to save: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const discountedPrice = calculateDiscountedPrice();

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-800">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
        >
          <Icons.X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-4">
          {product ? CONTENT.admin.editProduct[language] : CONTENT.admin.addProduct[language]}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
               <div>
                  <label className="block text-xs font-bold mb-1 uppercase text-gray-500 tracking-wider">Service Name (EN)</label>
                  <input required type="text" value={formData.name_en} onChange={e => setFormData({...formData, name_en: e.target.value})}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2.5 outline-none focus:ring-2 focus:ring-brand-500 dark:text-white transition-all text-base" />
               </div>
               <div>
                  <label className="block text-xs font-bold mb-1 uppercase text-gray-500 tracking-wider">Description (EN)</label>
                  <textarea required rows={4} value={formData.description_en} onChange={e => setFormData({...formData, description_en: e.target.value})}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2.5 outline-none focus:ring-2 focus:ring-brand-500 dark:text-white transition-all resize-none text-base" />
               </div>
            </div>
            
            <div className="space-y-4">
               <div>
                  <label className="block text-xs font-bold mb-1 uppercase text-gray-500 tracking-wider">Nume Serviciu (RO)</label>
                  <input required type="text" value={formData.name_ro} onChange={e => setFormData({...formData, name_ro: e.target.value})}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2.5 outline-none focus:ring-2 focus:ring-brand-500 dark:text-white transition-all text-base" />
               </div>
               <div>
                  <label className="block text-xs font-bold mb-1 uppercase text-gray-500 tracking-wider">Descriere (RO)</label>
                  <textarea required rows={4} value={formData.description_ro} onChange={e => setFormData({...formData, description_ro: e.target.value})}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2.5 outline-none focus:ring-2 focus:ring-brand-500 dark:text-white transition-all resize-none text-base" />
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
                <label className="block text-xs font-bold mb-1 uppercase text-gray-500 tracking-wider">Starting Price (RON)</label>
                <div className="relative">
                   <input required type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})}
                     className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2.5 outline-none focus:ring-2 focus:ring-brand-500 dark:text-white transition-all text-base" />
                   <span className="absolute right-3 top-2.5 text-gray-400 font-bold text-sm">RON</span>
                </div>
             </div>
             <div>
                <label className="block text-xs font-bold mb-1 uppercase text-gray-500 tracking-wider">Category</label>
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as ProductCategory})}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2.5 outline-none focus:ring-2 focus:ring-brand-500 dark:text-white cursor-pointer text-base">
                    <option value="upholstery">Upholstery (Canapele)</option>
                    <option value="carpet">Carpet (Covoare)</option>
                    <option value="auto">Auto Detailing</option>
                    <option value="general">General / Other</option>
                </select>
             </div>
          </div>

          {/* Promotion Section */}
          <div className="bg-brand-50 dark:bg-brand-900/10 p-4 rounded-xl border border-brand-100 dark:border-brand-900/30">
            <h3 className="text-sm font-bold text-brand-700 dark:text-brand-300 mb-3 flex items-center gap-2">
              <Icons.Sparkles className="w-4 h-4" /> 
              Promotion (Optional)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div>
                <label className="block text-xs font-bold mb-1 uppercase text-gray-500 tracking-wider">Discount Percentage (%)</label>
                <input 
                  type="number" 
                  min="0" 
                  max="100" 
                  value={formData.promotion_percentage} 
                  onChange={e => setFormData({...formData, promotion_percentage: e.target.value})}
                  placeholder="e.g., 20"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5 outline-none focus:ring-2 focus:ring-brand-500 dark:text-white transition-all text-base" 
                />
              </div>
              <div className="flex flex-col justify-end">
                  <div className="text-xs font-bold uppercase text-gray-500 tracking-wider mb-1">Final Client Price</div>
                  <div className="text-xl font-bold text-brand-600 dark:text-brand-400 font-mono">
                    {discountedPrice ? (
                      <span className="flex items-center gap-2">
                         <span className="line-through text-gray-400 text-sm">{parseFloat(formData.price || '0').toFixed(2)}</span>
                         <span>{discountedPrice} RON</span>
                         <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full ml-1">-{formData.promotion_percentage}%</span>
                      </span>
                    ) : (
                      <span>{parseFloat(formData.price || '0').toFixed(2)} RON</span>
                    )}
                  </div>
              </div>
            </div>
          </div>

          <div>
             <label className="block text-xs font-bold mb-2 uppercase text-gray-500 tracking-wider">{CONTENT.admin.imageUpload[language]}</label>
             <div 
               onClick={() => fileInputRef.current?.click()}
               className="group relative w-full h-48 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-brand-500 dark:hover:border-brand-500 bg-gray-50 dark:bg-gray-800 cursor-pointer transition-all overflow-hidden flex flex-col items-center justify-center"
             >
                {previewUrl ? (
                  <>
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full">
                         <Icons.Upload className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-4">
                    <div className="bg-brand-50 dark:bg-brand-900/30 p-4 rounded-full inline-block mb-3 group-hover:scale-110 transition-transform">
                      <Icons.Image className="w-8 h-8 text-brand-600 dark:text-brand-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{CONTENT.admin.selectImage[language]}</p>
                    <p className="text-xs text-gray-500 mt-1">High quality JPEG/PNG</p>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileChange}
                />
             </div>
          </div>

          <button disabled={loading} type="submit" className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-4 rounded-xl shadow-lg mt-6 flex items-center justify-center gap-2 transition-all hover:translate-y-[-2px]">
             {loading && <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
             {loading ? CONTENT.profile.uploading[language] : CONTENT.admin.save[language]}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;