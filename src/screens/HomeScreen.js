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
import { MOCK_RECIPES } from '../data';
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

  return (
    <GroupedCard>
      <View style={{ position: 'relative' }}>
        <ScrollView
          ref={scrollRef}
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}
          style={{ maxHeight: 67 * 3 }}
          contentOffset={scrollY ? { x: 0, y: scrollY.current } : undefined}
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
    activityRow: { flexDirection: 'row', alignItems: 'center', padding: 14 },
    activityText: { fontSize: 14, fontFamily: FONTS.bodyMed, color: COLORS.text },
    activityTime: { fontSize: 12, fontFamily: FONTS.body, color: COLORS.textDim, marginTop: 2 },
    dayPill: {
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: RADIUS.full,
      backgroundColor: COLORS.card,
      marginRight: 8,
    },
    dayPillActive: { backgroundColor: COLORS.primary },
    dayPillText: { fontSize: 13, fontFamily: FONTS.bodyMed, color: COLORS.textMuted },
    dayPillTextActive: { color: '#fff' },
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

  const [selectedDate, setSelectedDate] = useState(null); // null = All
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

  // Last 30 days
  const days = useMemo(() => {
    const result = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      result.push(d.toISOString().split('T')[0]);
    }
    return result;
  }, []);

  const filteredActivity = useMemo(() => {
    if (!selectedDate) return activityFeed;
    return activityFeed.filter((a) => a.date === selectedDate);
  }, [activityFeed, selectedDate]);

  function dayLabel(dateStr) {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (dateStr === today) return 'Today';
    if (dateStr === yesterday) return 'Yesterday';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en', { weekday: 'short', day: 'numeric' });
  }

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
            if (showLocationBreakdown) {
              setShowLocationBreakdown(false);
            } else {
              setShowLocationBreakdown(true);
              setShowExpiring(false);
              setShowPerfectRecipes(false);
            }
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
            if (showPerfectRecipes) {
              setShowPerfectRecipes(false);
            } else {
              setShowPerfectRecipes(true);
              setShowLocationBreakdown(false);
              setShowExpiring(false);
            }
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

      {/* Recent Activity */}
      <Animated.View style={[{ gap: 12 }, anim4]}>
        <SectionTitle>Recent Activity</SectionTitle>

        {/* Day filter strip */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -24 }}>
          <View style={{ flexDirection: 'row', paddingHorizontal: 24 }}>
            <TouchableOpacity
              style={[styles.dayPill, !selectedDate && styles.dayPillActive]}
              onPress={() => { hapticLight(); setSelectedDate(null); }}
            >
              <Text style={[styles.dayPillText, !selectedDate && styles.dayPillTextActive]}>All</Text>
            </TouchableOpacity>
            {days.map((d) => (
              <TouchableOpacity
                key={d}
                style={[styles.dayPill, selectedDate === d && styles.dayPillActive]}
                onPress={() => { hapticLight(); setSelectedDate(d); }}
              >
                <Text style={[styles.dayPillText, selectedDate === d && styles.dayPillTextActive]}>
                  {dayLabel(d)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <GroupedCard>
          {filteredActivity.length === 0 ? (
            <Text style={styles.emptyText}>No activity on this day</Text>
          ) : (
            filteredActivity.map((a, i) => (
              <React.Fragment key={a.id}>
                <View style={styles.activityRow}>
                  <Text style={{ fontSize: 18, marginRight: 12 }}>{a.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.activityText}>{a.text}</Text>
                    <Text style={styles.activityTime}>{a.time}</Text>
                  </View>
                </View>
                {i < filteredActivity.length - 1 && <View style={styles.divider} />}
              </React.Fragment>
            ))
          )}
        </GroupedCard>
      </Animated.View>

    </ScrollView>

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
