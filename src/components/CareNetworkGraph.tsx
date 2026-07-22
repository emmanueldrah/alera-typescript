import React from 'react';

export default function CareNetworkGraph({ className = '' }: { className?: string }) {
  // Let's create an elegant, structured, architectural system diagram showing connected care nodes
  // cleanly aligned inside a schematic card container. This represents professional healthcare
  // infrastructure with zero neon gradients, glassmorphism, or floating animations.
  return (
    <div className={`rounded-lg border border-slate-200 bg-white p-6 shadow-sm text-slate-900 ${className}`}>
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-sky-600 animate-pulse" />
          <span className="text-xs font-mono font-bold tracking-wider text-slate-500 uppercase">System Topology</span>
        </div>
        <span className="text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">Active Link Map</span>
      </div>

      <div className="space-y-4">
        {/* Central Infrastructure Core */}
        <div className="rounded border border-slate-300 bg-slate-50 p-4 text-center">
          <p className="text-xs font-mono font-bold text-slate-700">ALERA CORE SECURE GATEWAY</p>
          <p className="text-[10px] text-slate-500 mt-1">Multi-Node Authentication & Encryption Layer</p>
        </div>

        {/* Dynamic Topology Connections */}
        <div className="grid grid-cols-2 gap-3 text-left">
          {[
            { role: 'Clinicians', label: 'Doctor Node', active: 'Secure link established', status: 'Ready' },
            { role: 'Labs', label: 'Helix Analytics', active: 'Results channel mapped', status: 'Ready' },
            { role: 'Pharmacies', label: 'Apex Dispensary', active: 'e-Prescription pipeline active', status: 'Ready' },
            { role: 'Emergency', label: 'Ambulance Dispatch', active: 'GPS tracking sync OK', status: 'Ready' },
          ].map((node) => (
            <div key={node.role} className="rounded border border-slate-100 bg-slate-50/50 p-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-800">{node.role}</span>
                <span className="text-[9px] font-mono text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded font-semibold">{node.status}</span>
              </div>
              <p className="text-[10px] text-slate-600 mt-1">{node.label}</p>
              <p className="text-[9px] text-slate-400 font-mono mt-0.5">{node.active}</p>
            </div>
          ))}
        </div>

        {/* Technical Specification Signpost */}
        <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-[10px] font-mono text-slate-400">
          <span>ALERA-NET-v2.6</span>
          <span>PROTOCOL: AES-GCM-256</span>
        </div>
      </div>
    </div>
  );
}
