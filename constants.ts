
import { NavItem } from './types';

export const APP_NAME = "SofaSteam";
export const ADDRESS = "Bulevardul Iuliu Maniu 71, Bucharest";
export const PHONE = "+40745275324";
export const CONTACT_EMAIL = "contact@sofasteam.com";
export const INSTAGRAM_URL = "https://www.instagram.com/sofasteambucuresti/";
export const LOGO_URL = "https://drive.google.com/thumbnail?id=1BacA0IQieo9xB9cuIGHNtHGOxtSHYx8A&sz=w1000";
export const HERO_BG_URL = "https://drive.google.com/thumbnail?id=1xxtR5hULJbnG61HBqwMeR3IiI_xdaZMt&sz=w1920";

export const WHY_US_IMAGES = [
  "https://drive.google.com/thumbnail?id=1bStuxBqDd3Y8Ugcgj-_hzL0_ih6QZFub&sz=w1000",
  "https://drive.google.com/thumbnail?id=14VD1-6G5lZYAB4YT-C95UC7tSeIGjArW&sz=w1000",
  "https://drive.google.com/thumbnail?id=1_RqdPTOqJC1sa9xQmBoV7IZdD4HPmfyJ&sz=w1000"
];

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
      en: `See the difference our technology makes. From deep-cleaning car interiors to revitalizing delicate sofas, our results speak for themselves.`,
      ro: `Vezi diferența pe care o face tehnologia noastră. De la curățarea profundă a interioarelor auto până la revitalizarea canapelelor delicate, rezultatele vorbesc de la sine.`
    },
    qualityText: {
      en: "We eliminate 99.9% of bacteria using industrial-grade steam and eco-friendly solutions, restoring the original beauty of your fabrics.",
      ro: "Eliminăm 99,9% din bacterii folosind abur industrial și soluții ecologice, restabilind frumusețea originală a țesăturilor tale."
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
    followUs: { en: "Follow Us", ro: "Urmărește-ne" },
    contact: { en: "Contact Info", ro: "Info Contact" },
    newsletter: { en: "Stay Updated", ro: "Rămâi Informat" },
    subscribe: { en: "Join", ro: "Alătură-te" },
    rights: { en: "© 2025 SofaSteam. All rights reserved.", ro: "© 2025 SofaSteam. Toate drepturile rezervate." }
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
    // Keeping old keys for backward compatibility
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
  },
  guide: {
    welcome: {
        title: { en: "Welcome to SofaSteam!", ro: "Bine ați venit la SofaSteam!" },
        desc: { en: "Let's take a quick tour of our premium features.", ro: "Haideți să facem un tur rapid al funcțiilor noastre premium." },
        btn: { en: "Start Tour", ro: "Începe Turul" },
        skip: { en: "Skip", ro: "Sari" }
    },
    steps: [
        {
            title: { en: "Services", ro: "Servicii" },
            desc: { en: "Filter and browse our diverse range of cleaning services here.", ro: "Filtrează și explorează gama noastră diversă de servicii aici." }
        },
        {
            title: { en: "AI Assistant", ro: "Asistent AI" },
            desc: { en: "Have questions about stains? Ask our AI expert instantly.", ro: "Ai întrebări despre pete? Întreabă expertul nostru AI." }
        },
        {
            title: { en: "Client Access", ro: "Acces Client" },
            desc: { en: "Login here to manage your profile and bookings.", ro: "Conectează-te aici pentru a gestiona profilul și rezervările." }
        }
    ],
    next: { en: "Next", ro: "Următorul" },
    finish: { en: "Finish", ro: "Gata" }
  },
  legal: {
    privacy: {
      title: { en: "Privacy Policy", ro: "Politica de Confidențialitate" },
      content: {
        en: `
          <h3>1. Information We Collect</h3>
          <p>We collect information you provide directly to us when you create an account, request a service, or communicate with us.</p>
          
          <h3>2. How We Use Your Information</h3>
          <p>We use your information to provide, maintain, and improve our services, process transactions, and communicate with you.</p>
          
          <h3>3. Information Sharing</h3>
          <p>We do not share your personal information with third parties except as necessary to provide our services.</p>
        `,
        ro: `
          <h3>1. Informațiile pe care le colectăm</h3>
          <p>Colectăm informațiile pe care ni le furnizați direct atunci când vă creați un cont sau solicitați un serviciu.</p>
          
          <h3>2. Cum utilizăm informațiile dvs.</h3>
          <p>Folosim informațiile dvs. pentru a furniza și îmbunătăți serviciile noastre și pentru a comunica cu dvs.</p>
          
          <h3>3. Partajarea informațiilor</h3>
          <p>Nu partajăm informațiile dvs. personale cu terțe părți, cu excepția cazurilor necesare pentru furnizarea serviciilor.</p>
        `
      }
    },
    terms: {
      title: { en: "Terms of Service", ro: "Termeni și Condiții" },
      content: {
        en: `
          <h3>1. Acceptance of Terms</h3>
          <p>By using our services, you agree to be bound by these Terms.</p>
          
          <h3>2. Services</h3>
          <p>SofaSteam provides professional cleaning services subject to availability.</p>
          
          <h3>3. Booking</h3>
          <p>Final pricing may be adjusted based on on-site inspection.</p>
        `,
        ro: `
          <h3>1. Acceptarea Termenilor</h3>
          <p>Prin utilizarea serviciilor noastre, sunteți de acord să respectați acești Termeni.</p>
          
          <h3>2. Servicii</h3>
          <p>SofaSteam oferă servicii profesionale de curățenie în limita disponibilității.</p>
          
          <h3>3. Rezervare</h3>
          <p>Prețul final poate fi ajustat pe baza inspecției la fața locului.</p>
        `
      }
    }
  }
};
