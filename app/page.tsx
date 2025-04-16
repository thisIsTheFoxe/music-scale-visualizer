'use client';

import { useState } from 'react';
import { Note, ScaleMode, ScaleCategory, getScaleName, getScaleNoteCount } from './utils/music';
import ScaleSelector from './components/ScaleSelector';
import StaffDisplay from './components/StaffDisplay';
import Launchpad from './components/Launchpad';
import NoteCountControl from './components/NoteCountControl';
import OctaveControl from './components/OctaveControl';
import TempoControl from './components/TempoControl';
import AutoPlay from './components/AutoPlay';
import Metronome from './components/Metronome';

interface ScaleNoteWithOctave {
  note: Note;
  octave: number;
}

export default function Home() {
  const [selectedNote, setSelectedNote] = useState<Note>('C');
  const [selectedMode, setSelectedMode] = useState<ScaleMode>('major');
  const [selectedCategory, setSelectedCategory] = useState<ScaleCategory>('diatonic');
  const [activeNote, setActiveNote] = useState<ScaleNoteWithOctave | null>(null);
  const [noteCount, setNoteCount] = useState(8);
  const [startOctave, setStartOctave] = useState(4);
  const [tempo, setTempo] = useState(120);

  const scaleName = getScaleName(selectedNote, selectedMode, selectedCategory);
  const noteCountText = getScaleNoteCount(selectedMode, selectedCategory);

  return (
    <main className="min-h-screen bg-white flex flex-col items-center py-4 sm:py-8 px-2 sm:px-4">
      <div className="w-full max-w-4xl mx-auto">
        <h1 className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-8">
          Music Scale Visualizer
        </h1>

        <div className="flex flex-col items-center gap-4 sm:gap-8">
          <div className="flex flex-col items-center gap-3 sm:gap-4 bg-white p-4 sm:p-6 rounded-lg shadow-sm w-full">
            <ScaleSelector
              selectedNote={selectedNote}
              selectedMode={selectedMode}
              selectedCategory={selectedCategory}
              onNoteChange={setSelectedNote}
              onModeChange={setSelectedMode}
              onCategoryChange={setSelectedCategory}
            />
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
              <TempoControl
                initialTempo={tempo}
                onTempoChange={setTempo}
              />
              <Metronome
                tempo={tempo}
                isEnabled={true}
              />
            </div>
          </div>

          <div className="flex flex-col items-center gap-4 sm:gap-6 w-full">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 w-full mb-2">
              <NoteCountControl
                noteCount={noteCount}
                onNoteCountChange={setNoteCount}
              />
              <OctaveControl
                startOctave={startOctave}
                onOctaveChange={setStartOctave}
              />
            </div>
            <Launchpad
              rootNote={selectedNote}
              scaleMode={selectedMode}
              scaleCategory={selectedCategory}
              startOctave={startOctave}
              totalNotesNeeded={noteCount}
              onNoteActivate={setActiveNote}
              activeNote={activeNote}
              tempo={tempo}
            />
            <StaffDisplay
              rootNote={selectedNote}
              scaleMode={selectedMode}
              scaleCategory={selectedCategory}
              activeNote={activeNote}
              totalNotesNeeded={noteCount}
              startOctave={startOctave}
            />
            <AutoPlay
              rootNote={selectedNote}
              scaleMode={selectedMode}
              scaleCategory={selectedCategory}
              startOctave={startOctave}
              tempo={tempo}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
