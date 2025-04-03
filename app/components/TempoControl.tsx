'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface TempoControlProps {
  initialTempo?: number;
  onTempoChange: (tempo: number) => void;
}

export default function TempoControl({ initialTempo = 120, onTempoChange }: TempoControlProps) {
  const [tempo, setTempo] = useState(initialTempo);
  const [taps, setTaps] = useState<number[]>([]);
  const tapTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const handleTempoChange = (newTempo: number) => {
    // Clamp tempo between 40 and 240 BPM
    const clampedTempo = Math.min(Math.max(40, newTempo), 240);
    setTempo(clampedTempo);
    onTempoChange(clampedTempo);
  };

  const adjustTempo = (amount: number) => {
    handleTempoChange(tempo + amount);
  };

  const handleTap = useCallback(() => {
    const now = Date.now();
    setTaps(prevTaps => [...prevTaps, now].slice(-4));

    // Reset taps after 2 seconds of inactivity
    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current);
    }
    tapTimeoutRef.current = setTimeout(() => {
      setTaps([]);
    }, 2000);
  }, []);

  // Calculate tempo when taps change
  useEffect(() => {
    if (taps.length >= 2) {
      const intervals = [];
      for (let i = 1; i < taps.length; i++) {
        intervals.push(taps[i] - taps[i - 1]);
      }
      const averageInterval = intervals.reduce((a, b) => a + b) / intervals.length;
      const newTempo = Math.round(60000 / averageInterval); // Convert ms to BPM
      handleTempoChange(newTempo);
    }
  }, [taps, handleTempoChange]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        handleTap();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
      }
    };
  }, [handleTap]);

  useEffect(() => {
    // Update tempo if initialTempo prop changes
    setTempo(initialTempo);
  }, [initialTempo]);

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="flex items-center gap-2">
        <label htmlFor="tempo" className="text-lg font-medium text-gray-900">Tempo:</label>
        <button
          onClick={() => adjustTempo(-5)}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          -
        </button>
        <input
          id="tempo"
          type="number"
          value={tempo}
          onChange={(e) => handleTempoChange(parseInt(e.target.value) || initialTempo)}
          min="40"
          max="240"
          className="w-20 px-2 py-1 text-center border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
        />
        <button
          onClick={() => adjustTempo(5)}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          +
        </button>
        <span className="text-gray-900">BPM</span>
      </div>
      
      <div className="flex flex-col items-center gap-2">
        <button
          onClick={handleTap}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-lg font-medium"
        >
          Tap Tempo
        </button>
        <p className="text-sm text-gray-700">or press spacebar</p>
      </div>
    </div>
  );
} 