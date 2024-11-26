import "./TaskPlanningDisplay.css";

const TaskPlanningDisplay = ({ taskPlanning }) => {
    const renderTaskPlanning = (result) => {
        const platePlan = result.PlatePlan && Array.isArray(result.PlatePlan) ? result.PlatePlan : [];

        let output = [];

        const renderProjectHierarchy = (project, level = 0) => {
            const projectData = {
                name: project.Summary,
                type: project["Issue type"],
                children: [],
                level: level,
                id: `${project.Project}-${project["Issue type"]}-${project.Summary}`,
            };

            if (project.children && Array.isArray(project.children) && project.children.length > 0) {
                project.children.forEach((child) => {
                    const childData = renderProjectHierarchy(child, level + 1);
                    projectData.children.push(childData);
                });
            }

            output.push(projectData);
            return projectData;
        };

        if (platePlan.length > 0) {
            platePlan.forEach((project) => {
                renderProjectHierarchy(project);
            });
        } else {
            if (result.Project) {
                renderProjectHierarchy(result);
            }
        }

        return output;
    };

    const renderTree = (node) => {
        return (
            <div key={node.id} className={`node level-${node.level}`}>
                <div className={`node-content ${node.type.toLowerCase()}`}>
                    <strong>{node.name}</strong> ({node.type})
                </div>
                {node.children.length > 0 && (
                    <div className="children">
                        {node.children.map((child) => renderTree(child))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="task-planning-container">
            {renderTaskPlanning(taskPlanning).map((rootNode) => renderTree(rootNode))}
        </div>
    );
};

export default TaskPlanningDisplay;
