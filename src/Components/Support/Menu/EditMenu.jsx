import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MenuForm } from './MenuForm';
import LoadingSpinner from '../../../Pages/Custom/LoadingSpinner';
import { useAuth } from '../../../Middleware/Auth';
import CheckToken from '../../../utils/CheckToken';
import HandleUnauthorized from '../../../utils/HandleUnauthorized';

export default function EditMenu() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { logoutUser } = useAuth();
    const adminPanelBackendPath = import.meta.env.VITE_BACKEND_URL;
    const tokenname = import.meta.env.VITE_AdminTOKEN_NAME;
    const token = localStorage.getItem(tokenname);

    const [menu, setMenu] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchItem = async () => {
            if (!CheckToken(token, logoutUser, navigate)) {
                setLoading(false);
                return;
            }
            try {
                const res = await fetch(`${adminPanelBackendPath}/Support/EditMenu/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                if (HandleUnauthorized(data, logoutUser, navigate)) return;
                if (res.ok && data.menu) {
                    setMenu(data.menu);
                } else {
                    navigate("/Support/Menu");
                }
            } catch {
                navigate("/Support/Menu");
            } finally {
                setLoading(false);
            }
        };
        fetchItem();
    }, [id, adminPanelBackendPath, token, navigate, logoutUser]);

    if (loading) return <LoadingSpinner />;
    if (!menu) return null;

    return <MenuForm initialData={menu} isEdit={true} />;
}