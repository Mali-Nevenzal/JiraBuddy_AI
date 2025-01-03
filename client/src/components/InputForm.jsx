import React, { useState } from "react";
import { Box, TextField, Button, Typography, MenuItem, Select, InputLabel, FormControl } from "@mui/material";
import TaskPlanningDisplay from "./TaskPlanningDisplay";

const ProjectForm = () => {
    const [formData, setFormData] = useState({
        projectName: "",
        assignee: "",
        type: "",
        taskDescription: "",
    });

    const [error, setError] = useState(false);
    const [taskPlanning, setTaskPlanning] = useState("");
    const [loading, setLoading] = useState(false); // מצב של טעינה

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData({
            ...formData,
            [name]: value,
        });
        setError(false);
    };

    const handleSubmit = async () => {
        const { projectName, assignee, type, taskDescription } = formData;
        if (!projectName || !assignee || !type || !taskDescription) {
            setError(true);
            return;
        }

        setLoading(true);

        try {
            const result = await sendFormData();
            console.log("Form submitted successfully:", result);
        } catch (error) {
            console.error("Failed to submit form:", error);
        } finally {
            setLoading(false);
        }
    };

    const sendFormData = async () => {
        try {
            const response = await fetch("http://localhost:8081/ai", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error("Failed to submit form");
            }
            const result = await response.json();
            setTaskPlanning(result);
            console.log("Response:", result);
        } catch (error) {
            console.error("Error:", error);
            throw error;
        }
    };

    return (
        <>
            {taskPlanning == "" && !loading && <Box
                sx={{
                    backgroundColor: "white",
                    padding: 4,
                    borderRadius: 2,
                    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                    width: "50%",
                }}
            >
                <Typography variant="h4" gutterBottom align="center">
                    Fill in your project details
                </Typography>

                {/* Project Name */}
                <TextField
                    label="Project Name"
                    name="projectName"
                    variant="outlined"
                    fullWidth
                    value={formData.projectName}
                    onChange={handleChange}
                    required
                    sx={{ marginBottom: 2 }}
                />

                {/* Task Owner */}
                <TextField
                    label="Task Owner"
                    name="assignee"
                    variant="outlined"
                    fullWidth
                    value={formData.assignee}
                    onChange={handleChange}
                    required
                    sx={{ marginBottom: 2 }}
                />

                {/* Task Type Selector */}
                <FormControl fullWidth sx={{ marginBottom: 3 }} required>
                    <InputLabel>Task Type</InputLabel>
                    <Select
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        label="Task Type"
                    >
                        <MenuItem value="Project">Project</MenuItem>
                        <MenuItem value="Epic">Epic</MenuItem>
                        <MenuItem value="Task">Task</MenuItem>
                        <MenuItem value="Story">Story</MenuItem>
                    </Select>
                </FormControl>

                {/* Task Description */}
                <TextField
                    label="Task Description"
                    name="taskDescription"
                    multiline
                    rows={5}
                    variant="outlined"
                    fullWidth
                    value={formData.taskDescription}
                    onChange={handleChange}
                    required
                    sx={{ marginBottom: 2 }}
                />

                {/* Error Message */}
                {error && (
                    <Typography color="error" sx={{ marginBottom: 2 }}>
                        Please fill out all fields.
                    </Typography>
                )}

                {/* Submit Button */}
                <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={handleSubmit}
                >
                    Split into Tasks
                </Button>
            </Box>}

            {/* Loading message */}
            {loading && (
                <div>
                    <h3>Loading...</h3>
                </div>
            )}

            {/* Display Task Planning if data exists */}
            {taskPlanning !== "" && !loading && <TaskPlanningDisplay taskPlanning={taskPlanning} />}
        </>
    );
};

export default ProjectForm;
