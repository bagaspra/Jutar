export interface MenuItem {
  id: string;
  name: string;
  price: number;
  emoji: string;
  category: MenuCategory;
}

export type MenuCategory = "burgers" | "sides" | "drinks" | "desserts";

export interface CartItem extends MenuItem {
  quantity: number;
}

export const MENU_CATEGORIES: { value: MenuCategory; label: string; emoji: string }[] = [
  { value: "burgers", label: "Burgers", emoji: "🍔" },
  { value: "sides", label: "Sides", emoji: "🍟" },
  { value: "drinks", label: "Drinks", emoji: "🥤" },
  { value: "desserts", label: "Desserts", emoji: "🍦" },
];
