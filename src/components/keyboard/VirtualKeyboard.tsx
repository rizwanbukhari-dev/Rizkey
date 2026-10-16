import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';

interface VirtualKeyboardProps {
  currentKey?: string;
  isError?: boolean;
  className?: string;
}

interface KeyConfig {
  id: string;
  display: string;
  shiftedDisplay?: string;
  width?: string;
  finger: 'left-pinky' | 'left-ring' | 'left-middle' | 'left-index' | 'right-index' | 'right-middle' | 'right-ring' | 'right-pinky' | 'thumb';
  isHomeRow?: boolean;
}

const FINGER_COLORS: Record<string, { border: string; bg: string; text: string; name: string }> = {
  'left-pinky': { border: 'border-purple-500/40', bg: 'bg-purple-500/10', text: 'text-purple-400', name: 'Left Pinky' },
  'left-ring': { border: 'border-blue-500/40', bg: 'bg-blue-500/10', text: 'text-blue-400', name: 'Left Ring' },
  'left-middle': { border: 'border-cyan-500/40', bg: 'bg-cyan-500/10', text: 'text-cyan-400', name: 'Left Middle' },
  'left-index': { border: 'border-emerald-500/40', bg: 'bg-emerald-500/10', text: 'text-emerald-400', name: 'Left Index' },
  'right-index': { border: 'border-yellow-500/40', bg: 'bg-yellow-500/10', text: 'text-yellow-400', name: 'Right Index' },
  'right-middle': { border: 'border-orange-500/40', bg: 'bg-orange-500/10', text: 'text-orange-400', name: 'Right Middle' },
  'right-ring': { border: 'border-pink-500/40', bg: 'bg-pink-500/10', text: 'text-pink-400', name: 'Right Ring' },
  'right-pinky': { border: 'border-rose-500/40', bg: 'bg-rose-500/10', text: 'text-rose-400', name: 'Right Pinky' },
  'thumb': { border: 'border-stone-500/40', bg: 'bg-stone-500/10', text: 'text-stone-300', name: 'Either Thumb' },
};

