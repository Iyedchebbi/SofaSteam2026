export type Language = 'en' | 'ro';

export type ProductCategory = 'all' | 'solutions' | 'equipment' | 'accessories';

export interface Product {
  id: number;
  name: Record<Language, string>;
  description: Record<Language, string>;
  price: number;
  image: string;
  category: Exclude<ProductCategory, 'all'>;
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