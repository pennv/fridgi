import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { FONTS, RADIUS } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useFABScroll } from '../context/FABContext';
import { Animated, useFadeInUp, usePressScale, useStaggeredItem } from '../components/useAnimations';
import {
  IngredientMatchBar,
  GroupedCard,
  hapticSelection,
  hapticMedium,
} from '../components/shared';

// ─── Recipe row ───────────────────────────────────────────────────────────────

function RecipeRow({ recipe, onPress, index }) {
  const { colors: COLORS } = useTheme();
  const press = usePressScale(0.98);
  const anim = useStaggeredItem(index);
  const have = recipe.ingredients.filter((i) => i.fromFridge).length;
  const total = recipe.ingredients.length;

  return (
    <Animated.View style={[press.style, anim]}>
      <TouchableOpacity
        style={{ flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 }}
        onPress={onPress}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        activeOpacity={1}
      >
        <View style={{
          width: 48, height: 48, borderRadius: RADIUS.md,
          backgroundColor: COLORS.cardAlt,
          justifyContent: 'center', alignItems: 'center',
        }}>
          <Text style={{ fontSize: 28 }}>{recipe.emoji}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={{ fontSize: 15, fontFamily: FONTS.bodyMed, color: COLORS.text }}>{recipe.name}</Text>
            {recipe.usesExpiring && (
              <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.danger }} />
            )}
          </View>
          <Text style={{ fontSize: 12, fontFamily: FONTS.body, color: COLORS.textMuted, marginTop: 2, marginBottom: 6 }}>
            {recipe.time} · {recipe.difficulty} · {recipe.cuisineType}
          </Text>
          <IngredientMatchBar have={have} total={total} />
        </View>
        <Text style={{ fontSize: 20, color: COLORS.primary, fontWeight: '600' }}>›</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── This Week card (7-day swipeable pager) ───────────────────────────────────

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner'];
const MEAL_EMOJI = { breakfast: '🌅', lunch: '☀️', dinner: '🌙' };

function getWeekDays() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      key: d.toISOString().split('T')[0],
      label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en', { weekday: 'short' }),
      date: d.toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    };
  });
}

