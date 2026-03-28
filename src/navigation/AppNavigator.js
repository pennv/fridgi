import React, { useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Platform, PanResponder, Modal } from 'react-native';
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
  Home:     { icon: 'home',               label: 'Home' },
  Kitchen:  { icon: 'snow',               label: 'Kitchen' },
  Recipes:  { icon: 'restaurant',         label: 'Recipes' },
  MealPlan: { icon: 'calendar',           label: 'Plan' },
  Shopping: { icon: 'cart',               label: 'Shopping' },
};

const BUBBLE_W = 50;
const BUBBLE_H = 50;
const FAB_INDEX = 2; // center tab index

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
    backgroundColor: isDark ? COLORS.bg + '26' : 'rgba(255,255,255,0.4)',
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
    <BlurView intensity={isDark ? 30 : 60} tint={blurTint} style={style} {...props}>
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

function GlassTabBar({ state, descriptors, navigation }) {
  const { colors: COLORS, isDark } = useTheme();
  const styles = makeStyles(COLORS, isDark);

  const [innerHeight, setInnerHeight] = React.useState(0);
  const [fabOpen, setFabOpen] = React.useState(false);
  const count = state.routes.length;

  // Use refs so PanResponder always reads fresh values
  const tabWidthRef = useRef(0);
  const currentIndexRef = useRef(state.index);
  const bubbleStartXRef = useRef(0);
  React.useEffect(() => { currentIndexRef.current = state.index; }, [state.index]);

  const bubblePixelX = useRef(new Animated.Value(0)).current;
  const bubbleScaleX = useRef(new Animated.Value(1)).current;
  // For re-render when tabWidth changes
  const [tabWidth, setTabWidth] = React.useState(0);

  const snapToIndex = (index, stretch = true) => {
    const tw = tabWidthRef.current;
    if (!tw) return;
    Animated.parallel([
      Animated.spring(bubblePixelX, {
        toValue: index * tw,
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
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (e, g) => {
        bubblePixelX.stopAnimation();
        bubbleScaleX.stopAnimation();
        const tw = tabWidthRef.current;
        if (!tw) return;
        // Snap bubble to the tab the finger is touching, then drag from there
        const touchedIndex = Math.max(0, Math.min(Math.floor((g.x0 - 6) / tw), count - 1));
        const snapX = touchedIndex * tw;
        bubblePixelX.setValue(snapX);
        bubbleStartXRef.current = snapX;
      },
      onPanResponderMove: (_, g) => {
        const tw = tabWidthRef.current;
        if (!tw) return;
        const newX = Math.max(0, Math.min(bubbleStartXRef.current + g.dx, (count - 1) * tw));
        bubblePixelX.setValue(newX);
        bubbleScaleX.setValue(1 + Math.min(Math.abs(g.dx) / (tw * 2), 0.4));
      },
      onPanResponderRelease: (e, g) => {
        const tw = tabWidthRef.current;
        if (!tw) return;
        if (Math.abs(g.dx) < 8) {
          // Tap
          const tappedIndex = Math.max(0, Math.min(Math.floor((g.x0 - 6) / tw), count - 1));
          if (tappedIndex === FAB_INDEX) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setFabOpen(true);
          } else {
            navigation.navigate(state.routes[tappedIndex].name);
          }
        } else {
          // Drag — snap to nearest, skip FAB position
          const movedX = bubbleStartXRef.current + g.dx;
          const nearest = Math.round(Math.max(0, Math.min(movedX / tw, count - 1)));
          if (nearest !== FAB_INDEX) {
            navigation.navigate(state.routes[nearest].name);
          }
        }
      },
    })
  ).current;

  const bubbleTop = innerHeight > 0 ? (innerHeight - BUBBLE_H) / 2 : 4;

  return (
    <View style={styles.tabBarOuter} pointerEvents="box-none">
      <GlassBar style={styles.tabBarBlur}>
        <View
          {...panResponder.panHandlers}
          style={styles.tabBarInner}
          onLayout={(e) => {
            const w = (e.nativeEvent.layout.width - 12) / count;
            tabWidthRef.current = w;
            bubblePixelX.setValue(currentIndexRef.current * w);
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
            if (index === FAB_INDEX) {
              return (
                <View key={route.key} style={styles.tabItem} pointerEvents="none">
                  <View style={{
                    width: 50, height: 50, borderRadius: 25,
                    backgroundColor: '#34C759',
                    justifyContent: 'center', alignItems: 'center',
                    shadowColor: '#34C759',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.4,
                    shadowRadius: 8,
                    elevation: 6,
                  }}>
                    <Ionicons name="add" size={28} color="#fff" />
                  </View>
                </View>
              );
            }
            const focused = state.index === index;
            const label = TAB_ICONS[route.name]?.label ?? route.name;
            const icon = TAB_ICONS[route.name]?.icon ?? 'circle';
            return (
              <TabItemAnimated key={route.key} icon={icon} label={label} focused={focused} />
            );
          })}
        </View>
      </GlassBar>

      {/* Action Sheet Modal */}
      <Modal
        visible={fabOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setFabOpen(false)}
        statusBarTranslucent
      >
        <View style={{ flex: 1 }}>
          <TouchableOpacity
            style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' }}
            onPress={() => setFabOpen(false)}
            activeOpacity={1}
          />
          <View style={{
            backgroundColor: COLORS.card,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: 40,
          }}>
            {/* Handle bar */}
            <View style={{
              width: 36, height: 4, borderRadius: 2,
              backgroundColor: COLORS.border,
              alignSelf: 'center', marginBottom: 20,
            }} />
            <Text style={{ fontFamily: FONTS.bodyBold, fontSize: 18, color: COLORS.text, marginBottom: 16 }}>
              Add to Kitchen
            </Text>
            {[
              { icon: '📷', label: 'Scan Receipt',   sub: 'Add multiple items from a receipt',  onPress: () => { setFabOpen(false); navigation.navigate('Scan'); } },
              { icon: '📱', label: 'Barcode Scan',   sub: 'Scan a product barcode',             onPress: () => { setFabOpen(false); navigation.navigate('Scan'); } },
              { icon: '✏️', label: 'Manual Add',     sub: 'Type in an ingredient by hand',      onPress: () => { setFabOpen(false); navigation.navigate(state.routes[0].name); } },
              { icon: '✨', label: 'AI Add',         sub: 'Coming soon · Premium',              onPress: null, premium: true },
            ].map((action, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => { if (action.onPress) { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); action.onPress(); } }}
                disabled={!action.onPress}
                style={{
                  flexDirection: 'row', alignItems: 'center',
                  backgroundColor: COLORS.cardAlt ?? COLORS.bg,
                  borderRadius: 16, padding: 16, marginBottom: 10,
                  opacity: action.premium ? 0.5 : 1,
                }}
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: 26, marginRight: 14 }}>{action.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: FONTS.bodyBold, fontSize: 15, color: COLORS.text }}>{action.label}</Text>
                  <Text style={{ fontFamily: FONTS.body, fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>{action.sub}</Text>
                </View>
                {!action.premium && (
                  <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
                )}
                {action.premium && (
                  <View style={{ backgroundColor: '#FFD700' + '33', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                    <Text style={{ fontFamily: FONTS.bodyBold, fontSize: 11, color: '#B8860B' }}>SOON</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setFabOpen(false); }}
              style={{
                backgroundColor: COLORS.cardAlt ?? COLORS.bg,
                borderRadius: 16, padding: 16, alignItems: 'center', marginTop: 4,
              }}
              activeOpacity={0.7}
            >
              <Text style={{ fontFamily: FONTS.bodyMed, fontSize: 15, color: COLORS.textMuted }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
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
    shoppingList, setShoppingList, addActivity,
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
      tabBar={(props) => <GlassTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
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
      <Tab.Screen name="MealPlan" options={{ tabBarLabel: 'Plan' }}>
        {(navProps) => (
          <MealPlanScreen
            {...navProps}
            mealPlan={mealPlan}
            setMealPlan={setMealPlan}
            addActivity={addActivity}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="Home">
        {(navProps) => (
          <HomeScreen
            {...navProps}
            fridgeItems={fridgeItems}
            mealPlan={mealPlan}
            activityFeed={activityFeed}
            userProfile={userProfile}
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
