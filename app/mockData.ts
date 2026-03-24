export type RestaurantReview = {
  id: string;
  author: string;
  rating: number;
  date: string;
  text: string;
};

export type Restaurant = {
  id: string;
  name: string;
  cuisine: string;
  rating: string;
  reviewCount: number;
  eta: string;
  price: string;
  badge: string;
  image: number;
  distance: string;
  description: string;
  dietaryTags: string[];
  popularDishes: string[];
  reviews: RestaurantReview[];
};

export type CuisineTag = {
  id: string;
  label: string;
};

export type SearchSuggestion = {
  id: string;
  label: string;
  type: "dish" | "restaurant" | "cuisine";
};

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: string;
  popular?: boolean;
};

export type OrderStatus = {
  id: string;
  title: string;
  detail: string;
};

export type OrderHistoryEntry = {
  id: string;
  restaurant: string;
  status: "Delivered" | "Cancelled";
  date: string;
  total: string;
  items: string[];
  accent: string;
};

export type FavoriteSpot = {
  id: string;
  restaurantId: string;
  note: string;
  orderHint: string;
};

export type ProfileShortcut = {
  id: string;
  label: string;
  detail: string;
  icon: "map-pin" | "clock" | "gift" | "settings";
};

export type HelpTopic = {
  id: string;
  title: string;
  detail: string;
  icon: "help-circle" | "truck" | "credit-card" | "gift";
};

export type AdminOrder = {
  id: string;
  customer: string;
  restaurantId: string;
  restaurant: string;
  total: string;
  status: "Pending" | "Preparing" | "Ready for Driver" | "Out for Delivery" | "Completed";
  placedAt: string;
  eta: string;
  driver: string;
  issue: string | null;
};

export type AdminRestaurant = {
  id: string;
  name: string;
  cuisine: string;
  status: "Live" | "Needs Approval" | "Busy";
  avgPrepTime: string;
  manager: string;
  menuItems: {
    id: string;
    name: string;
    price: string;
    available: boolean;
    popular?: boolean;
  }[];
};

export type AdminFeedback = {
  id: string;
  restaurantId: string;
  restaurant: string;
  rating: number;
  category: "Delivery" | "Food Quality" | "Packaging" | "Support";
  author: string;
  text: string;
  createdAt: string;
  flagged: boolean;
};

export type DriverProfile = {
  id: string;
  name: string;
  vehicle: string;
  zone: string;
  status: "Available" | "Delivering" | "Offline";
};

const tacoReviews: RestaurantReview[] = [
  {
    id: "review-taco-1",
    author: "Maya R.",
    rating: 5,
    date: "2 days ago",
    text: "Fast delivery, warm tortillas, and the salsa verde actually has a kick.",
  },
  {
    id: "review-taco-2",
    author: "Chris P.",
    rating: 4,
    date: "Last week",
    text: "Reliable lunch spot. Burrito bowls travel well and portions are generous.",
  },
];

const pizzaReviews: RestaurantReview[] = [
  {
    id: "review-pizza-1",
    author: "Jordan K.",
    rating: 5,
    date: "Yesterday",
    text: "The crust stays crisp even after delivery and the slices are huge.",
  },
  {
    id: "review-pizza-2",
    author: "Nina T.",
    rating: 4,
    date: "3 days ago",
    text: "Great late-night order. Garlic knots could use more seasoning, but still solid.",
  },
];

const greekReviews: RestaurantReview[] = [
  {
    id: "review-greek-1",
    author: "Owen L.",
    rating: 5,
    date: "Today",
    text: "Fresh and balanced. The lemon potatoes and chicken skewers are always on point.",
  },
  {
    id: "review-greek-2",
    author: "Anika S.",
    rating: 4,
    date: "5 days ago",
    text: "Perfect if you want something lighter that still feels filling.",
  },
];

const dessertReviews: RestaurantReview[] = [
  {
    id: "review-dessert-1",
    author: "Leo M.",
    rating: 5,
    date: "1 day ago",
    text: "The cream puffs were immaculate and the packaging was actually cute.",
  },
  {
    id: "review-dessert-2",
    author: "Priya J.",
    rating: 4,
    date: "Last week",
    text: "My go-to for sweet add-ons. Quickest dessert delivery in the area.",
  },
];

