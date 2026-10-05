const HandleUnauthorized = (result, logoutUser, navigate, response) => {
    if (!result && !response) return false;

    const tokenname = import.meta.env.VITE_AdminTOKEN_NAME || "gemoraadmin_token";
    const status = response?.status || result?.status || result?.statusCode;
    const message = (typeof result === 'string' ? result : result?.message) || "";
    const lower = message.toLowerCase();

    const isUnauthorized =
        status === 401 ||
        status === 403 ||
        lower.includes("unauthorized") ||
        lower.includes("invalid token") ||
        lower.includes("token expired") ||
        lower.includes("jwt expired") ||
        lower.includes("token not get") ||
        lower.includes("token does not match") ||
        lower.includes("token missing") ||
        lower.includes("logged in elsewhere") ||
        lower.includes("invalidated");

    if (isUnauthorized) {
        console.warn("Unauthorized/expired session detected. Clearing token and redirecting...", message);
        localStorage.removeItem(tokenname);
        if (typeof logoutUser === 'function') logoutUser();
        if (typeof navigate === 'function') {
            navigate("/Signin");
        } else {
            window.location.href = "/Signin";
        }
        return true;
    }
    return false;
};

export default HandleUnauthorized;