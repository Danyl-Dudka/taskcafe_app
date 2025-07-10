import LoginForm from "../components/LoginForm/LoginForm";
import { AuthContext } from "../content";
import { useEffect, useState, type ReactNode } from "react";

export default function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuth, setIsAuth] = useState(false);

    useEffect(() => {
        const storedAuth = localStorage.getItem('isAuth');
        if (storedAuth === "true") {
            setIsAuth(true)
        }
        <LoginForm />
    }, [])

    return (
        <AuthContext.Provider value={{ isAuth, setIsAuth }}>
            {children}
        </AuthContext.Provider>
    )
}