export interface Category {
  id: string;
  label: string;
  img: string;
}

export interface Order {
  id: string;
  customerInfo: {
    name: string;
    phone: string;
    address: string;
    city: string;
    email?: string;
  };
  items: any[];
  subtotal: number;
  shipping: number;
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: any;
}

export interface Product {
  id: string;
  name: string;
  originalPrice: number;
  salePrice: number;
  description: string;
  customFieldLabel: string;
  customFieldPlaceholder: string;
  image: string;
  gallery?: string[];
  thumbnail1_url?: string;
  thumbnail2_url?: string;
  category?: string;
}

export interface CartItem {
  cartId: string; // unique for this specific customization
  product: Product;
  customization: string;
  quantity: number;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  imageUrl: string;
}
