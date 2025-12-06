
import React, { useState, useEffect } from 'react';
import { Icons } from './components/Icon';
import ChatAssistant from './components/ChatAssistant';
import AuthModal from './components/AuthModal';
import ProductModal from './components/ProductModal';
import ProfileModal from './components/ProfileModal';
import CartDrawer from './components/CartDrawer';
import AdminDashboard from './components/AdminDashboard';
import LegalModal from './components/LegalModal';
import { NAV_ITEMS, CONTENT, APP_NAME, LOGO_URL, ADDRESS, PHONE, CONTACT_EMAIL, INSTAGRAM_URL, HERO_BG_URL, WHY_US_IMAGES } from './constants';
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
    alert(CONTENT.contact.successMessage[language]);
    (e.target as HTMLFormElement).reset();
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      const offset = 80;
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
    <div className="min-h-screen flex flex-col font-sans text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-950 overflow-x-hidden selection:bg-brand-500 selection:text-white">
      
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'glass-nav shadow-lg py-3 border-b border-gray-200/50 dark:border-gray-800/50' : 'bg-transparent py-8'}`}>
        <div className="container mx-auto px-6 flex items-center justify-between">
          
          {/* Logo */}
          <a href="#home" onClick={(e) => handleNavClick(e, 'home')} className="flex items-center gap-3 group">
            <div className="w-14 h-14 lg:w-16 lg:h-16 transition-transform duration-500 group-hover:scale-110">
              <img src={LOGO_URL} alt={APP_NAME} className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className={`text-2xl font-extrabold tracking-tight leading-none ${scrolled ? 'text-gray-900 dark:text-white' : 'text-white'}`}>
                {APP_NAME}
              </span>
              <span className={`text-[10px] tracking-[0.2em] uppercase font-bold ${scrolled ? 'text-brand-600' : 'text-brand-300'}`}>Premium Cleaning</span>
            </div>
          </a>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-1 bg-white/5 backdrop-blur-md px-2 py-1.5 rounded-full border border-white/10 shadow-2xl">
             {NAV_ITEMS.map(item => (
                <a 
                  key={item.id} 
                  href={item.href} 
                  onClick={(e) => handleNavClick(e, item.id)}
                  className={`px-5 py-2.5 rounded-full text-sm font-semibold tracking-wide transition-all duration-300 relative group overflow-hidden ${scrolled ? 'text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-white hover:bg-white dark:hover:bg-gray-800' : 'text-white hover:bg-white/10'}`}
                >
                  <span className="relative z-10">{item.label[language]}</span>
                </a>
             ))}
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-4">
            <button onClick={toggleLanguage} className={`font-bold text-xs uppercase px-3 py-1.5 rounded-lg transition-all border ${scrolled ? 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}`}>
              {language}
            </button>
            <button onClick={toggleTheme} className={`p-2.5 rounded-full transition-all ${scrolled ? 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800' : 'text-white hover:bg-white/20'}`}>
              {theme === 'light' ? <Icons.Moon size={18} /> : <Icons.Sun size={18} />}
            </button>
            
            {user ? (
              <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-700/50">
                  <button onClick={() => setIsCartOpen(true)} className="relative group">
                     <div className={`p-2.5 rounded-full transition-all ${scrolled ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 border border-brand-100 dark:border-brand-900' : 'bg-white/90 text-brand-700'}`}>
                        <Icons.ClipboardList size={20} />
                     </div>
                     {cartItems.length > 0 && <span className="absolute -top-1.5 -right-1.5 w-5 h-5 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full shadow-lg ring-2 ring-white dark:ring-gray-900 transform group-hover:scale-110 transition-transform">{cartItems.reduce((acc, item) => acc + item.quantity, 0)}</span>}
                  </button>
                  <button onClick={() => setIsProfileOpen(true)} className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/50 shadow-lg hover:border-brand-500 transition-all ring-2 ring-transparent hover:ring-brand-200">
                      {userProfile?.avatar_url ? (
                        <img src={userProfile.avatar_url} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center text-white font-bold">{user.email[0].toUpperCase()}</div>
                      )}
                  </button>
                  <button 
                    onClick={handleLogout}
                    className={`p-2.5 rounded-full transition-all group ${scrolled ? 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20' : 'text-white/70 hover:text-red-400 hover:bg-white/10'}`}
                    title={CONTENT.auth.signOut[language]}
                  >
                    <Icons.LogOut size={20} className="group-hover:-translate-x-0.5 transition-transform" />
                  </button>
              </div>
            ) : (
              <button onClick={() => setAuthModal({ isOpen: true, type: 'signin' })} className="bg-white text-brand-900 hover:bg-brand-50 px-6 py-2.5 rounded-full font-bold shadow-lg shadow-black/5 transition-all hover:translate-y-[-1px] hover:shadow-xl text-sm border border-transparent">
                 {CONTENT.auth.signIn[language]}
              </button>
            )}
          </div>
          
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={`lg:hidden p-2 rounded-lg ${scrolled ? 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800' : 'text-white hover:bg-white/20'}`}>
             {isMenuOpen ? <Icons.X /> : <Icons.Menu />}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
         {/* Background with Overlay */}
         <div className="absolute inset-0 z-0">
            <img 
              src={HERO_BG_URL} 
              alt="Luxury Interior" 
              className="w-full h-full object-cover animate-pulse-slow scale-105"
              style={{ objectPosition: '50% 85%' }} 
            />
            {/* Multi-layered gradient for depth */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-gray-900/90"></div>
            <div className="absolute inset-0 bg-brand-900/20 mix-blend-color-dodge"></div>
         </div>

         <div className="container mx-auto px-6 relative z-10 pt-20 text-center">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-white shadow-2xl mb-8 animate-fade-in-up hover:bg-white/10 transition-colors cursor-default">
               <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
               <span className="text-sm font-semibold tracking-wide">#1 Premium Cleaning Service in Bucharest</span>
            </div>
            
            <h1 className="text-6xl md:text-7xl lg:text-9xl font-extrabold text-white tracking-tighter mb-8 leading-[1.05] drop-shadow-2xl animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              {language === 'en' ? 'Revive Your' : 'Revitalizează'} <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-200 via-white to-brand-400 relative z-10">
                {language === 'en' ? 'Living Space' : 'Spațiul Tău'}
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto mb-12 leading-relaxed font-light animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              {CONTENT.hero.subtitle[language]}
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
               <a href="#services" onClick={(e) => handleNavClick(e, 'services')} className="group relative px-9 py-4 bg-white text-brand-950 font-bold text-lg rounded-full overflow-hidden transition-all hover:shadow-[0_0_50px_-12px_rgba(255,255,255,0.6)] hover:scale-105">
                  <span className="relative z-10 flex items-center gap-2">
                    {CONTENT.hero.cta[language]} <Icons.ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
               </a>
               <button onClick={() => setIsChatOpen(true)} className="px-9 py-4 bg-white/5 backdrop-blur-md border border-white/10 text-white font-bold text-lg rounded-full hover:bg-white/10 transition-all flex items-center gap-3 hover:border-white/30">
                  <Icons.Sparkles className="w-5 h-5 text-brand-300" />
                  {CONTENT.assistant.title[language]}
               </button>
            </div>
         </div>

         {/* Scroll Indicator */}
         <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-in-up" style={{ animationDelay: '1s' }}>
            <div className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center p-1.5">
               <div className="w-1.5 h-1.5 bg-white rounded-full animate-scroll"></div>
            </div>
            <span className="text-xs text-white/50 uppercase tracking-widest font-bold">Scroll</span>
         </div>
      </section>

      {/* Services Grid */}
      <section id="services" className="py-32 bg-gray-50 dark:bg-gray-950 relative overflow-hidden">
         {/* Background Decoration */}
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
         
         <div className="container mx-auto px-6 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-20">
               <h2 className="text-brand-600 dark:text-brand-400 font-extrabold uppercase tracking-widest text-sm mb-4">Our Expertise</h2>
               <h3 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white mb-6">Premium Services</h3>
               <p className="text-gray-600 dark:text-gray-400 text-xl font-light">Select a service to request a personalized quote. We bring industrial-grade cleaning directly to your location.</p>
            </div>

            {/* Filter Pills */}
            <div className="flex justify-center mb-16">
               <div className="inline-flex flex-wrap justify-center gap-2 bg-white dark:bg-gray-900 p-2 rounded-full shadow-sm border border-gray-200 dark:border-gray-800">
                  {categories.map(cat => (
                     <button 
                       key={cat} 
                       onClick={() => setActiveCategory(cat)}
                       className={`px-6 py-3 rounded-full text-sm font-bold transition-all duration-300 ${activeCategory === cat ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-lg scale-105' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                     >
                       {CONTENT.categories[cat][language]}
                     </button>
                  ))}
               </div>
            </div>

            {/* Service Cards */}
            {loadingProducts ? (
               <div className="flex justify-center py-20"><div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div></div>
            ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredProducts.map((product) => (
                     <div key={product.id} className="group bg-white dark:bg-gray-900 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-gray-800 hover:-translate-y-2">
                        <div className="relative h-80 overflow-hidden">
                           <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent z-10 opacity-60"></div>
                           <img src={product.image} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" alt={product.name_en} />
                           
                           {/* Floating Price Tag */}
                           <div className="absolute top-6 right-6 z-20 bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg">
                              Starting {product.price} RON
                           </div>

                           <div className="absolute bottom-6 left-6 z-20">
                              <span className="text-brand-300 text-xs font-bold uppercase tracking-wider mb-2 block">
                                 {CONTENT.categories[product.category as ProductCategory]?.[language] || product.category}
                              </span>
                              <h4 className="text-white font-bold text-2xl group-hover:text-brand-200 transition-colors">{language === 'en' ? product.name_en : product.name_ro}</h4>
                           </div>
                        </div>
                        <div className="p-8">
                           <p className="text-gray-600 dark:text-gray-400 mb-8 text-base leading-relaxed line-clamp-3">
                              {language === 'en' ? product.description_en : product.description_ro}
                           </p>
                           <button onClick={() => handleAddToCart(product)} className="w-full py-4 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-bold hover:bg-brand-600 hover:text-white dark:hover:bg-brand-600 transition-all flex items-center justify-center gap-2 group/btn">
                              {language === 'en' ? 'Add to Request' : 'Adaugă la Cerere'}
                              <Icons.ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                           </button>
                        </div>
                     </div>
                  ))}
               </div>
            )}
         </div>
      </section>

      {/* Process / About Section with Image Collage */}
      <section id="about" className="py-32 bg-white dark:bg-gray-900 overflow-hidden">
         <div className="container mx-auto px-6">
            <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">
               
               {/* Bento Grid / Masonry Layout for Images */}
               <div className="lg:w-1/2 relative">
                  <div className="grid grid-cols-2 gap-4 h-[600px] w-full">
                     {/* Image 1: Tall / Left */}
                     <div className="relative rounded-[2rem] overflow-hidden row-span-2 group h-full shadow-2xl">
                         <img src={WHY_US_IMAGES[0]} alt="Car Cleaning" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                         <div className="absolute bottom-4 left-4 right-4 bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-xl">
                            <span className="text-white font-bold text-sm block">Auto Detailing</span>
                         </div>
                     </div>
                     
                     {/* Image 2: Top Right */}
                     <div className="relative rounded-[2rem] overflow-hidden group h-full shadow-xl">
                         <img src={WHY_US_IMAGES[1]} alt="Sofa Cleaning" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                         <div className="absolute bottom-4 left-4 bg-white/10 backdrop-blur-md border border-white/20 p-2 px-3 rounded-xl">
                            <span className="text-white font-bold text-xs block">Deep Clean</span>
                         </div>
                     </div>

                     {/* Image 3: Bottom Right */}
                     <div className="relative rounded-[2rem] overflow-hidden group h-full shadow-xl">
                         <img src={WHY_US_IMAGES[2]} alt="Process" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                         <div className="absolute bottom-4 left-4 bg-white/10 backdrop-blur-md border border-white/20 p-2 px-3 rounded-xl">
                            <span className="text-white font-bold text-xs block">Technology</span>
                         </div>
                     </div>
                  </div>
                  
                  {/* Decorative Glows */}
                  <div className="absolute -top-10 -left-10 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl -z-10"></div>
                  <div className="absolute bottom-10 -right-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -z-10"></div>
               </div>

               <div className="lg:w-1/2">
                  <h2 className="text-brand-600 dark:text-brand-400 font-extrabold uppercase tracking-widest text-sm mb-4">Why Choose SofaSteam</h2>
                  <h3 className="text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-8 leading-tight">{CONTENT.about.title[language]}</h3>
                  <div className="space-y-6 text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-12 font-light">
                     <p>{CONTENT.about.text[language]}</p>
                     <p className="font-medium text-gray-900 dark:text-white border-l-4 border-brand-500 pl-6">{CONTENT.about.qualityText[language]}</p>
                  </div>

                  <div className="grid gap-4">
                     {CONTENT.about.steps.map((step, idx) => {
                        const Icon = Icons[step.icon as keyof typeof Icons] || Icons.Star;
                        return (
                           <div key={idx} className="flex gap-6 p-6 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-default group border border-transparent hover:border-gray-100 dark:hover:border-gray-800">
                              <div className="w-16 h-16 bg-white dark:bg-gray-800 shadow-lg text-brand-600 dark:text-brand-400 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform border border-gray-100 dark:border-gray-700">
                                 <Icon className="w-8 h-8" />
                              </div>
                              <div>
                                 <h4 className="font-bold text-xl text-gray-900 dark:text-white mb-2">{step.title[language]}</h4>
                                 <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{step.desc[language]}</p>
                              </div>
                           </div>
                        )
                     })}
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Contact Section - Modernized */}
      <section id="contact" className="py-32 bg-gray-950 relative overflow-hidden text-white">
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
         <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-brand-900/30 to-transparent pointer-events-none"></div>
         <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-t from-brand-900/20 to-transparent pointer-events-none"></div>
         
         <div className="container mx-auto px-6 relative z-10">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
               <div>
                  <h2 className="text-brand-400 font-bold uppercase tracking-widest text-sm mb-4">Contact Us</h2>
                  <h3 className="text-5xl font-extrabold mb-8 leading-tight">Ready for a <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-white">spotless home?</span></h3>
                  <p className="text-xl text-gray-400 mb-12 font-light">{CONTENT.contact.subtitle[language]}</p>
                  
                  <div className="space-y-8">
                     <a href={`https://wa.me/${PHONE.replace(/[^0-9]/g, '')}`} target="_blank" className="flex items-center gap-8 group p-4 rounded-2xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-700 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                           <Icons.Phone className="w-7 h-7" />
                        </div>
                        <div>
                           <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">Call / WhatsApp</p>
                           <span className="text-3xl font-bold font-mono group-hover:text-brand-300 transition-colors">{PHONE}</span>
                        </div>
                     </a>
                     
                     <a href={`mailto:${CONTACT_EMAIL}`} className="flex items-center gap-8 group p-4 rounded-2xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
                        <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center text-gray-300 group-hover:bg-gray-700 group-hover:text-white transition-all">
                           <Icons.Mail className="w-7 h-7" />
                        </div>
                        <div>
                           <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">Email</p>
                           <span className="text-2xl font-bold group-hover:text-brand-300 transition-colors">{CONTACT_EMAIL}</span>
                        </div>
                     </a>
                     
                     <div className="flex items-center gap-8 group p-4">
                        <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center text-gray-300">
                           <Icons.MapPin className="w-7 h-7" />
                        </div>
                        <div>
                           <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">Location</p>
                           <p className="text-xl font-medium text-gray-200">{ADDRESS}</p>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="glass-card bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[2rem] shadow-2xl relative">
                  <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
                     <Icons.Quote className="w-32 h-32 text-white" />
                  </div>
                  <h4 className="text-3xl font-bold mb-8 text-white">Send a request</h4>
                  <form className="space-y-6" onSubmit={handleSendMessage}>
                     <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">{CONTENT.contact.nameLabel[language]}</label>
                           <input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 focus:ring-2 focus:ring-brand-500 outline-none text-white placeholder-gray-500 transition-all focus:bg-white/10" placeholder="John Doe" required />
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">{CONTENT.contact.emailLabel[language]}</label>
                           <input type="email" className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 focus:ring-2 focus:ring-brand-500 outline-none text-white placeholder-gray-500 transition-all focus:bg-white/10" placeholder="john@example.com" required />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">{CONTENT.contact.messageLabel[language]}</label>
                        <textarea rows={4} className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 focus:ring-2 focus:ring-brand-500 outline-none text-white placeholder-gray-500 resize-none transition-all focus:bg-white/10" placeholder="Tell us about your cleaning needs..." required></textarea>
                     </div>
                     <button className="w-full bg-white text-brand-950 hover:bg-brand-50 font-bold py-5 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all active:scale-[0.98] flex justify-center items-center gap-3">
                        {CONTENT.contact.sendButton[language]}
                        <Icons.Send className="w-5 h-5" />
                     </button>
                  </form>
               </div>
            </div>
         </div>
      </section>

      {/* Stunning Mega Footer */}
      <footer className="bg-gray-950 pt-32 pb-12 text-white relative overflow-hidden border-t border-white/5">
         {/* Giant Background Text */}
         <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full text-center pointer-events-none select-none opacity-[0.03]">
            <span className="text-[20vw] font-black leading-none text-white tracking-widest">SOFASTEAM</span>
         </div>
         
         {/* Gradient Orbs */}
         <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-brand-900/10 rounded-full blur-[120px] pointer-events-none"></div>
         <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[100px] pointer-events-none"></div>

         <div className="container mx-auto px-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 mb-24 items-start">
               {/* Column 1: Brand & Identity */}
               <div className="space-y-6">
                  <div className="flex items-center gap-4 h-8 mb-6">
                     <div className="w-16 h-16 lg:w-20 lg:h-20 -ml-2">
                        <img src={LOGO_URL} className="w-full h-full object-contain" alt="Logo" />
                     </div>
                     <span className="text-2xl font-extrabold tracking-tight pt-2">{APP_NAME}</span>
                  </div>
                  <p className="text-gray-400 text-base leading-snug font-light text-left">
                     Redefining cleanliness with premium technology. <br/>
                     Showroom quality for your living space.
                  </p>
               </div>

               {/* Column 2: Navigation */}
               <div className="pt-2">
                  <h4 className="font-bold text-white mb-6 text-lg flex items-center gap-2 h-8">
                    <span className="w-8 h-[2px] bg-brand-500 inline-block"></span>
                    Company
                  </h4>
                  <ul className="space-y-3">
                     {NAV_ITEMS.map(item => (
                        <li key={item.id}>
                           <a 
                             href={item.href} 
                             onClick={(e) => handleNavClick(e, item.id)} 
                             className="text-gray-400 hover:text-white transition-all block text-base hover:translate-x-1 flex items-center gap-2 group"
                           >
                              <Icons.ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-brand-500" />
                              {item.label[language]}
                           </a>
                        </li>
                     ))}
                  </ul>
               </div>

               {/* Column 3: Follow Us */}
               <div className="pt-2">
                  <h4 className="font-bold text-white mb-6 text-lg flex items-center gap-2 h-8">
                    <span className="w-8 h-[2px] bg-brand-500 inline-block"></span>
                    {CONTENT.footer.followUs[language]}
                  </h4>
                  <a 
                     href={INSTAGRAM_URL} 
                     target="_blank" 
                     className="inline-flex items-center gap-3 text-gray-400 hover:text-white transition-all group p-3 bg-white/5 rounded-xl hover:bg-brand-600 border border-white/10 hover:border-brand-500 w-full"
                  >
                     <Icons.Instagram className="w-6 h-6 group-hover:scale-110 transition-transform" />
                     <span className="font-medium text-sm">@sofasteambucuresti</span>
                  </a>
               </div>

               {/* Column 4: Newsletter & Contact */}
               <div className="pt-2">
                  <h4 className="font-bold text-white mb-6 text-lg flex items-center gap-2 h-8">
                    <span className="w-8 h-[2px] bg-brand-500 inline-block"></span>
                    {CONTENT.footer.newsletter[language]}
                  </h4>
                  <p className="text-gray-400 mb-4 text-sm leading-snug">
                     Join for exclusive seasonal offers <br/> and maintenance tips.
                  </p>
                  <form className="relative group" onSubmit={(e) => e.preventDefault()}>
                     <input 
                       type="email" 
                       placeholder="Enter your email" 
                       className="w-full bg-white/5 border border-white/10 rounded-xl pl-5 pr-12 py-3 text-sm focus:ring-2 focus:ring-brand-500 outline-none text-white placeholder-gray-600 transition-all focus:bg-white/10 focus:border-white/20" 
                     />
                     <button className="absolute right-2 top-1.5 bottom-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg w-10 flex items-center justify-center transition-all shadow-lg hover:shadow-brand-500/25">
                        <Icons.ArrowRight className="w-4 h-4" />
                     </button>
                  </form>
               </div>
            </div>
            
            <div className="border-t border-white/10 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
               <p className="text-gray-500 text-sm font-medium tracking-wide">
                 {CONTENT.footer.rights[language]}
               </p>
               <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-500">
                  <button onClick={() => setLegalModal({ isOpen: true, type: 'privacy' })} className="hover:text-white transition-colors hover:underline decoration-brand-500 decoration-2 underline-offset-4">Privacy Policy</button>
                  <button onClick={() => setLegalModal({ isOpen: true, type: 'terms' })} className="hover:text-white transition-colors hover:underline decoration-brand-500 decoration-2 underline-offset-4">Terms of Service</button>
                  <button onClick={scrollToTop} className="flex items-center gap-2 hover:text-white transition-colors">
                     Back to Top <Icons.ArrowRight className="-rotate-90 w-3 h-3" />
                  </button>
               </div>
            </div>
         </div>
      </footer>

      {/* Floating Chatbot */}
      <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end gap-4">
          {isChatOpen && (
              <div className="w-[380px] h-[600px] bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800 animate-fade-in-up origin-bottom-right ring-1 ring-black/5 flex flex-col">
                  <ChatAssistant language={language} onClose={() => setIsChatOpen(false)} />
              </div>
          )}
          <button 
            onClick={() => setIsChatOpen(!isChatOpen)} 
            className="group bg-brand-600 hover:bg-brand-500 text-white w-16 h-16 rounded-full shadow-2xl shadow-brand-500/30 transition-all hover:scale-110 active:scale-95 flex items-center justify-center relative"
          >
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></span>
              {isChatOpen ? <Icons.X className="w-8 h-8" /> : <Icons.MessageCircle className="w-8 h-8" />}
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
