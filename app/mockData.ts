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
  available?: boolean;
  popular?: boolean;
};

export type OrderTimelineStatus = {
  id: string;
  title: string;
  detail: string;
};

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

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
  status:
    | "Pending"
    | "Preparing"
    | "Ready for Driver"
    | "Out for Delivery"
    | "Completed";
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

const burgerReviews: RestaurantReview[] = [
  {
    id: "review-burger-1",
    author: "Dylan H.",
    rating: 5,
    date: "Today",
    text: "The double stack was juicy, the fries stayed crisp, and the shake was cold.",
  },
  {
    id: "review-burger-2",
    author: "Sara W.",
    rating: 4,
    date: "3 days ago",
    text: "Reliable comfort food with generous portions and fast delivery.",
  },
];

const sushiReviews: RestaurantReview[] = [
  {
    id: "review-sushi-1",
    author: "Kenji A.",
    rating: 5,
    date: "Yesterday",
    text: "The rolls tasted super fresh and the miso soup arrived piping hot.",
  },
  {
    id: "review-sushi-2",
    author: "Emily C.",
    rating: 4,
    date: "5 days ago",
    text: "Clean flavors, good packaging, and the poke bowl was really balanced.",
  },
];

const curryReviews: RestaurantReview[] = [
  {
    id: "review-curry-1",
    author: "Priya N.",
    rating: 5,
    date: "Today",
    text: "The curry bowl was warm, fragrant, and the naan stayed soft on arrival.",
  },
  {
    id: "review-curry-2",
    author: "Ari D.",
    rating: 4,
    date: "4 days ago",
    text: "Comforting flavors with a nice balance of spice and freshness.",
  },
];

const ramenReviews: RestaurantReview[] = [
  {
    id: "review-ramen-1",
    author: "Mina S.",
    rating: 5,
    date: "Yesterday",
    text: "Broth was rich, noodles had a great bite, and the gyoza were crisp.",
  },
  {
    id: "review-ramen-2",
    author: "Noah T.",
    rating: 4,
    date: "6 days ago",
    text: "A very solid late-night bowl with good portions and fast delivery.",
  },
];

const bowlReviews: RestaurantReview[] = [
  {
    id: "review-bowl-1",
    author: "Tessa M.",
    rating: 5,
    date: "Today",
    text: "The grain bowl was fresh, filling, and packed perfectly for delivery.",
  },
  {
    id: "review-bowl-2",
    author: "Chris V.",
    rating: 4,
    date: "4 days ago",
    text: "A strong healthy option with great portions and crisp veggies.",
  },
];

const sushi2Reviews: RestaurantReview[] = [
  {
    id: "review-sushi-3",
    author: "Harper D.",
    rating: 5,
    date: "Yesterday",
    text: "The specialty rolls tasted super fresh and the wasabi had a nice bite.",
  },
  {
    id: "review-sushi-4",
    author: "Maya L.",
    rating: 4,
    date: "3 days ago",
    text: "Great packaging, great flavor, and the salmon roll held up well on arrival.",
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
    description:
      "Classic New York pies, cheesy slices, and garlic knots for late study nights.",
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
    description:
      "Street-style tacos, bowls, and aguas frescas with quick prep and bold flavor.",
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
    description:
      "Bright Mediterranean bowls and plates with grilled proteins and crisp salads.",
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
    description:
      "French-inspired treats, cream puffs, cookies, and sweet late-night comfort.",
    dietaryTags: ["Dessert", "Coffee Pairing"],
    popularDishes: ["Cream Puff Box", "Chocolate Tart", "Iced Latte"],
    reviews: dessertReviews,
  },
  {
    id: "nearby-2",
    name: "Saffron Street",
    cuisine: "Indian bowls",
    rating: "4.7",
    reviewCount: 243,
    eta: "18-26 min",
    price: "$$",
    badge: "Bold flavors",
    image: require("../assets/images/Tacos.png"),
    distance: "0.6 mi",
    description:
      "Warm curries, rice bowls, and soft naan wraps with a cozy campus-friendly vibe.",
    dietaryTags: ["Vegetarian Options", "Spice Forward"],
    popularDishes: ["Chicken Tikka Bowl", "Paneer Masala Bowl", "Mango Lassi"],
    reviews: curryReviews,
  },
  {
    id: "nearby-3",
    name: "Ramen Lane",
    cuisine: "Ramen",
    rating: "4.8",
    reviewCount: 206,
    eta: "20-30 min",
    price: "$$",
    badge: "Cozy comfort",
    image: require("../assets/images/Greek.png"),
    distance: "1.2 mi",
    description:
      "Rich broths, springy noodles, and crisp small plates for late-night cravings.",
    dietaryTags: ["Late Night", "Comfort Food"],
    popularDishes: ["Tonkotsu Ramen", "Spicy Miso Ramen", "Gyoza"],
    reviews: ramenReviews,
  },
  {
    id: "nearby-4",
    name: "Burger Palace",
    cuisine: "Burgers",
    rating: "4.6",
    reviewCount: 248,
    eta: "16-24 min",
    price: "$$",
    badge: "Comfort food",
    image: require("../assets/images/PizzaPlace.png"),
    distance: "0.9 mi",
    description:
      "Stacked burgers, crispy fries, and milkshakes built for easy dinner nights.",
    dietaryTags: ["Late Night", "Comfort Food"],
    popularDishes: ["Classic Double", "Truffle Fries", "Vanilla Shake"],
    reviews: burgerReviews,
  },
  {
    id: "nearby-5",
    name: "Tokyo Sushi Bar",
    cuisine: "Sushi",
    rating: "4.8",
    reviewCount: 267,
    eta: "22-32 min",
    price: "$$$",
    badge: "Fresh rolls",
    image: require("../assets/images/Greek.png"),
    distance: "1.4 mi",
    description:
      "Fresh rolls, rice bowls, and crisp appetizers for sushi-night cravings.",
    dietaryTags: ["High Protein", "Fresh"],
    popularDishes: ["Rainbow Roll", "Spicy Tuna Roll", "Miso Soup"],
    reviews: sushiReviews,
  },
  {
    id: "nearby-6",
    name: "Harvest Bowl Co.",
    cuisine: "Healthy bowls",
    rating: "4.7",
    reviewCount: 173,
    eta: "17-27 min",
    price: "$$",
    badge: "Fresh fuel",
    image: require("../assets/images/Greek.png"),
    distance: "0.8 mi",
    description:
      "Protein-packed bowls, crisp vegetables, and bright dressings for lighter lunches and dinners.",
    dietaryTags: ["Healthy", "High Protein"],
    popularDishes: [
      "Chicken Power Bowl",
      "Falafel Crunch Bowl",
      "Green Detox Juice",
    ],
    reviews: bowlReviews,
  },
  {
    id: "nearby-7",
    name: "Bamboo Sushi",
    cuisine: "Sushi",
    rating: "4.8",
    reviewCount: 225,
    eta: "21-31 min",
    price: "$$$",
    badge: "Fresh rolls",
    image: require("../assets/images/PizzaPlace.png"),
    distance: "1.3 mi",
    description:
      "Specialty rolls, nigiri, and warm bites with a polished campus-friendly delivery flow.",
    dietaryTags: ["Fresh", "High Protein"],
    popularDishes: ["Dragon Roll", "Salmon Nigiri", "Miso Soup"],
    reviews: sushi2Reviews,
  },
];

