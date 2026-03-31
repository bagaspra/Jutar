export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string; // slug of the category
  emoji?: string;   // Optional fallback, will be mapped from category
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  emoji: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
}
