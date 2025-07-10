import { createContext } from "react";

interface AuthContextTypes {
    isAuth: boolean,
    setIsAuth: (auth: boolean) => void;
}

export const AuthContext = createContext<AuthContextTypes>({ isAuth: false, setIsAuth: () => { } });
export const TodosContext = createContext({});