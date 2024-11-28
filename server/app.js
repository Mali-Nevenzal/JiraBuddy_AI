import express from 'express';
import cors from 'cors';
import { generateQuiz } from './AIIntegration.js';
import { createJiraIssue } from './JIRAIntegration.js';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/ai', async (req, res) => {
  try {
    // Extract fields from the request
    const { projectName, assignee, type, taskDescription } = req.body;

    // Validate the required fields
    if (!taskDescription || !type || !assignee || !projectName) {
      return res.status(400).json({ error: "Missing required fields: taskDescription, type, assignee, projectName" });
    }

    // Call the generateQuiz function with the provided parameters
    const quizResult = await generateQuiz(taskDescription, type, assignee, projectName);

    // Send the result back to the client
    res.status(200).json(quizResult);
  } catch (error) {
    console.error('Error in /ai route:', error.message);
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

    const projectKey = await createJiraIssue(Project, 'Project', Summary, Description, Assignee);

    const createdIssues = new Set([projectKey]);

    // Recursive function to create EPICs, STORIES, and TASKS
    async function processIssues(issues, parentKey = null) {
      for (const issue of issues) {
        const issueType = issue['Issue type'] || 'Task';
        const issueParentKey = issueType === 'Epic' ? null : parentKey || projectKey; // EPICs do not need a parent

        // If the issue has not been created yet
        if (!createdIssues.has(issue.Summary)) {
          const issueKey = await createJiraIssue(
            issue.Project,
            issueType,
            issue.Summary,
            issue.Description,
            issue.Assignee,
            issueParentKey
          );

          createdIssues.add(issue.Summary); // Add to tracking to avoid duplicates

          // If there are children, process them recursively
          if (issue.children && Array.isArray(issue.children)) {
            await processIssues(issue.children, issueKey);
          }
        }
      }
    }

    // Create EPICs first, followed by STORIES and TASKS
    const epics = children.filter(child => child['Issue type'] === 'Epic');
    const nonEpics = children.filter(child => child['Issue type'] !== 'Epic');

    // Process EPIC creation
    await processIssues(epics);

    // Process task and story creation
    await processIssues(nonEpics);

    res.status(200).json({ message: 'Issues created successfully!' });
  } catch (error) {
    res.status(500).json({ error: "Failed to process the request", details: error.message });
  }
});

// Start the server
app.listen(8081, (err) => {
  if (err) {
    console.error("Error starting server:", err);
  } else {
    console.log("Server listening on PORT 8081");
  }
});
