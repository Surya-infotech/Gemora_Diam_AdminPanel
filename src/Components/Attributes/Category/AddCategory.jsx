import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../../Middleware/Auth';
import LoadingSpinner from '../../../Pages/Custom/LoadingSpinner';
import WarningModal from '../../../Pages/Custom/WarningModal';
import "../../../Scss/Attributes/Category/addcategory.scss";
import { useLanguage } from "../../../Context/LanguageContext";
import CheckToken from '../../../utils/CheckToken';
import HandleUnauthorized from '../../../utils/HandleUnauthorized';

const AddCategory = () => {
    const navigate = useNavigate();
    const { translations, isRtl } = useLanguage();
    const { logoutUser } = useAuth();
    const adminPanelBackendPath = import.meta.env.VITE_BACKEND_URL;
    const tokenname = import.meta.env.VITE_AdminTOKEN_NAME;
    const [warningMessage, setWarningMessage] = useState("");
    const [showWarning, setShowWarning] = useState(false);
    const token = localStorage.getItem(tokenname);

    const [categoryName, setCategoryName] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (translations.addcategory) document.title = translations.addcategory;
    }, [translations]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!categoryName.trim()) {
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
                categoryname: categoryName.trim(),
            };

            const response = await fetch(`${adminPanelBackendPath}/Attributes/AddCategory`, {
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
                navigate("/Attributes/Category", {
                    state: { message: translations.addcategorysuccessfull || "Category added successfully" }
                });
            } else {
                const errorMessages = {
                    "All fields are required": translations.allfieldrequired || "All fields are required",
                    "Category Already Exists": translations.categoryalreadyexists || "Category Already Exists",
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
                    <h6 className="Addcategory-headingname">{translations.addcategory || "Add Category"}</h6>
                    <div className="Addcategory-form-container">
                        {isLoading ? (
                            <LoadingSpinner />
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="categoryname">
                                            {translations.categoryname || "Category Name"} <span style={{ color: "red" }}>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="categoryname"
                                            name="categoryname"
                                            autoComplete="off"
                                            placeholder={translations.entercategoryname || "Enter Category Name"}
                                            autoFocus
                                            required
                                            value={categoryName}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (value.length === 1 && value === " ") return;
                                                setCategoryName(value);
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

export default AddCategory;
