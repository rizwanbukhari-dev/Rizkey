import { AccentColorId } from '../types/typing';

export interface AccentPreset {
  id: AccentColorId;
  name: string;
  hex: string;
  hoverHex: string;
  textHex: string;
  subtleRgba: string;
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

export const getAccentPreset = (id?: AccentColorId): AccentPreset => {
  return ACCENT_PRESETS.find((a) => a.id === id) || ACCENT_PRESETS[4]; // Amber default
};
