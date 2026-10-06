import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../../Middleware/Auth';
import LoadingSpinner from '../../../Pages/Custom/LoadingSpinner';
import WarningModal from '../../../Pages/Custom/WarningModal';
import "../../../Scss/Attributes/Stone/addstone.scss";
import { useLanguage } from "../../../Context/LanguageContext";
import CheckToken from '../../../utils/CheckToken';
import HandleUnauthorized from '../../../utils/HandleUnauthorized';

const AddStone = () => {
    const navigate = useNavigate();
    const { translations, isRtl } = useLanguage();
    const { logoutUser } = useAuth();
    const adminPanelBackendPath = import.meta.env.VITE_BACKEND_URL;
    const tokenname = import.meta.env.VITE_AdminTOKEN_NAME;
    const [warningMessage, setWarningMessage] = useState("");
    const [showWarning, setShowWarning] = useState(false);
    const token = localStorage.getItem(tokenname);

    const [stoneName, setStoneName] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (translations.addstone) document.title = translations.addstone;
    }, [translations]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stoneName.trim()) {
            setWarningMessage(translations.allfieldrequired || "All fields are required");
            setShowWarning(true);
            return;
        }

        setIsLoading(true);
        if (!CheckToken(token, logoutUser, navigate)) {
            setIsLoading(false);
            return;
        }

        try {
            const payload = {
                stonename: stoneName.trim(),
            };

            const response = await fetch(`${adminPanelBackendPath}/Attributes/AddStone`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();
            if (HandleUnauthorized(result, logoutUser, navigate)) return;

            if (response.ok) {
                navigate("/Attributes/Stone", {
                    state: { message: translations.addstonesuccessfull || "Stone added successfully" }
                });
            } else {
                const errorMessages = {
                    "All fields are required": translations.allfieldrequired || "All fields are required",
                    "Stone Already Exists": translations.stonealreadyexists || "Stone Already Exists",
                    "Server error": translations.servererror
                };
                setWarningMessage(errorMessages[result.message] || translations.servererror);
                setShowWarning(true);
            }
        } catch {
            setWarningMessage(translations.servererror);
            setShowWarning(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => navigate(`/Attributes/Stone`);

    return (
        <>
            {showWarning && <WarningModal message={warningMessage} onClose={() => setShowWarning(false)} />}
            <div className={`AddStone-container ${isRtl ? 'rtl-addstone' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
                <div className="Addstone-container">
                    <h6 className="Addstone-headingname">{translations.addstone || "Add Stone"}</h6>
                    <div className="Addstone-form-container">
                        {isLoading ? (
                            <LoadingSpinner />
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="stonename">
                                            {translations.stonename || "Stone Name"} <span style={{ color: "red" }}>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="stonename"
                                            name="stonename"
                                            autoComplete="off"
                                            placeholder={translations.enterstonename || "Enter Stone Name (e.g. Diamond, Moissanite)"}
                                            autoFocus
                                            required
                                            value={stoneName}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (value.length === 1 && value === " ") return;
                                                setStoneName(value);
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="button-group">
                                    <button
                                        type="button"
                                        className="btn btn-secondary cancelbtn"
                                        onClick={handleCancel}
                                        disabled={isLoading}
                                    >
                                        {translations.cancel}
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-success submit-btn"
                                        disabled={isLoading}
                                    >
                                        {translations.save}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default AddStone;
