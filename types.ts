export type Language = 'en' | 'ro';

export type ProductCategory = 'all' | 'solutions' | 'equipment' | 'accessories';

export interface Product {
  id: number;
  name_en: string;
  name_ro: string;
  description_en: string;
  description_ro: string;
  price: number;
  image: string;
  category: string;
}

export interface UserProfile {
  id: string;
  email: string;
  role: 'admin' | 'customer';
  full_name?: string;
  avatar_url?: string;
  phone?: string;
}

export interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  product: Product; // Joined from DB
}

export interface Order {
  id: number;
  created_at: string;
  total_amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  shipping_address: string;
}

export interface NavItem {
  id: string;
  label: Record<Language, string>;
  href: string;
}

export interface GroundingSource {
  web?: {
    uri: string;
    title: string;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  groundingSources?: GroundingSource[];
  isError?: boolean;
}