export type ThemeMode = 'dark' | 'light';

export interface ThemeTokens {
  background: string;
  surface: string;
  surfaceElevated: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentHover: string;
  accentForeground: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  focusRing: string;
  overlay: string;
  glow: string;
}

export interface Theme {
  id: string;
  name: string;
  mode: ThemeMode;
  tokens: ThemeTokens;
}

export interface ThemeState {
  selectedThemeId: string;
  appearanceMode: ThemeMode;
  customTheme: Theme | null;
}
