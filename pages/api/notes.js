// File: pages/api/notes.js
import { openDb } from '../../lib/db';

export default async function handler(req, res) {
    try {
        console.log('Opening database connection');
        const db = await openDb();
        console.log('Database connection opened successfully');

        await db.exec(`
        CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            transcription TEXT NOT NULL,
            audio_url TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
        `);
        console.log('Ensured notes table exists');

        if (req.method === 'GET') {
        console.log('Executing SELECT query');
        const notes = await db.all('SELECT * FROM notes ORDER BY created_at DESC');
        console.log(`Retrieved ${notes.length} notes`);
        res.status(200).json(notes);
        } else if (req.method === 'POST') {
        const { title, transcription, audioUrl } = req.body;
        console.log('Received POST data:', { title, transcription, audioUrl });

        if (!title || typeof title !== 'string') {
            return res.status(400).json({ error: 'Invalid title' });
        }
        if (!transcription || typeof transcription !== 'string') {
            return res.status(400).json({ error: 'Invalid transcription' });
        }
        if (!audioUrl || typeof audioUrl !== 'string') {
            return res.status(400).json({ error: 'Invalid audioUrl' });
        }

        console.log('Executing INSERT query');
        const result = await db.run(
            'INSERT INTO notes (title, transcription, audio_url) VALUES (?, ?, ?)',
            [title, transcription, audioUrl]
        );
        console.log(`Inserted note with ID: ${result.lastID}`);
        res.status(201).json({ id: result.lastID });
        } else {
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error) {
        console.error('API error:', error);
        res.status(500).json({ 
        error: 'Internal Server Error', 
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}