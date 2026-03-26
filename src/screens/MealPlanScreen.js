import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from 'react-native';
import { FONTS, RADIUS } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { Animated, useFadeInUp, usePressScale, useStaggeredItem } from '../components/useAnimations';
import {
  Card,
  hapticSelection,
  hapticMedium,
  hapticSuccess,
  hapticDestructive,
} from '../components/shared';
import { QUICK_MEAL_OPTIONS } from '../data';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner'];
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getWeekDates(offset = 0) {
  const dates = [];
  const today = new Date();
  const start = new Date(today);
  start.setDate(start.getDate() + offset * 7);
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    dates.push({
      key: d.toISOString().split('T')[0],
      dayName: DAY_NAMES[d.getDay()],
      shortDay: SHORT_DAYS[d.getDay()],
      date: d.getDate(),
      month: d.toLocaleDateString('en', { month: 'short' }),
      isToday: d.toDateString() === today.toDateString(),
    });
  }
  return dates;
}

function MealSlot({ meal, type, onAdd, onRemove }) {
  const { colors: COLORS } = useTheme();
  const styles = StyleSheet.create({
    emptySlot: {
      borderWidth: 1,
      borderColor: COLORS.borderLight,
      borderStyle: 'dashed',
      borderRadius: RADIUS.md,
      paddingVertical: 12,
      alignItems: 'center',
    },
    emptySlotText: {
      fontSize: 13,
      fontFamily: FONTS.bodyMed,
      color: COLORS.textDim,
    },
    filledSlot: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: COLORS.cardAlt,
      borderRadius: RADIUS.md,
      padding: 12,
    },
    mealName: {
      fontSize: 14,
      fontFamily: FONTS.bodyMed,
      color: COLORS.text,
    },
    mealTime: {
      fontSize: 11,
      fontFamily: FONTS.body,
      color: COLORS.textMuted,
      marginTop: 2,
    },
    removeBtn: {
      fontSize: 14,
      color: COLORS.textDim,
      padding: 4,
    },
  });

  const press = usePressScale(0.97);

  if (!meal) {
    return (
      <Animated.View style={press.style}>
        <TouchableOpacity
          style={styles.emptySlot}
          onPress={onAdd}
          onPressIn={press.onPressIn}
          onPressOut={press.onPressOut}
          activeOpacity={1}
        >
          <Text style={styles.emptySlotText}>+ Add {type}</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <View style={styles.filledSlot}>
      <Text style={{ fontSize: 18, marginRight: 8 }}>{meal.emoji}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.mealName}>{meal.name}</Text>
        <Text style={styles.mealTime}>{meal.time}</Text>
      </View>
      <TouchableOpacity onPress={onRemove}>
        <Text style={styles.removeBtn}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function MealPlanScreen({ mealPlan, setMealPlan, addActivity }) {
  const { colors: COLORS } = useTheme();
  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    content: { padding: 24, paddingTop: 60, paddingBottom: 110, gap: 12 },
    title: {
      fontSize: 32,
      fontFamily: FONTS.display,
      color: COLORS.text,
    },
    weekNav: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 20,
    },
    weekArrow: {
      fontSize: 24,
      fontFamily: FONTS.bodyBold,
      color: COLORS.primary,
      padding: 8,
    },
    weekLabel: {
      fontSize: 16,
      fontFamily: FONTS.bodyMed,
      color: COLORS.text,
      minWidth: 100,
      textAlign: 'center',
    },
    statsStrip: {
      flexDirection: 'row',
      gap: 12,
    },
    statItem: {
      flex: 1,
      backgroundColor: COLORS.card,
      borderRadius: RADIUS.xl,
      padding: 16,
      alignItems: 'center',
    },
    statValue: {
      fontSize: 24,
      fontFamily: FONTS.display,
      color: COLORS.text,
    },
    statLabel: {
      fontSize: 12,
      fontFamily: FONTS.body,
      color: COLORS.textMuted,
      marginTop: 4,
    },
    dayCard: {
      padding: 16,
      gap: 8,
    },
    dayCardToday: {
      borderWidth: 1,
      borderColor: COLORS.primary + '44',
    },
    dayHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    dayName: {
      fontSize: 16,
      fontFamily: FONTS.bodyBold,
      color: COLORS.text,
    },
    dayDate: {
      fontSize: 13,
      fontFamily: FONTS.body,
      color: COLORS.textMuted,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: COLORS.overlay,
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: COLORS.card,
      borderTopLeftRadius: RADIUS.xxl,
      borderTopRightRadius: RADIUS.xxl,
      maxHeight: '60%',
      paddingBottom: 40,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: COLORS.border,
    },
    modalTitle: {
      fontSize: 18,
      fontFamily: FONTS.bodyBold,
      color: COLORS.text,
      textTransform: 'capitalize',
    },
    modalClose: {
      fontSize: 18,
      color: COLORS.textMuted,
      padding: 4,
    },
    mealOption: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: COLORS.border,
    },
    mealOptionName: {
      fontSize: 15,
      fontFamily: FONTS.bodyMed,
      color: COLORS.text,
    },
    mealOptionTime: {
      fontSize: 12,
      fontFamily: FONTS.body,
      color: COLORS.textMuted,
      marginTop: 2,
    },
    chevron: {
      fontSize: 20,
      color: COLORS.primary,
      fontWeight: '600',
    },
  });

  const [weekOffset, setWeekOffset] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const headerAnim = useFadeInUp();
  const weekDates = getWeekDates(weekOffset);

  const mealsPlanned = weekDates.reduce((count, d) => {
    const plan = mealPlan[d.key] || {};
    return count + MEAL_TYPES.filter((t) => plan[t]).length;
  }, 0);
  const totalSlots = weekDates.length * 3;

  const openPicker = (dateKey, mealType) => {
    hapticMedium();
    setSelectedSlot({ dateKey, mealType });
    setModalVisible(true);
  };

  const assignMeal = (option) => {
    hapticSuccess();
    const { dateKey, mealType } = selectedSlot;
    const timeMap = { breakfast: '8:00 AM', lunch: '12:30 PM', dinner: '7:00 PM' };
    setMealPlan((prev) => ({
      ...prev,
      [dateKey]: {
        ...(prev[dateKey] || {}),
        [mealType]: { name: option.name, emoji: option.emoji, time: timeMap[mealType] },
      },
    }));
    addActivity(`Added ${option.name} to meal plan`, '📅');
    setModalVisible(false);
  };

  const removeMeal = (dateKey, mealType) => {
    hapticDestructive();
    setMealPlan((prev) => ({
      ...prev,
      [dateKey]: { ...(prev[dateKey] || {}), [mealType]: null },
    }));
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View style={headerAnim}>
          <Text style={styles.title}>Meal Plan</Text>
        </Animated.View>

        {/* Week Nav */}
        <View style={styles.weekNav}>
          <TouchableOpacity onPress={() => { hapticSelection(); setWeekOffset(weekOffset - 1); }}>
            <Text style={styles.weekArrow}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.weekLabel}>
            {weekOffset === 0 ? 'This Week' : weekOffset > 0 ? `+${weekOffset} Week` : `${weekOffset} Week`}
          </Text>
          <TouchableOpacity onPress={() => { hapticSelection(); setWeekOffset(weekOffset + 1); }}>
            <Text style={styles.weekArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsStrip}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{mealsPlanned}</Text>
            <Text style={styles.statLabel}>Planned</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalSlots - mealsPlanned}</Text>
            <Text style={styles.statLabel}>Open</Text>
          </View>
        </View>

        {/* Day Cards */}
        {weekDates.map((d, index) => {
          const plan = mealPlan[d.key] || {};
          const dayAnim = useStaggeredItem(index);
          return (
            <Animated.View key={d.key} style={dayAnim}>
              <Card style={[styles.dayCard, d.isToday && styles.dayCardToday]}>
                <View style={styles.dayHeader}>
                  <Text style={styles.dayName}>
                    {d.isToday ? 'Today' : d.dayName}
                  </Text>
                  <Text style={styles.dayDate}>{d.month} {d.date}</Text>
                </View>
                {MEAL_TYPES.map((type) => (
                  <MealSlot
                    key={type}
                    meal={plan[type]}
                    type={type}
                    onAdd={() => openPicker(d.key, type)}
                    onRemove={() => removeMeal(d.key, type)}
                  />
                ))}
              </Card>
            </Animated.View>
          );
        })}
      </ScrollView>

      {/* Meal Picker Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Choose {selectedSlot?.mealType}
              </Text>
              <TouchableOpacity onPress={() => { hapticSelection(); setModalVisible(false); }}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView>
              {QUICK_MEAL_OPTIONS.map((option, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.mealOption}
                  onPress={() => assignMeal(option)}
                >
                  <Text style={{ fontSize: 24, marginRight: 12 }}>{option.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.mealOptionName}>{option.name}</Text>
                    <Text style={styles.mealOptionTime}>{option.time}</Text>
                  </View>
                  <Text style={styles.chevron}>›</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
