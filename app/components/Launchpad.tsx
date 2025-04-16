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
  const [synthReady, setSynthReady] = useState(false);

  // Create synth only after Tone context is running
  const ensureSynth = useCallback(async () => {
    if (Tone.context.state !== 'running') {
      await Tone.start();
    }
    if (!synth) {
      const newSynth = new Tone.Synth().toDestination();
      setSynth(newSynth);
      setSynthReady(true);
      return newSynth;
    }
    setSynthReady(true);
    return synth;
  }, [synth]);

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

  const [pressedIndex, setPressedIndex] = useState<number | null>(null);
  const [heldNote, setHeldNote] = useState<ScaleNoteWithOctave | null>(null);

  const startNote = useCallback(async ({ note, octave }: ScaleNoteWithOctave, index: number) => {
    const s = await ensureSynth();
    if (!s) return;
    // Only start if not already held
    if (heldNote && heldNote.note === note && heldNote.octave === octave) return;
    setHeldNote({ note, octave });
    setPressedIndex(index);
    onNoteActivate({ note, octave });
    const freq = getNoteFrequency(note, octave);
    s.triggerAttack(freq);
  }, [ensureSynth, onNoteActivate, heldNote]);

  const stopNote = useCallback(() => {
    if (!synth) return;
    if (!heldNote) return;
    setHeldNote(null);
    setPressedIndex(null);
    onNoteActivate(null);
    synth.triggerRelease();
  }, [synth, onNoteActivate, heldNote]);

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      const index = keyMap[e.key];
      if (index !== undefined && index < scaleNotes.length && (!heldNote || pressedIndex !== index)) {
        await startNote(scaleNotes[index], index);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      const index = keyMap[e.key];
      if (index !== undefined && index < scaleNotes.length && heldNote) {
        stopNote();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [scaleNotes, startNote, stopNote, keyMap, heldNote, pressedIndex]);

  // Clean up synth on unmount
  useEffect(() => {
    return () => {
      if (synth) synth.dispose();
    };
  }, [synth]);

  return (
    <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 sm:gap-4 p-2 sm:p-4 max-w-3xl mx-auto w-full select-none">
      {scaleNotes.map(({ note, octave }, index) => (
        <button
          key={`${note}-${octave}-${index}`}
          onPointerDown={async e => { e.preventDefault(); await startNote({ note, octave }, index); }}
          onPointerUp={e => { e.preventDefault(); stopNote(); }}
          onPointerLeave={e => { e.preventDefault(); stopNote(); }}
          onPointerCancel={e => { e.preventDefault(); stopNote(); }}
          className={`
            h-16 sm:h-20 rounded-xl text-base sm:text-xl font-bold transition-all w-full min-w-0 break-words whitespace-normal select-none
            ${(activeNote?.note === note && activeNote?.octave === octave) || pressedIndex === index
              ? 'bg-blue-600 text-white scale-95 shadow-md'
              : 'bg-white text-blue-600 hover:bg-blue-50 shadow-lg'
            }
          `}
          style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
        >
          <span className="block leading-tight select-none">{note}</span>
          <span className="block text-xs sm:text-sm mt-1 opacity-60 truncate w-full select-none">
            Key: {getKeyLabel(index)}
          </span>
          <span className="block text-xs sm:text-sm opacity-60 truncate w-full select-none">
            Octave: {octave}
          </span>
        </button>
      ))}
    </div>
  );
} 