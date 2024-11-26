import express from 'express';
import cors from 'cors';
import { generateQuiz } from './AIIntegration.js';
import { createJiraIssue } from './JIRAIntegration.js';
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


app.post('/jira', async (req, res) => {
  try {
    const data = req.body; // קבלת המידע שנשלח מהלקוח

    if (!data || !Array.isArray(data)) {
      return res.status(400).json({ error: "Invalid request format" });
    }

    // עבור על כל האובייקטים שמתקבלים
    for (const projectData of data) {
      const { Project, Assignee, Parent, Stories, Summary, Description } = projectData;

      // יצירת Epic
      const epicKey = await createJiraIssue(Project, 'Epic', Summary, Description, Assignee, Parent);

      // עבור על כל סיפור (Story)
      for (const story of Stories) {
        const storyKey = await createJiraIssue(story.Project, 'Story', story.Summary, story.Description, story.Assignee, story.Parent);

        // עבור על כל משימה (Task) בתוך הסיפור
        for (const task of story.Tasks) {
          const taskKey = await createJiraIssue(task.Project, 'Task', task.Summary, task.Description, task.Assignee, task.Parent);

          // עבור על כל Sub-task בתוך המשימה
          if (task['Sub-tasks']) {
            for (const subTask of task['Sub-tasks']) {
              await createJiraIssue(subTask.Project, 'Sub-task', subTask.Summary, subTask.Description, subTask.Assignee, subTask.Parent);
            }
          }
        }
      }
    }

    // שליחת תשובה חיובית אם כל המשימות נוספו בהצלחה
    res.status(200).json({ message: 'Issues created successfully!' });

  } catch (error) {
    console.error('Error in /jira route:', error.message);
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
