// CLEAN
import { Modal, Button, Input } from "antd";
import './viewTaskModal.css';
import type { Subtask, ViewTaskModalProps } from "../types.tsx";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
export default function ViewTaskModal({ open, onCancel, task }: ViewTaskModalProps) {
    const [subTasks, setSubTasks] = useState<Subtask[]>([]);
    const [subTaskName, setSubTaskName] = useState<string>('');
    const [subTaskDescription, setSubTaskDescription] = useState<string>('');

    useEffect(() => {
        if (open && task?.id) {
            fetchSubTasks();
        }
    }, [open, task?.id])

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
                toast.success('Subtask added!')
            }

        } catch (error) {
            console.error('Error: ', error);
            toast.error('Subtask is not created!');
        }
    }


    return (
        <Modal
            title={task?.name || 'Project Details'}
            open={open}
            onCancel={onCancel}
            footer={null}
            centered
            wrapClassName="taskcafe-modal"
        >
            <div className="subtask-form">

                <label className="input-label">Subtask Name</label>
                <Input
                    value={subTaskName}
                    onChange={(e) => setSubTaskName(e.target.value)}
                    placeholder="Enter subtask name"
                    className="input-field"
                />

                <label className="input-label">Subtask Description</label>
                <Input
                    className="input-field"
                    value={subTaskDescription}
                    onChange={(e) => setSubTaskDescription(e.target.value)}
                    placeholder="Enter subtask description"
                />

                <Button onClick={addSubTask}
                    className="submit-button"
                    type="primary">
                    Add subtask
                </Button>
            </div>

            <div className="subtask-list">
                <h3>Subtasks</h3>
                {subTasks.length === 0 ? (
                    <p className="no_subtasks">No subtasks available...</p>
                ) : (
                    subTasks.map((subtask) => (
                        <div key={subtask._id} className="subtask-item">
                            <strong className="subtask-title">{subtask.subTaskName}</strong>
                            <p className="subtask-desc">{subtask.subTaskDescription}</p>
                        </div>
                    ))
                )}
            </div>
        </Modal>
    );

}