export const featuredRestaurants: Restaurant[] = [
  {
    id: "featured-1",
    name: "NY Pizza Place",
    cuisine: "Brick oven pizza",
    rating: "4.8",
    reviewCount: 384,
    eta: "20-30 min",
    price: "$$",
    badge: "Popular now",
    image: require("../assets/images/PizzaPlace.png"),
    distance: "0.8 mi",
    description: "Classic New York pies, cheesy slices, and garlic knots for late study nights.",
    dietaryTags: ["Vegetarian Options", "Late Night"],
    popularDishes: ["Pepperoni Pie", "White Slice", "Garlic Knots"],
    reviews: pizzaReviews,
  },
  {
    id: "featured-2",
    name: "Tacos Numero 1",
    cuisine: "Street tacos",
    rating: "4.7",
    reviewCount: 291,
    eta: "15-25 min",
    price: "$",
    badge: "Fast delivery",
    image: require("../assets/images/Tacos.png"),
    distance: "0.5 mi",
    description: "Street-style tacos, bowls, and aguas frescas with quick prep and bold flavor.",
    dietaryTags: ["Gluten Friendly", "Protein Packed"],
    popularDishes: ["Carne Asada Tacos", "Burrito Bowl", "Horchata"],
    reviews: tacoReviews,
  },
  {
    id: "featured-3",
    name: "Pillars of Athens",
    cuisine: "Greek plates",
    rating: "4.6",
    reviewCount: 214,
    eta: "25-35 min",
    price: "$$",
    badge: "Fresh picks",
    image: require("../assets/images/Greek.png"),
    distance: "1.1 mi",
    description: "Bright Mediterranean bowls and plates with grilled proteins and crisp salads.",
    dietaryTags: ["Healthy", "High Protein"],
    popularDishes: ["Chicken Souvlaki", "Greek Salad", "Lemon Potatoes"],
    reviews: greekReviews,
  },
];

export const nearbyRestaurants: Restaurant[] = [
  {
    id: "nearby-1",
    name: "Oui Oui Desserts",
    cuisine: "Pastries and sweets",
    rating: "4.5",
    reviewCount: 189,
    eta: "18-28 min",
    price: "$$",
    badge: "Sweet tooth",
    image: require("../assets/images/Dessert (1).png"),
    distance: "0.7 mi",
    description: "French-inspired treats, cream puffs, cookies, and sweet late-night comfort.",
    dietaryTags: ["Dessert", "Coffee Pairing"],
    popularDishes: ["Cream Puff Box", "Chocolate Tart", "Iced Latte"],
    reviews: dessertReviews,
  },
  {
    id: "nearby-2",
    name: "Tacos Numero 1",
    cuisine: "Street tacos",
    rating: "4.7",
    reviewCount: 291,
    eta: "15-25 min",
    price: "$",
    badge: "Local favorite",
    image: require("../assets/images/Tacos.png"),
    distance: "0.5 mi",
    description: "Fast, reliable tacos with bold marinades and a dependable lunch rush setup.",
    dietaryTags: ["Gluten Friendly", "Protein Packed"],
    popularDishes: ["Carne Asada Tacos", "Burrito Bowl", "Horchata"],
    reviews: tacoReviews,
  },
  {
    id: "nearby-3",
    name: "Pillars of Athens",
    cuisine: "Greek plates",
    rating: "4.6",
    reviewCount: 214,
    eta: "25-35 min",
    price: "$$",
    badge: "Healthy",
    image: require("../assets/images/Greek.png"),
    distance: "1.1 mi",
    description: "Balanced bowls, plates, and fresh ingredients that feel lighter without being boring.",
    dietaryTags: ["Healthy", "High Protein"],
    popularDishes: ["Chicken Souvlaki", "Greek Salad", "Lemon Potatoes"],
    reviews: greekReviews,
  },
];

export const allRestaurants: Restaurant[] = [
  ...featuredRestaurants,
  ...nearbyRestaurants.filter(
    (restaurant) => !featuredRestaurants.some((featured) => featured.id === restaurant.id),
  ),
];

