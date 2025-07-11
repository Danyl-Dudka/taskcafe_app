import { useState } from 'react'
import './SettingsPage.css';

export default function SettingsPage() {
  const [currentPassword, setCurrentPasword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [succesMessage, setSuccessMessage] = useState<string>('');

  const token = sessionStorage.getItem('token')

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setErrorMessage('No token found, please log in again.');
      setSuccessMessage('');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ currentPassword, newPassword, confirmNewPassword })
      })

      const data = await response.json();
      if (response.ok) {
        setSuccessMessage(data.message || 'Password changed successfully!')
        setErrorMessage('');
      }
      else {
        setErrorMessage(data.message || 'Data is incorrect!')
        setSuccessMessage('');
      }
    } catch (error) {
      console.error('Error:', error);
    }
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
