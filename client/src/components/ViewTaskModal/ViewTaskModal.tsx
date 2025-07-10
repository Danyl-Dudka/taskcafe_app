import { Modal, Select, Button } from "antd";
import './viewTaskModal.css';
import { useEffect, useState } from "react";
import type { ViewTaskModalProps, User } from "../types.tsx";
import { statusLabels } from "../types.tsx";
export default function ViewTaskModal({ open, onCancel, task }: ViewTaskModalProps) {
    const [usersOptions, setUsersOptions] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<string | undefined>();
    const [assignedUser, setAssignedUser] = useState<string | null>(null)

    useEffect(() => {
        const usersJSON = localStorage.getItem('users');
        if (usersJSON) {
            const users: Record<string, User> = JSON.parse(usersJSON);
            setUsersOptions(Object.values(users));
        }
        if (!open) {
            setAssignedUser(null)
            setSelectedUser(undefined)
        }
        if (task) {
            const saved = localStorage.getItem(`assignedUser_${task.id}`)
            if (saved) {
                setAssignedUser(saved);
            }
        }
    }, [open]);

    const handleAssign = () => {
        if (selectedUser && task) {
            setAssignedUser(selectedUser);
            localStorage.setItem(`assignedUser_${task.id}`, selectedUser);
        }
    }


    return (
        <Modal
            title={task?.name || 'Task Details'}
            open={open}
            onCancel={onCancel}
            footer={null}
            centered
            wrapClassName="taskcafe-modal"
        >
            {task ? (
                <div className="taskcafe-view-content">
                    <div className="view-row">
                        <strong className="label">Date:</strong>
                        <span className="value">{task.date ? task.date.format('DD MMM YYYY') : '-'}</span>
                    </div>
                    <div className="view-row">
                        <strong className="label">Project name:</strong>
                        <span className="value">{task.name || '-'}</span>
                    </div>
                    <div className="view-row">
                        <strong className="label">Description:</strong>
                        <span className="value">{task.description || '-'}</span>
                    </div>
                    <div className="view-row">
                        <strong className="label">Status:</strong>
                        <span className="value">
                            {statusLabels[task.status]?.label}
                        </span>
                    </div>
                    <div className="view-row">
                        <strong className="label">Priority:</strong>
                        <span className="value">{task.priority || '-'}</span>
                    </div>
                    <div className="view-row">
                        {!assignedUser ? (
                            <>
                                <strong className="label">Assign a task:</strong>
                                <Select
                                    className="user_select"
                                    placeholder="Assign a user"
                                    value={selectedUser}
                                    onChange={setSelectedUser}
                                    options={usersOptions.map(user => ({
                                        value: user.fullname,
                                        label: user.fullname,
                                    }))}
                                />

                                <Button
                                    type="primary"
                                    onClick={handleAssign}
                                >Add user
                                </Button>
                            </>

                        ) : (
                            <>
                                <strong className="label">Assigned user:</strong>
                                <span className="value">{assignedUser}</span>
                            </>
                        )}
                    </div>
                    <div className="view-row">
                        <strong className="label">Deadline:</strong>
                        <span className="value">{task.deadline ? task.deadline.format('DD MMM YY') : <span className="deadline">Deadline is not selected!</span>}</span>
                    </div>
                </div>
            ) : (
                <p>No task data available.</p>
            )}
        </Modal>
    );

}
