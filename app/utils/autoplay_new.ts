import { Note } from './music';

export type Duration = '4n' | '8n' | '16n' | '8t' | '4n.' | '8n.' | '4r' | '8r' | '16r';

export interface SoloEvent {
  note: { note: Note; octave: number } | null;
  duration: Duration;
}

// Common rhythmic patterns
const patterns: Duration[][] = [
  ['8n', '8n', '8n', '8n'],  // Four eighth notes
  ['4n', '4n'],              // Two quarter notes
  ['8n', '8n', '4n'],        // Two eighths and a quarter
  ['4n', '8n', '8n'],        // Quarter and two eighths
  ['16n', '16n', '8n', '8n'], // Sixteenth notes leading to eighths
  ['8n', '16n', '16n', '8n'], // Eighth, two sixteenths, eighth
];

// Helper to create a musical phrase
function createPhrase(scaleNotes: { note: Note; octave: number }[], pattern: Duration[]): SoloEvent[] {
  const events: SoloEvent[] = [];
  let currentIndex = 0;
  
  for (const duration of pattern) {
    // 70% chance to move up or down by 1-2 steps
    if (Math.random() < 0.7) {
      const step = Math.random() < 0.5 ? 1 : 2;
      currentIndex = (currentIndex + (Math.random() < 0.5 ? step : -step) + scaleNotes.length) % scaleNotes.length;
    } else {
      // 30% chance to jump to a new position
      currentIndex = Math.floor(Math.random() * scaleNotes.length);
    }

    events.push({
      note: scaleNotes[currentIndex],
      duration
    });
  }

  return events;
}

// Helper to create a rest
function createRest(): SoloEvent {
  return {
    note: null,
    duration: Math.random() < 0.7 ? '8r' : '16r'
  };
}

export function generateSoloSequence(scaleNotes: { note: Note; octave: number }[], measures: number): SoloEvent[] {
  const events: SoloEvent[] = [];
  const beatsPerMeasure = 4; // Assuming 4/4 time

  for (let measure = 0; measure < measures; measure++) {
    // Start each measure with a higher probability of starting on a strong beat
    if (measure === 0 || Math.random() < 0.3) {
      // Choose a pattern that fits the measure
      const pattern = patterns[Math.floor(Math.random() * patterns.length)];
      events.push(...createPhrase(scaleNotes, pattern));
    } else {
      // Add a rest at the start of the measure occasionally
      if (Math.random() < 0.3) {
        events.push(createRest());
      }
      // Create a shorter phrase
      const shortPattern = patterns[Math.floor(Math.random() * patterns.length)].slice(0, 2);
      events.push(...createPhrase(scaleNotes, shortPattern));
    }

    // Add occasional rests between phrases
    if (Math.random() < 0.3) {
      events.push(createRest());
    }

    // Ensure we fill the measure
    while (events.length < (measure + 1) * beatsPerMeasure) {
      // Add a short phrase or single note to fill the measure
      if (Math.random() < 0.7) {
        const shortPattern = patterns[Math.floor(Math.random() * patterns.length)].slice(0, 1);
        events.push(...createPhrase(scaleNotes, shortPattern));
      } else {
        events.push(createRest());
      }
    }
  }

  return events;
} 