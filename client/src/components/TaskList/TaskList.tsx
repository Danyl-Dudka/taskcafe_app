import './taskList.css';
import type { ProjectListProps } from '../types.tsx';
import dayjs from 'dayjs';
import { Radio } from 'antd';
import { Trash2, SquarePen } from 'lucide-react';
import { useState } from 'react';
import { toast } from "react-toastify";
import { statusLabels } from '../types.tsx';
import DeleteConfirmModal from '../DeleteConfirmModal/DeleteConfirmModal';
export default function TaskList({ projects, onDelete, onView, onEdit, hideDeadline }: ProjectListProps & { onView: (project: any) => void }) {

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
    const [projectToDelete, setProjectToDelete] = useState<string | null>('');
    const [editingTask, setEditingTask] = useState<any | null>(null);
    const [editedName, setEditedName] = useState<string>('');
    const [editedDescription, setEditedDescription] = useState<string>('');
    const [editedPriority, setEditedPriority] = useState<string>('');
    const [editedStatus, setEditedStatus] = useState<string>('todo');
    const confirmDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setProjectToDelete(id);
        setIsDeleteModalOpen(true);
    }


    const handleConfirmDelete = () => {
        if (projectToDelete) {
            onDelete(projectToDelete);
        }
        setProjectToDelete(null);
        setIsDeleteModalOpen(false);
    }

    const handleEditClick = (task: any, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingTask(task);
        setEditedName(task.name);
        setEditedDescription(task.description);
        setEditedPriority(task.priority);
        setEditedStatus(task.status);
    }

    const handleSaveEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        const updated = {
            ...editingTask,
            name: editedName,
            description: editedDescription,
            priority: editedPriority,
            status: editedStatus,
        };

        if (editedStatus === 'done') {
            toast.success('You have completed your project!!')
            setTimeout(() => {
                onEdit(updated);
            }, 1500)
        } else {
            onEdit(updated);
            setEditingTask(null);
        }
    };

    const handleCancelEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingTask(null);
    }

    return (
        <>
            <div className='projects_board'>
                {projects.map((project, index) => {
                    const assignedUser = localStorage.getItem(`assignedUser_${project.id}`);

                    const today = dayjs().startOf('day');
                    const deadline = dayjs(project.deadline).startOf('day');
                    const daysLeft = deadline.diff(today, 'day');

                    let deadlineClass = 'deadline-ok';
                    let deadlineText;
                    if (daysLeft < 2 && daysLeft > 0) {
                        deadlineClass = 'deadline-soon';
                        deadlineText = 'Deadline soon!';
                    } else if (daysLeft < 1) {
                        deadlineClass = 'deadline-overdue'
                        deadlineText = 'Overdue!'
                    } else if (!deadline.isValid()) {
                        deadlineClass = 'not_selected'
                        deadlineText = 'Not selected!'
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
                                    <button className='save_btn' type="button" onClick={handleSaveEdit}>Save</button>
                                    <button className='cancel_btn' type='button' onClick={handleCancelEdit}>Cancel</button>
                                </div>
                            ) : (
                                <>
                                    <div className='project_start_date'>
                                        {project.date && `${dayjs(project.date).format('DD MMM YY')}`}
                                    </div>

                                    <div className='assigned_user'>
                                        <span className='user_name'>Assigned user: {assignedUser || <span className='no_user_span'>User is not assigned</span>}</span>
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
                                                {deadline.isValid() && daysLeft >= 0 && (
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