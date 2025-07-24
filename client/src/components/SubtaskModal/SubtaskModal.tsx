// CLEAN
import { Modal, Button, Input } from "antd";
import './subtaskModal.css';
import type { Subtask, ViewTaskModalProps } from "../types.tsx";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Check, CheckLine, SquarePen, Trash2 } from "lucide-react";
import { newSubtaskSchema } from "../validation/validationSchema.ts";
export default function ViewTaskModal({ open, onCancel, task, disableSubtaskAdd }: ViewTaskModalProps) {
    const [subTasks, setSubTasks] = useState<Subtask[]>([]);
    const [subTaskName, setSubTaskName] = useState<string>('');
    const [subTaskDescription, setSubTaskDescription] = useState<string>('');
    const [isActive, setIsActive] = useState<boolean>(true);

    const [editingSubtask, setEditingSubtask] = useState<any | null>(null);
    const [editedSubtaskName, setEditedSubtaskName] = useState<string>('');
    const [editedSubtaskDescription, setEditedSubtaskDescription] = useState<string>('');

    const [subtaskToDelete, setSubtaskToDelete] = useState<string | null>(null);
    const [confirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState(false);

    const [errors, setErrors] = useState<{ [key: string]: string }>({});


    useEffect(() => {
        setIsActive(false)
        if (open && task?.id) {
            fetchSubTasks();
        }
    }, [open, task?.id]);

    const handleCancel = () => {
        setSubTaskName('');
        setSubTaskDescription('');
        setIsActive(false)
    }

    const fetchSubTasks = async () => {
        const token = sessionStorage.getItem('token');
        if (!token) {
            console.log('Token is expired!');
            return;
        }
        try {
            const response = await fetch(`http://localhost:3000/getSubtasks?taskId=${task?.id}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            });

            const data = await response.json();

            if (response.ok) {
                setSubTasks(data);
            }
        } catch (error) {
            console.error('Error fetching tasks: ', error)
        }
    }

    const addSubTask = async () => {
        const token = sessionStorage.getItem('token');

        if (!token) {
            console.log('Token is expired!');
            return;
        }

        try {

            await newSubtaskSchema.validate(
                {
                    subtaskName: subTaskName,
                    subtaskDescription: subTaskDescription
                },
                { abortEarly: false }
            )
            const response = await fetch('http://localhost:3000/addSubtask', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    projectId: task?.id,
                    subTaskName: subTaskName,
                    subTaskDescription: subTaskDescription,
                })
            });

            if (response.ok) {
                setSubTaskName('');
                setSubTaskDescription('');
                setErrors({});
                toast.success('Subtask added!');
                fetchSubTasks();
                setIsActive(false)
            }

        } catch (error: any) {
            if (error.inner) {
                const newErrors: { [key: string]: string } = {};
                error.inner.forEach((validationError: any) => {
                    if (validationError.path) {
                        newErrors[validationError.path] = validationError.message;
                    }
                })
                setErrors(newErrors)
            }
            toast.error('Subtask is not created!');
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
            subtaskId: editingSubtask._id,
            editedSubtaskName: editedSubtaskName,
            editedSubtaskDescription: editedSubtaskDescription,
        }
        try {
            const response = await fetch('http://localhost:3000/editSubtask', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(updated)
            });

            if (response.ok) {
                toast.success('Subtask updated!');
                setEditingSubtask(null);
                fetchSubTasks();
            }
        } catch (error) {
            toast.error('An error occurred while updating the subtask.');
            console.error('Error: ', error)
        }
    };

    const handleDelete = async (id: string) => {
        const token = sessionStorage.getItem('token');
        if (!token) {
            console.error('Token is expired!')
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/deleteSubtask?subtaskIdToDelete=${id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            })

            if (response.ok) {
                toast.success('Subtask was successfully deleted!');
                fetchSubTasks();
                setSubtaskToDelete(null)
            }
        } catch (error) {
            toast.error('An error occurred while deleting the subtask.');
            console.error('Error: ', error)
        }
    };

    const markAsCompleted = async (id: string) => {
        const token = sessionStorage.getItem('token');
        if (!token) {
            console.error('Token is expired!');
            return
        }
        try {
            const response = await fetch('http://localhost:3000/completeSubtask', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ subtaskId: id })
            })

            if (response.ok) {
                toast.success('Congratulations! Subtask is completed.');
                fetchSubTasks();
            }
        } catch (error) {
            toast.error('An error occurred while completing the subtask.');
            console.error('Error: ', error)
        }
    }

    const handleEditClick = (subtask: Subtask) => {
        setEditingSubtask(subtask);
        setEditedSubtaskName(subtask.subTaskName);
        setEditedSubtaskDescription(subtask.subTaskDescription);
    }

    const confirmDeleteSubtask = (id: string) => {
        setSubtaskToDelete(id);
        setConfirmDeleteModalOpen(true);
    }

    const handleConfirmDeleteSubtask = () => {
        if (subtaskToDelete) {
            handleDelete(subtaskToDelete);
            setConfirmDeleteModalOpen(false);
            setSubtaskToDelete(null);
        }
    }

    const handleCancelDeleteSubtask = () => {
        setSubtaskToDelete(null);
        setConfirmDeleteModalOpen(false);
    }

    const handleCancelEdit = () => {
        setEditingSubtask(null)
    };

    return (
        <Modal
            title={task?.name || 'Project Details'}
            open={open}
            onCancel={() => { onCancel(); setIsActive(false); }}
            footer={null}
            centered
            transitionName="fade-in-up"
            maskTransitionName="fade-in-up"
        >
            <div className="subtask-form">
                {isActive ? (
                    <>
                        <label className="input-label">Subtask Name</label>
                        <Input
                            value={subTaskName}
                            onChange={(e) => setSubTaskName(e.target.value)}
                            placeholder="Enter subtask name"
                            className="input-field"
                        />

                        {errors.subtaskName && (
                            <div className="error">{errors.subtaskName}</div>
                        )}

                        <label className="input-label">Subtask Description</label>
                        <Input
                            className="input-field"
                            value={subTaskDescription}
                            onChange={(e) => setSubTaskDescription(e.target.value)}
                            placeholder="Enter subtask description"
                        />

                        <div className="control_buttons">
                            <Button onClick={addSubTask}
                                className="submit-button"
                                type="primary">
                                Save
                            </Button>

                            <Button onClick={handleCancel}
                                className="cancel-button"
                                danger>
                                Cancel
                            </Button>
                        </div>
                    </>
                ) : (
                    !disableSubtaskAdd && (
                        <button type="button" className="add-subtask-btn" onClick={() => setIsActive(true)}>+ Add subtask</button>
                    )
                )}
            </div>

            <div className="subtask-list">
                <h3>Subtasks</h3>
                {subTasks.length === 0 ? (
                    <p className="no_subtasks">No subtasks available...</p>
                ) : (
                    subTasks.map((subtask) => (
                        editingSubtask?._id === subtask._id ? (
                            <div key={subtask._id} className="subtask-item">
                                <div className="subtask-content">
                                    <input className="input-edit-title" type="text" value={editedSubtaskName} onClick={(e) => e.stopPropagation()} onChange={(e) => setEditedSubtaskName(e.target.value)} />
                                    <textarea className="textarea-edit-desc" value={editedSubtaskDescription} onClick={(e) => e.stopPropagation()} onChange={(e) => setEditedSubtaskDescription(e.target.value)} />
                                </div>
                                <div className='edit_buttons'>
                                    <button className='save_subtask_btn' type="button" onClick={handleSaveEdit}>Save</button>
                                    <button className='cancel_subtask_btn' type='button' onClick={handleCancelEdit}>Cancel</button>
                                </div>
                            </div>
                        ) : (
                            <div key={subtask._id} className="subtask-item">
                                <div className="subtask-content">
                                    <strong className="subtask-title">{subtask.subTaskName}</strong>
                                    <p className="subtask-desc">{subtask.subTaskDescription}</p>
                                </div>
                                <div>
                                    {subtask.subTaskCompletingStatus ? (
                                        <span className="completed_subtask">
                                            Completed
                                            <Check />
                                        </span>
                                    ) : (
                                        <button type="button" className="complete_btn" onClick={() => markAsCompleted(subtask._id)}>
                                            Mark as Completed
                                            <CheckLine className="checkline_icon" color="white" size={14} />
                                        </button>
                                    )}

                                </div>
                                <div className="subtask-actions">
                                    <button type="button" className="edit_subtask_btn" onClick={() => {
                                        handleEditClick(subtask)
                                    }}>
                                        <SquarePen className='pen_icon' color='black' size={14} />
                                    </button>
                                    <button type="button" className="delete_subtask_btn" onClick={() => confirmDeleteSubtask(subtask._id)}>
                                        <Trash2 className='trash_icon' color="white" size={14} />
                                    </button>
                                    <Modal
                                        title="Confirm delete"
                                        open={confirmDeleteModalOpen}
                                        onCancel={handleCancelDeleteSubtask}
                                        footer={[
                                            <Button key="cancel" onClick={handleCancelDeleteSubtask}>
                                                Cancel
                                            </Button>,
                                            <Button key="delete" type="primary" danger onClick={handleConfirmDeleteSubtask}>
                                                Delete
                                            </Button>,
                                        ]}
                                    >
                                        <span className="confirmation_span">Are you sure that you want to delete this subtask?</span>
                                    </Modal>
                                </div>
                            </div>
                        )
                    ))
                )}
            </div>
        </Modal >
    );

}