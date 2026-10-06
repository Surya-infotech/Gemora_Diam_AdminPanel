import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import Placeholder from '../../assets/placeholder.png';
import { useAuth } from '../../Middleware/Auth';
import CustomSwitch from '../../Pages/Custom/CustomSwitch';
import LoadingSpinner from '../../Pages/Custom/LoadingSpinner';
import WarningModal from '../../Pages/Custom/WarningModal';
import Dropdown from '../Dropdown/Dropdown';
import "../../Scss/Products/additem.scss";
import { useLanguage } from "../../Context/LanguageContext";
import CheckToken from '../../utils/CheckToken';
import HandleUnauthorized from '../../utils/HandleUnauthorized';

const EditItem = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const { translations, isRtl } = useLanguage();
    const { logoutUser } = useAuth();
    const adminPanelBackendPath = import.meta.env.VITE_BACKEND_URL;
    const tokenname = import.meta.env.VITE_AdminTOKEN_NAME;
    const token = localStorage.getItem(tokenname);

    const [warningMessage, setWarningMessage] = useState("");
    const [showWarning, setShowWarning] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [itemName, setItemName] = useState("");
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [description, setDescription] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(Placeholder);
    const [status, setStatus] = useState(true);

    useEffect(() => {
        if (translations.edititem) document.title = translations.edititem;
        else document.title = "Edit Item";
    }, [translations]);

    // Fetch active categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch(`${adminPanelBackendPath}/Attributes/GetActiveCategories`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" }
                });
                const data = await response.json();
                if (response.ok && Array.isArray(data)) {
                    setCategories(data);
                }
            } catch (err) {
                console.error("Error loading categories:", err);
            }
        };

        fetchCategories();
    }, [adminPanelBackendPath]);

    // Fetch item details
    useEffect(() => {
        const fetchDetails = async () => {
            setIsLoading(true);
            if (!CheckToken(token, logoutUser, navigate)) {
                setIsLoading(false);
                return;
            }

            try {
                const response = await fetch(`${adminPanelBackendPath}/Products/EditItem/${id}`, {
                    method: "GET",
                    headers: { Authorization: `Bearer ${token}` }
                });

                const result = await response.json();
                if (HandleUnauthorized(result, logoutUser, navigate)) return;

                if (response.ok) {
                    setItemName(result.itemname || "");
                    setSelectedCategory(result.categoryid != null ? result.categoryid : null);
                    setDescription(result.description || "");
                    setStatus(Boolean(result.status));
                    if (result.image) {
                        setImagePreview(result.image);
                    } else {
                        setImagePreview(Placeholder);
                    }
                } else {
                    const errorMessages = {
                        "Item not found": translations.itemnotfound || "Item not found",
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

    const handleUploadClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
            const allowedExtensions = ['jpg', 'jpeg', 'png'];
            const fileExtension = file.name.split('.').pop().toLowerCase();

            if (!allowedExtensions.includes(fileExtension)) {
                setWarningMessage(translations.invalidfileextension || "Only JPG, JPEG, and PNG images are allowed.");
                setShowWarning(true);
                e.target.value = '';
                return;
            }

            const maxSize = 10 * 1024 * 1024;
            if (file.size > maxSize) {
                setWarningMessage(translations.filesizetoolarge || "Image size exceeds the 10MB limit.");
                setShowWarning(true);
                e.target.value = '';
                return;
            }

            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!itemName.trim()) {
            setWarningMessage(translations.itemnamerequired || "Item Name is required");
            setShowWarning(true);
            return;
        }

        if (!selectedCategory) {
            setWarningMessage(translations.categoryrequired || "Please select a Category");
            setShowWarning(true);
            return;
        }

        setIsLoading(true);
        if (!CheckToken(token, logoutUser, navigate)) {
            setIsLoading(false);
            return;
        }

        try {
            const formData = new FormData();
            formData.append("itemname", itemName.trim());
            formData.append("categoryid", selectedCategory);
            formData.append("description", description.trim());
            formData.append("status", status);
            if (imageFile) {
                formData.append("image", imageFile);
            }

            const response = await fetch(`${adminPanelBackendPath}/Products/UpdateItem/${id}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData,
            });

            const result = await response.json();
            if (HandleUnauthorized(result, logoutUser, navigate)) return;

            if (response.ok) {
                navigate("/Products/Item", {
                    state: { message: translations.updateitemsuccessfull || "Item updated successfully" }
                });
            } else {
                const errorMessages = {
                    "Item Name is required": translations.itemnamerequired || "Item Name is required",
                    "Category is required": translations.categoryrequired || "Category is required",
                    "Item Already Exists": translations.itemalreadyexists || "Item with this name already exists",
                    "Item not found": translations.itemnotfound || "Item not found",
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

    const handleCancel = () => navigate(`/Products/Item`);

    return (
        <>
            {showWarning && <WarningModal message={warningMessage} onClose={() => setShowWarning(false)} />}
            <div className={`AddItem-container ${isRtl ? 'rtl-additem' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
                <div className="Additem-container">
                    <h6 className="Additem-headingname">{translations.edititem || "Edit Item"}</h6>
                    <div className="Additem-form-container">
                        {isLoading ? (
                            <LoadingSpinner />
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <div className="imageflex">
                                    <div className="formdiv">
                                        <div className="form-group">
                                            <label htmlFor="itemname">
                                                {translations.itemname || "Item Name"} <span style={{ color: "red" }}>*</span>
                                            </label>
                                            <input
                                                type="text"
                                                id="itemname"
                                                name="itemname"
                                                autoComplete="off"
                                                placeholder={translations.enteritemname || "Enter Item Name"}
                                                autoFocus
                                                required
                                                value={itemName}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    if (value.length === 1 && value === " ") return;
                                                    setItemName(value);
                                                }}
                                                onInput={(e) => (e.target.value = e.target.value.replace(/^\s+/, ""))}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="description">
                                                {translations.description || "Description"}
                                            </label>
                                            <textarea
                                                id="description"
                                                name="description"
                                                rows="3"
                                                placeholder={translations.enterdescription || "Enter Description"}
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="imagediv">
                                        <div className="form-group">
                                            <div className="imgpreview">
                                                {imagePreview && (
                                                    <div className="image-preview-container">
                                                        <img
                                                            src={imagePreview}
                                                            alt={translations.itempreview || "Item Preview"}
                                                            className="image-preview"
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.src = Placeholder;
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                                <button
                                                    type="button"
                                                    className="btn btn-primary upload-btn"
                                                    onClick={handleUploadClick}
                                                >
                                                    {translations.upload || "Upload"}
                                                </button>
                                                <input
                                                    type="file"
                                                    id="itemimage"
                                                    name="image"
                                                    accept="image/*"
                                                    ref={fileInputRef}
                                                    onChange={handleImageChange}
                                                    style={{ display: "none" }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>
                                            {translations.Category || "Category"} <span style={{ color: "red" }}>*</span>
                                        </label>
                                        <Dropdown
                                            options={categories}
                                            labelKey="categoryname"
                                            valueKey="categoryid"
                                            selectedValue={selectedCategory}
                                            onValueChange={(val) => setSelectedCategory(val)}
                                            placeholder={translations.selectcategory || "Select Category"}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>{translations.status || "Status"}</label>
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

export default EditItem;
