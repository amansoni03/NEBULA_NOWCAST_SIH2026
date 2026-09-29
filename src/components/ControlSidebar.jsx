import React from 'react';
import { Layers, Eye, Zap, Wind, Thermometer, ShieldAlert, Cpu, Sparkles, Compass } from 'lucide-react';

export default function ControlSidebar({
  selectedLayer,
  setSelectedLayer,
  showVectors,
  setShowVectors,
  show3DMode,
  setShow3DMode,
  activeStormCells
}) {
  const primaryCell = activeStormCells[0];

  return (
    <div className="w-full lg:w-80 bg-slate-950/80 backdrop-blur-md border border-slate-800 rounded-xl p-4 flex flex-col gap-4 shadow-xl">
      {/* Sensor Layer Selector */}
      <div>
        <h2 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-cyan-400" />
          MULTI-SENSOR DATA FUSION LAYER
        </h2>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setSelectedLayer('radar')}
            className={`p-2.5 rounded-lg border text-left text-xs font-medium transition-all ${
              selectedLayer === 'radar'
                ? 'bg-cyan-950/80 border-cyan-500 text-cyan-200 shadow-md shadow-cyan-950/50'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850'
            }`}
          >
            <div className="font-bold flex items-center gap-1 text-slate-200">
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              DWR Reflectivity
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">1-3 km dBZ Grid</div>
          </button>

          <button
            onClick={() => setSelectedLayer('sat_ir')}
            className={`p-2.5 rounded-lg border text-left text-xs font-medium transition-all ${
              selectedLayer === 'sat_ir'
                ? 'bg-purple-950/80 border-purple-500 text-purple-200 shadow-md shadow-purple-950/50'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850'
            }`}
          >
            <div className="font-bold flex items-center gap-1 text-slate-200">
              <Thermometer className="w-3.5 h-3.5 text-purple-400" />
              INSAT-3D IR
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Thermal Cooling</div>
          </button>

          <button
            onClick={() => setSelectedLayer('lightning')}
            className={`p-2.5 rounded-lg border text-left text-xs font-medium transition-all ${
              selectedLayer === 'lightning'
                ? 'bg-amber-950/80 border-amber-500 text-amber-200 shadow-md shadow-amber-950/50'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850'
            }`}
          >
            <div className="font-bold flex items-center gap-1 text-slate-200">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Lightning Mesh
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Strike Heatmap</div>
          </button>

          <button
            onClick={() => setSelectedLayer('velocity')}
            className={`p-2.5 rounded-lg border text-left text-xs font-medium transition-all ${
              selectedLayer === 'velocity'
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200 shadow-md shadow-emerald-950/50'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850'
            }`}
          >
            <div className="font-bold flex items-center gap-1 text-slate-200">
              <Wind className="w-3.5 h-3.5 text-emerald-400" />
              Doppler Velocity
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Radial Shear (m/s)</div>
          </button>
        </div>
      </div>

      {/* Out-of-the-Box Display Toggles */}
      <div className="space-y-2 border-t border-slate-800 pt-3">
        <h2 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          AI & OUT-OF-BOX MODEL VISUALIZERS
        </h2>

        {/* SCIT Motion Vectors Toggle */}
        <label className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800 cursor-pointer hover:bg-slate-850">
          <div className="flex items-center gap-2 text-xs">
            <Compass className="w-4 h-4 text-cyan-400" />
            <div>
              <div className="font-semibold text-slate-200">SCIT Trajectory Vectors</div>
              <div className="text-[10px] text-slate-400">0–6 Hr Extrapolation Arrows</div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={showVectors}
            onChange={(e) => setShowVectors(e.target.checked)}
            className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
          />
        </label>

        {/* 3D Volumetric Atmosphere Toggle */}
        <label className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800 cursor-pointer hover:bg-slate-850">
          <div className="flex items-center gap-2 text-xs">
            <Cpu className="w-4 h-4 text-purple-400" />
            <div>
              <div className="font-semibold text-slate-200">3D Digital Twin Scan</div>
              <div className="text-[10px] text-slate-400">Volumetric Cloud Heights</div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={show3DMode}
            onChange={(e) => setShow3DMode(e.target.checked)}
            className="w-4 h-4 accent-purple-500 rounded cursor-pointer"
          />
        </label>
      </div>

      {/* Pre-Rain Convective Initiation (CI) Telemetry Box */}
      {primaryCell && (
        <div className="bg-slate-900/90 border border-purple-900/50 rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-purple-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping"></span>
              PRE-RAIN CONVECTIVE INITIATION
            </span>
            <span className="text-[10px] bg-purple-950 text-purple-300 px-1.5 py-0.5 rounded border border-purple-800">
              INSAT-3D IR
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
            <div className="bg-slate-950 p-2 rounded border border-slate-800">
              <div className="text-[10px] text-slate-400">Cloud Cooling Rate</div>
              <div className="text-purple-400 font-bold text-sm">{primaryCell.ciThermalDropRate}</div>
            </div>

            <div className="bg-slate-950 p-2 rounded border border-slate-800">
              <div className="text-[10px] text-slate-400">Pre-Rain CI Lead Time</div>
              <div className="text-emerald-400 font-bold text-sm">+24 Mins Ahead</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
