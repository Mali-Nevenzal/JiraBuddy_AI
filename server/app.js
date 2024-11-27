import express from 'express';
import cors from 'cors';
import { generateQuiz } from './AIIntegration.js';
import { createJiraIssue } from './JIRAIntegration.js';
const app = express();
app.use(cors());
app.use(express.json());

// מסלול לטיפול בבקשות ל-Gemini
app.post('/ai', async (req, res) => {
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
    res.status(200).json(quizResult);
  } catch (error) {
    console.error('Error in /gemini route:', error.message);
    res.status(500).json({ error: "Failed to process the request" });
  }
});

app.post('/jira', async (req, res) => {
  try {
    const data = req.body;

    if (!data) {
      return res.status(400).json({ error: "Invalid request format" });
    }
    const { Project, Assignee, children, Summary, Description } = data;

    if (!Array.isArray(children)) {
      return res.status(400).json({ error: "Children is not iterable (must be an array)" });
    }

    // יצירת פרויקט ראשי
    const projectKey = await createJiraIssue(Project, 'Project', Summary, Description, Assignee);

    const createdIssues = new Set([projectKey]);

    // פונקציה רקורסיבית ליצירת EPICs, STORIES ו-TASKS
    async function processIssues(issues, parentKey = null) {
      for (const issue of issues) {
        const issueType = issue['Issue type'] || 'Task';
        const issueParentKey = issueType === 'Epic' ? null : parentKey || projectKey; // EPICs לא צריכים הורה

        // אם המשימה לא נוצרה עדיין
        if (!createdIssues.has(issue.Summary)) {
          const issueKey = await createJiraIssue(
            issue.Project,
            issueType,
            issue.Summary,
            issue.Description,
            issue.Assignee,
            issueParentKey
          );

          createdIssues.add(issue.Summary); // הוספה למעקב למניעת כפילות

          // אם יש ילדים, להריץ את הפונקציה עליהם
          if (issue.children && Array.isArray(issue.children)) {
            await processIssues(issue.children, issueKey);
          }
        }
      }
    }

    // יצירת EPICs ראשית, ואז סיפורים ומשימות
    const epics = children.filter(child => child['Issue type'] === 'Epic');
    const nonEpics = children.filter(child => child['Issue type'] !== 'Epic');

    // תהליך יצירת ה-EPICs
    await processIssues(epics);

    // תהליך יצירת המשימות והסיפורים
    await processIssues(nonEpics);

    res.status(200).json({ message: 'Issues created successfully!' });
  } catch (error) {
    res.status(500).json({ error: "Failed to process the request", details: error.message });
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
