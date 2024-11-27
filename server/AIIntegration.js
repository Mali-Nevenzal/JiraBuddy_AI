import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

export const generateQuiz = async (taskDescription, type, assignee, projectName) => {
  const genAI = new GoogleGenerativeAI(process.env.API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  
const prompt = `
The user wants to plan a project/task for a system like JIRA. The response must return a hierarchical breakdown of tasks and subtasks in **valid JSON format** that matches the specified structure and rules below.

### Structure Rules:
1. A **Project** contains **EPICs**, **TASKS**, and/or **STORIES**:
   - **EPIC**: A large task that can be split into smaller tasks (children).  
   - **TASK**: A specific and focused task related to functionality or requirements.  
   - **STORY**: A technical or general task needed for the project.  

2. **EPIC** tasks may contain **TASKS** and/or **STORIES** as direct children.  
3. **TASKS** and **STORIES** cannot contain children.  

4. **TASKS** and **STORIES** can belong to the **Project** directly (i.e., without being part of an EPIC).  

5. Every task must include these fields:
   - "Project": Name of the project.
   - "Issue type": Either "Project", "Epic", "Task", or "Story".
   - "Summary": A brief title for the task.
   - "Description": A description of the task.
   - "Assignee": The person assigned to the task (or null if unassigned).
   - "Parent": The parent issue (or null for top-level tasks).
   - "children": An array of child tasks (empty for leaf tasks).

### Input Details:
- The user will provide:
  - Project Name: \`${projectName}\`
  - Project/Task Description: \`${taskDescription}\`
  - Type: \`${type}\` (e.g., Project, Epic, Task, Story)
  - Assignee: \`${assignee}\`

- If the type is "Project", provide the full hierarchy of EPICs, TASKS, and STORIES.  
- If the type is "Epic", "Task", or "Story", provide the breakdown for that level only.

- Example Output:
\`\`\`json
{
  "Project": "Example Project",
  "Issue type": "Project",
  "Summary": "Example Summary",
  "Description": "Example Description",
  "Assignee": null,
  "Parent": null,
  "children": [
    {
      "Project": "Example Project",
      "Issue type": "Epic",
      "Summary": "Epic Summary",
      "Description": "Epic Description",
      "Assignee": "Example Assignee",
      "Parent": null,
      "children": [
        {
          "Project": "Example Project",
          "Issue type": "Task",
          "Summary": "Task Summary",
          "Description": "Task Description",
          "Assignee": "Example Assignee",
          "Parent": "Epic ID",
          "children": []
        },
        {
          "Project": "Example Project",
          "Issue type": "Story",
          "Summary": "Story Summary",
          "Description": "Story Description",
          "Assignee": "Example Assignee",
          "Parent": "Epic ID",
          "children": []
        }
      ]
    }
  ]
}
\`\`\`

Please generate a **valid JSON** object that follows these rules for the input provided:
- Project Name: \`${projectName}\`
- Project Description: \`${taskDescription}\`
- Type: \`${type}\`
- Assignee: \`${assignee}\`
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
