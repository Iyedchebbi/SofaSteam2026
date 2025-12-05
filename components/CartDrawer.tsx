import React, { useState } from 'react';
import { CONTENT } from '../constants';
import { Language, CartItem } from '../types';
import { Icons } from './Icon';
import { supabase } from '../services/supabase';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  language: Language;
  refreshCart: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, cartItems, language, refreshCart }) => {
  const [loading, setLoading] = useState(false);
  const t = CONTENT.cart;

  const total = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const updateQuantity = async (itemId: number, newQty: number) => {
    if (loading) return;
    setLoading(true);
    try {
      if (newQty <= 0) {
        await supabase.from('cart_items').delete().eq('id', itemId);
      } else {
        await supabase.from('cart_items').update({ quantity: newQty }).eq('id', itemId);
      }
      refreshCart();
    } catch (error) {
      console.error('Error updating booking list:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
     setLoading(true);
     const { data: { user } } = await supabase.auth.getUser();
     if (user) {
         const { data: order, error: orderError } = await supabase.from('orders').insert({
             user_id: user.id,
             total_amount: total,
             status: 'pending',
             shipping_address: 'Pending Consultation' 
         }).select().single();
         
         if (order && !orderError) {
             const orderItems = cartItems.map(item => ({
                 order_id: order.id,
                 product_id: item.product_id,
                 quantity: item.quantity,
                 price_at_purchase: item.product.price
             }));
             await supabase.from('order_items').insert(orderItems);
             await supabase.from('cart_items').delete().eq('user_id', user.id);
             refreshCart();
             alert(language === 'ro' ? 'Cererea a fost trimisă! Vă vom contacta.' : 'Request sent! We will contact you shortly.');
             onClose();
         }
     }
     setLoading(false);
  };

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity" 
          onClick={onClose}
        />
      )}

      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-gray-950 shadow-2xl z-50 transform transition-transform duration-500 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-950">
            <div>
                <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-900 dark:text-white font-sans">
                {t.title[language]}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{cartItems.length} {t.items[language]} selected</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500">
              <Icons.X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 dark:bg-gray-900/50">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <Icons.ClipboardList className="w-10 h-10 opacity-30" />
                </div>
                <p className="font-medium">{t.empty[language]}</p>
              </div>
            ) : (
              cartItems.map((item) => (
                <div key={item.id} className="flex gap-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                    <img src={item.product.image} alt="Service" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-base line-clamp-1">
                        {language === 'en' ? item.product.name_en : item.product.name_ro}
                      </h3>
                      <p className="text-brand-600 font-bold text-sm mt-1">{item.product.price} RON <span className="text-gray-400 font-normal text-xs">/ unit (est)</span></p>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3">
                       <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-1 border border-gray-200 dark:border-gray-700">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 hover:bg-white dark:hover:bg-gray-600 rounded shadow-sm transition-all disabled:opacity-50" disabled={loading}>
                            <Icons.Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold w-6 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 hover:bg-white dark:hover:bg-gray-600 rounded shadow-sm transition-all disabled:opacity-50" disabled={loading}>
                            <Icons.Plus className="w-3 h-3" />
                          </button>
                       </div>
                       <button onClick={() => updateQuantity(item.id, 0)} className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                         <Icons.Trash className="w-4 h-4" />
                       </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {cartItems.length > 0 && (
            <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950">
               <div className="flex justify-between items-center mb-6">
                 <span className="text-gray-500 dark:text-gray-400 font-medium">{t.total[language]}</span>
                 <span className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{total.toFixed(2)} <span className="text-lg">RON</span></span>
               </div>
               <button 
                onClick={handleCheckout}
                disabled={loading}
                className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-500/30 transition-all active:scale-95 flex items-center justify-center gap-2 text-lg"
               >
                 {loading ? "Processing..." : t.checkout[language]}
                 <Icons.ArrowRight className="w-5 h-5" />
               </button>
               <p className="text-xs text-center mt-3 text-gray-400">
                  {language === 'ro' ? 'Prețul final poate varia în funcție de inspecție.' : 'Final price may vary upon inspection.'}
               </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartDrawer;