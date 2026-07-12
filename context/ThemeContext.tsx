import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export type FontSize = 'Small' | 'Medium' | 'Large';
export type FontStyle = 'Classic' | 'Modern' | 'Playful';

const fontScaleValues: Record<FontSize, number> = {
  Small: 0.9,
  Medium: 1,
  Large: 1.15,
};

const fontFamilyValues: Record<FontStyle, string> = {
  Classic: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  Modern: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif-medium',
  Playful: Platform.OS === 'ios' ? 'Marker Felt' : 'sans-serif-condensed',
};

interface ThemeContextType {
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  fontScale: number;
  fontStyleName: FontStyle;
  setFontStyleName: (style: FontStyle) => void;
  fontFamily: string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [fontSize, setFontSizeState] = useState<FontSize>('Medium');
  const [fontStyleName, setFontStyleNameState] = useState<FontStyle>('Modern');

  useEffect(() => {
    async function loadTheme() {
      const savedFont = await AsyncStorage.getItem('fontSize');
      const savedStyle = await AsyncStorage.getItem('fontStyleName');
      if (savedFont) setFontSizeState(savedFont as FontSize);
      if (savedStyle) setFontStyleNameState(savedStyle as FontStyle);
    }
    loadTheme();
  }, []);

  async function setFontSize(size: FontSize) {
    setFontSizeState(size);
    await AsyncStorage.setItem('fontSize', size);
  }

  async function setFontStyleName(style: FontStyle) {
    setFontStyleNameState(style);
    await AsyncStorage.setItem('fontStyleName', style);
  }

  return (
    <ThemeContext.Provider
      value={{
        fontSize,
        setFontSize,
        fontScale: fontScaleValues[fontSize],
        fontStyleName,
        setFontStyleName,
        fontFamily: fontFamilyValues[fontStyleName],
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
}