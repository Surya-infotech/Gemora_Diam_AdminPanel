import { useEffect } from 'react';
import { useAuth } from '../../Middleware/Auth';
const Logout = () => {
  const {
    logoutUser
  } = useAuth();
  const URL = import.meta.env.VITE_URL;
  useEffect(() => {
    logoutUser();
    const message = encodeURIComponent("Sign out successful");
    window.location.href = `${URL}?message=${message}`;
  }, [logoutUser, URL]);
  return null;
};
export default Logout;