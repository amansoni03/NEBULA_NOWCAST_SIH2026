import React from 'react';
import { Play, Pause, RotateCcw, Clock, FastForward } from 'lucide-react';

export default function TimeSlider({
  leadTimeHours,
  setLeadTimeHours,
  isPlaying,
  setIsPlaying
}) {
  const steps = [0, 0.25, 0.5, 0.75, 1, 1.5, 2, 2.5, 3, 4, 5, 6];

  const formatLeadTimeLabel = (val) => {
    if (val === 0) return 'NOWCAST (LIVE T=0)';
    const hrs = Math.floor(val);
    const mins = Math.round((val - hrs) * 60);
    return `+${hrs > 0 ? `${hrs}h ` : ''}${mins > 0 ? `${mins}m` : ''} LEAD FORECAST`;
  };

  return (
    <div className="w-full bg-slate-950/90 border border-slate-800 rounded-xl p-3 flex flex-col gap-2 backdrop-blur-md shadow-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono font-bold text-slate-200">
            CONVECTIVE EXTRAPOLATION TIMELINE (0–6 HOURS)
          </span>
        </div>

        {/* Current Forecast Lead Time Badge */}
        <div className="px-3 py-1 bg-cyan-950/80 border border-cyan-700/80 text-cyan-300 font-mono text-xs font-bold rounded-lg shadow-sm">
          {formatLeadTimeLabel(leadTimeHours)}
        </div>
      </div>

      {/* Slider & Playback Controls */}
      <div className="flex items-center gap-3">
        {/* Play / Pause Animation Button */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-9 h-9 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 flex items-center justify-center transition-all shadow-md shadow-cyan-600/30"
          title={isPlaying ? 'Pause extrapolation loop' : 'Play 0–6 hour loop'}
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
        </button>

        {/* Reset to T=0 Button */}
        <button
          onClick={() => {
            setLeadTimeHours(0);
            setIsPlaying(false);
          }}
          className="w-9 h-9 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 flex items-center justify-center transition-all"
          title="Reset to Live Observation"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Range Slider Track */}
        <div className="flex-1 relative flex items-center px-1">
          <input
            type="range"
            min="0"
            max="6"
            step="0.25"
            value={leadTimeHours}
            onChange={(e) => {
              setLeadTimeHours(parseFloat(e.target.value));
              setIsPlaying(false);
            }}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
          />
        </div>

        {/* Quick Jump Buttons */}
        <div className="hidden sm:flex items-center gap-1 font-mono text-[10px]">
          <button
            onClick={() => setLeadTimeHours(0.5)}
            className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300"
          >
            +30m
          </button>
          <button
            onClick={() => setLeadTimeHours(1)}
            className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300"
          >
            +1h
          </button>
          <button
            onClick={() => setLeadTimeHours(3)}
            className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300"
          >
            +3h
          </button>
          <button
            onClick={() => setLeadTimeHours(6)}
            className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300"
          >
            +6h
          </button>
        </div>
      </div>
    </div>
  );
}
