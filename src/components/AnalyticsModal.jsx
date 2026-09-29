import React from 'react';
import { X, Activity, Wind, CloudRain, ShieldAlert, Thermometer, Layers, BarChart2 } from 'lucide-react';
import { getConvectiveAnalytics } from '../data/weatherEngine';

export default function AnalyticsModal({ activeRegion, leadTimeHours, onClose }) {
  const analytics = getConvectiveAnalytics(activeRegion, leadTimeHours);

  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div
        className="w-full max-w-4xl rounded-xl border flex flex-col overflow-hidden shadow-2xl"
        style={{
          background: 'var(--bg-panel)',
          borderColor: 'var(--border-primary)',
          color: 'var(--text-primary)',
          maxHeight: '90vh'
        }}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-card)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Activity size={20} />
            </div>
            <div>
              <h2 className="text-base font-semibold font-mono flex items-center gap-2">
                Convective Scale Diagnostics & Sounding Analytics
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-normal">
                  {analytics.zone}
                </span>
              </h2>
              <p className="text-xs text-muted font-mono">
                Station: <span className="text-primary font-medium">{analytics.dwrStation}</span> | Lead Time: +{leadTimeHours} hr
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors text-muted hover:text-primary"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex flex-col gap-6" style={{ fontFamily: 'var(--font-sans)' }}>
          {/* Key Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3.5 rounded-lg border flex flex-col gap-1" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
              <span className="text-xs text-muted font-mono flex items-center gap-1.5">
                <Thermometer size={14} className="text-rose-400" />
                CAPE (Convective Energy)
              </span>
              <span className="text-lg font-bold font-mono text-rose-400">
                {analytics.capeJkg} <span className="text-xs font-normal text-muted">J/kg</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">Severe Instability</span>
            </div>

            <div className="p-3.5 rounded-lg border flex flex-col gap-1" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
              <span className="text-xs text-muted font-mono flex items-center gap-1.5">
                <Wind size={14} className="text-sky-400" />
                Deep Layer Shear (0-6km)
              </span>
              <span className="text-lg font-bold font-mono text-sky-400">
                {analytics.bulkShearKts} <span className="text-xs font-normal text-muted">kts</span>
              </span>
              <span className="text-[10px] text-sky-400 font-mono">Supercell Favorable</span>
            </div>

            <div className="p-3.5 rounded-lg border flex flex-col gap-1" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
              <span className="text-xs text-muted font-mono flex items-center gap-1.5">
                <CloudRain size={14} className="text-amber-400" />
                Precipitable Water (PWAT)
              </span>
              <span className="text-lg font-bold font-mono text-amber-400">
                {analytics.precipitableWaterMm} <span className="text-xs font-normal text-muted">mm</span>
              </span>
              <span className="text-[10px] text-amber-400 font-mono">Cloudburst Potential</span>
            </div>

            <div className="p-3.5 rounded-lg border flex flex-col gap-1" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
              <span className="text-xs text-muted font-mono flex items-center gap-1.5">
                <ShieldAlert size={14} className="text-purple-400" />
                Microburst Risk
              </span>
              <span className="text-lg font-bold font-mono text-purple-400">
                {analytics.microburstProbability}%
              </span>
              <span className="text-[10px] text-purple-400 font-mono">Downburst Alert</span>
            </div>
          </div>

          {/* Vertical Profile Bar Cross-Section Chart */}
          <div className="p-4 rounded-xl border flex flex-col gap-3" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold flex items-center gap-2">
                <Layers size={15} className="text-blue-400" />
                Vertical Radar Reflectivity Profile (VAD / RHI 0–16 km Cross-Section)
              </span>
              <span className="text-[11px] font-mono text-muted">IMD Doppler Radar Scan</span>
            </div>

            {/* Vertical Profile Visualizer */}
            <div className="flex flex-col gap-2 pt-2">
              {analytics.verticalProfile.slice().reverse().map((item, idx) => {
                const percentage = Math.min(100, (item.dbz / 70) * 100);
                return (
                  <div key={idx} className="flex items-center gap-3 font-mono text-xs">
                    <span className="w-12 text-muted text-right">{item.heightKm} km</span>

                    {/* Bar */}
                    <div className="flex-1 h-5 rounded bg-black/30 overflow-hidden relative flex items-center px-2">
                      <div
                        className="h-full absolute left-0 top-0 rounded transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          background: item.dbz > 55 ? '#ef4444' : item.dbz > 40 ? '#f59e0b' : '#3b82f6',
                          opacity: 0.8
                        }}
                      />
                      <span className="relative z-10 text-[10px] font-bold text-white drop-shadow">
                        {item.dbz} dBZ
                      </span>
                    </div>

                    <span className="w-16 text-muted text-right">{item.tempC}°C</span>
                    <span className="w-16 text-sky-400 text-right">{item.windKts} kts</span>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-[10px] font-mono text-muted pt-2 border-t border-white/5">
              <span>Altitude (MSL)</span>
              <span>Reflectivity (dBZ) & Ambient Sounding Temp (°C)</span>
              <span>Wind Speed (kts)</span>
            </div>
          </div>

          {/* Additional Meteorological Indices */}
          <div className="grid grid-cols-3 gap-4 font-mono text-xs">
            <div className="p-3 rounded-lg border flex flex-col gap-1" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
              <span className="text-muted">Storm Relative Helicity (SRH)</span>
              <span className="text-sm font-bold text-primary">{analytics.helicitySrh} m²/s²</span>
            </div>
            <div className="p-3 rounded-lg border flex flex-col gap-1" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
              <span className="text-muted">Convective Inhibition (CIN)</span>
              <span className="text-sm font-bold text-emerald-400">{analytics.cinJkg} J/kg</span>
            </div>
            <div className="p-3 rounded-lg border flex flex-col gap-1" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
              <span className="text-muted">Peak Rain Rate Potential</span>
              <span className="text-sm font-bold text-amber-400">{analytics.currentRainPeakMmHr} mm/hr</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t flex items-center justify-between text-xs font-mono" style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-card)' }}>
          <span className="text-muted">Data Source: MoES Doppler Radar & INSAT-3D Sounder Telemetry</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md font-medium text-white bg-blue-600 hover:bg-blue-500 transition-colors"
          >
            Close Diagnostics
          </button>
        </div>
      </div>
    </div>
  );
}
