'use client';

import { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';

interface MetronomeProps {
  tempo: number;
  isEnabled?: boolean;
}

export default function Metronome({ tempo, isEnabled = true }: MetronomeProps) {
  const [isActive, setIsActive] = useState(false);
  const metronomeRef = useRef<Tone.Synth | null>(null);
  const loopRef = useRef<Tone.Loop | null>(null);

  // Initialize metronome synth
  useEffect(() => {
    const newMetronome = new Tone.Synth({
      oscillator: {
        type: 'sine'
      },
      envelope: {
        attack: 0.001,
        decay: 0.1,
        sustain: 0,
        release: 0.1
      },
      volume: -10 // Quieter than the main synth
    }).toDestination();
    
    metronomeRef.current = newMetronome;
    
    return () => {
      newMetronome.dispose();
    };
  }, []);

  // Update tempo
  useEffect(() => {
    if (loopRef.current) {
      loopRef.current.interval = Tone.Time('4n').toSeconds() * (60 / tempo);
    }
  }, [tempo]);

  // Handle play/stop
  const toggleMetronome = async () => {
    if (!isEnabled) return;
    
    if (!isActive) {
      await Tone.start();
      
      // Create a loop that plays on each beat
      const newLoop = new Tone.Loop((time) => {
        if (metronomeRef.current) {
          // Play a click on each beat
          metronomeRef.current.triggerAttackRelease('C5', '32n', time);
        }
      }, '4n').start(0);
      
      loopRef.current = newLoop;
      setIsActive(true);
    } else {
      if (loopRef.current) {
        loopRef.current.stop();
        loopRef.current.dispose();
        loopRef.current = null;
      }
      setIsActive(false);
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (loopRef.current) {
        loopRef.current.dispose();
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={toggleMetronome}
        disabled={!isEnabled}
        className={`
          px-4 py-2 rounded-lg text-sm font-medium transition-colors
          ${isEnabled
            ? isActive
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-green-500 hover:bg-green-600 text-white'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }
        `}
      >
        {isActive ? 'Stop Metronome' : 'Start Metronome'}
      </button>
    </div>
  );
} 