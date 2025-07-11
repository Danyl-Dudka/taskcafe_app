import { createContext } from "react";

interface AuthContextTypes {
    isAuth: boolean,
    setIsAuth: (auth: boolean) => void;
    fullname: string,
    setFullname: (name: string) => void;
}

export const AuthContext = createContext<AuthContextTypes>({ isAuth: false, setIsAuth: () => { }, fullname: '', setFullname: () => { } });
export const TodosContext = createContext({});