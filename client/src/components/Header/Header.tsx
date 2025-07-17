// CLEAN
import './header.css';
import { useNavigate } from 'react-router';
import { BadgeCheck, Home } from 'lucide-react';
import { DownOutlined, LogoutOutlined, SettingOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Dropdown, Space } from 'antd';

export default function Header() {
    const navigate = useNavigate();
    const handleSignOut = () => {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('fullname');
        window.location.reload();
    }

    const fullname = sessionStorage.getItem('fullname') || 'User';

    const initials = fullname.split(' ').map(name => name[0]?.toUpperCase()).join('');

    const settingsNavigate = () => {
        navigate('/settings')
    }

    const items: MenuProps['items'] = [
        {
            key: '1',
            label: `Hi, ${fullname}`,
            disabled: true,
        },
        {
            type: 'divider',
        },
        {
            key: '2',
            label: 'Profile',
            extra: '⌘P',
        },
        {
            key: '3',
            label: 'Settings',
            icon: <SettingOutlined />,
            onClick: () => settingsNavigate(),
        },
        {
            key: '4',
            label: 'Sign out',
            icon: <LogoutOutlined />,
            danger: true,
            onClick: handleSignOut,
        },
    ];

    return (
        <>
            <header>
                <img className="min_logo" src="/images/taskcafe.min.svg" alt="taskcafe_min_logo" onClick={() => navigate('/')} />
                <p className='paragraph_logo' onClick={() => navigate('/')}>TaskCafé</p>
                <div className='navigate_btns'>
                    <button type="button" className='completed_projects_btn' onClick={() => navigate('/completed_projects')}>
                        <span>Completed projects</span>
                        <BadgeCheck size={36} className='text-white' />
                    </button>
                    <button type="button" className='home_btn' onClick={() => navigate('/')}>
                        <span>Home</span>
                        <Home size={36} className="text-white" />
                    </button>

                    <Dropdown menu={{ items }} placement='bottomRight' trigger={['click']}>
                        <button type="button" className='user_button'>
                            <Space>
                                <div className="user_avatar">{initials}</div>
                                <DownOutlined style={{ color: 'white' }} />
                            </Space>
                        </button>
                    </Dropdown>
                </div>
            </header >
        </>
    )
}