export const cuisineTags: CuisineTag[] = [
  { id: "all", label: "All" },
  { id: "pizza", label: "Pizza" },
  { id: "tacos", label: "Tacos" },
  { id: "dessert", label: "Dessert" },
  { id: "healthy", label: "Healthy" },
  { id: "greek", label: "Greek" },
];

export const dietaryFilters = [
  "Vegetarian Options",
  "Healthy",
  "Gluten Friendly",
  "High Protein",
  "Late Night",
  "Dessert",
];

export const priceFilters = ["$", "$$", "$$$"];

export const searchSuggestions: SearchSuggestion[] = [
  { id: "sugg-1", label: "Carne asada tacos", type: "dish" },
  { id: "sugg-2", label: "Pizza near campus", type: "restaurant" },
  { id: "sugg-3", label: "Healthy bowls", type: "cuisine" },
  { id: "sugg-4", label: "Dessert delivery", type: "dish" },
  { id: "sugg-5", label: "Greek dinner", type: "cuisine" },
];

export const recommendationMoments = [
  {
    id: "rec-1",
    title: "Great after class",
    copy: "Fast, reliable spots that fit a 30-minute window between lectures.",
    restaurantIds: ["featured-2", "featured-1"],
  },
  {
    id: "rec-2",
    title: "Balanced picks",
    copy: "Lighter meals with strong ratings and dependable prep times.",
    restaurantIds: ["featured-3", "nearby-3"],
  },
];

export const menuSections = [
  {
    id: "featured",
    title: "Featured picks",
    items: [
      {
        id: "menu-1",
        name: "Tacos Numero 1",
        description: "Fire-grilled steak tacos with onion, cilantro, and salsa verde.",
        price: "$12.99",
        popular: true,
      },
      {
        id: "menu-2",
        name: "Burrito Bowl",
        description: "Rice, black beans, guacamole, pico, and chipotle crema.",
        price: "$14.50",
      },
    ] satisfies MenuItem[],
  },
  {
    id: "sweet",
    title: "Sweet finish",
    items: [
      {
        id: "menu-3",
        name: "Churros",
        description: "Warm cinnamon sugar churros with dulce de leche dip.",
        price: "$6.25",
      },
      {
        id: "menu-4",
        name: "Horchata",
        description: "Creamy rice milk with vanilla and cinnamon.",
        price: "$4.50",
      },
    ] satisfies MenuItem[],
  },
];

export const currentOrder = {
  id: "ORD-2026-001",
  restaurant: "Taqueria La Mexicana",
  placedAt: "Today, 2:30 PM",
  eta: "Estimated: 15-20 min",
  address: "1855 Broadway, New York, NY 10023",
  total: "$32.97",
  items: ["Tacos Numero 1 x2", "Burrito Bowl x1", "Churros x1"],
  statuses: [
    {
      id: "confirmed",
      title: "Order Confirmed",
      detail: "Your order has been received",
    },
    {
      id: "preparing",
      title: "Preparing Food",
      detail: "Restaurant is preparing your order",
    },
    {
      id: "delivery",
      title: "Out for Delivery",
      detail: "Driver is on the way",
    },
    {
      id: "delivered",
      title: "Delivered",
      detail: "Waiting for delivery",
    },
  ] satisfies OrderStatus[],
};

export const checkoutOrder = {
  restaurant: "Taqueria La Mexicana",
  address: "1855 Broadway, New York, NY 10023",
  eta: "ETA: 25 - 35 minutes",
  item: {
    name: "Carne Asada Tacos",
    priceEach: "$8.99 each",
    quantity: 1,
  },
  tipOptions: ["10%", "15%", "20%", "25%"],
};

export const savedCards = [
  {
    id: "visa",
    brand: "VISA",
    holder: "John Doe",
    last4: "9012",
    expiry: "12/25",
  },
  {
    id: "mastercard",
    brand: "MASTERCARD",
    holder: "John Doe",
    last4: "9903",
    expiry: "08/26",
  },
  {
    id: "amex",
    brand: "AMEX",
    holder: "John Doe",
    last4: "0126",
    expiry: "03/27",
  },
] as const;

