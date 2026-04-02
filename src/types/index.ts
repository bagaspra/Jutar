export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string; // slug of the category
  image_url?: string;
  description?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  emoji?: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface Order {
  id: string;
  receipt_number: string;
  total_amount: number;
  payment_method_id: string;
  status: string;
  created_at: string;
  order_type: "dine_in" | "take_away";
  table_number?: string | null;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_at_time: number;
  products?: MenuItem;
}

export interface DiningSession {
  id: string;
  table_number: string;
  customer_name: string;
  status: "active" | "paid" | "cancelled";
  created_at: string;
}

export interface RawMaterial {
  id: string;
  name: string;
  unit: string;
  current_stock: number;
  low_stock_threshold: number;
}
