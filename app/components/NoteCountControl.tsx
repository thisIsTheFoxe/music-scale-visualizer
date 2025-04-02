'use client';

interface NoteCountControlProps {
  noteCount: number;
  onNoteCountChange: (count: number) => void;
}

export default function NoteCountControl({ noteCount, onNoteCountChange }: NoteCountControlProps) {
  return (
    <div className="flex items-center justify-center gap-4 my-4">
      <label htmlFor="noteCount" className="text-gray-700">
        Notes to display:
      </label>
      <input
        id="noteCount"
        type="range"
        min="4"
        max="16"
        value={noteCount}
        onChange={(e) => onNoteCountChange(parseInt(e.target.value))}
        className="w-48"
      />
      <span className="text-gray-700 min-w-[2rem] text-center">
        {noteCount}
      </span>
    </div>
  );
} 