export const orderHistory = [
  {
    id: "ORD-2026-002",
    restaurant: "Tokyo Sushi Bar",
    status: "Delivered",
    date: "March 2, 2026 | Delivered at 7:45 PM",
    total: "$28.99",
    items: ["Sushi Platter x1", "Miso Soup x2"],
    accent: "#016630",
  },
  {
    id: "ORD-2026-003",
    restaurant: "Pizzeria Bella",
    status: "Delivered",
    date: "March 1, 2026 | Delivered at 6:30 PM",
    total: "$22.98",
    items: ["Margherita Pizza x1", "Caesar Salad x1"],
    accent: "#016630",
  },
  {
    id: "ORD-2026-004",
    restaurant: "Burger Palace",
    status: "Delivered",
    date: "February 28, 2026 | Delivered at 8:15 PM",
    total: "$34.97",
    items: ["Classic Burger x2", "Fries x2", "Milkshake x1"],
    accent: "#016630",
  },
  {
    id: "ORD-2026-005",
    restaurant: "Thai Spice",
    status: "Cancelled",
    date: "February 27, 2026 | Cancelled",
    total: "$18.99",
    items: ["Pad Thai x1", "Spring Rolls x1"],
    accent: "#9f0712",
  },
] satisfies OrderHistoryEntry[];

export const favoriteSpots = [
  {
    id: "favorite-1",
    restaurantId: "featured-1",
    note: "Your Friday comfort-food favorite with fast delivery and big slices.",
    orderHint: "Reorder pepperoni pie",
  },
  {
    id: "favorite-2",
    restaurantId: "featured-2",
    note: "Great for lunch runs and the closest match to the current menu flow.",
    orderHint: "Open taco menu",
  },
  {
    id: "favorite-3",
    restaurantId: "nearby-1",
    note: "Dessert pick for late-night cravings and sweet add-ons.",
    orderHint: "Browse sweets",
  },
] satisfies FavoriteSpot[];

export const profileShortcuts = [
  {
    id: "address",
    label: "Delivery Address",
    detail: "Update drop-off details and saved locations",
    icon: "map-pin",
  },
  {
    id: "recent",
    label: "Recent Activity",
    detail: "Track current orders and review past meals",
    icon: "clock",
  },
  {
    id: "rewards",
    label: "Rewards Club",
    detail: "See points, perks, and progress toward your next treat",
    icon: "gift",
  },
  {
    id: "settings",
    label: "Preferences",
    detail: "Manage alerts, privacy, and convenience settings",
    icon: "settings",
  },
] satisfies ProfileShortcut[];

export const savedAddresses = [
  "1855 Broadway, New York, NY 10023",
  "315 Columbus Ave, New York, NY 10023",
  "128 W 72nd St, New York, NY 10023",
];

export const helpTopics: HelpTopic[] = [
  {
    id: "order",
    title: "Order support",
    detail: "Questions about timing, items, or delivery handoff.",
    icon: "truck",
  },
  {
    id: "payment",
    title: "Billing support",
    detail: "Clarify charges, saved cards, or payment confirmation.",
    icon: "credit-card",
  },
  {
    id: "rewards",
    title: "Rewards help",
    detail: "Ask about points, perks, and promo eligibility.",
    icon: "gift",
  },
  {
    id: "general",
    title: "General help",
    detail: "Need anything else? We can route you to the right team.",
    icon: "help-circle",
  },
];

export const faqEntries = [
  {
    id: "faq-1",
    question: "Can I change my order after checkout?",
    answer: "In this prototype, support can mark the request and walk you through your next steps.",
  },
  {
    id: "faq-2",
    question: "How do saved cards work here?",
    answer: "Saved cards are mock-only and exist to preview the payment flow and selection states.",
  },
  {
    id: "faq-3",
    question: "Will rewards points persist?",
    answer: "Points persist locally while the prototype is open so the account flow feels realistic.",
  },
];

