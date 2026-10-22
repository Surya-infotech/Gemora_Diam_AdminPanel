import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Middleware/Auth';
import LoadingSpinner from '../Custom/LoadingSpinner';
import WarningModal from '../Custom/WarningModal';
import AlertMessage from '../Custom/AlertMessage';
import CustomSwitch from '../Custom/CustomSwitch';
import DeleteButton from '../Custom/DeleteButton';
import "../../Scss/Support/CoupleSection/couplesection.scss";
import { useLanguage } from "../../Context/LanguageContext";
import CheckToken from '../../utils/CheckToken';
import HandleUnauthorized from '../../utils/HandleUnauthorized';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';

const CoupleSection = () => {
    const navigate = useNavigate();
    const { translations, isRtl } = useLanguage();
    const { logoutUser } = useAuth();
    const adminPanelBackendPath = import.meta.env.VITE_BACKEND_URL;
    const tokenname = import.meta.env.VITE_AdminTOKEN_NAME;
    const token = localStorage.getItem(tokenname);

    const [alertMessage, setAlertMessage] = useState("");
    const [warningMessage, setWarningMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState("stories"); // "stories" | "reviews"

    // Section Status & Header
    const [sectionStatus, setSectionStatus] = useState(true);
    const [headerEyebrow, setHeaderEyebrow] = useState("");
    const [headerTitle, setHeaderTitle] = useState("");
    const [headerDescription, setHeaderDescription] = useState("");
    const [ratingScore, setRatingScore] = useState("");
    const [reviewCountText, setReviewCountText] = useState("");

    // Stories & Reviews lists
    const [stories, setStories] = useState([]);
    const [reviews, setReviews] = useState([]);

    // File input ref
    const fileInputRefs = useRef({});

    useEffect(() => {
        document.title = `${translations.coupleSection || "Loved by Couples"} | Gemora Diam`;
    }, [translations]);

    const fetchCoupleSection = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${adminPanelBackendPath}/Support/GetCoupleSection`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (res.status === 401) {
                HandleUnauthorized(logoutUser, navigate);
                return;
            }
            const data = await res.json();
            if (res.ok && data) {
                setSectionStatus(data.status !== undefined ? data.status : true);
                setHeaderEyebrow(data.headerEyebrow || "");
                setHeaderTitle(data.headerTitle || "");
                setHeaderDescription(data.headerDescription || "");
                setRatingScore(data.ratingScore || "");
                setReviewCountText(data.reviewCountText || "");
                setStories(data.stories || []);
                setReviews(data.reviews || []);
            }
        } catch (error) {
            console.error("Error fetching couple section:", error);
            setWarningMessage("Failed to load Couple Stories section data");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        CheckToken(token, logoutUser, navigate);
        fetchCoupleSection();
    }, []);



    // Story Handlers
    const handleStoryChange = (index, field, value) => {
        setStories(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    const handleAddStory = () => {
        const newStory = {
            storyId: `story-${Date.now()}`,
            names: "",
            location: "",
            ringName: "",
            proposalDate: "",
            excerpt: "",
            badge: "",
            image: "",
            storyLink: "",
            order: stories.length + 1,
            status: true
        };
        setStories(prev => [...prev, newStory]);
    };

    const handleDeleteStory = (index) => {
        setStories(prev => prev.filter((_, i) => i !== index));
    };

    const handleStoryImageUpload = async (index, file) => {
        if (!file) return;
        const formData = new FormData();
        formData.append("image", file);

        try {
            const res = await fetch(`${adminPanelBackendPath}/Support/UploadCoupleAsset`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            });
            const data = await res.json();
            if (res.ok && data.url) {
                handleStoryChange(index, "image", data.url);
                setAlertMessage("Image uploaded successfully!");
            } else {
                setWarningMessage(data.message || "Failed to upload image");
            }
        } catch (error) {
            console.error("Upload error:", error);
            setWarningMessage("Network error while uploading image");
        }
    };

    // Review Handlers
    const handleReviewChange = (index, field, value) => {
        setReviews(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    const handleAddReview = () => {
        const newReview = {
            reviewId: `review-${Date.now()}`,
            name: "",
            badge: "",
            rating: 5,
            quote: "",
            order: reviews.length + 1,
            status: true
        };
        setReviews(prev => [...prev, newReview]);
    };

    const handleDeleteReview = (index) => {
        setReviews(prev => prev.filter((_, i) => i !== index));
    };

    // Save All
    const handleSave = async (e) => {
        if (e) e.preventDefault();
        setIsSaving(true);
        try {
            const payload = {
                status: sectionStatus,
                headerEyebrow,
                headerTitle,
                headerDescription,
                ratingScore,
                reviewCountText,
                stories,
                reviews
            };

            const res = await fetch(`${adminPanelBackendPath}/Support/UpdateCoupleSection`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.status === 401) {
                HandleUnauthorized(logoutUser, navigate);
                return;
            }

            const data = await res.json();
            if (res.ok) {
                setAlertMessage("Couple Stories & Reviews section updated successfully!");
            } else {
                setWarningMessage(data.message || "Failed to update section");
            }
        } catch (error) {
            console.error("Save error:", error);
            setWarningMessage("Network error while saving changes");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        navigate('/Home/Dashboard');
    };

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return (
        <div className={`CoupleSection-container ${isRtl ? 'rtl-couplesection' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="couplesection-container">
                <h6 className="couplesection-headingname">
                    {translations.coupleSection || "Loved by Couples"}
                </h6>

                <div className="couplesection-form-container">
                    {alertMessage && <AlertMessage message={alertMessage} onClose={() => setAlertMessage("")} />}
                    {warningMessage && <WarningModal message={warningMessage} onClose={() => setWarningMessage("")} />}

                    {/* Top Action Bar */}
                    <div className="top-actions-bar">
                        <div className="section-toggle-wrap">
                            <span className="toggle-label">{translations.status || "Section Visibility"}:</span>
                            <CustomSwitch
                                checked={sectionStatus}
                                onChange={() => setSectionStatus(!sectionStatus)}
                            />
                            <span className={`status-badge ${sectionStatus ? 'active' : 'inactive'}`}>
                                {sectionStatus ? (translations.active || "Active on Website") : (translations.inactive || "Disabled")}
                            </span>
                        </div>

                        <div className="top-action-btns">
                            <button
                                type="button"
                                className="btn btn-success submit-btn"
                                onClick={handleSave}
                                disabled={isSaving}
                            >
                                <SaveIcon fontSize="small" />
                                {isSaving ? (translations.saving || "Saving...") : (translations.save || "Save All Changes")}
                            </button>
                        </div>
                    </div>

                    {/* Section Header Settings */}
                    <div className="form-section-divider">
                        <h6 className="form-section-title">Main Section Header & Overall Rating</h6>
                        <span className="form-section-subtitle">Headline, sub-description, and customer rating summary.</span>
                    </div>

                    <div className="form-row-four">
                        <div className="form-group">
                            <label>Eyebrow Tag</label>
                            <input
                                type="text"
                                value={headerEyebrow}
                                onChange={(e) => setHeaderEyebrow(e.target.value)}
                                placeholder="e.g. REAL LOVE STORIES"
                            />
                        </div>

                        <div className="form-group">
                            <label>Main Heading Title</label>
                            <input
                                type="text"
                                value={headerTitle}
                                onChange={(e) => setHeaderTitle(e.target.value)}
                                placeholder="e.g. Loved by couples"
                            />
                        </div>

                        <div className="form-group">
                            <label>Rating Score</label>
                            <input
                                type="text"
                                value={ratingScore}
                                onChange={(e) => setRatingScore(e.target.value)}
                                placeholder="e.g. 5.0"
                            />
                        </div>

                        <div className="form-group">
                            <label>Review Count Label</label>
                            <input
                                type="text"
                                value={reviewCountText}
                                onChange={(e) => setReviewCountText(e.target.value)}
                                placeholder="e.g. from 5 verified reviews"
                            />
                        </div>
                    </div>

                    <div className="form-row full-width">
                        <div className="form-group">
                            <label>Sub-heading Description</label>
                            <textarea
                                rows="2"
                                value={headerDescription}
                                onChange={(e) => setHeaderDescription(e.target.value)}
                                placeholder="Proposals, promises, and the rings that made them. In their own words."
                            />
                        </div>
                    </div>

                    {/* Tabs for Stories vs Reviews */}
                    <div className="tab-buttons">
                        <button
                            type="button"
                            className={`tab-btn ${activeTab === 'stories' ? 'active' : ''}`}
                            onClick={() => setActiveTab('stories')}
                        >
                            <FavoriteIcon fontSize="small" style={{ color: '#e11d48' }} />
                            Real Couple Stories ({stories.length})
                        </button>
                        <button
                            type="button"
                            className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
                            onClick={() => setActiveTab('reviews')}
                        >
                            <FormatQuoteIcon fontSize="small" style={{ color: '#d97706' }} />
                            Client Reviews ({reviews.length})
                        </button>
                    </div>

                    {/* STORIES TAB CONTENT */}
                    {activeTab === 'stories' && (
                        <div>
                            <div className="tab-header-action">
                                <p className="tab-desc">
                                    Photo story cards displayed in the horizontal carousel with real couple photos and proposal excerpts.
                                </p>
                                <button
                                    type="button"
                                    className="add-new-btn"
                                    onClick={handleAddStory}
                                >
                                    <AddIcon fontSize="small" /> Add New Couple Story
                                </button>
                            </div>

                            {stories.length === 0 ? (
                                <div className="text-center py-5 text-muted bg-white rounded-3 border" style={{ padding: '30px', textAlign: 'center' }}>
                                    No couple stories added yet. Click &quot;Add New Couple Story&quot; above.
                                </div>
                            ) : (
                                stories.map((story, index) => (
                                    <div key={story.storyId || index} className="item-card">
                                        <div className="item-header">
                                            <div className="item-title">
                                                #{index + 1} &mdash; {story.names || "Untitled Story"}
                                            </div>
                                            <div className="item-actions">
                                                <CustomSwitch
                                                    checked={story.status !== false}
                                                    onChange={(e) => handleStoryChange(index, "status", e.target.checked)}
                                                />
                                                <DeleteButton onClick={() => handleDeleteStory(index)} />
                                            </div>
                                        </div>

                                        <div className="form-row-four">
                                            <div className="form-group">
                                                <label>Couple Names</label>
                                                <input
                                                    type="text"
                                                    value={story.names || ""}
                                                    onChange={(e) => handleStoryChange(index, "names", e.target.value)}
                                                    placeholder="e.g. Liam & Sophia"
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label>Location</label>
                                                <input
                                                    type="text"
                                                    value={story.location || ""}
                                                    onChange={(e) => handleStoryChange(index, "location", e.target.value)}
                                                    placeholder="e.g. Aspen, Colorado"
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label>Badge Label</label>
                                                <input
                                                    type="text"
                                                    value={story.badge || ""}
                                                    onChange={(e) => handleStoryChange(index, "badge", e.target.value)}
                                                    placeholder="e.g. Custom Solitaire"
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label>Display Order</label>
                                                <input
                                                    type="number"
                                                    value={story.order ?? (index + 1)}
                                                    onChange={(e) => handleStoryChange(index, "order", parseInt(e.target.value) || 1)}
                                                />
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Ring Details / Name</label>
                                                <input
                                                    type="text"
                                                    value={story.ringName || ""}
                                                    onChange={(e) => handleStoryChange(index, "ringName", e.target.value)}
                                                    placeholder="e.g. 2.45ct Oval Diamond in Platinum"
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label>Story Link</label>
                                                <input
                                                    type="text"
                                                    value={story.storyLink || ""}
                                                    onChange={(e) => handleStoryChange(index, "storyLink", e.target.value)}
                                                    placeholder="e.g. /collections/solitaire-rings"
                                                />
                                            </div>
                                        </div>

                                        <div className="form-row full-width">
                                            <div className="form-group">
                                                <label>Proposal Story Excerpt</label>
                                                <textarea
                                                    rows="2"
                                                    value={story.excerpt || ""}
                                                    onChange={(e) => handleStoryChange(index, "excerpt", e.target.value)}
                                                    placeholder="Write the couple's story excerpt here..."
                                                />
                                            </div>
                                        </div>

                                        <div className="form-row full-width">
                                            <div className="form-group">
                                                <label>Couple Photo</label>
                                                <div className="image-upload-row">
                                                    {story.image && (
                                                        <img
                                                            src={story.image}
                                                            alt={story.names || "Couple"}
                                                            className="img-preview"
                                                        />
                                                    )}
                                                    <input
                                                        type="text"
                                                        className="img-url-input"
                                                        value={story.image || ""}
                                                        onChange={(e) => handleStoryChange(index, "image", e.target.value)}
                                                        placeholder="Image URL or upload below"
                                                    />
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        style={{ display: 'none' }}
                                                        ref={(el) => (fileInputRefs.current[`story_${index}`] = el)}
                                                        onChange={(e) => {
                                                            if (e.target.files && e.target.files[0]) {
                                                                handleStoryImageUpload(index, e.target.files[0]);
                                                            }
                                                        }}
                                                    />
                                                    <button
                                                        type="button"
                                                        className="upload-btn"
                                                        onClick={() => fileInputRefs.current[`story_${index}`]?.click()}
                                                    >
                                                        <CloudUploadIcon fontSize="small" /> Upload to S3
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* REVIEWS TAB CONTENT */}
                    {activeTab === 'reviews' && (
                        <div>
                            <div className="tab-header-action">
                                <p className="tab-desc">
                                    Dark luxury quotation cards with verified client badges and 5-star ratings interleaved between stories.
                                </p>
                                <button
                                    type="button"
                                    className="add-new-btn"
                                    onClick={handleAddReview}
                                >
                                    <AddIcon fontSize="small" /> Add New Client Review
                                </button>
                            </div>

                            {reviews.length === 0 ? (
                                <div className="text-center py-5 text-muted bg-white rounded-3 border" style={{ padding: '30px', textAlign: 'center' }}>
                                    No client reviews added yet. Click &quot;Add New Client Review&quot; above.
                                </div>
                            ) : (
                                reviews.map((rev, index) => (
                                    <div key={rev.reviewId || index} className="item-card">
                                        <div className="item-header">
                                            <div className="item-title">
                                                #{index + 1} &mdash; {rev.name || "Anonymous Client"} ({rev.rating || 5} Stars)
                                            </div>
                                            <div className="item-actions">
                                                <CustomSwitch
                                                    checked={rev.status !== false}
                                                    onChange={(e) => handleReviewChange(index, "status", e.target.checked)}
                                                />
                                                <DeleteButton onClick={() => handleDeleteReview(index)} />
                                            </div>
                                        </div>

                                        <div className="form-row-four">
                                            <div className="form-group">
                                                <label>Client Name</label>
                                                <input
                                                    type="text"
                                                    value={rev.name || ""}
                                                    onChange={(e) => handleReviewChange(index, "name", e.target.value)}
                                                    placeholder="e.g. Marcus T."
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label>Badge</label>
                                                <input
                                                    type="text"
                                                    value={rev.badge || ""}
                                                    onChange={(e) => handleReviewChange(index, "badge", e.target.value)}
                                                    placeholder="e.g. Verified Buyer"
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label>Rating (Stars)</label>
                                                <select
                                                    value={rev.rating || 5}
                                                    onChange={(e) => handleReviewChange(index, "rating", parseInt(e.target.value) || 5)}
                                                >
                                                    <option value="5">5 Stars</option>
                                                    <option value="4">4 Stars</option>
                                                    <option value="3">3 Stars</option>
                                                    <option value="2">2 Stars</option>
                                                    <option value="1">1 Star</option>
                                                </select>
                                            </div>

                                            <div className="form-group">
                                                <label>Display Order</label>
                                                <input
                                                    type="number"
                                                    value={rev.order ?? (index + 1)}
                                                    onChange={(e) => handleReviewChange(index, "order", parseInt(e.target.value) || 1)}
                                                />
                                            </div>
                                        </div>

                                        <div className="form-row full-width">
                                            <div className="form-group">
                                                <label>Testimonial Quote</label>
                                                <textarea
                                                    rows="3"
                                                    value={rev.quote || ""}
                                                    onChange={(e) => handleReviewChange(index, "quote", e.target.value)}
                                                    placeholder="Client quote text..."
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* Bottom Save & Cancel Button Group */}
                    <div className="button-group">
                        <button
                            type="button"
                            className="btn btn-secondary cancelbtn"
                            onClick={handleCancel}
                            disabled={isSaving}
                        >
                            {translations.cancel || "Cancel"}
                        </button>
                        <button
                            type="button"
                            className="btn btn-success submit-btn"
                            onClick={handleSave}
                            disabled={isSaving}
                        >
                            {isSaving ? (translations.saving || "Saving...") : (translations.save || "Save All Changes")}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CoupleSection;