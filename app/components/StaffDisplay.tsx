'use client';

import { useEffect, useRef } from 'react';
import { Factory, Stave, StaveNote, Voice, Formatter } from 'vexflow';
import { Note, ScaleMode, ScaleCategory, getScale, getVexFlowNote } from '../utils/music';

interface StaffDisplayProps {
  rootNote: Note;
  scaleMode: ScaleMode;
  scaleCategory: ScaleCategory;
}

export default function StaffDisplay({ rootNote, scaleMode, scaleCategory }: StaffDisplayProps) {
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
      const scaleNotes = getScale(rootNote, scaleMode, scaleCategory);
      
      // Calculate how many measures we need
      const measuresNeeded = Math.ceil(scaleNotes.length / 4);
      const totalWidth = Math.max(800, measuresNeeded * 200); // At least 800px, or 200px per measure

      // Initialize VexFlow with calculated width
      const vf = new Factory({
        renderer: { elementId: containerId, width: totalWidth, height: 200 }
      });

      const context = vf.getContext();

      // Create measures
      const measures = [];
      for (let i = 0; i < scaleNotes.length; i += 4) {
        const measureNotes = scaleNotes.slice(i, i + 4);
        // If this is the last measure and it's not full, repeat the last note
        while (measureNotes.length < 4) {
          measureNotes.push(measureNotes[measureNotes.length - 1] || scaleNotes[scaleNotes.length - 1]);
        }
        
        // Create StaveNotes for this measure
        const notes = measureNotes.map(note => {
          const vexNote = getVexFlowNote(note);
          return new StaveNote({ 
            keys: [`${vexNote}/4`], 
            duration: 'q' 
          });
        });
        
        measures.push(notes);
      }

      // Create and draw staves for each measure
      measures.forEach((measureNotes, i) => {
        const staveWidth = 190; // Width for each measure
        const staveX = 10 + i * staveWidth; // Position each measure horizontally
        
        // Create a stave for this measure
        const stave = new Stave(staveX, 40, staveWidth);
        
        // Only add clef and time signature to the first measure
        if (i === 0) {
          stave.addClef('treble').addTimeSignature('4/4');
        }
        
        // Set up the stave
        stave.setContext(context);
        stave.draw();

        // Create a voice for the measure
        const voice = new Voice({
          numBeats: 4,
          beatValue: 4,
        });
        voice.addTickables(measureNotes);

        // Format and justify the notes within the measure
        new Formatter()
          .joinVoices([voice])
          .format([voice], staveWidth - 50); // Leave some space for clef/time signature

        // Draw the notes
        voice.draw(context, stave);
      });

    } catch (error) {
      console.error('Error in StaffDisplay:', error);
    }
  }, [rootNote, scaleMode, scaleCategory]);

  return (
    <div 
      ref={containerRef} 
      className="w-full max-w-[1000px] mx-auto bg-white p-4 rounded-lg shadow-md overflow-x-auto"
    />
  );
} 