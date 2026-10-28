import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
  NoSuchKey,
} from '@aws-sdk/client-s3';
import type { INoteRepository } from '../interfaces/note.repository.interface.js';
import type { Note } from '../interfaces/note.interface.js';

const PREFIX = 'notes/';
const keyOf = (id: string) => `${PREFIX}${id}.json`;

/** Stores each note as a JSON object in S3. */
export class S3NoteRepository implements INoteRepository {
  constructor(
    private readonly s3: S3Client,
    private readonly bucket: string,
  ) {}

  async findById(id: string): Promise<Note | null> {
    try {
      const res = await this.s3.send(new GetObjectCommand({ Bucket: this.bucket, Key: keyOf(id) }));
      return JSON.parse((await res.Body?.transformToString()) ?? 'null') as Note | null;
    } catch (err) {
      if (err instanceof NoSuchKey) return null;
      throw err;
    }
  }

  async findAll(): Promise<Note[]> {
    const list = await this.s3.send(new ListObjectsV2Command({ Bucket: this.bucket, Prefix: PREFIX }));
    const keys = (list.Contents ?? []).map((o) => o.Key).filter((k): k is string => !!k);
    const notes = await Promise.all(
      keys.map((k) => this.findById(k.slice(PREFIX.length, -'.json'.length))),
    );
    return notes.filter((n): n is Note => n !== null);
  }

  async save(note: Note): Promise<Note> {
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: keyOf(note.id),
        Body: JSON.stringify(note),
        ContentType: 'application/json',
      }),
    );
    return note;
  }

  async delete(id: string): Promise<void> {
    await this.s3.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: keyOf(id) }));
  }
}
