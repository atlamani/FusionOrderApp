import type { MenuItem } from "../appData";

type MenuTemplate = {
  title: string;
  items: Omit<MenuItem, "id">[];
}[];

/**
 * Generates menu sections based on the cuisine of a discovered restaurant.
 *
 * The Google Places API does not return menu data, so cuisine-aware menu
 * templates render reasonable items (tacos for Mexican spots, ramen for
 * ramen shops, etc.) until each restaurant onboards its own menu via the
 * partner dashboard / Firestore.
 *
 * Item IDs are derived from the restaurant's stable ID + a slug so the same
 * restaurant always produces the same menu IDs across mounts.
 */
const CUISINE_TEMPLATES: Record<string, MenuTemplate> = {
  Mexican: [
    {
      title: "Tacos & Tortas",
      items: [
        {
          name: "Tacos al Pastor",
          description: "Marinated pork, pineapple, onion, cilantro on corn tortillas.",
          price: "$12.50",
          popular: true,
          available: true,
        },
        {
          name: "Carne Asada Tacos",
          description: "Grilled steak, salsa verde, queso fresco.",
          price: "$13.50",
          available: true,
        },
        {
          name: "Birria Quesadilla",
          description: "Slow-braised beef, melted cheese, consomé for dipping.",
          price: "$14.00",
          popular: true,
          available: true,
        },
        {
          name: "Chicken Tinga Torta",
          description: "Pulled chipotle chicken on a toasted bolillo with avocado.",
          price: "$11.50",
          available: true,
        },
      ],
    },
    {
      title: "Sides & Drinks",
      items: [
        {
          name: "Elote",
          description: "Grilled corn, mayo, cotija, chili, lime.",
          price: "$5.00",
          available: true,
        },
        {
          name: "Chips & Guacamole",
          description: "House-made guac with warm tortilla chips.",
          price: "$7.50",
          available: true,
        },
        {
          name: "Horchata",
          description: "Cinnamon rice milk, served chilled.",
          price: "$4.50",
          available: true,
        },
      ],
    },
  ],
  Pizza: [
    {
      title: "Signature Pies",
      items: [
        {
          name: "Margherita",
          description: "San Marzano tomato, fresh mozzarella, basil, olive oil.",
          price: "$15.00",
          popular: true,
          available: true,
        },
        {
          name: "Pepperoni",
          description: "Aged pepperoni, mozzarella, tomato sauce.",
          price: "$16.50",
          popular: true,
          available: true,
        },
        {
          name: "White Mushroom",
          description: "Ricotta, garlic cream, mixed mushrooms, thyme.",
          price: "$17.50",
          available: true,
        },
        {
          name: "Spicy Soppressata",
          description: "Hot honey, soppressata, mozzarella, chili flakes.",
          price: "$18.00",
          available: true,
        },
      ],
    },
    {
      title: "Sides & Salads",
      items: [
        {
          name: "Caesar Salad",
          description: "Romaine, parmesan, anchovy dressing, croutons.",
          price: "$10.00",
          available: true,
        },
        {
          name: "Garlic Knots",
          description: "Six knots brushed with garlic butter and parsley.",
          price: "$6.50",
          available: true,
        },
      ],
    },
  ],
  Italian: [
    {
      title: "Pasta",
      items: [
        {
          name: "Cacio e Pepe",
          description: "Fresh tonnarelli, pecorino romano, cracked black pepper.",
          price: "$18.00",
          popular: true,
          available: true,
        },
        {
          name: "Bolognese",
          description: "Slow-braised beef and pork ragù with pappardelle.",
          price: "$22.00",
          available: true,
        },
        {
          name: "Mushroom Risotto",
          description: "Arborio, wild mushrooms, parmigiano, truffle oil.",
          price: "$20.00",
          available: true,
        },
      ],
    },
    {
      title: "Antipasti",
      items: [
        {
          name: "Bruschetta",
          description: "Toasted ciabatta, tomato, basil, garlic, olive oil.",
          price: "$9.00",
          available: true,
        },
        {
          name: "Burrata",
          description: "Creamy burrata, prosciutto, arugula, balsamic glaze.",
          price: "$14.00",
          popular: true,
          available: true,
        },
      ],
    },
  ],
  Japanese: [
    {
      title: "Sushi",
      items: [
        {
          name: "Spicy Tuna Roll",
          description: "Tuna, sriracha mayo, cucumber, sesame.",
          price: "$13.00",
          popular: true,
          available: true,
        },
        {
          name: "Salmon Nigiri (4 pc)",
          description: "Atlantic salmon over hand-pressed rice.",
          price: "$12.00",
          available: true,
        },
        {
          name: "Dragon Roll",
          description: "Eel, cucumber, avocado on top, eel sauce.",
          price: "$16.00",
          available: true,
        },
      ],
    },
    {
      title: "Hot Plates",
      items: [
        {
          name: "Chicken Teriyaki Bowl",
          description: "Grilled teriyaki chicken, steamed rice, broccoli.",
          price: "$15.00",
          available: true,
        },
        {
          name: "Miso Soup",
          description: "Tofu, scallion, wakame seaweed.",
          price: "$4.00",
          available: true,
        },
      ],
    },
  ],
  Ramen: [
    {
      title: "Bowls",
      items: [
        {
          name: "Tonkotsu Ramen",
          description: "Pork bone broth, chashu, soft egg, scallion.",
          price: "$16.00",
          popular: true,
          available: true,
        },
        {
          name: "Spicy Miso Ramen",
          description: "Miso broth, ground pork, bean sprouts, chili oil.",
          price: "$15.50",
          available: true,
        },
        {
          name: "Veggie Shoyu Ramen",
          description: "Soy-based broth, mushrooms, bok choy, corn.",
          price: "$14.00",
          available: true,
        },
      ],
    },
    {
      title: "Sides",
      items: [
        {
          name: "Pork Gyoza (5 pc)",
          description: "Pan-seared pork dumplings with ponzu.",
          price: "$8.00",
          available: true,
        },
        {
          name: "Edamame",
          description: "Steamed soybeans, sea salt.",
          price: "$5.00",
          available: true,
        },
      ],
    },
  ],
  Indian: [
    {
      title: "Curries & Bowls",
      items: [
        {
          name: "Chicken Tikka Masala",
          description: "Tandoori chicken in creamy tomato sauce, basmati rice.",
          price: "$15.00",
          popular: true,
          available: true,
        },
        {
          name: "Saag Paneer",
          description: "Spinach, mustard greens, house-made paneer.",
          price: "$13.50",
          available: true,
        },
        {
          name: "Lamb Vindaloo",
          description: "Spicy Goan-style lamb curry, potatoes.",
          price: "$17.00",
          available: true,
        },
      ],
    },
    {
      title: "Breads & Sides",
      items: [
        {
          name: "Garlic Naan",
          description: "Tandoor-baked flatbread, garlic, cilantro.",
          price: "$4.00",
          available: true,
        },
        {
          name: "Samosas (2 pc)",
          description: "Crispy pastry, spiced potato and pea filling.",
          price: "$6.50",
          available: true,
        },
      ],
    },
  ],
  Cafe: [
    {
      title: "Coffee & Tea",
      items: [
        {
          name: "Cortado",
          description: "Double espresso with steamed milk in a 4oz glass.",
          price: "$4.50",
          popular: true,
          available: true,
        },
        {
          name: "Iced Latte",
          description: "Double espresso, cold milk, ice.",
          price: "$5.00",
          available: true,
        },
        {
          name: "London Fog",
          description: "Earl Grey, vanilla, steamed milk.",
          price: "$4.75",
          available: true,
        },
      ],
    },
    {
      title: "Pastries & Bites",
      items: [
        {
          name: "Avocado Toast",
          description: "Sourdough, smashed avocado, chili flakes, lemon.",
          price: "$11.00",
          available: true,
        },
        {
          name: "Almond Croissant",
          description: "Twice-baked with almond cream and toasted slivers.",
          price: "$5.50",
          available: true,
        },
      ],
    },
  ],
  Burgers: [
    {
      title: "Burgers",
      items: [
        {
          name: "Classic Cheeseburger",
          description: "Quarter-pound patty, american cheese, lettuce, tomato, pickle.",
          price: "$12.00",
          popular: true,
          available: true,
        },
        {
          name: "Smash Double",
          description: "Two smashed patties, cheese, grilled onions, special sauce.",
          price: "$15.00",
          popular: true,
          available: true,
        },
        {
          name: "Mushroom Swiss",
          description: "Beef patty, sautéed mushrooms, swiss, garlic aioli.",
          price: "$14.00",
          available: true,
        },
      ],
    },
    {
      title: "Sides & Shakes",
      items: [
        {
          name: "Crinkle Fries",
          description: "Sea salt, choice of ketchup or aioli.",
          price: "$4.50",
          available: true,
        },
        {
          name: "Vanilla Shake",
          description: "Hand-spun, real vanilla bean.",
          price: "$6.50",
          available: true,
        },
      ],
    },
  ],
  Sandwiches: [
    {
      title: "Sandwiches",
      items: [
        {
          name: "Italian Sub",
          description: "Capicola, salami, prosciutto, provolone, banana peppers.",
          price: "$13.00",
          popular: true,
          available: true,
        },
        {
          name: "Turkey Club",
          description: "Roast turkey, bacon, lettuce, tomato, mayo.",
          price: "$12.00",
          available: true,
        },
        {
          name: "Veggie Hummus Wrap",
          description: "Hummus, cucumber, tomato, sprouts, feta in spinach wrap.",
          price: "$10.50",
          available: true,
        },
      ],
    },
    {
      title: "Sides",
      items: [
        {
          name: "Side Caesar",
          description: "Romaine, parmesan, croutons.",
          price: "$5.00",
          available: true,
        },
        {
          name: "Pickle Spear",
          description: "House-pickled dill spear.",
          price: "$2.00",
          available: true,
        },
      ],
    },
  ],
  Bakery: [
    {
      title: "Pastries",
      items: [
        {
          name: "Croissant",
          description: "Buttery, flaky, baked in-house each morning.",
          price: "$4.50",
          popular: true,
          available: true,
        },
        {
          name: "Pain au Chocolat",
          description: "Croissant dough with two batons of dark chocolate.",
          price: "$5.00",
          available: true,
        },
        {
          name: "Cinnamon Roll",
          description: "Soft brioche, cinnamon sugar, cream cheese glaze.",
          price: "$5.50",
          popular: true,
          available: true,
        },
      ],
    },
    {
      title: "Loaves & Drinks",
      items: [
        {
          name: "Sourdough Loaf",
          description: "24-hour ferment, crackling crust.",
          price: "$8.00",
          available: true,
        },
        {
          name: "Drip Coffee",
          description: "Single-origin, brewed every 30 minutes.",
          price: "$3.50",
          available: true,
        },
      ],
    },
  ],
  Vegan: [
    {
      title: "Bowls & Plates",
      items: [
        {
          name: "Buddha Bowl",
          description: "Quinoa, roasted veg, chickpeas, tahini drizzle.",
          price: "$13.50",
          popular: true,
          available: true,
        },
        {
          name: "Crispy Tofu Bowl",
          description: "Marinated tofu, brown rice, kimchi, sesame.",
          price: "$14.00",
          available: true,
        },
        {
          name: "Beyond Burger",
          description: "Plant-based patty, vegan cheese, lettuce, tomato.",
          price: "$15.00",
          available: true,
        },
      ],
    },
    {
      title: "Sides",
      items: [
        {
          name: "Sweet Potato Fries",
          description: "Crispy, sea salt, smoked paprika aioli.",
          price: "$5.50",
          available: true,
        },
        {
          name: "Kombucha",
          description: "Locally brewed, ginger-lemon.",
          price: "$5.00",
          available: true,
        },
      ],
    },
  ],
  Greek: [
    {
      title: "Plates",
      items: [
        {
          name: "Chicken Souvlaki Plate",
          description: "Grilled chicken skewers, rice, salad, tzatziki, pita.",
          price: "$15.50",
          popular: true,
          available: true,
        },
        {
          name: "Lamb Gyro",
          description: "Lamb gyro meat in pita with onion, tomato, tzatziki.",
          price: "$13.00",
          available: true,
        },
        {
          name: "Falafel Plate",
          description: "Six falafel, hummus, tabbouleh, pita.",
          price: "$12.00",
          available: true,
        },
      ],
    },
    {
      title: "Mezze",
      items: [
        {
          name: "Hummus",
          description: "Chickpeas, tahini, lemon, olive oil, warm pita.",
          price: "$7.50",
          available: true,
        },
        {
          name: "Greek Salad",
          description: "Tomato, cucumber, olives, feta, oregano.",
          price: "$10.00",
          available: true,
        },
      ],
    },
  ],
  Dessert: [
    {
      title: "Sweets",
      items: [
        {
          name: "Vanilla Sundae",
          description: "Vanilla ice cream, hot fudge, whipped cream, cherry.",
          price: "$7.00",
          popular: true,
          available: true,
        },
        {
          name: "Brownie à la Mode",
          description: "Warm fudge brownie, vanilla ice cream, caramel drizzle.",
          price: "$8.50",
          available: true,
        },
        {
          name: "Strawberry Milkshake",
          description: "Hand-spun with real berries.",
          price: "$6.50",
          available: true,
        },
      ],
    },
  ],
};

