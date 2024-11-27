import React, { useState, useEffect } from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

const JiraIntegration = ({ taskPlanning }) => {

  const [sendToJira, setSendToJira] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false); // State for Snackbar
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState("success"); // Default severity

  const sendFormData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:8081/jira", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskPlanning),
      });

      if (!response.ok) {
        throw new Error("Failed to submit form to Jira");
      }

      const result = await response.json();
      console.log("Jira Integration Response:", result);

      if (result.error) {
        setError(result.error);
        setMessage(result.error);
        setSeverity("error");
        setOpen(true); // Show Snackbar for error
      } else {
        console.log("Issues successfully created in Jira:", result);
        setMessage("Your tasks were successfully created in Jira!");
        setSeverity("success");
        setOpen(true); // Show Snackbar for success
      }
    } catch (error) {
      console.error("Error during Jira integration:", error);
      setError("There was an error while integrating with Jira");
      setMessage("There was an error while integrating with Jira");
      setSeverity("error");
      setOpen(true); // Show Snackbar for error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sendToJira) {
      sendFormData();
    }
  }, [sendToJira]);

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  return (
    <>
      <button className="button-Add-to-Jira" onClick={() => setSendToJira(true)}>Add Tasks to your JIRA project.</button>
      {loading && (
        <div>
          <h3>Loading...</h3>
        </div>
      )}

      {error && (
        <div style={{ color: "red" }}>
          <h3>{error}</h3>
        </div>
      )}

      <Snackbar
        open={open}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleClose}
          severity={severity}
          sx={{ width: "100%", fontSize: "1rem" }}
        >
          {message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default JiraIntegration;
