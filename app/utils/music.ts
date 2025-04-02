export type Note = 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B';
export type ScaleMode = 'major' | 'minor';
export type ScaleCategory = 'diatonic' | 'pentatonic' | 'blues';

type ScalePatternKey = `${ScaleMode}-${ScaleCategory}`;

const NOTES: Note[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const SCALE_PATTERNS: Record<ScalePatternKey, number[]> = {
  'major-diatonic': [0, 2, 4, 5, 7, 9, 11],
  'minor-diatonic': [0, 2, 3, 5, 7, 8, 10],
  'major-pentatonic': [0, 2, 4, 7, 9],
  'minor-pentatonic': [0, 3, 5, 7, 10],
  'major-blues': [0, 2, 3, 4, 7, 9],
  'minor-blues': [0, 3, 5, 6, 7, 10]
};

export function getScale(root: Note, mode: ScaleMode, category: ScaleCategory): Note[] {
  const rootIndex = NOTES.indexOf(root);
  const patternKey = `${mode}-${category}` as ScalePatternKey;
  const pattern = SCALE_PATTERNS[patternKey];
  
  return pattern.map((interval: number) => {
    const noteIndex = (rootIndex + interval) % 12;
    return NOTES[noteIndex];
  });
}

export function getNoteFrequency(note: Note, octave: number): number {
  const A4 = 440;
  const A4_INDEX = NOTES.indexOf('A');
  const noteIndex = NOTES.indexOf(note);
  
  const halfStepsFromA4 = (octave - 4) * 12 + (noteIndex - A4_INDEX);
  return A4 * Math.pow(2, halfStepsFromA4 / 12);
}

export function getVexFlowNote(note: Note): string {
  // VexFlow uses lowercase for natural notes and uppercase for sharps
  return note.length === 1 ? note.toLowerCase() : note[0].toLowerCase() + '#';
}

// Helper function to get the scale name in a readable format
export function getScaleName(root: Note, mode: ScaleMode, category: ScaleCategory): string {
  const modeName = mode.charAt(0).toUpperCase() + mode.slice(1);
  const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
  return `${root} ${modeName} ${categoryName}`;
}

// Helper function to get the number of notes in a scale
export function getScaleNoteCount(mode: ScaleMode, category: ScaleCategory): number {
  const patternKey = `${mode}-${category}` as ScalePatternKey;
  return SCALE_PATTERNS[patternKey].length;
} 