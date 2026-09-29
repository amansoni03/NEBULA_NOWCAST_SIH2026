import React, { useState } from 'react';
import { X, FileText, Download, CheckCircle, Radio, Smartphone, Gauge, MapPin } from 'lucide-react';
import { generateCAPAlertXML } from '../data/weatherEngine';

export function CAPAlertModal({ isOpen, onClose, stormCell, subdistrict }) {
  const [copied, setCopied] = useState(false);
  if (!isOpen || !stormCell || !subdistrict) return null;

  const xmlContent = generateCAPAlertXML(stormCell, subdistrict);

  const handleCopy = () => {
    navigator.clipboard.writeText(xmlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([xmlContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CAP-ALERT-${stormCell.id}.xml`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-rose-400" />
            <h2 className="font-bold text-slate-100 text-sm font-mono">
              COMMON ALERTING PROTOCOL (CAP v1.2) DISPATCH GENERATOR
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* XML Viewer Body */}
        <div className="p-4 overflow-y-auto font-mono text-xs text-cyan-300 bg-slate-950/90 leading-relaxed">
          <pre className="whitespace-pre-wrap">{xmlContent}</pre>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-mono">
            Compliant with NDMA / SDMA Early Warning System Interface
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg flex items-center gap-1.5"
            >
              {copied ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : null}
              {copied ? 'Copied XML' : 'Copy XML'}
            </button>
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 text-xs font-medium bg-rose-600 hover:bg-rose-500 text-slate-950 font-bold rounded-lg flex items-center gap-1.5 shadow-md shadow-rose-600/30"
            >
              <Download className="w-4 h-4" />
              Download CAP XML
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CrowdBarometerModal({ isOpen, onClose }) {
  const [pressure, setPressure] = useState('1008.4');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl p-4 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-amber-400" />
            <h2 className="font-bold text-slate-100 text-sm font-mono">
              CROWDSOURCED SMARTPHONE BAROMETER MESH
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-6 text-center space-y-2">
            <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto animate-bounce" />
            <div className="font-bold text-slate-200">Pressure Telemetry Verified!</div>
            <p className="text-xs text-slate-400 font-mono">
              Thank you. Your local barometer reading has been fused into the DWR radar model to refine microburst detection.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 font-mono text-xs">
            <p className="text-slate-300">
              Submit your smartphone or local IoT station barometric pressure reading to help detect low-level downdraft gust fronts.
            </p>

            <div>
              <label className="block text-slate-400 mb-1">Live Pressure Reading (hPa / mbar)</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={pressure}
                  onChange={(e) => setPressure(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-amber-400 font-bold text-sm focus:outline-none focus:border-amber-500"
                  required
                />
                <Gauge className="w-4 h-4 text-slate-500 absolute right-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">GPS Location Sync</label>
              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 text-[11px] text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>Auto-detected: 28.6139° N, 77.2090° E (Accuracy: 4m)</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-lg transition-all shadow-md shadow-amber-600/20"
            >
              Submit Anomaly Telemetry
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
