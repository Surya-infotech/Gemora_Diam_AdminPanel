import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../../Middleware/Auth';
import LoadingSpinner from '../../../Pages/Custom/LoadingSpinner';
import WarningModal from '../../../Pages/Custom/WarningModal';
import "../../../Scss/Attributes/RingSize/addringsize.scss";
import { useLanguage } from "../../../Context/LanguageContext";
import CheckToken from '../../../utils/CheckToken';
import HandleUnauthorized from '../../../utils/HandleUnauthorized';

const AddRingSize = () => {
    const navigate = useNavigate();
    const { translations, isRtl } = useLanguage();
    const { logoutUser } = useAuth();
    const adminPanelBackendPath = import.meta.env.VITE_BACKEND_URL;
    const tokenname = import.meta.env.VITE_AdminTOKEN_NAME;
    const [warningMessage, setWarningMessage] = useState("");
    const [showWarning, setShowWarning] = useState(false);
    const token = localStorage.getItem(tokenname);

    const [ringSize, setRingSize] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (translations.addringsize) document.title = translations.addringsize;
    }, [translations]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!ringSize.trim()) {
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
                ringsize: ringSize.trim(),
            };

            const response = await fetch(`${adminPanelBackendPath}/Attributes/AddRingSize`, {
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
                navigate("/Attributes/RingSize", {
                    state: { message: translations.addringsizesuccessfull || "Ring Size added successfully" }
                });
            } else {
                const errorMessages = {
                    "All fields are required": translations.allfieldrequired || "All fields are required",
                    "Ring Size Already Exists": translations.ringsizealreadyexists || "Ring Size Already Exists",
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

    const handleCancel = () => navigate(`/Attributes/RingSize`);

    return (
        <>
            {showWarning && <WarningModal message={warningMessage} onClose={() => setShowWarning(false)} />}
            <div className={`AddRingSize-container ${isRtl ? 'rtl-addringsize' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
                <div className="Addringsize-container">
                    <h6 className="Addringsize-headingname">{translations.addringsize || "Add Ring Size"}</h6>
                    <div className="Addringsize-form-container">
                        {isLoading ? (
                            <LoadingSpinner />
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="ringsize">
                                            {translations.ringsize || "Ring Size"} <span style={{ color: "red" }}>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="ringsize"
                                            name="ringsize"
                                            autoComplete="off"
                                            placeholder={translations.enterringsize || "Enter Ring Size (e.g. 5, 6, 7)"}
                                            autoFocus
                                            required
                                            value={ringSize}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (value.length === 1 && value === " ") return;
                                                setRingSize(value);
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

export default AddRingSize;
