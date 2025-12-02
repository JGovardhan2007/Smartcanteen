import { GoogleGenAI } from "@google/genai";
import { MenuItem, ProductCategory } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to get matching image URL using Pollinations AI
const getImageUrl = (name: string) => {
  const cleanName = name.replace(/[^a-zA-Z0-9 ]/g, ''); 
  return `https://image.pollinations.ai/prompt/delicious%20indian%20food%20${encodeURIComponent(cleanName)}%20close%20up%20high%20quality?width=800&height=600&nologo=true&seed=${Math.floor(Math.random() * 1000)}`;
};

// The Complete 40-Item Indian Menu with Veg/Non-Veg tags
const DEFAULT_MENU: MenuItem[] = [
  // --- MAIN COURSES ---
  { id: 'm1', name: 'Veg Biryani', description: 'Aromatic basmati rice cooked with mixed vegetables and authentic spices.', price: 120, category: ProductCategory.MAIN, dietType: 'VEG', imageUrl: getImageUrl('Veg Biryani'), isAvailable: true },
  { id: 'm2', name: 'Chicken Biryani', description: 'Flavorful spiced rice with tender chicken pieces and raita.', price: 180, category: ProductCategory.MAIN, dietType: 'NON-VEG', imageUrl: getImageUrl('Chicken Biryani'), isAvailable: true },
  { id: 'm3', name: 'Rajma Chawal', description: 'Red kidney beans in thick gravy served with steamed rice.', price: 90, category: ProductCategory.MAIN, dietType: 'VEG', imageUrl: getImageUrl('Rajma Chawal'), isAvailable: true },
  { id: 'm4', name: 'Mini Thali', description: '2 seasonal curries, 2 roti, rice, and pickle.', price: 110, category: ProductCategory.MAIN, dietType: 'VEG', imageUrl: getImageUrl('Indian Thali'), isAvailable: true },
  { id: 'm5', name: 'Fried Rice with Manchurian', description: 'Indo-Chinese veg fried rice served with gobi manchurian gravy.', price: 130, category: ProductCategory.MAIN, dietType: 'VEG', imageUrl: getImageUrl('Fried Rice Manchurian'), isAvailable: true },
  { id: 'm6', name: 'Masala Dosa', description: 'Crispy crepe stuffed with potato masala, served with chutney and sambar.', price: 70, category: ProductCategory.MAIN, dietType: 'VEG', imageUrl: getImageUrl('Masala Dosa'), isAvailable: true },
  { id: 'm7', name: 'Poori with Aloo Curry', description: '3 fluffy pooris served with spiced potato curry.', price: 80, category: ProductCategory.MAIN, dietType: 'VEG', imageUrl: getImageUrl('Poori Aloo'), isAvailable: true },
  { id: 'm8', name: 'Egg Maggi', description: 'Classic Masala Maggi tossed with scrambled eggs and veggies.', price: 60, category: ProductCategory.MAIN, dietType: 'NON-VEG', imageUrl: getImageUrl('Egg Maggi'), isAvailable: true },
  { id: 'm9', name: 'Paneer Curry with Roti', description: 'Rich paneer butter masala served with 3 tawa rotis.', price: 140, category: ProductCategory.MAIN, dietType: 'VEG', imageUrl: getImageUrl('Paneer Roti'), isAvailable: true },
  { id: 'm10', name: 'Curd Rice', description: 'Cool and comforting seasoned yogurt rice with pomegranate.', price: 60, category: ProductCategory.MAIN, dietType: 'VEG', imageUrl: getImageUrl('Curd Rice'), isAvailable: true },

  // --- SNACKS ---
  { id: 's1', name: 'Samosa (2 pcs)', description: 'Crispy pastry filled with spiced potatoes and peas.', price: 30, category: ProductCategory.SNACK, dietType: 'VEG', imageUrl: getImageUrl('Samosa'), isAvailable: true },
  { id: 's2', name: 'Veg Puff', description: 'Flaky bakery style puff pastry with vegetable filling.', price: 25, category: ProductCategory.SNACK, dietType: 'VEG', imageUrl: getImageUrl('Veg Puff'), isAvailable: true },
  { id: 's3', name: 'Bread Omelette', description: 'Spiced omelette sandwiched between toasted bread slices.', price: 50, category: ProductCategory.SNACK, dietType: 'NON-VEG', imageUrl: getImageUrl('Bread Omelette'), isAvailable: true },
  { id: 's4', name: 'Vada Pav', description: 'Mumbai style potato fritter in a bun with garlic chutney.', price: 25, category: ProductCategory.SNACK, dietType: 'VEG', imageUrl: getImageUrl('Vada Pav'), isAvailable: true },
  { id: 's5', name: 'Peri Peri Fries', description: 'Crispy french fries tossed in spicy peri peri masala.', price: 80, category: ProductCategory.SNACK, dietType: 'VEG', imageUrl: getImageUrl('French Fries'), isAvailable: true },
  { id: 's6', name: 'Spring Rolls', description: 'Crispy rolls filled with stir-fried vegetables.', price: 70, category: ProductCategory.SNACK, dietType: 'VEG', imageUrl: getImageUrl('Spring Rolls'), isAvailable: true },
  { id: 's7', name: 'Aloo Bonda (2 pcs)', description: 'Deep fried spiced potato balls in gram flour batter.', price: 30, category: ProductCategory.SNACK, dietType: 'VEG', imageUrl: getImageUrl('Aloo Bonda'), isAvailable: true },
  { id: 's8', name: 'Chicken Momos (6 pcs)', description: 'Steamed dumplings filled with minced chicken.', price: 90, category: ProductCategory.SNACK, dietType: 'NON-VEG', imageUrl: getImageUrl('Momos'), isAvailable: true },
  { id: 's9', name: 'Veg Cutlet (2 pcs)', description: 'Hearty vegetable patties crumb coated and fried.', price: 40, category: ProductCategory.SNACK, dietType: 'VEG', imageUrl: getImageUrl('Veg Cutlet'), isAvailable: true },
  { id: 's10', name: 'Grilled Paneer Sandwich', description: 'Toasted sandwich with spiced paneer filling.', price: 85, category: ProductCategory.SNACK, dietType: 'VEG', imageUrl: getImageUrl('Grilled Sandwich'), isAvailable: true },

  // --- DRINKS ---
  { id: 'd1', name: 'Masala Chai', description: 'Hot brewed tea with ginger and cardamom.', price: 15, category: ProductCategory.DRINK, dietType: 'VEG', imageUrl: getImageUrl('Masala Chai'), isAvailable: true },
  { id: 'd2', name: 'Filter Coffee', description: 'South Indian style strong coffee.', price: 20, category: ProductCategory.DRINK, dietType: 'VEG', imageUrl: getImageUrl('Filter Coffee'), isAvailable: true },
  { id: 'd3', name: 'Cold Coffee', description: 'Creamy blended coffee served chilled.', price: 60, category: ProductCategory.DRINK, dietType: 'VEG', imageUrl: getImageUrl('Cold Coffee'), isAvailable: true },
  { id: 'd4', name: 'Boost / Horlicks', description: 'Hot malted milk drink.', price: 40, category: ProductCategory.DRINK, dietType: 'VEG', imageUrl: getImageUrl('Hot Milk Drink'), isAvailable: true },
  { id: 'd5', name: 'Seasonal Fruit Juice', description: 'Freshly squeezed watermelon or orange juice.', price: 50, category: ProductCategory.DRINK, dietType: 'VEG', imageUrl: getImageUrl('Fruit Juice'), isAvailable: true },
  { id: 'd6', name: 'Soft Drink (300ml)', description: 'Coke, Sprite, or Pepsi.', price: 40, category: ProductCategory.DRINK, dietType: 'VEG', imageUrl: getImageUrl('Soda Bottle'), isAvailable: true },
  { id: 'd7', name: 'Sweet Lassi', description: 'Thick churned yogurt drink topped with malai.', price: 50, category: ProductCategory.DRINK, dietType: 'VEG', imageUrl: getImageUrl('Lassi'), isAvailable: true },
  { id: 'd8', name: 'Buttermilk (Chaas)', description: 'Spiced watery yogurt drink with coriander.', price: 20, category: ProductCategory.DRINK, dietType: 'VEG', imageUrl: getImageUrl('Chaas'), isAvailable: true },
  { id: 'd9', name: 'Oreo Milkshake', description: 'Thick milkshake blended with Oreo cookies.', price: 90, category: ProductCategory.DRINK, dietType: 'VEG', imageUrl: getImageUrl('Oreo Milkshake'), isAvailable: true },
  { id: 'd10', name: 'Fresh Lime Soda', description: 'Refreshing lemon soda (Sweet/Salt).', price: 40, category: ProductCategory.DRINK, dietType: 'VEG', imageUrl: getImageUrl('Lemon Soda'), isAvailable: true },

  // --- DESSERTS ---
  { id: 'sw1', name: 'Gulab Jamun (2 pcs)', description: 'Soft milk solids dumplings in sugar syrup.', price: 40, category: ProductCategory.DESSERT, dietType: 'VEG', imageUrl: getImageUrl('Gulab Jamun'), isAvailable: true },
  { id: 'sw2', name: 'Vanilla Ice Cream', description: '2 scoops of vanilla ice cream.', price: 50, category: ProductCategory.DESSERT, dietType: 'VEG', imageUrl: getImageUrl('Vanilla Ice Cream'), isAvailable: true },
  { id: 'sw3', name: 'Sizzling Brownie', description: 'Warm chocolate brownie.', price: 90, category: ProductCategory.DESSERT, dietType: 'NON-VEG', imageUrl: getImageUrl('Brownie'), isAvailable: true },
  { id: 'sw4', name: 'Black Forest Pastry', description: 'Layered chocolate cake with cherry filling.', price: 60, category: ProductCategory.DESSERT, dietType: 'NON-VEG', imageUrl: getImageUrl('Chocolate Pastry'), isAvailable: true },
  { id: 'sw5', name: 'Vanilla Muffin', description: 'Soft sponge muffin.', price: 30, category: ProductCategory.DESSERT, dietType: 'NON-VEG', imageUrl: getImageUrl('Muffin'), isAvailable: true },
  { id: 'sw6', name: 'Rice Kheer', description: 'Traditional rice pudding with nuts.', price: 50, category: ProductCategory.DESSERT, dietType: 'VEG', imageUrl: getImageUrl('Kheer'), isAvailable: true },
  { id: 'sw7', name: 'Fruit Salad', description: 'Bowl of mixed fresh seasonal fruits.', price: 60, category: ProductCategory.DESSERT, dietType: 'VEG', imageUrl: getImageUrl('Fruit Salad'), isAvailable: true },
  { id: 'sw8', name: 'Rasgulla (2 pcs)', description: 'Spongy cottage cheese balls in light syrup.', price: 40, category: ProductCategory.DESSERT, dietType: 'VEG', imageUrl: getImageUrl('Rasgulla'), isAvailable: true },
  { id: 'sw9', name: 'Gajar Ka Halwa', description: 'Sweet carrot pudding cooked in milk and ghee.', price: 70, category: ProductCategory.DESSERT, dietType: 'VEG', imageUrl: getImageUrl('Gajar Halwa'), isAvailable: true },
  { id: 'sw10', name: 'Dairy Milk Silk', description: 'Chocolate bar.', price: 80, category: ProductCategory.DESSERT, dietType: 'VEG', imageUrl: getImageUrl('Dairy Milk Chocolate'), isAvailable: true },
];

export const generateDailyMenu = async (): Promise<MenuItem[]> => {
    return DEFAULT_MENU;
};

export const analyzeSalesData = async (salesData: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze the following Indian canteen sales data (prices in Rupees ₹) and provide a brief, actionable 3-bullet point executive summary for the canteen manager regarding popularity and revenue trends. Data: ${salesData}`,
    });
    return response.text || "No analysis available.";
  } catch (error) {
    console.error("Sales analysis failed:", error);
    return "Could not generate analysis at this time.";
  }
};