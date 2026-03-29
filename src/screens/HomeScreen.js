import React, { useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Switch,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FONTS, RADIUS } from '../theme';
import { MOCK_RECIPES, INITIAL_HEALTH_DATA } from '../data';
import { useTheme } from '../context/ThemeContext';
import { useFABScroll } from '../context/FABContext';
import { Animated, usePressScale, useStaggeredItem } from '../components/useAnimations';
import {
  ExpiryBadge,
  GroupedCard,
  hapticMedium,
  hapticLight,
  hapticSuccess,
} from '../components/shared';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function getCurrentMealSlot() {
  const h = new Date().getHours();
  if (h < 11) return 'breakfast';
  if (h < 16) return 'lunch';
  return 'dinner';
}

const MEAL_SLOTS = [
  { type: 'breakfast', emoji: '🌅', label: 'Breakfast' },
  { type: 'lunch',    emoji: '☀️', label: 'Lunch' },
  { type: 'dinner',   emoji: '🌙', label: 'Dinner' },
];

export default function HomeScreen({ navigation, fridgeItems, mealPlan, setMealPlan, savedRecipes = [], activityFeed, userProfile }) {
  const { colors: COLORS } = useTheme();
  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    content: { padding: 24, paddingTop: 60, paddingBottom: 120, gap: 24 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    greeting: { fontSize: 15, fontFamily: FONTS.body, color: COLORS.textMuted },
    userName: { fontSize: 28, fontFamily: FONTS.display, color: COLORS.text, marginTop: 2 },
    avatar: {
      width: 44, height: 44, borderRadius: 22,
      backgroundColor: COLORS.primary,
      justifyContent: 'center', alignItems: 'center',
    },
    avatarText: { fontSize: 18, fontFamily: FONTS.bodyBold, color: '#fff' },
    statsRow: { flexDirection: 'row', gap: 10 },
    expiringRow: { flexDirection: 'row', alignItems: 'center', padding: 16 },
    expiringEmoji: { fontSize: 24, marginRight: 12 },
    expiringName: { fontSize: 15, fontFamily: FONTS.bodyMed, color: COLORS.text },
    expiringQty: { fontSize: 12, fontFamily: FONTS.body, color: COLORS.textMuted, marginTop: 2 },
    divider: { height: StyleSheet.hairlineWidth, backgroundColor: COLORS.border, marginLeft: 52 },
    emptyText: {
      fontSize: 14, fontFamily: FONTS.body, color: COLORS.textMuted,
      textAlign: 'center', paddingVertical: 20,
    },
  });

  const anim0 = useStaggeredItem(0);
  const anim1 = useStaggeredItem(1);
  const anim2 = useStaggeredItem(2);
  const anim3 = useStaggeredItem(3);

  const [activeTab, setActiveTab] = useState('plan');
  const [expiryThreshold, setExpiryThreshold] = useState(3);
  const [showDaysPopup, setShowDaysPopup] = useState(false);
  const [daysInput, setDaysInput] = useState('3');
  const [daysError, setDaysError] = useState('');

  const health = INITIAL_HEALTH_DATA;
  const [calorieGoal, setCalorieGoal] = useState(health.dailyCalorieGoal);
  const [todayCalories, setTodayCalories] = useState(health.today.calories);
  const [showCaloriePopup, setShowCaloriePopup] = useState(false);
  const [goalInput, setGoalInput] = useState(String(health.dailyCalorieGoal));
  const [intakeInput, setIntakeInput] = useState(String(health.today.calories));
  const [calorieError, setCalorieError] = useState('');
  const [eatenMeals, setEatenMeals] = useState({});
  const [showCalorieCard, setShowCalorieCard] = useState(true);
  const [goalEnabled, setGoalEnabled] = useState(true);
  const [quickFilter, setQuickFilter] = useState('items');

  const [selectedDayIndex, setSelectedDayIndex] = useState(null); // null = today
  const reversedDaily = useMemo(() => [...health.daily].reverse(), []);
  const maxDailyCal = Math.max(...health.daily.map((w) => w.calories), calorieGoal, todayCalories);
  const calorieRemaining = Math.max(0, calorieGoal - todayCalories);
  const chartScrollRef = useRef(null);
  const planScrollRef = useRef(null);
  const { width: screenWidth } = useWindowDimensions();
  const planCardWidth = screenWidth - 48;

  const [planDayOffset, setPlanDayOffset] = useState(0);
  const planDays = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const key = d.toISOString().split('T')[0];
    const shortLabel = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' });
    const label = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    return { key, label, shortLabel, offset: i };
  }), []);

  // Pulse hint: briefly scale up editable elements on mount
  const pulseAnim = useRef(new Animated.Value(1)).current;
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      Animated.sequence([
        Animated.spring(pulseAnim, { toValue: 1.03, useNativeDriver: true, speed: 20, bounciness: 4 }),
        Animated.spring(pulseAnim, { toValue: 1, useNativeDriver: true, speed: 12, bounciness: 8 }),
      ]).start();
    }, 600);
    return () => clearTimeout(timeout);
  }, []);

  // Sticky tabs
  const tabsLayoutY = useRef(0);
  const tabsLayoutH = useRef(0);
  const isStickyRef = useRef(false);
  const [isSticky, setIsSticky] = useState(false);
  const stickyAnim = useRef(new Animated.Value(0)).current;

  const fabScroll = useFABScroll();

  const handleScroll = (e) => {
    fabScroll(e);
    const y = e.nativeEvent.contentOffset.y;
    const shouldStick = y >= tabsLayoutY.current + tabsLayoutH.current - 50;
    if (shouldStick !== isStickyRef.current) {
      isStickyRef.current = shouldStick;
      setIsSticky(shouldStick);
      Animated.spring(stickyAnim, {
        toValue: shouldStick ? 1 : 0,
        useNativeDriver: true,
        damping: 20,
        stiffness: 300,
      }).start();
    }
  };

  const displayCalories = selectedDayIndex === null ? todayCalories : reversedDaily[selectedDayIndex].calories;
  const displayPct = (displayCalories / calorieGoal) * 100;
  const displayRemaining = calorieGoal - displayCalories;
  const displayBarColor = displayPct > 200 ? COLORS.danger : displayPct > 100 ? COLORS.warning : COLORS.primary;
  const getBarDate = (i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
  };
  const displayLabel = selectedDayIndex === null ? 'CALORIES TODAY' : getBarDate(selectedDayIndex);

  const expiring = fridgeItems.filter((i) => i.expiryDays <= expiryThreshold).sort((a, b) => a.expiryDays - b.expiryDays);

  const mealRecommendations = useMemo(() => {
    const fridgeNames = fridgeItems.map((i) => i.name.toLowerCase());
    return MOCK_RECIPES
      .map((recipe) => {
        const fridgeIngredients = recipe.ingredients.filter((ing) => ing.fromFridge);
        const available = fridgeIngredients.filter((ing) => fridgeNames.includes(ing.name.toLowerCase())).length;
        const expiringCount = fridgeIngredients.filter((ing) =>
          fridgeItems.find((fi) => fi.name.toLowerCase() === ing.name.toLowerCase() && fi.expiryDays <= expiryThreshold)
        ).length;
        const matchPct = fridgeIngredients.length > 0 ? available / fridgeIngredients.length : 0;
        return { ...recipe, available, expiringCount, matchPct, total: fridgeIngredients.length };
      })
      .filter((r) => r.matchPct >= 0.5)
      .sort((a, b) => b.expiringCount - a.expiringCount || b.matchPct - a.matchPct);
  }, [fridgeItems, expiryThreshold]);

  // Quick bite — split into grab-and-go items and quick meals
  const SNACKABLE = new Set(['Produce', 'Dairy', 'Bakery', 'Beverages', 'Other']);
  const { quickItems, quickMeals } = useMemo(() => {
    // Fridge snacks: snackable categories, have calories
    let items = fridgeItems
      .filter((item) => SNACKABLE.has(item.category) && item.calories)
      .map((item) => ({
        id: item.id, kind: 'item', name: item.name, emoji: item.emoji,
        calories: item.calories, time: null, expiryDays: item.expiryDays,
      }));

    // Saved recipes as quick meals
    let meals = (savedRecipes || []).map((r) => ({
      id: r.id, kind: 'recipe', name: r.name, emoji: r.emoji,
      calories: r.nutrition?.calories || 0, time: r.time, recipe: r,
    }));

    // Filter by calorie budget if there's room and goal is enabled
    if (goalEnabled && calorieRemaining > 0) {
      const fitsItems = items.filter((i) => i.calories > 0 && i.calories <= calorieRemaining);
      if (fitsItems.length > 0) items = fitsItems;
      const fitsMeals = meals.filter((m) => m.calories > 0 && m.calories <= calorieRemaining);
      if (fitsMeals.length > 0) meals = fitsMeals;
    }

    // Sort items: expiring first, then by calories
    items.sort((a, b) => {
      if (a.expiryDays && a.expiryDays <= 2 && (!b.expiryDays || b.expiryDays > 2)) return -1;
      if (b.expiryDays && b.expiryDays <= 2 && (!a.expiryDays || a.expiryDays > 2)) return 1;
      return a.calories - b.calories;
    });

    // Sort meals by cook time
    meals.sort((a, b) => parseInt(a.time) - parseInt(b.time));

    return { quickItems: items.slice(0, 5), quickMeals: meals.slice(0, 5) };
  }, [fridgeItems, savedRecipes, calorieRemaining, goalEnabled]);
  const quickBiteCount = quickItems.length + quickMeals.length;

  // Today's meal plan
  const todayKey = new Date().toISOString().split('T')[0];
  const todayPlan = mealPlan?.[todayKey] || {};
  const currentSlot = getCurrentMealSlot();

  const mealUsesExpiring = (mealName) => {
    if (!mealName) return false;
    const lower = mealName.toLowerCase();
    return fridgeItems.some((item) => {
      if (item.expiryDays > 2) return false;
      const words = item.name.toLowerCase().split(' ').filter((w) => w.length > 3);
      return words.some((w) => lower.includes(w));
    });
  };

  const addToPlan = (recipe) => {
    const emptySlot = MEAL_SLOTS.find(({ type }) => !todayPlan[type]);
    if (!emptySlot) return;
    hapticSuccess();
    setMealPlan((prev) => ({
      ...prev,
      [todayKey]: {
        ...(prev[todayKey] || {}),
        [emptySlot.type]: {
          name: recipe.name,
          emoji: recipe.emoji,
          time: emptySlot.type === 'breakfast' ? '8:00 AM' : emptySlot.type === 'lunch' ? '12:30 PM' : '7:00 PM',
          calories: recipe.nutrition?.calories || 0,
        },
      },
    }));
  };

  const logMeal = (type, calories) => {
    hapticSuccess();
    setTodayCalories((prev) => prev + (calories || 0));
    setEatenMeals((prev) => ({ ...prev, [type]: true }));
  };

  return (
    <>
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} onScroll={handleScroll} scrollEventThrottle={16}>

      {/* Header */}
      <Animated.View style={[styles.headerRow, anim0]}>
        <View>
          <Text style={styles.greeting}>{getGreeting()},</Text>
          <Text style={styles.userName}>{userProfile.name || 'Chef'}</Text>
        </View>
        <TouchableOpacity
          style={styles.avatar}
          onPress={() => { hapticLight(); navigation.navigate('Profile'); }}
        >
          <Text style={styles.avatarText}>{(userProfile.name || 'C')[0].toUpperCase()}</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Calorie Hero — toggleable */}
      <Animated.View style={[anim1, { transform: [{ scale: pulseAnim }] }]}>
        {showCalorieCard ? (
        <View style={{ backgroundColor: COLORS.card, borderRadius: RADIUS.xxl, overflow: 'hidden' }}>
          {/* Top section — long press to edit, tap to deselect day */}
          <TouchableOpacity
            onLongPress={() => { hapticMedium(); setIntakeInput(String(todayCalories)); setGoalInput(String(calorieGoal)); setShowCaloriePopup(true); }}
            onPress={() => { if (selectedDayIndex !== null) { hapticLight(); setSelectedDayIndex(null); } }}
            activeOpacity={0.97}
            style={{ padding: 20, gap: 14 }}
          >
            {/* Header row */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Text style={{ fontSize: 12, fontFamily: FONTS.bodyMed, color: COLORS.textMuted, letterSpacing: 0.5 }}>{displayLabel}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                {goalEnabled && (
                <View style={{ backgroundColor: displayBarColor + '22', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 }}>
                  <Text style={{ fontSize: 12, fontFamily: FONTS.bodyBold, color: displayBarColor }}>{Math.round(displayPct)}%</Text>
                </View>
              )}
                <TouchableOpacity
                  onPress={() => { hapticLight(); setShowCalorieCard(false); }}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="chevron-up" size={18} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Big number */}
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
              <Text style={{ fontSize: 44, fontFamily: FONTS.display, color: COLORS.text, lineHeight: 48 }}>
                {displayCalories.toLocaleString()}
              </Text>
              {goalEnabled ? (
                <Text style={{ fontSize: 14, fontFamily: FONTS.body, color: COLORS.textMuted }}>
                  / {calorieGoal.toLocaleString()} kcal
                </Text>
              ) : (
                <Text style={{ fontSize: 14, fontFamily: FONTS.body, color: COLORS.textMuted }}>kcal</Text>
              )}
            </View>

            {/* Progress bar — only when goal enabled */}
            {goalEnabled && (
              <View style={{ height: 6, backgroundColor: COLORS.cardAlt, borderRadius: 3, overflow: 'hidden' }}>
                <View style={{ width: `${Math.min(displayPct, 100)}%`, height: '100%', backgroundColor: displayBarColor, borderRadius: 3 }} />
              </View>
            )}

            {/* Remaining / over — only when goal enabled */}
            {goalEnabled && (
              <Text style={{ fontSize: 13, fontFamily: FONTS.body, color: COLORS.textMuted }}>
                {displayRemaining > 0
                  ? `${displayRemaining.toLocaleString()} kcal remaining`
                  : `${Math.abs(displayRemaining).toLocaleString()} kcal over goal`}
              </Text>
            )}
          </TouchableOpacity>

          {/* 30-day chart — separate from long-press area */}
          <View style={{ paddingHorizontal: 20, paddingBottom: 20 }}>
          <ScrollView ref={chartScrollRef} horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 5, height: 64, paddingHorizontal: 4 }}>
              {reversedDaily.map((w, i) => {
                const barH = Math.max(4, (w.calories / maxDailyCal) * 48);
                const isSelected = selectedDayIndex === null ? i === 0 : i === selectedDayIndex;
                const hasSelection = selectedDayIndex !== null;
                const overGoal = w.calories > calorieGoal;
                const barColor = isSelected
                  ? (overGoal ? COLORS.warning : COLORS.primary)
                  : overGoal
                    ? COLORS.warning + (hasSelection ? '30' : '60')
                    : COLORS.primary + (hasSelection ? '20' : '35');
                return (
                  <TouchableOpacity
                    key={i}
                    onPress={() => { hapticLight(); setSelectedDayIndex(i === 0 ? null : i); }}
                    activeOpacity={0.7}
                    style={{ width: 22, alignItems: 'center', gap: 3 }}
                  >
                    <View style={{ width: isSelected ? 22 : 18, height: barH, borderRadius: 3, backgroundColor: barColor }} />
                    <Text style={{
                      fontSize: 9,
                      fontFamily: isSelected ? FONTS.bodyBold : FONTS.body,
                      color: isSelected ? displayBarColor : COLORS.textMuted,
                    }}>{(() => { const d = new Date(); d.setDate(d.getDate() - i); return d.getDate(); })()}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
          </View>
        </View>
        ) : (
          <TouchableOpacity
            onPress={() => { hapticLight(); setShowCalorieCard(true); }}
            style={{
              backgroundColor: COLORS.card, borderRadius: RADIUS.xl,
              paddingHorizontal: 16, paddingVertical: 12,
              flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            }}
            activeOpacity={0.7}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 16 }}>🔥</Text>
              <Text style={{ fontSize: 14, fontFamily: FONTS.bodyMed, color: COLORS.text }}>
                {todayCalories.toLocaleString()} kcal today
              </Text>
            </View>
            <Text style={{ fontSize: 12, fontFamily: FONTS.bodyMed, color: COLORS.primary }}>Show goal</Text>
          </TouchableOpacity>
        )}
      </Animated.View>

      {/* Stats — tab selector */}
      <Animated.View style={[styles.statsRow, anim2]} onLayout={(e) => { tabsLayoutY.current = e.nativeEvent.layout.y; tabsLayoutH.current = e.nativeEvent.layout.height; }}>
        {[
          { id: 'quick', value: quickBiteCount, label: 'Quick bite', accent: quickBiteCount > 0 ? COLORS.success : null },
          { id: 'plan', value: MEAL_SLOTS.filter(({ type }) => (mealPlan?.[planDays[planDayOffset].key] || {})[type]).length, label: planDays[planDayOffset].shortLabel, accent: COLORS.primary },
          { id: 'expiring', value: expiring.length, label: `${expiryThreshold}d expiring`, accent: expiring.length > 0 ? COLORS.danger : null },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          const activeColor = tab.accent || COLORS.primary;
          return (
            <Animated.View key={tab.id} style={{ flex: 1, transform: tab.id === 'expiring' ? [{ scale: pulseAnim }] : [] }}>
            <TouchableOpacity
              style={{
                flex: 1, backgroundColor: COLORS.card,
                borderRadius: RADIUS.xl, padding: 16, gap: 4,
                borderWidth: 2,
                borderColor: isActive ? activeColor : 'transparent',
              }}
              onPress={() => { hapticLight(); setActiveTab(tab.id); }}
              onLongPress={tab.id === 'expiring' ? () => { hapticMedium(); setDaysInput(String(expiryThreshold)); setShowDaysPopup(true); } : undefined}
              activeOpacity={0.85}
            >
              <Text style={{ fontSize: 32, fontFamily: FONTS.display, color: isActive ? (tab.accent || COLORS.text) : (tab.accent ? tab.accent + '99' : COLORS.textMuted), lineHeight: 36 }}>{tab.value}</Text>
              <Text style={{ fontSize: 12, fontFamily: FONTS.bodyMed, color: isActive ? COLORS.text : COLORS.textMuted }}>{tab.label}</Text>
            </TouchableOpacity>
            </Animated.View>
          );
        })}
      </Animated.View>

      {/* Table */}
      <Animated.View style={anim3}>
        {/* Tab 1: Quick bite */}
        {activeTab === 'quick' && (() => {
          const filtered = quickFilter === 'meals' ? quickMeals : quickItems;
          return quickBiteCount === 0
            ? <GroupedCard><Text style={styles.emptyText}>Add items to your kitchen or save recipes</Text></GroupedCard>
            : <View style={{ gap: 12 }}>
                {/* Filter pills */}
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {[
                    { key: 'items', label: 'Grab & go', count: quickItems.length },
                    { key: 'meals', label: 'Quick cook', count: quickMeals.length },
                  ].map((f) => {
                    const active = quickFilter === f.key;
                    return (
                      <TouchableOpacity
                        key={f.key}
                        onPress={() => { hapticLight(); setQuickFilter(f.key); }}
                        style={{
                          flexDirection: 'row', alignItems: 'center', gap: 5,
                          backgroundColor: active ? COLORS.primary : COLORS.card,
                          borderRadius: RADIUS.full, paddingVertical: 6, paddingHorizontal: 12,
                        }}
                        activeOpacity={0.7}
                      >
                        <Text style={{ fontSize: 13, fontFamily: FONTS.bodyMed, color: active ? '#fff' : COLORS.textMuted }}>{f.label}</Text>
                        <View style={{ backgroundColor: active ? 'rgba(255,255,255,0.25)' : COLORS.cardAlt, borderRadius: 8, paddingHorizontal: 5, paddingVertical: 1 }}>
                          <Text style={{ fontSize: 11, fontFamily: FONTS.bodyBold, color: active ? '#fff' : COLORS.textMuted }}>{f.count}</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                  {calorieRemaining > 0 && showCalorieCard && goalEnabled && (
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                      <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: COLORS.success }} />
                      <Text style={{ fontSize: 11, fontFamily: FONTS.bodyMed, color: COLORS.textMuted }}>
                        {calorieRemaining.toLocaleString()} kcal left
                      </Text>
                    </View>
                  )}
                </View>

                {/* Flat list */}
                {filtered.length === 0
                  ? <GroupedCard><Text style={styles.emptyText}>No {quickFilter === 'meals' ? 'saved recipes' : 'snack items'} yet</Text></GroupedCard>
                  : <GroupedCard>
                      {filtered.map((item, i) => {
                        const fitsCalories = calorieRemaining > 0 && item.calories > 0 && item.calories <= calorieRemaining;
                        const isExpiring = item.expiryDays && item.expiryDays <= 2;
                        const isRecipe = item.kind === 'recipe';
                        return (
                          <React.Fragment key={item.id ?? i}>
                            <TouchableOpacity
                              style={styles.expiringRow}
                              onPress={isRecipe
                                ? () => { hapticLight(); navigation.navigate('Recipes', { screen: 'RecipeDetail', params: { recipe: item.recipe } }); }
                                : () => { hapticLight(); navigation.navigate('Kitchen'); }
                              }
                              activeOpacity={0.7}
                            >
                              <Text style={styles.expiringEmoji}>{item.emoji}</Text>
                              <View style={{ flex: 1 }}>
                                <Text style={styles.expiringName}>{item.name}</Text>
                                <Text style={styles.expiringQty}>
                                  {isRecipe ? item.time : 'Ready to eat'}
                                  {item.calories ? ` · ${item.calories} kcal` : ''}
                                </Text>
                              </View>
                              {isExpiring && (
                                <View style={{ backgroundColor: COLORS.danger + '20', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3, marginRight: 6 }}>
                                  <Text style={{ fontSize: 11, fontFamily: FONTS.bodyBold, color: COLORS.danger }}>{item.expiryDays}d</Text>
                                </View>
                              )}
                              {fitsCalories && (
                                <View style={{ backgroundColor: COLORS.success + '20', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 }}>
                                  <Text style={{ fontSize: 11, fontFamily: FONTS.bodyBold, color: COLORS.success }}>Fits</Text>
                                </View>
                              )}
                            </TouchableOpacity>
                            {i < filtered.length - 1 && <View style={styles.divider} />}
                          </React.Fragment>
                        );
                      })}
                    </GroupedCard>
                }
              </View>;
        })()}

        {/* Tab 2: Plan — swipeable when multiple days have plans */}
        {activeTab === 'plan' && (() => {
          const daysWithPlan = planDays.filter(({ key }) => MEAL_SLOTS.some(({ type }) => (mealPlan?.[key] || {})[type]));
          const isSwipeable = daysWithPlan.length > 1;
          // When not swipeable, always show today (offset 0)
          const activeDays = isSwipeable ? planDays : planDays.slice(0, 1);
          return (
          <View style={{ gap: 10 }}>
            <ScrollView
              ref={planScrollRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              scrollEventThrottle={16}
              scrollEnabled={isSwipeable}
              onMomentumScrollEnd={(e) => {
                const idx = Math.round(e.nativeEvent.contentOffset.x / planCardWidth);
                setPlanDayOffset(idx);
              }}
            >
              {activeDays.map(({ key, label, shortLabel, offset: dayIdx }) => {
                const dayPlan = mealPlan?.[key] || {};
                const dayHasMeals = MEAL_SLOTS.some(({ type }) => dayPlan[type]);
                const isToday = dayIdx === 0;
                const slotTimes = { breakfast: '8:00 AM', lunch: '12:30 PM', dinner: '7:00 PM' };
                const dayPlannedTotal = MEAL_SLOTS.reduce((sum, { type }) => {
                  const meal = dayPlan[type];
                  return sum + (meal?.calories || 0);
                }, 0);

                return (
                  <View key={key} style={{ width: planCardWidth }}>
                    {dayHasMeals ? (
                      <View style={{ backgroundColor: COLORS.card, borderRadius: RADIUS.xxl, overflow: 'hidden' }}>
                        {MEAL_SLOTS.map(({ type, emoji, label: slotLabel }, idx) => {
                          const meal = dayPlan[type];
                          const isCurrent = isToday && type === currentSlot;
                          const isEaten = isToday && eatenMeals[type];
                          const hasExpiring = meal && mealUsesExpiring(meal.name);
                          return (
                            <View key={type}>
                              {idx > 0 && <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: COLORS.border, marginLeft: 56 }} />}
                              <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: isCurrent ? COLORS.primary + '08' : 'transparent' }}>
                                <View style={{ width: 36, alignItems: 'center', marginRight: 12 }}>
                                  <Text style={{ fontSize: 18 }}>{emoji}</Text>
                                  <Text style={{ fontSize: 10, fontFamily: isCurrent ? FONTS.bodyBold : FONTS.body, color: isCurrent ? COLORS.primary : COLORS.textMuted, marginTop: 2 }}>{slotLabel}</Text>
                                </View>
                                {meal ? (
                                  <View style={{ flex: 1 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                      <Text style={{ fontSize: 18 }}>{meal.emoji}</Text>
                                      <Text style={{ fontSize: 14, fontFamily: FONTS.bodyMed, color: COLORS.text, flex: 1 }} numberOfLines={1}>{meal.name}</Text>
                                      {hasExpiring && <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.danger }} />}
                                    </View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 10 }}>
                                      <Text style={{ fontSize: 12, fontFamily: FONTS.body, color: COLORS.textMuted }}>{meal.calories ? `${meal.calories} kcal` : '— kcal'}</Text>
                                      {isToday && (isEaten ? (
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                          <Text style={{ fontSize: 12, color: COLORS.success }}>✓</Text>
                                          <Text style={{ fontSize: 12, fontFamily: FONTS.bodyMed, color: COLORS.success }}>Logged</Text>
                                        </View>
                                      ) : (
                                        <View style={{ flexDirection: 'row', gap: 8 }}>
                                          <TouchableOpacity onPress={() => logMeal(type, meal.calories)} style={{ backgroundColor: COLORS.primary + '15', borderRadius: RADIUS.full, paddingHorizontal: 10, paddingVertical: 4 }} activeOpacity={0.7}>
                                            <Text style={{ fontSize: 12, fontFamily: FONTS.bodyMed, color: COLORS.primary }}>Ate this</Text>
                                          </TouchableOpacity>
                                          <TouchableOpacity onPress={() => { hapticLight(); navigation.navigate('Recipes'); }} style={{ backgroundColor: COLORS.cardAlt ?? COLORS.bg, borderRadius: RADIUS.full, paddingHorizontal: 10, paddingVertical: 4 }} activeOpacity={0.7}>
                                            <Text style={{ fontSize: 12, fontFamily: FONTS.bodyMed, color: COLORS.textMuted }}>Something else</Text>
                                          </TouchableOpacity>
                                        </View>
                                      ))}
                                    </View>
                                  </View>
                                ) : (
                                  <TouchableOpacity style={{ flex: 1 }} onPress={() => { hapticLight(); navigation.navigate('Recipes', { screen: 'MealPlan' }); }} activeOpacity={0.7}>
                                    <Text style={{ fontSize: 13, fontFamily: FONTS.body, color: COLORS.textDim ?? COLORS.textMuted }}>+ Plan {type}</Text>
                                  </TouchableOpacity>
                                )}
                              </View>
                            </View>
                          );
                        })}
                        {/* Footer */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: COLORS.border }}>
                          <View style={{ flex: 1, flexDirection: 'row', gap: 5 }}>
                            {MEAL_SLOTS.map(({ type }) => (
                              <View key={type} style={{ flex: 1, height: 3, borderRadius: 2, backgroundColor: (isToday && eatenMeals[type]) ? COLORS.success : dayPlan[type] ? COLORS.primary + '40' : COLORS.cardAlt ?? COLORS.border }} />
                            ))}
                          </View>
                          <Text style={{ fontSize: 12, fontFamily: FONTS.body, color: COLORS.textMuted, marginLeft: 12 }}>
                            {isToday && goalEnabled
                              ? (calorieRemaining > 0 ? `${calorieRemaining.toLocaleString()} kcal left` : 'Over goal')
                              : (dayPlannedTotal > 0 ? `${dayPlannedTotal} kcal planned` : '')}
                            {isToday && goalEnabled && dayPlannedTotal > 0 ? ` · ${dayPlannedTotal} planned` : ''}
                          </Text>
                        </View>
                      </View>
                    ) : (
                      /* Empty / recommended */
                      (() => {
                        if (mealRecommendations.length === 0) return (
                          <GroupedCard>
                            <Text style={styles.emptyText}>No plan for {shortLabel}</Text>
                            <TouchableOpacity onPress={() => { hapticLight(); navigation.navigate('Recipes', { screen: 'MealPlan' }); }} style={{ alignSelf: 'center', backgroundColor: COLORS.primary + '15', borderRadius: RADIUS.full, paddingHorizontal: 14, paddingVertical: 6, marginBottom: 16 }} activeOpacity={0.7}>
                              <Text style={{ fontSize: 13, fontFamily: FONTS.bodyMed, color: COLORS.primary }}>Open planner</Text>
                            </TouchableOpacity>
                          </GroupedCard>
                        );
                        const recommended = MEAL_SLOTS.map(({ type, emoji, label: slotLabel }, i) => ({
                          type, emoji, label: slotLabel, recipe: mealRecommendations[i] || null, time: slotTimes[type],
                        }));
                        const totalCal = recommended.reduce((s, r) => s + (r.recipe?.nutrition?.calories || 0), 0);
                        const adoptDayPlan = () => {
                          hapticSuccess();
                          setMealPlan((prev) => ({
                            ...prev,
                            [key]: recommended.reduce((acc, { type, recipe, time }) => {
                              if (recipe) acc[type] = { name: recipe.name, emoji: recipe.emoji, time, calories: recipe.nutrition?.calories || 0 };
                              return acc;
                            }, {}),
                          }));
                        };
                        return (
                          <View style={{ gap: 12 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 2 }}>
                              <Text style={{ fontSize: 13, fontFamily: FONTS.bodyBold, color: COLORS.textMuted, letterSpacing: 0.5 }}>SUGGESTED FOR {shortLabel.toUpperCase()}</Text>
                              {totalCal > 0 && <Text style={{ fontSize: 12, fontFamily: FONTS.body, color: COLORS.textMuted }}>{totalCal.toLocaleString()} kcal</Text>}
                            </View>
                            <View style={{ backgroundColor: COLORS.card, borderRadius: RADIUS.xxl, overflow: 'hidden' }}>
                              {recommended.map(({ type, emoji, label: slotLabel, recipe, time }, idx) => (
                                <View key={type}>
                                  {idx > 0 && <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: COLORS.border, marginLeft: 56 }} />}
                                  <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 }}>
                                    <View style={{ width: 36, alignItems: 'center', marginRight: 12 }}>
                                      <Text style={{ fontSize: 18 }}>{emoji}</Text>
                                      <Text style={{ fontSize: 10, fontFamily: FONTS.body, color: COLORS.textMuted, marginTop: 2 }}>{slotLabel}</Text>
                                    </View>
                                    {recipe ? (
                                      <View style={{ flex: 1 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                          <Text style={{ fontSize: 18 }}>{recipe.emoji}</Text>
                                          <Text style={{ fontSize: 14, fontFamily: FONTS.bodyMed, color: COLORS.text, flex: 1 }} numberOfLines={1}>{recipe.name}</Text>
                                        </View>
                                        <Text style={{ fontSize: 12, fontFamily: FONTS.body, color: COLORS.textMuted, marginTop: 3 }}>{time} · {recipe.time}{recipe.nutrition?.calories ? ` · ${recipe.nutrition.calories} kcal` : ''}</Text>
                                      </View>
                                    ) : (
                                      <Text style={{ fontSize: 13, fontFamily: FONTS.body, color: COLORS.textDim ?? COLORS.textMuted }}>No suggestion</Text>
                                    )}
                                  </View>
                                </View>
                              ))}
                              <View style={{ borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: COLORS.border, padding: 12, flexDirection: 'row', gap: 8 }}>
                                <TouchableOpacity onPress={adoptDayPlan} style={{ flex: 1, backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, padding: 12, alignItems: 'center' }} activeOpacity={0.8}>
                                  <Text style={{ fontSize: 14, fontFamily: FONTS.bodyBold, color: '#fff' }}>Use this plan</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => { hapticLight(); navigation.navigate('Recipes', { screen: 'MealPlan' }); }} style={{ backgroundColor: COLORS.cardAlt ?? COLORS.bg, borderRadius: RADIUS.lg, padding: 12, paddingHorizontal: 16, alignItems: 'center' }} activeOpacity={0.7}>
                                  <Text style={{ fontSize: 14, fontFamily: FONTS.bodyMed, color: COLORS.textMuted }}>Edit</Text>
                                </TouchableOpacity>
                              </View>
                            </View>
                          </View>
                        );
                      })()
                    )}
                  </View>
                );
              })}
            </ScrollView>

            {/* Day dots — only when swipeable */}
            {isSwipeable && (
              <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 }}>
                {planDays.map((day, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => {
                      hapticLight();
                      setPlanDayOffset(i);
                      planScrollRef.current?.scrollTo({ x: i * planCardWidth, animated: true });
                    }}
                    hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                  >
                    <View style={{
                      width: i === planDayOffset ? 18 : 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: i === planDayOffset ? COLORS.primary : COLORS.border,
                    }} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
          );
        })()}

        {/* Tab 3: Expiring */}
        {activeTab === 'expiring' && (
          expiring.length === 0
            ? <GroupedCard><Text style={styles.emptyText}>No items expiring in {expiryThreshold} day{expiryThreshold === 1 ? '' : 's'}</Text></GroupedCard>
            : <GroupedCard>
                {expiring.map((item, i) => (
                  <React.Fragment key={item.id ?? i}>
                    <View style={styles.expiringRow}>
                      <Text style={styles.expiringEmoji}>{item.emoji}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.expiringName}>{item.name}</Text>
                        <Text style={styles.expiringQty}>{item.qty} {item.unit}</Text>
                      </View>
                      <ExpiryBadge days={item.expiryDays} />
                    </View>
                    {i < expiring.length - 1 && <View style={styles.divider} />}
                  </React.Fragment>
                ))}
              </GroupedCard>
        )}
      </Animated.View>

    </ScrollView>

    {/* Sticky compact tabs */}
    <Animated.View
      pointerEvents={isSticky ? 'auto' : 'none'}
      style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        paddingTop: 54, paddingHorizontal: 20, paddingBottom: 12,
        backgroundColor: COLORS.bg,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: COLORS.border,
        opacity: stickyAnim,
        transform: [{ translateY: stickyAnim.interpolate({ inputRange: [0, 1], outputRange: [-12, 0] }) }],
      }}
    >
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {[
          { id: 'quick', value: quickBiteCount, label: 'Bite', accent: quickBiteCount > 0 ? COLORS.success : null },
          { id: 'plan', value: MEAL_SLOTS.filter(({ type }) => (mealPlan?.[planDays[planDayOffset].key] || {})[type]).length, label: planDays[planDayOffset].shortLabel, accent: COLORS.primary },
          { id: 'expiring', value: expiring.length, label: `${expiryThreshold}d exp`, accent: expiring.length > 0 ? COLORS.danger : null },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          const activeColor = tab.accent || COLORS.primary;
          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => { hapticLight(); setActiveTab(tab.id); }}
              onLongPress={tab.id === 'expiring' ? () => { hapticMedium(); setDaysInput(String(expiryThreshold)); setShowDaysPopup(true); } : undefined}
              activeOpacity={0.75}
              style={{
                flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
                backgroundColor: COLORS.card,
                borderRadius: RADIUS.full,
                paddingVertical: 8, paddingHorizontal: 12,
                borderWidth: 1.5,
                borderColor: isActive ? activeColor : 'transparent',
              }}
            >
              <Text style={{ fontSize: 14, fontFamily: FONTS.bodyBold, color: isActive ? activeColor : COLORS.textMuted }}>
                {tab.value}
              </Text>
              <Text style={{ fontSize: 12, fontFamily: FONTS.bodyMed, color: isActive ? COLORS.text : COLORS.textMuted }}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </Animated.View>

    {/* Calorie edit popup */}
    <Modal visible={showCaloriePopup} transparent animationType="fade" onRequestClose={() => { setShowCaloriePopup(false); setCalorieError(''); }}>
      <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); setShowCaloriePopup(false); setCalorieError(''); }}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
              <View style={{ backgroundColor: COLORS.card, borderRadius: RADIUS.xxl, padding: 24, width: 300, gap: 16 }}>
                <Text style={{ fontSize: 17, fontFamily: FONTS.bodyBold, color: COLORS.text }}>Calories</Text>
                <View style={{ gap: 8 }}>
                  <Text style={{ fontSize: 13, fontFamily: FONTS.bodyMed, color: COLORS.textMuted }}>Today's intake</Text>
                  <TextInput
                    value={intakeInput}
                    onChangeText={(t) => { setIntakeInput(t); setCalorieError(''); }}
                    keyboardType="number-pad"
                    maxLength={5}
                    autoFocus
                    style={{ backgroundColor: COLORS.bg, borderRadius: RADIUS.lg, padding: 14, fontSize: 24, fontFamily: FONTS.display, color: COLORS.text, textAlign: 'center' }}
                  />
                </View>
                <View style={{ gap: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 13, fontFamily: FONTS.bodyMed, color: COLORS.textMuted }}>Daily goal</Text>
                    <Switch
                      value={goalEnabled}
                      onValueChange={setGoalEnabled}
                      trackColor={{ false: COLORS.cardAlt, true: COLORS.primary + '66' }}
                      thumbColor={goalEnabled ? COLORS.primary : COLORS.textMuted}
                    />
                  </View>
                  {goalEnabled && (
                    <TextInput
                      value={goalInput}
                      onChangeText={(t) => { setGoalInput(t); setCalorieError(''); }}
                      keyboardType="number-pad"
                      maxLength={5}
                      style={{ backgroundColor: COLORS.bg, borderRadius: RADIUS.lg, padding: 14, fontSize: 24, fontFamily: FONTS.display, color: COLORS.text, textAlign: 'center' }}
                    />
                  )}
                </View>
                {!!calorieError && (
                  <Text style={{ fontSize: 12, fontFamily: FONTS.bodyMed, color: COLORS.danger, textAlign: 'center', marginTop: -8 }}>{calorieError}</Text>
                )}
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TouchableOpacity
                    onPress={() => { setShowCaloriePopup(false); setCalorieError(''); }}
                    style={{ flex: 1, padding: 14, borderRadius: RADIUS.lg, backgroundColor: COLORS.bg, alignItems: 'center' }}
                  >
                    <Text style={{ fontFamily: FONTS.bodyMed, color: COLORS.textMuted }}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      const intake = parseInt(intakeInput, 10);
                      if (!intakeInput || isNaN(intake) || intake < 0 || intake > 99999) { setCalorieError('Intake must be between 0 and 99999.'); return; }
                      if (goalEnabled) {
                        const goal = parseInt(goalInput, 10);
                        if (!goalInput || isNaN(goal) || goal < 500 || goal > 9999) { setCalorieError('Goal must be between 500 and 9999.'); return; }
                        setCalorieGoal(goal);
                      }
                      setTodayCalories(intake);
                      setCalorieError('');
                      setShowCaloriePopup(false);
                    }}
                    style={{ flex: 1, padding: 14, borderRadius: RADIUS.lg, backgroundColor: COLORS.primary, alignItems: 'center' }}
                  >
                    <Text style={{ fontFamily: FONTS.bodyMed, color: '#fff' }}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>

    {/* Days threshold popup */}
    <Modal visible={showDaysPopup} transparent animationType="fade" onRequestClose={() => { setShowDaysPopup(false); setDaysError(''); }}>
      <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); setShowDaysPopup(false); setDaysError(''); }}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
              <View style={{ backgroundColor: COLORS.card, borderRadius: RADIUS.xxl, padding: 24, width: 280, gap: 16 }}>
                <Text style={{ fontSize: 17, fontFamily: FONTS.bodyBold, color: COLORS.text }}>Set Expiry Window</Text>
                <Text style={{ fontSize: 14, fontFamily: FONTS.body, color: COLORS.textMuted }}>Show items expiring within how many days?</Text>
                <TextInput
                  value={daysInput}
                  onChangeText={(t) => { setDaysInput(t); setDaysError(''); }}
                  keyboardType="number-pad"
                  maxLength={2}
                  autoFocus
                  style={{
                    backgroundColor: COLORS.bg, borderRadius: RADIUS.lg, padding: 14,
                    fontSize: 24, fontFamily: FONTS.display, color: COLORS.text, textAlign: 'center',
                    borderWidth: daysError ? 1.5 : 0, borderColor: COLORS.danger,
                  }}
                />
                {!!daysError && (
                  <Text style={{ fontSize: 12, fontFamily: FONTS.bodyMed, color: COLORS.danger, textAlign: 'center', marginTop: -8 }}>{daysError}</Text>
                )}
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TouchableOpacity
                    onPress={() => { setShowDaysPopup(false); setDaysError(''); }}
                    style={{ flex: 1, padding: 14, borderRadius: RADIUS.lg, backgroundColor: COLORS.bg, alignItems: 'center' }}
                  >
                    <Text style={{ fontFamily: FONTS.bodyMed, color: COLORS.textMuted }}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      const n = parseInt(daysInput, 10);
                      if (!daysInput || isNaN(n)) { setDaysError('Please enter a number between 1 and 30.'); return; }
                      if (n < 1 || n > 30) { setDaysError('Please set a value between 1 and 30.'); return; }
                      setExpiryThreshold(n);
                      setActiveTab('expiring');
                      setDaysError('');
                      setShowDaysPopup(false);
                    }}
                    style={{ flex: 1, padding: 14, borderRadius: RADIUS.lg, backgroundColor: COLORS.primary, alignItems: 'center' }}
                  >
                    <Text style={{ fontFamily: FONTS.bodyMed, color: '#fff' }}>Apply</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
    </>
  );
}
