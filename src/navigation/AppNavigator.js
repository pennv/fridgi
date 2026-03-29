import React, { useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Platform, PanResponder, Modal, TextInput, KeyboardAvoidingView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassView, isLiquidGlassAvailable, isGlassEffectAPIAvailable } from 'expo-glass-effect';

// isLiquidGlassAvailable may be a function or boolean depending on version
const glassSupported =
  Platform.OS === 'ios' &&
  (typeof isLiquidGlassAvailable === 'function'
    ? isLiquidGlassAvailable()
    : typeof isGlassEffectAPIAvailable === 'function'
    ? isGlassEffectAPIAvailable()
    : !!isLiquidGlassAvailable);
import { Ionicons } from '@expo/vector-icons';
import { FONTS, RADIUS } from '../theme';
import { useTheme } from '../context/ThemeContext';
// FABContext scroll-hide no longer drives the center FAB but screens still call useFABScroll harmlessly

import HomeScreen from '../screens/HomeScreen';
import KitchenScreen from '../screens/KitchenScreen';
import RecipesScreen from '../screens/RecipesScreen';
import RecipeDetailScreen from '../screens/RecipeDetailScreen';
import CookingModeScreen from '../screens/CookingModeScreen';
import MealPlanScreen from '../screens/MealPlanScreen';
import ShoppingScreen from '../screens/ShoppingScreen';
import ScanScreen from '../screens/ScanScreen';
import ProfileDrawer from '../screens/ProfileDrawer';
import AnalyticsScreen from '../screens/AnalyticsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const RecipeStack = createNativeStackNavigator();

const TAB_ICONS = {
  Home:     { icon: 'home',       label: 'Home' },
  Kitchen:  { icon: 'snow',       label: 'Kitchen' },
  Recipes:  { icon: 'restaurant', label: 'Recipes' },
  Shopping: { icon: 'cart',       label: 'Shopping' },
};

const BUBBLE_W = 50;
const BUBBLE_H = 50;

const makeStyles = (COLORS, isDark) => StyleSheet.create({
  tabBarOuter: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    borderRadius: 36,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: isDark ? 4 : 12 },
    shadowOpacity: isDark ? 0.35 : 0.22,
    shadowRadius: isDark ? 16 : 32,
    elevation: isDark ? 8 : 14,
  },
  tabBarBlur: {
    borderRadius: 36,
    overflow: 'hidden',
    borderWidth: isDark ? 0.5 : 0,
    borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'transparent',
  },
  tabBarInner: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 6,
    backgroundColor: isDark ? COLORS.bg + '0A' : 'rgba(255,255,255,0.4)',
    position: 'relative',
  },
  bubble: {
    position: 'absolute',
    overflow: 'hidden',
    backgroundColor: 'transparent',
    borderRadius: BUBBLE_H / 2,
  },
  bubbleTint: {
    backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
    borderRadius: BUBBLE_H / 2,
  },
  bubbleRim: {
    borderRadius: BUBBLE_H / 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: isDark ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.7)',
  },
  bubbleWeb: {
    borderRadius: BUBBLE_H / 2,
    backgroundColor: 'rgba(255,255,255,0.12)',
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    overflow: 'hidden',
  },
  tabBarWeb: {
    borderRadius: 36,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: COLORS.bg + '8C',
    backdropFilter: 'blur(24px) saturate(160%)',
    WebkitBackdropFilter: 'blur(24px) saturate(160%)',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  tabIconWrap: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 10,
    fontFamily: FONTS.bodyMed,
  },
});

