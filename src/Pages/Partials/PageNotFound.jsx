import { useNavigate } from "react-router-dom";

const PageNotFound = () => {
    const navigate = useNavigate();

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#0f172a",
            color: "#fff",
            fontFamily: "'Poppins', sans-serif",
            textAlign: "center",
            padding: "20px"
        }}>
            <div style={{
                background: "rgba(255, 255, 255, 0.05)",
                padding: "40px",
                borderRadius: "16px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                maxWidth: "460px",
                width: "100%"
            }}>
                <h1 style={{ fontSize: "64px", fontWeight: "800", color: "var(--primary-color, #028802)", margin: 0 }}>
                    404
                </h1>
                <h2 style={{ fontSize: "20px", fontWeight: "600", margin: "16px 0 8px" }}>
                    Page Not Found
                </h2>
                <p style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "24px" }}>
                    Sorry, the page you&apos;re looking for doesn&apos;t exist or has been moved.
                </p>
                <button
                    onClick={() => navigate("/Signin")}
                    style={{
                        padding: "10px 24px",
                        backgroundColor: "var(--primary-color, #028802)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        fontWeight: "600",
                        cursor: "pointer"
                    }}
                >
                    Back to Sign In
                </button>
            </div>
        </div>
    );
};

export default PageNotFound;
