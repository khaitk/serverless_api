import { S3Client } from '@aws-sdk/client-s3';
import { env } from './config/env.js';
import { S3NoteRepository } from './repositories/note.repository.js';
import { NoteService } from './services/note.service.js';
import { NoteController } from './controllers/note.controller.js';
import { AuthService } from './services/auth.service.js';
import { AuthController } from './controllers/auth.controller.js';

// Created once per cold start, reused across warm invocations.
const s3 = new S3Client({});
const noteRepository = new S3NoteRepository(s3, env.dataBucket);
const noteService = new NoteService(noteRepository);

export const noteController = new NoteController(noteService);
export const authController = new AuthController(new AuthService());