export const allRestaurants: Restaurant[] = [
  ...featuredRestaurants,
  ...nearbyRestaurants.filter(
    (restaurant) =>
      !featuredRestaurants.some((featured) => featured.id === restaurant.id),
  ),
];

export const cuisineTags: CuisineTag[] = [
  { id: "all", label: "All" },
  { id: "pizza", label: "Pizza" },
  { id: "tacos", label: "Tacos" },
  { id: "dessert", label: "Dessert" },
  { id: "healthy", label: "Healthy" },
  { id: "greek", label: "Greek" },
  { id: "burgers", label: "Burgers" },
  { id: "sushi", label: "Sushi" },
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
  { id: "sugg-6", label: "Burger night", type: "dish" },
  { id: "sugg-7", label: "Sushi rolls", type: "dish" },
];

export const recommendationMoments = [
  {
    id: "rec-1",
    title: "Great after class",
    copy: "Fast, reliable spots that fit a 30-minute window between lectures.",
    restaurantIds: [
      "featured-2",
      "featured-1",
      "nearby-4",
      "nearby-5",
      "nearby-6",
      "nearby-7",
    ],
  },
  {
    id: "rec-2",
    title: "Balanced picks",
    copy: "Lighter meals with strong ratings and dependable prep times.",
    restaurantIds: ["featured-3", "nearby-3"],
  },
];

export const menuByRestaurantId: Record<
  string,
  { id: string; title: string; items: MenuItem[] }[]
