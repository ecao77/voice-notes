// File: pages/api/generate-title.js
import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
    if (req.method === 'POST') {
    try {
        const { transcription } = req.body;
        
        const response = await openai.createCompletion({
            model: "gpt-4-mini",
            prompt: `Generate a short, catchy title for this transcription: "${transcription}"`,
            max_tokens: 60
        });

        res.status(200).json({ title: response.data.choices[0].text.trim() });
        } catch (error) {
        res.status(500).json({ error: 'Error generating title' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}