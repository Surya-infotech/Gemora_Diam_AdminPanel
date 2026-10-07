import { useEffect, useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from '../../../Middleware/Auth';
import LoadingSpinner from '../../../Pages/Custom/LoadingSpinner';
import WarningModal from '../../../Pages/Custom/WarningModal';
import CustomSwitch from '../../../Pages/Custom/CustomSwitch';
import "../../../Scss/Attributes/DiamondSize/adddiamondsize.scss";
import { useLanguage } from "../../../Context/LanguageContext";
import CheckToken from '../../../utils/CheckToken';
import HandleUnauthorized from '../../../utils/HandleUnauthorized';

const EditDiamondSize = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { translations, isRtl } = useLanguage();
    const { logoutUser } = useAuth();
    const adminPanelBackendPath = import.meta.env.VITE_BACKEND_URL;
    const tokenname = import.meta.env.VITE_AdminTOKEN_NAME;
    const [warningMessage, setWarningMessage] = useState("");
    const [showWarning, setShowWarning] = useState(false);
    const token = localStorage.getItem(tokenname);

    const [diamondSize, setDiamondSize] = useState("");
    const [status, setStatus] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (translations.editdiamondsize) document.title = translations.editdiamondsize;
    }, [translations]);

    useEffect(() => {
        const fetchDetails = async () => {
            setIsLoading(true);
            if (!CheckToken(token, logoutUser, navigate)) {
                setIsLoading(false);
                return;
            }

            try {
                const response = await fetch(`${adminPanelBackendPath}/Attributes/EditDiamondSize/${id}`, {
                    method: "GET",
                    headers: { Authorization: `Bearer ${token}` }
                });

                const result = await response.json();
                if (HandleUnauthorized(result, logoutUser, navigate)) return;

                if (response.ok && result) {
                    setDiamondSize(result.diamondsize || "");
                    setStatus(result.status !== undefined ? Boolean(result.status) : false);
                } else {
                    const errorMessages = {
                        "Diamond Size not found": translations.diamondsizenotfound,
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

        fetchDetails();
    }, [id, token, navigate, logoutUser, adminPanelBackendPath, translations]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!diamondSize.trim()) {
            setWarningMessage(translations.allfieldrequired);
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
                diamondsize: diamondSize.trim(),
                status: Boolean(status)
            };

            const response = await fetch(`${adminPanelBackendPath}/Attributes/UpdateDiamondSize/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();
            if (HandleUnauthorized(result, logoutUser, navigate)) return;

            if (response.ok) {
                navigate(`/Attributes/DiamondSize`, {
                    state: { message: translations.updatediamondsizesuccessfull }
                });
            } else {
                const errorMessages = {
                    "All fields are required": translations.allfieldrequired,
                    "Diamond Size Already Exists": translations.diamondsizealreadyexists,
                    "Diamond Size not found": translations.diamondsizenotfound,
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

    const handleCancel = () => navigate(`/Attributes/DiamondSize`);

    return (
        <>
            {showWarning && <WarningModal message={warningMessage} onClose={() => setShowWarning(false)} />}
            <div className={`AddDiamondSize-container ${isRtl ? 'rtl-adddiamondsize' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
                <div className="Adddiamondsize-container">
                    <h6 className="Adddiamondsize-headingname">{translations.editdiamondsize}</h6>
                    <div className="Adddiamondsize-form-container">
                        {isLoading ? (
                            <LoadingSpinner />
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="diamondsize">
                                            {translations.diamondsize} <span style={{ color: "red" }}>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="diamondsize"
                                            name="diamondsize"
                                            autoComplete="off"
                                            placeholder={translations.enterdiamondsize}
                                            required
                                            value={diamondSize}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (value.length === 1 && value === " ") return;
                                                setDiamondSize(value);
                                            }}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="status">{translations.status}</label>
                                        <div className="switch-container">
                                            <CustomSwitch
                                                checked={status}
                                                onChange={(e) => setStatus(e.target.checked)}
                                            />
                                        </div>
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

export default EditDiamondSize;
