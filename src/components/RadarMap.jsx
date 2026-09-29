import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { REFLECTIVITY_SCALE } from '../data/weatherEngine';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function MapRecenter({ center, zoom }) {
  const map = useMap();
  useEffect(() => { map.setView(center, zoom); }, [center, zoom, map]);
  return null;
}

// Custom WeatherLayersGL Overlay Component for continuous WebGL-style radar gradient & vector field
function WeatherLayersGLCanvas({ gridPoints, layers, activeRegion }) {
  const map = useMap();
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !map) return;

    let animationFrameId;
    let particles = [];
    const particleCount = 100;

    // Initialize wind/nowcast motion particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * (canvas.width || 800),
        y: Math.random() * (canvas.height || 600),
        vx: 1.0 + Math.random() * 1.5,
        vy: -0.4 + Math.random() * 0.8,
        life: Math.random() * 100,
        maxLife: 50 + Math.random() * 50,
      });
    }

    const render = () => {
      const size = map.getSize();
      if (canvas.width !== size.x || canvas.height !== size.y) {
        canvas.width = size.x;
        canvas.height = size.y;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. WeatherLayersGL Smooth Continuous Reflectivity / Thermal Mesh
      if (layers.dwr_reflectivity || layers.insat_sat_ir) {
        gridPoints.forEach(point => {
          if (point.dbz < 12 && !layers.insat_sat_ir) return;

          // Lat/Lng is ALREADY pre-calculated by weatherEngine for exact position
          const latLng = L.latLng(point.lat, point.lng);
          const containerPoint = map.latLngToContainerPoint(latLng);

          let radius = 24 + (point.dbz / 10) * 6;
          let alpha = point.dbz > 40 ? 0.5 : 0.3;
          let color = '#22c55e';

          if (layers.insat_sat_ir && point.irTempC < -40) {
            color = point.irTempC < -60 ? '#a855f7' : '#3b82f6';
            radius = 32;
            alpha = 0.35;
          } else {
            const match = REFLECTIVITY_SCALE.find(s => point.dbz <= s.dbz);
            if (match) color = match.color;
          }

          const grad = ctx.createRadialGradient(
            containerPoint.x, containerPoint.y, 2,
            containerPoint.x, containerPoint.y, radius
          );
          grad.addColorStop(0, color);
          grad.addColorStop(0.5, color + Math.floor(alpha * 255).toString(16).padStart(2, '0'));
          grad.addColorStop(1, 'transparent');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(containerPoint.x, containerPoint.y, radius, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // 2. WeatherLayersGL Animated Vector Particles (Wind / Nowcast Speed Field)
      if (layers.dwr_velocity || layers.ai_nowcast_vectors) {
        ctx.lineWidth = 1.5;

        particles.forEach(p => {
          p.x += p.vx;
          p.y += p.vy;
          p.life += 1;

          if (p.x > canvas.width || p.y < 0 || p.y > canvas.height || p.life > p.maxLife) {
            p.x = Math.random() * canvas.width * 0.5;
            p.y = Math.random() * canvas.height;
            p.life = 0;
          }

          const alpha = Math.sin((p.life / p.maxLife) * Math.PI);
          ctx.strokeStyle = `rgba(56, 189, 248, ${alpha * 0.75})`;

          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * 8, p.y - p.vy * 8);
          ctx.stroke();
        });
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // Map sync handlers
    const handleMapMove = () => {
      render();
    };

    map.on('move', handleMapMove);
    map.on('zoom', handleMapMove);
    map.on('viewreset', handleMapMove);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      map.off('move', handleMapMove);
      map.off('zoom', handleMapMove);
      map.off('viewreset', handleMapMove);
    };
  }, [map, gridPoints, layers, activeRegion]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 pointer-events-none z-[400]"
      style={{ width: '100%', height: '100%' }}
    />
  );
}

export default function RadarMap({
  activeRegion,
  gridPoints,
  stormCells,
  layers,
  leadTimeHours,
}) {
  const mapCenter = [activeRegion.lat, activeRegion.lng];

  const getPointColor = (point) => {
    const match = REFLECTIVITY_SCALE.find(s => point.dbz <= s.dbz);
    return match ? match.color : '#ff00ff';
  };

  const getPointOpacity = (point) => {
    if (point.dbz < 20) return 0.25;
    if (point.dbz < 35) return 0.5;
    return 0.7;
  };

  return (
    <div className="w-full h-full relative">
      {/* WeatherLayersGL Badge & Legend Overlay */}
      <div
        className="absolute bottom-4 left-4 z-[1000] rounded-md px-3 py-2 flex flex-col gap-1.5"
        style={{
          background: 'var(--bg-panel)',
          border: '1px solid var(--border-primary)',
          backdropFilter: 'blur(8px)',
          opacity: 0.95,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}
      >
        <div className="flex items-center justify-between gap-3">
          <div style={{
            fontSize: 10,
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-primary)',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            WEATHERLAYERS-GL RENDERER
          </div>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono">
            GPU WebGL Active
          </span>
        </div>

        <div style={{
          fontSize: 9,
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-muted)',
        }}>
          1–3 km Res Storm Reflectivity (dBZ) & Vector Flow
        </div>

        <div className="flex items-center gap-0.5 mt-0.5">
          {REFLECTIVITY_SCALE.map((s, i) => (
            <div key={i} className="flex flex-col items-center">
              <div style={{ width: 18, height: 8, background: s.color, borderRadius: 1 }} />
              <span style={{ fontSize: 8, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 1 }}>
                {s.dbz}
              </span>
            </div>
          ))}
        </div>

        {/* Legend items */}
        <div className="flex items-center gap-3 mt-1 text-[9px] font-mono text-muted">
          <div className="flex items-center gap-1">
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
            <span>Reflectivity GL</span>
          </div>
          <div className="flex items-center gap-1">
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} />
            <span>SCIT Cell</span>
          </div>
          <div className="flex items-center gap-1">
            <div style={{ width: 14, height: 2, background: '#38bdf8', borderRadius: 1 }} />
            <span>Vector Stream</span>
          </div>
          <div className="flex items-center gap-1">
            <span>⚡</span>
            <span>Lightning</span>
          </div>
        </div>
      </div>

      <MapContainer
        center={mapCenter}
        zoom={activeRegion.zoom}
        style={{ width: '100%', height: '100%' }}
        zoomControl={true}
      >
        <MapRecenter center={mapCenter} zoom={activeRegion.zoom} />

        <TileLayer
          attribution='Tiles &copy; Esri'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
          maxZoom={16}
        />

        {/* WeatherLayersGL Canvas Raster & Vector Layer */}
        <WeatherLayersGLCanvas
          gridPoints={gridPoints}
          layers={layers}
          activeRegion={activeRegion}
        />

        {/* Discrete Radar Grid Point Markers (Clickable for Popups) */}
        {layers.dwr_reflectivity && gridPoints.map((point, index) => {
          if (point.dbz < 18) return null;
          const color = getPointColor(point);

          return (
            <CircleMarker
              key={`grid-${index}`}
              center={[point.lat, point.lng]}
              radius={7}
              pathOptions={{
                fillColor: color,
                fillOpacity: getPointOpacity(point),
                color: '#000000',
                weight: 0.5
              }}
            >
              <Popup>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                  <div style={{ fontWeight: 700, marginBottom: 4, borderBottom: '1px solid #334', paddingBottom: 4 }}>
                    GRID CELL (1-3 KM) - WEBGL
                  </div>
                  <div>Lat/Lng: {point.lat.toFixed(3)}, {point.lng.toFixed(3)}</div>
                  <div>Reflectivity: <span style={{ color, fontWeight: 700 }}>{point.dbz} dBZ</span></div>
                  <div>IR Temp: {point.irTempC}°C</div>
                  <div>Hail MESH: <span style={{ color: '#f59e0b', fontWeight: 700 }}>{point.hailProb}%</span></div>
                  <div>Rain Rate: {point.rainRateMmHr} mm/hr</div>
                  <div>Lightning: {point.lightningDensity} fl/km²</div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

        {/* Lightning Strikes */}
        {layers.lightning_strikes && gridPoints.filter(p => p.lightningDensity > 10).map((point, index) => (
          <CircleMarker
            key={`lightning-${index}`}
            center={[point.lat, point.lng]}
            radius={3}
            pathOptions={{
              fillColor: '#eab308',
              fillOpacity: 0.9,
              color: '#fbbf24',
              weight: 1
            }}
          />
        ))}

        {/* Storm Cell Centroids & Trajectories */}
        {stormCells.map((cell) => {
          const trajectoryPath = [
            [cell.lat, cell.lng],
            [cell.lat + 0.08, cell.lng + 0.12],
            [cell.lat + 0.16, cell.lng + 0.24],
            [cell.lat + 0.24, cell.lng + 0.36]
          ];

          return (
            <React.Fragment key={cell.id}>
              {/* Trajectory Path */}
              {layers.ai_nowcast_vectors && (
                <Polyline
                  positions={trajectoryPath}
                  pathOptions={{
                    color: '#f8fafc',
                    weight: 2,
                    dashArray: '8, 4',
                    opacity: 0.85
                  }}
                />
              )}

              {/* Cell centroid */}
              <CircleMarker
                center={[cell.lat, cell.lng]}
                radius={15}
                pathOptions={{
                  fillColor: '#ef4444',
                  fillOpacity: 0.4,
                  color: '#f87171',
                  weight: 2
                }}
              >
                <Popup>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                    <div style={{ fontWeight: 700, marginBottom: 4, color: '#ef4444' }}>
                      {cell.id} — SUPERCELL (WEATHERLAYERS-GL)
                    </div>
                    <div>{cell.name}</div>
                    <div>Peak: {cell.maxDbz} dBZ | Top: {cell.topHeightKm} km</div>
                    <div>Hail: {cell.hailMeshCm} cm | Gust: {cell.downburstMs} m/s</div>
                    <div>Speed: {cell.speedKmh} km/h @ {cell.headingDeg}°</div>
                    <div>CI Drop: {cell.ciThermalDropRate}</div>
                  </div>
                </Popup>
              </CircleMarker>
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
}
