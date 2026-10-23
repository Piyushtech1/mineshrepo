import fs from 'fs';
import path from 'path';
import { DatabaseState } from './schema';
import { createInitialSeed } from './seed';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

class DatabaseStore {
  private state: DatabaseState | null = null;
  private isInitialized = false;

  async init(): Promise<void> {
    if (this.isInitialized && this.state) return;

    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.state = JSON.parse(raw);
      } catch (err) {
        console.error('Failed to parse database.json, re-seeding:', err);
        this.state = await createInitialSeed();
        await this.persist();
      }
    } else {
      console.log('No database found. Generating initial seed data...');
      this.state = await createInitialSeed();
      await this.persist();
    }

    this.isInitialized = true;
  }

  getState(): DatabaseState {
    if (!this.state) {
      throw new Error('Database not initialized. Call init() first.');
    }
    return this.state;
  }

  async persist(): Promise<void> {
    if (!this.state) return;
    try {
      const tempFile = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempFile, JSON.stringify(this.state, null, 2), 'utf-8');
      fs.renameSync(tempFile, DB_FILE);
    } catch (err) {
      console.error('Failed to persist database:', err);
    }
  }

  async updateState(updater: (state: DatabaseState) => void): Promise<DatabaseState> {
    const state = this.getState();
    updater(state);
    await this.persist();
    return state;
  }
}

export const db = new DatabaseStore();
