import { NavItem } from './types';

export const APP_NAME = "SofaSteam";
export const OWNER_NAME = "Med Amine Damdoum";
export const ADDRESS = "Bulevardul Iuliu Maniu 71, Bucharest";
export const PHONE = "+40745275324";
export const CONTACT_EMAIL = "contact@sofasteam.com";
export const INSTAGRAM_URL = "https://www.instagram.com/sofasteambucuresti/";
export const LOGO_URL = "https://drive.google.com/thumbnail?id=1BacA0IQieo9xB9cuIGHNtHGOxtSHYx8A&sz=w1000";
export const HERO_BG_URL = "https://drive.google.com/thumbnail?id=1xxtR5hULJbnG61HBqwMeR3IiI_xdaZMt&sz=w1920";

export const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: { en: 'Home', ro: 'Acasă' }, href: '#home' },
  { id: 'about', label: { en: 'About', ro: 'Despre' }, href: '#about' },
  { id: 'products', label: { en: 'Products', ro: 'Produse' }, href: '#products' },
  { id: 'contact', label: { en: 'Contact', ro: 'Contact' }, href: '#contact' },
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
    google: { en: "Continue with Google", ro: "Continuă cu Google" },
    haveAccount: { en: "Already have an account?", ro: "Ai deja cont?" },
    noAccount: { en: "Don't have an account?", ro: "Nu ai cont?" },
    signInLink: { en: "Sign In", ro: "Conectează-te" },
    signUpLink: { en: "Sign Up", ro: "Înregistrează-te" }
  },
  cart: {
    title: { en: "Your Cart", ro: "Coșul Tău" },
    empty: { en: "Your cart is empty", ro: "Coșul tău este gol" },
    total: { en: "Total", ro: "Total" },
    checkout: { en: "Checkout", ro: "Finalizează Comanda" },
    addSuccess: { en: "added to cart!", ro: "adăugat în coș!" },
    loginRequired: { en: "Please log in to add items to cart.", ro: "Vă rugăm să vă conectați pentru a adăuga produse în coș." },
    items: { en: "items", ro: "produse" }
  },
  profile: {
    title: { en: "My Profile", ro: "Profilul Meu" },
    save: { en: "Save Changes", ro: "Salvează Modificări" },
    phone: { en: "Phone Number", ro: "Număr de Telefon" },
    avatar: { en: "Avatar", ro: "Poză Profil" },
    fullName: { en: "Full Name", ro: "Nume Complet" },
    upload: { en: "Upload Photo", ro: "Încarcă Poză" },
    uploading: { en: "Uploading...", ro: "Se încarcă..." }
  },
  categories: {
    all: { en: "All", ro: "Toate" },
    solutions: { en: "Cleaning Solutions", ro: "Soluții Curățare" },
    equipment: { en: "Machines & Equipment", ro: "Echipamente" },
    accessories: { en: "Accessories", ro: "Accesorii" }
  },
  admin: {
    dashboard: { en: "Admin Dashboard", ro: "Panou Administrator" },
    products: { en: "Products", ro: "Produse" },
    orders: { en: "Orders", ro: "Comenzi" },
    addProduct: { en: "Add Product", ro: "Adaugă Produs" },
    editProduct: { en: "Edit Product", ro: "Editează Produs" },
    deleteProduct: { en: "Delete", ro: "Șterge" },
    confirmDelete: { en: "Are you sure you want to delete this product?", ro: "Sigur doriți să ștergeți acest produs?" },
    save: { en: "Save Product", ro: "Salvează Produs" },
    manage: { en: "Manage Products", ro: "Gestionează Produse" },
    imageUpload: { en: "Product Image", ro: "Imagine Produs" },
    selectImage: { en: "Select Image", ro: "Alege Imagine" }
  }
};