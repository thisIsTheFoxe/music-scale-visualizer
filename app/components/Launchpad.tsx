'use client';

import { useEffect, useState, useCallback } from 'react';
import * as Tone from 'tone';
import { Note, ScaleMode, ScaleCategory, getScale, getNoteFrequency } from '../utils/music';

interface LaunchpadProps {
  rootNote: Note;
  scaleMode: ScaleMode;
  scaleCategory: ScaleCategory;
}

export default function Launchpad({ rootNote, scaleMode, scaleCategory }: LaunchpadProps) {
  const [synth, setSynth] = useState<Tone.Synth | null>(null);
  const [activeNote, setActiveNote] = useState<string | null>(null);

  useEffect(() => {
    // Initialize synth
    const newSynth = new Tone.Synth().toDestination();
    setSynth(newSynth);

    return () => {
      newSynth.dispose();
    };
  }, []);

  const scaleNotes = getScale(rootNote, scaleMode, scaleCategory);
  
  // Map keyboard keys to notes (1-8 keys)
  const keyMap: { [key: string]: number } = {
    '1': 0, '2': 1, '3': 2, '4': 3,
    '5': 4, '6': 5, '7': 6, '8': 7
  };

  const playNote = useCallback((note: Note) => {
    if (!synth) return;
    
    setActiveNote(note);
    const freq = getNoteFrequency(note, 4);
    synth.triggerAttackRelease(freq, '8n');
  }, [synth]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const index = keyMap[e.key];
      if (index !== undefined && index < scaleNotes.length) {
        playNote(scaleNotes[index]);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const index = keyMap[e.key];
      if (index !== undefined && index < scaleNotes.length) {
        setActiveNote(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [scaleNotes, playNote]);

  // For scales with fewer notes, we'll show all notes in the scale
  return (
    <div className="grid grid-cols-4 gap-4 p-4 max-w-2xl mx-auto">
      {scaleNotes.map((note, index) => (
        <button
          key={note}
          onClick={() => playNote(note)}
          className={`
            h-24 rounded-xl text-xl font-bold transition-all
            ${activeNote === note
              ? 'bg-blue-500 text-white transform scale-95'
              : 'bg-white text-blue-500 hover:bg-blue-50 shadow-lg'
            }
          `}
        >
          {note}
          <span className="block text-sm mt-2 opacity-50">
            Key: {Object.keys(keyMap).find(key => keyMap[key] === index) || (index + 1)}
          </span>
        </button>
      ))}
    </div>
  );
} 