> = {
  "featured-1": [
    {
      id: "pizza-signatures",
      title: "Signature pies",
      items: [
        {
          id: "pizza-1",
          name: "Pepperoni Pie",
          description:
            "New York-style pie with a crisp crust, rich sauce, and plenty of pepperoni.",
          price: "$19.99",
          available: true,
          popular: true,
        },
        {
          id: "pizza-2",
          name: "White Slice",
          description:
            "Garlic ricotta, mozzarella, and a light finish of olive oil and herbs.",
          price: "$5.25",
          available: true,
        },
        {
          id: "pizza-3",
          name: "Garlic Knots",
          description:
            "Soft knots brushed with garlic butter and finished with parmesan.",
          price: "$7.50",
          available: true,
        },
        {
          id: "pizza-4",
          name: "Sausage Slice",
          description:
            "A classic square slice topped with savory sausage and melted mozzarella.",
          price: "$6.50",
          available: true,
        },
        {
          id: "pizza-5",
          name: "Veggie Slice",
          description:
            "Roasted peppers, onions, mushrooms, and a light tomato sauce.",
          price: "$6.25",
          available: true,
        },
      ],
    },
    {
      id: "pizza-sides",
      title: "Sides & extras",
      items: [
        {
          id: "pizza-6",
          name: "Caesar Salad",
          description: "Romaine, shaved parmesan, and house Caesar dressing.",
          price: "$8.25",
        },
        {
          id: "pizza-7",
          name: "Marinara Cup",
          description: "Warm dipping sauce for crusts, knots, or slices.",
          price: "$2.50",
        },
        {
          id: "pizza-8",
          name: "Extra Cheese Cup",
          description: "Creamy melted cheese for dipping or topping slices.",
          price: "$2.95",
        },
      ],
    },
    {
      id: "pizza-drinks",
      title: "Drinks",
      items: [
        {
          id: "pizza-9",
          name: "Fountain Soda",
          description: "Choose from cola, lemon-lime, or iced tea.",
          price: "$3.25",
        },
        {
          id: "pizza-10",
          name: "Sparkling Water",
          description: "Crisp sparkling water served ice cold.",
          price: "$2.75",
        },
      ],
    },
  ],
  "featured-2": [
    {
      id: "taco-featured",
      title: "Featured picks",
      items: [
        {
          id: "menu-1",
          name: "Carne Asada Tacos",
          description:
            "Fire-grilled steak tacos with onion, cilantro, and salsa verde.",
          price: "$12.99",
          popular: true,
        },
        {
          id: "menu-2",
          name: "Burrito Bowl",
          description:
            "Rice, black beans, guacamole, pico, and chipotle crema.",
          price: "$14.50",
        },
        {
          id: "menu-5",
          name: "Chicken Quesadilla",
          description:
            "Griddled tortilla with melted cheese, chicken, and fresh pico.",
          price: "$11.95",
        },
        {
          id: "menu-6",
          name: "Street Corn Cup",
          description: "Roasted corn, cotija, chili-lime seasoning, and crema.",
          price: "$5.75",
        },
      ],
    },
    {
      id: "taco-sweet",
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
        {
          id: "menu-7",
          name: "Tres Leches Cup",
          description:
            "Soft sponge cake soaked in sweet milk and topped with whipped cream.",
          price: "$5.95",
        },
      ],
    },
    {
      id: "taco-drinks",
      title: "Drinks & add-ons",
      items: [
        {
          id: "menu-8",
          name: "Agua Fresca",
          description: "Refreshing fruit water, chilled and lightly sweetened.",
          price: "$3.95",
        },
        {
          id: "menu-9",
          name: "Extra Salsa Trio",
          description: "Mild, medium, and hot salsas for dipping or topping.",
          price: "$1.95",
        },
        {
          id: "menu-10",
          name: "Guacamole Side",
          description: "Creamy avocado guacamole with lime and cilantro.",
          price: "$3.50",
        },
      ],
    },
  ],
  "featured-3": [
    {
      id: "greek-bowls",
      title: "Greek classics",
      items: [
        {
          id: "greek-1",
          name: "Chicken Souvlaki Bowl",
          description: "Grilled chicken, rice, cucumber salad, and tzatziki.",
          price: "$15.75",
          popular: true,
        },
        {
          id: "greek-2",
          name: "Lemon Potato Plate",
          description:
            "Roasted potatoes with lemon, oregano, and a side salad.",
          price: "$13.25",
        },
        {
          id: "greek-3",
          name: "Falafel Pita",
          description:
            "Crisp falafel, lettuce, tomato, feta, and garlic sauce.",
          price: "$11.95",
        },
        {
          id: "greek-4",
          name: "Grilled Salmon Bowl",
          description:
            "Herb grilled salmon with rice, greens, and cucumber tomato salad.",
          price: "$17.95",
        },
        {
          id: "greek-5",
          name: "Chicken Skewer Plate",
          description:
            "Two skewers with lemon potatoes and a side of tzatziki.",
          price: "$16.50",
        },
      ],
    },
    {
      id: "greek-sides",
      title: "Add-ons",
      items: [
        {
          id: "greek-6",
          name: "Greek Salad",
          description: "Tomato, cucumber, red onion, olives, and feta.",
          price: "$8.50",
        },
        {
          id: "greek-7",
          name: "Tzatziki Dip",
          description: "Cool yogurt cucumber dip for bowls and pita.",
          price: "$2.75",
        },
        {
          id: "greek-8",
          name: "Pita Bread",
          description: "Warm pita rounds brushed with olive oil and herbs.",
          price: "$2.25",
        },
      ],
    },
    {
      id: "greek-drinks",
      title: "Drinks",
      items: [
        {
          id: "greek-9",
          name: "Sparkling Lemonade",
          description: "Bright citrus drink with a crisp finish.",
          price: "$3.95",
        },
        {
          id: "greek-10",
          name: "Iced Mint Tea",
          description: "Cool mint tea served over ice.",
          price: "$3.50",
        },
      ],
    },
  ],
  "nearby-1": [
    {
      id: "dessert-signatures",
      title: "Dessert signatures",
      items: [
        {
          id: "dessert-1",
          name: "Cream Puff Box",
          description: "Light pastry shells filled with vanilla cream.",
          price: "$11.00",
          popular: true,
        },
        {
          id: "dessert-2",
          name: "Chocolate Tart",
          description: "Rich chocolate tart with a buttery crust.",
          price: "$8.50",
        },
        {
          id: "dessert-3",
          name: "Iced Latte",
          description: "Smooth iced coffee with milk and espresso.",
          price: "$5.75",
        },
        {
          id: "dessert-4",
          name: "Berry Mille Crepe",
          description:
            "Layered crepe cake with whipped cream and fresh berries.",
          price: "$9.25",
        },
      ],
    },
    {
      id: "dessert-extras",
      title: "Small add-ons",
      items: [
        {
          id: "dessert-5",
          name: "Cookie Pair",
          description: "Two fresh-baked cookies, warm from the oven.",
          price: "$4.95",
        },
        {
          id: "dessert-6",
          name: "Mini Macarons",
          description: "A colorful assortment of delicate macarons.",
          price: "$6.50",
        },
        {
          id: "dessert-7",
          name: "Whipped Cream Cup",
          description: "Sweet vanilla whipped cream for dipping or topping.",
          price: "$1.95",
        },
      ],
    },
    {
      id: "dessert-drinks",
      title: "Drinks",
      items: [
        {
          id: "dessert-8",
          name: "Hot Chocolate",
          description: "Rich cocoa topped with whipped cream.",
          price: "$4.75",
        },
        {
          id: "dessert-9",
          name: "Fresh Brew Coffee",
          description: "Smooth coffee served hot and ready.",
          price: "$3.25",
        },
      ],
    },
  ],
  "nearby-2": [
    {
      id: "curry-menu",
      title: "Curries & bowls",
      items: [
        {
          id: "curry-1",
          name: "Chicken Tikka Bowl",
          description:
            "Aromatic spiced chicken with basmati rice, cucumber, and raita.",
          price: "$15.49",
          available: true,
          popular: true,
        },
        {
          id: "curry-2",
          name: "Paneer Masala Bowl",
          description:
            "Paneer simmered in tomato cream sauce with rice and herbs.",
          price: "$14.25",
          available: true,
        },
        {
          id: "curry-3",
          name: "Butter Chicken Wrap",
          description: "Creamy butter chicken rolled in a warm naan wrap.",
          price: "$12.95",
          available: true,
        },
        {
          id: "curry-4",
          name: "Samosa Trio",
          description:
            "Three crisp samosas served with tamarind and mint chutney.",
          price: "$6.75",
          available: true,
        },
      ],
    },
    {
      id: "curry-sides",
      title: "Sides & drinks",
      items: [
        {
          id: "curry-5",
          name: "Garlic Naan",
          description: "Soft naan brushed with garlic butter and fresh herbs.",
          price: "$3.95",
          available: true,
        },
        {
          id: "curry-6",
          name: "Coconut Rice",
          description: "Fragrant rice finished with toasted coconut and lime.",
          price: "$4.95",
          available: true,
        },
        {
          id: "curry-7",
          name: "Mango Lassi",
          description:
            "Cooling yogurt drink blended with ripe mango and cardamom.",
          price: "$4.50",
          available: true,
        },
        {
          id: "curry-8",
          name: "Mint Chutney Cup",
          description:
            "Fresh mint chutney for dipping or adding a bright finish.",
          price: "$1.95",
          available: true,
        },
      ],
    },
  ],
  "nearby-3": [
    {
      id: "ramen-bowls",
      title: "Ramen bowls",
      items: [
        {
          id: "ramen-1",
          name: "Tonkotsu Ramen",
          description:
            "Rich pork bone broth with noodles, chashu, egg, and scallions.",
          price: "$16.95",
          available: true,
          popular: true,
        },
        {
          id: "ramen-2",
          name: "Spicy Miso Ramen",
          description:
            "Miso broth with chili oil, noodles, corn, and soft-boiled egg.",
          price: "$15.75",
          available: true,
        },
        {
          id: "ramen-3",
          name: "Shoyu Chicken Ramen",
          description:
            "Soy-based broth with chicken, bamboo shoots, and mushrooms.",
          price: "$15.25",
          available: true,
        },
        {
          id: "ramen-4",
          name: "Veggie Ramen",
          description:
            "Light vegetable broth with mushrooms, bok choy, and tofu.",
          price: "$14.50",
          available: true,
        },
      ],
    },
    {
      id: "ramen-sides",
      title: "Sides & drinks",
      items: [
        {
          id: "ramen-5",
          name: "Crispy Gyoza",
          description: "Pan-seared dumplings with a soy dipping sauce.",
          price: "$7.25",
          available: true,
        },
        {
          id: "ramen-6",
          name: "Seaweed Salad",
          description: "Chilled seaweed salad with sesame and cucumber.",
          price: "$5.50",
          available: true,
        },
        {
          id: "ramen-7",
          name: "Matcha Latte",
          description: "Creamy matcha latte served hot or iced.",
          price: "$4.95",
          available: true,
        },
        {
          id: "ramen-8",
          name: "Yuzu Soda",
          description: "Bright citrus soda with a crisp finish.",
          price: "$3.75",
          available: true,
        },
      ],
    },
  ],
  "nearby-4": [
    {
      id: "burger-signatures",
      title: "Signature burgers",
      items: [
        {
          id: "burger-1",
          name: "Classic Double",
          description:
            "Two grilled beef patties, cheddar, lettuce, tomato, and house sauce.",
          price: "$13.99",
          available: true,
          popular: true,
        },
        {
          id: "burger-2",
          name: "BBQ Bacon Burger",
          description:
            "Smoky barbecue glaze with bacon, pickles, and melted cheddar.",
          price: "$14.75",
          available: true,
        },
        {
          id: "burger-3",
          name: "Mushroom Swiss Burger",
          description:
            "Sautéed mushrooms, Swiss cheese, and caramelized onions.",
          price: "$14.25",
          available: true,
        },
        {
          id: "burger-4",
          name: "Chicken Sandwich",
          description:
            "Crispy chicken breast with slaw, pickles, and spicy mayo.",
          price: "$12.95",
          available: true,
        },
      ],
    },
    {
      id: "burger-sides",
      title: "Sides & shakes",
      items: [
        {
          id: "burger-5",
          name: "Truffle Fries",
          description: "Fries tossed in truffle seasoning and parmesan.",
          price: "$6.95",
          available: true,
        },
        {
          id: "burger-6",
          name: "Onion Rings",
          description: "Golden, crunchy rings served with burger sauce.",
          price: "$5.50",
          available: true,
        },
        {
          id: "burger-7",
          name: "Vanilla Shake",
          description: "Classic vanilla milkshake blended thick and cold.",
          price: "$5.95",
          available: true,
          popular: true,
        },
      ],
    },
    {
      id: "burger-drinks",
      title: "Drinks",
      items: [
        {
          id: "burger-8",
          name: "Cola",
          description: "Ice-cold fountain cola served with crushed ice.",
          price: "$3.25",
          available: true,
        },
        {
          id: "burger-9",
          name: "Chocolate Shake",
          description: "Rich chocolate shake with whipped cream.",
          price: "$5.95",
          available: true,
        },
      ],
    },
  ],
  "nearby-5": [
    {
      id: "sushi-rolls",
      title: "Rolls & bowls",
      items: [
        {
          id: "sushi-1",
          name: "Rainbow Roll",
          description:
            "Fresh fish over a California roll base with avocado and cucumber.",
          price: "$16.99",
          available: true,
          popular: true,
        },
        {
          id: "sushi-2",
          name: "Spicy Tuna Roll",
          description:
            "Tuna, spicy mayo, and cucumber wrapped in seasoned rice.",
          price: "$14.95",
          available: true,
        },
        {
          id: "sushi-3",
          name: "Salmon Poke Bowl",
          description: "Salmon, rice, avocado, edamame, and sesame dressing.",
          price: "$17.50",
          available: true,
        },
        {
          id: "sushi-4",
          name: "Veggie Roll",
          description:
            "Avocado, cucumber, and carrot in a simple classic roll.",
          price: "$11.25",
          available: true,
        },
      ],
    },
    {
      id: "sushi-sides",
      title: "Sides",
      items: [
        {
          id: "sushi-5",
          name: "Miso Soup",
          description: "Warm miso broth with tofu, scallions, and seaweed.",
          price: "$3.95",
          available: true,
        },
        {
          id: "sushi-6",
          name: "Edamame",
          description: "Steamed edamame tossed with sea salt.",
          price: "$4.50",
          available: true,
        },
        {
          id: "sushi-7",
          name: "Seaweed Salad",
          description: "Chilled seaweed salad with sesame and cucumber.",
          price: "$5.25",
          available: true,
        },
      ],
    },
    {
      id: "sushi-drinks",
      title: "Drinks",
      items: [
        {
          id: "sushi-8",
          name: "Green Tea",
          description: "Lightly brewed green tea served hot or iced.",
          price: "$2.95",
          available: true,
        },
        {
          id: "sushi-9",
          name: "Yuzu Soda",
          description: "Bright citrus soda with a crisp finish.",
          price: "$3.75",
          available: true,
        },
      ],
    },
  ],
  "nearby-6": [
    {
      id: "bowl-featured",
      title: "Power bowls",
      items: [
        {
          id: "bowl-1",
          name: "Chicken Power Bowl",
          description:
            "Grilled chicken, quinoa, roasted vegetables, and lemon tahini dressing.",
          price: "$15.95",
          available: true,
          popular: true,
        },
        {
          id: "bowl-2",
          name: "Falafel Crunch Bowl",
          description:
            "Falafel, brown rice, tomato, cucumber, and creamy herb sauce.",
          price: "$14.50",
          available: true,
        },
        {
          id: "bowl-3",
          name: "Salmon Grain Bowl",
          description:
            "Roasted salmon, farro, greens, and avocado with citrus vinaigrette.",
          price: "$17.95",
          available: true,
        },
        {
          id: "bowl-4",
          name: "Tofu Harvest Bowl",
          description:
            "Crispy tofu, sweet potato, kale, and sesame ginger dressing.",
          price: "$13.95",
          available: true,
        },
      ],
    },
    {
      id: "bowl-sides",
      title: "Sides & extras",
      items: [
        {
          id: "bowl-5",
          name: "Green Detox Juice",
          description: "Fresh apple, cucumber, spinach, and lemon juice.",
          price: "$5.25",
          available: true,
        },
        {
          id: "bowl-6",
          name: "Avocado Toast",
          description: "Sourdough toast with avocado, chili flakes, and lime.",
          price: "$7.50",
          available: true,
        },
        {
          id: "bowl-7",
          name: "Greek Yogurt Parfait",
          description: "Yogurt, berries, and honey with toasted granola.",
          price: "$6.25",
          available: true,
        },
      ],
    },
    {
      id: "bowl-drinks",
      title: "Drinks",
      items: [
        {
          id: "bowl-8",
          name: "Iced Matcha",
          description: "Smooth iced matcha with oat milk.",
          price: "$4.95",
          available: true,
        },
        {
          id: "bowl-9",
          name: "Sparkling Water",
          description: "Chilled sparkling water with lime.",
          price: "$2.75",
          available: true,
        },
      ],
    },
  ],
  "nearby-7": [
    {
      id: "sushi2-rolls",
      title: "Signature rolls",
      items: [
        {
          id: "sushi2-1",
          name: "Dragon Roll",
          description:
            "Tempura shrimp, avocado, eel sauce, and crisp cucumber.",
          price: "$18.25",
          available: true,
          popular: true,
        },
        {
          id: "sushi2-2",
          name: "Salmon Nigiri Set",
          description: "Five pieces of fresh salmon nigiri with wasabi.",
          price: "$16.95",
          available: true,
        },
        {
          id: "sushi2-3",
          name: "Crispy Tuna Hand Roll",
          description: "Hand roll filled with spicy tuna and cucumber.",
          price: "$12.95",
          available: true,
        },
        {
          id: "sushi2-4",
          name: "Veggie Avocado Roll",
          description:
            "Avocado, cucumber, and carrot wrapped in seasoned rice.",
          price: "$11.75",
          available: true,
        },
      ],
    },
    {
      id: "sushi2-hot",
      title: "Hot bites",
      items: [
        {
          id: "sushi2-5",
          name: "Miso Soup",
          description: "Classic miso broth with tofu and scallions.",
          price: "$3.95",
          available: true,
        },
        {
          id: "sushi2-6",
          name: "Crispy Gyoza",
          description: "Pan-seared dumplings with soy dipping sauce.",
          price: "$7.25",
          available: true,
        },
        {
          id: "sushi2-7",
          name: "Tempura Shrimp",
          description: "Light, crispy shrimp with a citrus soy dip.",
          price: "$8.50",
          available: true,
        },
      ],
    },
    {
      id: "sushi2-drinks",
      title: "Drinks",
      items: [
        {
          id: "sushi2-8",
          name: "Yuzu Lemonade",
          description: "Bright citrus lemonade with a sweet finish.",
          price: "$4.25",
          available: true,
        },
        {
          id: "sushi2-9",
          name: "Green Tea",
          description: "Lightly brewed green tea served hot or iced.",
          price: "$2.95",
          available: true,
        },
      ],
    },
  ],
} satisfies Record<string, { id: string; title: string; items: MenuItem[] }[]>;

