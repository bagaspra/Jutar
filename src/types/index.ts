export interface MenuItem {
  id: string;
  name: string;
  price: number;
  emoji: string;
  category: string; // slug of the category
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
