export const LOCATIONS = ['Fridge', 'Freezer', 'Pantry'];

export const CATEGORIES = [
  'Produce', 'Dairy', 'Meat', 'Grains', 'Condiments',
  'Beverages', 'Bakery', 'Pantry & Dry', 'Frozen', 'Other',
];

const today = new Date();
function dateKey(offset = 0) {
  const d = new Date(today);
  d.setDate(d.getDate() + offset);
  return d.toISOString().split('T')[0];
}

export const INITIAL_FRIDGE_ITEMS = [
  { id: 'f1', name: 'Chicken Breast', qty: 2, unit: 'pcs', location: 'Fridge', category: 'Meat', expiryDays: 2, emoji: '🍗', threshold: 1 },
  { id: 'f2', name: 'Whole Milk', qty: 1, unit: 'L', location: 'Fridge', category: 'Dairy', expiryDays: 5, emoji: '🥛', threshold: 1 },
  { id: 'f3', name: 'Eggs', qty: 8, unit: 'pcs', location: 'Fridge', category: 'Dairy', expiryDays: 14, emoji: '🥚', threshold: 4 },
  { id: 'f4', name: 'Spinach', qty: 1, unit: 'bag', location: 'Fridge', category: 'Produce', expiryDays: 3, emoji: '🥬', threshold: 1 },
  { id: 'f5', name: 'Greek Yogurt', qty: 2, unit: 'cups', location: 'Fridge', category: 'Dairy', expiryDays: 8, emoji: '🥄', threshold: 1 },
  { id: 'f6', name: 'Bell Peppers', qty: 3, unit: 'pcs', location: 'Fridge', category: 'Produce', expiryDays: 6, emoji: '🫑', threshold: 2 },
  { id: 'f7', name: 'Cheddar Cheese', qty: 200, unit: 'g', location: 'Fridge', category: 'Dairy', expiryDays: 18, emoji: '🧀', threshold: 100 },
  { id: 'f8', name: 'Salmon Fillet', qty: 1, unit: 'pc', location: 'Freezer', category: 'Meat', expiryDays: 30, emoji: '🐟', threshold: 1 },
  { id: 'f9', name: 'Frozen Peas', qty: 500, unit: 'g', location: 'Freezer', category: 'Frozen', expiryDays: 90, emoji: '🟢', threshold: 200 },
  { id: 'f10', name: 'Ice Cream', qty: 1, unit: 'tub', location: 'Freezer', category: 'Frozen', expiryDays: 60, emoji: '🍨', threshold: 1 },
  { id: 'f11', name: 'Rice', qty: 2, unit: 'kg', location: 'Pantry', category: 'Grains', expiryDays: 365, emoji: '🍚', threshold: 1 },
  { id: 'f12', name: 'Olive Oil', qty: 750, unit: 'ml', location: 'Pantry', category: 'Condiments', expiryDays: 180, emoji: '🫒', threshold: 200 },
  { id: 'f13', name: 'Pasta', qty: 500, unit: 'g', location: 'Pantry', category: 'Grains', expiryDays: 365, emoji: '🍝', threshold: 250 },
  { id: 'f14', name: 'Sourdough Bread', qty: 1, unit: 'loaf', location: 'Pantry', category: 'Bakery', expiryDays: 4, emoji: '🍞', threshold: 1 },
  { id: 'f15', name: 'Bananas', qty: 4, unit: 'pcs', location: 'Pantry', category: 'Produce', expiryDays: 3, emoji: '🍌', threshold: 2 },
];

export const INITIAL_SHOPPING_LIST = [
  { id: 's1', name: 'Tomatoes', qty: 6, unit: 'pcs', category: 'Produce', checked: false, source: 'recipe', sourceLabel: 'Pasta Sauce' },
  { id: 's2', name: 'Garlic', qty: 1, unit: 'head', category: 'Produce', checked: false, source: 'manual', sourceLabel: null },
  { id: 's3', name: 'Heavy Cream', qty: 250, unit: 'ml', category: 'Dairy', checked: false, source: 'recipe', sourceLabel: 'Carbonara' },
  { id: 's4', name: 'Parmesan', qty: 100, unit: 'g', category: 'Dairy', checked: true, source: 'manual', sourceLabel: null },
  { id: 's5', name: 'Avocados', qty: 3, unit: 'pcs', category: 'Produce', checked: false, source: 'lowstock', sourceLabel: 'Low stock' },
];

