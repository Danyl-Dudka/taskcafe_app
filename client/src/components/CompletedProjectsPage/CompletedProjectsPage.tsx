import type { ProjectFormData, ProjectViewData } from "../types";
import { useState, useEffect } from "react";
import TaskList from "../TaskList/TaskList";
import dayjs from "dayjs";
import './completedProjectsPage.css'
import ViewTaskModal from "../ViewTaskModal/ViewTaskModal";
export default function CompletedProjectsPage() {
    const [completedProjects, setCompletedProjects] = useState<ProjectFormData[]>([]);
    const LOCAL_STORAGE_KEY = 'taskapp_projects';
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewTask, setViewTask] = useState<ProjectViewData | null>(null);


    useEffect(() => {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
            const allProjects: ProjectFormData[] = JSON.parse(saved);
            const doneProjects = allProjects.filter(p => p.status === 'done')
            setCompletedProjects(doneProjects)
        }
    }, [])

    const handleDelete = (id: string) => {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
            const allProjects: ProjectFormData[] = JSON.parse(saved);
            const updatedProjects = allProjects.filter((p) => p.id !== id);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedProjects))

            const doneProjects = updatedProjects.filter(p => p.status === 'done');
            setCompletedProjects(doneProjects)
        }
    };

    const handleEdit = (updated: ProjectFormData) => {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
            const allProjects: ProjectFormData[] = JSON.parse(saved);
            const updatedProjects = allProjects.map((p) => (p.id === updated.id ? updated : p));
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedProjects))
            setCompletedProjects(updatedProjects.filter(p => p.status === 'done'));

        }
    }

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
                <TaskList
                    projects={completedProjects}
                    onView={openViewModal}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    hideDeadline={true}
                />
            </div>

            <ViewTaskModal open={isViewModalOpen} onCancel={closeViewModal} task={viewTask} />
        </>
    )
}
