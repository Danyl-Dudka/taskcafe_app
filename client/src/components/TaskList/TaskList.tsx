// CLEAN
import './taskList.css';
import type { ProjectListProps } from '../types.tsx';
import dayjs from 'dayjs';
import { Radio, Select } from 'antd';
import { Trash2, SquarePen } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from "react-toastify";
import { statusLabels } from '../types.tsx';
import type { User } from '../types.tsx';
import DeleteConfirmModal from '../DeleteConfirmModal/DeleteConfirmModal';
export default function TaskList({ projects, onDelete, onView, onEdit, hideDeadline }: ProjectListProps & { onView: (project: any) => void }) {

    const [editingTask, setEditingTask] = useState<any | null>(null);
    const [editedName, setEditedName] = useState<string>('');
    const [editedDescription, setEditedDescription] = useState<string>('');
    const [editedPriority, setEditedPriority] = useState<string>('');
    const [editedStatus, setEditedStatus] = useState<string>('todo');
    const [usersOptions, setUsersOptions] = useState<User[]>([]);
    const [editedUser, setEditedUser] = useState<string>('');

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);

    const [projectToDelete, setProjectToDelete] = useState<string>('');


    useEffect(() => {
        const fetchUsers = async () => {
            const token = sessionStorage.getItem('token');
            if (!token) {
                console.log('Token is expired!');
                return;
            }
            try {
                const response = await fetch('http://localhost:3000/users', {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                });

                const data = await response.json();
                if (response.ok) {
                    setUsersOptions(data);
                }
            } catch (error) {
                console.error('Error:', error)
            }
        }
        fetchUsers();
    }, []);

    const confirmDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setProjectToDelete(id);
        setIsDeleteModalOpen(true);
    }

    const handleEditClick = (task: any, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingTask(task);
        setEditedName(task.name);
        setEditedDescription(task.description);
        setEditedPriority(task.priority);
        setEditedStatus(task.status);
        setEditedUser(task.assignedUser)
    };

    const handleCancelEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingTask(null);
    }

    const handleConfirmDelete = async () => {
        const token = sessionStorage.getItem('token');
        if (!token) {
            console.log('Token is expired!')
            return;
        }
        try {
            const response = await fetch('http://localhost:3000/deleteTask', {
                method: "DELETE",
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ projectIdToDelete: projectToDelete })
            });

            const data = await response.json();

            if (response.ok) {
                onDelete(projectToDelete);
                toast.success(data.message || 'Project has been successfully deleted!');
                setIsDeleteModalOpen(false)
            } else {
                toast.error('Failed to delete project')
            }
        } catch (error) {
            console.error('Error: ', error);
            toast.error('An error occurred while deleting the project.')
        }
    }

    const handleSaveEdit = async (e: React.MouseEvent) => {
        e.stopPropagation();
        const token = sessionStorage.getItem('token');
        if (!token) {
            console.log('Token is expired!');
            return;
        }
        const updated = {
            projectId: editingTask.id,
            editedProjectName: editedName,
            editedProjectDescription: editedDescription,
            editedProjectStatus: editedStatus,
            editedProjectPriority: editedPriority,
            editedAssignedUser: editedUser,
        }
        try {
            const response = await fetch('http://localhost:3000/editTask', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(updated)
            });

            const data = await response.json();

            if (response.ok) {
                if (editedStatus === "done") {
                    toast.success('Project has been completed!');
                } else {
                    toast.success(data.message || 'Project has been successfully updated!');
                }


                onEdit({
                    ...editingTask,
                    name: editedName,
                    description: editedDescription,
                    status: editedStatus,
                    priority: editedPriority,
                    assignedUser: editedUser,
                })
                setEditingTask(null);
            }
        } catch (error) {
            toast.error('An error occurred while updating the project.');
            console.error('Error: ', error)
        }
    };

    return (
        <>
            <div className='projects_board'>
                {projects.map((project, index) => {

                    const today = dayjs().startOf('day');
                    const deadline = dayjs(project.deadline).startOf('day');
                    let deadlineClass;
                    let deadlineText;
                    let daysLeft = deadline.diff(today, 'day');
                    if (daysLeft < 0) {
                        deadlineClass = 'deadline-overdue';
                        deadlineText = 'Overdue!';
                    } else if (daysLeft === 0) {
                        deadlineClass = 'deadline_today';
                        deadlineText = <span>Deadline is <span style={{color: 'red'}}>today!</span></span>
                    } else if (daysLeft < 3) {
                        deadlineClass = 'deadline-soon';
                        deadlineText = 'Deadline soon!';
                    } else if (!deadline.isValid()) {
                        deadlineClass = "not_selected";
                        deadlineText = 'Not selected!';
                    } else {
                        deadlineClass = 'deadline-ok';
                    }


                    return (
                        <div key={index}
                            className='project_card'
                            onClick={() => onView(project)}
                        >
                            {editingTask?.id === project.id ? (
                                <div className="edit_mode" onClick={(e) => e.stopPropagation()}>
                                    <input className='input_edit' type="text" value={editedName} onClick={(e) => e.stopPropagation()} onChange={(e) => setEditedName(e.target.value)} />
                                    <textarea className='textarea_edit' value={editedDescription} onClick={(e) => e.stopPropagation()} onChange={(e) => setEditedDescription(e.target.value)} />
                                    <div className='status_edit'>
                                        <Radio.Group
                                            value={editedStatus}
                                            options={[
                                                { value: 'todo', label: 'To Do' },
                                                { value: 'in-progress', label: 'In Progress' },
                                                { value: 'done', label: 'Completed' },
                                            ]}
                                            onChange={(e) => setEditedStatus(e.target.value)}
                                        />

                                    </div>
                                    <select className='select_edit' value={editedPriority} onClick={(e) => e.stopPropagation()} onChange={(e) => setEditedPriority(e.target.value)}>
                                        <option value="Urgent">Urgent</option>
                                        <option value="High">High</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Low">Low</option>
                                    </select>

                                    <Select
                                        placeholder="Assign a user"
                                        value={editedUser}
                                        onChange={(e) => setEditedUser(e)}
                                        className='assigned_user_edit'
                                        options={usersOptions.map(user => ({
                                            value: user.fullname,
                                            label: user.fullname,
                                        }))}
                                    />
                                    <div className='edit_buttons'>
                                        <button className='save_btn' type="button" onClick={handleSaveEdit}>Save</button>
                                        <button className='cancel_btn' type='button' onClick={handleCancelEdit}>Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className='project_start_date'>
                                        {project.date && `${dayjs(project.date).format('DD MMM YY')}`}
                                    </div>

                                    <div className='assigned_user'>
                                        <span className='user_name'>Assigned user: {project.assignedUser || <span className='no_user_span'>User is not assigned</span>}</span>
                                    </div>

                                    <div className='project_title'>
                                        {project.name}
                                    </div>

                                    <div className='project_description'>
                                        <span className="desc_label">Description:</span>
                                        <p className='desc_paragraph'>{project.description}</p>
                                    </div>

                                    <span className={`status_label ${project.status}`}>
                                        {statusLabels[project.status]?.label}
                                        {statusLabels[project.status]?.icon || '-'}
                                    </span>



                                    <div className={`project_priority ${project.priority.toLowerCase()}`} >{
                                        project.priority}
                                    </div>

                                    {!hideDeadline && (
                                        <div className={`project_deadline ${deadlineClass}`}>
                                            <div className="deadline_date">
                                                Deadline: {project.deadline && dayjs(project.deadline).isValid()
                                                    ? dayjs(project.deadline).format('DD MMM YY')
                                                    : 'Not selected!'}
                                            </div>
                                            <div className="deadline_status_text">{deadlineText}
                                                {deadline.isValid() && daysLeft !== null && daysLeft > 0 && (
                                                    <span className='days_left_text'>{daysLeft} day{daysLeft !== 1 ? 's' : ''} left!</span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    <div className='crud_buttons'>
                                        <button type="button" className='edit_btn' onClick={(e) => {
                                            handleEditClick(project, e)
                                        }}>
                                            <SquarePen className='pen_icon' color='black' size={14} />
                                        </button>

                                        <button type="button" className='delete_btn'
                                            onClick={(e) => {
                                                confirmDelete(project.id, e)
                                            }}>
                                            <Trash2 className='trash_icon' color="white" size={14} />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )
                })}
            </div >
            <DeleteConfirmModal
                open={isDeleteModalOpen}
                onCancel={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
            />
        </>
    )
}