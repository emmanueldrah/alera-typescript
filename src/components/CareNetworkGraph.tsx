import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Stethoscope, FlaskConical, Pill, Ambulance, ShieldAlert, Radio,
  Activity, HeartPulse, Sparkles
} from 'lucide-react';

interface Node {
  id: string;
  label: string;
  role: 'doctor' | 'patient' | 'lab' | 'pharmacy' | 'ambulance' | 'core';
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  pulse?: boolean;
}

interface Edge {
  source: string;
  target: string;
  active: boolean;
  pulseProgress: number;
}

export default function CareNetworkGraph({ className = '' }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  // Initial mock nodes
  const [nodes, setNodes] = useState<Node[]>([
    { id: 'core', label: 'ALERA Care OS', role: 'core', x: 250, y: 200, vx: 0, vy: 0, size: 28 },
    { id: 'p1', label: 'Emma Watson (Patient)', role: 'patient', x: 100, y: 100, vx: 0.2, vy: -0.15, size: 14, pulse: true },
    { id: 'p2', label: 'Marcus Vance (Patient)', role: 'patient', x: 80, y: 280, vx: -0.1, vy: 0.2, size: 14 },
    { id: 'd1', label: 'Dr. Sarah Chen', role: 'doctor', x: 400, y: 110, vx: -0.15, vy: 0.1, size: 16, pulse: true },
    { id: 'd2', label: 'Dr. Aaron Patel', role: 'doctor', x: 280, y: 70, vx: 0.1, vy: 0.2, size: 16 },
    { id: 'l1', label: 'Helix Labs Corp', role: 'lab', x: 420, y: 280, vx: 0.15, vy: -0.1, size: 15 },
    { id: 'ph1', label: 'Apex Pharmacy', role: 'pharmacy', x: 220, y: 320, vx: -0.2, vy: -0.1, size: 15, pulse: true },
    { id: 'amb1', label: 'Unit 4 (Ambulance)', role: 'ambulance', x: 120, y: 210, vx: 0.2, vy: 0.15, size: 15 },
  ]);

  const [edges, setEdges] = useState<Edge[]>([
    { source: 'core', target: 'p1', active: true, pulseProgress: 0 },
    { source: 'core', target: 'p2', active: true, pulseProgress: 0.3 },
    { source: 'core', target: 'd1', active: true, pulseProgress: 0.6 },
    { source: 'core', target: 'd2', active: true, pulseProgress: 0.15 },
    { source: 'core', target: 'l1', active: true, pulseProgress: 0.8 },
    { source: 'core', target: 'ph1', active: true, pulseProgress: 0.45 },
    { source: 'core', target: 'amb1', active: true, pulseProgress: 0.5 },
    { source: 'p1', target: 'd1', active: true, pulseProgress: 0.2 },
    { source: 'd1', target: 'l1', active: true, pulseProgress: 0.7 },
    { source: 'd2', target: 'ph1', active: true, pulseProgress: 0.9 },
    { source: 'amb1', target: 'core', active: true, pulseProgress: 0.1 },
  ]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = canvas.width = containerRef.current?.clientWidth ?? 500;
    let height = canvas.height = containerRef.current?.clientHeight ?? 400;

    const handleResize = () => {
      if (!canvas || !containerRef.current) return;
      width = canvas.width = containerRef.current.clientWidth;
      height = canvas.height = containerRef.current.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Physics/Movement within boundary
      setNodes((prevNodes) =>
        prevNodes.map((node) => {
          if (node.id === 'core') {
            // Keep core near center
            const dx = width / 2 - node.x;
            const dy = height / 2 - node.y;
            return {
              ...node,
              x: node.x + dx * 0.05,
              y: node.y + dy * 0.05,
            };
          }

          let nx = node.x + node.vx;
          let ny = node.y + node.vy;

          // Bounce off walls with margin
          const margin = 30;
          let nvx = node.vx;
          let nvy = node.vy;

          if (nx < margin || nx > width - margin) nvx = -nvx;
          if (ny < margin || ny > height - margin) nvy = -nvy;

          nx = Math.max(margin, Math.min(width - margin, nx));
          ny = Math.max(margin, Math.min(height - margin, ny));

          return { ...node, x: nx, y: ny, vx: nvx, vy: nvy };
        })
      );

      // Draw active connections
      edges.forEach((edge) => {
        const sourceNode = nodes.find((n) => n.id === edge.source);
        const targetNode = nodes.find((n) => n.id === edge.target);

        if (sourceNode && targetNode) {
          const isSelected = selectedRole === null ||
            sourceNode.role === selectedRole ||
            targetNode.role === selectedRole;

          // Connection line
          ctx.beginPath();
          ctx.moveTo(sourceNode.x, sourceNode.y);
          ctx.lineTo(targetNode.x, targetNode.y);

          if (isSelected) {
            ctx.strokeStyle = 'rgba(20, 184, 166, 0.25)'; // glowing cyan edge
            ctx.lineWidth = 1.5;
          } else {
            ctx.strokeStyle = 'rgba(20, 184, 166, 0.05)';
            ctx.lineWidth = 0.5;
          }
          ctx.stroke();

          // Draw floating pulse along edges
          edge.pulseProgress += 0.006;
          if (edge.pulseProgress > 1) edge.pulseProgress = 0;

          const px = sourceNode.x + (targetNode.x - sourceNode.x) * edge.pulseProgress;
          const py = sourceNode.y + (targetNode.y - sourceNode.y) * edge.pulseProgress;

          ctx.beginPath();
          ctx.arc(px, py, 3, 0, Math.PI * 2);
          ctx.fillStyle = isSelected ? '#14b8a6' : 'rgba(20, 184, 166, 0.2)';
          ctx.shadowBlur = isSelected ? 8 : 0;
          ctx.shadowColor = '#14b8a6';
          ctx.fill();
          ctx.shadowBlur = 0; // reset
        }
      });

      // Draw glowing background glow underneath selected role
      nodes.forEach((node) => {
        const isSelected = selectedRole === null || node.role === selectedRole;
        if (selectedRole && isSelected) {
          const grad = ctx.createRadialGradient(node.x, node.y, 2, node.x, node.y, node.size * 2.5);
          grad.addColorStop(0, 'rgba(20, 184, 166, 0.15)');
          grad.addColorStop(1, 'rgba(20, 184, 166, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.size * 2.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Pulse rings
        if (node.pulse || node.id === 'core') {
          const pulseScale = (Date.now() % 2000) / 2000;
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.size + pulseScale * 15, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(20, 184, 166, ${0.4 * (1 - pulseScale)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Draw node circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);

        let color = 'rgba(15, 23, 42, 0.8)';
        let strokeColor = 'rgba(20, 184, 166, 0.5)';
        if (node.id === 'core') {
          color = '#14b8a6';
          strokeColor = '#06b6d4';
        } else if (node.role === 'patient') {
          color = 'rgba(6, 182, 212, 0.2)';
          strokeColor = '#06b6d4';
        } else if (node.role === 'doctor') {
          color = 'rgba(139, 92, 246, 0.2)';
          strokeColor = '#8b5cf6';
        } else if (node.role === 'lab') {
          color = 'rgba(236, 72, 153, 0.2)';
          strokeColor = '#ec4899';
        } else if (node.role === 'pharmacy') {
          color = 'rgba(16, 185, 129, 0.2)';
          strokeColor = '#10b981';
        } else if (node.role === 'ambulance') {
          color = 'rgba(239, 68, 68, 0.2)';
          strokeColor = '#ef4444';
        }

        ctx.fillStyle = color;
        ctx.strokeStyle = isSelected ? strokeColor : 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = isSelected ? 2 : 1;
        ctx.fill();
        ctx.stroke();

        // Node icons/symbols representation (subtle dot inside)
        ctx.beginPath();
        ctx.arc(node.x, node.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = isSelected ? strokeColor : 'rgba(255,255,255,0.1)';
        ctx.fill();

        // Draw small label
        ctx.font = '10px "Inter", sans-serif';
        ctx.fillStyle = isSelected ? 'rgba(241, 245, 249, 0.9)' : 'rgba(241, 245, 249, 0.3)';
        ctx.textAlign = 'center';
        ctx.fillText(node.id === 'core' ? 'ALERA CORE' : node.label.split(' ')[0], node.x, node.y + node.size + 14);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [nodes, edges, selectedRole]);

  // Click handler to select roles
  const selectRole = (role: string | null) => {
    setSelectedRole(role === selectedRole ? null : role);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'patient': return <Users className="h-4 w-4" />;
      case 'doctor': return <Stethoscope className="h-4 w-4" />;
      case 'lab': return <FlaskConical className="h-4 w-4" />;
      case 'pharmacy': return <Pill className="h-4 w-4" />;
      case 'ambulance': return <Ambulance className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative rounded-3xl border border-teal-500/10 bg-slate-950/40 p-4 backdrop-blur-md overflow-hidden ${className}`}
      style={{ minHeight: '380px' }}
    >
      <div className="absolute top-4 left-4 z-10">
        <div className="flex items-center gap-2 rounded-full border border-teal-500/20 bg-slate-900/80 px-3 py-1 text-xs text-teal-400 font-medium">
          <HeartPulse className="h-3 w-3 animate-pulse" />
          <span>Active Care Network Node (Live)</span>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full cursor-pointer"
        onClick={() => selectRole(null)}
      />

      <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-wrap gap-2 justify-center bg-slate-900/60 p-2 rounded-2xl border border-white/5 backdrop-blur">
        {[
          { id: 'patient', label: 'Patients', color: 'border-cyan-500/30 text-cyan-400' },
          { id: 'doctor', label: 'Clinicians', color: 'border-violet-500/30 text-violet-400' },
          { id: 'lab', label: 'Labs', color: 'border-pink-500/30 text-pink-400' },
          { id: 'pharmacy', label: 'Pharmacies', color: 'border-emerald-500/30 text-emerald-400' },
          { id: 'ambulance', label: 'Emergency', color: 'border-red-500/30 text-red-400' },
        ].map((role) => (
          <button
            key={role.id}
            onClick={() => selectRole(role.id)}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs transition-all ${
              selectedRole === role.id
                ? 'bg-teal-500/20 border-teal-500 text-white font-semibold'
                : `${role.color} hover:bg-white/5`
            }`}
          >
            {getRoleIcon(role.id)}
            <span>{role.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
