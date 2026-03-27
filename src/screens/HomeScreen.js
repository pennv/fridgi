import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { FONTS, RADIUS } from '../theme';
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

function StatCard({ value, label, accent, onPress }) {
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

  const expiring = fridgeItems.filter((i) => i.expiryDays <= 3);
  const totalItems = fridgeItems.length;
  const fridgeCount = fridgeItems.filter((i) => i.location === 'Fridge').length;
  const mealsCount = Object.values(mealPlan || {}).reduce((acc, day) => {
    return acc + Object.values(day || {}).filter(Boolean).length;
  }, 0);

  return (
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
          label="Total Items"
          onPress={() => navigation.navigate('Kitchen')}
        />
        <StatCard
          value={expiring.length}
          label="Expiring Soon"
          accent={expiring.length > 0 ? COLORS.danger : COLORS.text}
          onPress={() => navigation.navigate('Kitchen')}
        />
        <StatCard
          value={fridgeCount}
          label="In Fridge"
          onPress={() => navigation.navigate('Kitchen')}
        />
        <StatCard
          value={mealsCount}
          label="Meals Planned"
          onPress={() => navigation.navigate('MealPlan')}
        />
      </Animated.View>

      {/* Expiring Alert */}
      {expiring.length > 0 && (
        <Animated.View style={[styles.alertBanner, anim3]}>
          <View style={styles.alertDot} />
          <Text style={styles.alertText}>
            {expiring.length} item{expiring.length > 1 ? 's' : ''} expiring soon
          </Text>
          <TouchableOpacity onPress={() => { hapticLight(); navigation.navigate('Recipes'); }}>
            <Text style={styles.alertAction}>Use in Recipes ›</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Expiring Soon */}
      {expiring.length > 0 && (
        <Animated.View style={anim3}>
          <SectionTitle>Expiring Soon</SectionTitle>
          <GroupedCard>
            {expiring.map((item, i) => (
              <React.Fragment key={item.id}>
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
        </Animated.View>
      )}

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
  );
}
