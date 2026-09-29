import React, { useContext, useState, useEffect } from 'react';
import { ThemeContext } from '../App';
import { Sun, Moon, Settings, Bell, Wifi, BarChart2, Cpu } from 'lucide-react';

export default function Header({
  activeRegion,
  monitoringRegions,
  onSelectRegion,
  onOpenCrowdModal,
  onOpenAnalyticsModal,
  onOpenAiTrainingModal
}) {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const utc = now.toUTCString().slice(17, 25);
      setTimeStr(`${utc} UTC`);
    };
    update();
    const i = setInterval(update, 1000);
    return () => clearInterval(i);
  }, []);

  const zones = Array.from(new Set(monitoringRegions.map(r => r.zone || 'Pan India')));

  return (
    <header
      className="flex items-center justify-between px-4 h-12 border-b shrink-0"
      style={{
        background: 'var(--header-bg)',
        borderColor: 'var(--border-primary)',
      }}
    >
      {/* Left: Logo + Title */}
      <div className="flex items-center gap-3">
        {/* MoES Logo Badge */}
        <div
          className="w-8 h-8 rounded-md flex items-center justify-center text-white font-bold text-xs"
          style={{ background: 'linear-gradient(135deg, #0ea5e9, #3b82f6)' }}
        >
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, lineHeight: 1, textAlign: 'center' }}>
            MoES<br/>NCMRWF
          </span>
        </div>

        <div className="flex items-center gap-2">
          <h1
            className="font-bold text-sm tracking-wide"
            style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}
          >
            NEBULA-NOWCAST <span className="font-normal text-xs text-muted">| Convective Nowcasting System</span>
          </h1>
          <span
            className="text-xs px-2 py-0.5 rounded"
            style={{
              background: 'rgba(6,182,212,0.12)',
              color: 'var(--accent-cyan)',
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              fontWeight: 600,
            }}
          >
            SIH 2026 - PS 26084
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded flex items-center gap-1 font-mono text-[10px]"
            style={{
              background: 'rgba(16,185,129,0.12)',
              color: '#10b981',
              border: '1px solid rgba(16,185,129,0.3)',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Supabase Live (frtc...bash)
          </span>
        </div>
      </div>

      {/* Center: Region Selector & Station */}
      <div className="flex items-center gap-3">
        <select
          value={activeRegion.id}
          onChange={(e) => onSelectRegion(e.target.value)}
          className="text-xs rounded-md px-3 py-1.5 border focus:outline-none cursor-pointer"
          style={{
            background: 'var(--bg-input)',
            color: 'var(--text-primary)',
            borderColor: 'var(--border-secondary)',
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
          }}
        >
          {zones.map(zoneName => (
            <optgroup key={zoneName} label={`--- ${zoneName.toUpperCase()} ---`}>
              {monitoringRegions.filter(r => (r.zone || 'Pan India') === zoneName).map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </optgroup>
          ))}
        </select>

        <div className="flex items-center gap-1.5" style={{ color: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }}>
          <Wifi size={12} style={{ color: 'var(--accent-emerald)' }} />
          <span className="hidden sm:inline">{activeRegion.dwrStation}</span>
        </div>
      </div>

      {/* Right: Actions & Theme Toggle */}
      <div className="flex items-center gap-2">
        {/* AI Model & Data Sync Button */}
        <button
          onClick={onOpenAiTrainingModal}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-medium border text-emerald-400 bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20 transition-all"
        >
          <Cpu size={13} />
          <span>AI Model & DB Storage</span>
        </button>

        {/* Diagnostics & Soundings Button */}
        <button
          onClick={onOpenAnalyticsModal}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-medium border text-blue-400 bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20 transition-all"
        >
          <BarChart2 size={13} />
          <span>Analytics & Soundings</span>
        </button>

        <span
          className="text-xs px-2 py-1 rounded hidden md:inline"
          style={{
            background: 'var(--bg-card)',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            border: '1px solid var(--border-secondary)',
          }}
        >
          {timeStr}
        </span>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-8 h-8 rounded-md flex items-center justify-center border transition-all hover:opacity-80"
          style={{
            background: 'var(--bg-card)',
            borderColor: 'var(--border-secondary)',
            color: 'var(--text-secondary)',
          }}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
        </button>

        <button
          onClick={onOpenCrowdModal}
          className="w-8 h-8 rounded-md flex items-center justify-center border transition-all hover:opacity-80"
          style={{
            background: 'var(--bg-card)',
            borderColor: 'var(--border-secondary)',
            color: 'var(--text-secondary)',
          }}
          title="Ground IoT Mesh Barometer"
        >
          <Settings size={14} />
        </button>

        <button
          className="w-8 h-8 rounded-md flex items-center justify-center border transition-all hover:opacity-80"
          style={{
            background: 'var(--bg-card)',
            borderColor: 'var(--border-secondary)',
            color: 'var(--text-secondary)',
          }}
          title="Notifications"
        >
          <Bell size={14} />
        </button>
      </div>
    </header>
  );
}