// Per-platform glass fill for the bubble
function LiquidGlassBubble() {
  const { colors: COLORS, isDark } = useTheme();
  const styles = makeStyles(COLORS, isDark);
  const r = BUBBLE_H / 2;

  // iOS 26+ — true native Liquid Glass
  if (glassSupported && GlassView) {
    return (
      <GlassView
        style={[StyleSheet.absoluteFill, { borderRadius: r }]}
        glassEffectStyle="regular"
        colorScheme={isDark ? 'dark' : 'light'}
      />
    );
  }

  // Web — CSS backdrop-filter
  if (Platform.OS === 'web') {
    return (
      <View style={[StyleSheet.absoluteFill, styles.bubbleWeb]}>
        <LinearGradient
          colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.02)', 'transparent']}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: r }]}
        />
        <View style={[StyleSheet.absoluteFill, styles.bubbleRim]} />
      </View>
    );
  }

  // iOS / Android — BlurView + tint + specular highlight
  const blurTint = isDark
    ? (Platform.OS === 'ios' ? 'systemUltraThinMaterialDark' : 'dark')
    : (Platform.OS === 'ios' ? 'systemUltraThinMaterialLight' : 'light');
  const blurIntensity = Platform.OS === 'android' ? 16 : 20;
  return (
    <>
      <BlurView intensity={blurIntensity} tint={blurTint} style={[StyleSheet.absoluteFill, { borderRadius: r }]} />
      <View style={[StyleSheet.absoluteFill, styles.bubbleTint]} />
      <LinearGradient
        colors={
          isDark
            ? ['rgba(255,255,255,0.18)', 'rgba(255,255,255,0.02)', 'transparent']
            : ['rgba(255,255,255,0.6)', 'rgba(255,255,255,0.1)', 'transparent']
        }
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={[StyleSheet.absoluteFill, { borderRadius: r }]}
      />
      <View style={[StyleSheet.absoluteFill, styles.bubbleRim]} />
    </>
  );
}

// Per-platform glass background for the tab bar itself
function GlassBar({ children, style, ...props }) {
  const { colors: COLORS, isDark } = useTheme();
  const styles = makeStyles(COLORS, isDark);

  if (Platform.OS === 'web') {
    return (
      <View style={[style, styles.tabBarWeb]} {...props}>
        {children}
      </View>
    );
  }
  const blurTint = isDark ? 'dark' : 'light';
  return (
    <BlurView intensity={isDark ? 12 : 60} tint={blurTint} style={style} {...props}>
      {children}
    </BlurView>
  );
}

function TabItemAnimated({ icon, label, focused }) {
  const { colors: COLORS, isDark } = useTheme();
  const styles = makeStyles(COLORS, isDark);

  const activeColor = '#34C759';
  const inactiveColor = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.35)';

  return (
    <View style={styles.tabItem} pointerEvents="none">
      <View style={styles.tabIconWrap}>
        <Ionicons
          name={focused ? icon : `${icon}-outline`}
          size={20}
          color={focused ? activeColor : inactiveColor}
        />
      </View>
      <Text style={[styles.tabLabel, { color: focused ? activeColor : inactiveColor }]}>{label}</Text>
    </View>
  );
}

// ─── Action sheets (unified FAB modals, context-sorted) ─────────────────────

const FAB_ACTIONS = [
  { key: 'home', icon: '🍽', label: 'Log calories', sub: 'Track what you ate' },
  { key: 'kitchen', icon: '🧊', label: 'Add to kitchen', sub: 'Scan or manually add ingredients' },
  { key: 'shopping', icon: '🛒', label: 'Add to shopping', sub: 'Quick add an item to buy' },
  { key: 'recipes', icon: '📖', label: 'Save a recipe', sub: 'Save or generate recipes' },
];

const TAB_ACTION_ORDER = {
  Home:     ['home', 'kitchen', 'shopping', 'recipes'],
  Kitchen:  ['kitchen', 'shopping', 'home', 'recipes'],
  Recipes:  ['recipes', 'kitchen', 'home', 'shopping'],
  Shopping: ['shopping', 'kitchen', 'home', 'recipes'],
};

