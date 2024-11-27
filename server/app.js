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
    //console.log(quizResult);
    res.status(200).json(quizResult);
  } catch (error) {
    console.error('Error in /gemini route:', error.message);
    res.status(500).json({ error: "Failed to process the request" });
  }
});


app.post('/jira', async (req, res) => {
  try {
    const data = req.body; // קבלת המידע שנשלח מהלקוח

    // לוג להדפסת המידע המתקבל
    //console.log('Received data:', JSON.stringify(data, null, 2));

    if (!data) {
      return res.status(400).json({ error: "Invalid request format" });
    }

    const projectData = data; // או שהנתונים הם אובייקט יחיד ולא מערך
    const { Project, Assignee, children, Summary, Description } = projectData;
    console.log("MMMMMMMMMMMMMMMMMMMMMM"+"Project: "+Project+"Assignee: "+Assignee+"children: "+children+"Summary: "+Summary+"Description: "+Description)
    // אם לא קיים או לא מערך, החזר שגיאה
    if (!Array.isArray(children)) {
      return res.status(400).json({ error: "Children is not iterable (must be an array)" });
    }

    // יצירת פרויקט ראשי
    const projectKey = await createJiraIssue(Project, 'Project', Summary, Description, Assignee);
    //console.log('Created Project with key:', projectKey);

    // שמירת כל המפתחות של המשימות שנוצרו כדי למנוע יצירה כפולה
    const createdIssues = new Set([projectKey]); // Include project key to avoid duplications

    // יצירת EPICs, STORIES ו-TASKS תחת ה-Project
    for (const epic of children) {
      const epicKey = await createJiraIssue(epic.Project, 'Epic', epic.Summary, epic.Description, epic.Assignee);
      //console.log('Created Epic with key:', epicKey);
      createdIssues.add(epicKey); // Add EPIC key to createdIssues

      if (epic.children && Array.isArray(epic.children)) {
        // עבור כל STORY ו-TASK תחת ה-EPIC
        for (const issue of epic.children) {
          const issueType = issue['Issue type'] === 'Story' ? 'Story' : 'Task';
          if (!createdIssues.has(issue.Summary)) { // אם המשימה לא נוצרה עדיין
            const issueKey = await createJiraIssue(issue.Project, issueType, issue.Summary, issue.Description, issue.Assignee, epicKey);
            //console.log(`${issueType} created with key:`, issueKey);
            createdIssues.add(issue.Summary); // להוסיף את סיכום המשימה כדי למנוע כפילות
          }
        }
      }
    }

    // עבור על כל המשימות שלא תחת EPIC
    for (const issue of children) {
      const issueType = issue['Issue type'] === 'Story' ? 'Story' : 'Task';
      if (!createdIssues.has(issue.Summary)) { // אם המשימה לא נוצרה עדיין
        const issueKey = await createJiraIssue(issue.Project, issueType, issue.Summary, issue.Description, issue.Assignee);
        //console.log(`${issueType} created with key:`, issueKey);
        createdIssues.add(issue.Summary); // להוסיף את סיכום המשימה כדי למנוע כפילות
      }
    }

    // שליחת תשובה חיובית אם כל המשימות נוספו בהצלחה
    res.status(200).json({ message: 'Issues created successfully!' });

  } catch (error) {
    //console.error('Error in /jira route:', error.message);
    res.status(500).json({ error: "Failed to process the request", details: error.message });
  }
});


// app.post('/jira', async (req, res) => {
//   try {
//     const data = req.body; // קבלת המידע שנשלח מהלקוח

//     if (!data || !Array.isArray(data)) {
//       return res.status(400).json({ error: "Invalid request format" });
//     }

//     // עבור על כל האובייקטים שמתקבלים
//     for (const projectData of data) {
//       const { Project, Assignee, Parent, Stories, Summary, Description } = projectData;

//       // יצירת Epic
//       const epicKey = await createJiraIssue(Project, 'Epic', Summary, Description, Assignee);

//       // עבור על כל סיפור (Story)
//       for (const story of Stories) {
//         console.log("mali" +"epicKEY:"+epicKey+"")
//         const storyKey = await createJiraIssue(story.Project, 'Story', story.Summary, story.Description, story.Assignee, story.Parent);

//         // עבור על כל משימה (Task) בתוך הסיפור
//         for (const task of story.Tasks) {
//           const taskKey = await createJiraIssue(task.Project, 'Task', task.Summary, task.Description, task.Assignee);

//           // עבור על כל Sub-task בתוך המשימה
//           if (task['Sub-tasks']) {
//             for (const subTask of task['Sub-tasks']) {
//               await createJiraIssue(subTask.Project, 'Sub-task', subTask.Summary, subTask.Description, subTask.Assignee);
//             }
//           }
//         }
//       }
//     }

//     // שליחת תשובה חיובית אם כל המשימות נוספו בהצלחה
//     res.status(200).json({ message: 'Issues created successfully!' });

//   } catch (error) {
//     console.error('Error in /jira route:', error.message);
//     res.status(500).json({ error: "Failed to process the request" });
//   }
// });


// הפעלת השרת
app.listen(8081, (err) => {
  if (err) {
    console.error("Error starting server:", err);
  } else {
    console.log("Server listening on PORT 8081");
  }
});
