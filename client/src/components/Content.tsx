// CLEAN
import { AuthContext } from "../content";
import { useContext } from "react";
import LoginForm from "./LoginForm/LoginForm";
import TaskApp from "./TaskApp/TaskApp";
import SettingsPage from "./SettingsPage/SettingsPage";
import { Route, Routes, Navigate } from "react-router-dom";
import Header from "./Header/Header";
import CompletedProjectsPage from "./CompletedProjectsPage/CompletedProjectsPage";
import RegisterForm from "./RegisterForm/RegisterForm";
export default function Content() {
    const { isAuth } = useContext(AuthContext);

    return (
        <>
            {isAuth && <Header />}
            <Routes>
                <Route
                    path="/"
                    element={isAuth ? <TaskApp /> : <Navigate to="/login" />} />
                <Route path="/registration"
                    element={isAuth ? <Navigate to="/" /> : <RegisterForm />} />
                <Route
                    path="/login"
                    element={isAuth ? <Navigate to="/" /> : <LoginForm />}
                />
                <Route
                    path="/settings"
                    element={isAuth ? <SettingsPage /> : <Navigate to="/login" />}
                />
                <Route
                    path="/completed_projects"
                    element={isAuth ? <CompletedProjectsPage /> : <Navigate to="/login" />}
                />
            </Routes>
        </>
    )
}