'use client';

import { useEffect, useRef, useState } from 'react';
import { Factory, Stave, StaveNote, Voice, Formatter, Accidental } from 'vexflow';
import { Note, ScaleMode, ScaleCategory, getScale, getVexFlowNote } from '../utils/music';

interface StaffDisplayProps {
  rootNote: Note;
  scaleMode: ScaleMode;
  scaleCategory: ScaleCategory;
  activeNote: { note: Note; octave: number } | null;
  totalNotesNeeded: number;
  startOctave: number;
}

export default function StaffDisplay({ 
  rootNote, 
  scaleMode, 
  scaleCategory, 
  activeNote,
  totalNotesNeeded,
  startOctave
}: StaffDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(320);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth || 320);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    try {
      if (!containerRef.current) return;

      // Clear previous content
      containerRef.current.innerHTML = '';

      // Create a unique ID for this instance
      const containerId = `staff-container-${Math.random().toString(36).substring(2, 9)}`;
      containerRef.current.id = containerId;

      // Get the scale notes
      const baseScaleNotes = getScale(rootNote, scaleMode, scaleCategory);
      
      // Create an array of notes that spans multiple octaves
      const scaleNotes = [];
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
        scaleNotes.push({ note, octave: currentOctave });
      }

      // Responsive width (min 320, max 1000)
      const width = Math.max(320, Math.min(containerWidth, 1000));
      
      // Initialize VexFlow
      const vf = new Factory({
        renderer: { elementId: containerId, width, height: 180 }
      });

      const context = vf.getContext();
      
      // Create a single stave without time signature
      const stave = new Stave(10, 60, width - 20);
      stave.addClef('treble');
      stave.setContext(context).draw();

      // Create notes
      const notes = scaleNotes.map(({ note, octave }) => {
        const vexNote = getVexFlowNote(note);
        const staveNote = new StaveNote({ 
          keys: [`${vexNote}/${octave}`], 
          duration: 'q' 
        });

        // Add accidental if the note has one
        if (note.includes('#')) {
          staveNote.addModifier(new Accidental('#'));
        }

        // Set note color if it's active
        if (activeNote && activeNote.note === note && activeNote.octave === octave) {
          staveNote.setStyle({ fillStyle: '#3b82f6', strokeStyle: '#3b82f6' });
        }

        return staveNote;
      });

      // Create a single voice with all notes
      const voice = new Voice({
        numBeats: notes.length,
        beatValue: 4,
      });
      voice.addTickables(notes);

      // Format and justify the notes
      new Formatter()
        .joinVoices([voice])
        .format([voice], width - 100); // Leave some space for clef

      // Draw the notes
      voice.draw(context, stave);

    } catch (error) {
      console.error('Error in StaffDisplay:', error);
    }
  }, [rootNote, scaleMode, scaleCategory, activeNote, totalNotesNeeded, startOctave, containerWidth]);

  return (
    <div 
      ref={containerRef} 
      className="w-full max-w-[1000px] mx-auto bg-white p-2 sm:p-4 rounded-lg shadow-md overflow-x-auto"
      style={{ minWidth: 0 }}
    />
  );
} 