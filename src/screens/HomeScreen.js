import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { COLORS, FONTS, RADIUS } from '../theme';
import { Animated, useFadeInUp, usePressScale, useStaggeredItem } from '../components/useAnimations';
import {
  ExpiryBadge,
  SectionTitle,
  GroupedCard,
  GroupedRow,
  hapticMedium,
  hapticLight,
} from '../components/shared';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function PressableButton({ label, icon, onPress, style: extraStyle }) {
  const press = usePressScale(0.96);
  return (
    <Animated.View style={press.style}>
      <TouchableOpacity
        style={[styles.scanBtn, extraStyle]}
        onPress={() => { hapticMedium(); onPress?.(); }}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        activeOpacity={1}
      >
        <Text style={{ fontSize: 18, marginRight: 8 }}>{icon}</Text>
        <Text style={styles.scanBtnText}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

function DayPill({ day, date, isToday }) {
  return (
    <View style={[styles.dayPill, isToday && styles.dayPillActive]}>
      <Text style={[styles.dayPillDay, isToday && { color: COLORS.primary }]}>{day}</Text>
      <Text style={[styles.dayPillDate, isToday && { color: COLORS.text }]}>{date}</Text>
    </View>
  );
}

export default function HomeScreen({ navigation, fridgeItems, mealPlan, activityFeed, userProfile }) {
  const anim0 = useStaggeredItem(0);
  const anim1 = useStaggeredItem(1);
  const anim2 = useStaggeredItem(2);
  const anim3 = useStaggeredItem(3);
  const anim4 = useStaggeredItem(4);
  const anim5 = useStaggeredItem(5);

  const expiring = fridgeItems.filter((i) => i.expiryDays <= 3);
  const fridgeCount = fridgeItems.filter((i) => i.location === 'Fridge').length;
  const freezerCount = fridgeItems.filter((i) => i.location === 'Freezer').length;
  const pantryCount = fridgeItems.filter((i) => i.location === 'Pantry').length;

  const weekDays = [];
  const today = new Date();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    weekDays.push({
      day: dayNames[d.getDay()],
      date: d.getDate(),
      isToday: i === 0,
      key: d.toISOString().split('T')[0],
    });
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
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
          <Text style={styles.avatarText}>
            {(userProfile.name || 'C')[0].toUpperCase()}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Scan Buttons */}
      <Animated.View style={[{ gap: 10 }, anim1]}>
        <PressableButton
          label="Scan Receipt"
          icon="📷"
          onPress={() => navigation.navigate('Scan')}
        />
        <PressableButton
          label="Scan Barcode"
          icon="📱"
          onPress={() => navigation.navigate('Scan')}
        />
      </Animated.View>

      {/* Expiring Alert */}
      {expiring.length > 0 && (
        <Animated.View style={[styles.alertBanner, anim2]}>
          <View style={styles.alertDot} />
          <Text style={styles.alertText}>
            {expiring.length} item{expiring.length > 1 ? 's' : ''} expiring soon
          </Text>
          <TouchableOpacity onPress={() => { hapticLight(); navigation.navigate('Recipes'); }}>
            <Text style={styles.alertAction}>Recipes ›</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Kitchen Section */}
      <Animated.View style={anim2}>
        <SectionTitle>Kitchen</SectionTitle>
        <GroupedCard>
          <GroupedRow
            icon="❄️"
            label="Fridge"
            value={`${fridgeCount} items`}
            onPress={() => navigation.navigate('Kitchen')}
          />
          <GroupedRow
            icon="🧊"
            label="Freezer"
            value={`${freezerCount} items`}
            onPress={() => navigation.navigate('Kitchen')}
          />
          <GroupedRow
            icon="🏪"
            label="Pantry"
            value={`${pantryCount} items`}
            onPress={() => navigation.navigate('Kitchen')}
            isLast
          />
        </GroupedCard>
      </Animated.View>

      {/* Quick Nav */}
      <Animated.View style={anim3}>
        <GroupedCard>
          <GroupedRow
            icon="📖"
            label="Recipes"
            subtitle="Generate from your kitchen"
            onPress={() => navigation.navigate('Recipes')}
          />
          <GroupedRow
            icon="📅"
            label="Meal Plan"
            subtitle="This week's schedule"
            onPress={() => navigation.navigate('MealPlan')}
          />
          <GroupedRow
            icon="🛒"
            label="Shopping List"
            subtitle="Items to buy"
            onPress={() => navigation.navigate('Shopping')}
            isLast
          />
        </GroupedCard>
      </Animated.View>

      {/* Expiring Soon */}
      {expiring.length > 0 && (
        <Animated.View style={anim4}>
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

      {/* This Week */}
      <Animated.View style={anim4}>
        <SectionTitle>This Week</SectionTitle>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -24 }}>
          <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 24 }}>
            {weekDays.map((d) => (
              <DayPill key={d.key} {...d} />
            ))}
          </View>
        </ScrollView>
      </Animated.View>

      {/* Recent Activity */}
      <Animated.View style={anim5}>
        <SectionTitle>Recent Activity</SectionTitle>
        <GroupedCard>
          {activityFeed.map((a, i) => (
            <React.Fragment key={a.id}>
              <View style={styles.activityRow}>
                <Text style={{ fontSize: 18, marginRight: 12 }}>{a.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.activityText}>{a.text}</Text>
                  <Text style={styles.activityTime}>{a.time}</Text>
                </View>
              </View>
              {i < activityFeed.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </GroupedCard>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  content: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 110,
    gap: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 15,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
  },
  userName: {
    fontSize: 28,
    fontFamily: FONTS.display,
    color: COLORS.text,
    marginTop: 2,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontFamily: FONTS.bodyBold,
    color: '#fff',
  },
  scanBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanBtnText: {
    fontSize: 15,
    fontFamily: FONTS.bodyBold,
    color: '#fff',
  },
  alertBanner: {
    backgroundColor: COLORS.dangerLight,
    borderRadius: RADIUS.xl,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.danger,
    marginRight: 10,
  },
  alertText: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.bodyMed,
    color: COLORS.danger,
  },
  alertAction: {
    fontSize: 14,
    fontFamily: FONTS.bodyBold,
    color: COLORS.danger,
  },
  expiringRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  expiringEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  expiringName: {
    fontSize: 15,
    fontFamily: FONTS.bodyMed,
    color: COLORS.text,
  },
  expiringQty: {
    fontSize: 12,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.border,
    marginLeft: 52,
  },
  dayPill: {
    width: 52,
    paddingVertical: 12,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    gap: 4,
  },
  dayPillActive: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  dayPillDay: {
    fontSize: 12,
    fontFamily: FONTS.bodyMed,
    color: COLORS.textMuted,
  },
  dayPillDate: {
    fontSize: 16,
    fontFamily: FONTS.bodyBold,
    color: COLORS.textSub,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  activityText: {
    fontSize: 14,
    fontFamily: FONTS.bodyMed,
    color: COLORS.text,
  },
  activityTime: {
    fontSize: 12,
    fontFamily: FONTS.body,
    color: COLORS.textDim,
    marginTop: 2,
  },
});
