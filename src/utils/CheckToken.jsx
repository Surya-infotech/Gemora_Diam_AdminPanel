const CheckToken = (token, logoutUser, navigate) => {

    if (!token) {
        logoutUser();
        navigate("/Signin");
        return false;
    }
    return true;
};

export default CheckToken;