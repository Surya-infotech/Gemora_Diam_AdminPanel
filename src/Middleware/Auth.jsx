import { createContext, useContext, useState } from "react";

export const AuthContext = createContext();

export const AuthProider = ({ children }) => {
    const tokenname = import.meta.env.VITE_AdminTOKEN_NAME;

    const [token, setToken] = useState(localStorage.getItem(tokenname));

    const storetoken = (serverToken) => {
        localStorage.setItem(tokenname, serverToken);
        setToken(serverToken);
    };

    const logoutUser = () => {
        setToken("");
        localStorage.removeItem(tokenname);
    };

    return (
        <AuthContext.Provider value={{ token, storetoken, logoutUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const authContextValue = useContext(AuthContext);
    if (!authContextValue) {
        throw new Error("useAuth used outside of the Provider");
    }
    return authContextValue;
}