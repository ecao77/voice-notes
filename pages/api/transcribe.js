// File: pages/api/transcribe.js
import { Configuration, OpenAIApi } from 'openai';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
    api: {
        bodyParser: false,
    },
};

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const form = new formidable.IncomingForm();
        form.parse(req, async (err, fields, files) => {
        if (err) {
            console.error('Error parsing form:', err);
            res.status(500).json({ error: 'Error parsing form data' });
            return;
        }

        try {
            const audioFile = files.audio;
            if (!audioFile) {
            throw new Error('No audio file uploaded');
            }
            const response = await openai.createTranscription(
            fs.createReadStream(audioFile.filepath),
            "whisper-large-v3"
            );

            res.status(200).json({ transcription: response.data.text });
        } catch (error) {
            console.error('Error transcribing audio:', error);
            res.status(500).json({ error: 'Error transcribing audio' });
        }
        });
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}