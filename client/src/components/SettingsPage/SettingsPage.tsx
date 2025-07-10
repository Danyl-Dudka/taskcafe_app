import { useState } from 'react'
import './SettingsPage.css';

export default function SettingsPage() {
  const [currentPassword, setCurrentPasword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [succesMessage, setSuccessMessage] = useState<string>('');

  const login = localStorage.getItem('login');

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();

    const users = JSON.parse(localStorage.getItem('users') || '{}');

    if (!login || !users[login]) {
      setErrorMessage('User not found');
      setSuccessMessage('');
      return;
    }

    const user = users[login];

    if (user.password !== currentPassword) {
      setErrorMessage('Current password is incorrect!')
      setSuccessMessage('');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setErrorMessage('New passwords do not match!')
      setSuccessMessage('');
      return;
    }

    if (newPassword === currentPassword) {
      setErrorMessage('New passwords must be different!')
      setSuccessMessage('');
      return;
    }

    users[login].password = newPassword;
    localStorage.setItem('users', JSON.stringify(users));
    setSuccessMessage('Password changed successfully!');
    setErrorMessage('');

    setCurrentPasword('');
    setNewPassword('');
    setConfirmNewPassword('');

  }

  return (
    <div className='settings_page'>
      <div className='settings_container'>
        <h2>Change password:</h2>

        {errorMessage && <p className='error_paragraph'>{errorMessage}</p>}
        {succesMessage && <p className='success_paragraph'>{succesMessage}</p>}
        <form className='password_form' onSubmit={handleChangePassword}>
          <label>
            Current Password:

            <input type="password" value={currentPassword}
              onChange={(e) => setCurrentPasword(e.target.value)}
            />

          </label>

          <label>
            New Password:

            <input type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

          </label>

          <label>
            Confirm New Password:

            <input type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
            />

          </label>

          <button type="submit">Change Password</button>
        </form>
      </div>
    </div>
  )
}
