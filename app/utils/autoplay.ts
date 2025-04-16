import { Note } from './music';

export type Duration = '4n' | '8n' | '16n' | '8t' | '4n.' | '8n.' | '4r' | '8r' | '16r';

export interface SoloEvent {
  note: { note: Note; octave: number } | null;
  duration: Duration;
}

// Helper to create a rest
function createRest(): SoloEvent {
  return {
    note: null,
    duration: Math.random() < 0.7 ? '8r' : '16r'
  };
}

// Helper to get the interval between two notes
function getInterval(note1: { note: Note; octave: number }, note2: { note: Note; octave: number }): number {
  const NOTES: Note[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const note1Index = NOTES.indexOf(note1.note);
  const note2Index = NOTES.indexOf(note2.note);
  
  // Calculate interval including octave difference
  const octaveDiff = note2.octave - note1.octave;
  const semitoneDiff = note2Index - note1Index;
  
  return octaveDiff * 12 + semitoneDiff;
}

// Helper to get a note at a specific interval from a given note
function getNoteAtInterval(baseNote: { note: Note; octave: number }, interval: number): { note: Note; octave: number } {
  const NOTES: Note[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const noteIndex = NOTES.indexOf(baseNote.note);
  
  // Calculate new note index and octave
  const totalSemitones = interval;
  const octaveChange = Math.floor(totalSemitones / 12);
  const semitoneChange = totalSemitones % 12;
  
  let newNoteIndex = (noteIndex + semitoneChange) % 12;
  if (newNoteIndex < 0) newNoteIndex += 12;
  
  const newOctave = baseNote.octave + octaveChange;
  
  return {
    note: NOTES[newNoteIndex],
    octave: newOctave
  };
}

// Helper to find the closest note in the scale
function findClosestScaleNote(note: { note: Note; octave: number }, scaleNotes: { note: Note; octave: number }[]): { note: Note; octave: number } {
  let closestNote = scaleNotes[0];
  let smallestInterval = Infinity;
  
  for (const scaleNote of scaleNotes) {
    const interval = Math.abs(getInterval(note, scaleNote));
    if (interval < smallestInterval) {
      smallestInterval = interval;
      closestNote = scaleNote;
    }
  }
  
  return closestNote;
}

// Remove unused function
// function isNoteInScale(note: { note: Note; octave: number }, scaleNotes: { note: Note; octave: number }[]): boolean {
//   return scaleNotes.some(scaleNote => 
//     scaleNote.note === note.note && 
//     Math.abs(scaleNote.octave - note.octave) <= 1
//   );
// }

// Helper to create a melodic phrase based on history
function createMelodicPhrase(
  scaleNotes: { note: Note; octave: number }[], 
  history: SoloEvent[], 
  length: number,
  isDownbeat: boolean = false
): SoloEvent[] {
  const events: SoloEvent[] = [];
  
  // Get the last note from history (if any)
  let lastNote: { note: Note; octave: number } = scaleNotes[Math.floor(Math.random() * scaleNotes.length)];
  for (let i = history.length - 1; i >= 0; i--) {
    const historyNote = history[i].note;
    if (historyNote && typeof historyNote === 'object' && 'note' in historyNote && 'octave' in historyNote) {
      lastNote = historyNote as { note: Note; octave: number };
      break;
    }
  }
  
  // Track melodic direction (up, down, or neutral)
  let direction = 0; // -1 for down, 0 for neutral, 1 for up
  
  // Create a phrase with melodic direction
  for (let i = 0; i < length; i++) {
    // Determine the next note based on melodic patterns
    let nextNote: { note: Note; octave: number };
    
    // 80% chance to follow melodic patterns
    if (Math.random() < 0.8) {
      // Prioritize stepwise motion (80% chance)
      if (Math.random() < 0.8) {
        // Stepwise motion (up or down by 1 or 2 steps)
        const step = Math.random() < 0.9 ? 1 : 2; // 90% chance of step of 1
        let goUp = Math.random() < 0.5;
        
        // Adjust direction based on previous direction to create smoother lines
        if (direction !== 0) {
          // 70% chance to continue in the same direction
          if (Math.random() < 0.7) {
            goUp = direction > 0;
          }
        }
        
        const interval = goUp ? step : -step;
        nextNote = getNoteAtInterval(lastNote, interval);
        
        // Update direction
        direction = goUp ? 1 : -1;
      } else {
        // Larger intervals (thirds, fourths) - less common
        const intervals = [3, -3, 4, -4];
        const interval = intervals[Math.floor(Math.random() * intervals.length)];
        nextNote = getNoteAtInterval(lastNote, interval);
        
        // Update direction
        direction = interval > 0 ? 1 : -1;
      }
      
      // Find the closest note in the scale
      nextNote = findClosestScaleNote(nextNote, scaleNotes);
      
      // 20% chance to choose a random note from the scale
    } else {
      // Choose a note that's not too far from the last note
      const availableNotes = scaleNotes.filter(note => 
        Math.abs(getInterval(lastNote, note)) <= 5 // Limit to perfect fourth range
      );
      
      nextNote = availableNotes[Math.floor(Math.random() * availableNotes.length)];
      
      // Update direction
      const interval = getInterval(lastNote, nextNote);
      direction = interval > 0 ? 1 : -1;
    }
    
    // Choose a duration based on position in phrase and whether it's a downbeat
    let duration: Duration;
    
    // Check if this note would be a repetition of the previous note with the same duration
    const lastEvent = events.length > 0 ? events[events.length - 1] : null;
    const prevEvent = events.length > 1 ? events[events.length - 2] : null;
    
    // Check for both immediate repetition and pattern repetition
    const isRepetition = lastEvent?.note !== null && 
                        lastEvent?.note?.note === nextNote.note && 
                        lastEvent?.note?.octave === nextNote.octave;
                        
    const isPatternRepetition = prevEvent?.note !== null &&
                               prevEvent?.note?.note === nextNote.note &&
                               prevEvent?.note?.octave === nextNote.octave;
    
    // If we're repeating a note, try to find a different one
    if (isRepetition || isPatternRepetition) {
      // 80% chance to choose a different note
      if (Math.random() < 0.8) {
        // Try to find a different note within a reasonable range
        const alternativeNotes = scaleNotes.filter(note => 
          note.note !== nextNote.note &&
          Math.abs(getInterval(lastNote, note)) <= 3 // Keep it close for melodic continuity
        );
        
        if (alternativeNotes.length > 0) {
          nextNote = alternativeNotes[Math.floor(Math.random() * alternativeNotes.length)];
        }
      }
    }
    
    // Track if we're in a triplet group
    const inTripletGroup = events.length >= 2 &&
                          events[events.length - 1].duration === '8t' &&
                          events[events.length - 2].duration === '8t';
    
    if (isDownbeat && i === 0) {
      // First note on downbeat - longer duration
      duration = Math.random() < 0.8 ? '4n' : '8n';
    } else if (i === 0) {
      // First note of phrase (not on downbeat)
      duration = Math.random() < 0.7 ? '8n' : '16n';
    } else if (i === length - 1) {
      // Last note of phrase
      duration = Math.random() < 0.7 ? '8n' : '16n';
    } else {
      // Middle notes of phrase - with more varied rhythmic patterns
      const rand = Math.random();
      
      if (inTripletGroup) {
        // Complete the triplet group
        duration = '8t';
      } else {
        // Normal rhythm distribution
        if (rand < 0.5) {
          duration = '8n';
        } else if (rand < 0.8) {
          duration = '16n';
        } else if (rand < 0.9) {
          // Start a new triplet group only if we have room in the phrase
          duration = i < length - 2 ? '8t' : '8n';
        } else {
          // Dotted eighth note for variety
          duration = '8n.';
        }
      }
    }
    
    // If we still have a repetition, consider adding a rest
    if (isRepetition && Math.random() < 0.6) {
      events.push(createRest());
      continue;
    }
    
    events.push({
      note: nextNote,
      duration
    });
    
    lastNote = nextNote;
  }
  
  return events;
}

export function generateSoloSequence(scaleNotes: { note: Note; octave: number }[], measures: number): SoloEvent[] {
  const events: SoloEvent[] = [];
  const beatsPerMeasure = 4; // 4/4 time
  let currentBeat = 0;
  
  // Create a history of events for context
  const history: SoloEvent[] = [];
  
  // Track the overall melodic contour
  const overallDirection = 0; // -1 for down, 0 for neutral, 1 for up
  
  for (let measure = 0; measure < measures; measure++) {
    // Start each measure with a higher probability of starting on beat 1
    if (measure === 0 || Math.random() < 0.4) {
      // Create a phrase that starts on beat 1 (downbeat)
      const phraseLength = Math.floor(Math.random() * 2) + 2; // 2-3 notes
      const phrase = createMelodicPhrase(scaleNotes, history, phraseLength, true);
      events.push(...phrase);
      
      // Update history (keep last 8 events for context)
      history.push(...phrase);
      while (history.length > 8) {
        history.shift();
      }
      
      currentBeat += phraseLength;
    } else {
      // Add a rest at the start of the measure occasionally
      if (Math.random() < 0.3) {
        const rest = createRest();
        events.push(rest);
        history.push(rest);
        currentBeat += 1;
      }
      
      // Create a shorter phrase - ensure it's at least 2 notes
      const phraseLength = Math.floor(Math.random() * 2) + 2; // 2-3 notes
      const phrase = createMelodicPhrase(scaleNotes, history, phraseLength, false);
      events.push(...phrase);
      
      // Update history
      history.push(...phrase);
      while (history.length > 8) {
        history.shift();
      }
      
      currentBeat += phraseLength;
    }
    
    // Add occasional rests between phrases
    if (Math.random() < 0.3) {
      const rest = createRest();
      events.push(rest);
      history.push(rest);
      currentBeat += 1;
    }
    
    // Ensure we fill the measure
    while (currentBeat < (measure + 1) * beatsPerMeasure) {
      // Add a short phrase to fill the measure - ensure it's at least 2 notes
      const phraseLength = Math.floor(Math.random() * 2) + 2; // 2-3 notes
      const phrase = createMelodicPhrase(scaleNotes, history, phraseLength, false);
      events.push(...phrase);
      
      // Update history
      history.push(...phrase);
      while (history.length > 8) {
        history.shift();
      }
      
      currentBeat += phraseLength;
    }
  }
  
  return events;
} 