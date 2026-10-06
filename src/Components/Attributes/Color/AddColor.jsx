import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../../Middleware/Auth';
import LoadingSpinner from '../../../Pages/Custom/LoadingSpinner';
import WarningModal from '../../../Pages/Custom/WarningModal';
import Dropdown from '../../Dropdown/Dropdown';
import "../../../Scss/Attributes/Color/addcolor.scss";
import { useLanguage } from "../../../Context/LanguageContext";
import CheckToken from '../../../utils/CheckToken';
import HandleUnauthorized from '../../../utils/HandleUnauthorized';

const AddColor = () => {
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
    const [isLoading, setIsLoading] = useState(false);

    const colorTypeOptions = [
        { label: "Diamond", value: "Diamond" },
        { label: "Band", value: "Band" }
    ];

    useEffect(() => {
        if (translations.addcolor) document.title = translations.addcolor;
        else document.title = "Add Color";
    }, [translations]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!colorName.trim()) {
            setWarningMessage(translations.allfieldrequired || "Color Name is required");
            setShowWarning(true);
            return;
        }

        if (!colorType) {
            setWarningMessage(translations.colortyperequired || "Please select a Color Type");
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
                colortype: colorType
            };

            const response = await fetch(`${adminPanelBackendPath}/Attributes/AddColor`, {
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
                navigate("/Attributes/Color", {
                    state: { message: translations.addcolorsuccessfull || "Color added successfully" }
                });
            } else {
                const errorMessages = {
                    "All fields are required": translations.allfieldrequired || "All fields are required",
                    "Color with this type already exists": translations.coloralreadyexists || "Color with this type already exists",
                    "Color Type must be either Diamond or Band": translations.colortypeinvalid || "Color Type must be either Diamond or Band",
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
                    <h6 className="Addcolor-headingname">{translations.addcolor || "Add Color"}</h6>
                    <div className="Addcolor-form-container">
                        {isLoading ? (
                            <LoadingSpinner />
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="colorname">
                                            {translations.colorname || "Color Name"} <span style={{ color: "red" }}>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="colorname"
                                            name="colorname"
                                            autoComplete="off"
                                            placeholder={translations.entercolorname || "Enter Color Name"}
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
                                            {translations.colortype || "Color Type"} <span style={{ color: "red" }}>*</span>
                                        </label>
                                        <Dropdown
                                            options={colorTypeOptions}
                                            labelKey="label"
                                            valueKey="value"
                                            selectedValue={colorType}
                                            onValueChange={(val) => setColorType(val)}
                                            placeholder={translations.selectcolortype || "Select Color Type"}
                                            showSearch={false}
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
                                        {translations.cancel || "Cancel"}
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary submit-btn"
                                        disabled={isLoading}
                                    >
                                        {translations.save || "Save"}
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

export default AddColor;
