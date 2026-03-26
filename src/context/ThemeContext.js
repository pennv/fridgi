import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DARK_COLORS, LIGHT_COLORS } from '../theme';

const STORAGE_KEY = '@fridgi_theme_preference';

const ThemeContext = createContext({
  colors: DARK_COLORS,
  isDark: true,
  preference: 'auto',
  setPreference: () => {},
});

export function ThemeProvider({ children }) {
  // Use Appearance API directly — more reliable than useColorScheme with navigation
  const [systemScheme, setSystemScheme] = useState(
    () => Appearance.getColorScheme() ?? 'dark'
  );
  const [preference, setPreferenceState] = useState('auto');

  useEffect(() => {
    // Load saved preference
    AsyncStorage.getItem(STORAGE_KEY).then((val) => {
      if (val) setPreferenceState(val);
    });

    // Listen for OS theme changes
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme ?? 'dark');
    });
    return () => sub.remove();
  }, []);

  const setPreference = (val) => {
    setPreferenceState(val);
    AsyncStorage.setItem(STORAGE_KEY, val);
  };

  const resolvedScheme = preference === 'auto' ? systemScheme : preference;
  const isDark = resolvedScheme === 'dark';
  const colors = isDark ? DARK_COLORS : LIGHT_COLORS;

  return (
    <ThemeContext.Provider value={{ colors, isDark, preference, setPreference }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
