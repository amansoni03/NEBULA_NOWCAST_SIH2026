import React, { useState } from 'react';
import { X, Play, Database, Cpu, CheckCircle2, AlertTriangle, Activity, RefreshCw } from 'lucide-react';
import { aiNowcastModel } from '../services/nowcastAiModel';
import { syncAllDataToSupabase } from '../services/dataSyncService';

export default function AiTrainingModal({ onClose }) {
  const [isTraining, setIsTraining] = useState(false);
  const [trainingStatus, setTrainingStatus] = useState(null);
  const [trainingLogs, setTrainingLogs] = useState([]);

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncLogs, setSyncLogs] = useState([]);

  // Start AI Model Training
  const handleStartTraining = async () => {
    setIsTraining(true);
    setTrainingLogs(['[AI Engine] Initializing ConvLSTM Recurrent Neural Network...']);

    await aiNowcastModel.train((progress) => {
      setTrainingStatus(progress);
      setTrainingLogs(prev => [...prev.slice(-8), progress.statusText]);
    });

    setIsTraining(false);
    setTrainingLogs(prev => [...prev, '✅ ConvLSTM Spatial-Temporal Nowcast Model Training Complete! Weights saved.']);
  };

  // Start Syncing Data to Supabase
  const handleStartSync = async () => {
    setIsSyncing(true);
    setSyncLogs(['[Database Service] Connecting to Supabase project frtcdfzpnlgqixxdbash...']);

    const res = await syncAllDataToSupabase((progress) => {
      setSyncLogs(progress.log);
    });

    setIsSyncing(false);
  };

  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
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
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Cpu size={20} />
            </div>
            <div>
              <h2 className="text-base font-semibold font-mono flex items-center gap-2">
                AI ConvLSTM Training & Supabase Data Storage Pipeline
              </h2>
              <p className="text-xs text-muted font-mono">
                SIH 2026 PS 26084 | 1–3 km Spatial Resolution Nowcast Engine
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
          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1: AI Model Training */}
            <div className="p-5 rounded-xl border flex flex-col justify-between gap-4" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-sky-400 flex items-center gap-1.5">
                    <Activity size={15} />
                    ConvLSTM Nowcast Model
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 font-mono">
                    Deep Learning
                  </span>
                </div>
                <p className="text-xs text-muted font-mono">
                  Trains spatial-temporal recurrent kernels on Doppler Radar reflectivity sequence tensors for 0–6 hr extrapolation.
                </p>
              </div>

              {trainingStatus && (
                <div className="p-3 rounded-lg bg-black/40 border border-sky-500/20 flex flex-col gap-2 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted">Epoch: {trainingStatus.epoch}/{trainingStatus.totalEpochs}</span>
                    <span className="text-sky-400 font-bold">Accuracy: {trainingStatus.accuracy}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-sky-400 h-full transition-all duration-300"
                      style={{ width: `${(trainingStatus.epoch / trainingStatus.totalEpochs) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-muted">
                    <span>Loss: {trainingStatus.loss}</span>
                    <span>RMSE: {trainingStatus.rmseDbz} dBZ</span>
                  </div>
                </div>
              )}

              <button
                onClick={handleStartTraining}
                disabled={isTraining}
                className="w-full py-2.5 rounded-lg text-xs font-mono font-semibold text-white bg-sky-600 hover:bg-sky-500 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {isTraining ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
                {isTraining ? 'Training Model on Tensors...' : 'Start AI Model Training'}
              </button>
            </div>

            {/* Card 2: Supabase Data Storage Sync */}
            <div className="p-5 rounded-xl border flex flex-col justify-between gap-4" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                    <Database size={15} />
                    Supabase Database Storage
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono">
                    PostGIS Enabled
                  </span>
                </div>
                <p className="text-xs text-muted font-mono">
                  Ingests and stores 1–3 km radar grid tensors, SCIT storm centroids, and sub-district hazard alerts into Supabase DB.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-black/40 border border-emerald-500/20 flex flex-col gap-1 font-mono text-[11px] text-muted">
                <div>Target Project: <span className="text-emerald-400">frtcdfzpnlgqixxdbash.supabase.co</span></div>
                <div>Tables: <span className="text-primary font-medium">monitoring_regions, radar_grid_data, storm_cells</span></div>
                <div>PostGIS SRID: <span className="text-amber-400">4326 (WGS 84)</span></div>
              </div>

              <button
                onClick={handleStartSync}
                disabled={isSyncing}
                className="w-full py-2.5 rounded-lg text-xs font-mono font-semibold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {isSyncing ? <RefreshCw size={14} className="animate-spin" /> : <Database size={14} />}
                {isSyncing ? 'Ingesting Data to Supabase...' : 'Store Data to Supabase DB'}
              </button>
            </div>
          </div>

          {/* Console Activity Log Terminal */}
          <div className="p-4 rounded-xl border flex flex-col gap-2 bg-black/60 font-mono text-xs" style={{ borderColor: 'var(--border-primary)' }}>
            <div className="flex items-center justify-between text-muted text-[11px] pb-2 border-b border-white/10">
              <span className="flex items-center gap-1.5 text-primary font-medium">
                <Activity size={13} className="text-emerald-400" />
                Live Terminal Activity Log
              </span>
              <span>Console Log Output</span>
            </div>

            <div className="h-40 overflow-y-auto flex flex-col gap-1 text-[11px]">
              {trainingLogs.concat(syncLogs).length === 0 ? (
                <span className="text-muted italic">No active logs. Click "Start AI Model Training" or "Store Data to Supabase DB" above.</span>
              ) : (
                trainingLogs.concat(syncLogs).map((line, i) => (
                  <div key={i} className="text-slate-300 font-mono">
                    {line}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t flex items-center justify-between text-xs font-mono" style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-card)' }}>
          <span className="text-muted">Status: System Operational</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md font-medium text-white bg-blue-600 hover:bg-blue-500 transition-colors"
          >
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
}
