'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import * as Tone from 'tone';
import { Note, ScaleMode, ScaleCategory, getScale, getNoteFrequency } from '../utils/music';

interface LaunchpadProps {
  rootNote: Note;
  scaleMode: ScaleMode;
  scaleCategory: ScaleCategory;
  activeNote: { note: Note; octave: number } | null;
  onNoteActivate: (note: { note: Note; octave: number } | null) => void;
  totalNotesNeeded: number;
  startOctave: number;
  tempo: number;
}

interface ScaleNoteWithOctave {
  note: Note;
  octave: number;
}

type KeyMap = { [key: string]: number };

export default function Launchpad({ 
  rootNote, 
  scaleMode, 
  scaleCategory,
  activeNote,
  onNoteActivate,
  totalNotesNeeded,
  startOctave,
  tempo = 120
}: LaunchpadProps) {
  const [synth, setSynth] = useState<Tone.Synth | null>(null);

  useEffect(() => {
    // Initialize synth
    const newSynth = new Tone.Synth().toDestination();
    setSynth(newSynth);

    return () => {
      newSynth.dispose();
    };
  }, []);

  const baseScaleNotes = useMemo(() => getScale(rootNote, scaleMode, scaleCategory), [rootNote, scaleMode, scaleCategory]);
  
  // Create an array of notes that spans multiple octaves
  const scaleNotes = useMemo(() => {
    const notes: ScaleNoteWithOctave[] = [];
    let currentOctave = startOctave;
    let lastNoteIndex = -1; // Track the last note's position in chromatic scale
    
    const chromaticScale = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    
    for (let i = 0; i < totalNotesNeeded; i++) {
      const note = baseScaleNotes[i % baseScaleNotes.length];
      const noteIndex = chromaticScale.indexOf(note);
      
      // If this note comes earlier in the chromatic scale than the last note,
      // it means we've wrapped around to the next octave
      if (noteIndex <= lastNoteIndex && i > 0) {
        currentOctave++;
      }
      
      lastNoteIndex = noteIndex;
      notes.push({ note, octave: currentOctave });
    }
    return notes;
  }, [baseScaleNotes, startOctave, totalNotesNeeded]);
  
  // Map keyboard keys to notes using left side of QWERTY keyboard (5x4 grid)
  const keyMap: KeyMap = useMemo(() => ({
    // Top row
    '1': 0,  '2': 1,  '3': 2,  '4': 3,  '5': 4,
    // Second row
    'q': 5,  'w': 6,  'e': 7,  'r': 8,  't': 9,
    // Third row
    'a': 10, 's': 11, 'd': 12, 'f': 13, 'g': 14,
    // Bottom row
    'z': 15, 'x': 16, 'c': 17, 'v': 18, 'b': 19
  }), []);

  const getKeyLabel = (index: number): string => {
    const key = Object.entries(keyMap).find(entry => entry[1] === index)?.[0];
    if (!key) return '';
    return key.toUpperCase();
  };

  const playNote = useCallback(({ note, octave }: ScaleNoteWithOctave) => {
    if (!synth) return;
    
    onNoteActivate({ note, octave });
    const freq = getNoteFrequency(note, octave);
    // Convert tempo to note duration (in seconds)
    // For a quarter note: duration = 60 / tempo
    // For an eighth note: duration = 30 / tempo
    const duration = 30 / tempo;
    synth.triggerAttackRelease(freq, duration);
  }, [synth, onNoteActivate, tempo]);

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
        onNoteActivate(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [scaleNotes, playNote, onNoteActivate, keyMap]);

  return (
    <div className="grid grid-cols-5 gap-4 p-4 max-w-3xl mx-auto">
      {scaleNotes.map(({ note, octave }, index) => (
        <button
          key={`${note}-${octave}-${index}`}
          onMouseDown={() => playNote({ note, octave })}
          onMouseUp={() => onNoteActivate(null)}
          onMouseLeave={() => onNoteActivate(null)}
          className={`
            h-20 rounded-xl text-xl font-bold transition-all
            ${activeNote?.note === note && activeNote?.octave === octave
              ? 'bg-blue-500 text-white transform scale-95'
              : 'bg-white text-blue-500 hover:bg-blue-50 shadow-lg'
            }
          `}
        >
          {note}
          <span className="block text-sm mt-2 opacity-50">
            Key: {getKeyLabel(index)}
          </span>
          <span className="block text-sm opacity-50">
            Octave: {octave}
          </span>
        </button>
      ))}
    </div>
  );
} 