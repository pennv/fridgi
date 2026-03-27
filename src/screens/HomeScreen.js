import React, { useState, useMemo, useRef, useEffect } from 'react';
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
  SectionTitle,
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

function ScanButton({ label, icon, onPress }) {
  const { colors: COLORS } = useTheme();
  const press = usePressScale(0.96);
  const styles = StyleSheet.create({
    btn: {
      flex: 1,
      backgroundColor: COLORS.card,
      borderRadius: RADIUS.xl,
      paddingVertical: 18,
      alignItems: 'center',
      gap: 6,
    },
    icon: { fontSize: 26 },
    label: {
      fontSize: 12,
      fontFamily: FONTS.bodyMed,
      color: COLORS.textMuted,
    },
  });
  return (
    <Animated.View style={[{ flex: 1 }, press.style]}>
      <TouchableOpacity
        style={styles.btn}
        onPress={() => { hapticMedium(); onPress?.(); }}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        activeOpacity={1}
      >
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.label}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

function ScrollableTable({ rows, renderRow, dividerLeft = 0, buttonDismissed, onButtonDismiss, scrollY }) {
  const { colors: COLORS } = useTheme();
  const scrollRef = useRef(null);
  const extra = rows.length - 3;
  const [showButton, setShowButton] = useState(extra > 0 && !buttonDismissed);
  const needsRestore = scrollY && scrollY.current > 0;
  const [restored, setRestored] = useState(!needsRestore);

  return (
    <GroupedCard>
      <View style={{ position: 'relative', opacity: restored ? 1 : 0 }}>
        <ScrollView
          ref={scrollRef}
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}
          style={{ maxHeight: 67 * 3 }}
          contentOffset={needsRestore ? { x: 0, y: scrollY.current } : undefined}
          onContentSizeChange={() => {
            if (!restored) {
              if (needsRestore) {
                scrollRef.current?.scrollTo({ x: 0, y: scrollY.current, animated: false });
              }
              setRestored(true);
            }
          }}
          onScroll={(e) => {
            const y = e.nativeEvent.contentOffset.y;
            if (scrollY) scrollY.current = y;
            if (y > 8) { setShowButton(false); onButtonDismiss?.(); }
          }}
          scrollEventThrottle={16}
        >
          {rows.map((row, i) => (
            <React.Fragment key={i}>
              {renderRow(row, i)}
              {i < rows.length - 1 && (
                <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: COLORS.border, marginLeft: dividerLeft }} />
              )}
            </React.Fragment>
          ))}
        </ScrollView>

        {showButton && (
          <TouchableOpacity
            onPress={() => {
              scrollRef.current?.scrollToEnd({ animated: true });
              setShowButton(false);
              onButtonDismiss?.();
            }}
            activeOpacity={0.8}
            style={{ position: 'absolute', bottom: 10, left: 0, right: 0, alignItems: 'center' }}
          >
            <View style={{
              backgroundColor: COLORS.card,
              borderRadius: 20,
              paddingHorizontal: 14,
              paddingVertical: 6,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.12,
              shadowRadius: 6,
              elevation: 4,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: COLORS.border,
            }}>
              <Text style={{ fontSize: 12, fontFamily: FONTS.bodyMed, color: COLORS.textMuted }}>
                ↓  {extra} more
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    </GroupedCard>
  );
}

