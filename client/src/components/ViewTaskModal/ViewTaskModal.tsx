import { Modal } from "antd";
import './viewTaskModal.css';
import type { ViewTaskModalProps } from "../types.tsx";
import { statusLabels } from "../types.tsx";
export default function ViewTaskModal({ open, onCancel, task }: ViewTaskModalProps) {

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
                        <strong className="label">Assigned user:</strong>
                        <span className="value">{task.assignedUser || <span className="assigning_user">User is not assigned!</span>}</span>
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
