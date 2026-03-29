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
import { Animated, useFadeInUp, usePressScale } from '../components/useAnimations';
import {
  hapticSelection,
  hapticMedium,
  hapticSuccess,
  hapticDestructive,
} from '../components/shared';
import { QUICK_MEAL_OPTIONS } from '../data';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner'];
const MEAL_EMOJI = { breakfast: '🌅', lunch: '☀️', dinner: '🌙' };
const DOW_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function getMonthCells(year, month) {
  const todayKey = new Date().toISOString().split('T')[0];
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const key = date.toISOString().split('T')[0];
    cells.push({ day: d, key, isToday: key === todayKey });
  }
  return cells;
}

function MealSlot({ meal, type, onAdd, onRemove }) {
  const { colors: COLORS } = useTheme();
  const press = usePressScale(0.97);

  if (!meal) {
    return (
      <Animated.View style={press.style}>
        <TouchableOpacity
          style={{
            borderWidth: 1, borderColor: COLORS.border, borderStyle: 'dashed',
            borderRadius: RADIUS.md, paddingVertical: 12, alignItems: 'center',
          }}
          onPress={onAdd}
          onPressIn={press.onPressIn}
          onPressOut={press.onPressOut}
          activeOpacity={1}
        >
          <Text style={{ fontSize: 13, fontFamily: FONTS.bodyMed, color: COLORS.textMuted }}>
            + Add {type}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <View style={{
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: COLORS.cardAlt, borderRadius: RADIUS.md, padding: 12,
    }}>
      <Text style={{ fontSize: 18, marginRight: 8 }}>{meal.emoji}</Text>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontFamily: FONTS.bodyMed, color: COLORS.text }}>{meal.name}</Text>
        <Text style={{ fontSize: 11, fontFamily: FONTS.body, color: COLORS.textMuted, marginTop: 2 }}>{meal.time}</Text>
      </View>
      <TouchableOpacity onPress={onRemove} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Text style={{ fontSize: 14, color: COLORS.textMuted, padding: 4 }}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function MealPlanScreen({ navigation, mealPlan, setMealPlan, addActivity }) {
  const { colors: COLORS } = useTheme();

  const today = new Date();
  const todayKey = today.toISOString().split('T')[0];

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedKey, setSelectedKey] = useState(todayKey);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const headerAnim = useFadeInUp();
  const cells = getMonthCells(year, month);
  const selectedPlan = mealPlan[selectedKey] || {};

  const selectedDate = new Date(selectedKey + 'T12:00:00');
  const selectedLabel = selectedKey === todayKey
    ? 'Today'
    : selectedDate.toLocaleDateString('en', { weekday: 'long', month: 'short', day: 'numeric' });

  const prevMonth = () => {
    hapticSelection();
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    hapticSelection();
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  };

  const openPicker = (mealType) => {
    hapticMedium();
    setSelectedSlot({ dateKey: selectedKey, mealType });
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

  const removeMeal = (mealType) => {
    hapticDestructive();
    setMealPlan((prev) => ({
      ...prev,
      [selectedKey]: { ...(prev[selectedKey] || {}), [mealType]: null },
    }));
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <ScrollView
        contentContainerStyle={{ padding: 24, paddingTop: 16, paddingBottom: 110, gap: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Nav header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 40 }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 8, padding: 4 }}>
            <Text style={{ fontSize: 28, color: COLORS.primary, fontFamily: FONTS.bodyBold, lineHeight: 32 }}>‹</Text>
          </TouchableOpacity>
          <Animated.View style={headerAnim}>
            <Text style={{ fontSize: 32, fontFamily: FONTS.display, color: COLORS.text }}>Meal Plan</Text>
          </Animated.View>
        </View>

        {/* Month navigator */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
          <TouchableOpacity onPress={prevMonth} style={{ padding: 8 }}>
            <Text style={{ fontSize: 22, color: COLORS.primary, fontFamily: FONTS.bodyBold }}>‹</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 17, fontFamily: FONTS.bodyBold, color: COLORS.text, minWidth: 140, textAlign: 'center' }}>
            {MONTH_NAMES[month]} {year}
          </Text>
          <TouchableOpacity onPress={nextMonth} style={{ padding: 8 }}>
            <Text style={{ fontSize: 22, color: COLORS.primary, fontFamily: FONTS.bodyBold }}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Calendar */}
        <View style={{ backgroundColor: COLORS.card, borderRadius: RADIUS.xl, padding: 16 }}>
          {/* Day-of-week headers */}
          <View style={{ flexDirection: 'row', marginBottom: 8 }}>
            {DOW_LABELS.map((l, i) => (
              <View key={i} style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{ fontSize: 12, fontFamily: FONTS.bodyMed, color: COLORS.textMuted }}>{l}</Text>
              </View>
            ))}
          </View>

          {/* Day cells */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {cells.map((cell, i) => {
              if (!cell) {
                return <View key={`e-${i}`} style={{ width: `${100 / 7}%`, height: 48 }} />;
              }
              const isSelected = selectedKey === cell.key;
              const plan = mealPlan[cell.key] || {};
              const plannedCount = MEAL_TYPES.filter((t) => plan[t]).length;

              return (
                <TouchableOpacity
                  key={cell.key}
                  style={{ width: `${100 / 7}%`, height: 52, alignItems: 'center', justifyContent: 'center', gap: 4 }}
                  onPress={() => { hapticSelection(); setSelectedKey(cell.key); }}
                  activeOpacity={0.7}
                >
                  <View style={{
                    width: 32, height: 32, borderRadius: 16,
                    backgroundColor: isSelected
                      ? COLORS.primary
                      : cell.isToday
                        ? COLORS.primary + '22'
                        : 'transparent',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Text style={{
                      fontSize: 14,
                      fontFamily: isSelected || cell.isToday ? FONTS.bodyBold : FONTS.body,
                      color: isSelected ? '#fff' : cell.isToday ? COLORS.primary : COLORS.text,
                    }}>
                      {cell.day}
                    </Text>
                  </View>
                  {/* Meal dots */}
                  <View style={{ flexDirection: 'row', gap: 2 }}>
                    {MEAL_TYPES.map((type) => (
                      <View key={type} style={{
                        width: 4, height: 4, borderRadius: 2,
                        backgroundColor: plan[type]
                          ? (isSelected ? '#ffffff88' : COLORS.primary)
                          : COLORS.border,
                      }} />
                    ))}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Selected day meal slots */}
        <View style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 17, fontFamily: FONTS.bodyBold, color: COLORS.text }}>{selectedLabel}</Text>
            <Text style={{ fontSize: 13, fontFamily: FONTS.body, color: COLORS.textMuted }}>
              {MEAL_TYPES.filter((t) => selectedPlan[t]).length}/3 planned
            </Text>
          </View>

          {MEAL_TYPES.map((type) => (
            <View key={type} style={{ gap: 6 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ fontSize: 13, opacity: 0.6 }}>{MEAL_EMOJI[type]}</Text>
                <Text style={{ fontSize: 12, fontFamily: FONTS.bodyMed, color: COLORS.textMuted, textTransform: 'capitalize' }}>
                  {type}
                </Text>
              </View>
              <MealSlot
                meal={selectedPlan[type]}
                type={type}
                onAdd={() => openPicker(type)}
                onRemove={() => removeMeal(type)}
              />
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Meal picker modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: COLORS.overlay, justifyContent: 'flex-end' }}>
          <View style={{
            backgroundColor: COLORS.card,
            borderTopLeftRadius: RADIUS.xxl, borderTopRightRadius: RADIUS.xxl,
            maxHeight: '60%', paddingBottom: 40,
          }}>
            <View style={{
              flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
              padding: 20, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: COLORS.border,
            }}>
              <Text style={{ fontSize: 18, fontFamily: FONTS.bodyBold, color: COLORS.text, textTransform: 'capitalize' }}>
                Choose {selectedSlot?.mealType}
              </Text>
              <TouchableOpacity onPress={() => { hapticSelection(); setModalVisible(false); }}>
                <Text style={{ fontSize: 18, color: COLORS.textMuted, padding: 4 }}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView>
              {QUICK_MEAL_OPTIONS.map((option, i) => (
                <TouchableOpacity
                  key={i}
                  style={{
                    flexDirection: 'row', alignItems: 'center', padding: 16,
                    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: COLORS.border,
                  }}
                  onPress={() => assignMeal(option)}
                >
                  <Text style={{ fontSize: 24, marginRight: 12 }}>{option.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontFamily: FONTS.bodyMed, color: COLORS.text }}>{option.name}</Text>
                    <Text style={{ fontSize: 12, fontFamily: FONTS.body, color: COLORS.textMuted, marginTop: 2 }}>{option.time}</Text>
                  </View>
                  <Text style={{ fontSize: 20, color: COLORS.primary, fontWeight: '600' }}>›</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