export const INITIAL_MEAL_PLAN = {
  [dateKey(0)]: {
    breakfast: { name: 'Greek Yogurt Bowl', emoji: '🥄', time: '8:00 AM' },
    lunch: null,
    dinner: { name: 'Chicken Stir Fry', emoji: '🍗', time: '7:00 PM' },
  },
  [dateKey(1)]: {
    breakfast: null,
    lunch: { name: 'Spinach Salad', emoji: '🥗', time: '12:30 PM' },
    dinner: { name: 'Salmon & Rice', emoji: '🐟', time: '7:30 PM' },
  },
  [dateKey(2)]: {
    breakfast: { name: 'Banana Pancakes', emoji: '🥞', time: '9:00 AM' },
    lunch: null,
    dinner: null,
  },
  [dateKey(3)]: {
    breakfast: null,
    lunch: null,
    dinner: { name: 'Pasta Carbonara', emoji: '🍝', time: '7:00 PM' },
  },
  [dateKey(4)]: {
    breakfast: null,
    lunch: null,
    dinner: null,
  },
  [dateKey(5)]: {
    breakfast: null,
    lunch: { name: 'Cheese Sandwich', emoji: '🧀', time: '1:00 PM' },
    dinner: null,
  },
  [dateKey(6)]: {
    breakfast: null,
    lunch: null,
    dinner: null,
  },
};

export const INITIAL_ACTIVITY = [
  { id: 'a1', text: 'Added 6 items from Woolworths receipt', time: '2 hours ago', icon: '🧾' },
  { id: 'a2', text: 'Cooked Chicken Stir Fry', time: '1 day ago', icon: '👨‍🍳' },
  { id: 'a3', text: 'Added Tomatoes to shopping list', time: '1 day ago', icon: '🛒' },
  { id: 'a4', text: 'Generated 3 recipes from kitchen', time: '2 days ago', icon: '✨' },
];

