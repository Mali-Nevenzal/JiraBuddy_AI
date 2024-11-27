import dotenv from 'dotenv';
dotenv.config();


// פונקציה ליצירת משימה חדשה ב-JIRA
export async function createJiraIssue(projectKey, issueType, summary, Description,assignee) {
    try {
        const url = `${process.env.JIRA_BASE_URL}/rest/api/3/issue`;

        const ADFDescription = {
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

        // יצירת הפלט (Payload) שנשלח ל-JIRA
        const payload = {
            fields: {
                project: {
                    key: projectKey, // מפתח הפרויקט
                },
                summary: summary, // סיכום המשימה
                description: description, // תיאור המשימה - טקסט פשוט
                issuetype: {
                    name: issueType, // סוג המשימה (Epic, Story, Task, Sub-task)
                },
                assignee: {
                    name: assignee, // המוקצה למשימה
                },
            },
        };

        // אם יש Parent (הורה) למשל אם מדובר ב-Sub-task או Task
        // if (parentKey) {
        //     payload.fields.parent = { key: parentKey };
        // }

        // לוג: הצגת הנתונים שנשלחים ל-JIRA
        console.log('Payload being sent to JIRA:', JSON.stringify(payload, null, 2));

        // קריאת ה-API ב-JIRA
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${Buffer.from(`${process.env.JIRA_USER_MAIL}:${process.env.JIRA_API_TOKEN}`).toString('base64')}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        // לוג: הצגת התגובה מ-JIRA
        const data = await response.json();
        console.log('JIRA Response:', data);

        if (!response.ok) {
            throw new Error(`Failed to create issue: ${response.status} - ${data.errorMessages}`);
        }

        // אם הכל הצליח, מחזירים את מפתח המשימה שנוצרה
        console.log(`${issueType} created successfully:`, data);
        return data.key; // מחזיר את המפתח של המשימה שנוצרה

    } catch (error) {
        console.error('Error creating issue:', error.message);
    }
}

