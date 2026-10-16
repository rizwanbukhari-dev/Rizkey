import { AccentColorId } from '../types/typing';

export interface AccentPreset {
  id: AccentColorId;
  name: string;
  hex: string;
  hoverHex: string;
  textHex: string;
  subtleRgba: string;
}

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  mode: 'dark' | 'light';
  bgColor: string;
  surfaceColor: string;
  surfaceHover: string;
  borderColor: string;
  textColor: string;
  subtextColor: string;
  mutedColor: string;
  accentColor: string;
  accentHover: string;
  accentText: string;
  accentSubtle: string;
  correctColor: string;
  incorrectColor: string;
  extraColor: string;
}

export const ACCENT_PRESETS: AccentPreset[] = [
  {
    id: 'teal',
    name: 'Teal',
    hex: '#168C82',
    hoverHex: '#1BA095',
    textHex: '#FFFFFF',
    subtleRgba: 'rgba(22, 140, 130, 0.15)',
  },
  {
    id: 'blue',
    name: 'Blue',
    hex: '#4778D5',
    hoverHex: '#5A88E0',
    textHex: '#FFFFFF',
    subtleRgba: 'rgba(71, 120, 213, 0.15)',
  },
  {
    id: 'purple',
    name: 'Purple',
    hex: '#8966CF',
    hoverHex: '#9A79DA',
    textHex: '#FFFFFF',
    subtleRgba: 'rgba(137, 102, 207, 0.15)',
  },
  {
    id: 'green',
    name: 'Green',
    hex: '#438B61',
    hoverHex: '#509F71',
    textHex: '#FFFFFF',
    subtleRgba: 'rgba(67, 139, 97, 0.15)',
  },
  {
    id: 'amber',
    name: 'Amber',
    hex: '#C58A26',
    hoverHex: '#D69A33',
    textHex: '#FFFFFF',
    subtleRgba: 'rgba(197, 138, 38, 0.15)',
  },
  {
    id: 'rose',
    name: 'Rose',
    hex: '#CF6681',
    hoverHex: '#DB7892',
    textHex: '#FFFFFF',
    subtleRgba: 'rgba(207, 102, 129, 0.15)',
  },
];

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'rizkey_amber',
    name: 'RizKey Signature',
    description: 'Warm dark charcoal with radiant amber accents',
    mode: 'dark',
    bgColor: '#202925',
    surfaceColor: '#26342F',
    surfaceHover: '#2D3D37',
    borderColor: '#364740',
    textColor: '#F1F5F2',
    subtextColor: '#B6C4BC',
    mutedColor: '#6C8075',
    accentColor: '#C58A26',
    accentHover: '#D69A33',
    accentText: '#FFFFFF',
    accentSubtle: 'rgba(197, 138, 38, 0.15)',
    correctColor: '#5DBE76',
    incorrectColor: '#E55858',
    extraColor: '#B34242',
  },
  {
    id: 'serika_dark',
    name: 'Serika Dark',
    description: 'Classic Monkeytype warm yellow & charcoal theme',
    mode: 'dark',
    bgColor: '#323437',
    surfaceColor: '#2c2e31',
    surfaceHover: '#383a3e',
    borderColor: '#43464a',
    textColor: '#d1d0c5',
    subtextColor: '#646669',
    mutedColor: '#4b4d50',
    accentColor: '#e2b714',
    accentHover: '#f0c828',
    accentText: '#1f2022',
    accentSubtle: 'rgba(226, 183, 20, 0.18)',
    correctColor: '#d1d0c5',
    incorrectColor: '#ca4754',
    extraColor: '#7e2a33',
  },
  {
    id: 'carbon',
    name: 'Carbon',
    description: 'Deep slate with vibrant orange highlights',
    mode: 'dark',
    bgColor: '#313131',
    surfaceColor: '#272727',
    surfaceHover: '#383838',
    borderColor: '#454545',
    textColor: '#f5e6c8',
    subtextColor: '#f66e0d',
    mutedColor: '#616161',
    accentColor: '#f66e0d',
    accentHover: '#ff7f24',
    accentText: '#1f1f1f',
    accentSubtle: 'rgba(246, 110, 13, 0.18)',
    correctColor: '#f5e6c8',
    incorrectColor: '#e44141',
    extraColor: '#8b2626',
  },
  {
    id: 'nord',
    name: 'Nordic Frost',
    description: 'Arctic blue-gray and cool glacial tones',
    mode: 'dark',
    bgColor: '#2e3440',
    surfaceColor: '#3b4252',
    surfaceHover: '#434c5e',
    borderColor: '#4c566a',
    textColor: '#eceff4',
    subtextColor: '#8892b0',
    mutedColor: '#5e6779',
    accentColor: '#88c0d0',
    accentHover: '#81a1c1',
    accentText: '#2e3440',
    accentSubtle: 'rgba(136, 192, 208, 0.18)',
    correctColor: '#a3be8c',
    incorrectColor: '#bf616a',
    extraColor: '#7e3e44',
  },
  {
    id: 'dracula',
    name: 'Dracula Night',
    description: 'Gothic navy with neon purple and mint highlights',
    mode: 'dark',
    bgColor: '#282a36',
    surfaceColor: '#21222c',
    surfaceHover: '#343746',
    borderColor: '#44475a',
    textColor: '#f8f8f2',
    subtextColor: '#6272a4',
    mutedColor: '#44475a',
    accentColor: '#bd93f9',
    accentHover: '#ff79c6',
    accentText: '#282a36',
    accentSubtle: 'rgba(189, 147, 249, 0.2)',
    correctColor: '#50fa7b',
    incorrectColor: '#ff5555',
    extraColor: '#b03535',
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    description: 'Electric neon cyan and hot magenta',
    mode: 'dark',
    bgColor: '#0d0f18',
    surfaceColor: '#141724',
    surfaceHover: '#1b2032',
    borderColor: '#262d47',
    textColor: '#f0f6fc',
    subtextColor: '#718096',
    mutedColor: '#4a5568',
    accentColor: '#00f0ff',
    accentHover: '#38f9d7',
    accentText: '#0d0f18',
    accentSubtle: 'rgba(0, 240, 255, 0.18)',
    correctColor: '#00f0ff',
    incorrectColor: '#ff0055',
    extraColor: '#9e0037',
  },
  {
    id: 'matrix',
    name: 'Terminal Matrix',
    description: 'Phosphor green CRT glow in total darkness',
    mode: 'dark',
    bgColor: '#080b08',
    surfaceColor: '#101810',
    surfaceHover: '#162316',
    borderColor: '#1e351e',
    textColor: '#c8f5c8',
    subtextColor: '#4d8b4d',
    mutedColor: '#2a502a',
    accentColor: '#00ff66',
    accentHover: '#33ff85',
    accentText: '#080b08',
    accentSubtle: 'rgba(0, 255, 102, 0.18)',
    correctColor: '#00ff66',
    incorrectColor: '#ff3333',
    extraColor: '#991111',
  },
  {
    id: 'botanical',
    name: 'Botanical Garden',
    description: 'Deep evergreen foliage with calming sage',
    mode: 'dark',
    bgColor: '#16221c',
    surfaceColor: '#1d2d25',
    surfaceHover: '#253930',
    borderColor: '#334e42',
    textColor: '#e8f0ec',
    subtextColor: '#8ea89d',
    mutedColor: '#5f756c',
    accentColor: '#7fa99b',
    accentHover: '#9bc1b4',
    accentText: '#16221c',
    accentSubtle: 'rgba(127, 169, 155, 0.18)',
    correctColor: '#a7cca8',
    incorrectColor: '#e06c75',
    extraColor: '#8b3a41',
  },
  {
    id: 'paper_light',
    name: 'Paper Light',
    description: 'Crisp, minimalist editorial white & ocean blue',
    mode: 'light',
    bgColor: '#f6f8fa',
    surfaceColor: '#ffffff',
    surfaceHover: '#eef1f4',
    borderColor: '#d0d7de',
    textColor: '#1f2328',
    subtextColor: '#656d76',
    mutedColor: '#8c959f',
    accentColor: '#0969da',
    accentHover: '#218bff',
    accentText: '#ffffff',
    accentSubtle: 'rgba(9, 105, 218, 0.12)',
    correctColor: '#1a7f37',
    incorrectColor: '#cf222e',
    extraColor: '#82071e',
  },
  {
    id: 'solarized_light',
    name: 'Solarized Light',
    description: 'Warm sand cream with solar amber accents',
    mode: 'light',
    bgColor: '#fdf6e3',
    surfaceColor: '#eee8d5',
    surfaceHover: '#e4dcbe',
    borderColor: '#d3c9ad',
    textColor: '#073642',
    subtextColor: '#586e75',
    mutedColor: '#93a1a1',
    accentColor: '#b58900',
    accentHover: '#cb4b16',
    accentText: '#ffffff',
    accentSubtle: 'rgba(181, 137, 0, 0.15)',
    correctColor: '#859900',
    incorrectColor: '#dc322f',
    extraColor: '#8b1e1b',
  },
];

export const getAccentPreset = (id?: AccentColorId): AccentPreset => {
  return ACCENT_PRESETS.find((a) => a.id === id) || ACCENT_PRESETS[4]; // Amber default
};

export const getThemePreset = (id?: string): ThemePreset => {
  return THEME_PRESETS.find((t) => t.id === id) || THEME_PRESETS[0]; // RizKey Signature default
};
