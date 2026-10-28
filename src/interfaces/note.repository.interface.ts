import type { Note } from './note.interface.js';

export interface INoteRepository {
  findById(id: string): Promise<Note | null>;
  findAll(): Promise<Note[]>;
  save(note: Note): Promise<Note>;
  delete(id: string): Promise<void>;
}
