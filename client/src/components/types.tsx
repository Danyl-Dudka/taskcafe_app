import type { JSX } from "react";
import type { Dayjs } from "dayjs";
import { Check, Loader, Pin } from 'lucide-react';

export type FormErrors = {
    [key: string]: string;
}

export interface ProjectListProps {
    projects: ProjectFormData[];
    onDelete: (id: string) => void;
    onView: (project: ProjectFormData) => void;
    onEdit: (task: ProjectFormData) => void;
    hideDeadline: boolean,
}

export type ModalMode = 'create' | 'reset';

export type RangeValue<DateType> = [DateType | null, DateType | null] | null;

export interface NewTaskModalProps {
    open: boolean;
    modalMode: ModalMode;
    projectName: string;
    description: string;
    priority: string;
    status: string;
    date: Dayjs | null;
    deadline: Dayjs | null;
    onChangeProjectName: (value: string) => void;
    onChangeDescription: (value: string) => void;
    onChangeStatus: (value: string) => void;
    onChangePriority: (value: string) => void;
    onChangeDate: (value: Dayjs | null) => void;
    onChangeDeadline: (value: Dayjs | null) => void;
    onConfirm: (data?: { name: string; priority: string }) => void;
    onCancel: () => void;
}

export interface User {
    password: string;
    fullname: string;
}

export interface ProjectFormDataDone {
    id: string;
    name: string;
    description: string;
    date: string;
    priority: string;
    status: string;
}

export interface ProjectFormData {
    id: string;
    name: string;
    description: string;
    date: string;
    priority: string;
    status: string;
    deadline: string;
}

export interface ViewTaskModalProps {
    open: boolean;
    onCancel: () => void;
    task: {
        id: string;
        name: string;
        description: string;
        status: string;
        priority: string;
        date: Dayjs | null;
        deadline: Dayjs | null;
    } | null;
}

export interface ProjectViewData {
    id: string;
    name: string;
    description: string;
    status: string;
    priority: string;
    date: Dayjs | null;
    deadline: Dayjs | null;
}

export interface DeleteConfirmModalProps {
    open: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export const statusLabels: Record<string, { label: string; icon?: JSX.Element }> = {
    'todo': { label: 'To Do', icon: <Pin className="pin_icon anim" size={20} /> },
    'in-progress': { label: 'In Progress', icon: <Loader className="loader_icon spin" size={20} /> },
    'done': { label: 'Completed', icon: <Check className="check_icon jump" size={18} /> },
}

export interface Option {
    value: string;
    label: string;
    children?: Option[];
}