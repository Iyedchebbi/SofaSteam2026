
import React, { useState, useEffect } from 'react';
import { CONTENT } from '../constants';
import { Language, Product, Order } from '../types';
import { Icons } from './Icon';
import { supabase } from '../services/supabase';
import ProductModal from './ProductModal';

interface AdminDashboardProps {
  language: Language;
  onLogout: () => void;
  user: any;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ language, onLogout, user }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deletingOrderId, setDeletingOrderId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  const [productModal, setProductModal] = useState<{ isOpen: boolean; product: Product | null }>({ isOpen: false, product: null });
  const [orders, setOrders] = useState<Order[]>([]);

  const t = CONTENT.admin;

  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data } = await supabase.from('products').select('*').order('id', { ascending: true });
    if (data) setProducts(data as Product[]);
    setLoading(false);
  };

  const fetchOrders = async () => {
      const { data } = await supabase.from('orders').select('*, order_items(*, product:products(*))').order('created_at', { ascending: false });
      if (data) setOrders(data as Order[]);
  };

  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm(t.confirmDelete[language])) return;
    setDeletingId(id);
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteOrder = async (id: number) => {
    if (!window.confirm(t.confirmDeleteOrder[language])) return;
    setDeletingOrderId(id);
    try {
      const { error } = await supabase.from('orders').delete().eq('id', id);
      if (error) throw error;
      setOrders(prev => prev.filter(o => o.id !== id));
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setDeletingOrderId(null);
    }
  };

  const handleConfirmOrder = async (id: number) => {
     try {
         const { error } = await supabase.from('orders').update({ status: 'confirmed' }).eq('id', id);
         if (error) throw error;
         setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'confirmed' } : o));
     } catch (error: any) {
         alert(`Error confirming: ${error.message}`);
     }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 font-sans text-gray-900 dark:text-gray-100">
      {/* Topbar */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex justify-between items-center sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="bg-brand-600 p-2 rounded-lg text-white">
            <Icons.LayoutDashboard className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold">{t.dashboard[language]}</h1>
        </div>
        <div className="flex items-center gap-4">
           <span className="text-sm text-gray-500 hidden sm:block">{user.email}</span>
           <button onClick={onLogout} className="flex items-center gap-2 text-red-500 hover:text-red-700 font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
             <Icons.LogOut className="w-4 h-4" />
             {CONTENT.auth.signOut[language]}
           </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-8">
           <button onClick={() => setActiveTab('products')} className={`px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all ${activeTab === 'products' ? 'bg-brand-600 text-white shadow-lg' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
             <Icons.Package className="w-4 h-4" /> {t.products[language]}
           </button>
           <button onClick={() => setActiveTab('orders')} className={`px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all ${activeTab === 'orders' ? 'bg-brand-600 text-white shadow-lg' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
             <Icons.ClipboardList className="w-4 h-4" /> {t.orders[language]}
           </button>
        </div>

        {/* Products View */}
        {activeTab === 'products' ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
               <h2 className="text-lg font-bold">{t.manage[language]}</h2>
               <button onClick={() => setProductModal({ isOpen: true, product: null })} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-md">
                 <Icons.Plus className="w-4 h-4" /> {t.addProduct[language]}
               </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800 text-xs uppercase text-gray-500 font-semibold">
                  <tr>
                    <th className="px-6 py-4 text-left">Product</th>
                    <th className="px-6 py-4 text-left">Category</th>
                    <th className="px-6 py-4 text-left">Price</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {loading ? (
                    <tr><td colSpan={4} className="p-8 text-center text-gray-400">Loading products...</td></tr>
                  ) : (
                    products.map(product => (
                      <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <img src={product.image} alt="" className="w-12 h-12 rounded-lg object-cover bg-gray-100" />
                            <div>
                               <div className="font-bold text-gray-900 dark:text-white">{product.name_en}</div>
                               <div className="text-xs text-gray-500">{product.name_ro}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">{product.category}</span>
                        </td>
                        <td className="px-6 py-4 font-mono font-medium">{product.price} RON</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                             <button onClick={() => setProductModal({ isOpen: true, product })} className="p-2 text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg transition-colors"><Icons.Settings className="w-4 h-4" /></button>
                             <button onClick={() => handleDeleteProduct(product.id)} disabled={deletingId === product.id} className={`p-2 rounded-lg transition-colors ${deletingId === product.id ? 'bg-gray-100 dark:bg-gray-800' : 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'}`}>
                               {deletingId === product.id ? <div className="w-4 h-4 border-2 border-red-200 border-t-red-600 rounded-full animate-spin"></div> : <Icons.Trash className="w-4 h-4" />}
                             </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Orders View */
          <div className="space-y-4">
             {orders.length === 0 ? (
                 <div className="text-center py-20 text-gray-400">No bookings found.</div>
             ) : (
                 orders.map(order => (
                    <div key={order.id} className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
                        <div className="flex flex-col md:flex-row justify-between items-start mb-4 gap-4">
                           <div>
                              <div className="flex items-center gap-3 mb-1">
                                 <div className="font-bold text-lg">Booking #{order.id}</div>
                                 <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${order.status === 'confirmed' ? 'bg-green-100 text-green-800' : order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                                   {order.status}
                                 </span>
                              </div>
                              <div className="text-sm text-gray-500 flex flex-col gap-1">
                                 <span>Created: {new Date(order.created_at).toLocaleString()}</span>
                                 {order.scheduled_date && (
                                     <span className="text-brand-600 font-bold flex items-center gap-1">
                                         <Icons.Calendar className="w-3 h-3" /> 
                                         Scheduled: {new Date(order.scheduled_date).toLocaleString()}
                                     </span>
                                 )}
                              </div>
                           </div>
                           
                           {/* Client Info */}
                           <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-lg text-sm">
                               <div className="font-bold text-gray-700 dark:text-gray-300 mb-1">{t.clientInfo[language]}</div>
                               <div>{order.client_name || 'N/A'}</div>
                               <div className="font-mono">{order.client_phone || 'N/A'}</div>
                               <div className="text-xs text-gray-500 mt-1 max-w-xs">{order.shipping_address}</div>
                           </div>

                           <div className="flex items-center gap-3">
                              {order.status === 'pending' && (
                                <button 
                                  onClick={() => handleConfirmOrder(order.id)}
                                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-bold shadow-md hover:bg-green-500 transition-colors"
                                >
                                    <Icons.Check className="w-4 h-4" />
                                    {t.confirmOrder[language]}
                                </button>
                              )}
                              <button 
                                onClick={() => handleDeleteOrder(order.id)}
                                disabled={deletingOrderId === order.id}
                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              >
                                {deletingOrderId === order.id ? <div className="w-4 h-4 border-2 border-red-200 border-t-red-600 rounded-full animate-spin"></div> : <Icons.Trash className="w-4 h-4" />}
                              </button>
                           </div>
                        </div>
                        
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                            {order.order_items?.map((item: any) => (
                                <div key={item.id} className="flex justify-between text-sm py-1 border-b border-gray-200 dark:border-gray-700 last:border-0">
                                    <span>{item.quantity}x {item.product?.name_en || 'Unknown Product'}</span>
                                    <span className="font-mono">{item.price_at_purchase} RON</span>
                                </div>
                            ))}
                            <div className="flex justify-between font-bold mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                <span>Total</span>
                                <span>{order.total_amount} RON</span>
                            </div>
                        </div>
                    </div>
                 ))
             )}
          </div>
        )}
      </div>

      <ProductModal 
        isOpen={productModal.isOpen} 
        onClose={() => setProductModal({ isOpen: false, product: null })} 
        product={productModal.product} 
        onSaved={fetchProducts} 
        language={language} 
      />
    </div>
  );
};

export default AdminDashboard;
