import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
} from 'react-native';
import { FONTS, RADIUS } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { Animated, useFadeInUp, useStaggeredItem } from '../components/useAnimations';
import { PillRow, hapticSelection, hapticLight } from '../components/shared';

const DIETARY_OPTIONS = [
  'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free',
  'Keto', 'Paleo', 'Nut-Free', 'Low-Carb',
  'Pescatarian', 'Halal', 'Kosher', 'No Restrictions',
];

export default function ProfileDrawer({ navigation, userProfile, setUserProfile }) {
  const { colors: COLORS, preference, setPreference } = useTheme();
  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    content: { padding: 24, paddingTop: 60, paddingBottom: 40, gap: 24 },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    title: {
      fontSize: 18,
      fontFamily: FONTS.bodyBold,
      color: COLORS.text,
    },
    closeBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: COLORS.card,
      justifyContent: 'center',
      alignItems: 'center',
    },
    closeBtnText: {
      fontSize: 18,
      color: COLORS.textSub,
    },
    profileCard: {
      backgroundColor: COLORS.card,
      borderRadius: RADIUS.xl,
      padding: 24,
      alignItems: 'center',
    },
    avatar: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: COLORS.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    avatarText: {
      fontSize: 28,
      fontFamily: FONTS.bodyBold,
      color: '#fff',
    },
    profileName: {
      fontSize: 20,
      fontFamily: FONTS.bodyBold,
      color: COLORS.text,
      marginBottom: 4,
    },
    profileSub: {
      fontSize: 13,
      fontFamily: FONTS.body,
      color: COLORS.textMuted,
    },
    sectionLabel: {
      fontSize: 13,
      fontFamily: FONTS.bodyBold,
      color: COLORS.textMuted,
      letterSpacing: 0.8,
      marginBottom: 10,
    },
    chipGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    chip: {
      backgroundColor: COLORS.card,
      borderRadius: RADIUS.full,
      paddingHorizontal: 14,
      paddingVertical: 8,
    },
    chipActive: {
      backgroundColor: COLORS.primary + '33',
    },
    chipText: {
      fontSize: 13,
      fontFamily: FONTS.bodyMed,
      color: COLORS.textSub,
    },
    chipTextActive: {
      color: COLORS.primary,
    },
    logOutBtn: {
      alignItems: 'center',
      paddingVertical: 12,
    },
    logOutText: {
      fontSize: 15,
      fontFamily: FONTS.bodyMed,
      color: COLORS.primary,
    },
    version: {
      fontSize: 12,
      fontFamily: FONTS.body,
      color: COLORS.textDim,
      textAlign: 'center',
    },
    themeToggle: {
      flexDirection: 'row',
      backgroundColor: COLORS.cardAlt,
      borderRadius: RADIUS.full,
      padding: 3,
    },
    themeOption: {
      flex: 1,
      paddingVertical: 8,
      alignItems: 'center',
      borderRadius: RADIUS.full,
    },
    themeOptionActive: {
      backgroundColor: COLORS.card,
    },
    themeOptionText: {
      fontSize: 13,
      fontFamily: FONTS.bodyMed,
      color: COLORS.textMuted,
    },
    themeOptionTextActive: {
      color: COLORS.text,
    },
  });

  const [notifications, setNotifications] = useState(true);
  const [lowStockAlerts, setLowStockAlerts] = useState(true);

  const headerAnim = useFadeInUp();
  const anim0 = useStaggeredItem(0);
  const anim1 = useStaggeredItem(1);
  const anim2 = useStaggeredItem(2);
  const anim3 = useStaggeredItem(3);
  const anim4 = useStaggeredItem(4);

  const toggleDiet = (d) => {
    hapticSelection();
    const prefs = userProfile.dietaryPrefs || [];
    const updated = prefs.includes(d) ? prefs.filter((x) => x !== d) : [...prefs, d];
    setUserProfile({ ...userProfile, dietaryPrefs: updated });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <Animated.View style={[styles.header, headerAnim]}>
        <View style={{ width: 40 }} />
        <Text style={styles.title}>Settings</Text>
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => { hapticLight(); navigation.goBack(); }}
        >
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Profile Card */}
      <Animated.View style={anim0}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(userProfile.name || 'C')[0].toUpperCase()}
            </Text>
          </View>
          <Text style={styles.profileName}>{userProfile.name || 'Chef'}</Text>
          <Text style={styles.profileSub}>{userProfile.household} people · {userProfile.servings || 4} servings</Text>
        </View>
      </Animated.View>

      {/* Account */}
      <Animated.View style={anim1}>
        <Text style={styles.sectionLabel}>ACCOUNT</Text>
        <View style={{ gap: 10 }}>
          <PillRow icon="👤" label="Account Details" onPress={() => {}} />
          <PillRow icon="✏️" label="Profile" onPress={() => {}} />
          <PillRow icon="💳" label="Payment Settings" onPress={() => {}} />
        </View>
      </Animated.View>

      {/* Preferences */}
      <Animated.View style={anim2}>
        <Text style={styles.sectionLabel}>PREFERENCES</Text>
        <View style={{ gap: 10 }}>
          <PillRow
            icon="🔔"
            label="Notifications"
            hasSwitch
            right={
              <Switch
                value={notifications}
                onValueChange={(v) => { hapticSelection(); setNotifications(v); }}
                trackColor={{ false: COLORS.cardAlt, true: COLORS.primary }}
                thumbColor="#fff"
              />
            }
          />
          <PillRow
            icon="📉"
            label="Low Stock Alerts"
            hasSwitch
            right={
              <Switch
                value={lowStockAlerts}
                onValueChange={(v) => { hapticSelection(); setLowStockAlerts(v); }}
                trackColor={{ false: COLORS.cardAlt, true: COLORS.primary }}
                thumbColor="#fff"
              />
            }
          />
          <PillRow icon="🔒" label="Security" onPress={() => {}} />
          <PillRow icon="📄" label="Statements" onPress={() => {}} />
          <PillRow icon="🔗" label="Data Sharing" onPress={() => {}} />
          {/* Theme preference toggle */}
          <View style={styles.themeToggle}>
            {['dark', 'auto', 'light'].map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[styles.themeOption, preference === opt && styles.themeOptionActive]}
                onPress={() => { hapticSelection(); setPreference(opt); }}
              >
                <Text style={[styles.themeOptionText, preference === opt && styles.themeOptionTextActive]}>
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Animated.View>

      {/* Dietary */}
      <Animated.View style={anim3}>
        <Text style={styles.sectionLabel}>DIETARY</Text>
        <View style={styles.chipGrid}>
          {DIETARY_OPTIONS.map((d) => {
            const active = (userProfile.dietaryPrefs || []).includes(d);
            return (
              <TouchableOpacity
                key={d}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => toggleDiet(d)}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{d}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Animated.View>

      {/* More */}
      <Animated.View style={anim4}>
        <Text style={styles.sectionLabel}>MORE</Text>
        <View style={{ gap: 10 }}>
          <PillRow icon="📊" label="Analytics" onPress={() => navigation.navigate('Analytics')} />
          <PillRow icon="👥" label="Household Members" onPress={() => {}} />
          <PillRow icon="📦" label="Storage Locations" onPress={() => {}} />
        </View>
      </Animated.View>

      {/* Log Out */}
      <TouchableOpacity style={styles.logOutBtn} onPress={() => {}}>
        <Text style={styles.logOutText}>Log Out</Text>
      </TouchableOpacity>

      <Text style={styles.version}>Fridgi v1.0.0</Text>
    </ScrollView>
  );
}
