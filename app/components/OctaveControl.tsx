'use client';

interface OctaveControlProps {
  startOctave: number;
  onOctaveChange: (octave: number) => void;
}

export default function OctaveControl({ startOctave, onOctaveChange }: OctaveControlProps) {
  return (
    <div className="flex items-center justify-center gap-4 my-4">
      <label htmlFor="startOctave" className="text-gray-700">
        Starting Octave:
      </label>
      <input
        id="startOctave"
        type="range"
        min="0"
        max="7"
        value={startOctave}
        onChange={(e) => onOctaveChange(parseInt(e.target.value))}
        className="w-48"
      />
      <span className="text-gray-700 min-w-[2rem] text-center">
        {startOctave}
      </span>
    </div>
  );
} 