// Key map rows (static layout, allocated once)
const KEYBOARD_ROWS: KeyConfig[][] = [
  // Row 1 (Numbers)
  [
    { id: '`', display: '`', shiftedDisplay: '~', finger: 'left-pinky' },
    { id: '1', display: '1', shiftedDisplay: '!', finger: 'left-pinky' },
    { id: '2', display: '2', shiftedDisplay: '@', finger: 'left-ring' },
    { id: '3', display: '3', shiftedDisplay: '#', finger: 'left-middle' },
    { id: '4', display: '4', shiftedDisplay: '$', finger: 'left-index' },
    { id: '5', display: '5', shiftedDisplay: '%', finger: 'left-index' },
    { id: '6', display: '6', shiftedDisplay: '^', finger: 'right-index' },
    { id: '7', display: '7', shiftedDisplay: '&', finger: 'right-index' },
    { id: '8', display: '8', shiftedDisplay: '*', finger: 'right-middle' },
    { id: '9', display: '9', shiftedDisplay: '(', finger: 'right-ring' },
    { id: '0', display: '0', shiftedDisplay: ')', finger: 'right-pinky' },
    { id: '-', display: '-', shiftedDisplay: '_', finger: 'right-pinky' },
    { id: '=', display: '=', shiftedDisplay: '+', finger: 'right-pinky' },
    { id: 'backspace', display: 'bksp', width: 'w-14 sm:w-16', finger: 'right-pinky' },
  ],
  // Row 2 (Top row)
  [
    { id: 'tab', display: 'tab', width: 'w-12 sm:w-14', finger: 'left-pinky' },
    { id: 'q', display: 'q', shiftedDisplay: 'Q', finger: 'left-pinky' },
    { id: 'w', display: 'w', shiftedDisplay: 'W', finger: 'left-ring' },
    { id: 'e', display: 'e', shiftedDisplay: 'E', finger: 'left-middle' },
    { id: 'r', display: 'r', shiftedDisplay: 'R', finger: 'left-index' },
    { id: 't', display: 't', shiftedDisplay: 'T', finger: 'left-index' },
    { id: 'y', display: 'y', shiftedDisplay: 'Y', finger: 'right-index' },
    { id: 'u', display: 'u', shiftedDisplay: 'U', finger: 'right-index' },
    { id: 'i', display: 'i', shiftedDisplay: 'I', finger: 'right-middle' },
    { id: 'o', display: 'o', shiftedDisplay: 'O', finger: 'right-ring' },
    { id: 'p', display: 'p', shiftedDisplay: 'P', finger: 'right-pinky' },
    { id: '[', display: '[', shiftedDisplay: '{', finger: 'right-pinky' },
    { id: ']', display: ']', shiftedDisplay: '}', finger: 'right-pinky' },
    { id: '\\', display: '\\', shiftedDisplay: '|', finger: 'right-pinky' },
  ],
  // Row 3 (Home row)
  [
    { id: 'caps', display: 'caps', width: 'w-14 sm:w-16', finger: 'left-pinky' },
    { id: 'a', display: 'a', shiftedDisplay: 'A', finger: 'left-pinky', isHomeRow: true },
    { id: 's', display: 's', shiftedDisplay: 'S', finger: 'left-ring', isHomeRow: true },
    { id: 'd', display: 'd', shiftedDisplay: 'D', finger: 'left-middle', isHomeRow: true },
    { id: 'f', display: 'f', shiftedDisplay: 'F', finger: 'left-index', isHomeRow: true },
    { id: 'g', display: 'g', shiftedDisplay: 'G', finger: 'left-index' },
    { id: 'h', display: 'h', shiftedDisplay: 'H', finger: 'right-index' },
    { id: 'j', display: 'j', shiftedDisplay: 'J', finger: 'right-index', isHomeRow: true },
    { id: 'k', display: 'k', shiftedDisplay: 'K', finger: 'right-middle', isHomeRow: true },
    { id: 'l', display: 'l', shiftedDisplay: 'L', finger: 'right-ring', isHomeRow: true },
    { id: ';', display: ';', shiftedDisplay: ':', finger: 'right-pinky', isHomeRow: true },
    { id: "'", display: "'", shiftedDisplay: '"', finger: 'right-pinky' },
    { id: 'enter', display: 'enter', width: 'w-16 sm:w-20', finger: 'right-pinky' },
  ],
  // Row 4 (Bottom row)
  [
    { id: 'lshift', display: 'shift', width: 'w-16 sm:w-20', finger: 'left-pinky' },
    { id: 'z', display: 'z', shiftedDisplay: 'Z', finger: 'left-pinky' },
    { id: 'x', display: 'x', shiftedDisplay: 'X', finger: 'left-ring' },
    { id: 'c', display: 'c', shiftedDisplay: 'C', finger: 'left-middle' },
    { id: 'v', display: 'v', shiftedDisplay: 'V', finger: 'left-index' },
    { id: 'b', display: 'b', shiftedDisplay: 'B', finger: 'left-index' },
    { id: 'n', display: 'n', shiftedDisplay: 'N', finger: 'right-index' },
    { id: 'm', display: 'm', shiftedDisplay: 'M', finger: 'right-index' },
    { id: ',', display: ',', shiftedDisplay: '<', finger: 'right-middle' },
    { id: '.', display: '.', shiftedDisplay: '>', finger: 'right-ring' },
    { id: '/', display: '/', shiftedDisplay: '?', finger: 'right-pinky' },
    { id: 'rshift', display: 'shift', width: 'w-16 sm:w-20', finger: 'right-pinky' },
  ],
  // Row 5 (Space row)
  [
    { id: 'lctrl', display: 'ctrl', width: 'w-12', finger: 'left-pinky' },
    { id: 'lalt', display: 'alt', width: 'w-12', finger: 'left-pinky' },
    { id: ' ', display: 'space', width: 'flex-1 max-w-sm sm:max-w-md', finger: 'thumb' },
    { id: 'ralt', display: 'alt', width: 'w-12', finger: 'right-pinky' },
    { id: 'rctrl', display: 'ctrl', width: 'w-12', finger: 'right-pinky' },
  ],
];

