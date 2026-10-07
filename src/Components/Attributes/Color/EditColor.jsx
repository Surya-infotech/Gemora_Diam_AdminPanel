import { useEffect, useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from '../../../Middleware/Auth';
import LoadingSpinner from '../../../Pages/Custom/LoadingSpinner';
import WarningModal from '../../../Pages/Custom/WarningModal';
import CustomSwitch from '../../../Pages/Custom/CustomSwitch';
import Dropdown from '../../Dropdown/Dropdown';
import "../../../Scss/Attributes/Color/addcolor.scss";
import { useLanguage } from "../../../Context/LanguageContext";
import CheckToken from '../../../utils/CheckToken';
import HandleUnauthorized from '../../../utils/HandleUnauthorized';

const EditColor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { translations, isRtl } = useLanguage();
    const { logoutUser } = useAuth();
    const adminPanelBackendPath = import.meta.env.VITE_BACKEND_URL;
    const tokenname = import.meta.env.VITE_AdminTOKEN_NAME;
    const [warningMessage, setWarningMessage] = useState("");
    const [showWarning, setShowWarning] = useState(false);
    const token = localStorage.getItem(tokenname);

    const [colorName, setColorName] = useState("");
    const [colorType, setColorType] = useState(null);
    const [status, setStatus] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const colorTypeOptions = [
        { label: "Diamond", value: "Diamond" },
        { label: "Band", value: "Band" }
    ];

    useEffect(() => {
        if (translations.editcolor) document.title = translations.editcolor;
    }, [translations]);

    useEffect(() => {
        const fetchDetails = async () => {
            setIsLoading(true);
            if (!CheckToken(token, logoutUser, navigate)) {
                setIsLoading(false);
                return;
            }

            try {
                const response = await fetch(`${adminPanelBackendPath}/Attributes/EditColor/${id}`, {
                    method: "GET",
                    headers: { Authorization: `Bearer ${token}` }
                });

                const result = await response.json();
                if (HandleUnauthorized(result, logoutUser, navigate)) return;

                if (response.ok) {
                    setColorName(result.colorname || "");
                    setColorType(result.colortype || null);
                    setStatus(Boolean(result.status));
                } else {
                    const errorMessages = {
                        "Color not found": translations.colornotfound,
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
    }, [id, token, adminPanelBackendPath, logoutUser, navigate, translations]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!colorName.trim()) {
            setWarningMessage(translations.allfieldrequired);
            setShowWarning(true);
            return;
        }

        if (!colorType) {
            setWarningMessage(translations.colortyperequired);
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
                colorname: colorName.trim(),
                colortype: colorType,
                status
            };

            const response = await fetch(`${adminPanelBackendPath}/Attributes/UpdateColor/${id}`, {
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
                navigate("/Attributes/Color", {
                    state: { message: translations.updatecolorsuccessfull }
                });
            } else {
                const errorMessages = {
                    "All fields are required": translations.allfieldrequired,
                    "Color with this type already exists": translations.coloralreadyexists,
                    "Color Type must be either Diamond or Band": translations.colortypeinvalid,
                    "Color not found": translations.colornotfound,
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

    const handleCancel = () => navigate(`/Attributes/Color`);

    return (
        <>
            {showWarning && <WarningModal message={warningMessage} onClose={() => setShowWarning(false)} />}
            <div className={`AddColor-container ${isRtl ? 'rtl-addcolor' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
                <div className="Addcolor-container">
                    <h6 className="Addcolor-headingname">{translations.editcolor}</h6>
                    <div className="Addcolor-form-container">
                        {isLoading ? (
                            <LoadingSpinner />
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="colorname">
                                            {translations.colorname} <span style={{ color: "red" }}>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="colorname"
                                            name="colorname"
                                            autoComplete="off"
                                            placeholder={translations.entercolorname}
                                            autoFocus
                                            required
                                            value={colorName}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (value.length === 1 && value === " ") return;
                                                setColorName(value);
                                            }}
                                            onInput={(e) => (e.target.value = e.target.value.replace(/^\s+/, ""))}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>
                                            {translations.colortype} <span style={{ color: "red" }}>*</span>
                                        </label>
                                        <Dropdown
                                            options={colorTypeOptions}
                                            labelKey="label"
                                            valueKey="value"
                                            selectedValue={colorType}
                                            onValueChange={(val) => setColorType(val)}
                                            placeholder={translations.selectcolortype}
                                            showSearch={false}
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>{translations.status}</label>
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

export default EditColor;
