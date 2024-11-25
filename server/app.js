import express from 'express';
import cors from 'cors';
import { generateQuiz } from './generateQuiz.js';

const app = express();
app.use(cors());
app.use(express.json());

// מסלול לטיפול בבקשות ל-Gemini
app.post('/gemini', async (req, res) => {
  try {
    // חילוץ השדות מהבקשה
    const { projectOrTaskDescription, type, assignee, projectName } = req.body;

    // בדיקת תקינות השדות
    if (!projectOrTaskDescription || !type || !assignee || !projectName) {
      return res.status(400).json({ error: "Missing required fields: projectOrTaskDescription, type, assignee, projectName" });
    }

    // קריאה לפונקציה generateQuiz עם הפרמטרים
    const quizResult = await generateQuiz(projectOrTaskDescription, type, assignee, projectName);

    // שליחת התוצאה בחזרה ללקוח
    res.status(200).json(quizResult);
  } catch (error) {
    console.error('Error in /gemini route:', error.message);
    res.status(500).json({ error: "Failed to process the request" });
  }
});

// הפעלת השרת
app.listen(8080, (err) => {
  if (err) {
    console.error("Error starting server:", err);
  } else {
    console.log("Server listening on PORT 8080");
  }
});
