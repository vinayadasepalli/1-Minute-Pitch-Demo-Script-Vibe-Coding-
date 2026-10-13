import React from 'react';
import { Briefcase, Gamepad2, Coffee, Sparkles, Check } from 'lucide-react';
import { playBlip } from '../utils/sound';

export type ActivityMode = 'work' | 'game' | 'timepass';

interface ActivitySelectorProps {
  currentMode: ActivityMode;
  onSelectMode: (mode: ActivityMode) => void;
  avoidedTask: string;
  onSelectTaskPreset: (task: string) => void;
}

interface ModeConfig {
  id: ActivityMode;
  label: string;
  icon: React.ReactNode;
  subtitle: string;
  defaultTask: string;
  presets: string[];
  themeColor: string;
}

export const MODE_CONFIGS: Record<ActivityMode, ModeConfig> = {
  work: {
    id: 'work',
    label: '💼 Work',
    icon: <Briefcase className="w-4 h-4 text-emerald-400" />,
    subtitle: 'Track avoided assignments & tasks',
    defaultTask: 'Writing Q3 Strategy RFC',
    presets: [
      'Writing Q3 Strategy RFC',
      'Refactoring Legacy Auth Code',
      'Replying to 47 Unread Emails',
      'Prepping Slides for All-Hands',
    ],
    themeColor: 'emerald',
  },
  game: {
    id: 'game',
    label: '🎮 Game',
    icon: <Gamepad2 className="w-4 h-4 text-purple-400" />,
    subtitle: 'Prevent rigid slouching & marathon eye-lock',
    defaultTask: 'Ranked Competitive Match Grind',
    presets: [
      'Ranked Competitive Match Grind',
      'Elden Ring Boss Retries',
      'Late-Night MMO Raid Session',
      'Just One More Turn (Civilization)',
    ],
    themeColor: 'purple',
  },
  timepass: {
    id: 'timepass',
    label: '🍿 Time Pass',
    icon: <Coffee className="w-4 h-4 text-amber-400" />,
    subtitle: 'Catch passive doomscrolling & trance staring',
    defaultTask: 'Doomscrolling Shorts & Social Feeds',
    presets: [
      'Doomscrolling Shorts & Social Feeds',
      'Browsing Mechanical Keyboard Subreddits',
      'Watching 3-Hour Wikipedia Video Essays',
      'Window Shopping Gadgets I Will Not Buy',
    ],
    themeColor: 'amber',
  },
};

export const ActivitySelector: React.FC<ActivitySelectorProps> = ({
  currentMode,
  onSelectMode,
  avoidedTask,
  onSelectTaskPreset,
}) => {
  const currentConfig = MODE_CONFIGS[currentMode];

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 sm:p-4 backdrop-blur-sm shadow-md transition-all">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Mode Selector Buttons */}
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold mb-1.5 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>Select Your Current Activity Mode</span>
          </div>

          <div className="inline-flex p-1 rounded-xl bg-slate-950 border border-slate-800/90 gap-1">
            {(Object.keys(MODE_CONFIGS) as ActivityMode[]).map((mode) => {
              const cfg = MODE_CONFIGS[mode];
              const isSelected = currentMode === mode;

              return (
                <button
                  key={mode}
                  onClick={() => {
                    playBlip(620);
                    onSelectMode(mode);
                  }}
                  className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-medium font-sans flex items-center gap-2 transition-all cursor-pointer ${
                    isSelected
                      ? mode === 'work'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm font-semibold'
                        : mode === 'game'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm font-semibold'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent'
                  }`}
                >
                  <span>{cfg.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Presets for Selected Mode */}
        <div className="flex flex-col md:items-end">
          <span className="text-[10px] font-mono text-slate-400 mb-1">
            Quick {currentMode === 'work' ? 'Task' : currentMode === 'game' ? 'Game' : 'Habit'} Presets:
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {currentConfig.presets.map((preset) => {
              const isCurrent = avoidedTask === preset;
              return (
                <button
                  key={preset}
                  onClick={() => {
                    playBlip(540);
                    onSelectTaskPreset(preset);
                  }}
                  className={`text-[11px] px-2.5 py-1 rounded-md transition-all font-sans cursor-pointer ${
                    isCurrent
                      ? 'bg-slate-800 text-white border border-slate-700 font-semibold shadow-inner'
                      : 'bg-slate-950/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800/80'
                  }`}
                >
                  {isCurrent && <Check className="w-2.5 h-2.5 inline mr-1 text-emerald-400" />}
                  <span>{preset}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
