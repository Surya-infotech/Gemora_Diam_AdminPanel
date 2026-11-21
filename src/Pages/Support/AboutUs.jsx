import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Placeholder from '../../assets/placeholder.png';
import { useAuth } from '../../Middleware/Auth';
import LoadingSpinner from '../Custom/LoadingSpinner';
import WarningModal from '../Custom/WarningModal';
import AlertMessage from '../Custom/AlertMessage';
import "../../Scss/Support/AboutUs/aboutus.scss";
import CheckToken from '../../utils/CheckToken';
import HandleUnauthorized from '../../utils/HandleUnauthorized';
const AboutUs = () => {
  const navigate = useNavigate();
  const {
    logoutUser
  } = useAuth();
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
    if ("About Us") {
      document.title = "About Us";
    }
  }, []);
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
        setWarningMessage("Server error");
        setShowWarning(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAboutUs();
  }, [token, adminPanelBackendPath, logoutUser, navigate]);
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  const handleFileChange = e => {
    const file = e.target.files[0];
    if (file) {
      const allowed = ["jpg", "jpeg", "png", "webp"];
      const ext = file.name.split('.').pop().toLowerCase();
      if (!allowed.includes(ext)) {
        setWarningMessage("Invalid file extension. Only JPG, JPEG, PNG files are allowed.");
        setShowWarning(true);
        e.target.value = '';
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setWarningMessage("File size too large. Maximum size is 10MB.");
        setShowWarning(true);
        e.target.value = '';
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };
  const handleSubmit = async e => {
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
        setAlertMessage("About Us details updated successfully");
        if (result.aboutUs?.studioImage) {
          setStudioImage(result.aboutUs.studioImage);
          setImagePreview(result.aboutUs.studioImage);
        }
        setImageFile(null);
      } else {
        setWarningMessage(result.message || "Server error");
        setShowWarning(true);
      }
    } catch {
      setWarningMessage("Server error");
      setShowWarning(true);
    } finally {
      setIsSaving(false);
    }
  };
  const handleCancel = () => {
    navigate('/Home/Dashboard');
  };
  return <>
            {showWarning && <WarningModal message={warningMessage} onClose={() => setShowWarning(false)} />}
            <div className="AddAboutUs-container ">
                <div className="Addaboutus-container">
                    <h6 className="Addaboutus-headingname">{"About Us"}</h6>

                    <div className="Addaboutus-form-container">
                        {alertMessage && <AlertMessage message={alertMessage} onClose={() => setAlertMessage("")} />}

                        {isLoading ? <LoadingSpinner /> : <form onSubmit={handleSubmit}>
                                {/* SECTION 1: HERITAGE & VISION (HERO) */}
                                <div className="form-section-divider">
                                    <h6 className="form-section-title">{"Heritage & Vision (Hero)"}</h6>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="heroEyebrow">{"Hero Eyebrow / Tag"}</label>
                                        <input type="text" id="heroEyebrow" name="heroEyebrow" autoComplete="off" placeholder={"e.g. OUR HERITAGE & VISION"} value={heroEyebrow} onChange={e => {
                  const value = e.target.value;
                  if (value.length === 1 && value === " ") return;
                  setHeroEyebrow(value);
                }} />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="heroTitle">{"Hero Main Heading"}</label>
                                        <input type="text" id="heroTitle" name="heroTitle" autoComplete="off" placeholder={"e.g. Crafting Timeless Brilliance"} value={heroTitle} onChange={e => {
                  const value = e.target.value;
                  if (value.length === 1 && value === " ") return;
                  setHeroTitle(value);
                }} />
                                    </div>
                                </div>

                                <div className="form-row full-width">
                                    <div className="form-group">
                                        <label htmlFor="heroDescription">{"Hero Description"}</label>
                                        <textarea id="heroDescription" name="heroDescription" rows="3" autoComplete="off" placeholder={"Enter heritage and vision story..."} value={heroDescription} onChange={e => {
                  const value = e.target.value;
                  if (value.length === 1 && value === " ") return;
                  setHeroDescription(value);
                }} />
                                    </div>
                                </div>

                                {/* SECTION 2: PILLARS OF COMMITMENT */}
                                <div className="form-section-divider">
                                    <h6 className="form-section-title">{"Pillars of Excellence / Commitment"}</h6>
                                </div>

                                <div className="form-row full-width">
                                    <div className="form-group">
                                        <label htmlFor="commitmentEyebrow">{"Commitment Eyebrow"}</label>
                                        <input type="text" id="commitmentEyebrow" name="commitmentEyebrow" autoComplete="off" placeholder={"e.g. OUR COMMITMENT"} value={commitmentEyebrow} onChange={e => {
                  const value = e.target.value;
                  if (value.length === 1 && value === " ") return;
                  setCommitmentEyebrow(value);
                }} />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="pillar1Title">{"Pillar 1 Title"}</label>
                                        <input type="text" id="pillar1Title" name="pillar1Title" autoComplete="off" placeholder={"e.g. Artisanal Precision"} value={pillar1Title} onChange={e => {
                  const value = e.target.value;
                  if (value.length === 1 && value === " ") return;
                  setPillar1Title(value);
                }} />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="pillar1Description">{"Pillar 1 Description"}</label>
                                        <textarea id="pillar1Description" name="pillar1Description" rows="2" autoComplete="off" placeholder={"Enter pillar description..."} value={pillar1Description} onChange={e => {
                  const value = e.target.value;
                  if (value.length === 1 && value === " ") return;
                  setPillar1Description(value);
                }} />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="pillar2Title">{"Pillar 2 Title"}</label>
                                        <input type="text" id="pillar2Title" name="pillar2Title" autoComplete="off" placeholder={"e.g. Artisanal Precision"} value={pillar2Title} onChange={e => {
                  const value = e.target.value;
                  if (value.length === 1 && value === " ") return;
                  setPillar2Title(value);
                }} />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="pillar2Description">{"Pillar 2 Description"}</label>
                                        <textarea id="pillar2Description" name="pillar2Description" rows="2" autoComplete="off" placeholder={"Enter pillar description..."} value={pillar2Description} onChange={e => {
                  const value = e.target.value;
                  if (value.length === 1 && value === " ") return;
                  setPillar2Description(value);
                }} />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="pillar3Title">{"Pillar 3 Title"}</label>
                                        <input type="text" id="pillar3Title" name="pillar3Title" autoComplete="off" placeholder={"e.g. Artisanal Precision"} value={pillar3Title} onChange={e => {
                  const value = e.target.value;
                  if (value.length === 1 && value === " ") return;
                  setPillar3Title(value);
                }} />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="pillar3Description">{"Pillar 3 Description"}</label>
                                        <textarea id="pillar3Description" name="pillar3Description" rows="2" autoComplete="off" placeholder={"Enter pillar description..."} value={pillar3Description} onChange={e => {
                  const value = e.target.value;
                  if (value.length === 1 && value === " ") return;
                  setPillar3Description(value);
                }} />
                                    </div>
                                </div>

                                {/* SECTION 3: FINE JEWELRY STUDIO & SHOWROOM */}
                                <div className="form-section-divider">
                                    <h6 className="form-section-title">{"Fine Jewelry Studio & Showroom Spotlight"}</h6>
                                </div>

                                <div className="imageflex">
                                    <div className="formdiv">
                                        <div className="form-group">
                                            <label htmlFor="studioEyebrow">{"Studio Eyebrow"}</label>
                                            <input type="text" id="studioEyebrow" name="studioEyebrow" autoComplete="off" placeholder={"e.g. FINE JEWELRY STUDIO"} value={studioEyebrow} onChange={e => {
                    const value = e.target.value;
                    if (value.length === 1 && value === " ") return;
                    setStudioEyebrow(value);
                  }} />
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="studioTitle">{"Studio Title"}</label>
                                            <input type="text" id="studioTitle" name="studioTitle" autoComplete="off" placeholder={"e.g. Studio & Showroom"} value={studioTitle} onChange={e => {
                    const value = e.target.value;
                    if (value.length === 1 && value === " ") return;
                    setStudioTitle(value);
                  }} />
                                        </div>
                                    </div>

                                    <div className="imagediv">
                                        <div className="form-group">
                                            <div className="imgpreview">
                                                <div className="image-preview-container">
                                                    <img src={imagePreview} alt={"Studio Preview"} className="image-preview" onError={e => {
                        e.target.onerror = null;
                        e.target.src = Placeholder;
                      }} />
                                                </div>
                                                <button type="button" className="btn btn-primary upload-btn" onClick={handleUploadClick}>
                                                    {"Upload"}
                                                </button>
                                                <input type="file" id="studioimagefile" name="image" accept="image/*" ref={fileInputRef} onChange={handleFileChange} style={{
                      display: "none"
                    }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-row full-width">
                                    <div className="form-group">
                                        <label htmlFor="studioDescription">{"Studio Description"}</label>
                                        <textarea id="studioDescription" name="studioDescription" rows="3" autoComplete="off" placeholder={"Enter studio and craftsmanship description..."} value={studioDescription} onChange={e => {
                  const value = e.target.value;
                  if (value.length === 1 && value === " ") return;
                  setStudioDescription(value);
                }} />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="buttonText">{"Button Text"}</label>
                                        <input type="text" id="buttonText" name="buttonText" autoComplete="off" placeholder={"e.g. EXPLORE COLLECTION"} value={buttonText} onChange={e => {
                  const value = e.target.value;
                  if (value.length === 1 && value === " ") return;
                  setButtonText(value);
                }} />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="buttonLink">{"Button Link"}</label>
                                        <input type="text" id="buttonLink" name="buttonLink" autoComplete="off" placeholder={"e.g. /collections"} value={buttonLink} onChange={e => {
                  const value = e.target.value;
                  if (value.length === 1 && value === " ") return;
                  setButtonLink(value);
                }} />
                                    </div>
                                </div>

                                <div className="form-row full-width">
                                    <div className="form-group">
                                        <label htmlFor="studioImageUrl">{"Or Banner Image URL (Optional)"}</label>
                                        <input type="text" id="studioImageUrl" name="studioImageUrl" autoComplete="off" placeholder={"Enter banner image URL"} value={studioImage} onChange={e => {
                  const val = e.target.value;
                  setStudioImage(val);
                  if (!imageFile) {
                    setImagePreview(val.trim() ? val.trim() : Placeholder);
                  }
                }} />
                                    </div>
                                </div>

                                <div className="button-group">
                                    <button type="button" className="btn btn-secondary cancelbtn" onClick={handleCancel} disabled={isSaving}>
                                        {"Cancel"}
                                    </button>
                                    <button type="submit" className="btn btn-success submit-btn" disabled={isSaving}>
                                        {isSaving ? "Saving..." : "Save"}
                                    </button>
                                </div>
                            </form>}
                    </div>
                </div>
            </div>
        </>;
};
export default AboutUs;