import { useEffect, useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from '../../../Middleware/Auth';
import LoadingSpinner from '../../../Pages/Custom/LoadingSpinner';
import WarningModal from '../../../Pages/Custom/WarningModal';
import CustomSwitch from '../../../Pages/Custom/CustomSwitch';
import "../../../Scss/System/Policy/addpolicy.scss";
import RichTextEditor from '../../Custom/RichTextEditor';
import { useLanguage } from "../../../Context/LanguageContext";
import CheckToken from '../../../utils/CheckToken';
import HandleUnauthorized from '../../../utils/HandleUnauthorized';

const EditPolicy = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { translations, isRtl } = useLanguage();
    const { logoutUser } = useAuth();
    const adminPanelBackendPath = import.meta.env.VITE_BACKEND_URL;
    const tokenname = import.meta.env.VITE_AdminTOKEN_NAME;
    const [warningMessage, setWarningMessage] = useState("");
    const [showWarning, setShowWarning] = useState(false);
    const token = localStorage.getItem(tokenname);

    const [policyName, setPolicyName] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (translations.editpolicy) document.title = translations.editpolicy;
    }, [translations]);

    useEffect(() => {
        const fetchDetails = async () => {
            setIsLoading(true);
            if (!CheckToken(token, logoutUser, navigate)) {
                setIsLoading(false);
                return;
            }

            try {
                const response = await fetch(`${adminPanelBackendPath}/System/EditPolicy/${id}`, {
                    method: "GET",
                    headers: { Authorization: `Bearer ${token}` }
                });

                const result = await response.json();
                if (HandleUnauthorized(result, logoutUser, navigate)) return;

                if (response.ok) {
                    setPolicyName(result.policyname || "");
                    setDescription(result.description || "");
                    setStatus(Boolean(result.status));
                } else {
                    const errorMessages = {
                        "Policy not found": translations.policynotfound || "Policy not found",
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

        if (!policyName.trim() || !description.trim()) {
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
                policyname: policyName.trim(),
                description: description.trim(),
                status
            };

            const response = await fetch(`${adminPanelBackendPath}/System/UpdatePolicy/${id}`, {
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
                navigate("/System/Policy", {
                    state: { message: translations.updatepolicysuccessfull || "Policy updated successfully" }
                });
            } else {
                const errorMessages = {
                    "All fields are required": translations.allfieldrequired || "All fields are required",
                    "Policy Already Exists": translations.policyalreadyexists || "Policy Already Exists",
                    "Policy not found": translations.policynotfound || "Policy not found",
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

    const handleCancel = () => navigate(`/System/Policy`);

    return (
        <>
            {showWarning && <WarningModal message={warningMessage} onClose={() => setShowWarning(false)} />}
            <div className={`AddPolicy-container ${isRtl ? 'rtl-addpolicy' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
                <div className="Addpolicy-container">
                    <h6 className="Addpolicy-headingname">{translations.editpolicy || "Edit Policy"}</h6>
                    <div className="Addpolicy-form-container">
                        {isLoading ? (
                            <LoadingSpinner />
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="policyname">
                                            {translations.policyname || "Policy Name"} <span style={{ color: "red" }}>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="policyname"
                                            name="policyname"
                                            autoComplete="off"
                                            placeholder={translations.enterpolicyname || "Enter Policy Name"}
                                            required
                                            value={policyName}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (value.length === 1 && value === " ") return;
                                                setPolicyName(value);
                                            }}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="status">{translations.status || "Status"}</label>
                                        <div className="switch-container">
                                            <CustomSwitch
                                                checked={status}
                                                onChange={(e) => setStatus(e.target.checked)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="form-row full-width">
                                    <div className="form-group">
                                        <label htmlFor="description">
                                            {translations.policydescription || translations.description || "Policy Description"} <span style={{ color: "red" }}>*</span>
                                        </label>
                                        <RichTextEditor
                                            value={description}
                                            onChange={(val) => setDescription(val)}
                                            placeholder={translations.enterpolicydescription || "Enter Policy Description"}
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

export default EditPolicy;
