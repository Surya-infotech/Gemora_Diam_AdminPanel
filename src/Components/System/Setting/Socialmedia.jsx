import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import "../../../Scss/System/Setting/socialmedia.scss";
import { useLanguage } from '../../../Context/LanguageContext';
import { useAuth } from '../../../Middleware/Auth';
import Dropdown from '../../Dropdown/Dropdown';
import LoadingSpinner from '../../../Pages/Custom/LoadingSpinner';
import WarningModal from '../../../Pages/Custom/WarningModal';
import AlertMessage from '../../../Pages/Custom/AlertMessage';
import CheckToken from '../../../utils/CheckToken';
import HandleUnauthorized from '../../../utils/HandleUnauthorized';

const Socialmedia = () => {
    const navigate = useNavigate();
    const { logoutUser } = useAuth();
    const { translations } = useLanguage();
    const adminPanelBackendPath = import.meta.env.VITE_BACKEND_URL;
    const tokenname = import.meta.env.VITE_AdminTOKEN_NAME;
    const token = localStorage.getItem(tokenname);
    const [loading, setLoading] = useState(true);
    const [warningMessage, setWarningMessage] = useState("");
    const [showWarning, setShowWarning] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [socialMedia, setSocialMedia] = useState([]);

    const socialMediaOptions = [
        { name: translations.facebook, value: "Facebook" },
        { name: translations.instagram, value: "Instagram" },
        { name: translations.twitter, value: "Twitter" },
        { name: translations.linkedin, value: "LinkedIn" },
        { name: translations.youtube, value: "YouTube" },
        { name: translations.pinterest, value: "Pinterest" },
        { name: translations.whatsapp, value: "WhatsApp" }
    ];

    useEffect(() => {
        if (translations.socialmedia) document.title = translations.socialmedia;
    }, [translations]);

    useEffect(() => {
        if (!CheckToken(token, logoutUser, navigate)) return;

        const fetchSocialMediaSettings = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${adminPanelBackendPath}/System/GetSocialMedia`, {
                    method: "GET",
                    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                });
                const data = await response.json();
                if (HandleUnauthorized(data, logoutUser, navigate)) return;

                if (response.ok && data) {
                    if (data.socialmedia && Array.isArray(data.socialmedia) && data.socialmedia.length > 0) {
                        setSocialMedia(data.socialmedia);
                    } else {
                        setSocialMedia([{ platform: "", url: "" }]);
                    }
                } else {
                    setSocialMedia([{ platform: "", url: "" }]);
                }
            } catch {
                setWarningMessage(translations.servererror);
                setShowWarning(true);
            } finally {
                setLoading(false);
            }
        };

        fetchSocialMediaSettings();
    }, [token, navigate, logoutUser, adminPanelBackendPath, translations]);

    const handleSocialMediaChange = (index, field, value) => {
        if (field === 'platform' && value) {
            const isDuplicate = socialMedia.some((sm, i) => i !== index && sm.platform === value);
            if (isDuplicate) {
                const platformName = socialMediaOptions.find(opt => opt.value === value)?.name || value;
                setWarningMessage(`${platformName} ${translations.alreadyselected}`);
                setShowWarning(true);
                return;
            }
        }
        const updatedSocialMedia = [...socialMedia];
        updatedSocialMedia[index][field] = value;
        setSocialMedia(updatedSocialMedia);
    };

    const addSocialMedia = () => {
        setSocialMedia([...socialMedia, { platform: "", url: "" }]);
    };

    const removeSocialMedia = (index) => {
        if (socialMedia.length > 1) {
            setSocialMedia(socialMedia.filter((_, i) => i !== index));
        } else {
            setSocialMedia([{ platform: "", url: "" }]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!CheckToken(token, logoutUser, navigate)) return;

        if (socialMedia.length > 0) {
            const incompleteSocialMedia = socialMedia.find(sm => !sm.platform || !sm.url);
            if (incompleteSocialMedia) {
                setWarningMessage(translations.pleaseselectsocialmediaandurl);
                setShowWarning(true);
                return;
            }
        }

        try {
            const settingsData = {
                socialmedia: socialMedia.filter(sm => sm.platform && sm.url)
            };

            const response = await fetch(`${adminPanelBackendPath}/System/UpdateSocialMedia`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify(settingsData),
            });

            const data = await response.json();
            if (HandleUnauthorized(data, logoutUser, navigate)) return;

            if (response.ok) {
                setSuccessMessage(translations.updatesocialmediasettingssuccessfull);
            } else {
                const errorMessages = {
                    "Server error": translations.servererror,
                    "All fields are required": translations.allfieldrequired
                };
                setWarningMessage(errorMessages[data.message] || translations.servererror);
                setShowWarning(true);
            }
        } catch {
            setWarningMessage(translations.servererror);
            setShowWarning(true);
        }
    };

    const handleWarningClose = () => setShowWarning(false);
    const handleCloseAlert = () => setSuccessMessage("");

    return (<>
        {showWarning && <WarningModal message={warningMessage} onClose={handleWarningClose} />}
        {successMessage && <AlertMessage message={successMessage} onClose={handleCloseAlert} />}
        <div className="Socialmedia-container">
            {loading ? (
                <LoadingSpinner />
            ) : (
                <form onSubmit={handleSubmit}>
                    <div className="form-group social-media-group">
                        {(socialMedia.length === 0 ? [{ platform: "", url: "" }] : socialMedia).map((sm, index) => (
                            <div key={index} className="social-media-row">
                                <div className="social-media-platform">
                                    <Dropdown
                                        selectedValue={sm.platform || ""}
                                        onValueChange={(value) => {
                                            if (socialMedia.length === 0) {
                                                setSocialMedia([{ platform: value, url: "" }]);
                                            } else {
                                                handleSocialMediaChange(index, 'platform', value);
                                            }
                                        }}
                                        label={index === 0 ? (translations.socialmedia) : ""}
                                        options={socialMediaOptions}
                                        labelKey="name"
                                        valueKey="value"
                                        placeholder={translations.selectsocialmedia}
                                    />
                                </div>
                                <div className="social-media-url">
                                    {index === 0 && <label htmlFor={`social-url-${index}`}>{translations.socialmediaurl}</label>}
                                    <input
                                        type="url"
                                        id={`social-url-${index}`}
                                        className="form-control"
                                        placeholder={translations.socialmediaurlplaceholder}
                                        value={sm.url || ""}
                                        onChange={(e) => {
                                            if (socialMedia.length === 0) {
                                                setSocialMedia([{ platform: "", url: e.target.value }]);
                                            } else {
                                                handleSocialMediaChange(index, 'url', e.target.value);
                                            }
                                        }}
                                    />
                                </div>
                                {socialMedia.length > 1 && (
                                    <button type="button" className="btn btn-danger social-media-delete-btn" onClick={() => removeSocialMedia(index)} aria-label={translations.remove}  >
                                        <DeleteIcon />
                                    </button>
                                )}
                            </div>
                        ))}
                        <button type="button" className="btn btn-primary social-media-add-btn" onClick={addSocialMedia}  >
                            {translations.addsocialmedia}
                        </button>
                    </div>
                    <div className="button-group">
                        <button type="submit" className="btn btn-success submit-btn">{translations.save}</button>
                    </div>
                </form>
            )}
        </div>
    </>);
}

export default Socialmedia;