export const VirtualKeyboardComponent: React.FC<VirtualKeyboardProps> = ({
  currentKey = '',
  isError = false,
  className = '',
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showFingerColors, setShowFingerColors] = useState(true);

  // Normalize current target
  const targetChar = currentKey || '';
  const isShiftNeeded = /[A-Z!@#$%^&*()_+{}|:"<>?~]/.test(targetChar);

  const keyboardRows = KEYBOARD_ROWS;

  // Determine active key matching target
  const isKeyActive = (key: KeyConfig): boolean => {
    if (!targetChar) return false;

    if (key.id === ' ' && targetChar === ' ') return true;
    if (key.id === targetChar.toLowerCase()) return true;
    if (key.shiftedDisplay && key.shiftedDisplay === targetChar) return true;

    // Shift keys
    if (isShiftNeeded) {
      // Recommend opposite shift
      const leftKeys = ['q','w','e','r','t','a','s','d','f','g','z','x','c','v','b','1','2','3','4','5','~','!','@','#','$','%'];
      const isLeftTarget = leftKeys.includes(targetChar.toLowerCase());

      if (key.id === 'rshift' && isLeftTarget) return true;
      if (key.id === 'lshift' && !isLeftTarget) return true;
    }

    return false;
  };

  // Find recommended finger info
  let activeFingerName = '';
  for (const row of keyboardRows) {
    for (const key of row) {
      if (
        (key.id === targetChar.toLowerCase() && key.id !== 'lshift' && key.id !== 'rshift') ||
        (key.id === ' ' && targetChar === ' ') ||
        (key.shiftedDisplay === targetChar)
      ) {
        activeFingerName = FINGER_COLORS[key.finger]?.name || '';
        break;
      }
    }
    if (activeFingerName) break;
  }

  return (
    <div className={`w-full max-w-3xl mx-auto rounded-xl bg-[#272824] border border-[#353630] p-3 sm:p-4 transition-all duration-200 select-none ${className}`}>
      {/* Top Header / Controls */}
      <div className="flex items-center justify-between text-xs text-[#989A92] pb-2 sm:pb-3 border-b border-[#353630]/60 mb-2 sm:mb-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[#ECEBE4] uppercase tracking-wider text-[11px]">
            Virtual Guide
          </span>
          {activeFingerName && (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#20211D] border border-[#353630] text-[11px] text-[#E6C76B] font-mono">
              Key: <strong className="text-white font-bold">{targetChar === ' ' ? 'SPACE' : targetChar}</strong> &rarr; {activeFingerName}
              {isShiftNeeded && <span className="text-purple-300 ml-1">(+ Shift)</span>}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFingerColors(!showFingerColors)}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] hover:text-[#ECEBE4] hover:bg-[#32332B] transition-colors"
            title="Toggle finger zone colors"
          >
            {showFingerColors ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Finger colors</span>
          </button>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] hover:text-[#ECEBE4] hover:bg-[#32332B] transition-colors"
            aria-label="Toggle keyboard view"
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Visual Keyboard */}
      {!isCollapsed && (
        <div className="space-y-1.5 sm:space-y-2 overflow-x-auto no-scrollbar pt-1">
          {keyboardRows.map((row, rIdx) => (
            <div key={rIdx} className="flex justify-center gap-1 sm:gap-1.5 min-w-[580px]">
              {row.map((key) => {
                const active = isKeyActive(key);
                const fingerCfg = FINGER_COLORS[key.finger];
                const widthCls = key.width || 'w-8 sm:w-10';

                let bgCls = 'bg-[#20211D] text-[#ECEBE4] border-[#383A32]';
                if (showFingerColors && fingerCfg) {
                  bgCls = `${fingerCfg.bg} border-[#383A32] text-[#ECEBE4]`;
                }

                if (active) {
                  if (isError) {
                    bgCls = 'bg-red-500/30 text-red-300 border-red-500 ring-2 ring-red-500/40 animate-pulse';
                  } else {
                    bgCls = 'bg-[#E6C76B] text-[#20211D] font-bold border-[#F0D47C] ring-2 ring-[#E6C76B]/50 shadow-md scale-105';
                  }
                }

                return (
                  <div
                    key={key.id}
                    className={`relative ${widthCls} h-9 sm:h-11 rounded-md border flex flex-col items-center justify-center font-mono text-[11px] sm:text-xs transition-all duration-100 ${bgCls}`}
                  >
                    {/* Shifted secondary character */}
                    {key.shiftedDisplay && (
                      <span className="text-[9px] sm:text-[10px] opacity-60 leading-none">
                        {key.shiftedDisplay}
                      </span>
                    )}
                    <span className="leading-tight uppercase font-medium">
                      {key.display}
                    </span>

                    {/* Tactile bumps on F and J */}
                    {(key.id === 'f' || key.id === 'j') && (
                      <div className="absolute bottom-1 w-2.5 sm:w-3 h-0.5 bg-current opacity-70 rounded-full" />
                    )}
                  </div>
                );
              })}
            </div>
          ))}

          {/* Finger legend */}
          {showFingerColors && (
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-[10px] text-[#989A92]">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                <span>Pinky</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>Ring</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-cyan-500" />
                <span>Middle</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>L-Index</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-yellow-500" />
                <span>R-Index</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                <span>R-Middle</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-pink-500" />
                <span>R-Ring</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>R-Pinky</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-stone-400" />
                <span>Thumb</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const VirtualKeyboard = React.memo(VirtualKeyboardComponent);