export const MOCK_RECIPES = [
  {
    id: 'r1',
    name: 'Chicken & Spinach Stir Fry',
    emoji: '🥘',
    time: '25 min',
    difficulty: 'Easy',
    servings: 2,
    description: 'Quick and healthy stir fry using chicken and fresh spinach from your kitchen.',
    usesExpiring: true,
    cuisineType: 'Asian',
    ingredients: [
      { name: 'Chicken Breast', qty: '2 pcs', fromFridge: true },
      { name: 'Spinach', qty: '1 bag', fromFridge: true },
      { name: 'Bell Peppers', qty: '2 pcs', fromFridge: true },
      { name: 'Rice', qty: '1 cup', fromFridge: true },
      { name: 'Soy Sauce', qty: '2 tbsp', fromFridge: false },
      { name: 'Sesame Oil', qty: '1 tbsp', fromFridge: false },
    ],
    steps: [
      { instruction: 'Cook rice according to package instructions.', timerSeconds: 900 },
      { instruction: 'Slice chicken breast into thin strips and season with salt and pepper.', timerSeconds: null },
      { instruction: 'Heat sesame oil in a wok over high heat.', timerSeconds: null },
      { instruction: 'Stir fry chicken until golden brown, about 5 minutes.', timerSeconds: 300 },
      { instruction: 'Add sliced bell peppers and cook for 3 minutes.', timerSeconds: 180 },
      { instruction: 'Add spinach and soy sauce, toss until wilted.', timerSeconds: 60 },
      { instruction: 'Serve over rice.', timerSeconds: null },
    ],
    nutrition: { calories: 420, protein: 38, carbs: 42, fat: 12 },
  },
  {
    id: 'r2',
    name: 'Banana Bread',
    emoji: '🍌',
    time: '55 min',
    difficulty: 'Easy',
    servings: 8,
    description: 'Use up those ripe bananas before they expire! Moist and delicious.',
    usesExpiring: true,
    cuisineType: 'American',
    ingredients: [
      { name: 'Bananas', qty: '3 pcs', fromFridge: true },
      { name: 'Eggs', qty: '2 pcs', fromFridge: true },
      { name: 'Whole Milk', qty: '60 ml', fromFridge: true },
      { name: 'Flour', qty: '280 g', fromFridge: false },
      { name: 'Sugar', qty: '150 g', fromFridge: false },
      { name: 'Butter', qty: '115 g', fromFridge: false },
    ],
    steps: [
      { instruction: 'Preheat oven to 175°C (350°F). Grease a loaf pan.', timerSeconds: null },
      { instruction: 'Mash bananas in a bowl until smooth.', timerSeconds: null },
      { instruction: 'Mix in melted butter, sugar, egg, and milk.', timerSeconds: null },
      { instruction: 'Fold in flour and a pinch of salt until just combined.', timerSeconds: null },
      { instruction: 'Pour batter into prepared loaf pan.', timerSeconds: null },
      { instruction: 'Bake for 50 minutes until a toothpick comes out clean.', timerSeconds: 3000 },
      { instruction: 'Cool for 10 minutes before slicing.', timerSeconds: 600 },
    ],
    nutrition: { calories: 290, protein: 5, carbs: 48, fat: 10 },
  },
  {
    id: 'r3',
    name: 'Creamy Pasta Carbonara',
    emoji: '🍝',
    time: '20 min',
    difficulty: 'Medium',
    servings: 2,
    description: 'Classic Italian carbonara with a rich, silky egg sauce.',
    usesExpiring: false,
    cuisineType: 'Italian',
    ingredients: [
      { name: 'Pasta', qty: '250 g', fromFridge: true },
      { name: 'Eggs', qty: '3 pcs', fromFridge: true },
      { name: 'Cheddar Cheese', qty: '100 g', fromFridge: true },
      { name: 'Heavy Cream', qty: '60 ml', fromFridge: false },
      { name: 'Bacon', qty: '150 g', fromFridge: false },
      { name: 'Black Pepper', qty: 'to taste', fromFridge: false },
    ],
    steps: [
      { instruction: 'Bring a large pot of salted water to boil. Cook pasta al dente.', timerSeconds: 600 },
      { instruction: 'While pasta cooks, fry bacon until crispy. Set aside.', timerSeconds: 300 },
      { instruction: 'Whisk eggs, grated cheese, and cream together in a bowl.', timerSeconds: null },
      { instruction: 'Drain pasta, reserving 1 cup of pasta water.', timerSeconds: null },
      { instruction: 'Toss hot pasta with egg mixture off the heat, adding pasta water to loosen.', timerSeconds: null },
      { instruction: 'Top with crispy bacon and plenty of black pepper.', timerSeconds: null },
    ],
    nutrition: { calories: 580, protein: 28, carbs: 62, fat: 24 },
  },
];

export const QUICK_MEAL_OPTIONS = [
  { name: 'Scrambled Eggs', emoji: '🥚', time: '10 min' },
  { name: 'Toast & Avocado', emoji: '🥑', time: '5 min' },
  { name: 'Greek Yogurt Bowl', emoji: '🥄', time: '5 min' },
  { name: 'Chicken Stir Fry', emoji: '🍗', time: '25 min' },
  { name: 'Pasta Carbonara', emoji: '🍝', time: '20 min' },
  { name: 'Salmon & Rice', emoji: '🐟', time: '30 min' },
  { name: 'Spinach Salad', emoji: '🥗', time: '10 min' },
  { name: 'Banana Pancakes', emoji: '🥞', time: '15 min' },
  { name: 'Cheese Sandwich', emoji: '🧀', time: '5 min' },
  { name: 'Rice Bowl', emoji: '🍚', time: '20 min' },
];

export const MOCK_RECEIPT_ITEMS = [
  { name: 'Chicken Thighs', qty: 1, unit: 'kg', expiryDays: 3, emoji: '🍗', category: 'Meat', selected: true },
  { name: 'Baby Spinach', qty: 1, unit: 'bag', expiryDays: 5, emoji: '🥬', category: 'Produce', selected: true },
  { name: 'Almond Milk', qty: 1, unit: 'L', expiryDays: 10, emoji: '🥛', category: 'Dairy', selected: true },
  { name: 'Sourdough Loaf', qty: 1, unit: 'pc', expiryDays: 5, emoji: '🍞', category: 'Bakery', selected: true },
  { name: 'Blueberries', qty: 1, unit: 'punnet', expiryDays: 4, emoji: '🫐', category: 'Produce', selected: true },
  { name: 'Pasta Sauce', qty: 1, unit: 'jar', expiryDays: 180, emoji: '🍅', category: 'Condiments', selected: true },
];
