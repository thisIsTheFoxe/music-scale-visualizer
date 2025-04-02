'use client';

import { useEffect, useState, useCallback } from 'react';
import * as Tone from 'tone';
import { Note, ScaleMode, ScaleCategory, getScale, getNoteFrequency } from '../utils/music';

interface LaunchpadProps {
  rootNote: Note;
  scaleMode: ScaleMode;
  scaleCategory: ScaleCategory;
}

interface ScaleNoteWithOctave {
  note: Note;
  octave: number;
}

interface ActiveNote {
  note: Note;
  octave: number;
}

export default function Launchpad({ rootNote, scaleMode, scaleCategory }: LaunchpadProps) {
  const [synth, setSynth] = useState<Tone.Synth | null>(null);
  const [activeNote, setActiveNote] = useState<ActiveNote | null>(null);

  useEffect(() => {
    // Initialize synth
    const newSynth = new Tone.Synth().toDestination();
    setSynth(newSynth);

    return () => {
      newSynth.dispose();
    };
  }, []);

  const baseScaleNotes = getScale(rootNote, scaleMode, scaleCategory);
  
  // Create an array of notes that spans multiple octaves
  const scaleNotes: ScaleNoteWithOctave[] = [];
  const totalNotesNeeded = 8; // Match the staff display
  let currentOctave = 4;
  
  for (let i = 0; i < totalNotesNeeded; i++) {
    const baseNote = baseScaleNotes[i % baseScaleNotes.length];
    // If we've gone through all notes in the scale, increment octave
    if (i > 0 && i % baseScaleNotes.length === 0) {
      currentOctave++;
    }
    scaleNotes.push({ note: baseNote, octave: currentOctave });
  }
  
  // Map keyboard keys to notes (1-8 keys)
  const keyMap: { [key: string]: number } = {
    '1': 0, '2': 1, '3': 2, '4': 3,
    '5': 4, '6': 5, '7': 6, '8': 7
  };

  const playNote = useCallback(({ note, octave }: ScaleNoteWithOctave) => {
    if (!synth) return;
    
    setActiveNote({ note, octave });
    const freq = getNoteFrequency(note, octave);
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

  return (
    <div className="grid grid-cols-4 gap-4 p-4 max-w-2xl mx-auto">
      {scaleNotes.map(({ note, octave }, index) => (
        <button
          key={`${note}-${octave}-${index}`}
          onMouseDown={() => playNote({ note, octave })}
          onMouseUp={() => setActiveNote(null)}
          onMouseLeave={() => setActiveNote(null)}
          className={`
            h-24 rounded-xl text-xl font-bold transition-all
            ${activeNote?.note === note && activeNote?.octave === octave
              ? 'bg-blue-500 text-white transform scale-95'
              : 'bg-white text-blue-500 hover:bg-blue-50 shadow-lg'
            }
          `}
        >
          {note}
          <span className="block text-sm mt-2 opacity-50">
            Key: {Object.keys(keyMap).find(key => keyMap[key] === index) || (index + 1)}
          </span>
          <span className="block text-sm opacity-50">
            Octave: {octave}
          </span>
        </button>
      ))}
    </div>
  );
} 