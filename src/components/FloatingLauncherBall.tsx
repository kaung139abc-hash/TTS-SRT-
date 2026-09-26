import React, { useState, useRef } from 'react';
import { X, Layers } from 'lucide-react';
import { APP_DEFINITIONS } from '../constants/apps';
import { AppIcon } from './AppIcon';

interface FloatingLauncherBallProps {
  onOpenApp: (appId: string) => void;
}

export const FloatingLauncherBall: React.FC<FloatingLauncherBallProps> = ({ onOpenApp }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [pos, setPos] = useState({ x: window.innerWidth - 70, y: window.innerHeight / 2 - 30 });
  const isDragging = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    isDragging.current = false;
    startPos.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (e.buttons !== 1) return;
    isDragging.current = true;
    const newX = Math.max(10, Math.min(window.innerWidth - 60, e.clientX - startPos.current.x));
    const newY = Math.max(10, Math.min(window.innerHeight - 60, e.clientY - startPos.current.y));
    setPos({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    try { (e.target as HTMLElement).releasePointerCapture(e.pointerId); } catch (_) {}
    if (!isDragging.current) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div
      style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
      className="fixed z-[10001] touch-none select-none"
    >
      {/* Floating Assistive Ball */}
      <button
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className={`w-12 h-12 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white flex items-center justify-center shadow-2xl ring-4 ring-indigo-500/30 transition-transform active:scale-95 ${
          isOpen ? 'rotate-45' : 'hover:scale-110 animate-pulse'
        }`}
        title="Floating Assistive Ball"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Layers className="w-6 h-6" />}
      </button>

      {/* Floating Radial Quick App Drawer Menu */}
      {isOpen && (
        <div className="absolute bottom-14 right-0 bg-slate-900/95 border border-slate-700/80 rounded-2xl p-3 shadow-2xl w-56 space-y-2 backdrop-blur-2xl">
          <div className="text-[10px] font-extrabold uppercase text-slate-400 border-b border-slate-800 pb-1 flex items-center justify-between">
            <span>Quick Floating Apps</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5 max-h-64 overflow-y-auto pr-1">
            {APP_DEFINITIONS.slice(0, 10).map((app) => (
              <button
                key={app.id}
                onClick={() => {
                  onOpenApp(app.id);
                  setIsOpen(false);
                }}
                className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-left transition-colors"
              >
                <AppIcon name={app.icon} className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="text-[11px] font-semibold text-slate-200 truncate">
                  {app.name.mm.split(' ')[0]}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
