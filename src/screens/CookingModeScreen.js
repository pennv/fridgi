import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { FONTS, RADIUS } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { Animated, useFadeInUp, usePressScale } from '../components/useAnimations';
import { hapticSelection, hapticMedium, hapticSuccess, hapticComplete, hapticDestructive } from '../components/shared';

const { width } = Dimensions.get('window');

export default function CookingModeScreen({ navigation, route, fridgeItems, setFridgeItems, addActivity }) {
  const { colors: COLORS } = useTheme();
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.primaryDark,
    },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 12,
    },
    exitBtn: {
      fontSize: 15,
      fontFamily: FONTS.bodyMed,
      color: '#fff',
      opacity: 0.8,
    },
    recipeName: {
      fontSize: 15,
      fontFamily: FONTS.bodyMed,
      color: '#fff',
      flex: 1,
      textAlign: 'center',
      marginHorizontal: 12,
    },
    stepCount: {
      fontSize: 14,
      fontFamily: FONTS.bodyBold,
      color: '#fff',
      opacity: 0.7,
    },
    progressTrack: {
      height: 3,
      backgroundColor: 'rgba(255,255,255,0.15)',
      marginHorizontal: 20,
      borderRadius: 2,
    },
    progressFill: {
      height: '100%',
      backgroundColor: '#fff',
      borderRadius: 2,
    },
    cardArea: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: 24,
    },
    stepCard: {
      backgroundColor: '#fff',
      borderRadius: RADIUS.xxl,
      padding: 32,
      alignItems: 'center',
    },
    stepLabel: {
      fontSize: 13,
      fontFamily: FONTS.bodyBold,
      color: COLORS.primary,
      letterSpacing: 0.8,
      marginBottom: 16,
      textTransform: 'uppercase',
    },
    stepText: {
      fontSize: 20,
      fontFamily: FONTS.displayMed,
      color: '#000',
      textAlign: 'center',
      lineHeight: 28,
    },
    timerWrap: {
      marginTop: 24,
      alignItems: 'center',
      backgroundColor: COLORS.bg,
      borderRadius: RADIUS.xl,
      paddingHorizontal: 28,
      paddingVertical: 16,
    },
    timerText: {
      fontSize: 36,
      fontFamily: FONTS.display,
      color: COLORS.text,
    },
    timerAction: {
      fontSize: 12,
      fontFamily: FONTS.body,
      color: COLORS.textMuted,
      marginTop: 4,
    },
    bottomBar: {
      flexDirection: 'row',
      gap: 12,
      paddingHorizontal: 24,
      paddingBottom: 50,
    },
    prevBtn: {
      borderWidth: 1.5,
      borderColor: 'rgba(255,255,255,0.3)',
      borderRadius: RADIUS.full,
      paddingVertical: 15,
      alignItems: 'center',
    },
    prevBtnText: {
      fontSize: 15,
      fontFamily: FONTS.bodyMed,
      color: '#fff',
    },
    nextBtn: {
      backgroundColor: COLORS.accent,
      borderRadius: RADIUS.full,
      paddingVertical: 15,
      alignItems: 'center',
    },
    nextBtnText: {
      fontSize: 15,
      fontFamily: FONTS.bodyBold,
      color: COLORS.accentText,
    },
  });

  const { recipe } = route.params;
  const [currentStep, setCurrentStep] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const intervalRef = useRef(null);

  const step = recipe.steps[currentStep];
  const isLast = currentStep === recipe.steps.length - 1;
  const progress = (currentStep + 1) / recipe.steps.length;

  const cardAnim = useFadeInUp();
  const prevPress = usePressScale(0.96);
  const nextPress = usePressScale(0.96);

  useEffect(() => {
    if (step?.timerSeconds) {
      setTimeLeft(step.timerSeconds);
      setTimerActive(false);
    } else {
      setTimeLeft(null);
      setTimerActive(false);
    }
  }, [currentStep]);

  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setTimerActive(false);
            hapticComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [timerActive]);

  const toggleTimer = () => {
    hapticSelection();
    if (timeLeft === 0 && step?.timerSeconds) {
      setTimeLeft(step.timerSeconds);
      setTimerActive(true);
    } else {
      setTimerActive(!timerActive);
    }
  };

  const goNext = () => {
    hapticMedium();
    clearInterval(intervalRef.current);
    if (isLast) {
      markCooked();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const goPrev = () => {
    hapticSelection();
    clearInterval(intervalRef.current);
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const markCooked = () => {
    hapticDestructive();
    Alert.alert('Mark as Cooked', 'Deduct ingredients from your kitchen?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Deduct & Finish',
        onPress: () => {
          hapticSuccess();
          recipe.ingredients.forEach((ing) => {
            if (ing.fromFridge) {
              setFridgeItems((prev) => prev.filter((f) => f.name !== ing.name));
            }
          });
          addActivity(`Cooked ${recipe.name}`, '👨‍🍳');
          navigation.pop(2);
        },
      },
    ]);
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => { hapticSelection(); navigation.goBack(); }}>
          <Text style={styles.exitBtn}>✕ Exit</Text>
        </TouchableOpacity>
        <Text style={styles.recipeName} numberOfLines={1}>{recipe.name}</Text>
        <Text style={styles.stepCount}>{currentStep + 1}/{recipe.steps.length}</Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      {/* Step Card */}
      <View style={styles.cardArea}>
        <Animated.View style={[styles.stepCard, cardAnim]}>
          <Text style={styles.stepLabel}>Step {currentStep + 1}</Text>
          <Text style={styles.stepText}>{step.instruction}</Text>

          {timeLeft !== null && (
            <TouchableOpacity style={styles.timerWrap} onPress={toggleTimer}>
              <Text style={[styles.timerText, timeLeft === 0 && { color: COLORS.success }]}>
                {timeLeft === 0 ? '✓ Done' : formatTime(timeLeft)}
              </Text>
              <Text style={styles.timerAction}>
                {timeLeft === 0 ? 'Tap to reset' : timerActive ? 'Tap to pause' : 'Tap to start'}
              </Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomBar}>
        {currentStep > 0 ? (
          <Animated.View style={[{ flex: 1 }, prevPress.style]}>
            <TouchableOpacity
              style={styles.prevBtn}
              onPress={goPrev}
              onPressIn={prevPress.onPressIn}
              onPressOut={prevPress.onPressOut}
              activeOpacity={1}
            >
              <Text style={styles.prevBtnText}>Previous</Text>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <View style={{ flex: 1 }} />
        )}

        <Animated.View style={[{ flex: 1 }, nextPress.style]}>
          <TouchableOpacity
            style={[styles.nextBtn, isLast && { backgroundColor: COLORS.success }]}
            onPress={goNext}
            onPressIn={nextPress.onPressIn}
            onPressOut={nextPress.onPressOut}
            activeOpacity={1}
          >
            <Text style={styles.nextBtnText}>
              {isLast ? 'Mark as Cooked ✓' : 'Next'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}
