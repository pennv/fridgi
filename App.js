import React, { useState, useCallback } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';

import { DARK_COLORS } from './src/theme';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import {
  INITIAL_FRIDGE_ITEMS,
  INITIAL_SHOPPING_LIST,
  INITIAL_MEAL_PLAN,
  INITIAL_ACTIVITY,
} from './src/data';

import AppNavigator from './src/navigation/AppNavigator';

function AppInner() {
  const { isDark } = useTheme();

  const [fridgeItems, setFridgeItems] = useState(INITIAL_FRIDGE_ITEMS);
  const [shoppingList, setShoppingList] = useState(INITIAL_SHOPPING_LIST);
  const [mealPlan, setMealPlan] = useState(INITIAL_MEAL_PLAN);
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [activityFeed, setActivityFeed] = useState(INITIAL_ACTIVITY);
  const [userProfile, setUserProfile] = useState({
    name: '',
    household: 2,
    servings: 4,
    dietaryPrefs: [],
  });

  const addActivity = useCallback((text, icon) => {
    setActivityFeed((prev) => [
      { id: 'a' + Date.now(), text, time: 'Just now', icon },
      ...prev.slice(0, 9),
    ]);
  }, []);

  return (
    <>
      <AppNavigator
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
        setUserProfile={setUserProfile}
      />
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={DARK_COLORS.primary} />
        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    backgroundColor: DARK_COLORS.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
