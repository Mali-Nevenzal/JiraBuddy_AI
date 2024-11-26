// import "./TaskPlanningDisplay.css";
// import JiraIntegration from "./JiraIntegration";

// const TaskPlanningDisplay = ({ taskPlanning }) => {
  
//     const renderTaskPlanning = (result) => {
//         const platePlan = result.PlatePlan && Array.isArray(result.PlatePlan) ? result.PlatePlan : [];

//         let output = [];
//         const seen = new Set(); // Set to track unique elements based on their unique ID

//         const renderProjectHierarchy = (project, level = 0) => {
//             const projectId = `${project.Project}-${project["Issue type"]}-${project.Summary}`;

//             // Skip if the project is already processed
//             if (seen.has(projectId)) return null;
//             seen.add(projectId);

//             const projectData = {
//                 name: project.Summary,
//                 type: project["Issue type"],
//                 children: [],
//                 level: level,
//                 id: projectId,
//             };

//             // Process children only if they exist and are an array
//             if (project.children && Array.isArray(project.children)) {
//                 project.children.forEach((child) => {
//                     const childData = renderProjectHierarchy(child, level + 1);
//                     if (childData) {
//                         projectData.children.push(childData);
//                     }
//                 });
//             }

//             return projectData;
//         };

//         // Process the main task plan or individual project
//         if (platePlan.length > 0) {
//             platePlan.forEach((project) => {
//                 const projectData = renderProjectHierarchy(project);
//                 if (projectData) {
//                     output.push(projectData);
//                 }
//             });
//         } else if (result.Project) {
//             const projectData = renderProjectHierarchy(result);
//             if (projectData) {
//                 output.push(projectData);
//             }
//         }

//         return output;
//     };

//     const renderTree = (node) => {
//         return (
//             <div key={node.id} className={`node level-${node.level}`}>
//                 <div className={`node-content ${node.type.toLowerCase()}`}>
//                     <strong>{node.name}</strong> ({node.type})
//                 </div>
//                 {node.children.length > 0 && (
//                     <div className="children">
//                         {node.children.map((child) => renderTree(child))}
//                     </div>
//                 )}
//             </div>
//         );
//     };

//     return (
//     <>
//         <div className="task-planning-container">
//             {renderTaskPlanning(taskPlanning).map((rootNode) => renderTree(rootNode))}
//         </div>
//         <button>Add Tasks to your JIRA project.</button>
//         {<JiraIntegration taskPlanning={taskPlanning} />}

//     </>
//     );
// };

// export default TaskPlanningDisplay;


import "./TaskPlanningDisplay.css";
import JiraIntegration from "./JiraIntegration";

const TaskPlanningDisplay = ({ taskPlanning }) => {

    const[sendToJira,setSendToJira] = (false);
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

    const renderTree = (nodes, level) => {
        if (!nodes || nodes.length === 0) return null;

        return (
            <div className={`level-${level} tree-level`}>
                {nodes.map((node) => (
                    <div key={node.id} className="node">
                        <div className={`node-content ${node.type.toLowerCase()}`}>
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
