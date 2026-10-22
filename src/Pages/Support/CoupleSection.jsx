import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Middleware/Auth';
import LoadingSpinner from '../Custom/LoadingSpinner';
import WarningModal from '../Custom/WarningModal';
import AlertMessage from '../Custom/AlertMessage';
import "../../Scss/Support/CoupleSection/couplesection.scss";
import { useLanguage } from "../../Context/LanguageContext";
import CheckToken from '../../utils/CheckToken';
import HandleUnauthorized from '../../utils/HandleUnauthorized';
import FavoriteIcon from '@mui/icons-material/Favorite';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import StarIcon from '@mui/icons-material/Star';

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
        CheckToken(token, logoutUser, navigate);
        fetchCoupleSection();
    }, []);

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
                setAlertMessage("Image uploaded successfully to AWS S3!");
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

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="CoupleSection-container">
            <div className="couplesection-container">
                <div className="couplesection-headingname">
                    Loved by Couples Section
                </div>

                <div className="couplesection-form-container">
                    {/* Top Action Bar */}
                    <div className="top-actions-bar">
                        <div className="section-toggle-wrap">
                            <span className="toggle-label">Section Visibility:</span>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={sectionStatus}
                                    onChange={(e) => setSectionStatus(e.target.checked)}
                                />
                                <span className="slider round"></span>
                            </label>
                            <span style={{ fontSize: '13px', color: sectionStatus ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                                {sectionStatus ? 'Active on Website' : 'Hidden from Website'}
                            </span>
                        </div>

                        <button
                            type="button"
                            className="btn btn-primary d-flex align-items-center gap-2"
                            onClick={handleSave}
                            disabled={isSaving}
                            style={{ padding: '9px 24px', fontWeight: 600, borderRadius: '8px' }}
                        >
                            <SaveIcon fontSize="small" />
                            {isSaving ? "Saving..." : "Save All Changes"}
                        </button>
                    </div>

                    {/* Section Header Settings Card */}
                    <div className="settings-card">
                        <div className="card-title">
                            <span>Main Section Header & Overall Rating</span>
                        </div>

                        <div className="row g-3">
                            <div className="col-md-3">
                                <label className="form-label fw-semibold">Eyebrow Tag</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={headerEyebrow}
                                    onChange={(e) => setHeaderEyebrow(e.target.value)}
                                    placeholder=""
                                />
                            </div>

                            <div className="col-md-4">
                                <label className="form-label fw-semibold">Main Heading Title</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={headerTitle}
                                    onChange={(e) => setHeaderTitle(e.target.value)}
                                    placeholder=""
                                />
                            </div>

                            <div className="col-md-2">
                                <label className="form-label fw-semibold">Rating Score</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={ratingScore}
                                    onChange={(e) => setRatingScore(e.target.value)}
                                    placeholder=""
                                />
                            </div>

                            <div className="col-md-3">
                                <label className="form-label fw-semibold">Review Count Label</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={reviewCountText}
                                    onChange={(e) => setReviewCountText(e.target.value)}
                                    placeholder=""
                                />
                            </div>

                            <div className="col-12">
                                <label className="form-label fw-semibold">Sub-heading Description</label>
                                <textarea
                                    className="form-control"
                                    rows="2"
                                    value={headerDescription}
                                    onChange={(e) => setHeaderDescription(e.target.value)}
                                    placeholder=""
                                />
                            </div>
                        </div>
                    </div>

                    {/* Tabs for Stories vs Reviews */}
                    <div className="tab-buttons">
                        <button
                            type="button"
                            className={`tab-btn ${activeTab === 'stories' ? 'active' : ''}`}
                            onClick={() => setActiveTab('stories')}
                        >
                            <FavoriteIcon fontSize="small" style={{ marginRight: '6px', verticalAlign: 'middle', color: '#e11d48' }} />
                            Real Couple Stories ({stories.length})
                        </button>
                        <button
                            type="button"
                            className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
                            onClick={() => setActiveTab('reviews')}
                        >
                            <FormatQuoteIcon fontSize="small" style={{ marginRight: '6px', verticalAlign: 'middle', color: '#d97706' }} />
                            Client Reviews ({reviews.length})
                        </button>
                    </div>

                    {/* STORIES TAB CONTENT */}
                    {activeTab === 'stories' && (
                        <div>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <p className="text-muted mb-0" style={{ fontSize: '13px' }}>
                                    Photo story cards displayed in the horizontal carousel with real couple photos and proposal excerpts.
                                </p>
                                <button
                                    type="button"
                                    className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1"
                                    onClick={handleAddStory}
                                >
                                    <AddIcon fontSize="small" /> Add New Couple Story
                                </button>
                            </div>

                            {stories.length === 0 ? (
                                <div className="text-center py-5 text-muted bg-white rounded-3 border">
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
                                                <label className="switch" title="Active Status">
                                                    <input
                                                        type="checkbox"
                                                        checked={story.status !== false}
                                                        onChange={(e) => handleStoryChange(index, "status", e.target.checked)}
                                                    />
                                                    <span className="slider round"></span>
                                                </label>
                                                <button
                                                    type="button"
                                                    className="btn btn-link text-danger p-1"
                                                    title="Delete Story"
                                                    onClick={() => handleDeleteStory(index)}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="row g-3">
                                            <div className="col-md-3">
                                                <label className="form-label" style={{ fontSize: '12px', fontWeight: 600 }}>Couple Names</label>
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm"
                                                    value={story.names || ""}
                                                    onChange={(e) => handleStoryChange(index, "names", e.target.value)}
                                                    placeholder=""
                                                />
                                            </div>

                                            <div className="col-md-3">
                                                <label className="form-label" style={{ fontSize: '12px', fontWeight: 600 }}>Location</label>
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm"
                                                    value={story.location || ""}
                                                    onChange={(e) => handleStoryChange(index, "location", e.target.value)}
                                                    placeholder=""
                                                />
                                            </div>

                                            <div className="col-md-3">
                                                <label className="form-label" style={{ fontSize: '12px', fontWeight: 600 }}>Badge Label</label>
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm"
                                                    value={story.badge || ""}
                                                    onChange={(e) => handleStoryChange(index, "badge", e.target.value)}
                                                    placeholder=""
                                                />
                                            </div>

                                            <div className="col-md-3">
                                                <label className="form-label" style={{ fontSize: '12px', fontWeight: 600 }}>Display Order</label>
                                                <input
                                                    type="number"
                                                    className="form-control form-control-sm"
                                                    value={story.order ?? (index + 1)}
                                                    onChange={(e) => handleStoryChange(index, "order", parseInt(e.target.value) || 1)}
                                                />
                                            </div>

                                            <div className="col-md-6">
                                                <label className="form-label" style={{ fontSize: '12px', fontWeight: 600 }}>Ring Details / Name</label>
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm"
                                                    value={story.ringName || ""}
                                                    onChange={(e) => handleStoryChange(index, "ringName", e.target.value)}
                                                    placeholder=""
                                                />
                                            </div>

                                            <div className="col-md-6">
                                                <label className="form-label" style={{ fontSize: '12px', fontWeight: 600 }}>Story Link</label>
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm"
                                                    value={story.storyLink || ""}
                                                    onChange={(e) => handleStoryChange(index, "storyLink", e.target.value)}
                                                    placeholder=""
                                                />
                                            </div>

                                            <div className="col-12">
                                                <label className="form-label" style={{ fontSize: '12px', fontWeight: 600 }}>Proposal Story Excerpt</label>
                                                <textarea
                                                    className="form-control form-control-sm"
                                                    rows="2"
                                                    value={story.excerpt || ""}
                                                    onChange={(e) => handleStoryChange(index, "excerpt", e.target.value)}
                                                    placeholder=""
                                                />
                                            </div>

                                            <div className="col-12">
                                                <label className="form-label" style={{ fontSize: '12px', fontWeight: 600 }}>Couple Photo</label>
                                                <div className="image-upload-box">
                                                    {story.image && (
                                                        <img
                                                            src={story.image}
                                                            alt={story.names || "Couple"}
                                                            className="img-preview"
                                                        />
                                                    )}
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm flex-grow-1"
                                                        value={story.image || ""}
                                                        onChange={(e) => handleStoryChange(index, "image", e.target.value)}
                                                        placeholder=""
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
                                                    <label
                                                        className="upload-btn-label"
                                                        onClick={() => fileInputRefs.current[`story_${index}`]?.click()}
                                                    >
                                                        <CloudUploadIcon fontSize="small" /> Upload to S3
                                                    </label>
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
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <p className="text-muted mb-0" style={{ fontSize: '13px' }}>
                                    Dark luxury quotation cards with verified client badges and 5-star ratings interleaved between stories.
                                </p>
                                <button
                                    type="button"
                                    className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1"
                                    onClick={handleAddReview}
                                >
                                    <AddIcon fontSize="small" /> Add New Client Review
                                </button>
                            </div>

                            {reviews.length === 0 ? (
                                <div className="text-center py-5 text-muted bg-white rounded-3 border">
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
                                                <label className="switch" title="Active Status">
                                                    <input
                                                        type="checkbox"
                                                        checked={rev.status !== false}
                                                        onChange={(e) => handleReviewChange(index, "status", e.target.checked)}
                                                    />
                                                    <span className="slider round"></span>
                                                </label>
                                                <button
                                                    type="button"
                                                    className="btn btn-link text-danger p-1"
                                                    title="Delete Review"
                                                    onClick={() => handleDeleteReview(index)}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="row g-3">
                                            <div className="col-md-4">
                                                <label className="form-label" style={{ fontSize: '12px', fontWeight: 600 }}>Client Name</label>
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm"
                                                    value={rev.name || ""}
                                                    onChange={(e) => handleReviewChange(index, "name", e.target.value)}
                                                    placeholder=""
                                                />
                                            </div>

                                            <div className="col-md-3">
                                                <label className="form-label" style={{ fontSize: '12px', fontWeight: 600 }}>Badge</label>
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm"
                                                    value={rev.badge || ""}
                                                    onChange={(e) => handleReviewChange(index, "badge", e.target.value)}
                                                    placeholder=""
                                                />
                                            </div>

                                            <div className="col-md-2">
                                                <label className="form-label" style={{ fontSize: '12px', fontWeight: 600 }}>Rating (Stars)</label>
                                                <select
                                                    className="form-select form-select-sm"
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

                                            <div className="col-md-3">
                                                <label className="form-label" style={{ fontSize: '12px', fontWeight: 600 }}>Display Order</label>
                                                <input
                                                    type="number"
                                                    className="form-control form-control-sm"
                                                    value={rev.order ?? (index + 1)}
                                                    onChange={(e) => handleReviewChange(index, "order", parseInt(e.target.value) || 1)}
                                                />
                                            </div>

                                            <div className="col-12">
                                                <label className="form-label" style={{ fontSize: '12px', fontWeight: 600 }}>Testimonial Quote</label>
                                                <textarea
                                                    className="form-control form-control-sm"
                                                    rows="3"
                                                    value={rev.quote || ""}
                                                    onChange={(e) => handleReviewChange(index, "quote", e.target.value)}
                                                    placeholder=""
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Modals & Alerts */}
            {alertMessage && (
                <AlertMessage
                    message={alertMessage}
                    onClose={() => setAlertMessage("")}
                />
            )}
            {warningMessage && (
                <WarningModal
                    message={warningMessage}
                    onClose={() => setWarningMessage("")}
                />
            )}
        </div>
    );
};

export default CoupleSection;
