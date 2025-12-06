
export type Language = 'en' | 'ro';

export type ProductCategory = 'all' | 'upholstery' | 'carpet' | 'auto' | 'general';

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
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address: string;
  scheduled_date?: string;
  client_name?: string;
  client_phone?: string;
  order_items?: {
    id: number;
    quantity: number;
    product: Product;
    price_at_purchase: number;
  }[];
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
