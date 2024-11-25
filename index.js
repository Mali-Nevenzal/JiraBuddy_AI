require('dotenv').config();

// קריאת משתני סביבה
const API_KEY = process.env.GEMINI_API_KEY;
const BASE_URL = "https://api.gemini.com/ai";

// פונקציה לשליחת פרומפט ל-AI
async function sendPromptToGemini(prompt) {
    try {
        const response = await fetch(`${BASE_URL}/generate`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('AI Response:', data);
        return data;
    } catch (error) {
        console.error('Error interacting with Gemini AI:', error.message);
    }
}

// דוגמה לשימוש
const userPrompt = "What is the capital of France?";
sendPromptToGemini(userPrompt);
