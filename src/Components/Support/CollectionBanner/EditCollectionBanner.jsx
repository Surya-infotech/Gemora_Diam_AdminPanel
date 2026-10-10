import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import Placeholder from '../../../assets/placeholder.png';
import { useAuth } from '../../../Middleware/Auth';
import LoadingSpinner from '../../../Pages/Custom/LoadingSpinner';
import WarningModal from '../../../Pages/Custom/WarningModal';
import CustomSwitch from '../../../Pages/Custom/CustomSwitch';
import "../../../Scss/Support/CollectionBanner/addcollectionbanner.scss";
import { useLanguage } from "../../../Context/LanguageContext";
import CheckToken from '../../../utils/CheckToken';
import HandleUnauthorized from '../../../utils/HandleUnauthorized';

const EditCollectionBanner = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { translations, isRtl } = useLanguage();
    const { logoutUser } = useAuth();
    const adminPanelBackendPath = import.meta.env.VITE_BACKEND_URL;
    const tokenname = import.meta.env.VITE_AdminTOKEN_NAME;
    const [warningMessage, setWarningMessage] = useState("");
    const [showWarning, setShowWarning] = useState(false);
    const token = localStorage.getItem(tokenname);
    const fileInputRef = useRef(null);

    const [tag, setTag] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [buttonText, setButtonText] = useState("SHOP COLLECTION");
    const [buttonLink, setButtonLink] = useState("/shop");
    const [position, setPosition] = useState("left");
    const [order, setOrder] = useState("1");
    const [status, setStatus] = useState(true);
    const [imageFile, setImageFile] = useState(null);
    const [imageUrl, setImageUrl] = useState("");
    const [imagePreview, setImagePreview] = useState(Placeholder);
    const [isLoading, setIsLoading] = useState(false);

    const pageTitle = translations.editcollectionbanner || "Edit Collection Banner";

    useEffect(() => {
        document.title = pageTitle;
    }, [pageTitle]);

    useEffect(() => {
        const fetchDetails = async () => {
            setIsLoading(true);
            if (!CheckToken(token, logoutUser, navigate)) {
                setIsLoading(false);
                return;
            }

            try {
                const response = await fetch(`${adminPanelBackendPath}/Support/EditCollectionBanner/${id}`, {
                    method: "GET",
                    headers: { Authorization: `Bearer ${token}` }
                });

                const result = await response.json();
                if (HandleUnauthorized(result, logoutUser, navigate)) return;

                if (response.ok) {
                    setTag(result.tag || "");
                    setTitle(result.title || "");
                    setDescription(result.description || "");
                    setButtonText(result.buttonText || "SHOP COLLECTION");
                    setButtonLink(result.buttonLink || "/shop");
                    setPosition(result.position || "left");
                    setOrder(result.order !== undefined ? String(result.order) : "1");
                    setStatus(result.status === true || result.status === "true" || result.status === 1 || result.status === "1");
                    if (result.image) {
                        setImageUrl(result.image);
                        setImagePreview(result.image);
                    }
                } else {
                    setWarningMessage(result.message || translations.servererror);
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

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const allowed = ["jpg", "jpeg", "png", "webp"];
            const ext = file.name.split('.').pop().toLowerCase();
            if (!allowed.includes(ext)) {
                setWarningMessage(translations.invalidfileextension || "Invalid file extension (Only JPG, JPEG, PNG, WEBP allowed)");
                setShowWarning(true);
                e.target.value = '';
                return;
            }
            if (file.size > 10 * 1024 * 1024) {
                setWarningMessage(translations.filesizetoolarge || "File size too large (Maximum 10MB)");
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

        if (!title.trim()) {
            setWarningMessage(translations.allfieldrequired || "Title is required");
            setShowWarning(true);
            return;
        }

        if (!imageFile && !imageUrl.trim()) {
            setWarningMessage(translations.imageisrequired || "Banner image is required");
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
            formData.append("tag", tag.trim());
            formData.append("title", title.trim());
            formData.append("description", description.trim());
            formData.append("buttonText", buttonText.trim() || "SHOP COLLECTION");
            formData.append("buttonLink", buttonLink.trim() || "/shop");
            formData.append("position", position);
            formData.append("order", order ? String(order) : "1");
            formData.append("status", status ? "true" : "false");

            if (imageFile) {
                formData.append("image", imageFile);
            } else if (imageUrl.trim()) {
                formData.append("image", imageUrl.trim());
            }

            const response = await fetch(`${adminPanelBackendPath}/Support/UpdateCollectionBanner/${id}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData,
            });

            const result = await response.json();
            if (HandleUnauthorized(result, logoutUser, navigate)) return;

            if (response.ok) {
                navigate("/Support/CollectionBanner", {
                    state: { message: translations.updatecollectionbannersuccessfull || "Collection Banner updated successfully" }
                });
            } else {
                setWarningMessage(result.message || translations.servererror);
                setShowWarning(true);
            }
        } catch {
            setWarningMessage(translations.servererror);
            setShowWarning(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => navigate(`/Support/CollectionBanner`);

    return (
        <>
            {showWarning && <WarningModal message={warningMessage} onClose={() => setShowWarning(false)} />}
            <div className={`AddCollectionBanner-container ${isRtl ? 'rtl-addcollectionbanner' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
                <div className="Addcollectionbanner-container">
                    <h6 className="Addcollectionbanner-headingname">{pageTitle}</h6>
                    <div className="Addcollectionbanner-form-container">
                        {isLoading ? (
                            <LoadingSpinner />
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <div className="imageflex">
                                    <div className="formdiv">
                                        <div className="form-group">
                                            <label htmlFor="tag">
                                                {translations.collectionbannertag || "Tag / Eyebrow"}
                                            </label>
                                            <input
                                                type="text"
                                                id="tag"
                                                name="tag"
                                                autoComplete="off"
                                                placeholder={translations.entercollectionbannertag || "e.g. FEATURED ATELIER"}
                                                value={tag}
                                                onChange={(e) => setTag(e.target.value)}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="title">
                                                {translations.title || "Title"} <span style={{ color: "red" }}>*</span>
                                            </label>
                                            <input
                                                type="text"
                                                id="title"
                                                name="title"
                                                autoComplete="off"
                                                placeholder={translations.entercollectionbannertitle || "e.g. Bracelets Collection"}
                                                required
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
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
                                                autoComplete="off"
                                                placeholder={translations.enterdescription || "Enter collection banner description"}
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="imagediv">
                                        <div className="form-group">
                                            <label>
                                                {translations.bannerimage || "Banner Image"} <span style={{ color: "red" }}>*</span>
                                            </label>
                                            <div className="imgpreview">
                                                <div className="image-preview-container" onClick={handleUploadClick} title="Click to upload banner image">
                                                    <img
                                                        src={imagePreview}
                                                        alt="Banner Preview"
                                                        className="image-preview"
                                                        onError={(e) => { e.target.src = Placeholder; }}
                                                    />
                                                </div>
                                                <input
                                                    type="file"
                                                    ref={fileInputRef}
                                                    accept=".jpg,.jpeg,.png,.webp"
                                                    style={{ display: "none" }}
                                                    onChange={handleFileChange}
                                                />
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-primary btn-sm mt-2"
                                                    onClick={handleUploadClick}
                                                >
                                                    {translations.uploadimage || "Upload Image"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="buttonText">
                                            {translations.buttontext || "Button Text"}
                                        </label>
                                        <input
                                            type="text"
                                            id="buttonText"
                                            name="buttonText"
                                            autoComplete="off"
                                            placeholder="e.g. SHOP COLLECTION"
                                            value={buttonText}
                                            onChange={(e) => setButtonText(e.target.value)}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="buttonLink">
                                            {translations.buttonlink || "Button Link"}
                                        </label>
                                        <input
                                            type="text"
                                            id="buttonLink"
                                            name="buttonLink"
                                            autoComplete="off"
                                            placeholder="e.g. /shop?category=Bracelets"
                                            value={buttonLink}
                                            onChange={(e) => setButtonLink(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="position">
                                            {translations.imageposition || "Image Position"}
                                        </label>
                                        <select
                                            id="position"
                                            name="position"
                                            value={position}
                                            onChange={(e) => setPosition(e.target.value)}
                                        >
                                            <option value="left">{translations.imageleft || "Image Left, Content Right"}</option>
                                            <option value="right">{translations.imageright || "Content Left, Image Right"}</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="order">
                                            {translations.displayorder || "Display Order"}
                                        </label>
                                        <input
                                            type="number"
                                            id="order"
                                            name="order"
                                            min="1"
                                            placeholder="1"
                                            value={order}
                                            onChange={(e) => setOrder(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
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
                                        className="btn btn-success submit-btn"
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

export default EditCollectionBanner;
