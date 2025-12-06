
import React, { useState, useEffect } from 'react';
import { Icons } from './components/Icon';
import AuthModal from './components/AuthModal';
import ProductModal from './components/ProductModal';
import ProfileModal from './components/ProfileModal';
import CartDrawer from './components/CartDrawer';
import AdminDashboard from './components/AdminDashboard';
import LegalModal from './components/LegalModal';
import BookingsModal from './components/BookingsModal';
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
  const [legalModal, setLegalModal] = useState<{ isOpen: boolean; type: 'privacy' | 'terms' | null }>({ isOpen: false, type: null });
  const [bookingsModal, setBookingsModal] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Data State
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [confirmedCount, setConfirmedCount] = useState(0);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [activeCategory, setActiveCategory] = useState<ProductCategory>('all');
  const [scrolled, setScrolled] = useState(false);

  // Theme & Scroll effect
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [theme]);

  // Auth and Profile Listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchUserProfile(currentUser.id, currentUser);
        fetchCart(currentUser.id);
        fetchConfirmedCount(currentUser.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchUserProfile(currentUser.id, currentUser);
        fetchCart(currentUser.id);
        fetchConfirmedCount(currentUser.id);
      } else {
        setIsAdmin(false);
        setUserProfile(null);
        setCartItems([]);
        setConfirmedCount(0);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Real-time Order Updates (Notifications)
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('orders-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.new.status === 'confirmed') {
            setConfirmedCount((prev) => prev + 1);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

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

  const fetchConfirmedCount = async (uid: string) => {
    const { count } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', uid)
        .eq('status', 'confirmed');
    
    if (count !== null) setConfirmedCount(count);
  };

  const fetchUserProfile = async (uid: string, sessionUser?: any) => {
    let { data, error } = await supabase.from('profiles').select('*').eq('id', uid).single();
    
    // Fallback: Create profile if missing
    if (!data && sessionUser) {
        const googleName = sessionUser.user_metadata?.full_name || '';
        const googleAvatar = sessionUser.user_metadata?.avatar_url || '';
        const email = sessionUser.email || '';

        const { data: newProfile, error: createError } = await supabase.from('profiles').insert({
            id: uid,
            email: email,
            role: 'customer',
            full_name: googleName,
            avatar_url: googleAvatar
        }).select().single();
        
        if (newProfile && !createError) {
             data = newProfile;
        }
    }

    if (data) {
      // Sync Google Metadata
      if (sessionUser && sessionUser.app_metadata.provider === 'google') {
          const googleAvatar = sessionUser.user_metadata.avatar_url;
          const googleName = sessionUser.user_metadata.full_name;
          
          if (googleAvatar || googleName) {
             const updates: any = {};
             if (!data.avatar_url && googleAvatar) updates.avatar_url = googleAvatar;
             if (!data.full_name && googleName) updates.full_name = googleName;

             if (Object.keys(updates).length > 0) {
                 await supabase.from('profiles').update(updates).eq('id', uid);
                 data.avatar_url = updates.avatar_url || data.avatar_url;
                 data.full_name = updates.full_name || data.full_name;
             }
          }
      }

      setUserProfile(data as UserProfile);
      setIsAdmin(data.role === 'admin');
    }
  };

  const fetchCart = async (uid: string) => {
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
    try {
      setIsMenuOpen(false);
      await supabase.auth.signOut();
    } catch (error) {
      localStorage.clear();
      window.location.reload();
    } finally {
      setUser(null);
      setUserProfile(null);
      setIsAdmin(false);
      setCartItems([]);
      setConfirmedCount(0);
    }
  };

  const handleAddToCart = async (product: Product) => {
    if (!user) {
      alert(CONTENT.cart.loginRequired[language]);
      setAuthModal({ isOpen: true, type: 'signin' });
      return;
    }
    
    try {
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
        setIsCartOpen(true);
    } catch (e) {
        console.error("Cart error", e);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const message = formData.get('message') as string;
    
    const subject = `Consultation Request from ${name}`;
    const body = `Name: ${name}\nEmail: ${email}\n\nInquiry:\n${message}`;
    
    // Open mail client
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    form.reset();
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    setIsMenuOpen(false);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isAdmin) {
    return (
      <AdminDashboard 
        language={language} 
        onLogout={handleLogout} 
        user={user} 
      />
    );
  }

  const filteredProducts = activeCategory === 'all' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  const categories: ProductCategory[] = ['all', 'upholstery', 'carpet', 'auto', 'general'];

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-[#030712] overflow-x-hidden selection:bg-brand-500 selection:text-white">
      
      {/* Navbar - Floating Island Style */}
      <nav className={`fixed top-4 left-0 right-0 z-50 transition-all duration-500 flex justify-center px-4 pointer-events-none`}>
        <div className={`pointer-events-auto flex items-center justify-between transition-all duration-500 rounded-full ${scrolled ? 'glass-nav shadow-2xl shadow-black/5 py-3 px-4 sm:px-6 w-full max-w-6xl mx-auto' : 'bg-transparent py-4 px-4 sm:px-6 w-full container'}`}>
          
          {/* Logo */}
          <a href="#home" onClick={(e) => handleNavClick(e, 'home')} className="flex items-center gap-3 group">
            <div className={`w-10 h-10 lg:w-12 lg:h-12 transition-all duration-500 ${scrolled ? '' : 'scale-110'}`}>
              <img src={LOGO_URL} alt={APP_NAME} className="w-full h-full object-contain drop-shadow-lg" />
            </div>
            <div className="flex flex-col">
              <span className={`text-xl font-display font-bold tracking-tight leading-none ${scrolled ? 'text-gray-900 dark:text-white' : 'text-white drop-shadow-md'}`}>
                {APP_NAME}
              </span>
              <span className={`text-[9px] tracking-[0.2em] uppercase font-bold ${scrolled ? 'text-brand-600' : 'text-brand-300 drop-shadow-md'}`}>Premium</span>
            </div>
          </a>

          {/* Desktop Menu */}
          <div className={`hidden lg:flex items-center gap-1 rounded-full p-1.5 transition-all ${scrolled ? 'bg-gray-100/50 dark:bg-white/5 border border-gray-200 dark:border-white/10' : 'bg-black/20 border border-white/10 backdrop-blur-md'}`}>
             {NAV_ITEMS.map(item => (
                <a 
                  key={item.id} 
                  href={item.href} 
                  onClick={(e) => handleNavClick(e, item.id)}
                  className={`px-5 xl:px-6 py-2.5 rounded-full text-sm font-semibold tracking-wide transition-all duration-300 relative group overflow-hidden ${scrolled ? 'text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-white hover:bg-white dark:hover:bg-white/10 shadow-none hover:shadow-sm' : 'text-white hover:bg-white/10'}`}
                >
                  <span className="relative z-10">{item.label[language]}</span>
                </a>
             ))}
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-2 lg:gap-3">
            <button onClick={toggleLanguage} className={`font-bold text-xs uppercase px-3 py-2 rounded-full transition-all border ${scrolled ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}`}>
              {language}
            </button>
            <button onClick={toggleTheme} className={`p-2.5 rounded-full transition-all ${scrolled ? 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800' : 'text-white hover:bg-white/20'}`}>
              {theme === 'light' ? <Icons.Moon size={18} /> : <Icons.Sun size={18} />}
            </button>
            
            {/* Auth / User Area */}
            <div>
              {user ? (
                <div className={`flex items-center gap-2 lg:gap-3 pl-3 lg:pl-4 border-l ${scrolled ? 'border-gray-200 dark:border-gray-700' : 'border-white/20'}`}>
                    <button onClick={() => { setBookingsModal(true); setConfirmedCount(0); }} className={`p-2.5 rounded-full transition-all group relative ${scrolled ? 'text-gray-600 dark:text-gray-300 hover:text-brand-600 hover:bg-brand-50' : 'text-white/80 hover:bg-white/10 hover:text-white'}`} title={CONTENT.profile.myBookings[language]}>
                       <Icons.History size={20} />
                       {confirmedCount > 0 && (
                           <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-gray-900 rounded-full animate-pulse"></span>
                       )}
                    </button>
                    <button onClick={() => setIsCartOpen(true)} className="relative group">
                      <div className={`p-2.5 rounded-full transition-all ${scrolled ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 border border-brand-100 dark:border-brand-900' : 'bg-white/90 text-brand-700 shadow-lg'}`}>
                          <Icons.ClipboardList size={20} />
                      </div>
                      {cartItems.length > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full shadow-lg ring-2 ring-white dark:ring-gray-900 transform group-hover:scale-110 transition-transform">{cartItems.reduce((acc, item) => acc + item.quantity, 0)}</span>}
                    </button>
                    <button onClick={() => setIsProfileOpen(true)} className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/50 shadow-lg hover:border-brand-500 transition-all ring-2 ring-transparent hover:ring-brand-200">
                        {userProfile?.avatar_url ? (
                          <img src={userProfile.avatar_url} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center text-white font-bold">{user.email?.[0].toUpperCase()}</div>
                        )}
                    </button>
                    <button 
                      onClick={handleLogout}
                      className={`p-2.5 rounded-full transition-all group ${scrolled ? 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20' : 'text-white/70 hover:text-red-400 hover:bg-white/10'}`}
                    >
                      <Icons.LogOut size={20} className="group-hover:-translate-x-0.5 transition-transform" />
                    </button>
                </div>
              ) : (
                <button onClick={() => setAuthModal({ isOpen: true, type: 'signin' })} className={`px-6 py-2.5 rounded-full font-bold shadow-lg transition-all hover:translate-y-[-1px] hover:shadow-xl text-sm border border-transparent flex items-center gap-2 ${scrolled ? 'bg-brand-600 text-white hover:bg-brand-700' : 'bg-white text-brand-900 hover:bg-brand-50'}`}>
                  <Icons.User className="w-4 h-4" />
                  {CONTENT.auth.signIn[language]}
                </button>
              )}
            </div>
          </div>
          
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={`lg:hidden p-2 rounded-lg ${scrolled ? 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800' : 'text-white hover:bg-white/20'}`}>
             {isMenuOpen ? <Icons.X /> : <Icons.Menu />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 z-40 bg-white/95 dark:bg-gray-950/95 backdrop-blur-2xl transition-all duration-300 lg:hidden flex flex-col justify-center items-center gap-8 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
          <div className="flex flex-col items-center gap-6 w-full px-4 sm:px-6 max-h-[85vh] overflow-y-auto pt-20">
              {NAV_ITEMS.map(item => (
                  <a 
                      key={item.id}
                      href={item.href}
                      onClick={(e) => handleNavClick(e, item.id)}
                      className="text-3xl font-bold font-display text-gray-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                  >
                      {item.label[language]}
                  </a>
              ))}
          </div>

          <div className="w-20 h-[1px] bg-gray-200 dark:bg-gray-800 shrink-0"></div>

          <div className="flex flex-col items-center gap-6 w-full px-6 pb-10">
              {/* Auth / Profile Mobile */}
              {user ? (
                   <div className="flex flex-col items-center gap-5 w-full">
                       <button onClick={() => { setIsProfileOpen(true); setIsMenuOpen(false); }} className="flex items-center gap-3 text-xl text-gray-700 dark:text-gray-200 p-3 w-full justify-center bg-gray-100 dark:bg-gray-900 rounded-xl">
                           <div className="w-8 h-8 rounded-full overflow-hidden bg-brand-500 flex items-center justify-center text-white text-sm">
                               {userProfile?.avatar_url ? (
                                   <img src={userProfile.avatar_url} className="w-full h-full object-cover" />
                               ) : (
                                   user.email[0].toUpperCase()
                               )}
                           </div>
                           {CONTENT.profile.title[language]}
                       </button>
                       <button onClick={() => { setBookingsModal(true); setConfirmedCount(0); setIsMenuOpen(false); }} className="flex items-center gap-3 text-xl text-gray-700 dark:text-gray-200 p-3 w-full justify-center bg-gray-100 dark:bg-gray-900 rounded-xl">
                           <Icons.History />
                           {CONTENT.profile.myBookings[language]}
                           {confirmedCount > 0 && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{confirmedCount}</span>}
                       </button>
                       <button onClick={() => { setIsCartOpen(true); setIsMenuOpen(false); }} className="flex items-center gap-3 text-xl text-gray-700 dark:text-gray-200 p-3 w-full justify-center bg-gray-100 dark:bg-gray-900 rounded-xl">
                           <Icons.ClipboardList />
                           {CONTENT.cart.title[language]} ({cartItems.length})
                       </button>
                       <button onClick={handleLogout} className="text-red-500 font-bold mt-2">
                           {CONTENT.auth.signOut[language]}
                       </button>
                   </div>
              ) : (
                   <button onClick={() => { setAuthModal({ isOpen: true, type: 'signin' }); setIsMenuOpen(false); }} className="text-xl font-bold text-white bg-brand-600 py-3 px-8 rounded-full shadow-lg w-full max-w-xs">
                       {CONTENT.auth.signIn[language]}
                   </button>
              )}

              {/* Toggles Mobile */}
              <div className="flex items-center gap-6 mt-4">
                   <button onClick={toggleLanguage} className="text-gray-900 dark:text-white font-bold uppercase border-2 border-gray-200 dark:border-gray-700 px-6 py-2 rounded-xl">
                       {language}
                   </button>
                   <button onClick={toggleTheme} className="text-gray-900 dark:text-white p-3 bg-gray-100 dark:bg-gray-800 rounded-full">
                       {theme === 'light' ? <Icons.Moon /> : <Icons.Sun />}
                   </button>
              </div>
          </div>
      </div>

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
         {/* Parallax Background */}
         <div className="absolute inset-0 z-0">
            <img 
              src={HERO_BG_URL} 
              alt="Luxury Interior" 
              className="w-full h-full object-cover animate-pulse-slow scale-105"
              style={{ objectPosition: '50% 85%' }} 
            />
            {/* Cinematic Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/30 to-gray-950"></div>
            <div className="absolute inset-0 bg-brand-900/30 mix-blend-overlay"></div>
            <div className="absolute bottom-0 w-full h-32 sm:h-64 bg-gradient-to-t from-gray-50 dark:from-[#030712] to-transparent"></div>
         </div>

         <div className="container mx-auto px-4 sm:px-6 relative z-10 pt-20 text-center">
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-3 px-4 py-2 sm:px-6 sm:py-3 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-white shadow-2xl mb-8 sm:mb-10 animate-fade-in-up hover:bg-white/10 transition-all cursor-default group hover:border-brand-500/30">
               <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
               </span>
               <span className="text-xs sm:text-sm font-semibold tracking-wide uppercase font-display">#1 Premium Cleaning in Bucharest</span>
            </div>
            
            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-9xl font-display font-black text-white tracking-tight mb-8 sm:mb-10 leading-[1.1] sm:leading-[1] drop-shadow-2xl animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              {language === 'en' ? 'Revive Your' : 'Revitalizează'} <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-200 via-white to-brand-400 relative z-10 filter drop-shadow-lg">
                {language === 'en' ? 'Living Space' : 'Spațiul Tău'}
              </span>
            </h1>
            
            {/* Subheadline */}
            <p className="text-lg sm:text-xl md:text-2xl text-gray-200 max-w-2xl mx-auto mb-10 sm:mb-14 leading-relaxed font-light animate-fade-in-up drop-shadow-md px-2" style={{ animationDelay: '0.2s' }}>
              {CONTENT.hero.subtitle[language]}
            </p>
            
            {/* CTAs */}
            <div className="flex justify-center animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
               <a 
                 href="#services" 
                 onClick={(e) => handleNavClick(e, 'services')} 
                 className="group relative px-8 py-4 sm:px-10 sm:py-5 bg-white text-brand-950 font-bold text-base sm:text-lg rounded-full overflow-hidden transition-all hover:shadow-[0_0_60px_-15px_rgba(255,255,255,0.7)] hover:scale-105"
               >
                  <span className="relative z-10 flex items-center gap-3">
                    {CONTENT.hero.cta[language]} <Icons.ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
               </a>
            </div>
         </div>

         {/* Scroll Indicator */}
         <div className="absolute bottom-8 sm:bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 animate-fade-in-up" style={{ animationDelay: '1s' }}>
            <div className="w-6 h-10 rounded-full border-2 border-white/20 flex justify-center p-1.5 backdrop-blur-sm bg-white/5">
               <div className="w-1.5 h-1.5 bg-white rounded-full animate-scroll"></div>
            </div>
            <span className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold">Scroll</span>
         </div>
      </section>

      {/* Services Grid */}
      <section id="services" className="py-20 lg:py-32 bg-gray-50 dark:bg-[#030712] relative overflow-hidden">
         <div className="absolute top-0 right-0 w-[300px] sm:w-[400px] lg:w-[800px] h-[300px] sm:h-[400px] lg:h-[800px] bg-brand-500/5 rounded-full blur-[80px] lg:blur-[120px] -translate-y-1/2 translate-x-1/3"></div>
         <div className="absolute bottom-0 left-0 w-[200px] sm:w-[300px] lg:w-[600px] h-[200px] sm:h-[300px] lg:h-[600px] bg-purple-500/5 rounded-full blur-[60px] lg:blur-[100px] translate-y-1/2 -translate-x-1/3"></div>
         
         <div className="container mx-auto px-4 sm:px-6 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 lg:mb-20">
               <h2 className="text-brand-600 dark:text-brand-400 font-bold uppercase tracking-widest text-xs sm:text-sm mb-4 font-display">Our Expertise</h2>
               <h3 className="text-3xl sm:text-4xl md:text-6xl font-display font-bold text-gray-900 dark:text-white mb-6 tracking-tight">Premium Services</h3>
               <p className="text-gray-600 dark:text-gray-400 text-lg sm:text-xl font-light leading-relaxed">Select a service to request a personalized quote. <br className="hidden md:block"/>We bring industrial-grade cleaning directly to your location.</p>
            </div>

            <div className="flex justify-center mb-10 sm:mb-16 overflow-x-auto pb-4 scrollbar-hide px-2">
               <div className="inline-flex flex-nowrap gap-2 bg-white dark:bg-gray-900/50 p-2 sm:p-2.5 rounded-full shadow-lg border border-gray-100 dark:border-white/5 backdrop-blur-sm min-w-max">
                  {categories.map(cat => (
                     <button 
                       key={cat} 
                       onClick={() => setActiveCategory(cat)}
                       className={`px-5 sm:px-8 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 whitespace-nowrap ${activeCategory === cat ? 'bg-brand-600 text-white shadow-glow scale-105' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'}`}
                     >
                       {CONTENT.categories[cat][language]}
                     </button>
                  ))}
               </div>
            </div>

            {loadingProducts ? (
               <div className="flex justify-center py-20"><div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div></div>
            ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
                  {filteredProducts.map((product) => (
                     <div key={product.id} className="group bg-white dark:bg-gray-900 rounded-[2rem] lg:rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-white/5 hover:-translate-y-2 hover:border-brand-500/30 relative flex flex-col h-full">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-brand-900/0 group-hover:to-brand-900/5 transition-colors duration-500"></div>
                        <div className="relative h-64 sm:h-80 overflow-hidden shrink-0">
                           <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/20 to-transparent z-10 opacity-60 group-hover:opacity-50 transition-opacity"></div>
                           <img src={product.image} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000" alt={product.name_en} />
                           
                           <div className="absolute top-5 right-5 z-20 bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-full font-bold text-xs sm:text-sm shadow-xl group-hover:bg-brand-600/90 group-hover:border-brand-500 transition-colors">
                              Starting {product.price} RON
                           </div>

                           <div className="absolute bottom-6 left-6 z-20">
                              <span className="text-brand-300 text-xs font-bold uppercase tracking-wider mb-2 block">
                                 {CONTENT.categories[product.category as ProductCategory]?.[language] || product.category}
                              </span>
                              <h4 className="text-white font-display font-bold text-2xl sm:text-3xl group-hover:text-brand-100 transition-colors leading-tight">{language === 'en' ? product.name_en : product.name_ro}</h4>
                           </div>
                        </div>
                        <div className="p-6 sm:p-8 relative z-20 bg-white dark:bg-[#0B1120] transition-colors flex flex-col flex-1">
                           <p className="text-gray-600 dark:text-gray-400 mb-6 sm:mb-8 text-sm sm:text-base leading-relaxed line-clamp-3 font-light flex-1">
                              {language === 'en' ? product.description_en : product.description_ro}
                           </p>
                           <button onClick={() => handleAddToCart(product)} className="w-full py-3 sm:py-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white font-bold hover:bg-brand-600 hover:text-white dark:hover:bg-brand-600 transition-all flex items-center justify-center gap-3 group/btn border border-gray-200 dark:border-white/5 hover:border-transparent hover:shadow-lg mt-auto">
                              {language === 'en' ? 'Add to Request' : 'Adaugă la Cerere'}
                              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 flex items-center justify-center group-hover/btn:bg-white/20 transition-colors">
                                <Icons.ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                              </div>
                           </button>
                        </div>
                     </div>
                  ))}
               </div>
            )}
         </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 lg:py-32 bg-white dark:bg-[#080c14] overflow-hidden border-t border-gray-100 dark:border-white/5">
         <div className="container mx-auto px-4 sm:px-6 text-center">
            <div className="max-w-4xl mx-auto">
                <h2 className="text-brand-600 dark:text-brand-400 font-bold uppercase tracking-widest text-xs sm:text-sm mb-4 font-display">Why Choose SofaSteam</h2>
                <h3 className="text-3xl sm:text-5xl lg:text-7xl font-display font-bold text-gray-900 dark:text-white mb-6 lg:mb-8 leading-[1.1] tracking-tight">{CONTENT.about.title[language]}</h3>
                <div className="space-y-6 lg:space-y-8 text-gray-600 dark:text-gray-300 text-lg sm:text-xl leading-relaxed mb-12 lg:mb-16 font-light">
                    <p>{CONTENT.about.text[language]}</p>
                    <p className="font-medium text-gray-900 dark:text-white">{CONTENT.about.qualityText[language]}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                    {CONTENT.about.steps.map((step, idx) => {
                        const Icon = Icons[step.icon as keyof typeof Icons] || Icons.Star;
                        return (
                            <div key={idx} className="flex flex-col items-center p-6 lg:p-8 rounded-3xl bg-gray-50 dark:bg-white/5 transition-colors cursor-default group border border-transparent hover:border-gray-200 dark:hover:border-white/10 hover:shadow-lg">
                                <div className="w-16 h-16 lg:w-20 lg:h-20 bg-white dark:bg-gray-800 shadow-xl text-brand-600 dark:text-brand-400 rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform border border-gray-100 dark:border-white/10 mb-4 lg:mb-6">
                                    <Icon className="w-6 h-6 lg:w-8 lg:h-8" />
                                </div>
                                <h4 className="font-bold text-lg lg:text-xl text-gray-900 dark:text-white mb-2 lg:mb-3 font-display">{step.title[language]}</h4>
                                <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm lg:text-base">{step.desc[language]}</p>
                            </div>
                        )
                    })}
                </div>
            </div>
         </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 lg:py-32 bg-[#050505] relative overflow-hidden text-white">
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
         <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-brand-900/20 to-transparent pointer-events-none"></div>
         
         <div className="container mx-auto px-4 sm:px-6 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
               <div className="order-2 lg:order-1">
                  <h2 className="text-brand-400 font-bold uppercase tracking-widest text-xs sm:text-sm mb-4">Contact Us</h2>
                  <h3 className="text-4xl sm:text-5xl lg:text-6xl font-display font-black mb-8 leading-[1.1]">Ready for a <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-white">spotless home?</span></h3>
                  <p className="text-xl sm:text-2xl text-gray-400 mb-10 font-light">{CONTENT.contact.subtitle[language]}</p>
                  
                  <div className="space-y-4 lg:space-y-6">
                     <a href={`https://wa.me/${PHONE.replace(/[^0-9]/g, '')}`} target="_blank" className="flex items-center gap-6 lg:gap-8 group p-4 lg:p-6 rounded-3xl hover:bg-white/5 transition-all border border-transparent hover:border-white/10">
                        <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white shadow-lg shadow-brand-500/20 group-hover:scale-110 transition-transform">
                           <Icons.Phone className="w-6 h-6 lg:w-8 lg:h-8" />
                        </div>
                        <div>
                           <p className="text-[10px] lg:text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">Call / WhatsApp</p>
                           <span className="text-2xl lg:text-3xl font-bold font-mono group-hover:text-brand-300 transition-colors">{PHONE}</span>
                        </div>
                     </a>
                     
                     <a href={`mailto:${CONTACT_EMAIL}`} className="flex items-center gap-6 lg:gap-8 group p-4 lg:p-6 rounded-3xl hover:bg-white/5 transition-all border border-transparent hover:border-white/10">
                        <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-2xl bg-gray-800 flex items-center justify-center text-gray-300 group-hover:bg-gray-700 group-hover:text-white transition-all">
                           <Icons.Mail className="w-6 h-6 lg:w-8 lg:h-8" />
                        </div>
                        <div className="overflow-hidden">
                           <p className="text-[10px] lg:text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">Email</p>
                           <span className="text-lg lg:text-2xl font-bold group-hover:text-brand-300 transition-colors truncate block">{CONTACT_EMAIL}</span>
                        </div>
                     </a>
                     
                     <div className="flex items-center gap-6 lg:gap-8 group p-4 lg:p-6">
                        <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-2xl bg-gray-800 flex items-center justify-center text-gray-300">
                           <Icons.MapPin className="w-6 h-6 lg:w-8 lg:h-8" />
                        </div>
                        <div>
                           <p className="text-[10px] lg:text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">Location</p>
                           <p className="text-lg lg:text-xl font-medium text-gray-200">{ADDRESS}</p>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="order-1 lg:order-2 glass-card bg-black/40 backdrop-blur-2xl border border-white/10 p-6 lg:p-12 rounded-[2rem] lg:rounded-[3rem] shadow-2xl relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                  <div className="absolute top-0 right-0 p-8 lg:p-12 opacity-5 pointer-events-none">
                     <Icons.Quote className="w-24 h-24 lg:w-40 lg:h-40 text-white" />
                  </div>
                  
                  <h4 className="text-2xl lg:text-4xl font-display font-bold mb-6 lg:mb-10 text-white relative z-10">
                      {CONTENT.contact.sendButton[language]}
                  </h4>
                  
                  <form className="space-y-4 lg:space-y-8 relative z-10" onSubmit={handleSendMessage}>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-8">
                        <div className="space-y-2 lg:space-y-3 group/input">
                           <label className="text-[10px] lg:text-xs font-bold text-gray-400 uppercase tracking-wider ml-1 group-focus-within/input:text-brand-400 transition-colors">{CONTENT.contact.nameLabel[language]}</label>
                           <input type="text" name="name" className="w-full bg-white/5 border border-white/10 rounded-xl lg:rounded-2xl px-4 py-3 lg:px-6 lg:py-4 focus:ring-1 focus:ring-brand-500 outline-none text-white placeholder-gray-600 transition-all focus:bg-white/10 focus:border-brand-500/50 shadow-inner" placeholder="John Doe" required />
                        </div>
                        <div className="space-y-2 lg:space-y-3 group/input">
                           <label className="text-[10px] lg:text-xs font-bold text-gray-400 uppercase tracking-wider ml-1 group-focus-within/input:text-brand-400 transition-colors">{CONTENT.contact.emailLabel[language]}</label>
                           <input type="email" name="email" className="w-full bg-white/5 border border-white/10 rounded-xl lg:rounded-2xl px-4 py-3 lg:px-6 lg:py-4 focus:ring-1 focus:ring-brand-500 outline-none text-white placeholder-gray-600 transition-all focus:bg-white/10 focus:border-brand-500/50 shadow-inner" placeholder="john@example.com" required />
                        </div>
                     </div>
                     <div className="space-y-2 lg:space-y-3 group/input">
                        <label className="text-[10px] lg:text-xs font-bold text-gray-400 uppercase tracking-wider ml-1 group-focus-within/input:text-brand-400 transition-colors">{CONTENT.contact.messageLabel[language]}</label>
                        <textarea 
                            name="message" 
                            rows={4} 
                            className="w-full bg-white/5 border border-white/10 rounded-xl lg:rounded-2xl px-4 py-3 lg:px-6 lg:py-4 focus:ring-1 focus:ring-brand-500 outline-none text-white placeholder-gray-600 resize-none transition-all focus:bg-white/10 focus:border-brand-500/50 shadow-inner" 
                            placeholder={language === 'en' ? "Tell us about your cleaning needs or questions..." : "Spune-ne despre nevoile tale de curățenie sau întrebări..."} 
                            required
                        ></textarea>
                     </div>
                     <button className="w-full bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold py-4 lg:py-6 rounded-xl lg:rounded-2xl text-lg lg:text-xl shadow-lg hover:shadow-brand-500/40 transition-all active:scale-[0.98] flex justify-center items-center gap-3 border border-white/10">
                        {CONTENT.contact.sendButton[language]}
                        <Icons.Send className="w-5 h-5 lg:w-6 lg:h-6" />
                     </button>
                  </form>
               </div>
            </div>
         </div>
      </section>

      {/* Mega Footer - Perfectly Aligned */}
      <footer className="bg-black pt-20 lg:pt-40 pb-12 lg:pb-16 text-white relative overflow-hidden border-t border-white/10">
         <div className="absolute top-24 left-1/2 -translate-x-1/2 w-full text-center pointer-events-none select-none opacity-[0.05]">
            <span className="text-[20vw] font-display font-black leading-none text-white tracking-tight">SOFASTEAM</span>
         </div>
         <div className="absolute top-0 left-0 w-[500px] lg:w-[1000px] h-[500px] lg:h-[1000px] bg-brand-900/10 rounded-full blur-[100px] lg:blur-[150px] pointer-events-none"></div>
         <div className="absolute bottom-0 right-0 w-[400px] lg:w-[800px] h-[400px] lg:h-[800px] bg-indigo-900/10 rounded-full blur-[100px] lg:blur-[150px] pointer-events-none"></div>

         <div className="container mx-auto px-6 relative z-10">
            {/* Main Grid: 1 col mobile, 2 cols tablet, 4 cols desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-20 mb-20 lg:mb-32">
               
               {/* Column 1: Brand & Identity */}
               <div className="space-y-6 lg:space-y-8 flex flex-col items-center text-center md:items-start md:text-left">
                  <div className="flex items-center gap-4 h-16 mb-2 lg:mb-4"> {/* Enforced Height */}
                     <div className="w-12 h-12">
                        <img src={LOGO_URL} className="w-full h-full object-contain" alt="Logo" />
                     </div>
                     <span className="text-2xl lg:text-3xl font-display font-black tracking-tight pt-1">{APP_NAME}</span>
                  </div>
                  <p className="text-gray-400 text-base lg:text-lg leading-relaxed font-light max-w-sm">
                     Redefining cleanliness with premium technology. Showroom quality for your living space.
                  </p>
               </div>

               {/* Column 2: Navigation */}
               <div className="flex flex-col items-center md:items-start text-center md:text-left">
                  <div className="h-16 flex items-center w-full justify-center md:justify-start mb-2 lg:mb-4"> {/* Enforced Height */}
                     <h4 className="font-bold text-white text-lg lg:text-xl flex items-center gap-3 font-display">
                       <span className="w-8 h-[2px] bg-brand-500 inline-block rounded-full"></span>
                       Company
                     </h4>
                  </div>
                  <ul className="space-y-3 lg:space-y-4 w-full">
                     {NAV_ITEMS.map(item => (
                        <li key={item.id}>
                           <a 
                             href={item.href} 
                             onClick={(e) => handleNavClick(e, item.id)} 
                             className="text-gray-400 hover:text-white transition-all block text-base lg:text-lg hover:translate-x-2 flex items-center justify-center md:justify-start gap-2 group"
                           >
                              <Icons.ChevronRight className="w-3 h-3 lg:w-4 lg:h-4 opacity-0 group-hover:opacity-100 transition-opacity text-brand-500" />
                              {item.label[language]}
                           </a>
                        </li>
                     ))}
                  </ul>
               </div>

               {/* Column 3: Follow Us */}
               <div className="flex flex-col items-center md:items-start text-center md:text-left">
                  <div className="h-16 flex items-center w-full justify-center md:justify-start mb-2 lg:mb-4"> {/* Enforced Height */}
                     <h4 className="font-bold text-white text-lg lg:text-xl flex items-center gap-3 font-display">
                       <span className="w-8 h-[2px] bg-brand-500 inline-block rounded-full"></span>
                       {CONTENT.footer.followUs[language]}
                     </h4>
                  </div>
                  <a 
                     href={INSTAGRAM_URL} 
                     target="_blank" 
                     className="inline-flex items-center gap-4 text-gray-300 hover:text-white transition-all group p-4 lg:p-5 bg-white/5 rounded-3xl hover:bg-brand-600 border border-white/10 hover:border-brand-500 w-full md:w-auto justify-center md:justify-start"
                  >
                     <Icons.Instagram className="w-6 h-6 lg:w-8 lg:h-8 group-hover:scale-110 transition-transform" />
                     <span className="font-bold text-base">@sofasteambucuresti</span>
                  </a>
               </div>

               {/* Column 4: Newsletter */}
               <div className="flex flex-col items-center md:items-start text-center md:text-left w-full">
                  <div className="h-16 flex items-center w-full justify-center md:justify-start mb-2 lg:mb-4"> {/* Enforced Height */}
                     <h4 className="font-bold text-white text-lg lg:text-xl flex items-center gap-3 font-display">
                       <span className="w-8 h-[2px] bg-brand-500 inline-block rounded-full"></span>
                       {CONTENT.footer.newsletter[language]}
                     </h4>
                  </div>
                  <p className="text-gray-400 mb-6 text-sm lg:text-base leading-relaxed">
                     Join for exclusive seasonal offers <br className="hidden lg:block"/> and maintenance tips.
                  </p>
                  <form className="relative group w-full max-w-sm" onSubmit={(e) => e.preventDefault()}>
                     <input 
                       type="email" 
                       placeholder="Enter your email" 
                       className="w-full bg-white/5 border border-white/10 rounded-2xl pl-5 pr-14 py-3 lg:py-4 text-sm lg:text-base focus:ring-2 focus:ring-brand-500 outline-none text-white placeholder-gray-600 transition-all focus:bg-white/10 focus:border-white/20" 
                     />
                     <button className="absolute right-2 top-2 bottom-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl w-10 lg:w-12 flex items-center justify-center transition-all shadow-lg hover:shadow-brand-500/25">
                        <Icons.ArrowRight className="w-4 h-4 lg:w-5 lg:h-5" />
                     </button>
                  </form>
               </div>
            </div>
            
            <div className="border-t border-white/10 pt-10 lg:pt-12 flex flex-col md:flex-row justify-between items-center gap-8">
               <p className="text-gray-500 text-sm font-medium tracking-wide text-center md:text-left">
                 {CONTENT.footer.rights[language]}
               </p>
               <div className="flex flex-wrap justify-center gap-6 lg:gap-10 text-sm text-gray-500 font-medium">
                  <button onClick={() => setLegalModal({ isOpen: true, type: 'privacy' })} className="hover:text-white transition-colors hover:underline decoration-brand-500 decoration-2 underline-offset-4">Privacy Policy</button>
                  <button onClick={() => setLegalModal({ isOpen: true, type: 'terms' })} className="hover:text-white transition-colors hover:underline decoration-brand-500 decoration-2 underline-offset-4">Terms of Service</button>
                  <button onClick={scrollToTop} className="flex items-center gap-2 hover:text-white transition-colors text-brand-400 uppercase tracking-widest text-xs font-bold">
                     Back to Top <Icons.ArrowRight className="-rotate-90 w-3 h-3" />
                  </button>
               </div>
            </div>
         </div>
      </footer>

      {/* WhatsApp Floating */}
      <div className="fixed bottom-6 right-6 lg:bottom-8 lg:right-8 z-[100] flex flex-col items-end gap-6">
          <a 
            href={`https://wa.me/${PHONE.replace(/[^0-9]/g, '')}`} 
            target="_blank"
            className="group bg-brand-600 hover:bg-green-500 text-white w-14 h-14 lg:w-20 lg:h-20 rounded-full shadow-2xl shadow-brand-500/30 transition-all hover:scale-105 active:scale-95 flex items-center justify-center relative border-4 border-white dark:border-gray-900"
          >
              <span className="absolute 1.5 -right-1.5 w-4 h-4 lg:w-5 lg:h-5 bg-green-400 rounded-full border-4 border-white dark:border-gray-900 animate-pulse"></span>
              <Icons.Phone className="w-6 h-6 lg:w-9 lg:h-9 animate-tada" />
          </a>
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

      <BookingsModal
        isOpen={bookingsModal}
        onClose={() => setBookingsModal(false)}
        language={language}
        user={user}
      />
      
      <ProductModal 
        isOpen={productModal.isOpen} 
        onClose={() => setProductModal({ isOpen: false, product: null })} 
        product={productModal.product} 
        onSaved={fetchProducts} 
        language={language} 
      />

      <LegalModal 
        isOpen={legalModal.isOpen}
        onClose={() => setLegalModal({ isOpen: false, type: null })}
        type={legalModal.type}
        language={language}
      />
    </div>
  );
};

export default App;
