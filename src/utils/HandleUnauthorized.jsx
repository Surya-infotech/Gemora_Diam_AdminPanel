const HandleUnauthorized = (result, logoutUser, navigate) => {
    if (!result || typeof result !== 'object') return false;

    const unauthorizedMessages = [
        "Unauthorized, Token Not Get",
        "Unauthorized, Token does not match",
        "Token expired, please log in again",
        "Invalid token, please log in again",
        "Unauthorized",
        "jwt expired",
        "invalid token"
    ];

    if (
        result.status === 401 ||
        unauthorizedMessages.includes(result.message)
    ) {
        console.log("Unauthorized. Redirecting to Signin...");
        if (typeof logoutUser === 'function') logoutUser();
        if (typeof navigate === 'function') navigate("/Signin");
        return true;
    }
    return false;
};

export default HandleUnauthorized;