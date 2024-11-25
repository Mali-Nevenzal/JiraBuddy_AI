import React, { useState } from "react";
import { Box, TextField, Button, Typography, MenuItem, Select, InputLabel, FormControl } from "@mui/material";

const ProjectForm = () => {
  const [formData, setFormData] = useState({
    projectName: "",
    taskOwner: "",
    taskType: "",
    taskDescription: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = () => {
    console.log("Form Data:", formData);
    // ניתן להוסיף כאן לוגיקה לשליחת הנתונים לשרת
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: 4,
        backgroundColor: "#f5f5f5",
      }}
    >
      <Box
        sx={{
          backgroundColor: "white",
          padding: 4,
          borderRadius: 2,
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
          width: "50%",
        }}
      >
        <Typography variant="h4" gutterBottom align="center">
          Project Task Form
        </Typography>

        {/* Project Name */}
        <TextField
          label="Project Name"
          name="projectName"
          variant="outlined"
          fullWidth
          value={formData.projectName}
          onChange={handleChange}
          sx={{ marginBottom: 3 }}
        />

        {/* Task Owner */}
        <TextField
          label="Task Owner"
          name="taskOwner"
          variant="outlined"
          fullWidth
          value={formData.taskOwner}
          onChange={handleChange}
          sx={{ marginBottom: 3 }}
        />

        {/* Task Type Selector */}
        <FormControl fullWidth sx={{ marginBottom: 3 }}>
          <InputLabel>Task Type</InputLabel>
          <Select
            name="taskType"
            value={formData.taskType}
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
          rows={6}
          variant="outlined"
          fullWidth
          value={formData.taskDescription}
          onChange={handleChange}
          sx={{ marginBottom: 3 }}
        />

        {/* Submit Button */}
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleSubmit}
        >
          Submit
        </Button>
      </Box>
    </Box>
  );
};

export default ProjectForm;
