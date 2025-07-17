// CLEAN
import { useState } from 'react';
import type { FormErrors } from "../types.tsx";
import registerSchema from '../validation/validationSchema';
import { ValidationError } from "yup";
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../LoginForm/LoginForm.css'

export default function RegisterForm() {
    const [fullname, setFullName] = useState<string>('');
    const [login, setLogin] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [formErrors, setFormErrors] = useState<FormErrors>({});

    const navigate = useNavigate();

    const handleRegister = async () => {
        try {
            await registerSchema.validate(
                { fullname, login, password, confirmPassword },
                { abortEarly: false }
            );

            const response = await fetch('http://localhost:3000/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fullname, login, password })
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(data.message || 'Registration successful!')
                setTimeout(() => {
                    setFullName('');
                    setLogin('');
                    setPassword('');
                    setConfirmPassword('');
                    setFormErrors({});
                    navigate('/login')
                }, 1500)
            } else {
                toast.error(data.message || 'Registration failed')
            }
        } catch (error) {
            if (error instanceof ValidationError) {
                const errors: FormErrors = {};
                error.inner.forEach((err) => {
                    if (err.path) {
                        errors[err.path as keyof FormErrors] = err.message;
                    }
                })
                setFormErrors(errors)
            }
            else {
                toast.error('Unexpected error during validation.');
                console.error('Server error')
            }
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
                    <h2>Register</h2>
                    <b style={{ fontSize: 22, marginBottom: 30, fontFamily: "serif" }}>Please create your user</b>
                    <p>Full name</p>
                    <input type="text"
                        className="fullname_input"
                        value={fullname}
                        placeholder="Enter your fullname"
                        onChange={(e) => setFullName(e.target.value)} />
                    {formErrors.fullname && <p className="error">{formErrors.fullname}</p>}

                    <p>Login</p>
                    <input
                        type="text"
                        className="login_input"
                        placeholder="Enter your login"
                        value={login}
                        onChange={(e) => setLogin(e.target.value)}
                    />
                    {formErrors.login && <p className="error">{formErrors.login}</p>}

                    <p>Password</p>
                    <input
                        type="password"
                        className="password_input"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    {formErrors.password && <p className="error">{formErrors.password}</p>}

                    <p>Password (Confirm)</p>
                    <input
                        type="password"
                        className="password_input"
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    {formErrors.confirmPassword && <p className="error">{formErrors.confirmPassword}</p>}

                    <button type="button" className="confirm_button" onClick={handleRegister}>Register</button>
                    <p style={{ marginTop: "1rem" }}>
                        Already have an account?
                        <button type="button" onClick={() => {
                            navigate("/login")
                        }}>Sign in</button>
                    </p>
                </form>
            </div>
        </div>
    )
}