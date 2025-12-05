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
      console.error('Error updating cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
     // Mock checkout for now
     alert(language === 'ro' ? 'Comanda a fost plasată! (Simulare)' : 'Order placed successfully! (Simulation)');
     // Clear cart logic if needed, or create order in DB
     setLoading(true);
     // Basic order creation
     const { data: { user } } = await supabase.auth.getUser();
     if (user) {
         const { data: order, error: orderError } = await supabase.from('orders').insert({
             user_id: user.id,
             total_amount: total,
             status: 'pending',
             shipping_address: 'Default Address' // In real app, ask for address
         }).select().single();
         
         if (order && !orderError) {
             // Move items to order_items
             const orderItems = cartItems.map(item => ({
                 order_id: order.id,
                 product_id: item.product_id,
                 quantity: item.quantity,
                 price_at_purchase: item.product.price
             }));
             await supabase.from('order_items').insert(orderItems);
             // Clear cart
             await supabase.from('cart_items').delete().eq('user_id', user.id);
             refreshCart();
             onClose();
         }
     }
     setLoading(false);
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity" 
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-800">
            <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
              <Icons.ShoppingBag className="w-5 h-5 text-brand-600" />
              {t.title[language]} <span className="text-sm font-normal text-gray-500">({cartItems.length} {t.items[language]})</span>
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500">
              <Icons.X className="w-5 h-5" />
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                <Icons.ShoppingBag className="w-16 h-16 opacity-20" />
                <p>{t.empty[language]}</p>
              </div>
            ) : (
              cartItems.map((item) => (
                <div key={item.id} className="flex gap-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-3 rounded-xl shadow-sm">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                    <img src={item.product.image} alt="Product" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm line-clamp-1">
                        {language === 'en' ? item.product.name_en : item.product.name_ro}
                      </h3>
                      <p className="text-brand-600 font-bold text-sm">{item.product.price} RON</p>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                       <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 hover:bg-white dark:hover:bg-gray-600 rounded shadow-sm transition-all disabled:opacity-50" disabled={loading}>
                            <Icons.Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 hover:bg-white dark:hover:bg-gray-600 rounded shadow-sm transition-all disabled:opacity-50" disabled={loading}>
                            <Icons.Plus className="w-3 h-3" />
                          </button>
                       </div>
                       <button onClick={() => updateQuantity(item.id, 0)} className="text-red-400 hover:text-red-600 p-1">
                         <Icons.Trash className="w-4 h-4" />
                       </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {cartItems.length > 0 && (
            <div className="p-5 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
               <div className="flex justify-between items-center mb-4">
                 <span className="text-gray-500 dark:text-gray-400">{t.total[language]}</span>
                 <span className="text-2xl font-bold text-gray-900 dark:text-white">{total.toFixed(2)} RON</span>
               </div>
               <button 
                onClick={handleCheckout}
                disabled={loading}
                className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
               >
                 {loading ? "Processing..." : t.checkout[language]}
                 <Icons.ChevronRight className="w-4 h-4" />
               </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartDrawer;