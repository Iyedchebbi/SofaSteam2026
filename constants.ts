import { NavItem, Product } from './types';

export const APP_NAME = "SofaSteam";
export const OWNER_NAME = "Med Amine Damdoum";
export const ADDRESS = "Bulevardul Iuliu Maniu 71, Bucharest";
export const PHONE = "+40745275324";
export const CONTACT_EMAIL = "contact@sofasteam.com";
export const INSTAGRAM_URL = "https://www.instagram.com/sofasteambucuresti/";
// Using a reliable Google Drive thumbnail link hack for better uptime
export const LOGO_URL = "https://drive.google.com/thumbnail?id=1BacA0IQieo9xB9cuIGHNtHGOxtSHYx8A&sz=w1000";
export const HERO_BG_URL = "https://drive.google.com/thumbnail?id=1xxtR5hULJbnG61HBqwMeR3IiI_xdaZMt&sz=w1920";

export const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: { en: 'Home', ro: 'Acasă' }, href: '#home' },
  { id: 'about', label: { en: 'About', ro: 'Despre' }, href: '#about' },
  { id: 'products', label: { en: 'Products', ro: 'Produse' }, href: '#products' },
  { id: 'contact', label: { en: 'Contact', ro: 'Contact' }, href: '#contact' },
];

export const PRODUCTS: Product[] = [
  {
    id: 1,
    name: { en: "Upholstery Cleaner Pro", ro: "Curățător Tapițerie Pro" },
    description: { en: "Professional grade stain remover for sofas.", ro: "Soluție profesională pentru îndepărtarea petelor de pe canapele." },
    price: 120,
    image: "https://picsum.photos/400/300?random=1",
    category: "solutions"
  },
  {
    id: 2,
    name: { en: "Steam Master 3000", ro: "Steam Master 3000" },
    description: { en: "High pressure steam cleaner for deep cleaning.", ro: "Curățător cu abur de înaltă presiune pentru curățare profundă." },
    price: 850,
    image: "https://picsum.photos/400/300?random=2",
    category: "equipment"
  },
  {
    id: 3,
    name: { en: "Fabric Fresh Spray", ro: "Spray Prospețime Țesături" },
    description: { en: "Keeps your furniture smelling like new.", ro: "Păstrează mirosul proaspăt al mobilierului tău." },
    price: 45,
    image: "https://picsum.photos/400/300?random=3",
    category: "solutions"
  },
  {
    id: 4,
    name: { en: "Leather Care Kit", ro: "Kit Îngrijire Piele" },
    description: { en: "Restore and protect your leather furniture.", ro: "Restaurează și protejează mobilierul din piele." },
    price: 150,
    image: "https://picsum.photos/400/300?random=4",
    category: "accessories"
  },
  {
    id: 5,
    name: { en: "Detailing Brush Set", ro: "Set Perii Detailing" },
    description: { en: "Perfect for tight corners and seams.", ro: "Perfect pentru colțuri înguste și cusături." },
    price: 65,
    image: "https://picsum.photos/400/300?random=5",
    category: "accessories"
  },
  {
    id: 6,
    name: { en: "Industrial Vacuum", ro: "Aspirator Industrial" },
    description: { en: "Heavy duty vacuum for wet and dry mess.", ro: "Aspirator puternic pentru murdărie umedă și uscată." },
    price: 1200,
    image: "https://picsum.photos/400/300?random=6",
    category: "equipment"
  }
];

export const CONTENT = {
  hero: {
    title: { en: "Revitalize Your Home", ro: "Revitalizează-ți Casa" },
    subtitle: { en: "Professional cleaning solutions right at your doorstep in Bucharest.", ro: "Soluții profesionale de curățenie chiar la ușa ta în București." },
    cta: { en: "Shop Now", ro: "Cumpără Acum" }
  },
  about: {
    title: { en: "About Us", ro: "Despre Noi" },
    text: { 
      en: `Founded by ${OWNER_NAME} in the heart of Bucharest, SofaSteam is dedicated to bringing professional cleanliness to every Romanian home.`,
      ro: `Fondată de ${OWNER_NAME} în inima Bucureștiului, SofaSteam este dedicată aducerii curățeniei profesionale în fiecare casă din România.`
    },
    qualityText: {
      en: "We provide premium cleaning solutions that rejuvenate fabrics and remove tough stains while preserving texture. Our eco-friendly, expert-approved products ensure a fresh, hygienic home environment for your family without compromising on safety or quality.",
      ro: "Oferim soluții premium de curățare care revigorează țesăturile și elimină petele dificile, păstrând textura intactă. Produsele noastre ecologice, aprobate de experți, asigură un mediu curat și igienic pentru familia ta, fără a compromite siguranța sau calitatea."
    },
    steps: [
      {
        icon: 'ClipboardList',
        title: { en: "Order Online", ro: "Comandă Online" },
        desc: { en: "Select your favorite products.", ro: "Alege produsele preferate." }
      },
      {
        icon: 'Package',
        title: { en: "Fast Processing", ro: "Procesare Rapidă" },
        desc: { en: "We pack your order with care.", ro: "Împachetăm comanda cu grijă." }
      },
      {
        icon: 'Truck',
        title: { en: "Quick Delivery", ro: "Livrare Rapidă" },
        desc: { en: "Direct to your door in 24-48h.", ro: "La ușa ta în 24-48h." }
      }
    ]
  },
  assistant: {
    title: { en: "Ask Our Cleaning Expert", ro: "Întreabă Expertul Nostru" },
    subtitle: { en: "Powered by AI & Google Search", ro: "Alimentat de AI și Google Search" },
    placeholder: { en: "How do I remove wine stains?", ro: "Cum scot petele de vin?" },
    disclaimer: { en: "AI can make mistakes. Please verify important information.", ro: "AI-ul poate face greșeli. Vă rugăm să verificați informațiile importante." }
  },
  contact: {
    title: { en: "Contact Us", ro: "Contactează-ne" },
    subtitle: { en: "Get in touch for appointments, orders, or inquiries.", ro: "Contactează-ne pentru programări, comenzi sau întrebări." },
    nameLabel: { en: "Your Name", ro: "Numele Tău" },
    emailLabel: { en: "Email Address", ro: "Adresa de Email" },
    messageLabel: { en: "Message", ro: "Mesaj" },
    sendButton: { en: "Send Message", ro: "Trimite Mesaj" },
    successMessage: { en: "Message sent successfully!", ro: "Mesajul a fost trimis cu succes!" }
  },
  footer: {
    quickLinks: { en: "Quick Links", ro: "Link-uri Rapide" },
    followUs: { en: "Follow Us", ro: "Urmărește-ne" },
    contact: { en: "Contact", ro: "Contact" },
    newsletter: { en: "Newsletter", ro: "Buletin Informativ" },
    subscribe: { en: "Subscribe", ro: "Abonare" },
    rights: { en: "© 2025 SofaSteam. All rights reserved.", ro: "© 2025 SofaSteam. Toate drepturile rezervate." }
  },
  auth: {
    signIn: { en: "Sign In", ro: "Conectare" },
    signUp: { en: "Sign Up", ro: "Înregistrare" },
    signOut: { en: "Sign Out", ro: "Deconectare" },
    welcome: { en: "Welcome", ro: "Bun venit" },
    email: { en: "Email Address", ro: "Adresă de Email" },
    password: { en: "Password", ro: "Parolă" },
    name: { en: "Full Name", ro: "Nume Complet" },
    submit: { en: "Submit", ro: "Trimite" },
    cancel: { en: "Cancel", ro: "Anulează" },
    google: { en: "Continue with Google", ro: "Continuă cu Google" }
  },
  cart: {
    addSuccess: { en: "added to cart!", ro: "adăugat în coș!" },
    loginRequired: { en: "Please log in to add items to cart.", ro: "Vă rugăm să vă conectați pentru a adăuga produse în coș." }
  },
  categories: {
    all: { en: "All", ro: "Toate" },
    solutions: { en: "Cleaning Solutions", ro: "Soluții Curățare" },
    equipment: { en: "Machines & Equipment", ro: "Echipamente" },
    accessories: { en: "Accessories", ro: "Accesorii" }
  }
};