function StatCard({ value, label, accent, onPress, onLongPress }) {
  const { colors: COLORS } = useTheme();
  const press = usePressScale(0.97);
  const styles = StyleSheet.create({
    card: {
      flex: 1,
      backgroundColor: COLORS.card,
      borderRadius: RADIUS.xl,
      padding: 16,
      gap: 4,
    },
    value: {
      fontSize: 32,
      fontFamily: FONTS.display,
      color: accent || COLORS.text,
      lineHeight: 36,
    },
    label: {
      fontSize: 12,
      fontFamily: FONTS.bodyMed,
      color: COLORS.textMuted,
    },
  });
  return (
    <Animated.View style={[{ flex: 1 }, press.style]}>
      <TouchableOpacity
        style={styles.card}
        onPress={() => { hapticLight(); onPress?.(); }}
        onLongPress={() => { hapticMedium(); onLongPress?.(); }}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        activeOpacity={1}
      >
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.label}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
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
    scanCard: {
      backgroundColor: COLORS.primary,
      borderRadius: RADIUS.xxl,
      padding: 20,
      gap: 16,
    },
    scanTitle: { fontSize: 13, fontFamily: FONTS.bodyMed, color: 'rgba(255,255,255,0.7)' },
    scanRow: { flexDirection: 'row', gap: 10 },
    statsRow: { flexDirection: 'row', gap: 10 },
    alertBanner: {
      backgroundColor: COLORS.dangerLight,
      borderRadius: RADIUS.xl,
      padding: 14,
      flexDirection: 'row',
      alignItems: 'center',
    },
    alertDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.danger, marginRight: 10 },
    alertText: { flex: 1, fontSize: 14, fontFamily: FONTS.bodyMed, color: COLORS.danger },
    alertAction: { fontSize: 14, fontFamily: FONTS.bodyBold, color: COLORS.danger },
    expiringRow: { flexDirection: 'row', alignItems: 'center', padding: 16 },
    expiringEmoji: { fontSize: 24, marginRight: 12 },
    expiringName: { fontSize: 15, fontFamily: FONTS.bodyMed, color: COLORS.text },
    expiringQty: { fontSize: 12, fontFamily: FONTS.body, color: COLORS.textMuted, marginTop: 2 },
    divider: { height: StyleSheet.hairlineWidth, backgroundColor: COLORS.border, marginLeft: 52 },
    emptyText: {
      fontSize: 14,
      fontFamily: FONTS.body,
      color: COLORS.textMuted,
      textAlign: 'center',
      paddingVertical: 20,
    },
  });

  const anim0 = useStaggeredItem(0);
  const anim1 = useStaggeredItem(1);
  const anim2 = useStaggeredItem(2);
  const anim3 = useStaggeredItem(3);
  const anim4 = useStaggeredItem(4);

  const [showLocationBreakdown, setShowLocationBreakdown] = useState(false);
  const [showExpiring, setShowExpiring] = useState(true);
  const [showPerfectRecipes, setShowPerfectRecipes] = useState(false);
  const [expiryThreshold, setExpiryThreshold] = useState(3);
  const [showDaysPopup, setShowDaysPopup] = useState(false);
  const [daysInput, setDaysInput] = useState('3');
  const [daysError, setDaysError] = useState('');
  const [locationBtnDismissed, setLocationBtnDismissed] = useState(false);
  const [expiringBtnDismissed, setExpiringBtnDismissed] = useState(false);
  const [perfectBtnDismissed, setPerfectBtnDismissed] = useState(false);
  const locationScrollY = useRef(0);
  const expiringScrollY = useRef(0);
  const perfectScrollY = useRef(0);

  const health = INITIAL_HEALTH_DATA;
  const [calorieGoal, setCalorieGoal] = useState(health.dailyCalorieGoal);
  const [showGoalPopup, setShowGoalPopup] = useState(false);
  const [goalInput, setGoalInput] = useState(String(health.dailyCalorieGoal));
  const [goalError, setGoalError] = useState('');

  const caloriePct = Math.min((health.today.calories / calorieGoal) * 100, 100);
  const maxWeeklyCal = Math.max(...health.weekly.map((w) => w.calories), calorieGoal);


  const expiring = fridgeItems.filter((i) => i.expiryDays <= expiryThreshold).sort((a, b) => a.expiryDays - b.expiryDays);
  const totalItems = fridgeItems.length;
  const locationCounts = {
    Fridge: fridgeItems.filter((i) => i.location === 'Fridge').length,
    Freezer: fridgeItems.filter((i) => i.location === 'Freezer').length,
    Pantry: fridgeItems.filter((i) => i.location === 'Pantry').length,
  };

  const perfectRecipes = useMemo(() => {
    const fridgeNames = fridgeItems.map((i) => i.name.toLowerCase());
    return MOCK_RECIPES
      .filter((recipe) =>
        recipe.ingredients
          .filter((ing) => ing.fromFridge)
          .every((ing) => fridgeNames.includes(ing.name.toLowerCase()))
      )
      .map((recipe) => {
        const expiringCount = recipe.ingredients.filter((ing) =>
          ing.fromFridge &&
          fridgeItems.find(
            (fi) => fi.name.toLowerCase() === ing.name.toLowerCase() && fi.expiryDays <= expiryThreshold
          )
        ).length;
        return { ...recipe, expiringCount };
      })
      .sort((a, b) => b.expiringCount - a.expiringCount);
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

      {/* Scan Hero */}
      <Animated.View style={[styles.scanCard, anim1]}>
        <Text style={styles.scanTitle}>ADD TO KITCHEN</Text>
        <View style={styles.scanRow}>
          <ScanButton label="Receipt" icon="📷" onPress={() => navigation.navigate('Scan')} />
          <ScanButton label="Barcode" icon="📱" onPress={() => navigation.navigate('Scan')} />
        </View>
      </Animated.View>

      {/* Stats */}
      <Animated.View style={[styles.statsRow, anim2]}>
        <StatCard
          value={totalItems}
          label="Total items"
          onPress={() => {
            hapticLight();
            setShowLocationBreakdown(true);
            setShowExpiring(false);
            setShowPerfectRecipes(false);
          }}
        />
        <StatCard
          value={expiring.length}
          label={`expiring in ${expiryThreshold} day${expiryThreshold === 1 ? '' : 's'}`}
          accent={expiring.length > 0 ? COLORS.danger : COLORS.text}
          onPress={() => { hapticLight(); setShowExpiring(true); setShowLocationBreakdown(false); setShowPerfectRecipes(false); }}
          onLongPress={() => { setDaysInput(String(expiryThreshold)); setShowDaysPopup(true); }}
        />
        <StatCard
          value={perfectRecipes.length}
          label="Perfect recipes"
          accent={perfectRecipes.length > 0 ? COLORS.success : COLORS.text}
          onPress={() => {
            hapticLight();
            setShowPerfectRecipes(true);
            setShowLocationBreakdown(false);
            setShowExpiring(false);
          }}
        />
      </Animated.View>

      {/* Total Items / Expiring / Default */}
      <Animated.View style={anim3}>
        {showLocationBreakdown ? (
          <>
            <SectionTitle>Total Items</SectionTitle>
            <ScrollableTable
              key="location"
              buttonDismissed={locationBtnDismissed}
              onButtonDismiss={() => setLocationBtnDismissed(true)}
              scrollY={locationScrollY}
              rows={[{ label: 'Fridge', emoji: '🧊' }, { label: 'Freezer', emoji: '❄️' }, { label: 'Pantry', emoji: '🗄️' }]}
              renderRow={({ label, emoji }) => (
                <View style={styles.expiringRow}>
                  <Text style={styles.expiringEmoji}>{emoji}</Text>
                  <Text style={[styles.expiringName, { flex: 1 }]}>{label}</Text>
                  <Text style={[styles.expiringName, { color: COLORS.textMuted }]}>{locationCounts[label]}</Text>
                </View>
              )}
              dividerLeft={52}
            />
          </>
        ) : showExpiring ? (
          <>
            <SectionTitle>Expiring in {expiryThreshold} day{expiryThreshold === 1 ? '' : 's'}</SectionTitle>
            <ScrollableTable
              key="expiring"
              buttonDismissed={expiringBtnDismissed}
              onButtonDismiss={() => setExpiringBtnDismissed(true)}
              scrollY={expiringScrollY}
              rows={expiring}
              renderRow={(item) => (
                <View style={styles.expiringRow}>
                  <Text style={styles.expiringEmoji}>{item.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.expiringName}>{item.name}</Text>
                    <Text style={styles.expiringQty}>{item.qty} {item.unit}</Text>
                  </View>
                  <ExpiryBadge days={item.expiryDays} />
                </View>
              )}
              dividerLeft={52}
            />
          </>
        ) : showPerfectRecipes ? (
          <>
            <SectionTitle>Perfect Recipes</SectionTitle>
            {perfectRecipes.length === 0 ? (
              <GroupedCard>
                <Text style={styles.emptyText}>No recipes match your current inventory</Text>
              </GroupedCard>
            ) : (
              <ScrollableTable
                key="perfect"
                buttonDismissed={perfectBtnDismissed}
                onButtonDismiss={() => setPerfectBtnDismissed(true)}
                scrollY={perfectScrollY}
                rows={perfectRecipes}
                renderRow={(recipe) => (
                  <View style={styles.expiringRow}>
                    <Text style={styles.expiringEmoji}>{recipe.emoji}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.expiringName}>{recipe.name}</Text>
                      <Text style={styles.expiringQty}>{recipe.time} · {recipe.difficulty}</Text>
                    </View>
                    {recipe.expiringCount > 0 && (
                      <View style={{ backgroundColor: COLORS.dangerLight, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4 }}>
                        <Text style={{ fontSize: 11, fontFamily: FONTS.bodyBold, color: COLORS.danger }}>
                          {recipe.expiringCount} expiring
                        </Text>
                      </View>
                    )}
                  </View>
                )}
                dividerLeft={52}
              />
            )}
          </>
        ) : null}
      </Animated.View>

      {/* Nutrition Dashboard */}
      <Animated.View style={[{ gap: 12 }, anim4]}>
        <SectionTitle>Nutrition</SectionTitle>

        {/* Calorie card - full width, long press to set goal */}
        <TouchableOpacity
          onLongPress={() => { hapticMedium(); setGoalInput(String(calorieGoal)); setShowGoalPopup(true); }}
          activeOpacity={0.9}
          style={{ backgroundColor: COLORS.card, borderRadius: RADIUS.xl, padding: 16, gap: 10 }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
              <Text style={{ fontSize: 32, fontFamily: FONTS.display, color: COLORS.text, lineHeight: 36 }}>
                {health.today.calories.toLocaleString()}
              </Text>
              <Text style={{ fontSize: 13, fontFamily: FONTS.body, color: COLORS.textMuted }}>
                / {calorieGoal.toLocaleString()} kcal
              </Text>
            </View>
            <Text style={{ fontSize: 10, fontFamily: FONTS.body, color: COLORS.textMuted, marginTop: 6 }}>
              hold to set goal
            </Text>
          </View>
          <View style={{ height: 6, backgroundColor: COLORS.cardAlt, borderRadius: 3, overflow: 'hidden' }}>
            <View style={{
              width: `${caloriePct}%`,
              height: '100%',
              backgroundColor: caloriePct >= 90 ? COLORS.warning : COLORS.primary,
              borderRadius: 3,
            }} />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={{ fontSize: 12, fontFamily: FONTS.bodyMed, color: COLORS.primary }}>
                {Math.round(caloriePct)}%
              </Text>
              <Text style={{ fontSize: 12, fontFamily: FONTS.body, color: COLORS.textMuted }}>of daily goal</Text>
            </View>
            <Text style={{ fontSize: 12, fontFamily: FONTS.body, color: COLORS.textMuted }}>
              {Math.max(0, calorieGoal - health.today.calories).toLocaleString()} kcal remaining
            </Text>
          </View>
        </TouchableOpacity>

        {/* Weekly Trend */}
        <View style={{ backgroundColor: COLORS.card, borderRadius: RADIUS.xl, padding: 16, gap: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 14, fontFamily: FONTS.bodyBold, color: COLORS.text }}>This week</Text>
            <Text style={{ fontSize: 12, fontFamily: FONTS.body, color: COLORS.textMuted }}>
              avg {Math.round(health.weekly.reduce((s, w) => s + w.calories, 0) / health.weekly.length).toLocaleString()} kcal
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 80 }}>
            {health.weekly.map((w, i) => {
              const barH = (w.calories / maxWeeklyCal) * 70;
              const isToday = i === health.weekly.length - 1;
              const overGoal = w.calories > calorieGoal;
              return (
                <View key={w.day} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
                  <Text style={{ fontSize: 9, fontFamily: FONTS.body, color: COLORS.textMuted }}>
                    {w.calories >= 1000 ? `${(w.calories / 1000).toFixed(1)}k` : w.calories}
                  </Text>
                  <View style={{
                    width: '100%',
                    height: barH,
                    borderRadius: 4,
                    backgroundColor: isToday ? COLORS.primary : overGoal ? COLORS.warning + '80' : COLORS.primary + '40',
                  }} />
                  <Text style={{
                    fontSize: 11,
                    fontFamily: isToday ? FONTS.bodyBold : FONTS.body,
                    color: isToday ? COLORS.primary : COLORS.textMuted,
                  }}>
                    {w.day}
                  </Text>
                </View>
              );
            })}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <View style={{ width: 12, height: 2, backgroundColor: COLORS.textMuted, borderRadius: 1 }} />
            <Text style={{ fontSize: 10, fontFamily: FONTS.body, color: COLORS.textMuted }}>
              {calorieGoal.toLocaleString()} kcal goal
            </Text>
          </View>
        </View>

        {/* Today's Meals */}
        <SectionTitle>Today's meals</SectionTitle>
        <GroupedCard>
          {health.today.meals.map((meal, i) => (
            <React.Fragment key={meal.id}>
              <View style={{ flexDirection: 'row', alignItems: 'center', padding: 14 }}>
                <Text style={{ fontSize: 22, marginRight: 12 }}>{meal.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontFamily: FONTS.bodyMed, color: COLORS.text }}>{meal.name}</Text>
                  <Text style={{ fontSize: 12, fontFamily: FONTS.body, color: COLORS.textMuted, marginTop: 2 }}>{meal.time}</Text>
                </View>
                <Text style={{ fontSize: 14, fontFamily: FONTS.bodyBold, color: COLORS.text }}>{meal.calories}</Text>
                <Text style={{ fontSize: 11, fontFamily: FONTS.body, color: COLORS.textMuted, marginLeft: 2 }}>kcal</Text>
              </View>
              {i < health.today.meals.length - 1 && (
                <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: COLORS.border, marginLeft: 48 }} />
              )}
            </React.Fragment>
          ))}
        </GroupedCard>
      </Animated.View>

    </ScrollView>

    {/* Calorie goal popup */}
    <Modal visible={showGoalPopup} transparent animationType="fade" onRequestClose={() => { setShowGoalPopup(false); setGoalError(''); }}>
      <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); setShowGoalPopup(false); setGoalError(''); }}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
              <View style={{ backgroundColor: COLORS.card, borderRadius: RADIUS.xxl, padding: 24, width: 280, gap: 16 }}>
                <Text style={{ fontSize: 17, fontFamily: FONTS.bodyBold, color: COLORS.text }}>Daily Calorie Goal</Text>
                <Text style={{ fontSize: 14, fontFamily: FONTS.body, color: COLORS.textMuted }}>
                  Set your target calories for the day.
                </Text>
                <TextInput
                  value={goalInput}
                  onChangeText={(t) => { setGoalInput(t); setGoalError(''); }}
                  keyboardType="number-pad"
                  maxLength={5}
                  autoFocus
                  style={{
                    backgroundColor: COLORS.bg,
                    borderRadius: RADIUS.lg,
                    padding: 14,
                    fontSize: 24,
                    fontFamily: FONTS.display,
                    color: COLORS.text,
                    textAlign: 'center',
                    borderWidth: goalError ? 1.5 : 0,
                    borderColor: COLORS.danger,
                  }}
                />
                {!!goalError && (
                  <Text style={{ fontSize: 12, fontFamily: FONTS.bodyMed, color: COLORS.danger, textAlign: 'center', marginTop: -8 }}>
                    {goalError}
                  </Text>
                )}
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TouchableOpacity
                    onPress={() => { setShowGoalPopup(false); setGoalError(''); }}
                    style={{ flex: 1, padding: 14, borderRadius: RADIUS.lg, backgroundColor: COLORS.bg, alignItems: 'center' }}
                  >
                    <Text style={{ fontFamily: FONTS.bodyMed, color: COLORS.textMuted }}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      const n = parseInt(goalInput, 10);
                      if (!goalInput || isNaN(n)) { setGoalError('Please enter a number.'); return; }
                      if (n < 500 || n > 9999) { setGoalError('Enter a value between 500 and 9999.'); return; }
                      setCalorieGoal(n);
                      setGoalError('');
                      setShowGoalPopup(false);
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
              <View style={{
                backgroundColor: COLORS.card,
                borderRadius: RADIUS.xxl,
                padding: 24,
                width: 280,
                gap: 16,
              }}>
                <Text style={{ fontSize: 17, fontFamily: FONTS.bodyBold, color: COLORS.text }}>
                  Set Expiry Window
                </Text>
                <Text style={{ fontSize: 14, fontFamily: FONTS.body, color: COLORS.textMuted }}>
                  Show items expiring within how many days?
                </Text>
                <TextInput
                  value={daysInput}
                  onChangeText={(t) => { setDaysInput(t); setDaysError(''); }}
                  keyboardType="number-pad"
                  maxLength={2}
                  autoFocus
                  style={{
                    backgroundColor: COLORS.bg,
                    borderRadius: RADIUS.lg,
                    padding: 14,
                    fontSize: 24,
                    fontFamily: FONTS.display,
                    color: COLORS.text,
                    textAlign: 'center',
                    borderWidth: daysError ? 1.5 : 0,
                    borderColor: COLORS.danger,
                  }}
                />
                {!!daysError && (
                  <Text style={{ fontSize: 12, fontFamily: FONTS.bodyMed, color: COLORS.danger, textAlign: 'center', marginTop: -8 }}>
                    {daysError}
                  </Text>
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
                      if (!daysInput || isNaN(n)) {
                        setDaysError('Please enter a number between 1 and 30.');
                        return;
                      }
                      if (n < 1 || n > 30) {
                        setDaysError('Please set a value between 1 and 30.');
                        return;
                      }
                      setExpiryThreshold(n);
                      setShowExpiring(true);
                      setShowLocationBreakdown(false);
                      setShowPerfectRecipes(false);
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
