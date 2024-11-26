import React, { useState, useEffect } from "react";

const JiraIntegration = ({ taskPlanning }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendFormData = async () => {
    setLoading(true); // הגדרת מצב טעינה
    setError(null); // מחיקת שגיאות קודמות

    try {
      const response = await fetch("http://localhost:8081/jira", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskPlanning), // שליחה של המידע שנקבל
      });

      if (!response.ok) {
        throw new Error("Failed to submit form to Jira");
      }

      const result = await response.json();
      console.log("Jira Integration Response:", result);

      // במידה והייתה שגיאה, עדכן את ה-state
      if (result.error) {
        setError(result.error);
      } else {
        console.log("Issues successfully created in Jira:", result);
      }
    } catch (error) {
      console.error("Error during Jira integration:", error);
      setError("There was an error while integrating with Jira");
    } finally {
      setLoading(false); // סיום מצב טעינה
    }
  };

  // ברגע ש-taskPlanning משתנה, נשלח את הנתונים ל-Jira
  useEffect(() => {
    if (taskPlanning !== "") {
      sendFormData();
    }
  }, [taskPlanning]); // תלות ב-taskPlanning

  return (
    <>
      {loading && (
        <div>
          <h3>Loading...</h3> {/* הודעת טעינה */}
        </div>
      )}

      {error && (
        <div style={{ color: "red" }}>
          <h3>{error}</h3> {/* הצגת הודעת שגיאה */}
        </div>
      )}

      {!loading && !error && taskPlanning && (
        <div>
          <h3>Jira Integration Complete!</h3>
          {/* תוכל להוסיף עוד פרטים אם רוצים להציג תשובה מסויימת */}
        </div>
      )}
    </>
  );
};

export default JiraIntegration;