const FALLBACK_TEMPLATE: MenuTemplate = [
  {
    title: "Popular",
    items: [
      {
        name: "House Special",
        description: "Ask the staff about today's chef pick.",
        price: "$13.00",
        popular: true,
        available: true,
      },
      {
        name: "Seasonal Plate",
        description: "Rotates with what's fresh this week.",
        price: "$15.00",
        available: true,
      },
      {
        name: "Comfort Bowl",
        description: "Hearty bowl of grain, protein, and vegetables.",
        price: "$12.50",
        available: true,
      },
    ],
  },
  {
    title: "Drinks & Sides",
    items: [
      {
        name: "Side Salad",
        description: "Mixed greens, lemon vinaigrette.",
        price: "$5.00",
        available: true,
      },
      {
        name: "Soft Drink",
        description: "Choice of cola, lemon-lime, or sparkling water.",
        price: "$3.50",
        available: true,
      },
    ],
  },
];

function pickTemplate(cuisine: string): MenuTemplate {
  const c = cuisine.toLowerCase();
  if (c.includes("mexican") || c.includes("taco") || c.includes("burrito")) return CUISINE_TEMPLATES.Mexican;
  if (c.includes("pizza") || c.includes("pizzeria")) return CUISINE_TEMPLATES.Pizza;
  if (c.includes("ramen")) return CUISINE_TEMPLATES.Ramen;
  if (c.includes("sushi") || c.includes("japanese")) return CUISINE_TEMPLATES.Japanese;
  if (c.includes("italian")) return CUISINE_TEMPLATES.Italian;
  if (c.includes("indian") || c.includes("curry")) return CUISINE_TEMPLATES.Indian;
  if (c.includes("cafe") || c.includes("coffee") || c.includes("espresso")) return CUISINE_TEMPLATES.Cafe;
  if (c.includes("burger") || c.includes("hamburger")) return CUISINE_TEMPLATES.Burgers;
  if (c.includes("sandwich") || c.includes("sub") || c.includes("deli")) return CUISINE_TEMPLATES.Sandwiches;
  if (c.includes("bakery") || c.includes("pastry") || c.includes("bread")) return CUISINE_TEMPLATES.Bakery;
  if (c.includes("vegan") || c.includes("vegetarian") || c.includes("plant")) return CUISINE_TEMPLATES.Vegan;
  if (c.includes("greek") || c.includes("mediterranean")) return CUISINE_TEMPLATES.Greek;
  if (c.includes("dessert") || c.includes("ice cream") || c.includes("sweet")) return CUISINE_TEMPLATES.Dessert;
  return FALLBACK_TEMPLATE;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);
}

/**
 * Returns menu sections appropriate for the given cuisine, with stable IDs derived
 * from the restaurant's ID so the same item always has the same ID across renders.
 */
export function generateCuisineMenu(
  restaurantId: string,
  cuisine: string,
): { id: string; title: string; items: MenuItem[] }[] {
  const template = pickTemplate(cuisine);

  return template.map((section, sectionIndex) => ({
    id: `${restaurantId}-section-${sectionIndex}`,
    title: section.title,
    items: section.items.map((item) => ({
      ...item,
      id: `${restaurantId}-${slugify(section.title)}-${slugify(item.name)}`,
    })),
  }));
}