function ActionSheets({ sheet, setSheet, activeRoute, navigation, setShoppingList, addActivity }) {
  const { colors: COLORS } = useTheme();
  const [shopInput, setShopInput] = React.useState('');
  const [logInput, setLogInput] = React.useState('');

  const close = () => setSheet(null);

  const sheetRow = (icon, label, sub, onPress, premium = false) => (
    <TouchableOpacity
      key={label}
      onPress={() => { if (onPress) { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onPress(); } }}
      disabled={!onPress}
      style={{
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: COLORS.cardAlt ?? COLORS.bg,
        borderRadius: 16, padding: 16, marginBottom: 10,
        opacity: premium ? 0.5 : 1,
      }}
      activeOpacity={0.7}
    >
      <Text style={{ fontSize: 26, marginRight: 14 }}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: FONTS.bodyBold, fontSize: 15, color: COLORS.text }}>{label}</Text>
        <Text style={{ fontFamily: FONTS.body, fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>{sub}</Text>
      </View>
      {premium
        ? <View style={{ backgroundColor: '#FFD70033', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
            <Text style={{ fontFamily: FONTS.bodyBold, fontSize: 11, color: '#B8860B' }}>SOON</Text>
          </View>
        : <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
      }
    </TouchableOpacity>
  );

  const sheetWrap = (title, children) => (
    <Modal visible transparent animationType="slide" onRequestClose={close} statusBarTranslucent>
      <View style={{ flex: 1 }}>
        <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' }} onPress={close} activeOpacity={1} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={{ backgroundColor: COLORS.card, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40 }}>
            <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: COLORS.border, alignSelf: 'center', marginBottom: 20 }} />
            <Text style={{ fontFamily: FONTS.bodyBold, fontSize: 18, color: COLORS.text, marginBottom: 16 }}>{title}</Text>
            {children}
            <TouchableOpacity onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); close(); }}
              style={{ backgroundColor: COLORS.cardAlt ?? COLORS.bg, borderRadius: 16, padding: 16, alignItems: 'center', marginTop: 4 }}
              activeOpacity={0.7}
            >
              <Text style={{ fontFamily: FONTS.bodyMed, fontSize: 15, color: COLORS.textMuted }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );

  // Context-sorted action picker
  const sortedActions = React.useMemo(() => {
    const order = TAB_ACTION_ORDER[activeRoute] || TAB_ACTION_ORDER.Home;
    return order.map((key) => FAB_ACTIONS.find((a) => a.key === key));
  }, [activeRoute]);

  return (
    <>
      {/* Action picker — context-sorted by active tab */}
      {sheet === 'picker' && sheetWrap('Quick Actions', <>
        {sortedActions.map((action) =>
          sheetRow(action.icon, action.label, action.sub, () => setSheet(action.key))
        )}
      </>)}

      {/* Kitchen sub-sheet */}
      {sheet === 'kitchen' && sheetWrap('Add to Kitchen', <>
        {sheetRow('📷', 'Scan Receipt', 'Add multiple items from a receipt', () => { close(); navigation.navigate('Scan'); })}
        {sheetRow('📱', 'Barcode Scan', 'Scan a product barcode', () => { close(); navigation.navigate('Scan'); })}
        {sheetRow('✏️', 'Manual Add', 'Type in an ingredient by hand', () => { close(); navigation.navigate('Kitchen'); })}
        {sheetRow('✨', 'AI Add', 'Coming soon · Premium', null, true)}
      </>)}

      {/* Shopping input sheet */}
      {sheet === 'shopping' && sheetWrap('Add to Shopping List', <>
        <TextInput
          value={shopInput}
          onChangeText={setShopInput}
          placeholder="Item name…"
          placeholderTextColor={COLORS.textMuted}
          autoFocus
          style={{
            backgroundColor: COLORS.cardAlt ?? COLORS.bg,
            borderRadius: 14, padding: 16,
            fontSize: 16, fontFamily: FONTS.bodyMed, color: COLORS.text,
            marginBottom: 12,
          }}
        />
        <TouchableOpacity
          onPress={() => {
            if (!shopInput.trim()) return;
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShoppingList((prev) => [...prev, {
              id: `s${Date.now()}`, name: shopInput.trim(),
              qty: 1, unit: 'pc', category: 'Other',
              checked: false, source: 'manual', sourceLabel: null,
            }]);
            addActivity(`Added ${shopInput.trim()} to shopping list`, '🛒');
            setShopInput('');
            close();
          }}
          style={{ backgroundColor: COLORS.primary, borderRadius: 14, padding: 16, alignItems: 'center', marginBottom: 10 }}
          activeOpacity={0.8}
        >
          <Text style={{ fontFamily: FONTS.bodyBold, fontSize: 15, color: '#fff' }}>Add item</Text>
        </TouchableOpacity>
      </>)}

      {/* Calorie log sheet */}
      {sheet === 'home' && sheetWrap('Quick Log', <>
        <Text style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.textMuted, marginBottom: 12 }}>
          How many calories did you eat?
        </Text>
        <TextInput
          value={logInput}
          onChangeText={setLogInput}
          placeholder="e.g. 450"
          placeholderTextColor={COLORS.textMuted}
          keyboardType="number-pad"
          autoFocus
          style={{
            backgroundColor: COLORS.cardAlt ?? COLORS.bg,
            borderRadius: 14, padding: 16,
            fontSize: 28, fontFamily: FONTS.display, color: COLORS.text,
            textAlign: 'center', marginBottom: 12,
          }}
        />
        <TouchableOpacity
          onPress={() => {
            if (!logInput.trim()) return;
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            addActivity(`Logged ${logInput} kcal`, '🍽');
            setLogInput('');
            close();
          }}
          style={{ backgroundColor: '#34C759', borderRadius: 14, padding: 16, alignItems: 'center', marginBottom: 10 }}
          activeOpacity={0.8}
        >
          <Text style={{ fontFamily: FONTS.bodyBold, fontSize: 15, color: '#fff' }}>Log</Text>
        </TouchableOpacity>
      </>)}

      {/* Recipes sub-sheet */}
      {sheet === 'recipes' && sheetWrap('Save a Recipe', <>
        {sheetRow('✏️', 'Enter manually', 'Type in your own recipe', null, true)}
        {sheetRow('📷', 'Scan from photo', 'Extract recipe from an image', null, true)}
        {sheetRow('✨', 'AI generate', 'Generate from your ingredients', null, true)}
      </>)}
    </>
  );
}

