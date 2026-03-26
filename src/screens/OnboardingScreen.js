import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { FONTS, RADIUS } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { Animated, useFadeInUp, usePressScale } from '../components/useAnimations';
import { PrimaryButton, GhostButton, hapticSelection, hapticMedium, hapticSuccess } from '../components/shared';

const { width } = Dimensions.get('window');

const DIETARY_OPTIONS = [
  'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free',
  'Keto', 'Paleo', 'Nut-Free', 'Low-Carb',
  'Pescatarian', 'Halal', 'Kosher', 'No Restrictions',
];

export default function OnboardingScreen({ onComplete, userProfile, setUserProfile }) {
  const { colors: COLORS } = useTheme();
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.bg,
      paddingHorizontal: 24,
      paddingTop: 60,
    },
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    scrollCenter: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingBottom: 40,
    },
    logo: {
      fontSize: 80,
      marginBottom: 16,
    },
    appName: {
      fontSize: 36,
      fontFamily: FONTS.display,
      color: COLORS.text,
      marginBottom: 8,
    },
    tagline: {
      fontSize: 16,
      fontFamily: FONTS.body,
      color: COLORS.textMuted,
    },
    dotsRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 8,
      marginTop: 16,
      marginBottom: 8,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: COLORS.cardAlt,
    },
    dotActive: {
      backgroundColor: COLORS.primary,
      width: 24,
    },
    backBtn: {
      marginTop: 8,
    },
    backText: {
      fontSize: 16,
      fontFamily: FONTS.bodyMed,
      color: COLORS.primary,
    },
    stepTitle: {
      fontSize: 28,
      fontFamily: FONTS.display,
      color: COLORS.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    stepSub: {
      fontSize: 15,
      fontFamily: FONTS.body,
      color: COLORS.textMuted,
      textAlign: 'center',
    },
    input: {
      width: '100%',
      backgroundColor: COLORS.card,
      borderRadius: RADIUS.xl,
      padding: 16,
      fontSize: 16,
      fontFamily: FONTS.body,
      color: COLORS.text,
      marginTop: 32,
    },
    stepperRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 24,
    },
    stepperBtn: {
      width: 44,
      height: 44,
      backgroundColor: COLORS.card,
      borderRadius: RADIUS.full,
      justifyContent: 'center',
      alignItems: 'center',
    },
    stepperBtnText: {
      fontSize: 22,
      color: COLORS.text,
      fontFamily: FONTS.bodyBold,
    },
    stepperValue: {
      fontSize: 32,
      fontFamily: FONTS.display,
      color: COLORS.text,
      minWidth: 40,
      textAlign: 'center',
    },
    chipGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      marginTop: 24,
      justifyContent: 'center',
    },
    chip: {
      backgroundColor: COLORS.card,
      borderRadius: RADIUS.full,
      paddingHorizontal: 16,
      paddingVertical: 10,
    },
    chipActive: {
      backgroundColor: COLORS.primary + '33',
    },
    chipText: {
      fontSize: 14,
      fontFamily: FONTS.bodyMed,
      color: COLORS.textSub,
    },
    chipTextActive: {
      color: COLORS.primary,
    },
    socialBtn: {
      backgroundColor: COLORS.card,
      borderRadius: RADIUS.full,
      paddingVertical: 15,
      alignItems: 'center',
    },
    socialBtnText: {
      fontSize: 15,
      fontFamily: FONTS.bodyMed,
      color: COLORS.text,
    },
    optionCard: {
      backgroundColor: COLORS.card,
      borderRadius: RADIUS.xl,
      padding: 24,
      alignItems: 'center',
    },
    optionEmoji: {
      fontSize: 40,
      marginBottom: 12,
    },
    optionTitle: {
      fontSize: 17,
      fontFamily: FONTS.bodyBold,
      color: COLORS.text,
      marginBottom: 4,
    },
    optionSub: {
      fontSize: 13,
      fontFamily: FONTS.body,
      color: COLORS.textMuted,
    },
    skipText: {
      fontSize: 14,
      fontFamily: FONTS.bodyMed,
      color: COLORS.primary,
    },
  });

  const [step, setStep] = useState(0);
  const [name, setName] = useState(userProfile.name || '');
  const [household, setHousehold] = useState(userProfile.household || 2);
  const [dietaryPrefs, setDietaryPrefs] = useState(userProfile.dietaryPrefs || []);

  const fadeIn = useFadeInUp();

  const nextStep = () => {
    hapticMedium();
    if (step < 4) setStep(step + 1);
  };

  const prevStep = () => {
    hapticSelection();
    if (step > 0) setStep(step - 1);
  };

  const finish = () => {
    hapticSuccess();
    setUserProfile({ ...userProfile, name: name || 'Chef', household, dietaryPrefs });
    onComplete();
  };

  const toggleDiet = (d) => {
    hapticSelection();
    setDietaryPrefs((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
  };

  const renderDots = () => {
    if (step === 0) return null;
    return (
      <View style={styles.dotsRow}>
        {[1, 2, 3, 4].map((i) => (
          <View
            key={i}
            style={[styles.dot, i <= step && styles.dotActive]}
          />
        ))}
      </View>
    );
  };

  // Step 0: Splash
  if (step === 0) {
    return (
      <View style={styles.container}>
        <Animated.View style={[styles.center, fadeIn]}>
          <Text style={styles.logo}>🍳</Text>
          <Text style={styles.appName}>Fridgi</Text>
          <Text style={styles.tagline}>Your kitchen, automated.</Text>
          <View style={{ width: '100%', marginTop: 48 }}>
            <PrimaryButton label="Get Started" onPress={nextStep} />
          </View>
        </Animated.View>
      </View>
    );
  }

  // Step 1: Welcome
  if (step === 1) {
    return (
      <View style={styles.container}>
        {renderDots()}
        <Animated.View style={[styles.center, fadeIn]}>
          <Text style={styles.stepTitle}>Welcome</Text>
          <Text style={styles.stepSub}>Create your account to get started</Text>
          <View style={{ width: '100%', gap: 12, marginTop: 32 }}>
            <PrimaryButton label="Create Account" onPress={nextStep} />
            <GhostButton label="Sign In" onPress={nextStep} />
            <TouchableOpacity style={styles.socialBtn} onPress={nextStep}>
              <Text style={styles.socialBtnText}>🍎  Continue with Apple</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn} onPress={nextStep}>
              <Text style={styles.socialBtnText}>G  Continue with Google</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    );
  }

  // Step 2: Household
  if (step === 2) {
    return (
      <View style={styles.container}>
        {renderDots()}
        <TouchableOpacity onPress={prevStep} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <View style={styles.center}>
          <Text style={styles.stepTitle}>Your Household</Text>
          <Text style={styles.stepSub}>Tell us about your kitchen</Text>

          <TextInput
            style={styles.input}
            placeholder="Your name"
            placeholderTextColor={COLORS.textDim}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />

          <Text style={[styles.stepSub, { marginTop: 24, marginBottom: 12 }]}>People in household</Text>
          <View style={styles.stepperRow}>
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => { hapticSelection(); setHousehold(Math.max(1, household - 1)); }}
            >
              <Text style={styles.stepperBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.stepperValue}>{household}</Text>
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => { hapticSelection(); setHousehold(household + 1); }}
            >
              <Text style={styles.stepperBtnText}>+</Text>
            </TouchableOpacity>
          </View>

          <View style={{ width: '100%', marginTop: 40 }}>
            <PrimaryButton label="Continue" onPress={nextStep} />
          </View>
        </View>
      </View>
    );
  }

  // Step 3: Dietary
  if (step === 3) {
    return (
      <View style={styles.container}>
        {renderDots()}
        <TouchableOpacity onPress={prevStep} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <ScrollView contentContainerStyle={styles.scrollCenter}>
          <Text style={styles.stepTitle}>Dietary Preferences</Text>
          <Text style={styles.stepSub}>Select all that apply</Text>

          <View style={styles.chipGrid}>
            {DIETARY_OPTIONS.map((d) => {
              const active = dietaryPrefs.includes(d);
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

          <View style={{ width: '100%', marginTop: 32 }}>
            <PrimaryButton label="Continue" onPress={nextStep} />
          </View>
        </ScrollView>
      </View>
    );
  }

  // Step 4: First Scan
  if (step === 4) {
    return (
      <View style={styles.container}>
        {renderDots()}
        <TouchableOpacity onPress={prevStep} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <View style={styles.center}>
          <Text style={styles.stepTitle}>Stock Your Kitchen</Text>
          <Text style={styles.stepSub}>How would you like to start?</Text>

          <View style={{ width: '100%', gap: 12, marginTop: 32 }}>
            <TouchableOpacity style={styles.optionCard} onPress={finish}>
              <Text style={styles.optionEmoji}>📷</Text>
              <Text style={styles.optionTitle}>Scan a Receipt</Text>
              <Text style={styles.optionSub}>Take a photo of your grocery receipt</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionCard} onPress={finish}>
              <Text style={styles.optionEmoji}>✏️</Text>
              <Text style={styles.optionTitle}>Add Manually</Text>
              <Text style={styles.optionSub}>Type in what you have at home</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={finish} style={{ marginTop: 24 }}>
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return null;
}