function ThisWeekCard({ mealPlan, navigation, cardWidth }) {
  const { colors: COLORS } = useTheme();
  const [currentPage, setCurrentPage] = useState(0);
  const scrollRef = useRef(null);
  const weekDays = getWeekDays();

  const goToPage = (i) => {
    hapticSelection();
    scrollRef.current?.scrollTo({ x: i * cardWidth, animated: true });
  };

  return (
    <View style={{ backgroundColor: COLORS.card, borderRadius: RADIUS.xl, overflow: 'hidden' }}>

      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 }}>
        <Text style={{ fontSize: 18, marginRight: 10 }}>📅</Text>
        <Text style={{ flex: 1, fontSize: 15, fontFamily: FONTS.bodyBold, color: COLORS.text }}>This Week</Text>
        <TouchableOpacity onPress={() => { hapticMedium(); navigation.navigate('MealPlan'); }} activeOpacity={0.75}>
          <Text style={{ fontSize: 13, fontFamily: FONTS.bodyMed, color: COLORS.primary }}>Edit ›</Text>
        </TouchableOpacity>
      </View>

      {/* Day pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 10, gap: 6 }}
      >
        {weekDays.map((day, i) => (
          <TouchableOpacity
            key={day.key}
            onPress={() => goToPage(i)}
            style={{
              paddingHorizontal: 12, paddingVertical: 6,
              borderRadius: RADIUS.full,
              backgroundColor: currentPage === i ? COLORS.primary : COLORS.cardAlt ?? COLORS.bg,
            }}
            activeOpacity={0.7}
          >
            <Text style={{
              fontSize: 12, fontFamily: FONTS.bodyMed,
              color: currentPage === i ? '#fff' : COLORS.textMuted,
            }}>{day.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 7-day pager */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={(e) => {
          const page = Math.round(e.nativeEvent.contentOffset.x / cardWidth);
          if (page !== currentPage) setCurrentPage(page);
        }}
        style={{ borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: COLORS.border }}
      >
        {weekDays.map((day) => {
          const dayPlan = mealPlan?.[day.key] || {};
          const plannedCount = MEAL_TYPES.filter((t) => dayPlan[t]).length;

          return (
            <View key={day.key} style={{ width: cardWidth }}>
              {/* Meal slots */}
              {MEAL_TYPES.map((type, i) => {
                const meal = dayPlan[type];
                return (
                  <View
                    key={type}
                    style={{
                      flexDirection: 'row', alignItems: 'center',
                      paddingHorizontal: 16, paddingVertical: 12,
                      borderTopWidth: i === 0 ? 0 : StyleSheet.hairlineWidth,
                      borderTopColor: COLORS.border,
                    }}
                  >
                    <Text style={{ fontSize: 14, marginRight: 10, opacity: 0.65 }}>{MEAL_EMOJI[type]}</Text>
                    <Text style={{
                      fontSize: 13, fontFamily: FONTS.bodyMed,
                      color: COLORS.textMuted, width: 70, textTransform: 'capitalize',
                    }}>{type}</Text>
                    {meal ? (
                      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={{ fontSize: 15 }}>{meal.emoji}</Text>
                        <Text style={{ fontSize: 13, fontFamily: FONTS.bodyMed, color: COLORS.text }} numberOfLines={1}>
                          {meal.name}
                        </Text>
                      </View>
                    ) : (
                      <TouchableOpacity onPress={() => { hapticSelection(); navigation.navigate('MealPlan'); }} activeOpacity={0.6}>
                        <Text style={{ fontSize: 13, fontFamily: FONTS.body, color: COLORS.textDim ?? COLORS.textMuted }}>
                          + Add {type}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}

              {/* Day footer */}
              <View style={{
                flexDirection: 'row', alignItems: 'center',
                paddingHorizontal: 16, paddingVertical: 10,
                borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: COLORS.border,
              }}>
                <View style={{ flex: 1, flexDirection: 'row', gap: 5 }}>
                  {MEAL_TYPES.map((type) => (
                    <View key={type} style={{
                      flex: 1, height: 3, borderRadius: 2,
                      backgroundColor: dayPlan[type] ? COLORS.primary : COLORS.cardAlt ?? COLORS.border,
                    }} />
                  ))}
                </View>
                <Text style={{ fontSize: 12, fontFamily: FONTS.body, color: COLORS.textMuted, marginLeft: 12 }}>
                  {plannedCount}/3 planned
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function RecipesScreen({
  navigation, fridgeItems, savedRecipes, setSavedRecipes,
  mealPlan, setMealPlan, addActivity,
}) {
  const { colors: COLORS } = useTheme();
  const { width } = useWindowDimensions();
  const cardWidth = width - 48; // 24px padding each side

  const headerAnim = useFadeInUp();
  const onFABScroll = useFABScroll();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: COLORS.bg }}
      contentContainerStyle={{ padding: 24, paddingTop: 60, paddingBottom: 110, gap: 16 }}
      showsVerticalScrollIndicator={false}
      onScroll={onFABScroll}
      scrollEventThrottle={16}
    >
      {/* Header */}
      <Animated.View style={headerAnim}>
        <Text style={{ fontSize: 32, fontFamily: FONTS.display, color: COLORS.text }}>Recipes</Text>
      </Animated.View>

      {/* This Week card */}
      <ThisWeekCard mealPlan={mealPlan} navigation={navigation} cardWidth={cardWidth} />

      {/* Recipe list */}
      {savedRecipes.length > 0 ? (
        <GroupedCard>
          {savedRecipes.map((recipe, i) => (
            <React.Fragment key={recipe.id ?? i}>
              <RecipeRow
                recipe={recipe}
                index={i}
                onPress={() => { hapticMedium(); navigation.navigate('RecipeDetail', { recipe }); }}
              />
              {i < savedRecipes.length - 1 && (
                <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: COLORS.border, marginLeft: 74 }} />
              )}
            </React.Fragment>
          ))}
        </GroupedCard>
      ) : (
        <View style={{ alignItems: 'center', paddingTop: 48 }}>
          <Text style={{ fontSize: 48, marginBottom: 12 }}>👨‍🍳</Text>
          <Text style={{ fontSize: 16, fontFamily: FONTS.bodyMed, color: COLORS.text, marginBottom: 6 }}>No recipes yet</Text>
          <Text style={{ fontSize: 14, fontFamily: FONTS.body, color: COLORS.textMuted, textAlign: 'center' }}>
            Save recipes from your kitchen to build your collection
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
