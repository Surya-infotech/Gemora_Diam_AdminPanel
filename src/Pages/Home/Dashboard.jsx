import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Middleware/Auth";
import CheckToken from "../../utils/CheckToken";

const Dashboard = () => {
    const navigate = useNavigate();
    const { logoutUser } = useAuth();
    const tokenname = import.meta.env.VITE_AdminTOKEN_NAME;
    const token = localStorage.getItem(tokenname);
    const BackendPath = import.meta.env.VITE_BACKEND_URL;
    const [admin, setAdmin] = useState(null);

    useEffect(() => {
        if (!CheckToken(token, logoutUser, navigate)) return;

        const fetchAdmin = async () => {
            try {
                let response = await fetch(`${BackendPath}/admin/GetAdminDetails`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (response.status === 404) {
                    response = await fetch(`${BackendPath}/General/admin/GetAdminDetails`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    });
                }

                if (response.ok) {
                    const data = await response.json();
                    setAdmin(data.admin);
                }
            } catch (err) {
                console.error("Failed to fetch admin details:", err);
            }
        };

        fetchAdmin();
    }, [token, navigate, logoutUser, BackendPath]);

    const handleLogout = () => {
        logoutUser();
        navigate("/Signin");
    };

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
            color: "#fff",
            fontFamily: "'Poppins', sans-serif",
            padding: "20px"
        }}>
            <div style={{
                background: "rgba(255, 255, 255, 0.08)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: "16px",
                padding: "36px 48px",
                maxWidth: "520px",
                width: "100%",
                textAlign: "center",
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)"
            }}>
                <div style={{
                    width: "68px",
                    height: "68px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(2, 136, 2, 0.2)",
                    border: "2px solid #028802",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 20px",
                    fontSize: "28px"
                }}>
                    💎
                </div>
                <h1 style={{ fontSize: "26px", fontWeight: "700", marginBottom: "8px" }}>
                    Gemora Diam Admin
                </h1>
                <p style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "24px" }}>
                    Authentication Successful
                </p>

                {admin ? (
                    <div style={{
                        background: "rgba(0, 0, 0, 0.25)",
                        borderRadius: "10px",
                        padding: "16px 20px",
                        textAlign: "left",
                        marginBottom: "28px",
                        fontSize: "14px"
                    }}>
                        <p style={{ margin: "4px 0" }}><strong>Name:</strong> {admin.adminfirstname} {admin.adminlastname}</p>
                        <p style={{ margin: "4px 0" }}><strong>Email:</strong> {admin.email}</p>
                        <p style={{ margin: "4px 0" }}><strong>Role:</strong> Administrator</p>
                    </div>
                ) : (
                    <div style={{
                        background: "rgba(0, 0, 0, 0.25)",
                        borderRadius: "10px",
                        padding: "16px 20px",
                        marginBottom: "28px",
                        fontSize: "14px",
                        color: "#94a3b8"
                    }}>
                        Logged in as Super Admin
                    </div>
                )}

                <button
                    onClick={handleLogout}
                    style={{
                        width: "100%",
                        padding: "12px 20px",
                        backgroundColor: "#ef4444",
                        color: "#fff",
                        border: "none",
                        borderRadius: "10px",
                        fontWeight: "600",
                        fontSize: "15px",
                        cursor: "pointer",
                        transition: "all 0.2s ease"
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#dc2626"}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#ef4444"}
                >
                    Sign Out
                </button>
            </div>
        </div>
    );
};

export default Dashboard;