// ─── Glass tab bar with center FAB ───────────────────────────────────────────

function GlassTabBar({ state, descriptors, navigation, setFridgeItems, setShoppingList, addActivity }) {
  const { colors: COLORS, isDark } = useTheme();
  const styles = makeStyles(COLORS, isDark);

  const [innerHeight, setInnerHeight] = React.useState(0);
  const count = state.routes.length; // 4 tabs
  const visualCount = count + 1; // 5 visual slots (4 tabs + center FAB)
  const tabToVisual = (idx) => idx < 2 ? idx : idx + 1;
  const visualToTab = (vis) => vis < 2 ? vis : vis === 2 ? -1 : vis - 1;

  // Use refs so PanResponder always reads fresh values
  const tabWidthRef = useRef(0);
  const currentIndexRef = useRef(state.index);
  const bubbleStartXRef = useRef(0);
  React.useEffect(() => { currentIndexRef.current = state.index; }, [state.index]);

  const bubblePixelX = useRef(new Animated.Value(0)).current;
  const bubbleScaleX = useRef(new Animated.Value(1)).current;
  const [tabWidth, setTabWidth] = React.useState(0);

  // Center FAB state
  const [sheet, setSheet] = React.useState(null);
  const fabScale = useRef(new Animated.Value(1)).current;
  const activeRoute = state.routes[state.index]?.name;
  const openSheet = () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setSheet('picker'); };
  const onFabPressIn = () => Animated.spring(fabScale, { toValue: 0.88, speed: 50, bounciness: 0, useNativeDriver: true }).start();
  const onFabPressOut = () => Animated.spring(fabScale, { toValue: 1, speed: 20, bounciness: 12, useNativeDriver: true }).start();

  const snapToIndex = (index, stretch = true) => {
    const tw = tabWidthRef.current;
    if (!tw) return;
    const visualIdx = tabToVisual(index);
    Animated.parallel([
      Animated.spring(bubblePixelX, {
        toValue: visualIdx * tw,
        useNativeDriver: true,
        damping: 22,
        stiffness: 200,
        mass: 0.9,
      }),
      stretch
        ? Animated.sequence([
            Animated.timing(bubbleScaleX, { toValue: 1.5, duration: 120, useNativeDriver: true }),
            Animated.spring(bubbleScaleX, { toValue: 1, damping: 14, stiffness: 220, useNativeDriver: true }),
          ])
        : Animated.spring(bubbleScaleX, { toValue: 1, damping: 20, stiffness: 300, useNativeDriver: true }),
    ]).start();
  };

  React.useEffect(() => { snapToIndex(state.index); }, [state.index, tabWidth]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (e) => {
        const tw = tabWidthRef.current;
        if (!tw) return true;
        const vis = Math.floor((e.nativeEvent.pageX - 6) / tw);
        if (vis === 2) return false; // center FAB — let button handle touch
        return true;
      },
      onPanResponderGrant: (e, g) => {
        bubblePixelX.stopAnimation();
        bubbleScaleX.stopAnimation();
        const tw = tabWidthRef.current;
        if (!tw) return;
        const touchedVisual = Math.max(0, Math.min(Math.floor((g.x0 - 6) / tw), count));
        if (touchedVisual === 2) return;
        const snapX = touchedVisual * tw;
        bubblePixelX.setValue(snapX);
        bubbleStartXRef.current = snapX;
      },
      onPanResponderMove: (_, g) => {
        const tw = tabWidthRef.current;
        if (!tw) return;
        const newX = Math.max(0, Math.min(bubbleStartXRef.current + g.dx, count * tw));
        bubblePixelX.setValue(newX);
        bubbleScaleX.setValue(1 + Math.min(Math.abs(g.dx) / (tw * 2), 0.4));
      },
      onPanResponderRelease: (e, g) => {
        const tw = tabWidthRef.current;
        if (!tw) return;
        if (Math.abs(g.dx) < 8) {
          const tappedVisual = Math.max(0, Math.min(Math.floor((g.x0 - 6) / tw), count));
          if (tappedVisual === 2) return;
          const tabIdx = visualToTab(tappedVisual);
          if (tabIdx >= 0) navigation.navigate(state.routes[tabIdx].name);
        } else {
          const movedX = bubbleStartXRef.current + g.dx;
          let nearestVisual = Math.round(Math.max(0, Math.min(movedX / tw, count)));
          if (nearestVisual === 2) nearestVisual = g.dx > 0 ? 3 : 1;
          const tabIdx = visualToTab(nearestVisual);
          if (tabIdx >= 0) navigation.navigate(state.routes[tabIdx].name);
        }
      },
    })
  ).current;

  const bubbleTop = innerHeight > 0 ? (innerHeight - BUBBLE_H) / 2 : 4;

  return (
    <>
    <View style={styles.tabBarOuter} pointerEvents="box-none">
      <GlassBar style={styles.tabBarBlur}>
        <View
          {...panResponder.panHandlers}
          style={styles.tabBarInner}
          onLayout={(e) => {
            const w = (e.nativeEvent.layout.width - 12) / visualCount;
            tabWidthRef.current = w;
            bubblePixelX.setValue(tabToVisual(currentIndexRef.current) * w);
            setTabWidth(w);
            setInnerHeight(e.nativeEvent.layout.height);
          }}
        >
          {tabWidth > 0 && (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.bubble,
                {
                  width: BUBBLE_W,
                  height: BUBBLE_H,
                  top: bubbleTop,
                  left: 6 + (tabWidth - BUBBLE_W) / 2,
                  borderRadius: BUBBLE_H / 2,
                  transform: [{ translateX: bubblePixelX }, { scaleX: bubbleScaleX }],
                },
              ]}
            >
              <LiquidGlassBubble />
            </Animated.View>
          )}

          {state.routes.map((route, index) => {
            const focused = state.index === index;
            const label = TAB_ICONS[route.name]?.label ?? route.name;
            const icon = TAB_ICONS[route.name]?.icon ?? 'circle';
            return (
              <React.Fragment key={route.key}>
                {index === 2 && (
                  <View style={styles.tabItem}>
                    <Animated.View style={{ transform: [{ scale: fabScale }] }}>
                      <TouchableOpacity
                        onPress={openSheet}
                        onPressIn={onFabPressIn}
                        onPressOut={onFabPressOut}
                        activeOpacity={0.85}
                        style={{
                          width: 44, height: 44, borderRadius: 22,
                          backgroundColor: COLORS.primary,
                          justifyContent: 'center', alignItems: 'center',
                        }}
                      >
                        <Ionicons name="add" size={26} color="#fff" />
                      </TouchableOpacity>
                    </Animated.View>
                  </View>
                )}
                <TabItemAnimated icon={icon} label={label} focused={focused} />
              </React.Fragment>
            );
          })}
        </View>
      </GlassBar>
    </View>

    <ActionSheets
      sheet={sheet}
      setSheet={setSheet}
      activeRoute={activeRoute}
      navigation={navigation}
      setShoppingList={setShoppingList}
      addActivity={addActivity}
    />
    </>
  );
}

