export type Restaurant = {
  id: string;
  name: string;
  cuisine: string;
  rating: string;
  eta: string;
  price: string;
  badge: string;
  image: number;
};

export type CuisineTag = {
  id: string;
  label: string;
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

export const featuredRestaurants: Restaurant[] = [
  {
    id: "featured-1",
    name: "NY Pizza Place",
    cuisine: "Brick oven pizza",
    rating: "4.8",
    eta: "20-30 min",
    price: "$$",
    badge: "Popular now",
    image: require("../assets/images/PizzaPlace.png"),
  },
  {
    id: "featured-2",
    name: "Tacos Numero 1",
    cuisine: "Street tacos",
    rating: "4.7",
    eta: "15-25 min",
    price: "$",
    badge: "Fast delivery",
    image: require("../assets/images/Tacos.png"),
  },
  {
    id: "featured-3",
    name: "Pillars of Athens",
    cuisine: "Greek plates",
    rating: "4.6",
    eta: "25-35 min",
    price: "$$",
    badge: "Fresh picks",
    image: require("../assets/images/Greek.png"),
  },
];

export const nearbyRestaurants: Restaurant[] = [
  {
    id: "nearby-1",
    name: "Oui Oui Desserts",
    cuisine: "Pastries and sweets",
    rating: "4.5",
    eta: "18-28 min",
    price: "$$",
    badge: "Sweet tooth",
    image: require("../assets/images/Dessert (1).png"),
  },
  {
    id: "nearby-2",
    name: "Tacos Numero 1",
    cuisine: "Street tacos",
    rating: "4.7",
    eta: "15-25 min",
    price: "$",
    badge: "Local favorite",
    image: require("../assets/images/Tacos.png"),
  },
  {
    id: "nearby-3",
    name: "Pillars of Athens",
    cuisine: "Greek plates",
    rating: "4.6",
    eta: "25-35 min",
    price: "$$",
    badge: "Healthy",
    image: require("../assets/images/Greek.png"),
  },
];

export const cuisineTags: CuisineTag[] = [
  { id: "pizza", label: "Pizza" },
  { id: "tacos", label: "Tacos" },
  { id: "dessert", label: "Dessert" },
  { id: "healthy", label: "Healthy" },
  { id: "greek", label: "Greek" },
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
  selectedTip: "15%",
  customTip: "0.00",
  tipAmount: "$1.35",
  summary: {
    subtotal: "$8.99",
    deliveryFee: "$5.00",
    taxes: "$0.74",
    driverTip: "$1.35",
    total: "$16.08",
  },
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
];

export const orderHistory = [
  {
    id: "ORD-2026-002",
    restaurant: "Tokyo Sushi Bar",
    status: "Delivered",
    date: "March 2, 2026 • Delivered at 7:45 PM",
    total: "$28.99",
    items: ["Sushi Platter x1", "Miso Soup x2"],
    accent: "#016630",
  },
  {
    id: "ORD-2026-003",
    restaurant: "Pizzeria Bella",
    status: "Delivered",
    date: "March 1, 2026 • Delivered at 6:30 PM",
    total: "$22.98",
    items: ["Margherita Pizza x1", "Caesar Salad x1"],
    accent: "#016630",
  },
  {
    id: "ORD-2026-004",
    restaurant: "Burger Palace",
    status: "Delivered",
    date: "February 28, 2026 • Delivered at 8:15 PM",
    total: "$34.97",
    items: ["Classic Burger x2", "Fries x2", "Milkshake x1"],
    accent: "#016630",
  },
  {
    id: "ORD-2026-005",
    restaurant: "Thai Spice",
    status: "Cancelled",
    date: "February 27, 2026 • Cancelled",
    total: "$18.99",
    items: ["Pad Thai x1", "Spring Rolls x1"],
    accent: "#9f0712",
  },
] satisfies OrderHistoryEntry[];
