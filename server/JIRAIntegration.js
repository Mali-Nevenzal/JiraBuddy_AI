import dotenv from 'dotenv';
dotenv.config();

// Function to create a new issue in JIRA
export async function createJiraIssue(projectKey, issueType, summary, Description, assignee) {
    try {
        const url = `${process.env.JIRA_BASE_URL}/rest/api/3/issue`;

        const description = {
            "version": 1,
            "type": "doc",
            "content": [
                {
                    "type": "paragraph",
                    "content": [
                        {
                            "type": "text",
                            "text": Description
                        }
                    ]
                }
            ]
        };

        // Construct the payload to be sent to JIRA
        const payload = {
            fields: {
                project: {
                    key: projectKey, // Project key
                },
                summary: summary, // Task summary
                description: description, // Task description in plain text
                issuetype: {
                    name: issueType, // Issue type (Epic, Story, Task, Sub-task)
                },
                assignee: {
                    name: assignee, // Assignee for the task
                },
            },
        };

        // API call to JIRA
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${Buffer.from(`${process.env.JIRA_USER_MAIL}:${process.env.JIRA_API_TOKEN}`).toString('base64')}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        // Log: Display the response from JIRA
        const data = await response.json();
        console.log('JIRA Response:', data);

        if (!response.ok) {
            throw new Error(`Failed to create issue: ${response.status} - ${data.errorMessages}`);
        }

        // If successful, return the key of the created issue
        console.log(`${issueType} created successfully:`, data);
        return data.key; // Return the key of the created issue

    } catch (error) {
        console.error('Error creating issue:', error.message);
    }
}
