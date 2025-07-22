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
import { toast } from "react-toastify";

export default function TaskApp() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [modalMode, setModalMode] = useState<ModalMode>('create');

    const [viewTask, setViewTask] = useState<ProjectViewData | null>(null);

    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    const [filterValues, setFilterValues] = useState<string[]>([]);

    const [showFilterOptions, setShowFilterOptions] = useState<boolean>(false);

    const [sortType, setSortType] = useState<string>('');

    const [showSortingOptions, setShowSortingOptions] = useState<boolean>(false);

    const [query, setQuery] = useState<string>('');

    const { Option } = Select;

    const [currentPassword, setCurrentPassword] = useState<string>('');

    const [projects, setProjects] = useState<ProjectFormData[]>([]);
    const [projectName, setProjectName] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('');
    const [date, setDate] = useState<Dayjs | null>(dayjs());
    const [deadline, setDeadline] = useState<Dayjs | null>(null);
    const [assignedUser, setAssignedUser] = useState<string>('');
    const [status, setStatus] = useState<string>('todo')

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

    useEffect(() => {
        const fetchTasks = async () => {
            const token = sessionStorage.getItem('token');
            if (!token) {
                console.log('Token is expired');
                return;
            }
            try {
                const response = await fetch('http://localhost:3000/getTasks', {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (!response.ok) {
                    console.log('Failed to fetch data!')
                    return;
                }
                const data = await response.json();

                const mappedTasks = await data.map((task: any) => ({
                    id: task._id,
                    name: task.projectName,
                    description: task.projectDescription,
                    priority: task.projectPriority,
                    status: task.projectStatus ?? 'todo',
                    date: task.projectDate,
                    deadline: task.projectDeadline,
                    assignedUser: task.projectAssignedUser,
                }));

                setProjects(mappedTasks);

            } catch (error) {
                console.error('Error:', error);
            }
        }
        fetchTasks();
    }, []);

    const handleAddProject = async () => {
        const token = sessionStorage.getItem('token');
        if (!token) {
            console.log('Token is expired!');
            return;
        }
        const newProject: ProjectFormData = {
            id: uuidv4(),
            name: projectName,
            description,
            priority,
            status,
            date: date?.toISOString() ?? '',
            deadline: deadline?.toISOString() ?? '',
            assignedUser,
        }

        try {
            const response = await fetch('http://localhost:3000/addTask', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    projectName: newProject.name,
                    projectDescription: newProject.description,
                    projectPriority: newProject.priority,
                    projectStatus: newProject.status,
                    projectDeadline: newProject.deadline,
                    projectDate: newProject.date ?? '',
                    projectAssignedUser: newProject.assignedUser,
                })
            })

            const data = await response.json();


            if (response.ok) {
                setProjects((prevProjects) => [...prevProjects, newProject]);
                toast.success(data.message || 'Task was successfully created!');
                setIsModalOpen(false);
                setTimeout(() => {
                    window.location.reload()
                }, 1500)
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Task is not created!')
        }

    }

    const handleResetProjects = async () => {
        const token = sessionStorage.getItem('token');
        if (!token) {
            console.log('Token is expired!')
            return;
        } try {
            const response = await fetch('http://localhost:3000/resetTasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ currentPassword })
            })
            const data = await response.json();
            if (response.ok) {
                setProjects([]);
                setIsModalOpen(false);
                toast.success(data.message || 'Tasks successfully deleted!')
            } else {
                toast.error(data.message || 'Failed to reset tasks');
            }
        } catch (error) {
            console.error('Error: ', error)
        }
    }

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

    const sortedProjects = [...filteredProjects].sort((a, b) => {
        if (sortType === 'date-desc') {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        }
        if (sortType === 'date-asc') {
            return new Date(a.date).getTime() - new Date(b.date).getTime();
        }
        if (sortType === 'priority') {
            const priorityOrders = ['Urgent', 'High', 'Medium', 'Low'];
            return priorityOrders.indexOf(a.priority) - priorityOrders.indexOf(b.priority)
        }
        if (sortType === 'name') {
            return a.name.localeCompare(b.name);
        }
        return 0;
    });


    const handleChange = (value: string[][]) => {
        const flattened = value.flat();
        setFilterValues(flattened)
    }

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value)
    };

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
        setAssignedUser('');
        setPriority('');
        setProjectName('');
        setDescription('');
        setDeadline(null);
    };

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
        setProjects(updated)
    };

    const handleDeleteTask = (id: string) => {
        const updatedTasks = projects.filter((project) => project.id !== id)
        setProjects(updatedTasks)
    };

    const handleModalConfirm = () => {
        if (modalMode === 'create') {
            handleAddProject()
        } else {
            handleResetProjects();
        }
    };

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
                <div className="no_result">No results</div>
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
                assignedUser={assignedUser}
                currentPassword={currentPassword}
                onChangeCurrentPassword={setCurrentPassword}
                onChangeProjectName={setProjectName}
                onChangeDescription={setDescription}
                onChangeStatus={setStatus}
                onChangePriority={setPriority}
                onChangeDate={setDate}
                onChangeDeadline={setDeadline}
                onChangeAssignUser={setAssignedUser}
                onConfirm={handleModalConfirm}
                onCancel={handleCancel}
            />

            <ViewTaskModal open={isViewModalOpen} onCancel={closeViewModal} task={viewTask} disableSubtaskAdd={false} />

        </div>
    )
}