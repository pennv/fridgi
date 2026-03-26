import React, { useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Platform, PanResponder } from 'react-native';
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

const makeStyles = (COLORS) => StyleSheet.create({
  tabBarOuter: {
    position: 'absolute',
    bottom: 16,
    left: 12,
    right: 12,
    borderRadius: 40,
    overflow: 'hidden',
  },
  tabBarBlur: {
    borderRadius: 40,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  tabBarInner: {
    flexDirection: 'row',
    paddingTop: 5,
    paddingBottom: Platform.OS === 'ios' ? 14 : 5,
    paddingHorizontal: 4,
    backgroundColor: COLORS.bg + '26',
    position: 'relative',
  },
  bubble: {
    position: 'absolute',
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  bubbleTint: {
    backgroundColor: 'rgba(160,185,255,0.08)',
    borderRadius: 999,
  },
  bubbleRim: {
    borderRadius: 999,
    borderWidth: 0.8,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  // Web: CSS backdrop-filter via RN Web style prop
  bubbleWeb: {
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.1)',
    // @ts-ignore — web-only style
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    overflow: 'hidden',
  },
  tabBarWeb: {
    borderRadius: 40,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: COLORS.bg + '8C',
    // @ts-ignore — web-only
    backdropFilter: 'blur(24px) saturate(160%)',
    WebkitBackdropFilter: 'blur(24px) saturate(160%)',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  tabIconWrap: {
    width: 36,
    height: 28,
    borderRadius: 14,
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
  const styles = makeStyles(COLORS);

  // iOS 26+ — true native Liquid Glass
  if (glassSupported && GlassView) {
    return (
      <GlassView
        style={StyleSheet.absoluteFill}
        glassEffectStyle="regular"
        colorScheme={isDark ? 'dark' : 'light'}
      />
    );
  }

  // Web — CSS backdrop-filter (widely supported)
  if (Platform.OS === 'web') {
    return (
      <View style={[StyleSheet.absoluteFill, styles.bubbleWeb]}>
        <LinearGradient
          colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.04)', 'transparent']}
          start={{ x: 0.15, y: 0 }}
          end={{ x: 0.85, y: 0.55 }}
          style={[StyleSheet.absoluteFill, { borderRadius: 999 }]}
        />
        <View style={[StyleSheet.absoluteFill, styles.bubbleRim]} />
      </View>
    );
  }

  // Android 12+ and older iOS — BlurView + gradient layers
  const blurTint = Platform.OS === 'android' ? 'dark' : 'systemUltraThinMaterialDark';
  const blurIntensity = Platform.OS === 'android' ? 18 : 22;
  return (
    <>
      <BlurView intensity={blurIntensity} tint={blurTint} style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, styles.bubbleTint]} />
      <LinearGradient
        colors={['rgba(255,255,255,0.26)', 'rgba(255,255,255,0.04)', 'transparent']}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.85, y: 0.55 }}
        style={[StyleSheet.absoluteFill, { borderRadius: 999 }]}
      />
      <View style={[StyleSheet.absoluteFill, styles.bubbleRim]} />
    </>
  );
}

// Per-platform glass background for the tab bar itself
function GlassBar({ children, style, ...props }) {
  const { colors: COLORS, isDark } = useTheme();
  const styles = makeStyles(COLORS);

  if (Platform.OS === 'web') {
    return (
      <View style={[style, styles.tabBarWeb]} {...props}>
        {children}
      </View>
    );
  }
  const blurTint = isDark ? 'dark' : 'light';
  return (
    <BlurView intensity={30} tint={blurTint} style={style} {...props}>
      {children}
    </BlurView>
  );
}

function TabItemAnimated({ icon, label, focused }) {
  const { colors: COLORS } = useTheme();
  const styles = makeStyles(COLORS);

  const scale = useRef(new Animated.Value(focused ? 1.3 : 1)).current;

  React.useEffect(() => {
    Animated.spring(scale, {
      toValue: focused ? 1.3 : 1,
      useNativeDriver: true,
      damping: 14,
      stiffness: 200,
      mass: 0.6,
    }).start();
  }, [focused]);

  return (
    <View style={styles.tabItem} pointerEvents="none">
      <Animated.View style={[styles.tabIconWrap, { transform: [{ scale }] }]}>
        <Ionicons
          name={focused ? icon : `${icon}-outline`}
          size={22}
          color={focused ? COLORS.primary : COLORS.textDim}
        />
      </Animated.View>
      <Text style={[styles.tabLabel, { color: focused ? COLORS.primary : COLORS.textDim }]}>{label}</Text>
    </View>
  );
}

function GlassTabBar({ state, descriptors, navigation }) {
  const { colors: COLORS } = useTheme();
  const styles = makeStyles(COLORS);

  const [innerHeight, setInnerHeight] = React.useState(0);
  const count = state.routes.length;
  const BUBBLE_SIZE = 58;

  // Use refs so PanResponder always reads fresh values
  const tabWidthRef = useRef(0);
  const currentIndexRef = useRef(state.index);
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
  React.useEffect(() => {
    if (tabWidthRef.current) bubblePixelX.setValue(state.index * tabWidthRef.current);
  }, [tabWidth]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        bubblePixelX.stopAnimation();
        bubbleScaleX.stopAnimation();
      },
      onPanResponderMove: (_, g) => {
        const tw = tabWidthRef.current;
        if (!tw) return;
        const baseX = currentIndexRef.current * tw;
        const newX = Math.max(0, Math.min(baseX + g.dx, (count - 1) * tw));
        bubblePixelX.setValue(newX);
        bubbleScaleX.setValue(1 + Math.min(Math.abs(g.dx) / (tw * 2), 0.4));
      },
      onPanResponderRelease: (e, g) => {
        const tw = tabWidthRef.current;
        if (!tw) return;
        if (Math.abs(g.dx) < 8) {
          // Tap — determine which tab was touched by x position
          const tappedIndex = Math.max(0, Math.min(Math.floor(g.x0 / tw), count - 1));
          navigation.navigate(state.routes[tappedIndex].name);
        } else {
          // Drag — snap to nearest
          const movedX = currentIndexRef.current * tw + g.dx;
          const nearest = Math.round(Math.max(0, Math.min(movedX / tw, count - 1)));
          navigation.navigate(state.routes[nearest].name);
        }
      },
    })
  ).current;

  const bubbleTop = innerHeight > 0 ? (innerHeight - BUBBLE_SIZE) / 2 - (Platform.OS === 'ios' ? 8 : 0) : 4;

  return (
    <View style={styles.tabBarOuter} pointerEvents="box-none">
      <GlassBar style={styles.tabBarBlur}>
        <View
          {...panResponder.panHandlers}
          style={styles.tabBarInner}
          onLayout={(e) => {
            const w = e.nativeEvent.layout.width / count;
            tabWidthRef.current = w;
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
                  width: BUBBLE_SIZE,
                  height: BUBBLE_SIZE,
                  borderRadius: BUBBLE_SIZE / 2,
                  top: bubbleTop,
                  left: (tabWidth - BUBBLE_SIZE) / 2,
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
              <TabItemAnimated key={route.key} icon={icon} label={label} focused={focused} />
            );
          })}
        </View>
      </GlassBar>
    </View>
  );
}

function TabIcon({ name, focused, badge }) {
  const { colors: COLORS } = useTheme();
  const styles = makeStyles(COLORS);

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
