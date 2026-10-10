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
                setAlertMessage(translations.updateaboutussuccessfull || "About Us details updated successfully");
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

    return (
        <>
            {showWarning && <WarningModal message={warningMessage} onClose={() => setShowWarning(false)} />}
            <div className={`AboutUs-container ${isRtl ? 'rtl-aboutus' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
                <div className="aboutus-container">
                    <h6 className="aboutus-headingname">{translations.AboutUs}</h6>

                    <div className="aboutus-form-container">
                        {alertMessage && <AlertMessage message={alertMessage} onClose={() => setAlertMessage("")} />}

                        {isLoading ? (
                            <LoadingSpinner />
                        ) : (
                            <form onSubmit={handleSubmit}>
                                {/* SECTION 1: HERO / HERITAGE & VISION */}
                                <div className="about-section-card">
                                    <h5 className="about-section-title">{translations.herosection || "Heritage & Vision (Hero)"}</h5>
                                    <p className="about-section-subtitle">
                                        Configure the introductory hero banner at the top of the About Us page.
                                    </p>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="heroEyebrow">{translations.heroeyebrow || "Hero Eyebrow / Tag"}</label>
                                            <input
                                                type="text"
                                                id="heroEyebrow"
                                                name="heroEyebrow"
                                                autoComplete="off"
                                                placeholder={translations.enterheroeyebrow || "e.g. OUR HERITAGE & VISION"}
                                                value={heroEyebrow}
                                                onChange={(e) => setHeroEyebrow(e.target.value)}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="heroTitle">{translations.herotitle || "Hero Main Heading"}</label>
                                            <input
                                                type="text"
                                                id="heroTitle"
                                                name="heroTitle"
                                                autoComplete="off"
                                                placeholder={translations.enterherotitle || "e.g. Crafting Timeless Brilliance"}
                                                value={heroTitle}
                                                onChange={(e) => setHeroTitle(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="form-row full-width">
                                        <div className="form-group">
                                            <label htmlFor="heroDescription">{translations.herodescription || "Hero Description"}</label>
                                            <textarea
                                                id="heroDescription"
                                                name="heroDescription"
                                                rows="3"
                                                autoComplete="off"
                                                placeholder={translations.enterherodescription || "Enter heritage and vision story..."}
                                                value={heroDescription}
                                                onChange={(e) => setHeroDescription(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION 2: PILLARS OF COMMITMENT */}
                                <div className="about-section-card">
                                    <h5 className="about-section-title">{translations.commitmentsection || "Pillars of Excellence / Commitment"}</h5>
                                    <p className="about-section-subtitle">
                                        Configure the 3 core commitment pillars showcasing artisanal mastery, certified quality, and customer guarantee.
                                    </p>

                                    <div className="form-row full-width">
                                        <div className="form-group">
                                            <label htmlFor="commitmentEyebrow">{translations.commitmenteyebrow || "Commitment Eyebrow"}</label>
                                            <input
                                                type="text"
                                                id="commitmentEyebrow"
                                                name="commitmentEyebrow"
                                                autoComplete="off"
                                                placeholder={translations.entercommitmenteyebrow || "e.g. OUR COMMITMENT"}
                                                value={commitmentEyebrow}
                                                onChange={(e) => setCommitmentEyebrow(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="pillars-grid">
                                        <div className="pillar-card">
                                            <div className="pillar-card-header">{translations.pillar1 || "Pillar 1"}</div>
                                            <div className="form-group">
                                                <label htmlFor="pillar1Title">{translations.pillar1title || "Title"}</label>
                                                <input
                                                    type="text"
                                                    id="pillar1Title"
                                                    name="pillar1Title"
                                                    autoComplete="off"
                                                    placeholder={translations.enterpillartitle || "e.g. Artisanal Precision"}
                                                    value={pillar1Title}
                                                    onChange={(e) => setPillar1Title(e.target.value)}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="pillar1Description">{translations.pillar1description || "Description"}</label>
                                                <textarea
                                                    id="pillar1Description"
                                                    name="pillar1Description"
                                                    autoComplete="off"
                                                    placeholder={translations.enterpillardescription || "Enter pillar description..."}
                                                    value={pillar1Description}
                                                    onChange={(e) => setPillar1Description(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="pillar-card">
                                            <div className="pillar-card-header">{translations.pillar2 || "Pillar 2"}</div>
                                            <div className="form-group">
                                                <label htmlFor="pillar2Title">{translations.pillar2title || "Title"}</label>
                                                <input
                                                    type="text"
                                                    id="pillar2Title"
                                                    name="pillar2Title"
                                                    autoComplete="off"
                                                    placeholder={translations.enterpillartitle || "e.g. Certified Quality"}
                                                    value={pillar2Title}
                                                    onChange={(e) => setPillar2Title(e.target.value)}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="pillar2Description">{translations.pillar2description || "Description"}</label>
                                                <textarea
                                                    id="pillar2Description"
                                                    name="pillar2Description"
                                                    autoComplete="off"
                                                    placeholder={translations.enterpillardescription || "Enter pillar description..."}
                                                    value={pillar2Description}
                                                    onChange={(e) => setPillar2Description(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="pillar-card">
                                            <div className="pillar-card-header">{translations.pillar3 || "Pillar 3"}</div>
                                            <div className="form-group">
                                                <label htmlFor="pillar3Title">{translations.pillar3title || "Title"}</label>
                                                <input
                                                    type="text"
                                                    id="pillar3Title"
                                                    name="pillar3Title"
                                                    autoComplete="off"
                                                    placeholder={translations.enterpillartitle || "e.g. Lifetime Care"}
                                                    value={pillar3Title}
                                                    onChange={(e) => setPillar3Title(e.target.value)}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="pillar3Description">{translations.pillar3description || "Description"}</label>
                                                <textarea
                                                    id="pillar3Description"
                                                    name="pillar3Description"
                                                    autoComplete="off"
                                                    placeholder={translations.enterpillardescription || "Enter pillar description..."}
                                                    value={pillar3Description}
                                                    onChange={(e) => setPillar3Description(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION 3: STUDIO & SHOWROOM SPOTLIGHT */}
                                <div className="about-section-card">
                                    <h5 className="about-section-title">{translations.studiosection || "Fine Jewelry Studio & Showroom Spotlight"}</h5>
                                    <p className="about-section-subtitle">
                                        Highlight your workshop, atelier craftsmanship, showcase photography, and call to action.
                                    </p>

                                    <div className="imageflex">
                                        <div className="formdiv">
                                            <div className="form-group">
                                                <label htmlFor="studioEyebrow">{translations.studioeyebrow || "Studio Eyebrow"}</label>
                                                <input
                                                    type="text"
                                                    id="studioEyebrow"
                                                    name="studioEyebrow"
                                                    autoComplete="off"
                                                    placeholder={translations.enterstudioeyebrow || "e.g. FINE JEWELRY STUDIO"}
                                                    value={studioEyebrow}
                                                    onChange={(e) => setStudioEyebrow(e.target.value)}
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label htmlFor="studioTitle">{translations.studiotitle || "Studio Title"}</label>
                                                <input
                                                    type="text"
                                                    id="studioTitle"
                                                    name="studioTitle"
                                                    autoComplete="off"
                                                    placeholder={translations.enterstudiotitle || "e.g. Studio & Showroom"}
                                                    value={studioTitle}
                                                    onChange={(e) => setStudioTitle(e.target.value)}
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label htmlFor="studioDescription">{translations.studiodescription || "Studio Description"}</label>
                                                <textarea
                                                    id="studioDescription"
                                                    name="studioDescription"
                                                    rows="4"
                                                    autoComplete="off"
                                                    placeholder={translations.enterstudiodescription || "Enter studio and craftsmanship description..."}
                                                    value={studioDescription}
                                                    onChange={(e) => setStudioDescription(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="imagediv">
                                            <div className="form-group">
                                                <div className="imgpreview">
                                                    <div className="image-preview-container">
                                                        <img
                                                            src={imagePreview}
                                                            alt="Studio Preview"
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

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="buttonText">{translations.buttontext || "Button Text"}</label>
                                            <input
                                                type="text"
                                                id="buttonText"
                                                name="buttonText"
                                                autoComplete="off"
                                                placeholder={translations.enterbuttontext || "e.g. Explore Collections"}
                                                value={buttonText}
                                                onChange={(e) => setButtonText(e.target.value)}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="buttonLink">{translations.buttonlink || "Button Link"}</label>
                                            <input
                                                type="text"
                                                id="buttonLink"
                                                name="buttonLink"
                                                autoComplete="off"
                                                placeholder={translations.enterbuttonlink || "e.g. /shop"}
                                                value={buttonLink}
                                                onChange={(e) => setButtonLink(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="form-row full-width">
                                        <div className="form-group">
                                            <label htmlFor="studioImageUrl">{translations.orimageurl || "Or Studio Image URL (Optional)"}</label>
                                            <input
                                                type="text"
                                                id="studioImageUrl"
                                                name="studioImageUrl"
                                                autoComplete="off"
                                                placeholder={translations.enterimageurl || "Enter image URL"}
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
                                </div>

                                <div className="button-group">
                                    <button
                                        type="submit"
                                        className="btn btn-success submit-btn"
                                        disabled={isSaving}
                                    >
                                        {isSaving ? (translations.saving || "Saving...") : (translations.save || "Save Changes")}
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
