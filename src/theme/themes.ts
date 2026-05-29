import type { Theme } from './themeTypes';

export const BUILTIN_DARK: Theme = {
  id: 'builtin-dark',
  name: 'Forge Graphite',
  mode: 'dark',
  tokens: {
    background: '#0d1117',
    surface: '#161b22',
    surfaceElevated: '#1c2330',
    border: '#2a3140',
    textPrimary: '#e6edf3',
    textSecondary: '#9aa7b8',
    textMuted: '#6b7686',
    accent: '#1a6fd6',
    accentHover: '#3581e6',
    accentForeground: '#ffffff',
    success: '#3fb950',
    warning: '#d29922',
    danger: '#f85149',
    info: '#58a6ff',
    focusRing: '#4c93f8',
    overlay: 'rgba(0,0,0,0.6)',
    glow: 'rgba(47,129,247,0.25)',
  },
};

export const BUILTIN_LIGHT: Theme = {
  id: 'builtin-light',
  name: 'Forge Daylight',
  mode: 'light',
  tokens: {
    background: '#f6f8fa',
    surface: '#ffffff',
    surfaceElevated: '#ffffff',
    border: '#d0d7de',
    textPrimary: '#1f2328',
    textSecondary: '#57606a',
    textMuted: '#8b949e',
    accent: '#0969da',
    accentHover: '#0860c4',
    accentForeground: '#ffffff',
    success: '#1a7f37',
    warning: '#9a6700',
    danger: '#cf222e',
    info: '#0969da',
    focusRing: '#0969da',
    overlay: 'rgba(0,0,0,0.4)',
    glow: 'rgba(9,105,218,0.18)',
  },
};

export const BUILTIN_COPPER: Theme = {
  id: 'builtin-copper',
  name: 'Forge Copper',
  mode: 'dark',
  tokens: {
    background: '#0d1117',
    surface: '#161b22',
    surfaceElevated: '#1c2330',
    border: '#2a3140',
    textPrimary: '#e6edf3',
    textSecondary: '#9aa7b8',
    textMuted: '#6b7686',
    accent: '#a65c20',
    accentHover: '#bf6d2d',
    accentForeground: '#ffffff',
    success: '#3fb950',
    warning: '#d29922',
    danger: '#f85149',
    info: '#58a6ff',
    focusRing: '#d98e4d',
    overlay: 'rgba(0,0,0,0.6)',
    glow: 'rgba(199,123,59,0.25)',
  },
};

export const BUILTIN_THEMES: Theme[] = [BUILTIN_DARK, BUILTIN_LIGHT, BUILTIN_COPPER];

export const DEFAULT_THEME = BUILTIN_DARK;
