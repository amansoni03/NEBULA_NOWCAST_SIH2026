import React from 'react';
import { AlertTriangle, Clock, Zap, Wind, CloudRain, ShieldCheck, Sprout, Plane, Building2, Flame } from 'lucide-react';

export default function HazardAlertPanel({
  countdowns,
  primaryStormCell,
  leadTimeHours
}) {
  return (
    <div className="w-full lg:w-96 bg-slate-950/80 backdrop-blur-md border border-slate-800 rounded-xl p-4 flex flex-col gap-4 shadow-xl overflow-y-auto max-h-[calc(100vh-140px)]">
      {/* Live Imminent Hazard Countdowns Section */}
      <div>
        <h2 className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-rose-500 animate-pulse" />
          IMMINENT SUB-DISTRICT COUNTDOWNS
        </h2>

        <div className="space-y-2">
          {countdowns.map((sd) => (
            <div
              key={sd.id}
              className="p-3 rounded-xl border bg-slate-900/90 border-slate-800 flex flex-col gap-2 relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: sd.color }}></span>
                  <span className="text-xs font-bold text-slate-200">{sd.name}</span>
                </div>

                {/* ETA Countdown Badge */}
                <div className="px-2.5 py-1 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-300 font-mono text-xs font-bold flex items-center gap-1 animate-pulse">
                  <Clock className="w-3 h-3" />
                  <span>{sd.etaMinutes > 0 ? `${sd.etaMinutes}m ETA` : 'HAZARD ACTIVE'}</span>
                </div>
              </div>

              <div className="text-[11px] font-mono text-slate-300 bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                <div className="text-amber-400 font-bold flex items-center gap-1 mb-0.5">
                  <AlertTriangle className="w-3 h-3" />
                  {sd.hazardType}
                </div>
                <div className="text-slate-400 text-[10px]">{sd.impactAgri}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Multi-Hazard Parameter Metrics Matrix */}
      {primaryStormCell && (
        <div className="border-t border-slate-800 pt-3 space-y-2">
          <h2 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-400" />
            SEVERE PARAMETER PREDICTORS
          </h2>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            {/* Hail MESH */}
            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
              <div className="text-[10px] text-slate-400">Hail MESH Index</div>
              <div className="text-amber-400 font-bold text-base mt-0.5">
                {primaryStormCell.hailMeshCm} cm
              </div>
              <div className="text-[9px] text-slate-400">Probability &gt; 90%</div>
            </div>

            {/* Downburst Velocity */}
            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
              <div className="text-[10px] text-slate-400">Microburst Gust</div>
              <div className="text-rose-400 font-bold text-base mt-0.5">
                {primaryStormCell.downburstMs} m/s
              </div>
              <div className="text-[9px] text-slate-400">Low-level Shear</div>
            </div>

            {/* Lightning Density */}
            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
              <div className="text-[10px] text-slate-400">Lightning Rate</div>
              <div className="text-purple-400 font-bold text-base mt-0.5">
                {primaryStormCell.lightningRate} /min
              </div>
              <div className="text-[9px] text-slate-400">Ground Flash Density</div>
            </div>

            {/* Cloudburst Risk */}
            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
              <div className="text-[10px] text-slate-400">Cloudburst Threshold</div>
              <div className={`font-bold text-base mt-0.5 ${primaryStormCell.cloudburstRisk === 'HIGH' ? 'text-rose-500' : 'text-amber-400'}`}>
                {primaryStormCell.cloudburstRisk}
              </div>
              <div className="text-[9px] text-slate-400">&gt;100 mm/hr Rate</div>
            </div>
          </div>
        </div>
      )}

      {/* Sector Impact Translator */}
      <div className="border-t border-slate-800 pt-3 space-y-2">
        <h2 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Building2 className="w-4 h-4 text-cyan-400" />
          SECTOR-SPECIFIC IMPACT ADVISORY
        </h2>

        <div className="space-y-2 text-xs">
          {/* Agriculture Advisory */}
          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
            <div className="font-bold text-emerald-400 flex items-center gap-1">
              🌾 Agriculture Sector
            </div>
            <p className="text-[11px] text-slate-300">
              Deploy anti-hail nets immediately for standing crops. Delay pesticide spraying due to 35+ mm rain accumulation forecast.
            </p>
          </div>

          {/* Aviation & Drone Corridor Advisory */}
          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
            <div className="font-bold text-sky-400 flex items-center gap-1">
              ✈️ Aviation & Drone Corridors
            </div>
            <p className="text-[11px] text-slate-300">
              Terminal doppler shear alert at Sector 2 approach. Divert low-altitude UAV/Drone operations away from Cell Alpha vector.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
