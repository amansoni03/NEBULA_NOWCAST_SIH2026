import React from 'react';
import { Play, Pause, SkipForward, Gauge } from 'lucide-react';

export default function TimelineBar({
  leadTimeHours,
  setLeadTimeHours,
  isPlaying,
  setIsPlaying,
  playbackSpeed,
  setPlaybackSpeed,
}) {
  const formatTime = (h) => {
    if (h === 0) return '0hr';
    const hrs = Math.floor(h);
    const mins = Math.round((h - hrs) * 60);
    if (hrs === 0) return `${mins}m`;
    if (mins === 0) return `+${hrs}hr`;
    return `+${hrs}h${mins}m`;
  };

  return (
    <div
      className="shrink-0 border-t flex items-center gap-4 px-4 py-2"
      style={{
        background: 'var(--bg-panel)',
        borderColor: 'var(--border-primary)',
        height: 56,
      }}
    >
      {/* Labels */}
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', width: 70 }}>
        NOWCAST
      </div>

      {/* Timeline Slider */}
      <div className="flex-1 flex items-center gap-3">
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent-cyan)', fontWeight: 700 }}>
          {formatTime(leadTimeHours)}
        </span>

        <input
          type="range"
          min="0"
          max="6"
          step="0.25"
          value={leadTimeHours}
          onChange={(e) => { setLeadTimeHours(parseFloat(e.target.value)); setIsPlaying(false); }}
          className="timeline-slider flex-1"
        />

        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
          +6hr
        </span>
      </div>

      {/* Right label */}
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', width: 70, textAlign: 'right' }}>
        FORECAST
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 24, background: 'var(--border-secondary)' }} />

      {/* Playback Controls */}
      <div className="flex items-center gap-2">
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>PLAY/PAUSE</span>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-7 h-7 rounded flex items-center justify-center border transition-all hover:opacity-80"
          style={{
            background: isPlaying ? 'var(--accent-cyan)' : 'var(--bg-card)',
            borderColor: isPlaying ? 'var(--accent-cyan)' : 'var(--border-secondary)',
            color: isPlaying ? '#fff' : 'var(--text-secondary)',
          }}
        >
          {isPlaying ? <Pause size={12} /> : <Play size={12} />}
        </button>

        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>STEP</span>
        <button
          onClick={() => {
            setIsPlaying(false);
            setLeadTimeHours(prev => Math.min(6, parseFloat((prev + 0.25).toFixed(2))));
          }}
          className="w-7 h-7 rounded flex items-center justify-center border transition-all hover:opacity-80"
          style={{
            background: 'var(--bg-card)',
            borderColor: 'var(--border-secondary)',
            color: 'var(--text-secondary)',
          }}
        >
          <SkipForward size={12} />
        </button>

        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>SPEED</span>
        <button
          onClick={() => setPlaybackSpeed(prev => prev >= 4 ? 1 : prev * 2)}
          className="w-7 h-7 rounded flex items-center justify-center border transition-all hover:opacity-80"
          style={{
            background: 'var(--bg-card)',
            borderColor: 'var(--border-secondary)',
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            fontWeight: 700,
          }}
        >
          {playbackSpeed}x
        </button>
      </div>
    </div>
  );
}
