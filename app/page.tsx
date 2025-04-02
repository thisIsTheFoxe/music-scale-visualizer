'use client';

import { useState } from 'react';
import { Note, ScaleMode, ScaleCategory, getScaleName, getScaleNoteCount } from './utils/music';
import ScaleSelector from './components/ScaleSelector';
import StaffDisplay from './components/StaffDisplay';
import Launchpad from './components/Launchpad';

export default function Home() {
  const [selectedNote, setSelectedNote] = useState<Note>('C');
  const [selectedMode, setSelectedMode] = useState<ScaleMode>('major');
  const [selectedCategory, setSelectedCategory] = useState<ScaleCategory>('diatonic');

  const scaleName = getScaleName(selectedNote, selectedMode, selectedCategory);
  const noteCount = getScaleNoteCount(selectedMode, selectedCategory);

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Music Scale Visualizer
        </h1>
        
        <ScaleSelector
          selectedNote={selectedNote}
          selectedMode={selectedMode}
          selectedCategory={selectedCategory}
          onNoteChange={setSelectedNote}
          onModeChange={setSelectedMode}
          onCategoryChange={setSelectedCategory}
        />

        <h2 className="text-2xl font-semibold text-center my-4 text-gray-700">
          {scaleName} ({noteCount} notes)
        </h2>

        <div className="my-8">
          <StaffDisplay
            rootNote={selectedNote}
            scaleMode={selectedMode}
            scaleCategory={selectedCategory}
          />
        </div>

        <Launchpad
          rootNote={selectedNote}
          scaleMode={selectedMode}
          scaleCategory={selectedCategory}
        />
      </div>
    </main>
  );
}