function TabIcon({ name, focused, badge }) {
  const { colors: COLORS, isDark } = useTheme();
  const styles = makeStyles(COLORS, isDark);

  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scale, { toValue: 0.88, speed: 50, bounciness: 0, useNativeDriver: true }).start();
  };
  const onPressOut = () => {
    Animated.spring(scale, { toValue: 1, speed: 20, bounciness: 12, useNativeDriver: true }).start();
  };

  return (
    <Animated.View
      style={[
        styles.tabIconWrap,
        focused && styles.tabIconActive,
        { transform: [{ scale }] },
      ]}
      onTouchStart={onPressIn}
      onTouchEnd={onPressOut}
    >
      <Text style={styles.tabEmoji}>{TAB_ICONS[name]?.default || '📱'}</Text>
      {badge > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
    </Animated.View>
  );
}

function RecipesStackNavigator(props) {
  const {
    fridgeItems, setFridgeItems, savedRecipes, setSavedRecipes,
    shoppingList, setShoppingList, mealPlan, setMealPlan, addActivity,
  } = props;

  return (
    <RecipeStack.Navigator screenOptions={{ headerShown: false }}>
      <RecipeStack.Screen name="RecipesList">
        {(navProps) => (
          <RecipesScreen
            {...navProps}
            fridgeItems={fridgeItems}
            savedRecipes={savedRecipes}
            setSavedRecipes={setSavedRecipes}
            mealPlan={mealPlan}
            setMealPlan={setMealPlan}
            addActivity={addActivity}
          />
        )}
      </RecipeStack.Screen>
      <RecipeStack.Screen name="MealPlan">
        {(navProps) => (
          <MealPlanScreen
            {...navProps}
            mealPlan={mealPlan}
            setMealPlan={setMealPlan}
            addActivity={addActivity}
          />
        )}
      </RecipeStack.Screen>
      <RecipeStack.Screen name="RecipeDetail">
        {(navProps) => (
          <RecipeDetailScreen
            {...navProps}
            savedRecipes={savedRecipes}
            setSavedRecipes={setSavedRecipes}
            shoppingList={shoppingList}
            setShoppingList={setShoppingList}
            fridgeItems={fridgeItems}
            setFridgeItems={setFridgeItems}
            addActivity={addActivity}
          />
        )}
      </RecipeStack.Screen>
      <RecipeStack.Screen
        name="CookingMode"
        options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }}
      >
        {(navProps) => (
          <CookingModeScreen
            {...navProps}
            fridgeItems={fridgeItems}
            setFridgeItems={setFridgeItems}
            addActivity={addActivity}
          />
        )}
      </RecipeStack.Screen>
    </RecipeStack.Navigator>
  );
}

