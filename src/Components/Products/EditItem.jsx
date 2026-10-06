import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
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
    const [imagePreview, setImagePreview] = useState("");
    const [existingImage, setExistingImage] = useState("");
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
                    setExistingImage(result.image || "");
                    setStatus(Boolean(result.status));
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

    const handleFileValidation = (file) => {
        if (!file) return false;
        const allowedExtensions = ['jpg', 'jpeg', 'png'];
        const fileExt = file.name.split('.').pop().toLowerCase();

        if (!allowedExtensions.includes(fileExt)) {
            setWarningMessage(translations.invalidfileextension || "Only JPG, JPEG, and PNG images are allowed.");
            setShowWarning(true);
            return false;
        }

        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            setWarningMessage(translations.filesizetoolarge || "Image size exceeds the 10MB limit.");
            setShowWarning(true);
            return false;
        }
        return true;
    };

    const handleImageChange = (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
            if (handleFileValidation(file)) {
                setImageFile(file);
                setImagePreview(URL.createObjectURL(file));
            } else {
                e.target.value = "";
            }
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
        if (file) {
            if (handleFileValidation(file)) {
                setImageFile(file);
                setImagePreview(URL.createObjectURL(file));
            }
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
            setImagePreview("");
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return "";
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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

    const currentDisplayImage = imagePreview || existingImage;

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
                                <div className="form-row">
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
                                        />
                                    </div>
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
                                </div>

                                <div className="form-row full-width">
                                    <div className="form-group">
                                        <label htmlFor="description">
                                            {translations.description || "Description"}
                                        </label>
                                        <textarea
                                            id="description"
                                            name="description"
                                            rows="4"
                                            placeholder={translations.enterdescription || "Enter Item Description"}
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>
                                            {translations.image || "Image"}
                                        </label>
                                        <div className="image-upload-wrapper">
                                            {!currentDisplayImage ? (
                                                <div
                                                    className="upload-dropzone"
                                                    onClick={() => fileInputRef.current && fileInputRef.current.click()}
                                                    onDrop={handleDrop}
                                                    onDragOver={handleDragOver}
                                                >
                                                    <CloudUploadIcon className="upload-icon" />
                                                    <div className="upload-text">
                                                        {translations.clickordragimage || "Click to browse or drag and drop an image"}
                                                    </div>
                                                    <div className="upload-hint">
                                                        {translations.imagehint || "PNG, JPG, JPEG up to 10MB"}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="image-preview-card">
                                                    <img src={currentDisplayImage} alt="Preview" className="preview-img" />
                                                    <div className="preview-info">
                                                        <span className="file-name">
                                                            {imageFile ? imageFile.name : (existingImage.split('/').pop() || "Current Image")}
                                                        </span>
                                                        {imageFile && (
                                                            <span className="file-size">{formatFileSize(imageFile.size)}</span>
                                                        )}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-primary ms-2"
                                                        onClick={() => fileInputRef.current && fileInputRef.current.click()}
                                                    >
                                                        {translations.changeimage || "Change"}
                                                    </button>
                                                    {imageFile && (
                                                        <button
                                                            type="button"
                                                            className="remove-img-btn"
                                                            onClick={handleRemoveImage}
                                                            title={translations.remove || "Remove"}
                                                        >
                                                            <CloseIcon fontSize="small" />
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                accept="image/png,image/jpeg,image/jpg"
                                                style={{ display: "none" }}
                                                onChange={handleImageChange}
                                            />
                                        </div>
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
                                        {translations.cancel}
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary submit-btn"
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

export default EditItem;
