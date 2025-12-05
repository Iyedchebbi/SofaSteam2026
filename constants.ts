import { NavItem } from './types';

export const APP_NAME = "SofaSteam";
export const ADDRESS = "Bulevardul Iuliu Maniu 71, Bucharest";
export const PHONE = "+40745275324";
export const CONTACT_EMAIL = "contact@sofasteam.com";
export const INSTAGRAM_URL = "https://www.instagram.com/sofasteambucuresti/";
export const LOGO_URL = "https://drive.google.com/thumbnail?id=1BacA0IQieo9xB9cuIGHNtHGOxtSHYx8A&sz=w1000";
export const HERO_BG_URL = "https://drive.google.com/thumbnail?id=1xxtR5hULJbnG61HBqwMeR3IiI_xdaZMt&sz=w1920";

export const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: { en: 'Home', ro: 'Acasă' }, href: '#home' },
  { id: 'services', label: { en: 'Services', ro: 'Servicii' }, href: '#services' },
  { id: 'about', label: { en: 'Why Us', ro: 'De Ce Noi' }, href: '#about' },
  { id: 'contact', label: { en: 'Contact', ro: 'Contact' }, href: '#contact' },
];

export const CONTENT = {
  hero: {
    title: { en: "Experience True Cleanliness", ro: "Experimentează Curățenia Adevărată" },
    subtitle: { en: "Premium upholstery and cleaning services for a healthier, luxurious home in Bucharest.", ro: "Servicii premium de curățare a tapițeriei pentru o casă mai sănătoasă și luxoasă în București." },
    cta: { en: "Book a Service", ro: "Rezervă un Serviciu" }
  },
  about: {
    title: { en: "Excellence in Every Detail", ro: "Excelență în Fiecare Detaliu" },
    text: { 
      en: `SofaSteam is Bucharest's premier cleaning service, dedicated to transforming living spaces through advanced technology and expert care.`,
      ro: `SofaSteam este serviciul de curățenie premier din București, dedicat transformării spațiilor de locuit prin tehnologie avansată și îngrijire expertă.`
    },
    qualityText: {
      en: "We don't just clean; we revitalize. Using industrial-grade steam technology and eco-friendly solutions, we eliminate 99.9% of bacteria and allergens while restoring the beauty of your fabrics. Your health and satisfaction are our absolute priorities.",
      ro: "Nu doar curățăm; revitalizăm. Folosind tehnologie cu abur de grad industrial și soluții ecologice, eliminăm 99,9% din bacterii și alergeni, restabilind în același timp frumusețea țesăturilor tale. Sănătatea și satisfacția ta sunt prioritățile noastre absolute."
    },
    steps: [
      {
        icon: 'ClipboardList',
        title: { en: "Select Service", ro: "Alege Serviciul" },
        desc: { en: "Choose from our premium cleaning packages.", ro: "Alege din pachetele noastre premium." }
      },
      {
        icon: 'Clock',
        title: { en: "Schedule", ro: "Programează" },
        desc: { en: "Pick a time that works perfectly for you.", ro: "Alege o oră perfectă pentru tine." }
      },
      {
        icon: 'Sparkles',
        title: { en: "We Revitalize", ro: "Noi Revitalizăm" },
        desc: { en: "Our experts restore your furniture to like-new condition.", ro: "Experții noștri îți restaurează mobilierul." }
      }
    ]
  },
  assistant: {
    title: { en: "AI Cleaning Consultant", ro: "Consultant AI Curățenie" },
    subtitle: { en: "Ask about stains, fabrics, or our process", ro: "Întreabă despre pete, țesături sau procesul nostru" },
    placeholder: { en: "Is steam cleaning safe for velvet?", ro: "Este curățarea cu abur sigură pentru catifea?" },
    disclaimer: { en: "SofaSteam AI Assistant. Verify critical info.", ro: "Asistent AI SofaSteam. Verifică informațiile critice." }
  },
  contact: {
    title: { en: "Get in Touch", ro: "Contactează-ne" },
    subtitle: { en: "Ready to transform your home? Contact us for a personalized quote or appointment.", ro: "Gata să îți transformi casa? Contactează-ne pentru o ofertă personalizată." },
    nameLabel: { en: "Your Name", ro: "Numele Tău" },
    emailLabel: { en: "Email Address", ro: "Adresa de Email" },
    messageLabel: { en: "How can we help?", ro: "Cum te putem ajuta?" },
    sendButton: { en: "Send Request", ro: "Trimite Cerere" },
    successMessage: { en: "Request sent! We will contact you shortly.", ro: "Cerere trimisă! Te vom contacta în curând." }
  },
  footer: {
    quickLinks: { en: "Navigation", ro: "Navigare" },
    followUs: { en: "Connect", ro: "Conectare" },
    contact: { en: "Contact Info", ro: "Info Contact" },
    newsletter: { en: "Stay Updated", ro: "Rămâi Informat" },
    subscribe: { en: "Join", ro: "Alătură-te" },
    rights: { en: "© 2025 SofaSteam. Premium Cleaning Services.", ro: "© 2025 SofaSteam. Servicii Premium de Curățenie." }
  },
  auth: {
    signIn: { en: "Client Access", ro: "Acces Client" },
    signUp: { en: "New Client", ro: "Client Nou" },
    signOut: { en: "Log Out", ro: "Deconectare" },
    welcome: { en: "Hello", ro: "Salut" },
    email: { en: "Email", ro: "Email" },
    password: { en: "Password", ro: "Parolă" },
    name: { en: "Full Name", ro: "Nume Complet" },
    submit: { en: "Continue", ro: "Continuă" },
    cancel: { en: "Cancel", ro: "Anulează" },
    google: { en: "Continue with Google", ro: "Continuă cu Google" },
    haveAccount: { en: "Already a client?", ro: "Ești deja client?" },
    noAccount: { en: "New to SofaSteam?", ro: "Nou la SofaSteam?" },
    signInLink: { en: "Login here", ro: "Intră în cont" },
    signUpLink: { en: "Register now", ro: "Înregistrează-te" }
  },
  cart: {
    title: { en: "Your Booking List", ro: "Lista Ta de Rezervări" },
    empty: { en: "No services selected yet", ro: "Niciun serviciu selectat" },
    total: { en: "Estimated Total", ro: "Total Estimat" },
    checkout: { en: "Request Quote / Book", ro: "Cere Ofertă / Rezervă" },
    addSuccess: { en: "added to list!", ro: "adăugat la listă!" },
    loginRequired: { en: "Please log in to manage your bookings.", ro: "Conectează-te pentru a gestiona rezervările." },
    items: { en: "services", ro: "servicii" }
  },
  profile: {
    title: { en: "Client Profile", ro: "Profil Client" },
    save: { en: "Update Profile", ro: "Actualizare Profil" },
    phone: { en: "Phone Number", ro: "Număr de Telefon" },
    avatar: { en: "Profile Photo", ro: "Poză Profil" },
    fullName: { en: "Full Name", ro: "Nume Complet" },
    upload: { en: "Change Photo", ro: "Schimbă Poza" },
    uploading: { en: "Uploading...", ro: "Se încarcă..." }
  },
  categories: {
    all: { en: "All Services", ro: "Toate Serviciile" },
    upholstery: { en: "Upholstery", ro: "Tapițerie" },
    carpet: { en: "Carpets & Rugs", ro: "Covoare & Mochete" },
    auto: { en: "Auto Detailing", ro: "Detailing Auto" },
    general: { en: "Specialized Cleaning", ro: "Curățare Specializată" },
    // Keeping old keys for backward compatibility if needed, but UI uses above
    solutions: { en: "Solutions", ro: "Soluții" },
    equipment: { en: "Equipment", ro: "Echipamente" },
    accessories: { en: "Accessories", ro: "Accesorii" }
  },
  admin: {
    dashboard: { en: "Service Management", ro: "Management Servicii" },
    products: { en: "Services", ro: "Servicii" },
    orders: { en: "Bookings", ro: "Rezervări" },
    addProduct: { en: "Add New Service", ro: "Adaugă Serviciu Nou" },
    editProduct: { en: "Edit Service", ro: "Editează Serviciu" },
    deleteProduct: { en: "Remove", ro: "Șterge" },
    confirmDelete: { en: "Delete this service offering?", ro: "Ștergeți acest serviciu?" },
    save: { en: "Save Service", ro: "Salvează Serviciu" },
    manage: { en: "Manage Services", ro: "Gestionează Servicii" },
    imageUpload: { en: "Service Image", ro: "Imagine Serviciu" },
    selectImage: { en: "Upload Image", ro: "Încarcă Imagine" }
  }
};