
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
  const [step, setStep] = useState<'cart' | 'form'>('cart');
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    date: ''
  });

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

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not found");

        // Create Order with detailed info
        const { data: order, error: orderError } = await supabase.from('orders').insert({
            user_id: user.id,
            total_amount: total,
            status: 'pending',
            shipping_address: formData.address,
            client_name: formData.name,
            client_phone: formData.phone,
            scheduled_date: new Date(formData.date).toISOString()
        }).select().single();
         
        if (order && !orderError) {
             const orderItems = cartItems.map(item => ({
                 order_id: order.id,
                 product_id: item.product_id,
                 quantity: item.quantity,
                 price_at_purchase: item.product.price
             }));
             await supabase.from('order_items').insert(orderItems);
             
             // Clear Cart
             await supabase.from('cart_items').delete().eq('user_id', user.id);
             
             refreshCart();
             alert(language === 'ro' 
               ? 'Cererea a fost trimisă cu succes! Veți primi o confirmare în curând.' 
               : 'Booking request sent successfully! You will receive a confirmation shortly.'
             );
             
             // Reset and Close
             setFormData({ name: '', phone: '', address: '', date: '' });
             setStep('cart');
             onClose();
        } else {
            throw orderError;
        }
    } catch (error: any) {
        console.error('Booking error:', error);
        alert('Error sending request: ' + error.message);
    } finally {
        setLoading(false);
    }
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
          {/* Header */}
          <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-950 z-10">
            <div>
                <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-900 dark:text-white font-sans">
                  {step === 'cart' ? t.title[language] : t.bookingForm.title[language]}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {step === 'cart' ? `${cartItems.length} ${t.items[language]} selected` : 'Enter details'}
                </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500">
              <Icons.X className="w-6 h-6" />
            </button>
          </div>

          {step === 'cart' ? (
            /* --- STEP 1: CART LIST --- */
            <>
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
                          <p className="text-brand-600 font-bold text-sm mt-1">{item.product.price} RON <span className="text-gray-400 font-normal text-xs">/ unit</span></p>
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
                    onClick={() => setStep('form')}
                    disabled={loading}
                    className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-500/30 transition-all active:scale-95 flex items-center justify-center gap-2 text-lg"
                  >
                    {t.checkout[language]}
                    <Icons.ArrowRight className="w-5 h-5" />
                  </button>
                  <p className="text-xs text-center mt-3 text-gray-400">
                      {language === 'ro' ? 'Prețul final poate varia în funcție de inspecție.' : 'Final price may vary upon inspection.'}
                  </p>
                </div>
              )}
            </>
          ) : (
            /* --- STEP 2: BOOKING FORM --- */
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900/50">
               <button onClick={() => setStep('cart')} className="mb-6 flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-brand-600 transition-colors">
                  <Icons.ArrowRight className="w-4 h-4 rotate-180" /> {t.bookingForm.back[language]}
               </button>

               <form onSubmit={handleBookingSubmit} className="space-y-6">
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">{t.bookingForm.name[language]}</label>
                     <div className="relative">
                        <Icons.User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input 
                           required 
                           type="text" 
                           value={formData.name}
                           onChange={e => setFormData({...formData, name: e.target.value})}
                           className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-brand-500 outline-none dark:text-white transition-all shadow-sm"
                           placeholder="John Doe"
                        />
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">{t.bookingForm.phone[language]}</label>
                     <div className="relative">
                        <Icons.Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input 
                           required 
                           type="tel" 
                           value={formData.phone}
                           onChange={e => setFormData({...formData, phone: e.target.value})}
                           className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-brand-500 outline-none dark:text-white transition-all shadow-sm"
                           placeholder="+40 700 000 000"
                        />
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">{t.bookingForm.address[language]}</label>
                     <div className="relative">
                        <Icons.MapPin className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                        <textarea 
                           required 
                           rows={3}
                           value={formData.address}
                           onChange={e => setFormData({...formData, address: e.target.value})}
                           className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-brand-500 outline-none dark:text-white transition-all shadow-sm resize-none"
                           placeholder="Street, Number, Building..."
                        />
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">{t.bookingForm.date[language]}</label>
                     <div className="relative">
                        <Icons.Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input 
                           required 
                           type="datetime-local" 
                           value={formData.date}
                           onChange={e => setFormData({...formData, date: e.target.value})}
                           className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-brand-500 outline-none dark:text-white transition-all shadow-sm"
                        />
                     </div>
                  </div>

                  <div className="pt-4">
                     <button 
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-500/30 transition-all active:scale-95 flex items-center justify-center gap-2 text-lg"
                     >
                        {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : t.bookingForm.submit[language]}
                     </button>
                  </div>
               </form>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartDrawer;
