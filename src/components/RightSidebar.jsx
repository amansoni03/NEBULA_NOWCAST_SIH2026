import React, { useState, useEffect } from 'react';
import { AlertTriangle, Download, Wifi } from 'lucide-react';
import { generateCAPAlertXML } from '../data/weatherEngine';

export default function RightSidebar({ countdowns, primaryStormCell, onOpenCapModal }) {
  // Live countdown timers
  const [timers, setTimers] = useState({});

  useEffect(() => {
    const interval = setInterval(() => {
      const newTimers = {};
      countdowns.forEach(sd => {
        const totalSec = sd.etaMinutes * 60;
        const mins = Math.floor(totalSec / 60);
        const secs = totalSec % 60;
        newTimers[sd.id] = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`;
      });
      setTimers(newTimers);
    }, 1000);
    return () => clearInterval(interval);
  }, [countdowns]);

  const capPreview = primaryStormCell && countdowns[0]
    ? `<REALERT - THUNDERSTORM>\nCAP XML:\n  <CAP XML>\n    <GENERATE CAP > active: CATEGORIST>\n    </CAP>\n  </CAP XML>`
    : '';

  return (
    <div
      className="shrink-0 overflow-y-auto border-l flex flex-col"
      style={{
        width: 280,
        background: 'var(--bg-panel)',
        borderColor: 'var(--border-primary)',
      }}
    >
      {/* Section: Multi-Hazard & Sector Impact */}
      <div className="panel-header">
        <span>⚠️</span>
        <span>Multi-Hazard & Sector Impact Engine</span>
      </div>

      {/* Live Hazard Countdowns */}
      <div className="panel-body" style={{ borderBottom: '1px solid var(--border-primary)' }}>
        <div style={{
          fontSize: 10,
          fontFamily: 'var(--font-mono)',
          fontWeight: 700,
          color: 'var(--text-muted)',
          marginBottom: 8,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        }}>
          Live Hazard Countdowns
        </div>

        {/* Header row */}
        <div className="grid grid-cols-3 gap-1 mb-1" style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontWeight: 600 }}>
          <span>HAZARD</span>
          <span>DISTRICT</span>
          <span style={{ textAlign: 'right' }}>COUNTDOWN</span>
        </div>

        {countdowns.map(sd => (
          <div key={sd.id} className="countdown-row" style={{ gridTemplateColumns: '1fr 1fr auto' }}>
            <div>
              <span style={{ fontSize: 11, fontWeight: 600, color: sd.color }}>
                {sd.hazardType.split(' ')[0]}
              </span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-primary)' }}>
              {sd.name.split(' ').slice(0, 2).join(' ')}
            </div>
            <div className="countdown-timer animate-countdown" style={{ color: sd.color }}>
              {timers[sd.id] || '00:00:00'}
            </div>
          </div>
        ))}
      </div>

      {/* Sector Impact Matrix */}
      <div className="panel-body" style={{ borderBottom: '1px solid var(--border-primary)' }}>
        <div style={{
          fontSize: 10,
          fontFamily: 'var(--font-mono)',
          fontWeight: 700,
          color: 'var(--text-muted)',
          marginBottom: 8,
          textTransform: 'uppercase',
        }}>
          Sector Impact Matrix
        </div>

        <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: 4 }}>
          <span style={{ float: 'right' }}>High &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Low</span>
        </div>

        {/* Agriculture */}
        <div className="impact-row">
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)' }}>Agriculture</div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>Crop damage, irrigation</div>
          </div>
          <span className="badge badge-red">High</span>
          <span className="badge badge-orange">Medium</span>
        </div>

        {/* Aviation */}
        <div className="impact-row">
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)' }}>Aviation</div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>Airport Operations</div>
          </div>
          <span className="badge badge-orange">Medium</span>
          <span className="badge badge-orange">Medium</span>
        </div>

        {/* Urban Flash Flood */}
        <div className="impact-row">
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)' }}>Urban Flash Flood</div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>Traffic, Drainage</div>
          </div>
          <span className="badge badge-red">Traffic</span>
          <span className="badge badge-yellow">Drainage</span>
        </div>
      </div>

      {/* Emergency Alerting & CAP Export */}
      <div className="panel-body flex-1">
        <div style={{
          fontSize: 10,
          fontFamily: 'var(--font-mono)',
          fontWeight: 700,
          color: 'var(--text-muted)',
          marginBottom: 8,
          textTransform: 'uppercase',
        }}>
          Emergency Alerting & CAP Export
        </div>

        {/* Red Alert Banner */}
        <div className="alert-banner alert-banner-red" style={{ marginBottom: 10 }}>
          <AlertTriangle size={14} />
          <span>RED ALERT - THUNDERSTORM</span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 mb-3">
          <button className="btn btn-primary w-full" onClick={onOpenCapModal}>
            <Download size={12} />
            GENERATE CAP XML
          </button>
          <button className="btn btn-outline w-full">
            <Wifi size={12} />
            OFFLINE FALLBACK PACKET
          </button>
        </div>

        {/* CAP XML Preview */}
        <div className="cap-preview">
          {`<REALERT - THUNDERSTORM>
CAP XML:
  <CAP_ALERT>
    <identifier>NCMRWF-NOWCAST</identifier>
    <sender>ncmrwf.gov.in</sender>
    <status>Actual</status>
    <severity>Extreme</severity>
    <event>Severe Thunderstorm</event>
  </CAP_ALERT>`}
        </div>
      </div>
    </div>
  );
}