export const menuSections = menuByRestaurantId["featured-2"];

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
      id: "out_for_delivery",
      title: "Out for Delivery",
      detail: "Driver is on the way",
    },
    {
      id: "delivered",
      title: "Delivered",
      detail: "Waiting for delivery",
    },
  ] satisfies OrderTimelineStatus[],
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
    answer:
      "In this prototype, support can mark the request and walk you through your next steps.",
  },
  {
    id: "faq-2",
    question: "How do saved cards work here?",
    answer:
      "Saved cards are mock-only and exist to preview the payment flow and selection states.",
  },
  {
    id: "faq-3",
    question: "Will rewards points persist?",
    answer:
      "Points persist locally while the prototype is open so the account flow feels realistic.",
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
  {
    id: "ADM-005",
    customer: "Ethan Rivera",
    restaurantId: "nearby-2",
    restaurant: "Saffron Street",
    total: "$21.45",
    status: "Pending",
    placedAt: "2:24 PM",
    eta: "18 min",
    driver: "Unassigned",
    issue: null,
  },
  {
    id: "ADM-006",
    customer: "Lila Chen",
    restaurantId: "nearby-3",
    restaurant: "Ramen Lane",
    total: "$29.10",
    status: "Preparing",
    placedAt: "2:18 PM",
    eta: "14 min",
    driver: "Unassigned",
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
      {
        id: "menu-1",
        name: "Carne Asada Tacos",
        price: "$12.99",
        available: true,
        popular: true,
      },
      { id: "menu-2", name: "Burrito Bowl", price: "$14.50", available: true },
      { id: "menu-3", name: "Churros", price: "$6.25", available: false },
      {
        id: "menu-4",
        name: "Horchata",
        price: "$4.50",
        available: true,
      },
      {
        id: "menu-5",
        name: "Chicken Quesadilla",
        price: "$11.95",
        available: true,
      },
      {
        id: "menu-6",
        name: "Street Corn Cup",
        price: "$5.75",
        available: true,
      },
      {
        id: "menu-7",
        name: "Tres Leches Cup",
        price: "$5.95",
        available: true,
      },
      {
        id: "menu-8",
        name: "Agua Fresca",
        price: "$3.95",
        available: true,
      },
      {
        id: "menu-9",
        name: "Extra Salsa Trio",
        price: "$1.95",
        available: true,
      },
      {
        id: "menu-10",
        name: "Guacamole Side",
        price: "$3.50",
        available: true,
      },
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
      {
        id: "pizza-1",
        name: "Pepperoni Pie",
        price: "$19.99",
        available: true,
        popular: true,
      },
      { id: "pizza-2", name: "White Slice", price: "$5.25", available: true },
      { id: "pizza-3", name: "Garlic Knots", price: "$7.50", available: true },
      {
        id: "pizza-4",
        name: "Sausage Slice",
        price: "$6.50",
        available: true,
      },
      {
        id: "pizza-5",
        name: "Veggie Slice",
        price: "$6.25",
        available: true,
      },
      {
        id: "pizza-6",
        name: "Caesar Salad",
        price: "$8.25",
        available: true,
      },
      {
        id: "pizza-7",
        name: "Marinara Cup",
        price: "$2.50",
        available: true,
      },
      {
        id: "pizza-8",
        name: "Extra Cheese Cup",
        price: "$2.95",
        available: true,
      },
      {
        id: "pizza-9",
        name: "Fountain Soda",
        price: "$3.25",
        available: true,
      },
      {
        id: "pizza-10",
        name: "Sparkling Water",
        price: "$2.75",
        available: true,
      },
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
      {
        id: "dessert-1",
        name: "Cream Puff Box",
        price: "$11.00",
        available: true,
        popular: true,
      },
      {
        id: "dessert-2",
        name: "Chocolate Tart",
        price: "$8.50",
        available: true,
      },
      { id: "dessert-3", name: "Iced Latte", price: "$5.75", available: true },
      {
        id: "dessert-4",
        name: "Berry Mille Crepe",
        price: "$9.25",
        available: true,
      },
      {
        id: "dessert-5",
        name: "Cookie Pair",
        price: "$4.95",
        available: true,
      },
      {
        id: "dessert-6",
        name: "Mini Macarons",
        price: "$6.50",
        available: true,
      },
      {
        id: "dessert-7",
        name: "Whipped Cream Cup",
        price: "$1.95",
        available: true,
      },
      {
        id: "dessert-8",
        name: "Hot Chocolate",
        price: "$4.75",
        available: true,
      },
      {
        id: "dessert-9",
        name: "Fresh Brew Coffee",
        price: "$3.25",
        available: true,
      },
    ],
  },
  {
    id: "featured-3",
    name: "Pillars of Athens",
    cuisine: "Greek plates",
    status: "Live",
    avgPrepTime: "19 min",
    manager: "Nikos Papadopoulos",
    menuItems: [
      {
        id: "greek-1",
        name: "Chicken Souvlaki Bowl",
        price: "$15.75",
        available: true,
        popular: true,
      },
      {
        id: "greek-2",
        name: "Lemon Potato Plate",
        price: "$13.25",
        available: true,
      },
      {
        id: "greek-3",
        name: "Falafel Pita",
        price: "$11.95",
        available: true,
      },
      {
        id: "greek-4",
        name: "Grilled Salmon Bowl",
        price: "$17.95",
        available: true,
      },
      {
        id: "greek-5",
        name: "Chicken Skewer Plate",
        price: "$16.50",
        available: true,
      },
      { id: "greek-6", name: "Greek Salad", price: "$8.50", available: true },
      {
        id: "greek-7",
        name: "Tzatziki Dip",
        price: "$2.75",
        available: true,
      },
      {
        id: "greek-8",
        name: "Pita Bread",
        price: "$2.25",
        available: true,
      },
      {
        id: "greek-9",
        name: "Sparkling Lemonade",
        price: "$3.95",
        available: true,
      },
      {
        id: "greek-10",
        name: "Iced Mint Tea",
        price: "$3.50",
        available: true,
      },
    ],
  },
  {
    id: "nearby-2",
    name: "Saffron Street",
    cuisine: "Indian bowls",
    status: "Live",
    avgPrepTime: "16 min",
    manager: "Anika Patel",
    menuItems: [
      {
        id: "curry-1",
        name: "Chicken Tikka Bowl",
        price: "$15.49",
        available: true,
        popular: true,
      },
      {
        id: "curry-2",
        name: "Paneer Masala Bowl",
        price: "$14.25",
        available: true,
      },
      {
        id: "curry-3",
        name: "Butter Chicken Wrap",
        price: "$12.95",
        available: true,
      },
      {
        id: "curry-4",
        name: "Samosa Trio",
        price: "$6.75",
        available: true,
      },
      {
        id: "curry-5",
        name: "Garlic Naan",
        price: "$3.95",
        available: true,
      },
      {
        id: "curry-6",
        name: "Coconut Rice",
        price: "$4.95",
        available: true,
      },
      {
        id: "curry-7",
        name: "Mango Lassi",
        price: "$4.50",
        available: true,
      },
      {
        id: "curry-8",
        name: "Mint Chutney Cup",
        price: "$1.95",
        available: true,
      },
    ],
  },
  {
    id: "nearby-3",
    name: "Ramen Lane",
    cuisine: "Ramen",
    status: "Live",
    avgPrepTime: "18 min",
    manager: "Haruto Sato",
    menuItems: [
      {
        id: "ramen-1",
        name: "Tonkotsu Ramen",
        price: "$16.95",
        available: true,
        popular: true,
      },
      {
        id: "ramen-2",
        name: "Spicy Miso Ramen",
        price: "$15.75",
        available: true,
      },
      {
        id: "ramen-3",
        name: "Shoyu Chicken Ramen",
        price: "$15.25",
        available: true,
      },
      {
        id: "ramen-4",
        name: "Veggie Ramen",
        price: "$14.50",
        available: true,
      },
      {
        id: "ramen-5",
        name: "Crispy Gyoza",
        price: "$7.25",
        available: true,
      },
      {
        id: "ramen-6",
        name: "Seaweed Salad",
        price: "$5.50",
        available: true,
      },
      {
        id: "ramen-7",
        name: "Matcha Latte",
        price: "$4.95",
        available: true,
      },
      {
        id: "ramen-8",
        name: "Yuzu Soda",
        price: "$3.75",
        available: true,
      },
    ],
  },
  {
    id: "nearby-6",
    name: "Harvest Bowl Co.",
    cuisine: "Healthy bowls",
    status: "Live",
    avgPrepTime: "15 min",
    manager: "Sienna Patel",
    menuItems: [
      {
        id: "bowl-1",
        name: "Chicken Power Bowl",
        price: "$15.95",
        available: true,
        popular: true,
      },
      {
        id: "bowl-2",
        name: "Falafel Crunch Bowl",
        price: "$14.50",
        available: true,
      },
      {
        id: "bowl-3",
        name: "Salmon Grain Bowl",
        price: "$17.95",
        available: true,
      },
      {
        id: "bowl-4",
        name: "Tofu Harvest Bowl",
        price: "$13.95",
        available: true,
      },
      {
        id: "bowl-5",
        name: "Green Detox Juice",
        price: "$5.25",
        available: true,
      },
      {
        id: "bowl-6",
        name: "Avocado Toast",
        price: "$7.50",
        available: true,
      },
      {
        id: "bowl-7",
        name: "Greek Yogurt Parfait",
        price: "$6.25",
        available: true,
      },
      {
        id: "bowl-8",
        name: "Iced Matcha",
        price: "$4.95",
        available: true,
      },
      {
        id: "bowl-9",
        name: "Sparkling Water",
        price: "$2.75",
        available: true,
      },
    ],
  },
  {
    id: "nearby-7",
    name: "Bamboo Sushi",
    cuisine: "Sushi",
    status: "Busy",
    avgPrepTime: "24 min",
    manager: "Akira Tanaka",
    menuItems: [
      {
        id: "sushi2-1",
        name: "Dragon Roll",
        price: "$18.25",
        available: true,
        popular: true,
      },
      {
        id: "sushi2-2",
        name: "Salmon Nigiri Set",
        price: "$16.95",
        available: true,
      },
      {
        id: "sushi2-3",
        name: "Crispy Tuna Hand Roll",
        price: "$12.95",
        available: true,
      },
      {
        id: "sushi2-4",
        name: "Veggie Avocado Roll",
        price: "$11.75",
        available: true,
      },
      {
        id: "sushi2-5",
        name: "Miso Soup",
        price: "$3.95",
        available: true,
      },
      {
        id: "sushi2-6",
        name: "Crispy Gyoza",
        price: "$7.25",
        available: true,
      },
      {
        id: "sushi2-7",
        name: "Tempura Shrimp",
        price: "$8.50",
        available: true,
      },
      {
        id: "sushi2-8",
        name: "Yuzu Lemonade",
        price: "$4.25",
        available: true,
      },
      {
        id: "sushi2-9",
        name: "Green Tea",
        price: "$2.95",
        available: true,
      },
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
  {
    id: "feedback-4",
    restaurantId: "nearby-2",
    restaurant: "Saffron Street",
    rating: 5,
    category: "Food Quality",
    author: "Talia D.",
    text: "The tikka bowl was fragrant, fresh, and arrived perfectly packed.",
    createdAt: "Today, 10:22 AM",
    flagged: false,
  },
  {
    id: "feedback-5",
    restaurantId: "nearby-3",
    restaurant: "Ramen Lane",
    rating: 4,
    category: "Delivery",
    author: "Andre M.",
    text: "Broth stayed hot and the noodles were still springy on arrival.",
    createdAt: "Today, 11:05 AM",
    flagged: false,
  },
  {
    id: "feedback-6",
    restaurantId: "nearby-6",
    restaurant: "Harvest Bowl Co.",
    rating: 5,
    category: "Food Quality",
    author: "Jada R.",
    text: "Fresh, filling, and exactly the kind of healthy lunch I was looking for.",
    createdAt: "Today, 12:18 PM",
    flagged: false,
  },
  {
    id: "feedback-7",
    restaurantId: "nearby-7",
    restaurant: "Bamboo Sushi",
    rating: 4,
    category: "Packaging",
    author: "Omar T.",
    text: "The rolls were neatly packed and the hot sides stayed separate and crisp.",
    createdAt: "Today, 12:52 PM",
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
