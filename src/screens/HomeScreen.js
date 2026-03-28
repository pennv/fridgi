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
              if (needsRestore) scrollRef.current?.scrollTo({ x: 0, y: scrollY.current, animated: false });
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
            onPress={() => { scrollRef.current?.scrollToEnd({ animated: true }); setShowButton(false); onButtonDismiss?.(); }}
            activeOpacity={0.8}
            style={{ position: 'absolute', bottom: 10, left: 0, right: 0, alignItems: 'center' }}
          >
            <View style={{
              backgroundColor: COLORS.card, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6,
              shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 6, elevation: 4,
              borderWidth: StyleSheet.hairlineWidth, borderColor: COLORS.border,
            }}>
              <Text style={{ fontSize: 12, fontFamily: FONTS.bodyMed, color: COLORS.textMuted }}>↓  {extra} more</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    </GroupedCard>
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

  const [activeTab, setActiveTab] = useState('expiring');
  const [locationBtnDismissed, setLocationBtnDismissed] = useState(false);
  const [expiringBtnDismissed, setExpiringBtnDismissed] = useState(false);
  const [perfectBtnDismissed, setPerfectBtnDismissed] = useState(false);
  const locationScrollY = useRef(0);
  const expiringScrollY = useRef(0);
  const perfectScrollY = useRef(0);
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

  const caloriePct = (todayCalories / calorieGoal) * 100;
  const maxDailyCal = Math.max(...health.daily.map((w) => w.calories), calorieGoal);
  const chartScrollRef = useRef(null);


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

      {/* Stats — tab selector */}
      <Animated.View style={[styles.statsRow, anim2]}>
        {[
          { id: 'location', value: totalItems, label: 'Total items', accent: null },
          { id: 'expiring', value: expiring.length, label: `${expiryThreshold}d expiring`, accent: expiring.length > 0 ? COLORS.danger : null },
          { id: 'recipes', value: perfectRecipes.length, label: 'Recipes', accent: perfectRecipes.length > 0 ? COLORS.success : null },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={{
                flex: 1,
                backgroundColor: isActive ? COLORS.primary : COLORS.card,
                borderRadius: RADIUS.xl,
                padding: 16,
                gap: 4,
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
        )}
        {activeTab === 'expiring' && (
          expiring.length === 0
            ? <GroupedCard><Text style={styles.emptyText}>No items expiring in {expiryThreshold} day{expiryThreshold === 1 ? '' : 's'}</Text></GroupedCard>
            : <ScrollableTable
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
        )}
        {activeTab === 'recipes' && (
          perfectRecipes.length === 0
            ? <GroupedCard><Text style={styles.emptyText}>No recipes match your current inventory</Text></GroupedCard>
            : <ScrollableTable
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
                        <Text style={{ fontSize: 11, fontFamily: FONTS.bodyBold, color: COLORS.danger }}>{recipe.expiringCount} expiring</Text>
                      </View>
                    )}
                  </View>
                )}
                dividerLeft={52}
              />
        )}
      </Animated.View>

      {/* Nutrition Dashboard */}
      <Animated.View style={[{ gap: 12 }, anim4]}>
        <SectionTitle>Nutrition</SectionTitle>

        {/* Calorie card — long press to edit intake + goal */}
        <TouchableOpacity
          onLongPress={() => { hapticMedium(); setIntakeInput(String(todayCalories)); setGoalInput(String(calorieGoal)); setShowCaloriePopup(true); }}
          activeOpacity={0.9}
          style={{ backgroundColor: COLORS.card, borderRadius: RADIUS.xl, padding: 16, gap: 10 }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
            <Text style={{ fontSize: 32, fontFamily: FONTS.display, color: COLORS.text, lineHeight: 36 }}>
              {todayCalories.toLocaleString()}
            </Text>
            <Text style={{ fontSize: 13, fontFamily: FONTS.body, color: COLORS.textMuted }}>
              / {calorieGoal.toLocaleString()} kcal
            </Text>
          </View>
          <View style={{ height: 6, backgroundColor: COLORS.cardAlt, borderRadius: 3, overflow: 'hidden' }}>
            <View style={{
              width: `${Math.min(caloriePct, 100)}%`,
              height: '100%',
              backgroundColor: caloriePct > 200 ? COLORS.danger : caloriePct > 100 ? COLORS.warning : COLORS.primary,
              borderRadius: 3,
            }} />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={{ fontSize: 12, fontFamily: FONTS.bodyMed, color: caloriePct > 200 ? COLORS.danger : caloriePct > 100 ? COLORS.warning : COLORS.primary }}>
                {Math.round(caloriePct)}%
              </Text>
              <Text style={{ fontSize: 12, fontFamily: FONTS.body, color: COLORS.textMuted }}>of daily goal</Text>
            </View>
            <Text style={{ fontSize: 12, fontFamily: FONTS.body, color: COLORS.textMuted }}>
              {Math.max(0, calorieGoal - todayCalories).toLocaleString()} kcal remaining
            </Text>
          </View>
        </TouchableOpacity>

        {/* 30-day Trend */}
        <View style={{ backgroundColor: COLORS.card, borderRadius: RADIUS.xl, padding: 16, gap: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 14, fontFamily: FONTS.bodyBold, color: COLORS.text }}>Last 30 days</Text>
            <Text style={{ fontSize: 12, fontFamily: FONTS.body, color: COLORS.textMuted }}>
              avg {Math.round(health.daily.reduce((s, w) => s + w.calories, 0) / health.daily.length).toLocaleString()} kcal
            </Text>
          </View>
          <ScrollView ref={chartScrollRef} horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 90 }}>
              {[...health.daily].reverse().map((w, i) => {
                const barH = (w.calories / maxDailyCal) * 70;
                const isToday = i === 0;
                const overGoal = w.calories > calorieGoal;
                return (
                  <View key={i} style={{ width: 28, alignItems: 'center', gap: 4 }}>
                    <Text style={{ fontSize: 8, fontFamily: FONTS.body, color: COLORS.textMuted }}>
                      {w.calories >= 1000 ? `${(w.calories / 1000).toFixed(1)}k` : w.calories}
                    </Text>
                    <View style={{
                      width: 28, height: barH, borderRadius: 4,
                      backgroundColor: isToday ? COLORS.primary : overGoal ? COLORS.warning + '80' : COLORS.primary + '40',
                    }} />
                    <Text style={{
                      fontSize: 10,
                      fontFamily: isToday ? FONTS.bodyBold : FONTS.body,
                      color: isToday ? COLORS.primary : COLORS.textMuted,
                    }}>{w.day}</Text>
                  </View>
                );
              })}
            </View>
          </ScrollView>
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

    {/* Calorie edit popup — intake + goal */}
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
