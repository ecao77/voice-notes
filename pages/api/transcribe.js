// File: pages/api/transcribe.js
import OpenAI from 'openai';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
    api: {
        bodyParser: false,
    },
};

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
    if (req.method === 'POST') {
        console.log('Received POST request to /api/transcribe');
        const form = new formidable.IncomingForm();
        form.parse(req, async (err, fields, files) => {
            if (err) {
                console.error('Error parsing form:', err);
                return res.status(500).json({ error: 'Error parsing form data', details: err.message });
            }

            try {
                const audioFile = files.audio;
                if (!audioFile) {
                    console.error('No audio file uploaded');
                    return res.status(400).json({ error: 'No audio file uploaded' });
                }
                
                console.log('Audio file received:', audioFile.filepath);
                
                if (!fs.existsSync(audioFile.filepath)) {
                    console.error('Audio file does not exist at path:', audioFile.filepath);
                    return res.status(500).json({ error: 'Audio file not found on server' });
                }

                console.log('Initiating transcription with OpenAI API');
                const response = await openai.audio.transcriptions.create({
                    file: fs.createReadStream(audioFile.filepath),
                    model: "whisper-1",
                });

                console.log('Transcription successful');
                res.status(200).json({ transcription: response.text });
            } catch (error) {
                console.error('Error in transcription process:', error);
                res.status(500).json({ 
                    error: 'Error transcribing audio', 
                    details: error.message,
                    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
                });
            }
        });
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}