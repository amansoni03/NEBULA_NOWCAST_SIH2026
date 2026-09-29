import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Trash2 } from 'lucide-react';

function ToggleSwitch({ active, onToggle }) {
  return (
    <div
      className={`toggle-switch ${active ? 'active' : ''}`}
      onClick={onToggle}
    />
  );
}

function LayerGroup({ title, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{
        fontSize: 11,
        fontWeight: 700,
        color: 'var(--text-muted)',
        fontFamily: 'var(--font-mono)',
        marginBottom: 6,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
      }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function SCITCard({ cell, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="scit-card">
      <div
        className="flex items-center gap-1.5 cursor-pointer"
        onClick={() => setOpen(!open)}
        style={{ marginBottom: open ? 8 : 0 }}
      >
        {open ? <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} /> : <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />}
        <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
          {cell.id}
        </span>
        <div className="flex-1" />
        <Trash2 size={12} style={{ color: 'var(--text-muted)', cursor: 'pointer' }} />
      </div>

      {open && (
        <div style={{ paddingLeft: 20 }}>
          <div className="scit-row">
            <span className="scit-label">Location</span>
            <span className="scit-value">{cell.lat.toFixed(2)}°N, {cell.lng.toFixed(2)}°E</span>
          </div>
          <div className="scit-row">
            <span className="scit-label">Status</span>
            <span className={`scit-value ${cell.cloudburstRisk === 'HIGH' ? 'severe' : 'moderate'}`}>
              {cell.cloudburstRisk === 'HIGH' ? 'Severe' : 'Moderate'}
            </span>
          </div>
          <div className="scit-row">
            <span className="scit-label">ETA</span>
            <span className="scit-value">+{cell.speedKmh > 35 ? '25' : '40'}m to nearest city</span>
          </div>
          <div className="scit-row">
            <span className="scit-label">Max dBZ</span>
            <span className="scit-value" style={{ color: 'var(--severity-red)' }}>{cell.maxDbz}</span>
          </div>
          <div className="scit-row">
            <span className="scit-label">Top (km)</span>
            <span className="scit-value">{cell.topHeightKm}</span>
          </div>
          <div className="scit-row">
            <span className="scit-label">Speed</span>
            <span className="scit-value">{cell.speedKmh} km/h @ {cell.headingDeg}°</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LeftSidebar({ layers, toggleLayer, stormCells }) {
  return (
    <div
      className="shrink-0 overflow-y-auto border-r flex flex-col"
      style={{
        width: 260,
        background: 'var(--bg-panel)',
        borderColor: 'var(--border-primary)',
      }}
    >
      {/* Layer Controls Section */}
      <div className="panel-header">
        <span>📡</span>
        <span>Multi-Source Data Fusion & Layer Control</span>
      </div>

      <div className="panel-body">
        {/* DWR */}
        <LayerGroup title="Doppler Weather Radar (DWR)">
          <div className="layer-row">
            <div className="layer-label">
              <span className="layer-icon" style={{ background: '#22c55e' }}></span>
              Reflectivity
            </div>
            <ToggleSwitch active={layers.dwr_reflectivity} onToggle={() => toggleLayer('dwr_reflectivity')} />
          </div>
          <div className="layer-row">
            <div className="layer-label">
              <span className="layer-icon" style={{ background: '#06b6d4' }}></span>
              Velocity
            </div>
            <ToggleSwitch active={layers.dwr_velocity} onToggle={() => toggleLayer('dwr_velocity')} />
          </div>
        </LayerGroup>

        {/* Satellite */}
        <LayerGroup title="INSAT-3D/3DR Satellite">
          <div className="layer-row">
            <div className="layer-label">
              <span className="layer-icon" style={{ background: '#a855f7' }}></span>
              Thermal IR
            </div>
            <ToggleSwitch active={layers.sat_thermal_ir} onToggle={() => toggleLayer('sat_thermal_ir')} />
          </div>
          <div className="layer-row">
            <div className="layer-label">
              <span className="layer-icon" style={{ background: '#f43f5e' }}></span>
              🔥 CI Alerts
            </div>
            <ToggleSwitch active={layers.sat_ci_alerts} onToggle={() => toggleLayer('sat_ci_alerts')} />
          </div>
        </LayerGroup>

        {/* Lightning */}
        <LayerGroup title="Lightning Network">
          <div className="layer-row">
            <div className="layer-label">
              <span className="layer-icon" style={{ background: '#eab308' }}></span>
              Strikes
            </div>
            <ToggleSwitch active={layers.lightning_strikes} onToggle={() => toggleLayer('lightning_strikes')} />
          </div>
          <div className="layer-row">
            <div className="layer-label">
              <span className="layer-icon" style={{ background: '#f97316' }}></span>
              ⚡ Density Grid
            </div>
            <ToggleSwitch active={layers.lightning_density} onToggle={() => toggleLayer('lightning_density')} />
          </div>
        </LayerGroup>

        {/* Surface & AI */}
        <LayerGroup title="">
          <div className="layer-row">
            <div className="layer-label">
              <span className="layer-icon" style={{ background: '#3b82f6' }}></span>
              Surface Micro-Barometers
            </div>
            <ToggleSwitch active={layers.surface_barometers} onToggle={() => toggleLayer('surface_barometers')} />
          </div>
          <div className="layer-row">
            <div className="layer-label">
              <span className="layer-icon" style={{ background: '#06b6d4' }}></span>
              AI Nowcast Vectors
            </div>
            <ToggleSwitch active={layers.ai_nowcast_vectors} onToggle={() => toggleLayer('ai_nowcast_vectors')} />
          </div>
        </LayerGroup>
      </div>

      {/* SCIT Section */}
      <div className="panel-header" style={{ borderTop: '1px solid var(--border-primary)' }}>
        <span>🎯</span>
        <span>Storm Cell Identification (SCIT)</span>
      </div>

      <div className="panel-body flex-1">
        {stormCells.map((cell, idx) => (
          <SCITCard key={cell.id} cell={cell} defaultOpen={idx === 0} />
        ))}
      </div>
    </div>
  );
}
