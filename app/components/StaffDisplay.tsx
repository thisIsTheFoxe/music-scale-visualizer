'use client';

import { useEffect, useRef } from 'react';
import { Factory, Stave, StaveNote, Voice, Formatter, Accidental } from 'vexflow';
import { Note, ScaleMode, ScaleCategory, getScale, getVexFlowNote } from '../utils/music';

interface StaffDisplayProps {
  rootNote: Note;
  scaleMode: ScaleMode;
  scaleCategory: ScaleCategory;
  activeNote: { note: Note; octave: number } | null;
}

export default function StaffDisplay({ rootNote, scaleMode, scaleCategory, activeNote }: StaffDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);

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
      const totalNotesNeeded = 8; // We want to show 8 notes total
      let currentOctave = 4;
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

      // Initialize VexFlow
      const vf = new Factory({
        renderer: { elementId: containerId, width: 800, height: 150 }
      });

      const context = vf.getContext();
      
      // Create a single stave without time signature
      const stave = new Stave(10, 40, 780);
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
        .format([voice], 700); // Leave some space for clef

      // Draw the notes
      voice.draw(context, stave);

    } catch (error) {
      console.error('Error in StaffDisplay:', error);
    }
  }, [rootNote, scaleMode, scaleCategory, activeNote]);

  return (
    <div 
      ref={containerRef} 
      className="w-full max-w-[1000px] mx-auto bg-white p-4 rounded-lg shadow-md overflow-x-auto"
    />
  );
} 