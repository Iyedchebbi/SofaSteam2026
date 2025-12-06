
import React, { useState, useEffect } from 'react';
import { CONTENT } from '../constants';
import { Language, Order } from '../types';
import { Icons } from './Icon';
import { supabase } from '../services/supabase';

interface BookingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  user: any;
}

const BookingsModal: React.FC<BookingsModalProps> = ({ isOpen, onClose, language, user }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const t = CONTENT.bookings;

  useEffect(() => {
    if (isOpen && user) {
        fetchMyOrders();
    }
  }, [isOpen, user]);

  const fetchMyOrders = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select(`
            *,
            order_items (
                *,
                product:products (*)
            )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (!error && data) {
          setOrders(data as Order[]);
      }
      setLoading(false);
  };

  const handleCancelOrder = async (id: number) => {
      if (!window.confirm(language === 'ro' ? "Sigur doriți să anulați această cerere?" : "Are you sure you want to cancel this request?")) return;
      setProcessingId(id);
      try {
          const { error } = await supabase.from('orders').update({ status: 'cancelled' }).eq('id', id);
          if (error) throw error;
          // Optimistic update
          setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'cancelled' } : o));
      } catch (error: any) {
          alert(error.message);
      } finally {
          setProcessingId(null);
      }
  };

  const handleDeleteOrder = async (id: number) => {
      if (!window.confirm(language === 'ro' ? "Ștergeți din istoric?" : "Delete from history?")) return;
      setProcessingId(id);
      try {
          const { error } = await supabase.from('orders').delete().eq('id', id);
          if (error) throw error;
          // Optimistic update
          setOrders(prev => prev.filter(o => o.id !== id));
      } catch (error: any) {
          alert(error.message);
      } finally {
          setProcessingId(null);
      }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-[fadeIn_0.2s_ease-out]">
       <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col relative border border-gray-200 dark:border-gray-800">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-900 z-10 rounded-t-2xl">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <div className="p-2 bg-brand-50 dark:bg-brand-900/20 rounded-lg text-brand-600">
                        <Icons.History className="w-6 h-6" />
                    </div>
                    {t.title[language]}
                </h2>
                <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all">
                    <Icons.X className="w-6 h-6" />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900/50">
                {loading ? (
                    <div className="flex justify-center py-10"><div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div></div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                        <Icons.ClipboardList className="w-16 h-16 mx-auto mb-4 opacity-30" />
                        <p>{t.noOrders[language]}</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map(order => (
                            <div key={order.id} className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 relative group">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="font-bold text-lg text-gray-900 dark:text-white">Order #{order.id}</div>
                                        <div className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</div>
                                        {order.scheduled_date && (
                                            <div className="text-sm font-bold text-brand-600 mt-1 flex items-center gap-1">
                                                <Icons.Calendar className="w-3 h-3" />
                                                {new Date(order.scheduled_date).toLocaleString()}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase flex items-center gap-2 ${
                                            order.status === 'confirmed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                            order.status === 'cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                            'bg-gray-100 text-gray-600'
                                        }`}>
                                            {order.status === 'confirmed' && <Icons.CheckCircle className="w-4 h-4" />}
                                            {t.status[order.status]?.[language] || order.status}
                                        </div>

                                        {/* Actions */}
                                        {order.status === 'pending' && (
                                            <button 
                                                onClick={() => handleCancelOrder(order.id)} 
                                                disabled={processingId === order.id}
                                                className="text-xs text-red-500 hover:text-red-700 font-bold hover:underline"
                                            >
                                                {t.cancelRequest[language]}
                                            </button>
                                        )}
                                        {(order.status === 'cancelled' || order.status === 'completed') && (
                                            <button 
                                                onClick={() => handleDeleteOrder(order.id)}
                                                disabled={processingId === order.id}
                                                className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 flex items-center gap-1"
                                            >
                                                <Icons.Trash className="w-3 h-3" /> {t.deleteRequest[language]}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Items Snapshot */}
                                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 mb-4 text-sm space-y-2">
                                    {order.order_items?.map((item: any, idx: number) => (
                                        <div key={idx} className="flex justify-between text-gray-700 dark:text-gray-300">
                                            <span>{item.quantity}x {language === 'en' ? item.product?.name_en : item.product?.name_ro}</span>
                                            <span className="font-mono">{item.price_at_purchase} RON</span>
                                        </div>
                                    ))}
                                    <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between font-bold text-base">
                                        <span>Total</span>
                                        <span>{order.total_amount} RON</span>
                                    </div>
                                </div>

                                {/* Status Message */}
                                {order.status === 'confirmed' ? (
                                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/50 p-4 rounded-xl flex gap-3 text-green-800 dark:text-green-300">
                                        <Icons.CheckCircle className="w-5 h-5 shrink-0" />
                                        <p className="text-sm font-medium">{t.message.confirmed[language]}</p>
                                    </div>
                                ) : order.status === 'cancelled' ? (
                                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 p-4 rounded-xl flex gap-3 text-red-800 dark:text-red-300">
                                        <Icons.X className="w-5 h-5 shrink-0" />
                                        <p className="text-sm font-medium">{t.message.cancelled[language]}</p>
                                    </div>
                                ) : (
                                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-900/50 p-4 rounded-xl flex gap-3 text-yellow-800 dark:text-yellow-300">
                                        <Icons.Clock className="w-5 h-5 shrink-0" />
                                        <p className="text-sm font-medium">{t.message.pending[language]}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
       </div>
    </div>
  );
};

export default BookingsModal;
