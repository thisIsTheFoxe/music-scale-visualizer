'use client';

import { Note, ScaleMode, ScaleCategory } from '../utils/music';

interface ScaleSelectorProps {
  selectedNote: Note;
  selectedMode: ScaleMode;
  selectedCategory: ScaleCategory;
  onNoteChange: (note: Note) => void;
  onModeChange: (mode: ScaleMode) => void;
  onCategoryChange: (category: ScaleCategory) => void;
}

export default function ScaleSelector({
  selectedNote,
  selectedMode,
  selectedCategory,
  onNoteChange,
  onModeChange,
  onCategoryChange
}: ScaleSelectorProps) {
  const notes: Note[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const modes: ScaleMode[] = ['major', 'minor'];
  const categories: ScaleCategory[] = ['diatonic', 'pentatonic', 'blues'];

  return (
    <div className="flex flex-col gap-4 items-center justify-center p-4">
      <div className="flex gap-4 items-center">
        <select
          value={selectedNote}
          onChange={(e) => onNoteChange(e.target.value as Note)}
          className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {notes.map((note) => (
            <option key={note} value={note}>
              {note}
            </option>
          ))}
        </select>

        <select
          value={selectedMode}
          onChange={(e) => onModeChange(e.target.value as ScaleMode)}
          className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {modes.map((mode) => (
            <option key={mode} value={mode}>
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-4 items-center">
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value as ScaleCategory)}
          className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
} 