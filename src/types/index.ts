export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string; // slug of the category
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
}
