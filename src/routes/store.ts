import { writable } from 'svelte/store';

export type NoteType = {
  id: number;
  title: string;
  content: string;
  color: string;
  shape: 'square' | 'circle';
  x: number;
  y: number;
  pinned: boolean; // New property for pinned status
};

// Initialize with your existing notes
const initialNotes: NoteType[] = [
  { id: 1, title: 'First Note', content: 'This is my first note.', color: 'blue', shape: 'square', x: 150, y: 100, pinned: false },
  { id: 2, title: 'Note', content: 'Important tasks to do today.', color: 'yellow', shape: 'circle', x: 300, y: 200, pinned: false }
];

// If in browser environment, try to load from localStorage
if (typeof window !== 'undefined') {
  try {
    const savedNotes = localStorage.getItem('notesData');
    if (savedNotes) {
      initialNotes.splice(0, initialNotes.length, ...JSON.parse(savedNotes));
      // Ensure pinned property exists for backward compatibility
      initialNotes.forEach(note => {
        if (typeof note.pinned === 'undefined') {
          note.pinned = false;
        }
      });
    }
  } catch (e) {
    console.error('Failed to parse saved notes');
  }
}

export const notes = writable(initialNotes);

// Subscribe to changes and save to localStorage
if (typeof window !== 'undefined') {
  notes.subscribe(value => {
    localStorage.setItem('notesData', JSON.stringify(value));
  });
}