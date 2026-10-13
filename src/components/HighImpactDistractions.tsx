import React, { useState, useEffect } from 'react';
import { CheckSquare, Square, Plus, Trash2, Clock, Layers } from 'lucide-react';
import { playBlip, playSuccessChime } from '../utils/sound';
import { ActivityMode } from './ActivitySelector';

interface DistractionItem {
  id: string;
  title: string;
  minutesSpent: number;
  completed: boolean;
  tag: string;
}

const PRESET_ACTIVITIES: Record<ActivityMode, DistractionItem[]> = {
  work: [
    {
      id: 'w-1',
      title: 'Testing 4 different dark mode IDE themes',
      minutesSpent: 20,
      completed: true,
      tag: 'Tooling',
    },
    {
      id: 'w-2',
      title: 'Color-coding Notion database tags by hex code',
      minutesSpent: 30,
      completed: true,
      tag: 'Organization',
    },
    {
      id: 'w-3',
      title: 'Reading Hacker News comments on ergonomic chairs',
      minutesSpent: 15,
      completed: false,
      tag: 'Research',
    },
    {
      id: 'w-4',
      title: 'Drafting 3 alternative versions of a Slack status',
      minutesSpent: 10,
      completed: false,
      tag: 'Communication',
    },
  ],
  game: [
    {
      id: 'g-1',
      title: 'Fine-tuning mouse DPI and crosshair color in settings',
      minutesSpent: 25,
      completed: true,
      tag: 'Settings',
    },
    {
      id: 'g-2',
      title: 'Watching a 30-minute weapon tier list on YouTube',
      minutesSpent: 30,
      completed: true,
      tag: 'Guides',
    },
    {
      id: 'g-3',
      title: 'Inspecting cosmetics & skins in the in-game store',
      minutesSpent: 15,
      completed: false,
      tag: 'Inventory',
    },
    {
      id: 'g-4',
      title: 'Analyzing replay death cam frame-by-frame',
      minutesSpent: 20,
      completed: false,
      tag: 'VOD Review',
    },
  ],
  timepass: [
    {
      id: 't-1',
      title: 'Scrolling TikTok / Reels until phone gets warm',
      minutesSpent: 35,
      completed: true,
      tag: 'Feeds',
    },
    {
      id: 't-2',
      title: 'Falling down a Wikipedia rabbit hole on medieval siege engines',
      minutesSpent: 25,
      completed: true,
      tag: 'Wiki Spiral',
    },
    {
      id: 't-3',
      title: 'Window-shopping 6 items on Amazon without buying',
      minutesSpent: 20,
      completed: false,
      tag: 'Shopping',
    },
    {
      id: 't-4',
      title: 'Watching restoring rusty knives video at 1.5x speed',
      minutesSpent: 18,
      completed: false,
      tag: 'Video Essay',
    },
  ],
};

interface HighImpactDistractionsProps {
  mode?: ActivityMode;
}

export const HighImpactDistractions: React.FC<HighImpactDistractionsProps> = ({
  mode = 'work',
}) => {
  const [items, setItems] = useState<DistractionItem[]>(PRESET_ACTIVITIES[mode]);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemMinutes, setNewItemMinutes] = useState('15');

  // Update when mode changes
  useEffect(() => {
    setItems(PRESET_ACTIVITIES[mode]);
  }, [mode]);

  const totalMinutesWasted = items
    .filter((i) => i.completed)
    .reduce((sum, i) => sum + i.minutesSpent, 0);

  const handleToggle = (id: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const next = !item.completed;
          if (next) playSuccessChime();
          else playBlip(440);
          return { ...item, completed: next };
        }
        return item;
      })
    );
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle.trim()) return;

    playSuccessChime();
    const newItem: DistractionItem = {
      id: `custom-${Date.now()}`,
      title: newItemTitle.trim(),
      minutesSpent: parseInt(newItemMinutes, 10) || 15,
      completed: true,
      tag: 'Custom',
    };
    setItems((prev) => [newItem, ...prev]);
    setNewItemTitle('');
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playBlip(320);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5 shadow-lg backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold tracking-wide text-slate-200 font-sans">
            {mode === 'game'
              ? 'Gaming Distractions & Side Quests'
              : mode === 'timepass'
              ? 'Doomscroll Activities Log'
              : 'Productive Procrastination Log'}
          </h3>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-mono text-slate-300 bg-slate-950 px-2.5 py-1 rounded border border-slate-800 self-start sm:self-auto">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>Total Time Tracked: </span>
          <strong className="text-cyan-300">{totalMinutesWasted} mins</strong>
        </div>
      </div>

      <p className="text-[11px] text-slate-400 mb-3 font-sans">
        Check off side-tasks you did instead. Click any item to mark completed.
      </p>

      {/* Quick Add */}
      <form onSubmit={handleAddItem} className="flex gap-2 mb-3">
        <input
          type="text"
          value={newItemTitle}
          onChange={(e) => setNewItemTitle(e.target.value)}
          placeholder={`Add a quick ${mode === 'game' ? 'game side-quest' : mode === 'timepass' ? 'time-pass loop' : 'distraction'}...`}
          className="flex-1 px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
        />
        <input
          type="number"
          min="1"
          max="180"
          value={newItemMinutes}
          onChange={(e) => setNewItemMinutes(e.target.value)}
          className="w-14 px-1.5 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-center font-mono focus:outline-none focus:border-cyan-500"
          title="Minutes"
        />
        <button
          type="submit"
          className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs font-sans flex items-center gap-1 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add</span>
        </button>
      </form>

      {/* List */}
      <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => handleToggle(item.id)}
            className={`p-2.5 rounded-lg border text-xs flex items-center justify-between gap-3 cursor-pointer transition-all ${
              item.completed
                ? 'bg-slate-950/60 border-slate-800 text-slate-300'
                : 'bg-slate-900/30 border-slate-800/60 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                type="button"
                className="text-cyan-400 hover:text-cyan-300 transition-colors shrink-0"
              >
                {item.completed ? (
                  <CheckSquare className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Square className="w-4 h-4 text-slate-500" />
                )}
              </button>
              <span
                className={`truncate font-sans ${
                  item.completed ? 'line-through text-slate-400' : 'text-slate-200'
                }`}
              >
                {item.title}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0 font-mono text-[10px]">
              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                +{item.minutesSpent}m
              </span>
              <button
                onClick={(e) => handleDelete(item.id, e)}
                className="text-slate-500 hover:text-rose-400 transition-colors p-0.5"
                title="Remove"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
