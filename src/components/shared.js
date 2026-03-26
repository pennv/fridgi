import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { COLORS, FONTS, RADIUS } from '../theme';
import { Animated, usePressScale } from './useAnimations';
import * as Haptics from 'expo-haptics';

// Haptic helpers
export const hapticSelection = () => Haptics.selectionAsync();
export const hapticLight = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
export const hapticMedium = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
export const hapticComplete = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
export const hapticSuccess = () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
export const hapticError = () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
export const hapticDestructive = () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

export function ExpiryBadge({ days }) {
  let color = COLORS.success;
  let bgColor = COLORS.successLight;
  let label = `${days}d`;

  if (days <= 2) {
    color = COLORS.danger;
    bgColor = COLORS.dangerLight;
    label = days <= 0 ? 'Expired' : `${days}d`;
  } else if (days <= 7) {
    color = COLORS.warning;
    bgColor = COLORS.warningLight;
  }

  return (
    <View style={[styles.expiryBadge, { backgroundColor: bgColor }]}>
      <View style={[styles.expiryDot, { backgroundColor: color }]} />
      <Text style={[styles.expiryText, { color }]}>{label}</Text>
    </View>
  );
}

export function Tag({ label, color = COLORS.primary }) {
  return (
    <View style={[styles.tag, { backgroundColor: color + '33' }]}>
      <Text style={[styles.tagText, { color }]}>{label}</Text>
    </View>
  );
}

export function PillRow({ icon, label, value, onPress, right, hasSwitch }) {
  const press = usePressScale(0.97);

  return (
    <Animated.View style={press.style}>
      <TouchableOpacity
        style={styles.pillRow}
        onPress={() => { hapticLight(); onPress?.(); }}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        activeOpacity={1}
      >
        {icon && <Text style={styles.pillRowIcon}>{icon}</Text>}
        <Text style={styles.pillRowLabel}>{label}</Text>
        <View style={{ flex: 1 }} />
        {value && <Text style={styles.pillRowValue}>{value}</Text>}
        {right}
        {!right && !hasSwitch && (
          <Text style={styles.chevron}>›</Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

export function PrimaryButton({ label, onPress, disabled, icon, style: extraStyle }) {
  const press = usePressScale(0.96);

  return (
    <Animated.View style={press.style}>
      <TouchableOpacity
        style={[styles.primaryBtn, disabled && styles.primaryBtnDisabled, extraStyle]}
        onPress={() => { hapticMedium(); onPress?.(); }}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        activeOpacity={1}
        disabled={disabled}
      >
        {icon && <Text style={{ fontSize: 16, marginRight: 8 }}>{icon}</Text>}
        <Text style={styles.primaryBtnText}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export function GhostButton({ label, onPress, color = COLORS.primary }) {
  const press = usePressScale(0.96);

  return (
    <Animated.View style={press.style}>
      <TouchableOpacity
        style={[styles.ghostBtn, { borderColor: color }]}
        onPress={() => { hapticLight(); onPress?.(); }}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        activeOpacity={1}
      >
        <Text style={[styles.ghostBtnText, { color }]}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export function Card({ children, style, onPress }) {
  const press = usePressScale(0.98);

  if (onPress) {
    return (
      <Animated.View style={press.style}>
        <TouchableOpacity
          style={[styles.card, style]}
          onPress={() => { hapticLight(); onPress(); }}
          onPressIn={press.onPressIn}
          onPressOut={press.onPressOut}
          activeOpacity={1}
        >
          {children}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return <View style={[styles.card, style]}>{children}</View>;
}

export function IngredientMatchBar({ have, total }) {
  const pct = total > 0 ? (have / total) * 100 : 0;
  const color = pct >= 80 ? COLORS.success : pct >= 50 ? COLORS.warning : COLORS.textMuted;

  return (
    <View style={styles.matchBarWrap}>
      <View style={styles.matchBarTrack}>
        <View style={[styles.matchBarFill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
      <Text style={[styles.matchBarLabel, { color }]}>{have}/{total}</Text>
    </View>
  );
}

export function SectionTitle({ children, right }) {
  return (
    <View style={styles.sectionTitleRow}>
      <Text style={styles.sectionTitle}>{children}</Text>
      {right}
    </View>
  );
}

export function LinkText({ children, onPress }) {
  return (
    <TouchableOpacity onPress={() => { hapticLight(); onPress?.(); }}>
      <Text style={styles.linkText}>{children}</Text>
    </TouchableOpacity>
  );
}

export function Divider() {
  return <View style={styles.divider} />;
}

export function GroupedCard({ children }) {
  return (
    <View style={styles.groupedCard}>
      {children}
    </View>
  );
}

export function GroupedRow({ icon, label, subtitle, value, onPress, right, isLast }) {
  const press = usePressScale(0.98);

  return (
    <>
      <Animated.View style={press.style}>
        <TouchableOpacity
          style={styles.groupedRowInner}
          onPress={() => { hapticLight(); onPress?.(); }}
          onPressIn={press.onPressIn}
          onPressOut={press.onPressOut}
          activeOpacity={1}
        >
          {icon && <Text style={styles.groupedRowIcon}>{icon}</Text>}
          <View style={{ flex: 1 }}>
            <Text style={styles.groupedRowLabel}>{label}</Text>
            {subtitle && <Text style={styles.groupedRowSub}>{subtitle}</Text>}
          </View>
          {value && <Text style={styles.groupedRowValue}>{value}</Text>}
          {right}
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </Animated.View>
      {!isLast && <View style={styles.groupedDivider} />}
    </>
  );
}

const styles = StyleSheet.create({
  expiryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    gap: 4,
  },
  expiryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  expiryText: {
    fontSize: 11,
    fontFamily: FONTS.bodyBold,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  tagText: {
    fontSize: 11,
    fontFamily: FONTS.bodyMed,
  },
  pillRow: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pillRowIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  pillRowLabel: {
    fontSize: 15,
    fontFamily: FONTS.bodyMed,
    color: COLORS.text,
  },
  pillRowValue: {
    fontSize: 13,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
    marginRight: 8,
  },
  chevron: {
    fontSize: 20,
    color: COLORS.primary,
    fontWeight: '600',
  },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  primaryBtnDisabled: {
    opacity: 0.5,
  },
  primaryBtnText: {
    fontFamily: FONTS.bodyBold,
    color: '#fff',
    fontSize: 15,
  },
  ghostBtn: {
    borderWidth: 1,
    borderRadius: RADIUS.full,
    paddingVertical: 13,
    alignItems: 'center',
  },
  ghostBtnText: {
    fontFamily: FONTS.bodyMed,
    fontSize: 15,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: 16,
  },
  matchBarWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  matchBarTrack: {
    flex: 1,
    height: 4,
    backgroundColor: COLORS.cardAlt,
    borderRadius: 2,
    overflow: 'hidden',
  },
  matchBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  matchBarLabel: {
    fontSize: 11,
    fontFamily: FONTS.bodyMed,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: FONTS.bodyBold,
    color: COLORS.text,
  },
  linkText: {
    fontSize: 14,
    fontFamily: FONTS.bodyMed,
    color: COLORS.primary,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.border,
  },
  groupedCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
  },
  groupedRowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  groupedRowIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  groupedRowLabel: {
    fontSize: 15,
    fontFamily: FONTS.bodyMed,
    color: COLORS.text,
  },
  groupedRowSub: {
    fontSize: 12,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  groupedRowValue: {
    fontSize: 13,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
    marginRight: 8,
  },
  groupedDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.border,
    marginLeft: 52,
  },
});
