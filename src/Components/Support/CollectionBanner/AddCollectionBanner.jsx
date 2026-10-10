import { useEffect, useRef, useState } from 'react';
import { useNavigate } from "react-router-dom";
import Placeholder from '../../../assets/placeholder.png';
import { useAuth } from '../../../Middleware/Auth';
import LoadingSpinner from '../../../Pages/Custom/LoadingSpinner';
import WarningModal from '../../../Pages/Custom/WarningModal';
import "../../../Scss/Support/CollectionBanner/addcollectionbanner.scss";
import { useLanguage } from "../../../Context/LanguageContext";
import CheckToken from '../../../utils/CheckToken';
import HandleUnauthorized from '../../../utils/HandleUnauthorized';

const AddCollectionBanner = () => {
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
    const [buttonText, setButtonText] = useState("");
    const [buttonLink, setButtonLink] = useState("");
    const [position, setPosition] = useState("");
    const [order, setOrder] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [imageUrl, setImageUrl] = useState("");
    const [imagePreview, setImagePreview] = useState(Placeholder);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (translations.addcollectionbanner) {
            document.title = translations.addcollectionbanner;
        }
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
                setWarningMessage(translations.invalidfileextension);
                setShowWarning(true);
                e.target.value = '';
                return;
            }
            if (file.size > 10 * 1024 * 1024) {
                setWarningMessage(translations.filesizetoolarge);
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
            setWarningMessage(translations.allfieldrequired);
            setShowWarning(true);
            return;
        }

        if (!imageFile && !imageUrl.trim()) {
            setWarningMessage(translations.imageisrequired);
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
            formData.append("buttonText", buttonText.trim());
            formData.append("buttonLink", buttonLink.trim());
            formData.append("position", position || "left");
            formData.append("order", order ? String(order) : "1");

            if (imageFile) {
                formData.append("image", imageFile);
            } else if (imageUrl.trim()) {
                formData.append("image", imageUrl.trim());
            }

            const response = await fetch(`${adminPanelBackendPath}/Support/AddCollectionBanner`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData,
            });

            const result = await response.json();
            if (HandleUnauthorized(result, logoutUser, navigate)) return;

            if (response.ok) {
                navigate("/Support/CollectionBanner", {
                    state: { message: translations.addcollectionbannersuccessfull }
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
                    <h6 className="Addcollectionbanner-headingname">{translations.addcollectionbanner}</h6>
                    <div className="Addcollectionbanner-form-container">
                        {isLoading ? (
                            <LoadingSpinner />
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <div className="imageflex">
                                    <div className="formdiv">
                                        <div className="form-group">
                                            <label htmlFor="tag">
                                                {translations.collectionbannertag || translations.bannertag}
                                            </label>
                                            <input
                                                type="text"
                                                id="tag"
                                                name="tag"
                                                autoComplete="off"
                                                placeholder={translations.entercollectionbannertag}
                                                value={tag}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    if (value.length === 1 && value === " ") return;
                                                    setTag(value);
                                                }}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="title">
                                                {translations.title} <span style={{ color: "red" }}>*</span>
                                            </label>
                                            <input
                                                type="text"
                                                id="title"
                                                name="title"
                                                autoComplete="off"
                                                placeholder={translations.entercollectionbannertitle}
                                                required
                                                value={title}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    if (value.length === 1 && value === " ") return;
                                                    setTitle(value);
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
                                                        alt={translations.bannerpreview}
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
                                                    {translations.upload}
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
                                        <label htmlFor="buttonText">
                                            {translations.buttontext}
                                        </label>
                                        <input
                                            type="text"
                                            id="buttonText"
                                            name="buttonText"
                                            autoComplete="off"
                                            placeholder={translations.enterbuttontext}
                                            value={buttonText}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (value.length === 1 && value === " ") return;
                                                setButtonText(value);
                                            }}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="buttonLink">
                                            {translations.buttonlink}
                                        </label>
                                        <input
                                            type="text"
                                            id="buttonLink"
                                            name="buttonLink"
                                            autoComplete="off"
                                            placeholder={translations.enterbuttonlink}
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
                                        <label htmlFor="position">
                                            {translations.imageposition}
                                        </label>
                                        <select
                                            id="position"
                                            name="position"
                                            value={position}
                                            onChange={(e) => setPosition(e.target.value)}
                                        >
                                            <option value="">{translations.selectimageposition}</option>
                                            <option value="left">{translations.imageleft}</option>
                                            <option value="right">{translations.imageright}</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="order">
                                            {translations.displayorder}
                                        </label>
                                        <input
                                            type="number"
                                            id="order"
                                            name="order"
                                            min="1"
                                            placeholder={translations.enterdisplayorder}
                                            value={order}
                                            onChange={(e) => setOrder(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="form-row full-width">
                                    <div className="form-group">
                                        <label htmlFor="imageurl">
                                            {translations.orimageurl}
                                        </label>
                                        <input
                                            type="text"
                                            id="imageurl"
                                            name="imageurl"
                                            autoComplete="off"
                                            placeholder={translations.enterimageurl}
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
                                        <label htmlFor="description">
                                            {translations.bannerdescription || translations.description}
                                        </label>
                                        <textarea
                                            id="description"
                                            name="description"
                                            rows="3"
                                            autoComplete="off"
                                            placeholder={translations.enterdescription}
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

export default AddCollectionBanner;
