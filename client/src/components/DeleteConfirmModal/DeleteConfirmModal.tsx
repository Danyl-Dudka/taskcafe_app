import { Modal } from "antd";
import type { DeleteConfirmModalProps } from "../types.tsx";
import './DeleteConfirmModal.css'
export default function DeleteConfirmModal({
    open,
    onConfirm,
    onCancel,
}: DeleteConfirmModalProps) {
    return (
        <Modal
            title={<h2 className="delete_modal_title">Are you sure you want to delete this project?</h2>}
            open={open}
            onOk={onConfirm}
            onCancel={onCancel}
            okText="Delete"
            cancelText="Cancel"
            okType="danger"
        >
            <p className="delete_modal_paragraph">This action cannot be undone.</p>
        </Modal>
    );
}
