import { createContext, useContext, useState } from "react";

export const AuthContext = createContext();

export const AuthProider = ({ children }) => {
    const tokenname = import.meta.env.VITE_AdminTOKEN_NAME;

    const [token, setToken] = useState(localStorage.getItem(tokenname));
    const [role, setRole] = useState(localStorage.getItem("role") || "");

    const storetoken = (serverToken, userRole) => {
        localStorage.setItem(tokenname, serverToken);
        setToken(serverToken);
        if (userRole) {
            localStorage.setItem("role", userRole);
            setRole(userRole);
        }
    };

    const logoutUser = () => {
        setToken("");
        setRole("");
        localStorage.removeItem(tokenname);
        localStorage.removeItem("role");
    };

    return (
        <AuthContext.Provider value={{ token, role, storetoken, logoutUser }}>
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