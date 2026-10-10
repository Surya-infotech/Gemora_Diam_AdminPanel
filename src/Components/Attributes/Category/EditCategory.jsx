import { useEffect, useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from '../../../Middleware/Auth';
import LoadingSpinner from '../../../Pages/Custom/LoadingSpinner';
import WarningModal from '../../../Pages/Custom/WarningModal';
import CustomSwitch from '../../../Pages/Custom/CustomSwitch';
import "../../../Scss/Attributes/Category/addcategory.scss";
import { useLanguage } from "../../../Context/LanguageContext";
import CheckToken from '../../../utils/CheckToken';
import HandleUnauthorized from '../../../utils/HandleUnauthorized';

const EditCategory = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { translations, isRtl } = useLanguage();
    const { logoutUser } = useAuth();
    const adminPanelBackendPath = import.meta.env.VITE_BACKEND_URL;
    const tokenname = import.meta.env.VITE_AdminTOKEN_NAME;
    const [warningMessage, setWarningMessage] = useState("");
    const [showWarning, setShowWarning] = useState(false);
    const token = localStorage.getItem(tokenname);

    const [categoryName, setCategoryName] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const MAX_DESCRIPTION_LENGTH = 120;

    useEffect(() => {
        if (translations.editcategory) document.title = translations.editcategory;
    }, [translations]);

    useEffect(() => {
        const fetchDetails = async () => {
            setIsLoading(true);
            if (!CheckToken(token, logoutUser, navigate)) {
                setIsLoading(false);
                return;
            }

            try {
                const response = await fetch(`${adminPanelBackendPath}/Attributes/EditCategory/${id}`, {
                    method: "GET",
                    headers: { Authorization: `Bearer ${token}` }
                });

                const result = await response.json();
                if (HandleUnauthorized(result, logoutUser, navigate)) return;

                if (response.ok) {
                    setCategoryName(result.categoryname || "");
                    setDescription(result.description || "");
                    setStatus(Boolean(result.status));
                } else {
                    const errorMessages = {
                        "Category not found": translations.categorynotfound,
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

        if (!categoryName.trim() || !description.trim()) {
            setWarningMessage(translations.allfieldrequired);
            setShowWarning(true);
            return;
        }

        if (description.trim().length > MAX_DESCRIPTION_LENGTH) {
            setWarningMessage(translations.descriptionlimitexceeded || "Description cannot exceed 120 characters");
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
                categoryname: categoryName.trim(),
                description: description.trim(),
                status
            };

            const response = await fetch(`${adminPanelBackendPath}/Attributes/UpdateCategory/${id}`, {
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
                navigate("/Attributes/Category", {
                    state: { message: translations.updatecategorysuccessfull }
                });
            } else {
                const errorMessages = {
                    "All fields are required": translations.allfieldrequired,
                    "Category Already Exists": translations.categoryalreadyexists,
                    "Category not found": translations.categorynotfound,
                    "Description cannot exceed 120 characters": translations.descriptionlimitexceeded || "Description cannot exceed 120 characters",
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

    const handleCancel = () => navigate(`/Attributes/Category`);

    return (
        <>
            {showWarning && <WarningModal message={warningMessage} onClose={() => setShowWarning(false)} />}
            <div className={`AddCategory-container ${isRtl ? 'rtl-addcategory' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
                <div className="Addcategory-container">
                    <h6 className="Addcategory-headingname">{translations.editcategory}</h6>
                    <div className="Addcategory-form-container">
                        {isLoading ? (
                            <LoadingSpinner />
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="categoryname">
                                            {translations.categoryname} <span style={{ color: "red" }}>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="categoryname"
                                            name="categoryname"
                                            autoComplete="off"
                                            placeholder={translations.entercategoryname}
                                            required
                                            value={categoryName}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (value.length === 1 && value === " ") return;
                                                setCategoryName(value);
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

                                <div className="form-row full-width">
                                    <div className="form-group">
                                        <label htmlFor="description">
                                            {translations.description || "Description"} <span style={{ color: "red" }}>*</span>
                                        </label>
                                        <textarea
                                            id="description"
                                            name="description"
                                            rows="3"
                                            autoComplete="off"
                                            placeholder={translations.entercategorydescription || translations.enterdescription}
                                            required
                                            maxLength={MAX_DESCRIPTION_LENGTH}
                                            value={description}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (value.length === 1 && value === " ") return;
                                                if (value.length <= MAX_DESCRIPTION_LENGTH) {
                                                    setDescription(value);
                                                }
                                            }}
                                        />
                                        <div className={`description-counter ${(description || "").length >= MAX_DESCRIPTION_LENGTH ? 'max-reached' : ''}`}>
                                            {(description || "").length}/{MAX_DESCRIPTION_LENGTH}
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

export default EditCategory;
