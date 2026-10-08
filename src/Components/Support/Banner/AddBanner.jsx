import { useEffect, useRef, useState } from 'react';
import { useNavigate } from "react-router-dom";
import Placeholder from '../../../assets/placeholder.png';
import { useAuth } from '../../../Middleware/Auth';
import LoadingSpinner from '../../../Pages/Custom/LoadingSpinner';
import WarningModal from '../../../Pages/Custom/WarningModal';
import "../../../Scss/Support/Banner/addbanner.scss";
import { useLanguage } from "../../../Context/LanguageContext";
import CheckToken from '../../../utils/CheckToken';
import HandleUnauthorized from '../../../utils/HandleUnauthorized';

const AddBanner = () => {
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
    const [headingLine1, setHeadingLine1] = useState("");
    const [headingLine2, setHeadingLine2] = useState("");
    const [description, setDescription] = useState("");
    const [buttonText, setButtonText] = useState("");
    const [buttonLink, setButtonLink] = useState("");
    const [secondaryButtonText, setSecondaryButtonText] = useState("");
    const [secondaryButtonLink, setSecondaryButtonLink] = useState("");
    const [order, setOrder] = useState("");
    const [status, setStatus] = useState(true);
    const [imageFile, setImageFile] = useState(null);
    const [imageUrl, setImageUrl] = useState("");
    const [imagePreview, setImagePreview] = useState(Placeholder);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (translations.addbanner) document.title = translations.addbanner;
    }, [translations]);

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
                setWarningMessage(translations.invalidfileextension || "Only JPG, PNG and WebP files are allowed");
                setShowWarning(true);
                e.target.value = '';
                return;
            }
            if (file.size > 10 * 1024 * 1024) {
                setWarningMessage(translations.filesizetoolarge || "Image size must not exceed 10MB");
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

        if (!headingLine1.trim()) {
            setWarningMessage(translations.allfieldrequired || "Heading Line 1 is required");
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
            formData.append("headingLine1", headingLine1.trim());
            formData.append("headingLine2", headingLine2.trim());
            formData.append("title", `${headingLine1.trim()} ${headingLine2.trim()}`.trim());
            formData.append("description", description.trim());
            formData.append("buttonText", buttonText.trim());
            formData.append("buttonLink", buttonLink.trim());
            formData.append("secondaryButtonText", secondaryButtonText.trim());
            formData.append("secondaryButtonLink", secondaryButtonLink.trim());
            formData.append("order", order ? String(order) : "1");
            formData.append("status", String(status));

            if (imageFile) {
                formData.append("image", imageFile);
            } else if (imageUrl.trim()) {
                formData.append("image", imageUrl.trim());
            }

            const response = await fetch(`${adminPanelBackendPath}/Support/AddBanner`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData,
            });

            const result = await response.json();
            if (HandleUnauthorized(result, logoutUser, navigate)) return;

            if (response.ok) {
                navigate("/Support/Banner", {
                    state: { message: translations.addbannersuccessfull || "Banner added successfully" }
                });
            } else {
                setWarningMessage(result.message || translations.servererror || "Failed to add banner");
                setShowWarning(true);
            }
        } catch {
            setWarningMessage(translations.servererror || "Server error");
            setShowWarning(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => navigate(`/Support/Banner`);

    return (
        <>
            {showWarning && <WarningModal message={warningMessage} onClose={() => setShowWarning(false)} />}
            <div className={`AddBanner-container ${isRtl ? 'rtl-addbanner' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
                <div className="Addbanner-container">
                    <h6 className="Addbanner-headingname">{translations.addbanner || "Add Banner"}</h6>
                    <div className="Addbanner-form-container">
                        {isLoading ? (
                            <LoadingSpinner />
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <div className="imageflex">
                                    <div className="formdiv">
                                        <div className="form-group">
                                            <label htmlFor="headingLine1">
                                                {translations.headingline1 || "Heading Line 1"} <span style={{ color: "red" }}>*</span>
                                            </label>
                                            <input
                                                type="text"
                                                id="headingLine1"
                                                name="headingLine1"
                                                autoComplete="off"
                                                placeholder={translations.enterheadingline1 || "e.g. UNVEIL YOUR"}
                                                required
                                                value={headingLine1}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    if (value.length === 1 && value === " ") return;
                                                    setHeadingLine1(value);
                                                }}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="headingLine2">
                                                {translations.headingline2 || "Heading Line 2 (Accent)"}
                                            </label>
                                            <input
                                                type="text"
                                                id="headingLine2"
                                                name="headingLine2"
                                                autoComplete="off"
                                                placeholder={translations.enterheadingline2 || "e.g. SIGNATURE LOOK"}
                                                value={headingLine2}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    if (value.length === 1 && value === " ") return;
                                                    setHeadingLine2(value);
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="imagediv">
                                        <div className="form-group">
                                            <div className="imgpreview">
                                                <div className="image-preview-container">
                                                    <img
                                                        src={imagePreview}
                                                        alt="Banner Preview"
                                                        className="image-preview"
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = Placeholder;
                                                        }}
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    className="btn btn-primary upload-btn"
                                                    onClick={handleUploadClick}
                                                >
                                                    {translations.upload || "Upload"}
                                                </button>
                                                <input
                                                    type="file"
                                                    id="bannerimage"
                                                    name="image"
                                                    accept="image/*"
                                                    ref={fileInputRef}
                                                    onChange={handleFileChange}
                                                    style={{ display: "none" }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="bannertag">
                                            {translations.bannertag || "Badge / Tag"}
                                        </label>
                                        <input
                                            type="text"
                                            id="bannertag"
                                            name="bannertag"
                                            autoComplete="off"
                                            placeholder={translations.enterbannertag || "e.g. TRENDING, NEW ARRIVALS"}
                                            value={tag}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (value.length === 1 && value === " ") return;
                                                setTag(value);
                                            }}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="bannerorder">
                                            {translations.displayorder || "Display Order"}
                                        </label>
                                        <input
                                            type="number"
                                            id="bannerorder"
                                            name="bannerorder"
                                            autoComplete="off"
                                            placeholder={translations.enterdisplayorder || "Enter display order"}
                                            value={order}
                                            onChange={(e) => setOrder(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="primarybuttontext">
                                            {translations.primarybuttontext || "Primary Button Text"}
                                        </label>
                                        <input
                                            type="text"
                                            id="primarybuttontext"
                                            name="primarybuttontext"
                                            autoComplete="off"
                                            placeholder={translations.enterprimarybuttontext || "e.g. SHOP NOW"}
                                            value={buttonText}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (value.length === 1 && value === " ") return;
                                                setButtonText(value);
                                            }}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="primarybuttonlink">
                                            {translations.primarybuttonlink || "Primary Button Link"}
                                        </label>
                                        <input
                                            type="text"
                                            id="primarybuttonlink"
                                            name="primarybuttonlink"
                                            autoComplete="off"
                                            placeholder={translations.enterprimarybuttonlink || "e.g. /shop"}
                                            value={buttonLink}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (value.length === 1 && value === " ") return;
                                                setButtonLink(value);
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="secondarybuttontext">
                                            {translations.secondarybuttontext || "Secondary Button Text"}
                                        </label>
                                        <input
                                            type="text"
                                            id="secondarybuttontext"
                                            name="secondarybuttontext"
                                            autoComplete="off"
                                            placeholder={translations.entersecondarybuttontext || "e.g. EXPLORE MORE"}
                                            value={secondaryButtonText}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (value.length === 1 && value === " ") return;
                                                setSecondaryButtonText(value);
                                            }}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="secondarybuttonlink">
                                            {translations.secondarybuttonlink || "Secondary Button Link"}
                                        </label>
                                        <input
                                            type="text"
                                            id="secondarybuttonlink"
                                            name="secondarybuttonlink"
                                            autoComplete="off"
                                            placeholder={translations.entersecondarybuttonlink || "e.g. /about"}
                                            value={secondaryButtonLink}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (value.length === 1 && value === " ") return;
                                                setSecondaryButtonLink(value);
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="form-row full-width">
                                    <div className="form-group">
                                        <label htmlFor="imageurl">
                                            {translations.orimageurl || "Or Banner Image URL (Optional)"}
                                        </label>
                                        <input
                                            type="text"
                                            id="imageurl"
                                            name="imageurl"
                                            autoComplete="off"
                                            placeholder={translations.enterimageurl || "Enter banner image URL"}
                                            value={imageUrl}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setImageUrl(value);
                                                if (!imageFile) {
                                                    setImagePreview(value.trim() ? value.trim() : Placeholder);
                                                }
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="form-row full-width">
                                    <div className="form-group">
                                        <label htmlFor="bannerdescription">
                                            {translations.bannerdescription || "Description"}
                                        </label>
                                        <textarea
                                            id="bannerdescription"
                                            name="bannerdescription"
                                            rows="3"
                                            autoComplete="off"
                                            placeholder={translations.enterbannerdescription || "Enter banner description..."}
                                            value={description}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (value.length === 1 && value === " ") return;
                                                setDescription(value);
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

export default AddBanner;