function TabNavigator(props) {
  const {
    fridgeItems, setFridgeItems, shoppingList, setShoppingList,
    mealPlan, setMealPlan, savedRecipes, setSavedRecipes,
    activityFeed, addActivity, userProfile,
  } = props;

  const uncheckedCount = shoppingList.filter((i) => !i.checked).length;

  return (
    <Tab.Navigator
      initialRouteName="Home"
      tabBar={(tabProps) => (
        <GlassTabBar
          {...tabProps}
          setFridgeItems={setFridgeItems}
          setShoppingList={setShoppingList}
          addActivity={addActivity}
        />
      )}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home">
        {(navProps) => (
          <HomeScreen
            {...navProps}
            fridgeItems={fridgeItems}
            mealPlan={mealPlan}
            setMealPlan={setMealPlan}
            savedRecipes={savedRecipes}
            activityFeed={activityFeed}
            userProfile={userProfile}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="Kitchen">
        {(navProps) => (
          <KitchenScreen
            {...navProps}
            fridgeItems={fridgeItems}
            setFridgeItems={setFridgeItems}
            shoppingList={shoppingList}
            setShoppingList={setShoppingList}
            addActivity={addActivity}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="Recipes">
        {(navProps) => (
          <RecipesStackNavigator
            {...navProps}
            fridgeItems={fridgeItems}
            setFridgeItems={setFridgeItems}
            savedRecipes={savedRecipes}
            setSavedRecipes={setSavedRecipes}
            shoppingList={shoppingList}
            setShoppingList={setShoppingList}
            mealPlan={mealPlan}
            setMealPlan={setMealPlan}
            addActivity={addActivity}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="Shopping">
        {(navProps) => (
          <ShoppingScreen
            {...navProps}
            shoppingList={shoppingList}
            setShoppingList={setShoppingList}
            fridgeItems={fridgeItems}
            addActivity={addActivity}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export default function AppNavigator(props) {
  const {
    fridgeItems, setFridgeItems, shoppingList, setShoppingList,
    mealPlan, setMealPlan, savedRecipes, setSavedRecipes,
    activityFeed, addActivity, userProfile, setUserProfile,
  } = props;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Tabs">
          {(navProps) => (
            <TabNavigator
              {...navProps}
              fridgeItems={fridgeItems}
              setFridgeItems={setFridgeItems}
              shoppingList={shoppingList}
              setShoppingList={setShoppingList}
              mealPlan={mealPlan}
              setMealPlan={setMealPlan}
              savedRecipes={savedRecipes}
              setSavedRecipes={setSavedRecipes}
              activityFeed={activityFeed}
              addActivity={addActivity}
              userProfile={userProfile}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="Profile" options={{ animation: 'slide_from_right' }}>
          {(navProps) => (
            <ProfileDrawer
              {...navProps}
              userProfile={userProfile}
              setUserProfile={setUserProfile}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="Analytics" options={{ animation: 'slide_from_right' }}>
          {(navProps) => (
            <AnalyticsScreen
              {...navProps}
              fridgeItems={fridgeItems}
              shoppingList={shoppingList}
            />
          )}
        </Stack.Screen>
        <Stack.Screen
          name="Scan"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        >
          {(navProps) => (
            <ScanScreen
              {...navProps}
              setFridgeItems={setFridgeItems}
              addActivity={addActivity}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
