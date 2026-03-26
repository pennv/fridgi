import { useRef, useEffect } from 'react';
import { Animated } from 'react-native';

export { Animated };

export function useFadeInUp(delay = 0) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 350,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        speed: 18,
        bounciness: 5,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return { opacity, transform: [{ translateY }] };
}

export function usePressScale(to = 0.94) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scale, {
      toValue: to,
      speed: 50,
      bounciness: 0,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      speed: 20,
      bounciness: 12,
      useNativeDriver: true,
    }).start();
  };

  return {
    style: { transform: [{ scale }] },
    onPressIn,
    onPressOut,
  };
}

export function usePulse() {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.08,
          duration: 450,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 450,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  return { transform: [{ scale }] };
}

export function useSuccessFlash() {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.5)).current;

  const flash = () => {
    opacity.setValue(0);
    scale.setValue(0.5);
    Animated.parallel([
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
      Animated.spring(scale, { toValue: 1, speed: 20, bounciness: 8, useNativeDriver: true }),
    ]).start();
  };

  return { style: { opacity, transform: [{ scale }] }, flash };
}

export function useStaggeredItem(index) {
  return useFadeInUp(index * 55);
}
