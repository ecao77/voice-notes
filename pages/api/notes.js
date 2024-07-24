// File: pages/api/notes.js
import { openDb } from '../../lib/db';

export default async function handler(req, res) {
    try {
        console.log('Opening database connection');
        const db = await openDb();
        console.log('Database connection opened successfully');

        if (req.method === 'GET') {
        console.log('Executing SELECT query');
        const notes = await db.all('SELECT * FROM notes ORDER BY created_at DESC');
        console.log(`Retrieved ${notes.length} notes`);
        res.status(200).json(notes);
        } else if (req.method === 'POST') {
        const { title, transcription, audioUrl } = req.body;
        if (!title || !transcription || !audioUrl) {
            throw new Error('Missing required fields');
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
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}