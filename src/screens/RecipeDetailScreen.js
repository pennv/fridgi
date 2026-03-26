import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { FONTS, RADIUS } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { Animated, useFadeInUp, useStaggeredItem } from '../components/useAnimations';
import {
  PrimaryButton,
  GhostButton,
  Tag,
  Card,
  SectionTitle,
  hapticSelection,
  hapticMedium,
  hapticSuccess,
  hapticDestructive,
} from '../components/shared';

export default function RecipeDetailScreen({
  navigation,
  route,
  savedRecipes,
  setSavedRecipes,
  shoppingList,
  setShoppingList,
  fridgeItems,
  setFridgeItems,
  addActivity,
}) {
  const { colors: COLORS } = useTheme();
  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    content: { padding: 24, paddingTop: 60, paddingBottom: 40, gap: 16 },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    backBtn: {
      fontSize: 17,
      fontFamily: FONTS.bodyMed,
      color: COLORS.primary,
    },
    heroCard: {
      alignItems: 'center',
      paddingVertical: 28,
    },
    heroEmoji: {
      fontSize: 64,
      marginBottom: 12,
    },
    heroName: {
      fontSize: 24,
      fontFamily: FONTS.display,
      color: COLORS.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    heroDesc: {
      fontSize: 14,
      fontFamily: FONTS.body,
      color: COLORS.textMuted,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 16,
    },
    tagsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      justifyContent: 'center',
    },
    servingCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    servingLabel: {
      fontSize: 15,
      fontFamily: FONTS.bodyMed,
      color: COLORS.text,
    },
    stepperRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    stepperBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: COLORS.cardAlt,
      justifyContent: 'center',
      alignItems: 'center',
    },
    stepperText: {
      fontSize: 20,
      color: COLORS.text,
      fontWeight: '600',
    },
    servingValue: {
      fontSize: 20,
      fontFamily: FONTS.bodyBold,
      color: COLORS.text,
      minWidth: 30,
      textAlign: 'center',
    },
    sectionLabel: {
      fontSize: 17,
      fontFamily: FONTS.bodyBold,
      color: COLORS.text,
      marginBottom: 14,
    },
    nutritionGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    nutritionItem: {
      alignItems: 'center',
      flex: 1,
    },
    nutritionVal: {
      fontSize: 18,
      fontFamily: FONTS.bodyBold,
    },
    nutritionLabel: {
      fontSize: 11,
      fontFamily: FONTS.body,
      color: COLORS.textMuted,
      marginTop: 4,
    },
    ingredientRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      gap: 10,
    },
    ingredientDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    ingredientName: {
      flex: 1,
      fontSize: 14,
      fontFamily: FONTS.body,
      color: COLORS.text,
    },
    ingredientQty: {
      fontSize: 13,
      fontFamily: FONTS.body,
      color: COLORS.textMuted,
    },
    stepRow: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 16,
    },
    stepNumber: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: COLORS.cardAlt,
      justifyContent: 'center',
      alignItems: 'center',
    },
    stepNumberText: {
      fontSize: 13,
      fontFamily: FONTS.bodyBold,
      color: COLORS.textSub,
    },
    stepText: {
      fontSize: 14,
      fontFamily: FONTS.body,
      color: COLORS.text,
      lineHeight: 20,
    },
    timerPill: {
      backgroundColor: COLORS.primaryDark + '44',
      borderRadius: RADIUS.full,
      paddingHorizontal: 12,
      paddingVertical: 6,
      alignSelf: 'flex-start',
      marginTop: 8,
    },
    timerText: {
      fontSize: 13,
      fontFamily: FONTS.bodyMed,
      color: COLORS.primary,
    },
  });

  const { recipe } = route.params;
  const [servings, setServings] = useState(recipe.servings);
  const isSaved = savedRecipes.some((r) => r.id === recipe.id);
  const scale = servings / recipe.servings;

  const heroAnim = useFadeInUp(0);
  const servAnim = useStaggeredItem(1);
  const nutrAnim = useStaggeredItem(2);
  const ingAnim = useStaggeredItem(3);
  const stpAnim = useStaggeredItem(4);

  const toggleSave = () => {
    hapticSelection();
    if (isSaved) {
      setSavedRecipes((prev) => prev.filter((r) => r.id !== recipe.id));
    } else {
      setSavedRecipes((prev) => [...prev, recipe]);
    }
  };

  const missingIngredients = recipe.ingredients.filter((i) => !i.fromFridge);

  const addMissingToList = () => {
    hapticSuccess();
    const newItems = missingIngredients
      .filter((mi) => !shoppingList.some((s) => s.name === mi.name))
      .map((mi) => ({
        id: 's' + Date.now() + Math.random(),
        name: mi.name,
        qty: 1,
        unit: 'pcs',
        category: 'Other',
        checked: false,
        source: 'recipe',
        sourceLabel: recipe.name,
      }));
    setShoppingList((prev) => [...prev, ...newItems]);
    addActivity(`Added ${newItems.length} items from ${recipe.name}`, '🛒');
  };

  const handleCook = () => {
    hapticDestructive();
    Alert.alert(
      'Update Kitchen',
      'Deduct ingredients from your kitchen inventory?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Deduct & Mark Cooked',
          onPress: () => {
            hapticSuccess();
            recipe.ingredients.forEach((ing) => {
              if (ing.fromFridge) {
                setFridgeItems((prev) => prev.filter((f) => f.name !== ing.name));
              }
            });
            addActivity(`Cooked ${recipe.name}`, '👨‍🍳');
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => { hapticSelection(); navigation.goBack(); }}>
          <Text style={styles.backBtn}>‹ Recipes</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleSave}>
          <Text style={{ fontSize: 24 }}>{isSaved ? '🔖' : '📑'}</Text>
        </TouchableOpacity>
      </View>

      {/* Hero Card */}
      <Animated.View style={heroAnim}>
        <Card style={styles.heroCard}>
          <Text style={styles.heroEmoji}>{recipe.emoji}</Text>
          <Text style={styles.heroName}>{recipe.name}</Text>
          <Text style={styles.heroDesc}>{recipe.description}</Text>
          <View style={styles.tagsRow}>
            <Tag label={recipe.time} />
            <Tag label={recipe.difficulty} color={
              recipe.difficulty === 'Easy' ? COLORS.success :
              recipe.difficulty === 'Medium' ? COLORS.warning : COLORS.danger
            } />
            <Tag label={recipe.cuisineType} color={COLORS.info} />
            {recipe.usesExpiring && <Tag label="Uses Expiring" color={COLORS.danger} />}
          </View>
        </Card>
      </Animated.View>

      {/* Serving Scaler */}
      <Animated.View style={servAnim}>
        <Card style={styles.servingCard}>
          <Text style={styles.servingLabel}>Servings</Text>
          <View style={styles.stepperRow}>
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => { hapticSelection(); setServings(Math.max(1, servings - 1)); }}
            >
              <Text style={styles.stepperText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.servingValue}>{servings}</Text>
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => { hapticSelection(); setServings(servings + 1); }}
            >
              <Text style={styles.stepperText}>+</Text>
            </TouchableOpacity>
          </View>
        </Card>
      </Animated.View>

      {/* Nutrition */}
      <Animated.View style={nutrAnim}>
        <Card>
          <Text style={styles.sectionLabel}>Nutrition per serving</Text>
          <View style={styles.nutritionGrid}>
            {[
              { label: 'Calories', val: Math.round(recipe.nutrition.calories * scale), unit: 'kcal', color: COLORS.warning },
              { label: 'Protein', val: Math.round(recipe.nutrition.protein * scale), unit: 'g', color: COLORS.success },
              { label: 'Carbs', val: Math.round(recipe.nutrition.carbs * scale), unit: 'g', color: COLORS.info },
              { label: 'Fat', val: Math.round(recipe.nutrition.fat * scale), unit: 'g', color: COLORS.danger },
            ].map((n) => (
              <View key={n.label} style={styles.nutritionItem}>
                <Text style={[styles.nutritionVal, { color: n.color }]}>{n.val}{n.unit}</Text>
                <Text style={styles.nutritionLabel}>{n.label}</Text>
              </View>
            ))}
          </View>
        </Card>
      </Animated.View>

      {/* Ingredients */}
      <Animated.View style={ingAnim}>
        <Card>
          <Text style={styles.sectionLabel}>Ingredients</Text>
          {recipe.ingredients.map((ing, i) => (
            <View key={i} style={styles.ingredientRow}>
              <View style={[styles.ingredientDot, { backgroundColor: ing.fromFridge ? COLORS.success : COLORS.textDim }]} />
              <Text style={styles.ingredientName}>{ing.name}</Text>
              <Text style={styles.ingredientQty}>{ing.qty}</Text>
            </View>
          ))}
          {missingIngredients.length > 0 && (
            <View style={{ marginTop: 12 }}>
              <GhostButton label={`Add ${missingIngredients.length} missing to list`} onPress={addMissingToList} />
            </View>
          )}
        </Card>
      </Animated.View>

      {/* Steps */}
      <Animated.View style={stpAnim}>
        <Card>
          <Text style={styles.sectionLabel}>Steps</Text>
          {recipe.steps.map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{i + 1}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.stepText}>{step.instruction}</Text>
                {step.timerSeconds && (
                  <TouchableOpacity style={styles.timerPill}>
                    <Text style={styles.timerText}>
                      ⏱ {Math.floor(step.timerSeconds / 60)}:{String(step.timerSeconds % 60).padStart(2, '0')}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </Card>
      </Animated.View>

      {/* Start Cooking */}
      <GhostButton
        label="Start Cooking Mode"
        onPress={() => {
          hapticMedium();
          navigation.navigate('CookingMode', { recipe });
        }}
        color={COLORS.accent}
      />

      {/* Cook Button */}
      <PrimaryButton
        label="I cooked this — update my kitchen"
        onPress={handleCook}
        icon="👨‍🍳"
      />
    </ScrollView>
  );
}
