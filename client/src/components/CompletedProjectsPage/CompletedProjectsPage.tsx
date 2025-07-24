// CLEAN ++ CHECKED
import type { ProjectFormData, ProjectViewData } from "../types";
import { useState, useEffect } from "react";
import ProjectsList from "../ProjectsList/ProjectsList";
import dayjs from "dayjs";
import './completedProjectsPage.css'
import SubtaskModal from "../SubtaskModal/SubtaskModal";
export default function CompletedProjectsPage() {
    const [completedProjects, setCompletedProjects] = useState<ProjectFormData[]>([]);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewTask, setViewTask] = useState<ProjectViewData | null>(null);


    useEffect(() => {
        const fetchTasks = async () => {
            const token = sessionStorage.getItem('token');
            if (!token) {
                console.log('Token is expired');
                return;
            }
            try {
                const response = await fetch('http://localhost:3000/getTasks', {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (!response.ok) {
                    console.log('Failed to fetch data!')
                    return;
                }
                const data = await response.json();

                const mappedTasks = await data.map((task: any) => ({
                    id: task._id,
                    name: task.projectName,
                    description: task.projectDescription,
                    priority: task.projectPriority,
                    status: task.projectStatus ?? 'todo',
                    date: task.projectDate,
                    deadline: task.projectDeadline,
                    assignedUser: task.projectAssignedUser,
                }));

                const doneProjects = mappedTasks.filter((p: ProjectFormData) => p.status === "done");
                setCompletedProjects(doneProjects)
            } catch (error) {
                console.error('Error:', error);
            }
        }
        fetchTasks();
    }, []);

    const handleDelete = (id: string) => {
        const updatedProjects = completedProjects.filter((p) => p.id !== id);
        setCompletedProjects(updatedProjects)
    };
    const handleEdit = (updated: ProjectFormData) => {
        const updatedProjects = completedProjects.map((p) => (p.id === updated.id ? updated : p)).filter(p => p.status === 'done');
        setCompletedProjects(updatedProjects);
    };

    const openViewModal = (project: ProjectFormData) => {
        setViewTask({
            ...project,
            date: project.date ? dayjs(project.date) : null,
            deadline: project.deadline ? dayjs(project.deadline) : null,
        });
        setIsViewModalOpen(true);
    };

    const closeViewModal = () => {
        setIsViewModalOpen(false);
        setViewTask(null);
    };


    return (
        <>
            <div className="taskapp_container">
                <h2>Completed Projects</h2>
                <ProjectsList
                    projects={completedProjects}
                    onView={openViewModal}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    hideDeadline={true}
                />
            </div>

            <SubtaskModal open={isViewModalOpen} onCancel={closeViewModal} task={viewTask} disableSubtaskAdd={true} />
        </>
    )
}
