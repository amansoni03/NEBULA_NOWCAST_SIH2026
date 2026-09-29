import React, { useState, useEffect, useCallback, createContext } from 'react';
import Header from './components/Header';
import LeftSidebar from './components/LeftSidebar';
import RadarMap from './components/RadarMap';
import TimelineBar from './components/TimelineBar';
import RightSidebar from './components/RightSidebar';
import AnalyticsModal from './components/AnalyticsModal';
import AiTrainingModal from './components/AiTrainingModal';
import { CAPAlertModal, CrowdBarometerModal } from './components/Modals';

import {
  MONITORING_REGIONS,
  generateRadarGridPoints,
  getActiveStormCells,
  getSubdistrictCountdowns
} from './data/weatherEngine';

// Theme Context
export const ThemeContext = createContext();

export default function App() {
  // Theme
  const [theme, setTheme] = useState('dark');
  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Region & Layer State
  const [activeRegion, setActiveRegion] = useState(MONITORING_REGIONS[0]);

  // Layer toggles
  const [layers, setLayers] = useState({
    dwr_reflectivity: true,
    dwr_velocity: false,
    sat_thermal_ir: true,
    sat_ci_alerts: true,
    lightning_strikes: true,
    lightning_density: false,
    surface_barometers: false,
    ai_nowcast_vectors: true
  });

  const toggleLayer = useCallback((key) => {
    setLayers(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // Timeline state
  const [leadTimeHours, setLeadTimeHours] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  // Modal state
  const [isCapModalOpen, setIsCapModalOpen] = useState(false);
  const [isCrowdModalOpen, setIsCrowdModalOpen] = useState(false);
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);
  const [isAiTrainingModalOpen, setIsAiTrainingModalOpen] = useState(false);

  // Weather data
  const [gridPoints, setGridPoints] = useState([]);
  const [stormCells, setStormCells] = useState([]);
  const [countdowns, setCountdowns] = useState([]);

  // Recalculate when region or lead time changes
  useEffect(() => {
    const points = generateRadarGridPoints(activeRegion.lat, activeRegion.lng, leadTimeHours);
    const cells = getActiveStormCells(activeRegion.lat, activeRegion.lng, leadTimeHours);
    const sdCountdowns = getSubdistrictCountdowns(leadTimeHours);
    setGridPoints(points);
    setStormCells(cells);
    setCountdowns(sdCountdowns);
  }, [activeRegion, leadTimeHours]);

  // Playback loop
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setLeadTimeHours(prev => {
        if (prev >= 6) return 0;
        return parseFloat((prev + 0.25).toFixed(2));
      });
    }, 1000 / playbackSpeed);
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed]);

  const handleSelectRegion = (regionId) => {
    const match = MONITORING_REGIONS.find(r => r.id === regionId);
    if (match) setActiveRegion(match);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className="h-screen flex flex-col overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
        {/* Header */}
        <Header
          activeRegion={activeRegion}
          monitoringRegions={MONITORING_REGIONS}
          onSelectRegion={handleSelectRegion}
          onOpenCrowdModal={() => setIsCrowdModalOpen(true)}
          onOpenAnalyticsModal={() => setIsAnalyticsModalOpen(true)}
          onOpenAiTrainingModal={() => setIsAiTrainingModalOpen(true)}
        />

        {/* Main 3-Panel Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar: Layer Controls + SCIT */}
          <LeftSidebar
            layers={layers}
            toggleLayer={toggleLayer}
            stormCells={stormCells}
          />

          {/* Center: Map + Timeline */}
          <div className="flex-1 flex flex-col overflow-hidden" style={{ minWidth: 0 }}>
            {/* Map Area */}
            <div className="flex-1 relative">
              <RadarMap
                activeRegion={activeRegion}
                gridPoints={gridPoints}
                stormCells={stormCells}
                layers={layers}
                leadTimeHours={leadTimeHours}
                isPlaying={isPlaying}
                setIsPlaying={setIsPlaying}
                playbackSpeed={playbackSpeed}
                setPlaybackSpeed={setPlaybackSpeed}
              />
            </div>

            {/* Timeline Slider */}
            <TimelineBar
              leadTimeHours={leadTimeHours}
              setLeadTimeHours={setLeadTimeHours}
              isPlaying={isPlaying}
              setIsPlaying={setIsPlaying}
              playbackSpeed={playbackSpeed}
              setPlaybackSpeed={setPlaybackSpeed}
            />
          </div>

          {/* Right Sidebar: Hazards + Impact + CAP */}
          <RightSidebar
            countdowns={countdowns}
            primaryStormCell={stormCells[0]}
            onOpenCapModal={() => setIsCapModalOpen(true)}
          />
        </div>

        {/* Modals */}
        {isAiTrainingModalOpen && (
          <AiTrainingModal
            onClose={() => setIsAiTrainingModalOpen(false)}
          />
        )}
        {isAnalyticsModalOpen && (
          <AnalyticsModal
            activeRegion={activeRegion}
            leadTimeHours={leadTimeHours}
            onClose={() => setIsAnalyticsModalOpen(false)}
          />
        )}
        <CAPAlertModal
          isOpen={isCapModalOpen}
          onClose={() => setIsCapModalOpen(false)}
          stormCell={stormCells[0]}
          subdistrict={countdowns[0]}
        />
        <CrowdBarometerModal
          isOpen={isCrowdModalOpen}
          onClose={() => setIsCrowdModalOpen(false)}
        />
      </div>
    </ThemeContext.Provider>
  );
}
