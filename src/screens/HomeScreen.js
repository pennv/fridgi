import React, { useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { FONTS, RADIUS } from '../theme';
import { MOCK_RECIPES, INITIAL_HEALTH_DATA } from '../data';
import { useTheme } from '../context/ThemeContext';
import { Animated, usePressScale, useStaggeredItem } from '../components/useAnimations';
import {
  ExpiryBadge,
  GroupedCard,
  hapticMedium,
  hapticLight,
} from '../components/shared';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}


export default function HomeScreen({ navigation, fridgeItems, mealPlan, activityFeed, userProfile }) {
  const { colors: COLORS } = useTheme();
  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    content: { padding: 24, paddingTop: 60, paddingBottom: 120, gap: 24 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    greeting: { fontSize: 15, fontFamily: FONTS.body, color: COLORS.textMuted },
    userName: { fontSize: 28, fontFamily: FONTS.display, color: COLORS.text, marginTop: 2 },
    avatar: {
      width: 44, height: 44, borderRadius: 22,
      backgroundColor: COLORS.primary,
      justifyContent: 'center', alignItems: 'center',
    },
    avatarText: { fontSize: 18, fontFamily: FONTS.bodyBold, color: '#fff' },
    statsRow: { flexDirection: 'row', gap: 10 },
    expiringRow: { flexDirection: 'row', alignItems: 'center', padding: 16 },
    expiringEmoji: { fontSize: 24, marginRight: 12 },
    expiringName: { fontSize: 15, fontFamily: FONTS.bodyMed, color: COLORS.text },
    expiringQty: { fontSize: 12, fontFamily: FONTS.body, color: COLORS.textMuted, marginTop: 2 },
    divider: { height: StyleSheet.hairlineWidth, backgroundColor: COLORS.border, marginLeft: 52 },
    emptyText: {
      fontSize: 14, fontFamily: FONTS.body, color: COLORS.textMuted,
      textAlign: 'center', paddingVertical: 20,
    },
  });

  const anim0 = useStaggeredItem(0);
  const anim1 = useStaggeredItem(1);
  const anim2 = useStaggeredItem(2);
  const anim3 = useStaggeredItem(3);

  const [activeTab, setActiveTab] = useState('meal');
  const [expiryThreshold, setExpiryThreshold] = useState(3);
  const [showDaysPopup, setShowDaysPopup] = useState(false);
  const [daysInput, setDaysInput] = useState('3');
  const [daysError, setDaysError] = useState('');

  const health = INITIAL_HEALTH_DATA;
  const [calorieGoal, setCalorieGoal] = useState(health.dailyCalorieGoal);
  const [todayCalories, setTodayCalories] = useState(health.today.calories);
  const [showCaloriePopup, setShowCaloriePopup] = useState(false);
  const [goalInput, setGoalInput] = useState(String(health.dailyCalorieGoal));
  const [intakeInput, setIntakeInput] = useState(String(health.today.calories));
  const [calorieError, setCalorieError] = useState('');

  const [selectedDayIndex, setSelectedDayIndex] = useState(null); // null = today
  const reversedDaily = useMemo(() => [...health.daily].reverse(), []);
  const maxDailyCal = Math.max(...health.daily.map((w) => w.calories), calorieGoal, todayCalories);
  const calorieRemaining = Math.max(0, calorieGoal - todayCalories);
  const chartScrollRef = useRef(null);

  const displayCalories = selectedDayIndex === null ? todayCalories : reversedDaily[selectedDayIndex].calories;
  const displayPct = (displayCalories / calorieGoal) * 100;
  const displayRemaining = calorieGoal - displayCalories;
  const displayBarColor = displayPct > 200 ? COLORS.danger : displayPct > 100 ? COLORS.warning : COLORS.primary;
  const getBarDate = (i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
  };
  const displayLabel = selectedDayIndex === null ? 'CALORIES TODAY' : getBarDate(selectedDayIndex);

  const expiring = fridgeItems.filter((i) => i.expiryDays <= expiryThreshold).sort((a, b) => a.expiryDays - b.expiryDays);
  const totalItems = fridgeItems.length;
  const locationCounts = {
    Fridge: fridgeItems.filter((i) => i.location === 'Fridge').length,
    Freezer: fridgeItems.filter((i) => i.location === 'Freezer').length,
    Pantry: fridgeItems.filter((i) => i.location === 'Pantry').length,
  };

  const mealRecommendations = useMemo(() => {
    const fridgeNames = fridgeItems.map((i) => i.name.toLowerCase());
    return MOCK_RECIPES
      .map((recipe) => {
        const fridgeIngredients = recipe.ingredients.filter((ing) => ing.fromFridge);
        const available = fridgeIngredients.filter((ing) => fridgeNames.includes(ing.name.toLowerCase())).length;
        const expiringCount = fridgeIngredients.filter((ing) =>
          fridgeItems.find((fi) => fi.name.toLowerCase() === ing.name.toLowerCase() && fi.expiryDays <= expiryThreshold)
        ).length;
        const matchPct = fridgeIngredients.length > 0 ? available / fridgeIngredients.length : 0;
        return { ...recipe, available, expiringCount, matchPct, total: fridgeIngredients.length };
      })
      .filter((r) => r.matchPct >= 0.5)
      .sort((a, b) => b.expiringCount - a.expiringCount || b.matchPct - a.matchPct);
  }, [fridgeItems, expiryThreshold]);

  return (
    <>
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

      {/* Header */}
      <Animated.View style={[styles.headerRow, anim0]}>
        <View>
          <Text style={styles.greeting}>{getGreeting()},</Text>
          <Text style={styles.userName}>{userProfile.name || 'Chef'}</Text>
        </View>
        <TouchableOpacity
          style={styles.avatar}
          onPress={() => { hapticLight(); navigation.navigate('Profile'); }}
        >
          <Text style={styles.avatarText}>{(userProfile.name || 'C')[0].toUpperCase()}</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Calorie Hero */}
      <Animated.View style={anim1}>
        <View style={{ backgroundColor: COLORS.card, borderRadius: RADIUS.xxl, overflow: 'hidden' }}>
          {/* Top section — long press to edit, tap to deselect day */}
          <TouchableOpacity
            onLongPress={() => { hapticMedium(); setIntakeInput(String(todayCalories)); setGoalInput(String(calorieGoal)); setShowCaloriePopup(true); }}
            onPress={() => { if (selectedDayIndex !== null) { hapticLight(); setSelectedDayIndex(null); } }}
            activeOpacity={0.97}
            style={{ padding: 20, gap: 14 }}
          >
            {/* Header row */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Text style={{ fontSize: 12, fontFamily: FONTS.bodyMed, color: COLORS.textMuted, letterSpacing: 0.5 }}>{displayLabel}</Text>
              <View style={{ backgroundColor: displayBarColor + '22', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 }}>
                <Text style={{ fontSize: 12, fontFamily: FONTS.bodyBold, color: displayBarColor }}>{Math.round(displayPct)}%</Text>
              </View>
            </View>

            {/* Big number */}
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
              <Text style={{ fontSize: 44, fontFamily: FONTS.display, color: COLORS.text, lineHeight: 48 }}>
                {displayCalories.toLocaleString()}
              </Text>
              <Text style={{ fontSize: 14, fontFamily: FONTS.body, color: COLORS.textMuted }}>
                / {calorieGoal.toLocaleString()} kcal
              </Text>
            </View>

            {/* Progress bar */}
            <View style={{ height: 6, backgroundColor: COLORS.cardAlt, borderRadius: 3, overflow: 'hidden' }}>
              <View style={{ width: `${Math.min(displayPct, 100)}%`, height: '100%', backgroundColor: displayBarColor, borderRadius: 3 }} />
            </View>

            {/* Remaining / over */}
            <Text style={{ fontSize: 13, fontFamily: FONTS.body, color: COLORS.textMuted }}>
              {displayRemaining > 0
                ? `${displayRemaining.toLocaleString()} kcal remaining`
                : `${Math.abs(displayRemaining).toLocaleString()} kcal over goal`}
            </Text>
          </TouchableOpacity>

          {/* 30-day chart — separate from long-press area */}
          <View style={{ paddingHorizontal: 20, paddingBottom: 20 }}>
          <ScrollView ref={chartScrollRef} horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 5, height: 64, paddingHorizontal: 4 }}>
              {reversedDaily.map((w, i) => {
                const barH = Math.max(4, (w.calories / maxDailyCal) * 48);
                const isSelected = selectedDayIndex === null ? i === 0 : i === selectedDayIndex;
                const hasSelection = selectedDayIndex !== null;
                const overGoal = w.calories > calorieGoal;
                const barColor = isSelected
                  ? (overGoal ? COLORS.warning : COLORS.primary)
                  : overGoal
                    ? COLORS.warning + (hasSelection ? '30' : '60')
                    : COLORS.primary + (hasSelection ? '20' : '35');
                return (
                  <TouchableOpacity
                    key={i}
                    onPress={() => { hapticLight(); setSelectedDayIndex(i === 0 ? null : i); }}
                    activeOpacity={0.7}
                    style={{ width: 22, alignItems: 'center', gap: 3 }}
                  >
                    <View style={{ width: isSelected ? 22 : 18, height: barH, borderRadius: 3, backgroundColor: barColor }} />
                    <Text style={{
                      fontSize: 9,
                      fontFamily: isSelected ? FONTS.bodyBold : FONTS.body,
                      color: isSelected ? displayBarColor : COLORS.textMuted,
                    }}>{(() => { const d = new Date(); d.setDate(d.getDate() - i); return d.getDate(); })()}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
          </View>
        </View>
      </Animated.View>

      {/* Stats — tab selector */}
      <Animated.View style={[styles.statsRow, anim2]}>
        {[
          { id: 'location', value: totalItems, label: 'Total items', accent: null },
          { id: 'meal', value: mealRecommendations.length, label: "Today's meal", accent: mealRecommendations.length > 0 ? COLORS.success : null },
          { id: 'expiring', value: expiring.length, label: `${expiryThreshold}d expiring`, accent: expiring.length > 0 ? COLORS.danger : null },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={{
                flex: 1, backgroundColor: isActive ? COLORS.primary : COLORS.card,
                borderRadius: RADIUS.xl, padding: 16, gap: 4,
              }}
              onPress={() => { hapticLight(); setActiveTab(tab.id); }}
              onLongPress={tab.id === 'expiring' ? () => { hapticMedium(); setDaysInput(String(expiryThreshold)); setShowDaysPopup(true); } : undefined}
              activeOpacity={0.85}
            >
              <Text style={{ fontSize: 32, fontFamily: FONTS.display, color: isActive ? '#fff' : (tab.accent || COLORS.text), lineHeight: 36 }}>{tab.value}</Text>
              <Text style={{ fontSize: 12, fontFamily: FONTS.bodyMed, color: isActive ? 'rgba(255,255,255,0.65)' : COLORS.textMuted }}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </Animated.View>

      {/* Table */}
      <Animated.View style={anim3}>
        {activeTab === 'location' && (
          <GroupedCard>
            {[{ label: 'Fridge', emoji: '🧊' }, { label: 'Freezer', emoji: '❄️' }, { label: 'Pantry', emoji: '🗄️' }].map(({ label, emoji }, i, arr) => (
              <React.Fragment key={label}>
                <View style={styles.expiringRow}>
                  <Text style={styles.expiringEmoji}>{emoji}</Text>
                  <Text style={[styles.expiringName, { flex: 1 }]}>{label}</Text>
                  <Text style={[styles.expiringName, { color: COLORS.textMuted }]}>{locationCounts[label]}</Text>
                </View>
                {i < arr.length - 1 && <View style={styles.divider} />}
              </React.Fragment>
            ))}
          </GroupedCard>
        )}
        {activeTab === 'expiring' && (
          expiring.length === 0
            ? <GroupedCard><Text style={styles.emptyText}>No items expiring in {expiryThreshold} day{expiryThreshold === 1 ? '' : 's'}</Text></GroupedCard>
            : <GroupedCard>
                {expiring.map((item, i) => (
                  <React.Fragment key={item.id ?? i}>
                    <View style={styles.expiringRow}>
                      <Text style={styles.expiringEmoji}>{item.emoji}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.expiringName}>{item.name}</Text>
                        <Text style={styles.expiringQty}>{item.qty} {item.unit}</Text>
                      </View>
                      <ExpiryBadge days={item.expiryDays} />
                    </View>
                    {i < expiring.length - 1 && <View style={styles.divider} />}
                  </React.Fragment>
                ))}
              </GroupedCard>
        )}
        {activeTab === 'meal' && (
          mealRecommendations.length === 0
            ? <GroupedCard><Text style={styles.emptyText}>Add more items to get meal suggestions</Text></GroupedCard>
            : <>
                {calorieRemaining > 0 && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8, paddingHorizontal: 2 }}>
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.success }} />
                    <Text style={{ fontSize: 12, fontFamily: FONTS.bodyMed, color: COLORS.textMuted }}>
                      {calorieRemaining.toLocaleString()} kcal remaining today
                    </Text>
                  </View>
                )}
                <GroupedCard>
                  {mealRecommendations.map((recipe, i) => (
                    <React.Fragment key={recipe.id ?? i}>
                      <View style={styles.expiringRow}>
                        <Text style={styles.expiringEmoji}>{recipe.emoji}</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.expiringName}>{recipe.name}</Text>
                          <Text style={styles.expiringQty}>{recipe.time} · {recipe.available}/{recipe.total} ingredients</Text>
                        </View>
                        {recipe.expiringCount > 0 && (
                          <View style={{ backgroundColor: COLORS.dangerLight, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4 }}>
                            <Text style={{ fontSize: 11, fontFamily: FONTS.bodyBold, color: COLORS.danger }}>{recipe.expiringCount} expiring</Text>
                          </View>
                        )}
                      </View>
                      {i < mealRecommendations.length - 1 && <View style={styles.divider} />}
                    </React.Fragment>
                  ))}
                </GroupedCard>
              </>
        )}
      </Animated.View>

    </ScrollView>

    {/* Calorie edit popup */}
    <Modal visible={showCaloriePopup} transparent animationType="fade" onRequestClose={() => { setShowCaloriePopup(false); setCalorieError(''); }}>
      <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); setShowCaloriePopup(false); setCalorieError(''); }}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
              <View style={{ backgroundColor: COLORS.card, borderRadius: RADIUS.xxl, padding: 24, width: 300, gap: 16 }}>
                <Text style={{ fontSize: 17, fontFamily: FONTS.bodyBold, color: COLORS.text }}>Calories</Text>
                <View style={{ gap: 8 }}>
                  <Text style={{ fontSize: 13, fontFamily: FONTS.bodyMed, color: COLORS.textMuted }}>Today's intake</Text>
                  <TextInput
                    value={intakeInput}
                    onChangeText={(t) => { setIntakeInput(t); setCalorieError(''); }}
                    keyboardType="number-pad"
                    maxLength={5}
                    autoFocus
                    style={{ backgroundColor: COLORS.bg, borderRadius: RADIUS.lg, padding: 14, fontSize: 24, fontFamily: FONTS.display, color: COLORS.text, textAlign: 'center' }}
                  />
                </View>
                <View style={{ gap: 8 }}>
                  <Text style={{ fontSize: 13, fontFamily: FONTS.bodyMed, color: COLORS.textMuted }}>Daily goal</Text>
                  <TextInput
                    value={goalInput}
                    onChangeText={(t) => { setGoalInput(t); setCalorieError(''); }}
                    keyboardType="number-pad"
                    maxLength={5}
                    style={{ backgroundColor: COLORS.bg, borderRadius: RADIUS.lg, padding: 14, fontSize: 24, fontFamily: FONTS.display, color: COLORS.text, textAlign: 'center' }}
                  />
                </View>
                {!!calorieError && (
                  <Text style={{ fontSize: 12, fontFamily: FONTS.bodyMed, color: COLORS.danger, textAlign: 'center', marginTop: -8 }}>{calorieError}</Text>
                )}
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TouchableOpacity
                    onPress={() => { setShowCaloriePopup(false); setCalorieError(''); }}
                    style={{ flex: 1, padding: 14, borderRadius: RADIUS.lg, backgroundColor: COLORS.bg, alignItems: 'center' }}
                  >
                    <Text style={{ fontFamily: FONTS.bodyMed, color: COLORS.textMuted }}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      const intake = parseInt(intakeInput, 10);
                      const goal = parseInt(goalInput, 10);
                      if (!intakeInput || isNaN(intake) || intake < 0 || intake > 99999) { setCalorieError('Intake must be between 0 and 99999.'); return; }
                      if (!goalInput || isNaN(goal) || goal < 500 || goal > 9999) { setCalorieError('Goal must be between 500 and 9999.'); return; }
                      setTodayCalories(intake);
                      setCalorieGoal(goal);
                      setCalorieError('');
                      setShowCaloriePopup(false);
                    }}
                    style={{ flex: 1, padding: 14, borderRadius: RADIUS.lg, backgroundColor: COLORS.primary, alignItems: 'center' }}
                  >
                    <Text style={{ fontFamily: FONTS.bodyMed, color: '#fff' }}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>

    {/* Days threshold popup */}
    <Modal visible={showDaysPopup} transparent animationType="fade" onRequestClose={() => { setShowDaysPopup(false); setDaysError(''); }}>
      <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); setShowDaysPopup(false); setDaysError(''); }}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
              <View style={{ backgroundColor: COLORS.card, borderRadius: RADIUS.xxl, padding: 24, width: 280, gap: 16 }}>
                <Text style={{ fontSize: 17, fontFamily: FONTS.bodyBold, color: COLORS.text }}>Set Expiry Window</Text>
                <Text style={{ fontSize: 14, fontFamily: FONTS.body, color: COLORS.textMuted }}>Show items expiring within how many days?</Text>
                <TextInput
                  value={daysInput}
                  onChangeText={(t) => { setDaysInput(t); setDaysError(''); }}
                  keyboardType="number-pad"
                  maxLength={2}
                  autoFocus
                  style={{
                    backgroundColor: COLORS.bg, borderRadius: RADIUS.lg, padding: 14,
                    fontSize: 24, fontFamily: FONTS.display, color: COLORS.text, textAlign: 'center',
                    borderWidth: daysError ? 1.5 : 0, borderColor: COLORS.danger,
                  }}
                />
                {!!daysError && (
                  <Text style={{ fontSize: 12, fontFamily: FONTS.bodyMed, color: COLORS.danger, textAlign: 'center', marginTop: -8 }}>{daysError}</Text>
                )}
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TouchableOpacity
                    onPress={() => { setShowDaysPopup(false); setDaysError(''); }}
                    style={{ flex: 1, padding: 14, borderRadius: RADIUS.lg, backgroundColor: COLORS.bg, alignItems: 'center' }}
                  >
                    <Text style={{ fontFamily: FONTS.bodyMed, color: COLORS.textMuted }}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      const n = parseInt(daysInput, 10);
                      if (!daysInput || isNaN(n)) { setDaysError('Please enter a number between 1 and 30.'); return; }
                      if (n < 1 || n > 30) { setDaysError('Please set a value between 1 and 30.'); return; }
                      setExpiryThreshold(n);
                      setActiveTab('expiring');
                      setDaysError('');
                      setShowDaysPopup(false);
                    }}
                    style={{ flex: 1, padding: 14, borderRadius: RADIUS.lg, backgroundColor: COLORS.primary, alignItems: 'center' }}
                  >
                    <Text style={{ fontFamily: FONTS.bodyMed, color: '#fff' }}>Apply</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
    </>
  );
}
