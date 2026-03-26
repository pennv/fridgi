import React, { useState, useCallback } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import {
  Fraunces_400Regular,
  Fraunces_600SemiBold,
  Fraunces_700Bold,
} from '@expo-google-fonts/fraunces';

import { COLORS } from './src/theme';
import {
  INITIAL_FRIDGE_ITEMS,
  INITIAL_SHOPPING_LIST,
  INITIAL_MEAL_PLAN,
  INITIAL_ACTIVITY,
} from './src/data';

import OnboardingScreen from './src/screens/OnboardingScreen';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
    Fraunces_400Regular,
    Fraunces_600SemiBold,
    Fraunces_700Bold,
  });

  const [onboarded, setOnboarded] = useState(false);
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

  if (!fontsLoaded) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <StatusBar style="light" />
      </View>
    );
  }

  if (!onboarded) {
    return (
      <>
        <OnboardingScreen
          onComplete={() => setOnboarded(true)}
          userProfile={userProfile}
          setUserProfile={setUserProfile}
        />
        <StatusBar style="light" />
      </>
    );
  }

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
      <StatusBar style="light" />
    </>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    backgroundColor: COLORS.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
