// CLEAN ++ CHECKED
import { useContext, useState } from "react";
import { AuthContext } from "../../content";
import './LoginForm.css';
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
export default function LoginForm() {
    const { setIsAuth } = useContext(AuthContext);
    const [login, setLogin] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string>('');

    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const response = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ login, password })
            })

            const data = await response.json();

            if (response.ok) {
                toast.success(data.message || 'Login successful!')
                setTimeout(() => {
                    sessionStorage.setItem('token', data.token)
                    sessionStorage.setItem('fullname', data.fullname)
                    setIsAuth(true)
                    setLogin('');
                    setPassword('');
                    setError('');
                }, 1500)
            } else {
                toast.error(data.message || 'Incorrect login or password!')
            }
        } catch (error) {
            console.error('Login error:', error);
            toast.error('Server error')
        }
    };

    return (
        <div className="main">
            <div className="image_hpage">
                <img src="/images/login_picture_human.svg" alt="login_picture" className="human_logo" />
            </div>
            <div className="form_wrapper">
                <form onSubmit={(e) => e.preventDefault()}>
                    <img src="/images/taskcafe_main_logo.png" alt="taskcafe-logo" className="main_logo" />
                    <div>
                        <h2>Sign in</h2>
                        <input
                            type="text"
                            className="login_input"
                            placeholder="Login"
                            value={login}
                            onChange={(e) => setLogin(e.target.value)}
                        />
                        <input
                            type="password"
                            className="password_input"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        {error && <p className="error_message">Incorrect login or password</p>}

                        <button type="button" className="confirm_button" onClick={handleLogin}>Login</button>


                    </div>
                    <p style={{ marginTop: "1rem" }}>
                        No account?
                        <button type="button" onClick={() => {
                            navigate("/registration")
                        }}>Registration</button>
                    </p>
                </form>
            </div>
        </div>
    )
}