import React, { useState, useEffect } from 'react';
import { Icons } from './components/Icon';
import ChatAssistant from './components/ChatAssistant';
import AuthModal from './components/AuthModal';
import ProductModal from './components/ProductModal';
import ProfileModal from './components/ProfileModal';
import CartDrawer from './components/CartDrawer';
import AdminDashboard from './components/AdminDashboard';
import { NAV_ITEMS, CONTENT, APP_NAME, LOGO_URL, ADDRESS, PHONE, CONTACT_EMAIL, INSTAGRAM_URL, HERO_BG_URL } from './constants';
import { Language, Product, ProductCategory, UserProfile, CartItem } from './types';
import { supabase } from './services/supabase';

const App: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [language, setLanguage] = useState<Language>('en');
  
  // Modals & UI State
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; type: 'signin' | 'signup' }>({ isOpen: false, type: 'signin' });
  const [productModal, setProductModal] = useState<{ isOpen: boolean; product: Product | null }>({ isOpen: false, product: null });
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // Data State
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [activeCategory, setActiveCategory] = useState<ProductCategory>('all');

  // Theme effect
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Auth and Profile Listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchUserProfile(currentUser.id);
        fetchCart(currentUser.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchUserProfile(currentUser.id);
        fetchCart(currentUser.id);
      } else {
        setIsAdmin(false);
        setUserProfile(null);
        setCartItems([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch Products
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoadingProducts(true);
    const { data, error } = await supabase.from('products').select('*').order('id', { ascending: true });
    if (!error && data) {
      setProducts(data as Product[]);
    }
    setLoadingProducts(false);
  };

  const fetchUserProfile = async (uid: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', uid).single();
    if (data) {
      setUserProfile(data as UserProfile);
      setIsAdmin(data.role === 'admin');
    }
  };

  const fetchCart = async (uid: string) => {
    // Join products table to get details
    const { data, error } = await supabase
      .from('cart_items')
      .select('*, product:products(*)')
      .eq('user_id', uid)
      .order('created_at', { ascending: true });
    
    if (data && !error) {
      setCartItems(data as any as CartItem[]);
    }
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'ro' : 'en');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleAddToCart = async (product: Product) => {
    if (!user) {
      alert(CONTENT.cart.loginRequired[language]);
      setAuthModal({ isOpen: true, type: 'signin' });
      return;
    }
    
    // Optimistic UI update or simple alert?
    // Let's do database logic
    try {
        // Check if item exists
        const { data: existing } = await supabase
            .from('cart_items')
            .select('*')
            .eq('user_id', user.id)
            .eq('product_id', product.id)
            .single();

        if (existing) {
            await supabase
                .from('cart_items')
                .update({ quantity: existing.quantity + 1 })
                .eq('id', existing.id);
        } else {
            await supabase
                .from('cart_items')
                .insert({ user_id: user.id, product_id: product.id, quantity: 1 });
        }
        
        await fetchCart(user.id);
        
        const productName = language === 'en' ? product.name_en : product.name_ro;
        // Optional: toast notification instead of alert
        // alert(`${productName} ${CONTENT.cart.addSuccess[language]}`);
        setIsCartOpen(true); // Open cart to show success
    } catch (e) {
        console.error("Cart error", e);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    alert(CONTENT.contact.successMessage[language]);
    (e.target as HTMLFormElement).reset();
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  // If Admin, show separate dashboard layout
  if (isAdmin) {
    return (
      <AdminDashboard 
        language={language} 
        onLogout={handleLogout} 
        user={user} 
      />
    );
  }

  // Customer / Guest Layout
  const filteredProducts = activeCategory === 'all' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  const categories: ProductCategory[] = ['all', 'solutions', 'equipment', 'accessories'];

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          {/* Logo */}
          <a href="#home" className="flex items-center gap-3 group" onClick={(e) => handleNavClick(e, 'home')}>
            <div className="w-10 h-10 md:w-12 md:h-12 overflow-hidden rounded-xl shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:rotate-3">
              <img src={LOGO_URL} alt={APP_NAME} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = "https://picsum.photos/100/100?random=logo"; }} />
            </div>
            <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent group-hover:opacity-80 transition-opacity">
              {APP_NAME}
            </span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
            {NAV_ITEMS.map(item => (
              <a key={item.id} href={item.href} onClick={(e) => handleNavClick(e, item.id)} className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors relative group">
                {item.label[language]}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-600 transition-all duration-300 group-hover:w-full"></span>
              </a>
            ))}
          </nav>

          {/* Controls */}
          <div className="hidden md:flex items-center gap-4">
            <button onClick={toggleLanguage} className="p-2 rounded-lg text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all hover:scale-110">
              {language.toUpperCase()}
            </button>
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all hover:scale-110 text-brand-600 dark:text-brand-400">
              {theme === 'light' ? <Icons.Moon size={20} /> : <Icons.Sun size={20} />}
            </button>
            
            {user && (
               <button onClick={() => setIsCartOpen(true)} className="relative p-2 text-brand-600 dark:text-brand-400 hover:scale-110 transition-transform cursor-pointer">
                 <Icons.ShoppingBag size={20} />
                 {cartItems.length > 0 && <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full animate-bounce">{cartItems.reduce((acc, item) => acc + item.quantity, 0)}</span>}
               </button>
            )}

            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700"></div>
            
            {!user ? (
              <>
                <button onClick={() => setAuthModal({ isOpen: true, type: 'signin' })} className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-brand-600 transition-colors hover:scale-105 active:scale-95">
                  {CONTENT.auth.signIn[language]}
                </button>
                <button onClick={() => setAuthModal({ isOpen: true, type: 'signup' })} className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2 rounded-full text-sm font-medium transition-all shadow-md hover:shadow-lg active:scale-95 hover:scale-105">
                  {CONTENT.auth.signUp[language]}
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                 <button onClick={() => setIsProfileOpen(true)} className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 p-1.5 pr-3 rounded-full transition-all">
                     <div className="w-8 h-8 rounded-full overflow-hidden bg-brand-100 border border-brand-200">
                        {userProfile?.avatar_url ? (
                            <img src={userProfile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-brand-600 text-xs font-bold">
                                {userProfile?.full_name?.charAt(0) || user.email?.charAt(0)}
                            </div>
                        )}
                     </div>
                     <span className="text-xs font-medium text-gray-700 dark:text-gray-200 hidden lg:block">
                        {userProfile?.full_name?.split(' ')[0] || user.email?.split('@')[0]}
                     </span>
                 </button>
                 <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition-colors">
                   <Icons.LogOut className="w-5 h-5" />
                 </button>
              </div>
            )}
          </div>

          <button className="lg:hidden p-2 text-gray-600 dark:text-gray-300 hover:scale-110 transition-transform" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <Icons.X /> : <Icons.Menu />}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="relative flex items-center justify-center min-h-[85vh] overflow-hidden bg-gray-50 dark:bg-gray-950">
        <div className="absolute inset-0 z-0 bg-gray-900">
          <img src={HERO_BG_URL} alt="Cleaning Background" className="w-full h-full object-cover" style={{ objectPosition: '50% 85%' }} />
           <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/40 to-transparent dark:from-black/90 dark:via-black/50"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10 pt-20">
          <div className="max-w-2xl text-white animate-[slideUp_0.5s_ease-out]">
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight drop-shadow-xl">
              {CONTENT.hero.title[language]} <br/>
              <span className="text-brand-400">SofaSteam</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-100 leading-relaxed drop-shadow-lg font-medium">
              {CONTENT.hero.subtitle[language]}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#products" onClick={(e) => handleNavClick(e, 'products')} className="bg-brand-500 hover:bg-brand-600 text-white text-lg font-bold px-8 py-4 rounded-full transition-all shadow-lg hover:shadow-brand-500/30 hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2">
                <Icons.ShoppingBag className="w-5 h-5" />
                {CONTENT.hero.cta[language]}
              </a>
              <button onClick={() => setIsChatOpen(true)} className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-lg font-bold px-8 py-4 rounded-full transition-all border border-white/30 hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2">
                <Icons.Sparkles className="w-5 h-5" />
                {CONTENT.assistant.title[language]}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white dark:bg-gray-800 transition-colors duration-300">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-stretch gap-12">
            <div className="w-full md:w-1/2">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl h-full min-h-[500px]">
                <img src="https://images.unsplash.com/photo-1581578731117-10d52143b1e8?q=80&w=2070&auto=format&fit=crop" alt="Cleaning Expert" className="w-full h-full object-cover transform hover:scale-105 transition-duration-700 transition-transform" />
              </div>
            </div>
            <div className="w-full md:w-1/2 flex flex-col justify-center">
              <h2 className="text-sm font-bold text-brand-600 tracking-wider uppercase mb-2">{APP_NAME}</h2>
              <h3 className="text-4xl font-bold mb-6 text-gray-900 dark:text-white">{CONTENT.about.title[language]}</h3>
              <div className="space-y-6">
                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed text-justify">{CONTENT.about.text[language]}</p>
                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed text-justify font-medium">{CONTENT.about.qualityText[language]}</p>
              </div>
              <div className="mt-10 grid grid-cols-3 gap-4">
                {CONTENT.about.steps.map((step, index) => {
                  const Icon = Icons[step.icon as keyof typeof Icons] || Icons.Sparkles;
                  return (
                    <div key={index} className="group flex flex-col items-center text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:shadow-lg transition-all hover:-translate-y-1 duration-300">
                      <div className="mb-3 p-3 bg-white dark:bg-gray-800 rounded-full text-brand-600 group-hover:scale-110 group-hover:bg-brand-600 group-hover:text-white transition-all shadow-sm">
                        <Icon className="w-6 h-6" />
                      </div>
                      <h4 className="font-bold text-gray-900 dark:text-white mb-1 text-sm md:text-base">{step.title[language]}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{step.desc[language]}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-20 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 relative">
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              {language === 'en' ? 'Our Products' : 'Produsele Noastre'}
            </h2>
            <div className="h-1 w-24 bg-brand-500 mx-auto rounded-full"></div>
          </div>
          
          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all hover:scale-105 active:scale-95 ${activeCategory === cat ? 'bg-brand-600 text-white shadow-lg scale-105' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                {CONTENT.categories[cat][language]}
              </button>
            ))}
          </div>

          {loadingProducts ? (
              <div className="flex justify-center items-center py-20">
                  <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
              </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {filteredProducts.map((product) => (
                <div key={product.id} className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col animate-[fadeIn_0.5s_ease-out] relative">
                    <div className="relative h-64 overflow-hidden">
                        <img src={product.image} alt={language === 'en' ? product.name_en : product.name_ro} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute top-4 right-4 bg-brand-600 text-white font-bold px-3 py-1 rounded-full shadow-lg">
                            {product.price} RON
                        </div>
                        <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full">
                            {CONTENT.categories[product.category as ProductCategory][language]}
                        </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                        <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                            {language === 'en' ? product.name_en : product.name_ro}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 flex-1 line-clamp-2 text-justify">
                            {language === 'en' ? product.description_en : product.description_ro}
                        </p>
                        
                        <button onClick={() => handleAddToCart(product)} className="w-full bg-gray-900 dark:bg-gray-700 hover:bg-brand-600 dark:hover:bg-brand-600 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 hover:scale-105 active:scale-95">
                            <Icons.ShoppingBag className="w-4 h-4" />
                            {language === 'en' ? 'Add to Cart' : 'Adaugă în Coș'}
                        </button>
                    </div>
                </div>
                ))}
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
         <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white uppercase tracking-wide">{CONTENT.contact.title[language]}</h2>
              <div className="h-1 w-24 bg-brand-500 mx-auto rounded-full"></div>
            </div>
            <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden">
               <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="p-10 flex flex-col justify-center bg-brand-600 text-white">
                     <p className="mb-8 opacity-90 text-lg leading-relaxed">{CONTENT.contact.subtitle[language]}</p>
                     <div className="space-y-6">
                        <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ADDRESS)}`} target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 group hover:bg-white/10 p-3 rounded-xl transition-colors -ml-3">
                           <div className="p-2 bg-white/20 rounded-lg group-hover:scale-110 transition-transform"><Icons.MapPin className="w-6 h-6" /></div>
                           <div><p className="font-semibold mb-1">Address</p><p className="text-sm opacity-90">{ADDRESS}</p></div>
                        </a>
                        <a href={`https://wa.me/${PHONE.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 group hover:bg-white/10 p-3 rounded-xl transition-colors -ml-3">
                           <div className="p-2 bg-white/20 rounded-lg group-hover:scale-110 transition-transform"><Icons.Phone className="w-6 h-6" /></div>
                           <div><p className="font-semibold mb-1">WhatsApp</p><span className="text-sm opacity-90">{PHONE}</span></div>
                        </a>
                        <a href={`mailto:${CONTACT_EMAIL}`} className="flex items-start gap-4 group hover:bg-white/10 p-3 rounded-xl transition-colors -ml-3">
                           <div className="p-2 bg-white/20 rounded-lg group-hover:scale-110 transition-transform"><Icons.Mail className="w-6 h-6" /></div>
                           <div><p className="font-semibold mb-1">Email</p><span className="text-sm opacity-90">{CONTACT_EMAIL}</span></div>
                        </a>
                     </div>
                  </div>
                  <div className="p-10">
                     <form className="space-y-6" onSubmit={handleSendMessage}>
                        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{CONTENT.contact.nameLabel[language]}</label><input type="text" required className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent px-4 py-3 focus:ring-2 focus:ring-brand-500 outline-none transition-all" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{CONTENT.contact.emailLabel[language]}</label><input type="email" required className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent px-4 py-3 focus:ring-2 focus:ring-brand-500 outline-none transition-all" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{CONTENT.contact.messageLabel[language]}</label><textarea rows={4} required className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent px-4 py-3 focus:ring-2 focus:ring-brand-500 outline-none transition-all resize-none"></textarea></div>
                        <button type="submit" className="w-full bg-gray-900 dark:bg-brand-600 hover:bg-gray-800 dark:hover:bg-brand-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:scale-105 active:scale-95">{CONTENT.contact.sendButton[language]}</button>
                     </form>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 pt-16 pb-8 transition-colors duration-300">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12 items-start">
            <div>
              <div className="flex items-center gap-2 mb-6 h-[28px]">
                <img src={LOGO_URL} alt="Logo" className="w-8 h-8 rounded-lg object-cover" />
                <span className="text-xl font-bold text-gray-900 dark:text-white">{APP_NAME}</span>
              </div>
              <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm leading-relaxed pr-4 text-left">Professional home cleaning solutions for a fresher, healthier living space. Bringing innovation and care to every Romanian home.</p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-6 text-gray-900 dark:text-white h-[28px] flex items-center">{CONTENT.footer.quickLinks[language]}</h4>
              <ul className="space-y-4">
                {NAV_ITEMS.map(item => (
                  <li key={item.id}><a href={item.href} onClick={(e) => handleNavClick(e, item.id)} className="text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors hover:translate-x-1 inline-block">{item.label[language]}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-6 text-gray-900 dark:text-white h-[28px] flex items-center">{CONTENT.footer.followUs[language]}</h4>
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-pink-50 dark:hover:bg-pink-900/10 transition-all group hover:scale-105 active:scale-95">
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-gray-700 text-pink-600 shadow-sm group-hover:scale-110 transition-transform"><Icons.Instagram size={20} /></div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">@sofasteambucuresti</span>
              </a>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-6 text-gray-900 dark:text-white h-[28px] flex items-center">{CONTENT.footer.newsletter[language]}</h4>
              <form className="flex flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
                <div className="relative"><Icons.Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" /><input type="email" placeholder="Email" className="w-full bg-gray-100 dark:bg-gray-800 border-none rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-brand-500 outline-none text-gray-900 dark:text-gray-100 transition-all focus:bg-white dark:focus:bg-gray-700" /></div>
                <button className="bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl transition-all shadow-md hover:scale-105 active:scale-95">{CONTENT.footer.subscribe[language]}</button>
              </form>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-800 pt-8 flex justify-center items-center">
            <p className="text-gray-500 dark:text-gray-500 text-sm font-medium">{CONTENT.footer.rights[language]}</p>
          </div>
        </div>
      </footer>
      
      {/* Floating Chatbot Widget */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
          {isChatOpen && (
              <div className="w-[340px] h-[500px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 animate-[scaleIn_0.2s_ease-out] origin-bottom-right">
                  <ChatAssistant language={language} onClose={() => setIsChatOpen(false)} />
              </div>
          )}
          <button onClick={() => setIsChatOpen(!isChatOpen)} className="bg-brand-600 hover:bg-brand-700 text-white p-4 rounded-full shadow-xl hover:shadow-2xl transition-all hover:scale-110 active:scale-95">
              {isChatOpen ? <Icons.X className="w-7 h-7" /> : <Icons.MessageCircle className="w-7 h-7" />}
          </button>
      </div>

      <AuthModal 
        isOpen={authModal.isOpen} 
        onClose={() => setAuthModal({ ...authModal, isOpen: false })} 
        type={authModal.type} 
        language={language} 
        onSwitchMode={(newType) => setAuthModal({ ...authModal, type: newType })} 
      />
      
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        profile={userProfile}
        language={language}
        onProfileUpdate={() => user && fetchUserProfile(user.id)}
      />

      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        language={language}
        refreshCart={() => user && fetchCart(user.id)}
      />
    </div>
  );
};

export default App;