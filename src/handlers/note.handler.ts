import { noteController } from '../container.js';
import { protectedRoute, requireRole } from '../middlewares/index.js';

// Lambda entry points (referenced by Handler: note.handler.<name> in template.yaml)
export const createNote = protectedRoute(noteController.create);
export const listNotes = protectedRoute(noteController.list);
export const getNote = protectedRoute(noteController.getById);
export const updateNote = protectedRoute(noteController.update);
export const deleteNote = protectedRoute(noteController.remove, requireRole('admin'));
