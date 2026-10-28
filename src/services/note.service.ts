import { randomUUID } from 'node:crypto';
import type { INoteService } from '../interfaces/note.service.interface.js';
import type { INoteRepository } from '../interfaces/note.repository.interface.js';
import type { Note } from '../interfaces/note.interface.js';
import type { CreateNoteDto, UpdateNoteDto } from '../dto/note.dto.js';
import { NotFoundError } from '../utils/errors.js';

export class NoteService implements INoteService {
  constructor(private readonly repo: INoteRepository) {}

  async create(dto: CreateNoteDto): Promise<Note> {
    const now = new Date().toISOString();
    return this.repo.save({ id: randomUUID(), ...dto, createdAt: now, updatedAt: now });
  }

  async getById(id: string): Promise<Note> {
    const note = await this.repo.findById(id);
    if (!note) throw new NotFoundError(`Note ${id} not found`);
    return note;
  }

  list(): Promise<Note[]> {
    return this.repo.findAll();
  }

  async update(id: string, dto: UpdateNoteDto): Promise<Note> {
    const existing = await this.getById(id);
    return this.repo.save({ ...existing, ...dto, updatedAt: new Date().toISOString() });
  }

  async remove(id: string): Promise<void> {
    await this.getById(id);
    await this.repo.delete(id);
  }
}
