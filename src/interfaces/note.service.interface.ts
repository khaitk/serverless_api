import type { Note } from './note.interface.js';
import type { CreateNoteDto, UpdateNoteDto } from '../dto/note.dto.js';

export interface INoteService {
  create(dto: CreateNoteDto): Promise<Note>;
  getById(id: string): Promise<Note>;
  list(): Promise<Note[]>;
  update(id: string, dto: UpdateNoteDto): Promise<Note>;
  remove(id: string): Promise<void>;
}
