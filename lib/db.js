import { open } from 'sqlite'

let db = null;

async function openDb() {
    if (!db) {
        const sqlite3 = await import('sqlite3').then(sqlite3 => sqlite3.default);
        db = await open({
        filename: './voice_notes.sqlite',
        driver: sqlite3.Database
    });
}
return db;
}

async function setupDb() {
    const db = await openDb();
    await db.exec(`
        CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        transcription TEXT,
        audio_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
}

export { openDb, setupDb };