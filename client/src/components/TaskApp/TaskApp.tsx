import { useState, useEffect } from "react";
import './TaskApp.css';
import NewTaskModal from "../NewTaskModal/NewTaskModal.tsx";
import ViewTaskModal from "../ViewTaskModal/ViewTaskModal.tsx";
import TaskList from "../TaskList/TaskList";
import { type ModalMode, type ProjectFormData, type ProjectViewData } from "../types.tsx";
import dayjs, { Dayjs } from "dayjs";
import { v4 as uuidv4 } from 'uuid';
import { CircleX } from 'lucide-react';
import { Funnel, ArrowUpDown } from 'lucide-react';
import { Cascader, Select } from 'antd';
export default function TaskApp() {
    const LOCAL_STORAGE_KEY = 'taskapp_projects';
    const [projects, setProjects] = useState<ProjectFormData[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<ModalMode>('create');
    const [projectName, setProjectName] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('');
    const [date, setDate] = useState<Dayjs | null>(dayjs());
    const [deadline, setDeadline] = useState<Dayjs | null>(null);
    const [status, setStatus] = useState<string>('todo')
    const [viewTask, setViewTask] = useState<ProjectViewData | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [filterValues, setFilterValues] = useState<string[]>([]);
    const [showFilterOptions, setShowFilterOptions] = useState<boolean>(false);
    const [sortType, setSortType] = useState<string>('');
    const [showSortingOptions, setShowSortingOptions] = useState<boolean>(false);
    const [query, setQuery] = useState<string>('');
    const { Option } = Select;
    useEffect(() => {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
            setProjects(JSON.parse(saved))
        }
    }, [])

    const showCreateModal = () => {
        setModalMode('create');
        setIsModalOpen(true)
    };

    const showResetModal = () => {
        setModalMode('reset');
        setIsModalOpen(true)
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const handleDeleteTask = (id: string) => {
        const updatedTasks = projects.filter((project) => project.id !== id)
        setProjects(updatedTasks)
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedTasks))

    }


    const handleAddProject = () => {
        if (projectName.trim()) {


            const newProject: ProjectFormData = {
                id: uuidv4(),
                name: projectName,
                description,
                priority,
                status,
                date: date?.toISOString() ?? '',
                deadline: deadline?.toISOString() ?? '',
            }
            const updatedProjects = [...projects, newProject];
            setProjects(updatedProjects);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedProjects));
            setProjectName('');
            setDescription('');
            setPriority('');
            setStatus('todo');
            setDate(dayjs());
            setDeadline(null)
            setIsModalOpen(false)
        }
    }

    const handleResetProjects = () => {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        setProjects([]);
        setIsModalOpen(false);
    }

    const handleModalConfirm = () => {
        if (modalMode === 'create') {
            handleAddProject()
        } else {
            handleResetProjects();
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

    const handleEditTask = (updatedTask: ProjectFormData) => {
        const updated = projects.map((p) => (p.id === updatedTask.id ? updatedTask : p))
        setProjects(updated);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated))
    }

    const cascaderOptions = [
        {
            value: 'status',
            label: 'Status',
            children: [
                {
                    value: 'todo',
                    label: 'To Do',
                },
                {
                    value: 'in-progress',
                    label: 'In Progress',
                }
            ]
        },
        {
            value: 'priority',
            label: 'Priority',
            children: [
                {
                    value: 'Urgent',
                    label: 'Urgent',
                },
                {
                    value: 'High',
                    label: 'High',
                },
                {
                    value: 'Medium',
                    label: 'Medium',
                },
                {
                    value: 'Low',
                    label: 'Low',
                },
            ]
        },
    ]

    const filteredProjects = projects.filter((project) => {

        const matchName = project.name.toLowerCase().includes(query.toLowerCase())

        const matchStatus = filterValues.includes('todo') || filterValues.includes('in-progress')
            ? filterValues.includes(project.status)
            : project.status !== 'done';

        const matchPriority = filterValues.includes('Urgent') || filterValues.includes('High') || filterValues.includes('Medium') || filterValues.includes('Low')
            ? filterValues.includes(project.priority)
            : true;

        return matchName && matchStatus && matchPriority
    });

    const handleChange = (value: string[][]) => {
        const flattened = value.flat();
        setFilterValues(flattened)
    }

    const sortedProjects = [...filteredProjects].sort((a, b) => {
        if (sortType === 'date-desc') {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        }
        if (sortType === 'date-asc') {
            return new Date(a.date).getTime() - new Date(b.date).getTime();
        }
        if (sortType === 'priority') {
            const priorityOrders = ['Low', 'Medium', 'High', 'Urgent'];
            return priorityOrders.indexOf(a.priority) - priorityOrders.indexOf(b.priority)
        }
        if (sortType === 'name') {
            return a.name.localeCompare(b.name);
        }
        return 0;
    })

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value)

    }

    return (
        <div className="taskapp_container">
            <div className="taskapp_header">
                <h2>Personal Projects</h2>
                <div className="taskapp_buttons">
                    <input className="taskapp_input" placeholder="Search by name" onChange={handleSearch} value={query}></input>
                    {showFilterOptions ?
                        <div className='control_options'>
                            <Cascader options={cascaderOptions} onChange={handleChange} placeholder="Select filters" multiple />
                            <CircleX style={{ color: 'red' }} size={24} className="circle_btn" onClick={() => { setShowFilterOptions(false); setFilterValues([]); }} />
                        </div>
                        :
                        <Funnel size={36} className="filter_btn" onClick={() => setShowFilterOptions(true)} />
                    }
                    {showSortingOptions ?
                        <div className='control_options'>
                            <Select
                                style={{ width: 180 }}
                                placeholder="Select the method"
                                onChange={(value) => setSortType(value)}>
                                <Option value="date-desc">Newest to Oldest</Option>
                                <Option value="date-asc">Oldest to Newest</Option>
                                <Option value="priority">By Priority</Option>
                                <Option value="name">By Name</Option>
                            </Select>
                            <CircleX style={{ color: 'red' }} size={24} className="circle_btn" onClick={() => setShowSortingOptions(false)} />
                        </div>
                        : <ArrowUpDown size={36} className="filter_btn" onClick={() => setShowSortingOptions(true)} />
                    }
                    <button type="button" className="create_task_btn" onClick={showCreateModal}>Create new project</button>
                    <button type="button" className="reset_task_btn" onClick={showResetModal}>Reset projects</button>
                </div>
            </div>
            <TaskList projects={sortedProjects} onDelete={handleDeleteTask} onView={openViewModal} onEdit={handleEditTask} hideDeadline={false} />

            {sortedProjects.length === 0 && (
                <div className="no_result">No result</div>
            )}

            <NewTaskModal
                open={isModalOpen}
                modalMode={modalMode}
                projectName={projectName}
                description={description}
                priority={priority}
                status={status}
                date={date}
                deadline={deadline}
                onChangeProjectName={setProjectName}
                onChangeDescription={setDescription}
                onChangeStatus={setStatus}
                onChangePriority={setPriority}
                onChangeDate={setDate}
                onChangeDeadline={setDeadline}
                onConfirm={handleModalConfirm}
                onCancel={handleCancel}
            />

            <ViewTaskModal open={isViewModalOpen} onCancel={closeViewModal} task={viewTask} />

        </div>
    )
}