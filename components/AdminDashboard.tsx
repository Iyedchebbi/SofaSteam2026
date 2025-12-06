
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
      await fetchProducts();
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
      await fetchOrders(); // Sync with DB
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setDeletingOrderId(null);
    }
  };

  const handleDeleteAllOrders = async () => {
    if (!window.confirm("ARE YOU SURE? This will delete ALL orders from the database. This action cannot be undone.")) return;
    try {
        const { error } = await supabase.from('orders').delete().neq('id', 0); // Delete all
        if (error) throw error;
        await fetchOrders();
        alert("All orders deleted.");
    } catch (error: any) {
        alert("Error: " + error.message);
    }
  };

  const handleUpdateOrderStatus = async (id: number, status: 'confirmed' | 'cancelled') => {
     try {
         const { error } = await supabase.from('orders').update({ status }).eq('id', id);
         if (error) throw error;
         await fetchOrders(); // Sync with DB
     } catch (error: any) {
         alert(`Error updating status: ${error.message}`);
     }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 font-sans text-gray-900 dark:text-gray-100">
      {/* Topbar */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 sticky top-0 z-30">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="bg-brand-600 p-2 rounded-lg text-white">
            <Icons.LayoutDashboard className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold">{t.dashboard[language]}</h1>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
           <span className="text-sm text-gray-500 hidden sm:block">{user.email}</span>
           <button onClick={onLogout} className="flex items-center gap-2 text-red-500 hover:text-red-700 font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
             <Icons.LogOut className="w-4 h-4" />
             {CONTENT.auth.signOut[language]}
           </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
           <button onClick={() => setActiveTab('products')} className={`px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all whitespace-nowrap ${activeTab === 'products' ? 'bg-brand-600 text-white shadow-lg' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
             <Icons.Package className="w-4 h-4" /> {t.products[language]}
           </button>
           <button onClick={() => setActiveTab('orders')} className={`px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all whitespace-nowrap ${activeTab === 'orders' ? 'bg-brand-600 text-white shadow-lg' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
             <Icons.ClipboardList className="w-4 h-4" /> {t.orders[language]}
           </button>
        </div>

        {/* Products View */}
        {activeTab === 'products' ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
               <h2 className="text-lg font-bold">{t.manage[language]}</h2>
               <button onClick={() => setProductModal({ isOpen: true, product: null })} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-md text-sm sm:text-base">
                 <Icons.Plus className="w-4 h-4" /> {t.addProduct[language]}
               </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
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
                               <div className="font-bold text-gray-900 dark:text-white line-clamp-1">{product.name_en}</div>
                               <div className="text-xs text-gray-500 line-clamp-1">{product.name_ro}</div>
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
             <div className="flex justify-end mb-4">
                <button 
                    onClick={handleDeleteAllOrders} 
                    className="text-red-500 hover:text-red-700 text-xs font-bold border border-red-200 hover:bg-red-50 px-3 py-1 rounded-full transition-colors"
                >
                    DELETE ALL ORDERS (TEST)
                </button>
             </div>
             {orders.length === 0 ? (
                 <div className="text-center py-20 text-gray-400">No bookings found.</div>
             ) : (
                 orders.map(order => (
                    <div key={order.id} className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 relative group">
                        <div className="flex flex-col lg:flex-row justify-between items-start mb-4 gap-4">
                           <div className="w-full lg:w-auto">
                              <div className="flex flex-wrap items-center gap-3 mb-2">
                                 <div className="font-bold text-lg">Booking #{order.id}</div>
                                 <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                     order.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                                     order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                     'bg-yellow-100 text-yellow-800'
                                 }`}>
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
                           <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 rounded-lg text-sm w-full lg:w-auto">
                               <div className="font-bold text-gray-700 dark:text-gray-300 mb-1">{t.clientInfo[language]}</div>
                               <div>{order.client_name || 'N/A'}</div>
                               <div className="font-mono">{order.client_phone || 'N/A'}</div>
                               <div className="text-xs text-gray-500 mt-1 max-w-xs break-words">{order.shipping_address}</div>
                           </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 mb-4">
                              {order.status === 'pending' && (
                                <>
                                    <button 
                                        onClick={() => handleUpdateOrderStatus(order.id, 'confirmed')}
                                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-bold shadow-md hover:bg-green-500 transition-colors text-sm"
                                        title="Confirm Order"
                                    >
                                        <Icons.Check className="w-4 h-4" />
                                        {t.confirmOrder[language]}
                                    </button>
                                    <button 
                                        onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')}
                                        className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
                                        title="Cancel Order"
                                    >
                                        <Icons.X className="w-4 h-4" />
                                    </button>
                                </>
                              )}
                              {order.status === 'confirmed' && (
                                   <button 
                                     onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')}
                                     className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg font-bold hover:bg-red-200 transition-colors text-sm"
                                   >
                                       <Icons.X className="w-4 h-4" /> {t.cancelOrder[language]}
                                   </button>
                              )}
                              
                              <button 
                                onClick={() => handleDeleteOrder(order.id)}
                                disabled={deletingOrderId === order.id}
                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors ml-auto"
                                title="Delete from database"
                              >
                                {deletingOrderId === order.id ? <div className="w-4 h-4 border-2 border-red-200 border-t-red-600 rounded-full animate-spin"></div> : <Icons.Trash className="w-4 h-4" />}
                              </button>
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
