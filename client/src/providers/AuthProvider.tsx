import { AuthContext } from "../content";
import { useEffect, useState, type ReactNode } from "react";

export default function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuth, setIsAuth] = useState(false);
    const [fullname, setFullname] = useState('');

    useEffect(() => {
        const token = sessionStorage.getItem('token')
        const name = sessionStorage.getItem('fullname')
        if (token) {
            setIsAuth(true)
            if (name) {
                setFullname(name)
            }
        }
    }, [])

    return (
        <AuthContext.Provider value={{ isAuth, setIsAuth, fullname, setFullname }}>
            {children}
        </AuthContext.Provider>
    )
}