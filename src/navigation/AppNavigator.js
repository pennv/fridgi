import React, { useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { COLORS, FONTS, RADIUS } from '../theme';

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
  Home: { default: '🏠', label: 'Home' },
  Kitchen: { default: '🧊', label: 'Kitchen' },
  Recipes: { default: '📖', label: 'Recipes' },
  MealPlan: { default: '📅', label: 'Plan' },
  Shopping: { default: '🛒', label: 'Shopping' },
};

function TabIcon({ name, focused, badge }) {
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
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: true,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textDim,
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: FONTS.bodyMed,
          marginTop: -2,
        },
        tabBarIcon: ({ focused }) => (
          <TabIcon
            name={route.name}
            focused={focused}
            badge={route.name === 'Shopping' ? uncheckedCount : 0}
          />
        ),
      })}
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

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.card,
    borderTopWidth: 0,
    height: 88,
    paddingBottom: 20,
    paddingTop: 8,
    paddingHorizontal: 4,
    marginHorizontal: 12,
    marginBottom: 16,
    borderRadius: RADIUS.xxl,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 0,
    shadowOpacity: 0,
  },
  tabIconWrap: {
    width: 40,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabIconActive: {
    backgroundColor: COLORS.primary + '22',
  },
  tabEmoji: {
    fontSize: 20,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: COLORS.danger,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: COLORS.card,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: FONTS.bodyBold,
    color: '#fff',
  },
});
