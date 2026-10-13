import React, { useState } from 'react';
import { Copy, Check, Sparkles, MessageSquareQuote, Send } from 'lucide-react';
import { playBlip, playSuccessChime } from '../utils/sound';
import { ActivityMode } from './ActivitySelector';

interface ExecutiveExcuseGeneratorProps {
  avoidedTask: string;
  isPanicMode: boolean;
  mode?: ActivityMode;
}

interface Excuse {
  id: string;
  category: string;
  text: (task: string) => string;
  label: string;
}

const WORK_EXCUSES: Excuse[] = [
  {
    id: 'w-1',
    category: 'Colleague Blame',
    text: (task) =>
      `"Regarding '${task}': Waiting on the final latency numbers from the APAC sync before I lock down Section 3. Want to make sure our assumptions are solid."`,
    label: 'Waiting on Teammate',
  },
  {
    id: 'w-2',
    category: 'Tech Issue',
    text: (task) =>
      `"Drafting '${task}' inside an isolated offline markdown file to avoid Google Docs overwrite lag. Will paste the link in 5 mins."`,
    label: 'Tooling Glitch',
  },
  {
    id: 'w-3',
    category: 'Deep Research',
    text: (task) =>
      `"Synthesizing pilot customer feedback from this morning. Condensing 40 pages of notes into 3 clear action items for '${task}'."`,
    label: 'Data Crunching',
  },
  {
    id: 'w-4',
    category: 'Architecture',
    text: (task) =>
      `"Taking a step back on '${task}' to double-check our system scalability boundaries with principal engineering."`,
    label: 'Reviewing Design',
  },
];

const GAME_EXCUSES: Excuse[] = [
  {
    id: 'g-1',
    category: 'Squad Alert',
    text: (task) =>
      `"Need 2 mins to stretch hands and grab water after that intense round in '${task}'. Be right back for the next queue!"`,
    label: 'Quick Hand Reset',
  },
  {
    id: 'g-2',
    category: 'Hardware / Lag',
    text: (task) =>
      `"Ping spiked to 140ms in '${task}'. Restarting discord and router quickly so I don't throw the next match."`,
    label: 'High Latency / Ping',
  },
  {
    id: 'g-3',
    category: 'Real Life',
    text: (task) =>
      `"Doorbell rang / delivery arrived while in '${task}'. Stepping away for 60 seconds."`,
    label: 'Delivery Interruption',
  },
  {
    id: 'g-4',
    category: 'Thermal Throttle',
    text: (task) =>
      `"GPU fans are running full blast during '${task}'. Letting the rig cool down for 2 minutes before queuing again."`,
    label: 'System Cool Down',
  },
];

const TIMEPASS_EXCUSES: Excuse[] = [
  {
    id: 't-1',
    category: 'Self Reality Check',
    text: (task) =>
      `"I've been stuck in a loop of '${task}'. Putting my phone in the other room for 15 minutes to reset my attention span."`,
    label: 'Break Doomscroll Loop',
  },
  {
    id: 't-2',
    category: 'Research Excuse',
    text: (task) =>
      `"I was legitimately looking up a tutorial related to '${task}', but the algorithm rabbit hole pulled me in. Time to close the tabs."`,
    label: 'Algorithm Detour',
  },
  {
    id: 't-3',
    category: 'Mental Fatigue',
    text: (task) =>
      `"My brain hit a wall trying to start '${task}'. Stepping outside for 60 seconds of fresh air instead of staring blankly."`,
    label: 'Brain Refresh',
  },
];

export const ExecutiveExcuseGenerator: React.FC<ExecutiveExcuseGeneratorProps> = ({
  avoidedTask,
  isPanicMode,
  mode = 'work',
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [customExcuse, setCustomExcuse] = useState<string | null>(null);

  const excuses =
    mode === 'game'
      ? GAME_EXCUSES
      : mode === 'timepass'
      ? TIMEPASS_EXCUSES
      : WORK_EXCUSES;

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    playSuccessChime();
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleQuickExcuse = () => {
    playBlip(780);
    const options =
      mode === 'game'
        ? [
            `"Stepping away from '${avoidedTask}' for 60s to shake out wrist tension and drink water!"`,
            `"Give me 2 mins before next match—grabbing eye drops and stretching legs."`,
          ]
        : mode === 'timepass'
        ? [
            `"Closing out '${avoidedTask}' tabs right now. 2-minute reset timer is running!"`,
            `"Breaking the screen trance. Getting up for a quick doorway stretch."`,
          ]
        : [
            `"Just wrapping up the final review notes on '${avoidedTask}'. Dropping the link shortly!"`,
            `"Offline draft of '${avoidedTask}' is drafted; doing a quick grammar & formatting pass now."`,
          ];
    const pick = options[Math.floor(Math.random() * options.length)];
    setCustomExcuse(pick);
  };

  const titleText =
    mode === 'game'
      ? 'Squad Pause & Break Excuses'
      : mode === 'timepass'
      ? 'Reality Check & Habit Interrupters'
      : 'Plausible Deniability Generator';

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5 shadow-lg backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <MessageSquareQuote className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-semibold tracking-wide text-slate-200 font-sans">
            {titleText}
          </h3>
        </div>

        <button
          onClick={handleQuickExcuse}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans font-medium bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Quick 1-Click Excuse</span>
        </button>
      </div>

      <p className="text-[11px] text-slate-400 mb-3 font-sans">
        Ready-to-copy messages you can send to colleagues, friends, or your squad when taking a break.
      </p>

      {/* Generated Custom Excuse */}
      {customExcuse && (
        <div className="mb-3 p-3 rounded-lg border border-emerald-500/40 bg-emerald-950/30 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 animate-fadeIn">
          <div className="flex items-start gap-2 text-slate-200 font-sans">
            <Send className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span className="italic">{customExcuse}</span>
          </div>
          <button
            onClick={() => handleCopy('custom', customExcuse)}
            className="px-2.5 py-1 rounded bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-bold shrink-0 self-end sm:self-auto flex items-center gap-1 text-[11px] transition-colors cursor-pointer"
          >
            {copiedId === 'custom' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            <span>{copiedId === 'custom' ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>
      )}

      {/* Cards list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {excuses.map((excuse) => {
          const text = excuse.text(avoidedTask);
          const isCopied = copiedId === excuse.id;

          return (
            <div
              key={excuse.id}
              className="p-3 rounded-lg border border-slate-800 bg-slate-950/50 hover:border-slate-700 hover:bg-slate-900/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {excuse.label}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {excuse.category}
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-sans leading-relaxed italic mb-2">
                  {text}
                </p>
              </div>

              <div className="flex items-center justify-end pt-2 border-t border-slate-800/60">
                <button
                  onClick={() => handleCopy(excuse.id, text)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-sans font-medium transition-all cursor-pointer ${
                    isCopied
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Text</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
