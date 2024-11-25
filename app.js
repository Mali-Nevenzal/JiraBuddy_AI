// פרטי ההתחברות
const jiraBaseUrl = 'https://googlereichman.atlassian.net'; // החלף בכתובת ה-JIRA שלך
const email = 'shirap803@gmail.com'; // כתובת האימייל שלך ב-Atlassian
const apiToken = 'ATATT3xFfGF0ZM9vuYQXQyYVcGWtSluAWmFKzPF6rnHG0iHj9tLM-TPiwMV7BC0TAEjh-k6qIYDvAyzx_O1ViXmHmDjhkxzVTfMaE5ptoFyOOyCLorHY_HnpSXyUtQfNEqcYB5swMQjKMuuNXLVnBE4l7vPU-ElvnWwSBnt085UJE5qddcEfuSs=D68DBAEE'; // מפתח ה-API שלך

async function createJiraIssue(projectKey, summary, description, issueType) {
    try {
        const url = `${jiraBaseUrl}/rest/api/3/issue`;

        const payload = {
            fields: {
                project: {
                    key: projectKey,
                },
                summary: summary,
                description: description,
                issuetype: {
                    name: issueType,
                },
            },
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${Buffer.from(`${email}:${apiToken}`).toString('base64')}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error details:', errorData); // Log the full error response
            throw new Error(`Failed to create issue: ${response.status} - ${errorData.errorMessages}`);
        }

        const data = await response.json();
        console.log('Issue created successfully:', data);
    } catch (error) {
        console.error('Error creating issue:', error.message);
    }
}

const description = {
    "version": 1,
    "type": "doc",
    "content": [
        {
            "type": "paragraph",
            "content": [
                {
                    "type": "text",
                    "text": "Sari's wedding!!"
                }
            ]
        }
    ]
};

// קריאה לדוגמה לפונקציה
createJiraIssue(
    'SCRUM', // מפתח הפרויקט שלך
    'wedding',
     description,
    'Story' // סוג המשימה (לדוגמה: "Task", "Bug")
);
