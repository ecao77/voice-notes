// File: pages/index.js
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"

export default function Home() {
    const [isRecording, setIsRecording] = useState(false);
    const [notes, setNotes] = useState([]);
    const [audioBlob, setAudioBlob] = useState(null);
    const [error, setError] = useState(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    useEffect(() => {
        fetchNotes().catch(err => {
        console.error("Error fetching notes:", err);
        setError("Failed to fetch notes. Please try again.");
        });
    }, []);

    const fetchNotes = async () => {
        try {
        console.log('Fetching notes');
        const response = await fetch('/api/notes');
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`HTTP error! status: ${response.status}, message: ${JSON.stringify(errorData)}`);
        }
        const data = await response.json();
        console.log(`Fetched ${data.length} notes`);
        setNotes(data);
        } catch (error) {
        console.error("Error fetching notes:", error);
        setError(`Failed to fetch notes: ${error.message}`);
        }
    };

    const startRecording = async () => {
        try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
            if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
            }
        };

        mediaRecorderRef.current.onstop = () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
            setAudioBlob(audioBlob);
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);
        } catch (err) {
        console.error("Error accessing microphone:", err);
        setError("Failed to access microphone. Please check your permissions.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
        }
    };

    const saveNote = async () => {
        if (!audioBlob) {
        console.error('No audio blob available');
        setError('No audio recording available to save');
        return;
        }

        try {
        // First, transcribe the audio
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.wav');

        console.log('Starting transcription...');
        const transcribeResponse = await fetch('/api/transcribe', {
            method: 'POST',
            body: formData,
        });
        
        if (!transcribeResponse.ok) {
            const errorData = await transcribeResponse.json();
            console.error('Transcription failed:', errorData);
            throw new Error(`Transcription failed: ${errorData.error || errorData.message || transcribeResponse.statusText}`);
        }
        
        const { transcription } = await transcribeResponse.json();
        console.log('Transcription successful:', transcription);

        // Then, generate a title
        console.log('Generating title...');
        const titleResponse = await fetch('/api/generate-title', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ transcription }),
        });
        if (!titleResponse.ok) {
            const errorData = await titleResponse.json();
            throw new Error(`Title generation failed: ${errorData.message || titleResponse.statusText}`);
        }
        const { title } = await titleResponse.json();
        console.log('Title generated:', title);

        // Convert audioBlob to base64
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async function() {
            const base64AudioMessage = reader.result;
            console.log('Audio converted to base64');

            // Finally, save the note
            console.log('Saving note...');
            const saveResponse = await fetch('/api/notes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title,
                transcription,
                audioUrl: base64AudioMessage,
            }),
            });
            if (!saveResponse.ok) {
            const errorData = await saveResponse.json();
            throw new Error(`Saving note failed: ${errorData.message || saveResponse.statusText}`);
            }
            console.log('Note saved successfully');

            // Refresh the notes list
            await fetchNotes();
            setAudioBlob(null);
        }
        } catch (error) {
        console.error('Error saving note:', error);
        setError(error.message || "Failed to save note. Please try again.");
        }
    };

    return (
        <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Voice Notes App</h1>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <div className="mb-4">
            <Button onClick={isRecording ? stopRecording : startRecording}>
            {isRecording ? 'Stop Recording' : 'Start Recording'}
            </Button>
            {audioBlob && (
            <Button onClick={saveNote} className="ml-2">
                Save Note
            </Button>
            )}
        </div>
        <div className="mt-4">
            {notes.map((note) => (
            <Card key={note.id} className="mb-4">
                <CardHeader>
                <h2 className="text-xl font-semibold">{note.title}</h2>
                </CardHeader>
                <CardContent>
                <p>{note.transcription}</p>
                <audio src={note.audio_url} controls className="mt-2" />
                </CardContent>
            </Card>
            ))}
        </div>
        </div>
    );
}