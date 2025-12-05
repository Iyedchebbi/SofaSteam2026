import React, { useState, useEffect } from 'react';
import { CONTENT } from '../constants';
import { Language, Product, ProductCategory } from '../types';
import { Icons } from './Icon';
import { supabase } from '../services/supabase';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null; // If provided, we are editing
  onSaved: () => void; // Trigger refresh after save
  language: Language;
}

const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, product, onSaved, language }) => {
  const [formData, setFormData] = useState({
    name_en: '',
    name_ro: '',
    description_en: '',
    description_ro: '',
    price: '',
    image: '',
    category: 'solutions' as ProductCategory
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name_en: product.name_en,
        name_ro: product.name_ro,
        description_en: product.description_en,
        description_ro: product.description_ro,
        price: product.price.toString(),
        image: product.image,
        category: product.category as ProductCategory
      });
    } else {
      setFormData({
        name_en: '', name_ro: '', description_en: '', description_ro: '',
        price: '', image: '', category: 'solutions'
      });
    }
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name_en: formData.name_en,
        name_ro: formData.name_ro,
        description_en: formData.description_en,
        description_ro: formData.description_ro,
        price: parseFloat(formData.price),
        image: formData.image,
        category: formData.category
      };

      if (product) {
        // Update
        const { error } = await supabase
          .from('products')
          .update(payload)
          .eq('id', product.id);
        if (error) throw error;
      } else {
        // Create
        const { error } = await supabase
          .from('products')
          .insert([payload]);
        if (error) throw error;
      }

      onSaved();
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <Icons.X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          {product ? CONTENT.admin.editProduct[language] : CONTENT.admin.addProduct[language]}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1 uppercase text-gray-500">Name (EN)</label>
              <input required type="text" value={formData.name_en} onChange={e => setFormData({...formData, name_en: e.target.value})}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 outline-none dark:text-white" />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1 uppercase text-gray-500">Nume (RO)</label>
              <input required type="text" value={formData.name_ro} onChange={e => setFormData({...formData, name_ro: e.target.value})}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 outline-none dark:text-white" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1 uppercase text-gray-500">Desc (EN)</label>
              <textarea required rows={3} value={formData.description_en} onChange={e => setFormData({...formData, description_en: e.target.value})}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 outline-none dark:text-white" />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1 uppercase text-gray-500">Desc (RO)</label>
              <textarea required rows={3} value={formData.description_ro} onChange={e => setFormData({...formData, description_ro: e.target.value})}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 outline-none dark:text-white" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div>
                <label className="block text-xs font-bold mb-1 uppercase text-gray-500">Price (RON)</label>
                <input required type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 outline-none dark:text-white" />
             </div>
             <div>
                <label className="block text-xs font-bold mb-1 uppercase text-gray-500">Category</label>
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as ProductCategory})}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 outline-none dark:text-white dark:bg-gray-800">
                    <option value="solutions">Solutions</option>
                    <option value="equipment">Equipment</option>
                    <option value="accessories">Accessories</option>
                </select>
             </div>
             <div>
               <label className="block text-xs font-bold mb-1 uppercase text-gray-500">Image URL</label>
               <input required type="text" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})}
                 className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 outline-none dark:text-white" placeholder="https://..." />
             </div>
          </div>

          <button disabled={loading} type="submit" className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl shadow-lg mt-4">
             {loading ? 'Saving...' : CONTENT.admin.save[language]}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;