import express from 'express';
import cors from 'cors';
import { generateQuiz } from './AIIntegration.js';

const app = express();
app.use(cors());
app.use(express.json());

// מסלול לטיפול בבקשות ל-Gemini
app.post('/ai', async (req, res) => {
  console.log("aaa");
  try {
    // חילוץ השדות מהבקשה
    const { projectName, assignee, type, taskDescription } = req.body;

    // בדיקת תקינות השדות
    if (!taskDescription || !type || !assignee || !projectName) {
      return res.status(400).json({ error: "Missing required fields: taskDescription, type, assignee, projectName" });
    }

    // קריאה לפונקציה generateQuiz עם הפרמטרים
    const quizResult = await generateQuiz(taskDescription, type, assignee, projectName);

    // שליחת התוצאה בחזרה ללקוח
    console.log(quizResult);
    res.status(200).json(quizResult);
  } catch (error) {
    console.error('Error in /gemini route:', error.message);
    res.status(500).json({ error: "Failed to process the request" });
  }
});

// הפעלת השרת
app.listen(8081, (err) => {
  if (err) {
    console.error("Error starting server:", err);
  } else {
    console.log("Server listening on PORT 8081");
  }
});
