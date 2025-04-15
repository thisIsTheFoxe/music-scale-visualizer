'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import * as Tone from 'tone';
import { Note, ScaleMode, ScaleCategory, getScale, getNoteFrequency } from '../utils/music';
import { generateSoloSequence, SoloEvent } from '../utils/autoplay';

interface AutoPlayProps {
  rootNote: Note;
  scaleMode: ScaleMode;
  scaleCategory: ScaleCategory;
  startOctave: number;
  tempo: number;
  isEnabled?: boolean;
}

export default function AutoPlay({
  rootNote,
  scaleMode,
  scaleCategory,
  startOctave,
  tempo,
  isEnabled = true
}: AutoPlayProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [synth, setSynth] = useState<Tone.Synth | null>(null);
  const currentEventIndex = useRef(0);
  const currentEvents = useRef<SoloEvent[]>([]);
  const loop = useRef<Tone.Loop | null>(null);

  // Initialize synth
  useEffect(() => {
    const newSynth = new Tone.Synth({
      envelope: {
        attack: 0.05,
        decay: 0.1,
        sustain: 0.3,
        release: 0.5
      }
    }).toDestination();
    setSynth(synth => {
      synth?.dispose();
      return newSynth;
    });

    return () => {
      newSynth.dispose();
    };
  }, []);

  const generateNewEvents = useCallback(() => {
    if (!synth) return;

    // Get scale notes spanning two octaves
    const baseScaleNotes = getScale(rootNote, scaleMode, scaleCategory);
    const scaleNotes = baseScaleNotes.flatMap(note => [
      { note, octave: startOctave },
      { note, octave: startOctave + 1 }
    ]);

    // Generate a sequence of notes and rests
    return generateSoloSequence(scaleNotes, 2); // 2 measures at a time
  }, [rootNote, scaleMode, scaleCategory, startOctave, synth]);

  // Set up the continuous playback loop
  const setupLoop = useCallback(() => {
    if (!synth) return;

    // Generate initial events
    currentEvents.current = generateNewEvents() || [];
    currentEventIndex.current = 0;

    // Create a loop that plays each event
    const newLoop = new Tone.Loop((time) => {
      const event = currentEvents.current[currentEventIndex.current];
      
      if (event?.note) {
        const freq = getNoteFrequency(event.note.note, event.note.octave);
        synth.triggerAttackRelease(freq, event.duration, time);
      }

      // Move to next event
      currentEventIndex.current++;

      // If we're near the end of our current events, generate more
      if (currentEventIndex.current >= currentEvents.current.length - 4) {
        const newEvents = generateNewEvents();
        if (newEvents) {
          currentEvents.current = [...currentEvents.current.slice(currentEventIndex.current), ...newEvents];
          currentEventIndex.current = 0;
        }
      }
    }, "16n").start(0);

    loop.current = newLoop;
    return newLoop;
  }, [generateNewEvents, synth]);

  // Update tempo
  useEffect(() => {
    Tone.Transport.bpm.value = tempo;
  }, [tempo]);

  // Handle play/stop
  const togglePlay = async () => {
    if (!isEnabled) return;

    if (!isPlaying) {
      await Tone.start();
      setupLoop();
      Tone.Transport.start();
      setIsPlaying(true);
    } else {
      Tone.Transport.stop();
      loop.current?.stop();
      setIsPlaying(false);
    }
  };

  // Generate new solo while playing
  const regenerateSolo = () => {
    if (!isPlaying) return;
    currentEvents.current = generateNewEvents() || [];
    currentEventIndex.current = 0;
  };

  // Cleanup
  useEffect(() => {
    return () => {
      loop.current?.dispose();
      Tone.Transport.stop();
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={togglePlay}
        disabled={!isEnabled}
        className={`
          px-6 py-3 rounded-lg text-lg font-medium transition-colors
          ${isEnabled
            ? isPlaying
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-green-500 hover:bg-green-600 text-white'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }
        `}
      >
        {isPlaying ? 'Stop Solo' : 'Start Solo'}
      </button>
      {isPlaying && (
        <button
          onClick={regenerateSolo}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Generate New Solo
        </button>
      )}
    </div>
  );
} 