export const adminOrders: AdminOrder[] = [
  {
    id: "ADM-001",
    customer: "Ava Johnson",
    restaurantId: "featured-2",
    restaurant: "Tacos Numero 1",
    total: "$26.48",
    status: "Preparing",
    placedAt: "2:12 PM",
    eta: "12 min",
    driver: "Luis M.",
    issue: null,
  },
  {
    id: "ADM-002",
    customer: "Marcus Hill",
    restaurantId: "featured-1",
    restaurant: "NY Pizza Place",
    total: "$31.75",
    status: "Ready for Driver",
    placedAt: "2:06 PM",
    eta: "8 min",
    driver: "Priya S.",
    issue: "Late prep risk",
  },
  {
    id: "ADM-003",
    customer: "Noah Carter",
    restaurantId: "nearby-1",
    restaurant: "Oui Oui Desserts",
    total: "$18.20",
    status: "Pending",
    placedAt: "2:20 PM",
    eta: "18 min",
    driver: "Unassigned",
    issue: null,
  },
  {
    id: "ADM-004",
    customer: "Mia Brooks",
    restaurantId: "featured-3",
    restaurant: "Pillars of Athens",
    total: "$24.90",
    status: "Out for Delivery",
    placedAt: "1:55 PM",
    eta: "5 min",
    driver: "Elena K.",
    issue: null,
  },
];

export const adminRestaurants: AdminRestaurant[] = [
  {
    id: "featured-2",
    name: "Tacos Numero 1",
    cuisine: "Street tacos",
    status: "Live",
    avgPrepTime: "14 min",
    manager: "Diego Ramirez",
    menuItems: [
      { id: "menu-1", name: "Carne Asada Tacos", price: "$12.99", available: true, popular: true },
      { id: "menu-2", name: "Burrito Bowl", price: "$14.50", available: true },
      { id: "menu-3", name: "Churros", price: "$6.25", available: false },
    ],
  },
  {
    id: "featured-1",
    name: "NY Pizza Place",
    cuisine: "Brick oven pizza",
    status: "Busy",
    avgPrepTime: "22 min",
    manager: "Sofia Martinez",
    menuItems: [
      { id: "pizza-1", name: "Pepperoni Pie", price: "$19.99", available: true, popular: true },
      { id: "pizza-2", name: "White Slice", price: "$5.25", available: true },
      { id: "pizza-3", name: "Garlic Knots", price: "$7.50", available: true },
    ],
  },
  {
    id: "nearby-1",
    name: "Oui Oui Desserts",
    cuisine: "Pastries and sweets",
    status: "Needs Approval",
    avgPrepTime: "17 min",
    manager: "Camille Laurent",
    menuItems: [
      { id: "dessert-1", name: "Cream Puff Box", price: "$11.00", available: true, popular: true },
      { id: "dessert-2", name: "Chocolate Tart", price: "$8.50", available: true },
      { id: "dessert-3", name: "Iced Latte", price: "$5.75", available: true },
    ],
  },
];

export const adminFeedback: AdminFeedback[] = [
  {
    id: "feedback-1",
    restaurantId: "featured-2",
    restaurant: "Tacos Numero 1",
    rating: 5,
    category: "Food Quality",
    author: "Leah P.",
    text: "Great portions and still hot when it arrived.",
    createdAt: "Today, 1:48 PM",
    flagged: false,
  },
  {
    id: "feedback-2",
    restaurantId: "featured-1",
    restaurant: "NY Pizza Place",
    rating: 3,
    category: "Delivery",
    author: "James W.",
    text: "Order was fine, but the ETA slipped twice before the driver left.",
    createdAt: "Today, 12:40 PM",
    flagged: true,
  },
  {
    id: "feedback-3",
    restaurantId: "nearby-1",
    restaurant: "Oui Oui Desserts",
    rating: 4,
    category: "Packaging",
    author: "Rina K.",
    text: "Cute packaging and everything stayed intact on arrival.",
    createdAt: "Yesterday, 9:15 PM",
    flagged: false,
  },
];

export const driverProfiles: DriverProfile[] = [
  {
    id: "driver-1",
    name: "Luis M.",
    vehicle: "Blue e-bike",
    zone: "Upper West Side",
    status: "Available",
  },
  {
    id: "driver-2",
    name: "Priya S.",
    vehicle: "Silver scooter",
    zone: "Lincoln Square",
    status: "Delivering",
  },
  {
    id: "driver-3",
    name: "Elena K.",
    vehicle: "Black e-bike",
    zone: "Midtown West",
    status: "Delivering",
  },
];
