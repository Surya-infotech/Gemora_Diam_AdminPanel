import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Placeholder from '../../assets/placeholder.png';
import { useAuth } from '../../Middleware/Auth';
import LoadingSpinner from '../Custom/LoadingSpinner';
import WarningModal from '../Custom/WarningModal';
import AlertMessage from '../Custom/AlertMessage';
import "../../Scss/Support/AboutUs/aboutus.scss";
import { useLanguage } from "../../Context/LanguageContext";
import CheckToken from '../../utils/CheckToken';
import HandleUnauthorized from '../../utils/HandleUnauthorized';

const AboutUs = () => {
    const navigate = useNavigate();
    const { translations, isRtl } = useLanguage();
    const { logoutUser } = useAuth();
    const adminPanelBackendPath = import.meta.env.VITE_BACKEND_URL;
    const tokenname = import.meta.env.VITE_AdminTOKEN_NAME;
    const token = localStorage.getItem(tokenname);
    const fileInputRef = useRef(null);

    const [alertMessage, setAlertMessage] = useState("");
    const [warningMessage, setWarningMessage] = useState("");
    const [showWarning, setShowWarning] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Hero Section
    const [heroEyebrow, setHeroEyebrow] = useState("");
    const [heroTitle, setHeroTitle] = useState("");
    const [heroDescription, setHeroDescription] = useState("");

    // Commitment Section (Pillars)
    const [commitmentEyebrow, setCommitmentEyebrow] = useState("");
    const [pillar1Title, setPillar1Title] = useState("");
    const [pillar1Description, setPillar1Description] = useState("");
    const [pillar2Title, setPillar2Title] = useState("");
    const [pillar2Description, setPillar2Description] = useState("");
    const [pillar3Title, setPillar3Title] = useState("");
    const [pillar3Description, setPillar3Description] = useState("");

    // Studio & Showroom Spotlight
    const [studioEyebrow, setStudioEyebrow] = useState("");
    const [studioTitle, setStudioTitle] = useState("");
    const [studioDescription, setStudioDescription] = useState("");
    const [studioImage, setStudioImage] = useState("");
    const [buttonText, setButtonText] = useState("");
    const [buttonLink, setButtonLink] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(Placeholder);

    useEffect(() => {
        if (translations.AboutUs) {
            document.title = translations.AboutUs;
        }
    }, [translations]);

    useEffect(() => {
        const fetchAboutUs = async () => {
            setIsLoading(true);
            if (!CheckToken(token, logoutUser, navigate)) {
                setIsLoading(false);
                return;
            }

            try {
                const response = await fetch(`${adminPanelBackendPath}/Support/GetAboutUs`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const result = await response.json();
                if (HandleUnauthorized(result, logoutUser, navigate)) return;

                if (response.ok && result) {
                    setHeroEyebrow(result.heroEyebrow || "");
                    setHeroTitle(result.heroTitle || "");
                    setHeroDescription(result.heroDescription || "");

                    setCommitmentEyebrow(result.commitmentEyebrow || "");
                    setPillar1Title(result.pillar1Title || "");
                    setPillar1Description(result.pillar1Description || "");
                    setPillar2Title(result.pillar2Title || "");
                    setPillar2Description(result.pillar2Description || "");
                    setPillar3Title(result.pillar3Title || "");
                    setPillar3Description(result.pillar3Description || "");

                    setStudioEyebrow(result.studioEyebrow || "");
                    setStudioTitle(result.studioTitle || "");
                    setStudioDescription(result.studioDescription || "");
                    setStudioImage(result.studioImage || "");
                    setButtonText(result.buttonText || "");
                    setButtonLink(result.buttonLink || "");

                    if (result.studioImage) {
                        setImagePreview(result.studioImage);
                    }
                }
            } catch {
                setWarningMessage(translations.servererror);
                setShowWarning(true);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAboutUs();
    }, [token, adminPanelBackendPath, logoutUser, navigate, translations]);

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
        setAlertMessage("");

        if (!CheckToken(token, logoutUser, navigate)) return;

        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append("heroEyebrow", heroEyebrow.trim());
            formData.append("heroTitle", heroTitle.trim());
            formData.append("heroDescription", heroDescription.trim());

            formData.append("commitmentEyebrow", commitmentEyebrow.trim());
            formData.append("pillar1Title", pillar1Title.trim());
            formData.append("pillar1Description", pillar1Description.trim());
            formData.append("pillar2Title", pillar2Title.trim());
            formData.append("pillar2Description", pillar2Description.trim());
            formData.append("pillar3Title", pillar3Title.trim());
            formData.append("pillar3Description", pillar3Description.trim());

            formData.append("studioEyebrow", studioEyebrow.trim());
            formData.append("studioTitle", studioTitle.trim());
            formData.append("studioDescription", studioDescription.trim());
            formData.append("buttonText", buttonText.trim());
            formData.append("buttonLink", buttonLink.trim());

            if (imageFile) {
                formData.append("image", imageFile);
            } else if (studioImage.trim()) {
                formData.append("studioImage", studioImage.trim());
            }

            const response = await fetch(`${adminPanelBackendPath}/Support/UpdateAboutUs`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            });

            const result = await response.json();
            if (HandleUnauthorized(result, logoutUser, navigate)) return;

            if (response.ok) {
                setAlertMessage(translations.updateaboutussuccessfull);
                if (result.aboutUs?.studioImage) {
                    setStudioImage(result.aboutUs.studioImage);
                    setImagePreview(result.aboutUs.studioImage);
                }
                setImageFile(null);
            } else {
                setWarningMessage(result.message || translations.servererror);
                setShowWarning(true);
            }
        } catch {
            setWarningMessage(translations.servererror);
            setShowWarning(true);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        navigate('/Home/Dashboard');
    };

    return (
        <>
            {showWarning && <WarningModal message={warningMessage} onClose={() => setShowWarning(false)} />}
            <div className={`AddAboutUs-container ${isRtl ? 'rtl-addaboutus' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
                <div className="Addaboutus-container">
                    <h6 className="Addaboutus-headingname">{translations.AboutUs}</h6>

                    <div className="Addaboutus-form-container">
                        {alertMessage && <AlertMessage message={alertMessage} onClose={() => setAlertMessage("")} />}

                        {isLoading ? (
                            <LoadingSpinner />
                        ) : (
                            <form onSubmit={handleSubmit}>
                                {/* SECTION 1: HERITAGE & VISION (HERO) */}
                                <div className="form-section-divider">
                                    <h6 className="form-section-title">{translations.herosection}</h6>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="heroEyebrow">{translations.heroeyebrow}</label>
                                        <input
                                            type="text"
                                            id="heroEyebrow"
                                            name="heroEyebrow"
                                            autoComplete="off"
                                            placeholder={translations.enterheroeyebrow}
                                            value={heroEyebrow}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (value.length === 1 && value === " ") return;
                                                setHeroEyebrow(value);
                                            }}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="heroTitle">{translations.herotitle}</label>
                                        <input
                                            type="text"
                                            id="heroTitle"
                                            name="heroTitle"
                                            autoComplete="off"
                                            placeholder={translations.enterherotitle}
                                            value={heroTitle}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (value.length === 1 && value === " ") return;
                                                setHeroTitle(value);
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="form-row full-width">
                                    <div className="form-group">
                                        <label htmlFor="heroDescription">{translations.herodescription}</label>
                                        <textarea
                                            id="heroDescription"
                                            name="heroDescription"
                                            rows="3"
                                            autoComplete="off"
                                            placeholder={translations.enterherodescription}
                                            value={heroDescription}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (value.length === 1 && value === " ") return;
                                                setHeroDescription(value);
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* SECTION 2: PILLARS OF COMMITMENT */}
                                <div className="form-section-divider">
                                    <h6 className="form-section-title">{translations.commitmentsection}</h6>
                                </div>

                                <div className="form-row full-width">
                                    <div className="form-group">
                                        <label htmlFor="commitmentEyebrow">{translations.commitmenteyebrow}</label>
                                        <input
                                            type="text"
                                            id="commitmentEyebrow"
                                            name="commitmentEyebrow"
                                            autoComplete="off"
                                            placeholder={translations.entercommitmenteyebrow}
                                            value={commitmentEyebrow}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (value.length === 1 && value === " ") return;
                                                setCommitmentEyebrow(value);
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="pillar1Title">{translations.pillar1title}</label>
                                        <input
                                            type="text"
                                            id="pillar1Title"
                                            name="pillar1Title"
                                            autoComplete="off"
                                            placeholder={translations.enterpillartitle}
                                            value={pillar1Title}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (value.length === 1 && value === " ") return;
                                                setPillar1Title(value);
                                            }}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="pillar1Description">{translations.pillar1description}</label>
                                        <textarea
                                            id="pillar1Description"
                                            name="pillar1Description"
                                            rows="2"
                                            autoComplete="off"
                                            placeholder={translations.enterpillardescription}
                                            value={pillar1Description}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (value.length === 1 && value === " ") return;
                                                setPillar1Description(value);
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="pillar2Title">{translations.pillar2title}</label>
                                        <input
                                            type="text"
                                            id="pillar2Title"
                                            name="pillar2Title"
                                            autoComplete="off"
                                            placeholder={translations.enterpillartitle}
                                            value={pillar2Title}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (value.length === 1 && value === " ") return;
                                                setPillar2Title(value);
                                            }}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="pillar2Description">{translations.pillar2description}</label>
                                        <textarea
                                            id="pillar2Description"
                                            name="pillar2Description"
                                            rows="2"
                                            autoComplete="off"
                                            placeholder={translations.enterpillardescription}
                                            value={pillar2Description}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (value.length === 1 && value === " ") return;
                                                setPillar2Description(value);
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="pillar3Title">{translations.pillar3title}</label>
                                        <input
                                            type="text"
                                            id="pillar3Title"
                                            name="pillar3Title"
                                            autoComplete="off"
                                            placeholder={translations.enterpillartitle}
                                            value={pillar3Title}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (value.length === 1 && value === " ") return;
                                                setPillar3Title(value);
                                            }}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="pillar3Description">{translations.pillar3description}</label>
                                        <textarea
                                            id="pillar3Description"
                                            name="pillar3Description"
                                            rows="2"
                                            autoComplete="off"
                                            placeholder={translations.enterpillardescription}
                                            value={pillar3Description}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (value.length === 1 && value === " ") return;
                                                setPillar3Description(value);
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* SECTION 3: FINE JEWELRY STUDIO & SHOWROOM */}
                                <div className="form-section-divider">
                                    <h6 className="form-section-title">{translations.studiosection}</h6>
                                </div>

                                <div className="imageflex">
                                    <div className="formdiv">
                                        <div className="form-group">
                                            <label htmlFor="studioEyebrow">{translations.studioeyebrow}</label>
                                            <input
                                                type="text"
                                                id="studioEyebrow"
                                                name="studioEyebrow"
                                                autoComplete="off"
                                                placeholder={translations.enterstudioeyebrow}
                                                value={studioEyebrow}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    if (value.length === 1 && value === " ") return;
                                                    setStudioEyebrow(value);
                                                }}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="studioTitle">{translations.studiotitle}</label>
                                            <input
                                                type="text"
                                                id="studioTitle"
                                                name="studioTitle"
                                                autoComplete="off"
                                                placeholder={translations.enterstudiotitle}
                                                value={studioTitle}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    if (value.length === 1 && value === " ") return;
                                                    setStudioTitle(value);
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
                                                        alt={translations.studiopreview}
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
                                                    id="studioimagefile"
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

                                <div className="form-row full-width">
                                    <div className="form-group">
                                        <label htmlFor="studioDescription">{translations.studiodescription}</label>
                                        <textarea
                                            id="studioDescription"
                                            name="studioDescription"
                                            rows="3"
                                            autoComplete="off"
                                            placeholder={translations.enterstudiodescription}
                                            value={studioDescription}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (value.length === 1 && value === " ") return;
                                                setStudioDescription(value);
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="buttonText">{translations.buttontext}</label>
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
                                        <label htmlFor="buttonLink">{translations.buttonlink}</label>
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

                                <div className="form-row full-width">
                                    <div className="form-group">
                                        <label htmlFor="studioImageUrl">{translations.orimageurl}</label>
                                        <input
                                            type="text"
                                            id="studioImageUrl"
                                            name="studioImageUrl"
                                            autoComplete="off"
                                            placeholder={translations.enterimageurl}
                                            value={studioImage}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setStudioImage(val);
                                                if (!imageFile) {
                                                    setImagePreview(val.trim() ? val.trim() : Placeholder);
                                                }
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="button-group">
                                    <button
                                        type="button"
                                        className="btn btn-secondary cancelbtn"
                                        onClick={handleCancel}
                                        disabled={isSaving}
                                    >
                                        {translations.cancel}
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-success submit-btn"
                                        disabled={isSaving}
                                    >
                                        {isSaving ? translations.saving : translations.save}
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

export default AboutUs;
