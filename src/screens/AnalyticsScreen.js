import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { FONTS, RADIUS } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { Animated, useFadeInUp, useStaggeredItem } from '../components/useAnimations';
import { Card, hapticLight } from '../components/shared';

function StatCard({ value, label, color }) {
  const { colors: COLORS } = useTheme();
  const styles = StyleSheet.create({
    statCard: {
      flex: 1,
      backgroundColor: COLORS.card,
      borderRadius: RADIUS.xl,
      padding: 16,
      alignItems: 'center',
    },
    statValue: {
      fontSize: 22,
      fontFamily: FONTS.display,
    },
    statLabel: {
      fontSize: 11,
      fontFamily: FONTS.body,
      color: COLORS.textMuted,
      marginTop: 4,
      textAlign: 'center',
    },
  });

  return (
    <View style={styles.statCard}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function BarChart({ data, maxVal, color }) {
  const { colors: COLORS } = useTheme();
  const styles = StyleSheet.create({
    barChart: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      height: 120,
      gap: 8,
    },
    barCol: {
      flex: 1,
      alignItems: 'center',
      height: '100%',
    },
    barTrack: {
      flex: 1,
      width: '100%',
      justifyContent: 'flex-end',
    },
    barFill: {
      width: '100%',
      borderRadius: 4,
      minHeight: 4,
    },
    barLabel: {
      fontSize: 10,
      fontFamily: FONTS.body,
      color: COLORS.textDim,
      marginTop: 6,
    },
  });

  return (
    <View style={styles.barChart}>
      {data.map((d, i) => (
        <View key={i} style={styles.barCol}>
          <View style={styles.barTrack}>
            <View
              style={[
                styles.barFill,
                {
                  height: `${(d.value / maxVal) * 100}%`,
                  backgroundColor: color,
                },
              ]}
            />
          </View>
          <Text style={styles.barLabel}>{d.label}</Text>
        </View>
      ))}
    </View>
  );
}

export default function AnalyticsScreen({ navigation, fridgeItems, shoppingList }) {
  const { colors: COLORS } = useTheme();
  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    content: { padding: 24, paddingTop: 60, paddingBottom: 40, gap: 20 },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    backBtn: {
      fontSize: 17,
      fontFamily: FONTS.bodyMed,
      color: COLORS.primary,
      width: 80,
    },
    title: {
      fontSize: 18,
      fontFamily: FONTS.bodyBold,
      color: COLORS.text,
    },
    sectionLabel: {
      fontSize: 13,
      fontFamily: FONTS.bodyBold,
      color: COLORS.textMuted,
      letterSpacing: 0.8,
      marginBottom: 10,
    },
    statsRow: {
      flexDirection: 'row',
      gap: 10,
    },
    cardTitle: {
      fontSize: 17,
      fontFamily: FONTS.bodyBold,
      color: COLORS.text,
      marginBottom: 16,
    },
    calorieNum: {
      fontSize: 28,
      fontFamily: FONTS.display,
      color: COLORS.text,
    },
    calorieSub: {
      fontSize: 13,
      fontFamily: FONTS.body,
      color: COLORS.textMuted,
      marginBottom: 16,
    },
    macroBar: {
      flexDirection: 'row',
      height: 10,
      borderRadius: 5,
      overflow: 'hidden',
      gap: 2,
    },
    macroSegment: {
      height: '100%',
    },
    macroLegend: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 12,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    legendDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    legendText: {
      fontSize: 12,
      fontFamily: FONTS.body,
      color: COLORS.textMuted,
    },
    cookedRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
    },
    cookedRank: {
      fontSize: 14,
      fontFamily: FONTS.bodyBold,
      color: COLORS.textDim,
      width: 24,
    },
    cookedName: {
      flex: 1,
      fontSize: 14,
      fontFamily: FONTS.bodyMed,
      color: COLORS.text,
    },
    cookedCount: {
      fontSize: 14,
      fontFamily: FONTS.bodyBold,
      color: COLORS.textMuted,
    },
    gridRow: {
      flexDirection: 'row',
      gap: 10,
    },
    gridCard: {
      flex: 1,
      alignItems: 'center',
    },
    gridValue: {
      fontSize: 28,
      fontFamily: FONTS.display,
    },
    gridLabel: {
      fontSize: 12,
      fontFamily: FONTS.body,
      color: COLORS.textMuted,
      marginTop: 4,
    },
  });

  const headerAnim = useFadeInUp();
  const anim0 = useStaggeredItem(0);
  const anim1 = useStaggeredItem(1);
  const anim2 = useStaggeredItem(2);
  const anim3 = useStaggeredItem(3);
  const anim4 = useStaggeredItem(4);

  const spendData = [
    { label: 'Oct', value: 320 },
    { label: 'Nov', value: 280 },
    { label: 'Dec', value: 410 },
    { label: 'Jan', value: 350 },
    { label: 'Feb', value: 290 },
    { label: 'Mar', value: 375 },
  ];

  const wasteData = [
    { label: 'Produce', value: 8 },
    { label: 'Dairy', value: 4 },
    { label: 'Meat', value: 2 },
    { label: 'Bakery', value: 5 },
    { label: 'Other', value: 1 },
  ];

  const mostCooked = [
    { name: 'Chicken Stir Fry', emoji: '🍗', count: 8 },
    { name: 'Pasta Carbonara', emoji: '🍝', count: 6 },
    { name: 'Banana Bread', emoji: '🍌', count: 4 },
    { name: 'Greek Yogurt Bowl', emoji: '🥄', count: 12 },
  ];

  const expiring = fridgeItems.filter((i) => i.expiryDays <= 3).length;
  const categories = [...new Set(fridgeItems.map((i) => i.category))].length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <Animated.View style={[styles.header, headerAnim]}>
        <TouchableOpacity onPress={() => { hapticLight(); navigation.goBack(); }}>
          <Text style={styles.backBtn}>‹ Settings</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Analytics</Text>
        <View style={{ width: 80 }} />
      </Animated.View>

      {/* This Month Stats */}
      <Animated.View style={anim0}>
        <Text style={styles.sectionLabel}>THIS MONTH</Text>
        <View style={styles.statsRow}>
          <StatCard value="18" label="Meals Cooked" color={COLORS.success} />
          <StatCard value="3" label="Items Wasted" color={COLORS.danger} />
          <StatCard value="$375" label="Spend" color={COLORS.primary} />
        </View>
      </Animated.View>

      {/* Monthly Spend */}
      <Animated.View style={anim1}>
        <Card>
          <Text style={styles.cardTitle}>Monthly Spend</Text>
          <BarChart data={spendData} maxVal={450} color={COLORS.primary} />
        </Card>
      </Animated.View>

      {/* Food Waste */}
      <Animated.View style={anim2}>
        <Card>
          <Text style={styles.cardTitle}>Food Waste by Category</Text>
          <BarChart data={wasteData} maxVal={10} color={COLORS.danger} />
        </Card>
      </Animated.View>

      {/* Weekly Nutrition */}
      <Animated.View style={anim3}>
        <Card>
          <Text style={styles.cardTitle}>Weekly Nutrition</Text>
          <Text style={styles.calorieNum}>14,200 kcal</Text>
          <Text style={styles.calorieSub}>avg 2,028/day</Text>
          <View style={styles.macroBar}>
            <View style={[styles.macroSegment, { flex: 30, backgroundColor: COLORS.success, borderTopLeftRadius: 4, borderBottomLeftRadius: 4 }]} />
            <View style={[styles.macroSegment, { flex: 45, backgroundColor: COLORS.info }]} />
            <View style={[styles.macroSegment, { flex: 25, backgroundColor: COLORS.warning, borderTopRightRadius: 4, borderBottomRightRadius: 4 }]} />
          </View>
          <View style={styles.macroLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.success }]} />
              <Text style={styles.legendText}>Protein 30%</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.info }]} />
              <Text style={styles.legendText}>Carbs 45%</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.warning }]} />
              <Text style={styles.legendText}>Fat 25%</Text>
            </View>
          </View>
        </Card>
      </Animated.View>

      {/* Most Cooked */}
      <Animated.View style={anim3}>
        <Card>
          <Text style={styles.cardTitle}>Most Cooked</Text>
          {mostCooked.map((r, i) => (
            <View key={i} style={styles.cookedRow}>
              <Text style={styles.cookedRank}>{i + 1}</Text>
              <Text style={{ fontSize: 20, marginRight: 10 }}>{r.emoji}</Text>
              <Text style={styles.cookedName}>{r.name}</Text>
              <Text style={styles.cookedCount}>{r.count}×</Text>
            </View>
          ))}
        </Card>
      </Animated.View>

      {/* Kitchen Right Now */}
      <Animated.View style={anim4}>
        <Text style={styles.sectionLabel}>KITCHEN RIGHT NOW</Text>
        <View style={styles.gridRow}>
          <Card style={styles.gridCard}>
            <Text style={[styles.gridValue, { color: COLORS.text }]}>{fridgeItems.length}</Text>
            <Text style={styles.gridLabel}>Total Items</Text>
          </Card>
          <Card style={styles.gridCard}>
            <Text style={[styles.gridValue, { color: COLORS.danger }]}>{expiring}</Text>
            <Text style={styles.gridLabel}>Expiring</Text>
          </Card>
        </View>
        <View style={styles.gridRow}>
          <Card style={styles.gridCard}>
            <Text style={[styles.gridValue, { color: COLORS.primary }]}>{shoppingList.filter((s) => !s.checked).length}</Text>
            <Text style={styles.gridLabel}>Shopping List</Text>
          </Card>
          <Card style={styles.gridCard}>
            <Text style={[styles.gridValue, { color: COLORS.success }]}>{categories}</Text>
            <Text style={styles.gridLabel}>Categories</Text>
          </Card>
        </View>
      </Animated.View>
    </ScrollView>
  );
}
