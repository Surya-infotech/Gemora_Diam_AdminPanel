import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../../Middleware/Auth';
import LoadingSpinner from '../../../Pages/Custom/LoadingSpinner';
import WarningModal from '../../../Pages/Custom/WarningModal';
import "../../../Scss/Attributes/Metal/addmetal.scss";
import { useLanguage } from "../../../Context/LanguageContext";
import CheckToken from '../../../utils/CheckToken';
import HandleUnauthorized from '../../../utils/HandleUnauthorized';

const AddMetal = () => {
    const navigate = useNavigate();
    const { translations, isRtl } = useLanguage();
    const { logoutUser } = useAuth();
    const adminPanelBackendPath = import.meta.env.VITE_BACKEND_URL;
    const tokenname = import.meta.env.VITE_AdminTOKEN_NAME;
    const [warningMessage, setWarningMessage] = useState("");
    const [showWarning, setShowWarning] = useState(false);
    const token = localStorage.getItem(tokenname);

    const [metalName, setMetalName] = useState("");
    const [metalType, setMetalType] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (translations.addmetal) document.title = translations.addmetal;
    }, [translations]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!metalName.trim() || !metalType.trim()) {
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
                metalname: metalName.trim(),
                metaltype: metalType.trim(),
                status: true
            };

            const response = await fetch(`${adminPanelBackendPath}/Attributes/AddMetal`, {
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
                navigate(`/Attributes/Metal`, {
                    state: { message: translations.addmetalsuccessfull || "Metal added successfully" }
                });
            } else {
                const errorMessages = {
                    "All fields are required": translations.allfieldrequired || "All fields are required",
                    "Metal Name Already Exists": translations.metalnamealreadyexists || "Metal Name Already Exists",
                    "Server error": translations.servererror
                };
                setWarningMessage(errorMessages[result.message] || result.message || translations.servererror);
                setShowWarning(true);
            }
        } catch {
            setWarningMessage(translations.servererror);
            setShowWarning(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => navigate(`/Attributes/Metal`);

    return (
        <>
            {showWarning && <WarningModal message={warningMessage} onClose={() => setShowWarning(false)} />}
            <div className={`AddMetal-container ${isRtl ? 'rtl-addmetal' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
                <div className="Addmetal-container">
                    <h6 className="Addmetal-headingname">{translations.addmetal || "Add Metal"}</h6>
                    <div className="Addmetal-form-container">
                        {isLoading ? (
                            <LoadingSpinner />
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="metalname">
                                            {translations.metalname || "Metal Name"} <span style={{ color: "red" }}>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="metalname"
                                            name="metalname"
                                            autoComplete="off"
                                            placeholder={translations.entermetalname || "Enter Metal Name"}
                                            autoFocus
                                            required
                                            value={metalName}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (value.length === 1 && value === " ") return;
                                                setMetalName(value);
                                            }}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="metaltype">
                                            {translations.metaltype || "Metal Type"} <span style={{ color: "red" }}>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="metaltype"
                                            name="metaltype"
                                            autoComplete="off"
                                            placeholder={translations.entermetaltype || "Enter Metal Type"}
                                            required
                                            value={metalType}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (value.length === 1 && value === " ") return;
                                                setMetalType(value);
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

export default AddMetal;
