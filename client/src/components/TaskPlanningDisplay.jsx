import "./TaskPlanningDisplay.css";
import JiraIntegration from "./JiraIntegration";
import { useState } from "react";

const TaskPlanningDisplay = ({ taskPlanning }) => {

    const [sendToJira,setSendToJira] = useState(false);

    const renderTaskPlanning = (result) => {
        const platePlan = result.PlatePlan && Array.isArray(result.PlatePlan) ? result.PlatePlan : [];

        let output = [];
        const seen = new Set(); // Set to track unique elements based on their unique ID

        const renderProjectHierarchy = (project, level = 0) => {
            const projectId = `${project.Project}-${project["Issue type"]}-${project.Summary}`;

            // Skip if the project is already processed
            if (seen.has(projectId)) return null;
            seen.add(projectId);

            const projectData = {
                name: project.Summary,
                type: project["Issue type"],
                children: [],
                level: level,
                id: projectId,
            };

            // Process children only if they exist and are an array
            if (project.children && Array.isArray(project.children)) {
                project.children.forEach((child) => {
                    const childData = renderProjectHierarchy(child, level + 1);
                    if (childData) {
                        projectData.children.push(childData);
                    }
                });
            }

            return projectData;
        };

        // Process the main task plan or individual project
        if (platePlan.length > 0) {
            platePlan.forEach((project) => {
                const projectData = renderProjectHierarchy(project);
                if (projectData) {
                    output.push(projectData);
                }
            });
        } else if (result.Project) {
            const projectData = renderProjectHierarchy(result);
            if (projectData) {
                output.push(projectData);
            }
        }

        return output;
    };

    // const renderTree = (nodes, level) => {
    //     if (!nodes || nodes.length === 0) return null;

    //     return (
    //         <div className={`level-${level} tree-level`}>
    //             {nodes.map((node) => (
    //                 <div key={node.id} className="node">
    //                     <div className={`node-content ${node.type.toLowerCase()}`}>
    //                         <strong>{node.name}</strong> ({node.type})
    //                     </div>
    //                     {node.children.length > 0 && renderTree(node.children, level + 1)}
    //                 </div>
    //             ))}
    //         </div>
    //     );
    // };

    const renderTree = (nodes, level) => {
        if (!nodes || nodes.length === 0) return null;
    
        // Map images based on task type
        const typeImages = {
            project: "https://googlereichman.atlassian.net/rest/api/2/universal_avatar/view/type/project/avatar/10422?size=medium",
            epic: "https://googlereichman.atlassian.net/rest/api/2/universal_avatar/view/type/issuetype/avatar/10307?size=medium",
            story: "https://googlereichman.atlassian.net/rest/api/2/universal_avatar/view/type/issuetype/avatar/10315?size=medium",
            task: "https://googlereichman.atlassian.net/rest/api/2/universal_avatar/view/type/issuetype/avatar/10318?size=medium",
        };
    
        return (
            <div className={`level-${level} tree-level`}>
                {nodes.map((node) => (
                    <div key={node.id} className="node">
                        <div className={`node-content ${node.type.toLowerCase()}`}>
                            <img 
                                src={typeImages[node.type.toLowerCase()]} 
                                alt={`${node.type} icon`} 
                                className="task-icon" 
                            />
                            <strong>{node.name}</strong> ({node.type})
                        </div>
                        {node.children.length > 0 && renderTree(node.children, level + 1)}
                    </div>
                ))}
            </div>
        );
    };
    
    return (
    <>
        <div className="task-planning-container">
            {renderTaskPlanning(taskPlanning).map((rootNode) => renderTree([rootNode], 0))}
        </div>
        <button onClick={() => setSendToJira(true)}>Add Tasks to your JIRA project.</button>
        {sendToJira && <JiraIntegration taskPlanning={taskPlanning} />}
    </>
    );
};

export default TaskPlanningDisplay;
