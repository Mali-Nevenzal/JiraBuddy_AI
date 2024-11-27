import "./TaskPlanningDisplay.css";
import JiraIntegration from "./JiraIntegration";
import { useState } from "react";

const TaskPlanningDisplay = ({ taskPlanning }) => {
    const [sendToJira, setSendToJira] = useState(false);

    const renderTree = (task) => {
        if (!task) return null;

        return (
            <div className="node">
                <div className={`node-content ${task["Issue type"].toLowerCase()}`}>
                    <img
                        src={getTypeImage(task["Issue type"])}
                        alt={`${task["Issue type"]} icon`}
                        className="task-icon"
                    />
                    <strong>{task.Summary}</strong> ({task["Issue type"]})
                    <p>{task.Description}</p>
                </div>
                {task.children && task.children.length > 0 && (
                    <ul className="tree-level">
                        {task.children.map((child) => (
                            <li key={child.id}>{renderTree(child)}</li>
                        ))}
                    </ul>
                )}
            </div>
        );
    };

    const getTypeImage = (type) => {
        const typeImages = {
            project: "https://googlereichman.atlassian.net/rest/api/2/universal_avatar/view/type/project/avatar/10422?size=medium",
            epic: "https://googlereichman.atlassian.net/rest/api/2/universal_avatar/view/type/issuetype/avatar/10307?size=medium",
            story: "https://googlereichman.atlassian.net/rest/api/2/universal_avatar/view/type/issuetype/avatar/10315?size=medium",
            task: "https://googlereichman.atlassian.net/rest/api/2/universal_avatar/view/type/issuetype/avatar/10318?size=medium",
        };
        return typeImages[type.toLowerCase()] || "";
    };

    return (
        <>
            <button className="button-Add-to-Jira"onClick={() => setSendToJira(true)}>Add Tasks to your JIRA project.</button>
            {sendToJira && <JiraIntegration taskPlanning={taskPlanning} />}
            <div className="task-planning-container">
                {renderTree(taskPlanning)}
            </div>
        </>
    );
};

export default TaskPlanningDisplay;

