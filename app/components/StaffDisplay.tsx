'use client';

import { useEffect, useRef } from 'react';
import { Factory, Stave, StaveNote, Voice, Formatter, Accidental } from 'vexflow';
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
      const baseScaleNotes = getScale(rootNote, scaleMode, scaleCategory);
      
      // Create an array of notes that spans multiple octaves
      const scaleNotes = [];
      const totalNotesNeeded = 8; // We want to show 8 notes total
      let currentOctave = 4;
      
      for (let i = 0; i < totalNotesNeeded; i++) {
        const baseNote = baseScaleNotes[i % baseScaleNotes.length];
        // If we've gone through all notes in the scale, increment octave
        if (i > 0 && i % baseScaleNotes.length === 0) {
          currentOctave++;
        }
        scaleNotes.push({ note: baseNote, octave: currentOctave });
      }
      
      // Calculate how many measures we need
      const measuresNeeded = Math.ceil(scaleNotes.length / 4);
      const totalWidth = Math.max(800, measuresNeeded * 300); // 300px per measure

      // Initialize VexFlow with calculated width
      const vf = new Factory({
        renderer: { elementId: containerId, width: totalWidth, height: 200 }
      });

      const context = vf.getContext();

      // Create a single stave for all measures
      const stave = new Stave(10, 40, totalWidth - 20);
      stave.addClef('treble').addTimeSignature('4/4');
      stave.setContext(context).draw();

      // Create measures
      const measures = [];
      for (let i = 0; i < scaleNotes.length; i += 4) {
        const measureNotes = scaleNotes.slice(i, Math.min(i + 4, scaleNotes.length));
        // If this is the last measure and it's not full, repeat the last note
        while (measureNotes.length < 4) {
          measureNotes.push(measureNotes[measureNotes.length - 1] || scaleNotes[scaleNotes.length - 1]);
        }
        
        // Create StaveNotes for this measure
        const notes = measureNotes.map(({ note, octave }) => {
          const vexNote = getVexFlowNote(note);
          
          const staveNote = new StaveNote({ 
            keys: [`${vexNote}/${octave}`], 
            duration: 'q' 
          });

          // Add accidental if the note has one
          if (note.includes('#')) {
            staveNote.addModifier(new Accidental('#'));
          }

          return staveNote;
        });
        
        measures.push(notes);
      }

      // Create and draw voices for each measure
      measures.forEach((measureNotes, i) => {
        const voice = new Voice({
          numBeats: 4,
          beatValue: 4,
        });
        voice.addTickables(measureNotes);

        // Calculate the width for this measure
        const measureWidth = (totalWidth - 20) / measures.length;
        const formatWidth = i === 0 ? measureWidth - 120 : measureWidth - 60;

        // Position the notes within the measure
        new Formatter()
          .joinVoices([voice])
          .format([voice], formatWidth);

        // Adjust x position for each note
        const measureX = 10 + i * measureWidth;
        voice.getTickables().forEach((note) => {
          const noteX = note.getX();
          note.setStave(stave);
          note.setX(measureX + (i === 0 ? 100 : 50) + noteX);
        });

        // Draw the notes
        voice.draw(context, stave);

        // Draw bar line after each measure except the last one
        if (i < measures.length - 1) {
          const barX = measureX + measureWidth;
          const startY = stave.getYForLine(0);
          const endY = stave.getYForLine(4);
          
          context.save();
          context.setLineWidth(1);
          context.beginPath();
          context.moveTo(barX, startY);
          context.lineTo(barX, endY);
          context.strokeStyle = 'black';
          context.stroke();
          context.restore();
        }
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