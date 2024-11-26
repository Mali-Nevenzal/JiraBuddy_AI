import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

export const generateQuiz = async (taskDescription, type, assignee, projectName) => {
  const genAI = new GoogleGenerativeAI(process.env.API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const prompt = `
The user wants to plan a project/task. The goal is to return a hierarchical breakdown of tasks and subtasks that would be suitable for a project management system like JIRA. The AI should return its response in **valid JSON format**.

The user will input a description of the task or project ${taskDescription}, the type ${type}, the assignee ${assignee}, and the project name ${projectName}. Based on the ${type}, which indicates the level of granularity (e.g., Project, Epic, Story, Task), the AI should break it down into Epics, Stories, Tasks, and Sub-tasks with detailed descriptions for each task.

If the ${type} is 'Project', return the full breakdown of tasks and subtasks for the project (Epics, Stories, Tasks, Sub-tasks). If the ${type} is any other value (Epic, Story, Task), return the breakdown for that specific level.

For each task, story, sub-task, etc., the AI should return the following details in **valid JSON format**:

{
  "Project": "${projectName}",
  "Issue type": "Epic / Story / Task / Sub-task",
  "Summary": "Summary of the task",
  "Description": "Description of the task",
  "Assignee": "${assignee}",
  "Parent": "Parent issue ID or null",
  "children": [
    {
      "Project": "Project name of the child",
      "Issue type": "Epic / Story / Task / Sub-task",
      "Summary": "Summary of the child task",
      "Description": "Description of the child task",
      "Assignee": "Assignee of the child task",
      "Parent": "Parent issue ID of the child (use null if no parent)",
      "children": [...]
    }
  ]
}

- If there are no sub-tasks or child issues, the "children" field should be an empty array: "children": [].
- Ensure that the JSON format is strictly followed with proper keys and values.
- Each task can have nested tasks, so ensure that the hierarchy is preserved from Project -> Epic -> Story -> Task -> Sub-task.
- Ensure that the Project, Issue type, Summary, Description, Assignee, and Parent fields are always included.

Please respond with the breakdown of the project in a **valid, parsable JSON format** that matches the JIRA structure, making sure to include all relevant details for each task level, even if some fields are missing for specific tasks (in that case, use null for missing fields).

Here is the task/project you need to break down:
Project Name: ${projectName}
Project/Task Description: ${taskDescription}
Type: ${type}
Assignee: ${assignee}
`;

  try {
    const result = await model.generateContent(prompt);
    let generatedText = result.response.text();

    // Remove non-JSON elements such as code fences
    generatedText = generatedText.replace(/```json|```/g, '').trim();

    // Parse cleaned text into JSON
    let quizData;
    try {
      quizData = JSON.parse(generatedText);
    } catch (parseError) {
      console.error('Error parsing generated text to JSON:', parseError);
      throw new Error('Invalid JSON format received from AI');
    }

    console.log(quizData);
    return quizData;
  } catch (error) {
    console.error('Error generating quiz:', error);
    throw new Error('Failed to generate quiz');
  }
};