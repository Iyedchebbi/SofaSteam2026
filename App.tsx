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
  const [scrolled, setScrolled] = useState(false);

  // Theme & Scroll effect
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
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
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
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
    <div className="min-h-screen flex flex-col font-sans text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-950 overflow-x-hidden">
      
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass-nav shadow-lg py-3' : 'bg-transparent py-6'}`}>
        <div className="container mx-auto px-6 flex items-center justify-between">
          
          {/* Logo */}
          <a href="#home" onClick={(e) => handleNavClick(e, 'home')} className="flex items-center gap-3 group">
            <div className="w-12 h-12 overflow-hidden rounded-xl shadow-2xl ring-2 ring-white/20 group-hover:ring-brand-500 transition-all duration-500">
              <img src={LOGO_URL} alt={APP_NAME} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform" />
            </div>
            <span className={`text-2xl font-extrabold tracking-tight ${scrolled ? 'text-gray-900 dark:text-white' : 'text-white'}`}>
              {APP_NAME}
            </span>
          </a>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-8 bg-white/10 backdrop-blur-md px-8 py-3 rounded-full border border-white/10 shadow-xl">
             {NAV_ITEMS.map(item => (
                <a 
                  key={item.id} 
                  href={item.href} 
                  onClick={(e) => handleNavClick(e, item.id)}
                  className={`text-sm font-semibold tracking-wide transition-colors relative group ${scrolled ? 'text-gray-700 dark:text-gray-300 hover:text-brand-500' : 'text-white/90 hover:text-white'}`}
                >
                  {item.label[language]}
                  <span className="absolute -bottom-1 left-1/2 w-0 h-0.5 bg-brand-500 group-hover:w-full group-hover:left-0 transition-all duration-300"></span>
                </a>
             ))}
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-4">
            <button onClick={toggleLanguage} className={`font-bold text-xs uppercase px-3 py-1.5 rounded-lg transition-all ${scrolled ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white' : 'bg-white/20 text-white hover:bg-white/30'}`}>
              {language}
            </button>
            <button onClick={toggleTheme} className={`p-2 rounded-full transition-all ${scrolled ? 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800' : 'text-white hover:bg-white/20'}`}>
              {theme === 'light' ? <Icons.Moon size={20} /> : <Icons.Sun size={20} />}
            </button>
            
            {user ? (
              <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-700">
                  <button onClick={() => setIsCartOpen(true)} className="relative group">
                     <div className={`p-2.5 rounded-full transition-all ${scrolled ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600' : 'bg-white text-brand-600'}`}>
                        <Icons.ClipboardList size={20} />
                     </div>
                     {cartItems.length > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full shadow-lg">{cartItems.reduce((acc, item) => acc + item.quantity, 0)}</span>}
                  </button>
                  <button onClick={() => setIsProfileOpen(true)} className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/50 shadow-lg hover:border-brand-500 transition-all">
                      {userProfile?.avatar_url ? (
                        <img src={userProfile.avatar_url} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-brand-600 flex items-center justify-center text-white font-bold">{user.email[0].toUpperCase()}</div>
                      )}
                  </button>
              </div>
            ) : (
              <button onClick={() => setAuthModal({ isOpen: true, type: 'signin' })} className="bg-brand-600 hover:bg-brand-500 text-white px-6 py-2.5 rounded-full font-bold shadow-lg shadow-brand-500/30 transition-all hover:translate-y-0.5 active:translate-y-0 text-sm">
                 {CONTENT.auth.signIn[language]}
              </button>
            )}
          </div>
          
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={`lg:hidden p-2 ${scrolled ? 'text-gray-900 dark:text-white' : 'text-white'}`}>
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
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/30"></div>
            <div className="absolute inset-0 bg-brand-900/20 mix-blend-overlay"></div>
         </div>

         <div className="container mx-auto px-6 relative z-10 pt-20 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm font-medium mb-6 animate-fade-in-up">
               <Icons.Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
               <span>#1 Premium Cleaning Service in Bucharest</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-white tracking-tight mb-8 leading-[1.1] drop-shadow-2xl animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              {language === 'en' ? 'Revive Your' : 'Revitalizează'} <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-white to-brand-300">
                {language === 'en' ? 'Living Space' : 'Spațiul Tău'}
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-200 max-w-2xl mx-auto mb-12 leading-relaxed font-light animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              {CONTENT.hero.subtitle[language]}
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
               <a href="#services" onClick={(e) => handleNavClick(e, 'services')} className="group relative px-8 py-4 bg-white text-brand-900 font-bold text-lg rounded-full overflow-hidden transition-all hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.5)]">
                  <span className="relative z-10 flex items-center gap-2">
                    {CONTENT.hero.cta[language]} <Icons.ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-brand-50 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
               </a>
               <button onClick={() => setIsChatOpen(true)} className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold text-lg rounded-full hover:bg-white/20 transition-all flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                  {CONTENT.assistant.title[language]}
               </button>
            </div>
         </div>

         {/* Trust Bar */}
         <div className="absolute bottom-0 left-0 right-0 bg-white/5 backdrop-blur-lg border-t border-white/10 py-6 hidden md:block">
            <div className="container mx-auto px-6 flex justify-between items-center text-white/80">
               <div className="flex items-center gap-3">
                  <Icons.ShieldCheck className="w-8 h-8 text-brand-400" />
                  <div className="text-left">
                     <p className="font-bold text-white text-sm">100% Satisfaction</p>
                     <p className="text-xs">Or free re-cleaning</p>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  <Icons.User className="w-8 h-8 text-brand-400" />
                  <div className="text-left">
                     <p className="font-bold text-white text-sm">500+ Clients</p>
                     <p className="text-xs">Trusted in Bucharest</p>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  <Icons.Clock className="w-8 h-8 text-brand-400" />
                  <div className="text-left">
                     <p className="font-bold text-white text-sm">Fast Booking</p>
                     <p className="text-xs">24/48h Turnaround</p>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Services Grid (Formerly Products) */}
      <section id="services" className="py-24 bg-gray-50 dark:bg-gray-900 relative">
         <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
               <h2 className="text-brand-600 dark:text-brand-400 font-bold uppercase tracking-widest text-sm mb-3">Our Expertise</h2>
               <h3 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">Premium Services</h3>
               <p className="text-gray-600 dark:text-gray-400 text-lg">Select a service to request a personalized quote. We bring industrial-grade cleaning directly to your location.</p>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap justify-center gap-3 mb-16">
               {categories.map(cat => (
                  <button 
                    key={cat} 
                    onClick={() => setActiveCategory(cat)}
                    className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${activeCategory === cat ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/25 scale-105' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  >
                    {CONTENT.categories[cat][language]}
                  </button>
               ))}
            </div>

            {/* Service Cards */}
            {loadingProducts ? (
               <div className="flex justify-center py-20"><div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div></div>
            ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredProducts.map((product) => (
                     <div key={product.id} className="group bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-gray-700/50 hover:-translate-y-2">
                        <div className="relative h-72 overflow-hidden">
                           <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                           <img src={product.image} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" alt={product.name_en} />
                           <div className="absolute bottom-4 left-4 z-20">
                              <span className="bg-brand-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide mb-2 inline-block">
                                 {CONTENT.categories[product.category as ProductCategory]?.[language] || product.category}
                              </span>
                              <h4 className="text-white font-bold text-xl">{language === 'en' ? product.name_en : product.name_ro}</h4>
                           </div>
                        </div>
                        <div className="p-6">
                           <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm leading-relaxed line-clamp-3">
                              {language === 'en' ? product.description_en : product.description_ro}
                           </p>
                           <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                              <div>
                                 <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Starting from</p>
                                 <p className="text-xl font-bold text-brand-600">{product.price} RON</p>
                              </div>
                              <button onClick={() => handleAddToCart(product)} className="w-12 h-12 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 flex items-center justify-center hover:scale-110 transition-transform shadow-lg">
                                 <Icons.Plus className="w-6 h-6" />
                              </button>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            )}
         </div>
      </section>

      {/* Process / About Section */}
      <section id="about" className="py-24 bg-white dark:bg-gray-950 overflow-hidden">
         <div className="container mx-auto px-6">
            <div className="flex flex-col lg:flex-row gap-16 items-center">
               <div className="lg:w-1/2 relative">
                  <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-gray-800">
                     <img src="https://images.unsplash.com/photo-1581578731117-10d52143b1e8?q=80&w=2070" alt="Process" className="w-full object-cover" />
                     {/* Floating Badge */}
                     <div className="absolute bottom-8 right-8 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl max-w-xs animate-float">
                        <div className="flex gap-4">
                           <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center shrink-0">
                              <Icons.CheckCircle className="w-6 h-6" />
                           </div>
                           <div>
                              <p className="font-bold text-gray-900 dark:text-white">Eco-Friendly</p>
                              <p className="text-xs text-gray-500 mt-1">Safe for kids & pets. Non-toxic solutions.</p>
                           </div>
                        </div>
                     </div>
                  </div>
                  {/* Decorative Elements */}
                  <div className="absolute -top-10 -left-10 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl"></div>
                  <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
               </div>

               <div className="lg:w-1/2">
                  <h2 className="text-brand-600 font-bold uppercase tracking-widest text-sm mb-3">Why Choose SofaSteam</h2>
                  <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">{CONTENT.about.title[language]}</h3>
                  <div className="space-y-6 text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-10">
                     <p>{CONTENT.about.text[language]}</p>
                     <p className="font-medium text-gray-800 dark:text-gray-200">{CONTENT.about.qualityText[language]}</p>
                  </div>

                  <div className="grid gap-6">
                     {CONTENT.about.steps.map((step, idx) => {
                        const Icon = Icons[step.icon as keyof typeof Icons] || Icons.Star;
                        return (
                           <div key={idx} className="flex gap-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors cursor-default group">
                              <div className="w-14 h-14 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                 <Icon className="w-7 h-7" />
                              </div>
                              <div>
                                 <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-1">{step.title[language]}</h4>
                                 <p className="text-sm text-gray-500 dark:text-gray-400">{step.desc[language]}</p>
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
      <section id="contact" className="py-24 bg-gray-900 relative overflow-hidden text-white">
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
         <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-brand-900/50 to-transparent"></div>
         
         <div className="container mx-auto px-6 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16">
               <div>
                  <h2 className="text-brand-400 font-bold uppercase tracking-widest text-sm mb-3">Contact Us</h2>
                  <h3 className="text-4xl md:text-5xl font-bold mb-6">Ready for a spotless home?</h3>
                  <p className="text-xl text-gray-300 mb-10">{CONTENT.contact.subtitle[language]}</p>
                  
                  <div className="space-y-8">
                     <div className="flex items-center gap-6 group">
                        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-400 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                           <Icons.Phone className="w-8 h-8" />
                        </div>
                        <div>
                           <p className="text-sm text-gray-400 uppercase tracking-wide font-bold">Call / WhatsApp</p>
                           <a href={`https://wa.me/${PHONE.replace(/[^0-9]/g, '')}`} className="text-2xl font-bold hover:text-brand-400 transition-colors">{PHONE}</a>
                        </div>
                     </div>
                     
                     <div className="flex items-center gap-6 group">
                        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-400 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                           <Icons.Mail className="w-8 h-8" />
                        </div>
                        <div>
                           <p className="text-sm text-gray-400 uppercase tracking-wide font-bold">Email</p>
                           <a href={`mailto:${CONTACT_EMAIL}`} className="text-2xl font-bold hover:text-brand-400 transition-colors">{CONTACT_EMAIL}</a>
                        </div>
                     </div>
                     
                     <div className="flex items-center gap-6 group">
                        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-400 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                           <Icons.MapPin className="w-8 h-8" />
                        </div>
                        <div>
                           <p className="text-sm text-gray-400 uppercase tracking-wide font-bold">Location</p>
                           <p className="text-xl font-medium">{ADDRESS}</p>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="bg-white text-gray-900 rounded-3xl p-8 lg:p-10 shadow-2xl">
                  <h4 className="text-2xl font-bold mb-6">Send us a message</h4>
                  <form className="space-y-5" onSubmit={handleSendMessage}>
                     <div className="grid grid-cols-2 gap-5">
                        <div>
                           <label className="block text-sm font-bold text-gray-600 mb-2">{CONTENT.contact.nameLabel[language]}</label>
                           <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-500 outline-none" placeholder="John Doe" required />
                        </div>
                        <div>
                           <label className="block text-sm font-bold text-gray-600 mb-2">{CONTENT.contact.emailLabel[language]}</label>
                           <input type="email" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-500 outline-none" placeholder="john@example.com" required />
                        </div>
                     </div>
                     <div>
                        <label className="block text-sm font-bold text-gray-600 mb-2">{CONTENT.contact.messageLabel[language]}</label>
                        <textarea rows={4} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-500 outline-none resize-none" placeholder="Tell us about your cleaning needs..." required></textarea>
                     </div>
                     <button className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all active:scale-95">
                        {CONTENT.contact.sendButton[language]}
                     </button>
                  </form>
               </div>
            </div>
         </div>
      </section>

      {/* Mega Footer */}
      <footer className="bg-white dark:bg-gray-950 pt-20 pb-10 border-t border-gray-200 dark:border-gray-800">
         <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
               <div className="col-span-1 lg:col-span-1">
                  <div className="flex items-center gap-3 mb-6">
                     <img src={LOGO_URL} className="w-10 h-10 rounded-lg" alt="Logo" />
                     <span className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">{APP_NAME}</span>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                     Redefining cleanliness in Bucharest with premium technology and eco-friendly solutions. Experience the difference today.
                  </p>
                  <div className="flex gap-4">
                     <a href={INSTAGRAM_URL} target="_blank" className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-brand-500 hover:text-white transition-all">
                        <Icons.Instagram className="w-5 h-5" />
                     </a>
                     <a href="#" className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-brand-500 hover:text-white transition-all">
                        <Icons.Mail className="w-5 h-5" />
                     </a>
                  </div>
               </div>

               <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-6 text-lg">{CONTENT.footer.quickLinks[language]}</h4>
                  <ul className="space-y-4 text-gray-500 dark:text-gray-400">
                     {NAV_ITEMS.map(item => (
                        <li key={item.id}>
                           <a href={item.href} onClick={(e) => handleNavClick(e, item.id)} className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors flex items-center gap-2 group">
                              <span className="w-1.5 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full group-hover:bg-brand-500 transition-colors"></span>
                              {item.label[language]}
                           </a>
                        </li>
                     ))}
                  </ul>
               </div>

               <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-6 text-lg">Our Services</h4>
                  <ul className="space-y-4 text-gray-500 dark:text-gray-400">
                     <li className="hover:text-brand-600 dark:hover:text-brand-400 cursor-pointer">Deep Upholstery Cleaning</li>
                     <li className="hover:text-brand-600 dark:hover:text-brand-400 cursor-pointer">Carpet Revitalization</li>
                     <li className="hover:text-brand-600 dark:hover:text-brand-400 cursor-pointer">Mattress Sanitization</li>
                     <li className="hover:text-brand-600 dark:hover:text-brand-400 cursor-pointer">Commercial Spaces</li>
                  </ul>
               </div>

               <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-6 text-lg">{CONTENT.footer.newsletter[language]}</h4>
                  <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">Subscribe to get seasonal offers and cleaning tips.</p>
                  <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
                     <input type="email" placeholder="Email" className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 outline-none" />
                     <button className="bg-brand-600 hover:bg-brand-700 text-white rounded-lg px-4 transition-colors">
                        <Icons.ArrowRight className="w-5 h-5" />
                     </button>
                  </form>
               </div>
            </div>
            
            <div className="border-t border-gray-100 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
               <p className="text-gray-400 text-sm font-medium text-center md:text-left">{CONTENT.footer.rights[language]}</p>
               <div className="flex gap-6 text-sm text-gray-400">
                  <a href="#" className="hover:text-brand-500 transition-colors">Privacy Policy</a>
                  <a href="#" className="hover:text-brand-500 transition-colors">Terms of Service</a>
               </div>
            </div>
         </div>
      </footer>

      {/* Floating Chatbot */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
          {isChatOpen && (
              <div className="w-[360px] h-[550px] bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800 animate-fade-in-up origin-bottom-right ring-1 ring-black/5">
                  <ChatAssistant language={language} onClose={() => setIsChatOpen(false)} />
              </div>
          )}
          <button 
            onClick={() => setIsChatOpen(!isChatOpen)} 
            className="group bg-brand-600 hover:bg-brand-500 text-white p-4 rounded-full shadow-2xl hover:shadow-brand-500/40 transition-all hover:scale-110 active:scale-95 flex items-center justify-center relative"
          >
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white dark:border-gray-900"></span>
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

export default App;