import { MenuItem } from "@/types";

export const MENU_ITEMS: MenuItem[] = [
  // Burgers
  { id: "20000000-0000-0000-0000-000000000001", name: "Classic Cheeseburger", price: 5.99, emoji: "🍔", category: "burgers" },
  { id: "20000000-0000-0000-0000-000000000002", name: "Spicy Chicken Burger", price: 6.99, emoji: "🍗", category: "burgers" },
  { id: "20000000-0000-0000-0000-000000000003", name: "Bacon Deluxe", price: 7.99, emoji: "🥓", category: "burgers" },

  // Sides
  { id: "20000000-0000-0000-0000-000000000004", name: "French Fries (L)", price: 3.99, emoji: "🍟", category: "sides" },

  // Drinks
  { id: "20000000-0000-0000-0000-000000000005", name: "Cola (M)", price: 1.99, emoji: "🥤", category: "drinks" },

  // Desserts
  { id: "20000000-0000-0000-0000-000000000006", name: "Soft Serve Cone", price: 1.49, emoji: "🍦", category: "desserts" },
];
