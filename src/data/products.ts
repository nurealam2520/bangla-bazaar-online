export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice: number | null;
  rating: number;
  reviews: number;
  image: string;
  badge: string | null;
  category: "dogs" | "cats";
  subcategory: string;
  description: string;
}

export const products: Product[] = [
  // Dogs
  {
    id: 1,
    name: "Premium Dog Food — Chicken & Rice",
    price: 34.99,
    originalPrice: 42.99,
    rating: 4.8,
    reviews: 124,
    image: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400&h=400&fit=crop",
    badge: "Best Seller",
    category: "dogs",
    subcategory: "Food",
    description: "High-quality chicken and rice formula for adult dogs. Rich in protein and essential nutrients.",
  },
  {
    id: 2,
    name: "Leather Dog Collar — Gold Buckle",
    price: 24.99,
    originalPrice: null,
    rating: 4.9,
    reviews: 89,
    image: "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?w=400&h=400&fit=crop",
    badge: "New",
    category: "dogs",
    subcategory: "Accessories",
    description: "Handcrafted genuine leather collar with premium gold-tone buckle. Adjustable and durable.",
  },
  {
    id: 3,
    name: "Dog Bed — Memory Foam Orthopedic",
    price: 89.99,
    originalPrice: 109.99,
    rating: 4.9,
    reviews: 142,
    image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=400&fit=crop",
    badge: "Best Seller",
    category: "dogs",
    subcategory: "Beds",
    description: "Orthopedic memory foam dog bed for ultimate comfort. Machine washable cover.",
  },
  {
    id: 4,
    name: "Interactive Dog Ball Launcher",
    price: 44.99,
    originalPrice: 54.99,
    rating: 4.6,
    reviews: 67,
    image: "https://images.unsplash.com/photo-1535930749574-1399327ce78f?w=400&h=400&fit=crop",
    badge: "Sale",
    category: "dogs",
    subcategory: "Toys",
    description: "Automatic ball launcher for endless fetch fun. Adjustable distance settings.",
  },
  {
    id: 5,
    name: "Dog Grooming Kit — Complete Set",
    price: 39.99,
    originalPrice: null,
    rating: 4.7,
    reviews: 93,
    image: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=400&h=400&fit=crop",
    badge: null,
    category: "dogs",
    subcategory: "Grooming",
    description: "Professional grooming kit with brushes, nail clippers, and shampoo. Perfect for home grooming.",
  },
  {
    id: 6,
    name: "Retractable Dog Leash — Heavy Duty",
    price: 19.99,
    originalPrice: 27.99,
    rating: 4.5,
    reviews: 156,
    image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop",
    badge: "Popular",
    category: "dogs",
    subcategory: "Accessories",
    description: "16ft retractable leash with ergonomic handle. Suitable for dogs up to 110 lbs.",
  },
  // Cats
  {
    id: 7,
    name: "Cat Scratching Post — Deluxe Tower",
    price: 59.99,
    originalPrice: 74.99,
    rating: 4.7,
    reviews: 56,
    image: "https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=400&h=400&fit=crop",
    badge: "Sale",
    category: "cats",
    subcategory: "Furniture",
    description: "Multi-level cat tower with sisal scratching posts, plush platforms, and dangling toys.",
  },
  {
    id: 8,
    name: "Interactive Cat Feather Toy Set",
    price: 14.99,
    originalPrice: null,
    rating: 4.6,
    reviews: 78,
    image: "https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=400&h=400&fit=crop",
    badge: null,
    category: "cats",
    subcategory: "Toys",
    description: "Set of 5 feather wand toys with interchangeable attachments. Hours of fun for your cat.",
  },
  {
    id: 9,
    name: "Premium Cat Food — Salmon & Tuna",
    price: 29.99,
    originalPrice: 36.99,
    rating: 4.8,
    reviews: 97,
    image: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=400&fit=crop",
    badge: "Popular",
    category: "cats",
    subcategory: "Food",
    description: "Grain-free salmon and tuna formula with real fish as the first ingredient.",
  },
  {
    id: 10,
    name: "Self-Cleaning Cat Litter Box",
    price: 149.99,
    originalPrice: 189.99,
    rating: 4.5,
    reviews: 203,
    image: "https://images.unsplash.com/photo-1511044568932-338cba0ad803?w=400&h=400&fit=crop",
    badge: "Best Seller",
    category: "cats",
    subcategory: "Litter",
    description: "Automatic self-cleaning litter box with odor control. Quiet operation, easy to maintain.",
  },
  {
    id: 11,
    name: "Cozy Cat Bed — Donut Shape",
    price: 34.99,
    originalPrice: null,
    rating: 4.8,
    reviews: 112,
    image: "https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=400&h=400&fit=crop",
    badge: "New",
    category: "cats",
    subcategory: "Beds",
    description: "Ultra-soft donut-shaped cat bed with raised edges for security. Machine washable.",
  },
  {
    id: 12,
    name: "Cat Grooming Brush — Self-Cleaning",
    price: 12.99,
    originalPrice: 16.99,
    rating: 4.7,
    reviews: 88,
    image: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=400&h=400&fit=crop",
    badge: null,
    category: "cats",
    subcategory: "Grooming",
    description: "One-click self-cleaning slicker brush. Removes loose fur and reduces shedding by 90%.",
  },
];

export const dogProducts = products.filter((p) => p.category === "dogs");
export const catProducts = products.filter((p) => p.category === "cats");

export const dogSubcategories = [...new Set(dogProducts.map((p) => p.subcategory))];
export const catSubcategories = [...new Set(catProducts.map((p) => p.subcategory))];
