import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Middleware/Auth';
import LoadingSpinner from '../Custom/LoadingSpinner';
import WarningModal from '../Custom/WarningModal';
import AlertMessage from '../Custom/AlertMessage';
import CustomSwitch from '../Custom/CustomSwitch';
import EditButton from '../Custom/EditButton';
import DeleteButton from '../Custom/DeleteButton';
import "../../Scss/Support/PromiseSection/promisesection.scss";
import { useLanguage } from "../../Context/LanguageContext";
import CheckToken from '../../utils/CheckToken';
import HandleUnauthorized from '../../utils/HandleUnauthorized';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DiamondIcon from '@mui/icons-material/Diamond';

const PromiseSection = () => {
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

    // Section Status & Header
    const [sectionStatus, setSectionStatus] = useState(true);
    const [headerEyebrow, setHeaderEyebrow] = useState("");
    const [headerTitle, setHeaderTitle] = useState("");
    const [headerHighlightText, setHeaderHighlightText] = useState("");
    const [headerDescription, setHeaderDescription] = useState("");

    // The Vows Left Large Card
    const [vowsEyebrow, setVowsEyebrow] = useState("");
    const [vowsTitle, setVowsTitle] = useState("");
    const [vowsSubtitle, setVowsSubtitle] = useState("");
    const [vowsImage, setVowsImage] = useState("");
    const [vowsButtonText, setVowsButtonText] = useState("");
    const [vowsButtonLink, setVowsButtonLink] = useState("");

    // The Proposal Right Top Card
    const [proposalEyebrow, setProposalEyebrow] = useState("");
    const [proposalTitle, setProposalTitle] = useState("");
    const [proposalSubtitle, setProposalSubtitle] = useState("");
    const [proposalImage, setProposalImage] = useState("");
    const [proposalButtonText, setProposalButtonText] = useState("");
    const [proposalButtonLink, setProposalButtonLink] = useState("");

    // Shop By Style Dial
    const [styleSectionTitle, setStyleSectionTitle] = useState("");
    const [styles, setStyles] = useState([]);

    // Modal state for Style
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null);
    const [currentStyle, setCurrentStyle] = useState({
        styleId: "",
        name: "",
        desc: "",
        img: "",
        link: "",
        order: 1,
        status: true
    });

    const [isUploadingVows, setIsUploadingVows] = useState(false);
    const [isUploadingProposal, setIsUploadingProposal] = useState(false);
    const [isUploadingModalImg, setIsUploadingModalImg] = useState(false);

    const vowsInputRef = useRef(null);
    const proposalInputRef = useRef(null);
    const modalImgInputRef = useRef(null);

    useEffect(() => {
        document.title = "Promise & Vows Section | Gemora Diam";
    }, []);

    const fetchSectionData = async () => {
        setIsLoading(true);
        if (!CheckToken(token, logoutUser, navigate)) {
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch(`${adminPanelBackendPath}/Support/GetPromiseSection`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const result = await res.json();
            if (HandleUnauthorized(result, logoutUser, navigate)) return;

            if (res.ok && result) {
                setSectionStatus(result.status !== undefined ? result.status : true);
                setHeaderEyebrow(result.headerEyebrow || "");
                setHeaderTitle(result.headerTitle || "");
                setHeaderHighlightText(result.headerHighlightText || "");
                setHeaderDescription(result.headerDescription || "");

                setVowsEyebrow(result.vowsEyebrow || "");
                setVowsTitle(result.vowsTitle || "");
                setVowsSubtitle(result.vowsSubtitle || "");
                setVowsImage(result.vowsImage || "");
                setVowsButtonText(result.vowsButtonText || "");
                setVowsButtonLink(result.vowsButtonLink || "");

                setProposalEyebrow(result.proposalEyebrow || "");
                setProposalTitle(result.proposalTitle || "");
                setProposalSubtitle(result.proposalSubtitle || "");
                setProposalImage(result.proposalImage || "");
                setProposalButtonText(result.proposalButtonText || "");
                setProposalButtonLink(result.proposalButtonLink || "");

                setStyleSectionTitle(result.styleSectionTitle || "");
                if (Array.isArray(result.styles)) {
                    setStyles(result.styles);
                } else {
                    setStyles([]);
                }
            }
        } catch {
            setWarningMessage("Failed to connect to backend server.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSectionData();
    }, []);

    // Save All Changes
    const handleSave = async (e) => {
        if (e) e.preventDefault();
        setAlertMessage("");
        setWarningMessage("");

        if (!CheckToken(token, logoutUser, navigate)) return;

        setIsSaving(true);
        try {
            const payload = {
                status: sectionStatus,
                headerEyebrow,
                headerTitle,
                headerHighlightText,
                headerDescription,
                vowsEyebrow,
                vowsTitle,
                vowsSubtitle,
                vowsImage,
                vowsButtonText,
                vowsButtonLink,
                proposalEyebrow,
                proposalTitle,
                proposalSubtitle,
                proposalImage,
                proposalButtonText,
                proposalButtonLink,
                styleSectionTitle,
                styles
            };

            const res = await fetch(`${adminPanelBackendPath}/Support/UpdatePromiseSection`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const result = await res.json();
            if (HandleUnauthorized(result, logoutUser, navigate)) return;

            if (res.ok) {
                setAlertMessage("Promise & Vows section updated successfully!");
            } else {
                setWarningMessage(result.message || "Failed to update section.");
            }
        } catch {
            setWarningMessage("Network or server error while updating.");
        } finally {
            setIsSaving(false);
        }
    };

    // Upload Asset
    const handleUploadAsset = async (file, target) => {
        if (!file) return;
        const formData = new FormData();
        formData.append("image", file);

        try {
            if (target === 'vows') setIsUploadingVows(true);
            if (target === 'proposal') setIsUploadingProposal(true);
            if (target === 'modal') setIsUploadingModalImg(true);

            const res = await fetch(`${adminPanelBackendPath}/Support/UploadPromiseAsset`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            });
            const data = await res.json();
            if (res.ok && data.url) {
                if (target === 'vows') setVowsImage(data.url);
                if (target === 'proposal') setProposalImage(data.url);
                if (target === 'modal') setCurrentStyle(prev => ({ ...prev, img: data.url }));
            } else {
                alert(data.message || "Upload failed");
            }
        } catch {
            alert("Upload failed due to connection error");
        } finally {
            if (target === 'vows') setIsUploadingVows(false);
            if (target === 'proposal') setIsUploadingProposal(false);
            if (target === 'modal') setIsUploadingModalImg(false);
        }
    };

    // Style Handlers
    const handleOpenAddModal = () => {
        setEditingIndex(null);
        setCurrentStyle({
            styleId: `style-${Date.now()}`,
            name: "",
            desc: "",
            img: "",
            link: "",
            order: styles.length + 1,
            status: true
        });
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (idx) => {
        setEditingIndex(idx);
        setCurrentStyle({ ...styles[idx] });
        setIsModalOpen(true);
    };

    const handleSaveStyleModal = (e) => {
        e.preventDefault();
        if (!currentStyle.name.trim()) {
            alert("Style name is required");
            return;
        }

        const toSave = {
            ...currentStyle,
            styleId: currentStyle.styleId || currentStyle.name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
            order: parseInt(currentStyle.order) || 1
        };

        if (editingIndex !== null) {
            const updated = [...styles];
            updated[editingIndex] = toSave;
            setStyles(updated);
        } else {
            setStyles([...styles, toSave]);
        }

        setIsModalOpen(false);
    };

    const handleDeleteStyle = (idx) => {
        if (window.confirm("Are you sure you want to delete this style?")) {
            setStyles(styles.filter((_, i) => i !== idx));
        }
    };

    const handleToggleStyleStatus = (idx) => {
        const updated = [...styles];
        updated[idx] = { ...updated[idx], status: !updated[idx].status };
        setStyles(updated);
    };

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return (
        <div className={`PromiseSection-container ${isRtl ? 'rtl-promisesection' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="promisesection-container">
                <h6 className="promisesection-headingname">
                    The Promise & The Vow Section ("Two rings. One forever.")
                </h6>

                <div className="promisesection-form-container">
                    {alertMessage && <AlertMessage message={alertMessage} onClose={() => setAlertMessage("")} />}
                    {warningMessage && <WarningModal message={warningMessage} onClose={() => setWarningMessage("")} />}

                    <form onSubmit={handleSave}>
                        {/* Top bar controls */}
                        <div className="top-actions-bar">
                            <div className="section-toggle-wrap">
                                <span className="toggle-label">Section Visibility:</span>
                                <CustomSwitch
                                    checked={sectionStatus}
                                    onChange={() => setSectionStatus(!sectionStatus)}
                                />
                                <span className={`status-badge ${sectionStatus ? 'active' : 'inactive'}`}>
                                    {sectionStatus ? 'Active on Homepage' : 'Hidden'}
                                </span>
                            </div>

                            <div className="top-action-btns">
                                <button type="button" className="cancel-btn" onClick={() => navigate('/Home/Dashboard')}>
                                    Cancel
                                </button>
                                <button type="submit" className="save-btn" disabled={isSaving}>
                                    <SaveIcon fontSize="small" />
                                    {isSaving ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </div>

                        {/* SECTION 1: HEADER */}
                        <div className="form-section-divider">
                            <div className="form-section-title-wrap">
                                <h4 className="form-section-title">
                                    <DiamondIcon fontSize="small" /> 1. Main Section Heading
                                </h4>
                            </div>
                            <span className="form-section-subtitle">
                                Customize the top heading text displayed above the dual collection cards.
                            </span>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Header Eyebrow</label>
                                <input
                                    type="text"
                                    value={headerEyebrow}
                                    onChange={(e) => setHeaderEyebrow(e.target.value)}
                                    placeholder="e.g. The Promise & The Vow"
                                />
                            </div>
                            <div className="form-group">
                                <label>Header Title</label>
                                <input
                                    type="text"
                                    value={headerTitle}
                                    onChange={(e) => setHeaderTitle(e.target.value)}
                                    placeholder="e.g. Two rings. One forever."
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Highlighted Accent Word (Rendered in Italic Gold)</label>
                                <input
                                    type="text"
                                    value={headerHighlightText}
                                    onChange={(e) => setHeaderHighlightText(e.target.value)}
                                    placeholder="e.g. One"
                                />
                            </div>
                            <div className="form-group">
                                <label>Header Description</label>
                                <input
                                    type="text"
                                    value={headerDescription}
                                    onChange={(e) => setHeaderDescription(e.target.value)}
                                    placeholder="From the moment you ask to the day you say 'I do'..."
                                />
                            </div>
                        </div>

                        {/* SECTION 2: LEFT CARD - WEDDING BANDS */}
                        <div className="form-section-divider">
                            <div className="form-section-title-wrap">
                                <h4 className="form-section-title">
                                    <DiamondIcon fontSize="small" /> 2. The Vows (Left Large Card: Wedding Bands)
                                </h4>
                            </div>
                            <span className="form-section-subtitle">
                                The high-impact editorial portrait card representing Wedding Bands.
                            </span>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Card Eyebrow</label>
                                <input
                                    type="text"
                                    value={vowsEyebrow}
                                    onChange={(e) => setVowsEyebrow(e.target.value)}
                                    placeholder="e.g. The Vows"
                                />
                            </div>
                            <div className="form-group">
                                <label>Card Main Title</label>
                                <input
                                    type="text"
                                    value={vowsTitle}
                                    onChange={(e) => setVowsTitle(e.target.value)}
                                    placeholder="e.g. Wedding Bands"
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Card Italic Subtitle</label>
                                <input
                                    type="text"
                                    value={vowsSubtitle}
                                    onChange={(e) => setVowsSubtitle(e.target.value)}
                                    placeholder="e.g. The bands that seal the answer"
                                />
                            </div>
                            <div className="form-group">
                                <label>Button Text</label>
                                <input
                                    type="text"
                                    value={vowsButtonText}
                                    onChange={(e) => setVowsButtonText(e.target.value)}
                                    placeholder="e.g. Shop Now"
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Button Link URL</label>
                                <input
                                    type="text"
                                    value={vowsButtonLink}
                                    onChange={(e) => setVowsButtonLink(e.target.value)}
                                    placeholder="/collections?category=Wedding+Bands"
                                />
                            </div>
                            <div className="form-group">
                                <label>Background Image URL / S3 Upload</label>
                                <div className="image-upload-wrapper">
                                    <div className="upload-input-group">
                                        <input
                                            type="text"
                                            value={vowsImage}
                                            onChange={(e) => setVowsImage(e.target.value)}
                                            placeholder="Paste image URL or upload"
                                        />
                                        <input
                                            type="file"
                                            ref={vowsInputRef}
                                            style={{ display: "none" }}
                                            accept="image/*"
                                            onChange={(e) => handleUploadAsset(e.target.files[0], 'vows')}
                                        />
                                        <button
                                            type="button"
                                            className="upload-btn"
                                            onClick={() => vowsInputRef.current?.click()}
                                            disabled={isUploadingVows}
                                        >
                                            <CloudUploadIcon fontSize="small" />
                                            {isUploadingVows ? "Uploading..." : "Upload Image"}
                                        </button>
                                    </div>
                                    <div className="image-preview-box">
                                        {vowsImage ? (
                                            <img src={vowsImage} alt="Wedding Bands Preview" />
                                        ) : (
                                            <span className="empty-preview">No image selected</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SECTION 3: RIGHT TOP CARD - ENGAGEMENT RINGS */}
                        <div className="form-section-divider">
                            <div className="form-section-title-wrap">
                                <h4 className="form-section-title">
                                    <DiamondIcon fontSize="small" /> 3. The Proposal (Right Top Card: Engagement Rings)
                                </h4>
                            </div>
                            <span className="form-section-subtitle">
                                The landscape card representing Engagement Rings.
                            </span>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Card Eyebrow</label>
                                <input
                                    type="text"
                                    value={proposalEyebrow}
                                    onChange={(e) => setProposalEyebrow(e.target.value)}
                                    placeholder="e.g. The Proposal"
                                />
                            </div>
                            <div className="form-group">
                                <label>Card Main Title</label>
                                <input
                                    type="text"
                                    value={proposalTitle}
                                    onChange={(e) => setProposalTitle(e.target.value)}
                                    placeholder="e.g. Engagement Rings"
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Card Italic Subtitle</label>
                                <input
                                    type="text"
                                    value={proposalSubtitle}
                                    onChange={(e) => setProposalSubtitle(e.target.value)}
                                    placeholder="e.g. The ring that asks the question"
                                />
                            </div>
                            <div className="form-group">
                                <label>Button Text</label>
                                <input
                                    type="text"
                                    value={proposalButtonText}
                                    onChange={(e) => setProposalButtonText(e.target.value)}
                                    placeholder="e.g. Shop Now"
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Button Link URL</label>
                                <input
                                    type="text"
                                    value={proposalButtonLink}
                                    onChange={(e) => setProposalButtonLink(e.target.value)}
                                    placeholder="/collections?category=Engagement+Rings"
                                />
                            </div>
                            <div className="form-group">
                                <label>Background Image URL / S3 Upload</label>
                                <div className="image-upload-wrapper">
                                    <div className="upload-input-group">
                                        <input
                                            type="text"
                                            value={proposalImage}
                                            onChange={(e) => setProposalImage(e.target.value)}
                                            placeholder="Paste image URL or upload"
                                        />
                                        <input
                                            type="file"
                                            ref={proposalInputRef}
                                            style={{ display: "none" }}
                                            accept="image/*"
                                            onChange={(e) => handleUploadAsset(e.target.files[0], 'proposal')}
                                        />
                                        <button
                                            type="button"
                                            className="upload-btn"
                                            onClick={() => proposalInputRef.current?.click()}
                                            disabled={isUploadingProposal}
                                        >
                                            <CloudUploadIcon fontSize="small" />
                                            {isUploadingProposal ? "Uploading..." : "Upload Image"}
                                        </button>
                                    </div>
                                    <div className="image-preview-box">
                                        {proposalImage ? (
                                            <img src={proposalImage} alt="Engagement Rings Preview" />
                                        ) : (
                                            <span className="empty-preview">No image selected</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SECTION 4: SHOP BY STYLE */}
                        <div className="form-section-divider">
                            <div className="form-section-title-wrap">
                                <h4 className="form-section-title">
                                    <DiamondIcon fontSize="small" /> 4. Shop By Style Dial & Styles
                                </h4>
                                <button type="button" className="add-new-btn" onClick={handleOpenAddModal}>
                                    <AddIcon fontSize="small" /> Add Style
                                </button>
                            </div>
                            <span className="form-section-subtitle">
                                Manage the interactive style selector circular avatars and descriptions (Solitaire, Halo, Pavé, etc.).
                            </span>
                        </div>

                        <div className="form-row full-width">
                            <div className="form-group">
                                <label>Section Subtitle Label</label>
                                <input
                                    type="text"
                                    value={styleSectionTitle}
                                    onChange={(e) => setStyleSectionTitle(e.target.value)}
                                    placeholder="e.g. SHOP BY STYLE"
                                />
                            </div>
                        </div>

                        {/* Styles Table */}
                        <div className="table-wrapper">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th style={{ width: "65px", textAlign: "center" }}>Thumb</th>
                                        <th style={{ minWidth: "120px", textAlign: "left" }}>Style Name</th>
                                        <th style={{ minWidth: "260px", maxWidth: "340px", textAlign: "left" }}>Description</th>
                                        <th style={{ minWidth: "190px", maxWidth: "240px", textAlign: "left" }}>Link URL</th>
                                        <th style={{ width: "70px", textAlign: "center" }}>Order</th>
                                        <th style={{ width: "90px", textAlign: "center" }}>Status</th>
                                        <th style={{ width: "100px", textAlign: "center" }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {styles.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" style={{ textAlign: "center", padding: "28px", color: "#9ca3af" }}>
                                                No styles added yet. Click "+ Add Style" to create one.
                                            </td>
                                        </tr>
                                    ) : (
                                        styles.map((style, idx) => (
                                            <tr key={style.styleId || idx}>
                                                <td style={{ textAlign: "center" }}>
                                                    {style.img ? (
                                                        <img
                                                            src={style.img}
                                                            alt={style.name || "Style preview"}
                                                            className="style-thumb"
                                                        />
                                                    ) : (
                                                        <div className="style-thumb empty-thumb">
                                                            <DiamondIcon fontSize="small" />
                                                        </div>
                                                    )}
                                                </td>
                                                <td style={{ textAlign: "left", fontWeight: 600 }}>
                                                    {style.name}
                                                    {style.styleId && (
                                                        <div style={{ fontSize: "11px", color: "var(--muted-text, #6b7280)", fontWeight: 400 }}>
                                                            ID: {style.styleId}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="desc-cell" style={{ textAlign: "left" }}>
                                                    {style.desc || "—"}
                                                </td>
                                                <td className="link-cell" style={{ textAlign: "left" }}>
                                                    <a
                                                        href={style.link || "#"}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="style-link-anchor"
                                                        title={style.link}
                                                    >
                                                        {style.link || "—"}
                                                    </a>
                                                </td>
                                                <td style={{ textAlign: "center", fontWeight: 600 }}>
                                                    #{style.order || idx + 1}
                                                </td>
                                                <td style={{ textAlign: "center" }}>
                                                    <CustomSwitch
                                                        checked={style.status !== false}
                                                        onChange={() => handleToggleStyleStatus(idx)}
                                                    />
                                                </td>
                                                <td style={{ textAlign: "center" }}>
                                                    <div className="actions-cell">
                                                        <EditButton onClick={() => handleOpenEditModal(idx)} />
                                                        <DeleteButton onClick={() => handleDeleteStyle(idx)} />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Bottom Actions */}
                        <div className="bottom-action-bar">
                            <button type="button" className="cancel-btn" onClick={() => navigate('/Home/Dashboard')}>
                                Cancel
                            </button>
                            <button type="submit" className="save-btn" disabled={isSaving}>
                                <SaveIcon fontSize="small" />
                                {isSaving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Modal for Add / Edit Style */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-card">
                        <div className="modal-header">
                            <h5>{editingIndex !== null ? "Edit Ring Style" : "Add New Ring Style"}</h5>
                            <button type="button" className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>
                        </div>
                        <form onSubmit={handleSaveStyleModal}>
                            <div className="modal-body">
                                <div className="form-group" style={{ marginBottom: "14px" }}>
                                    <label>Style Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={currentStyle.name}
                                        onChange={(e) => setCurrentStyle({ ...currentStyle, name: e.target.value })}
                                        placeholder="e.g. Solitaire, Halo, Pavé"
                                    />
                                </div>

                                <div className="form-group" style={{ marginBottom: "14px" }}>
                                    <label>Short Description *</label>
                                    <textarea
                                        rows="2"
                                        value={currentStyle.desc}
                                        onChange={(e) => setCurrentStyle({ ...currentStyle, desc: e.target.value })}
                                        placeholder="e.g. The timeless purity of a single certified diamond"
                                    />
                                </div>

                                <div className="form-group" style={{ marginBottom: "14px" }}>
                                    <label>Destination Link URL</label>
                                    <input
                                        type="text"
                                        value={currentStyle.link}
                                        onChange={(e) => setCurrentStyle({ ...currentStyle, link: e.target.value })}
                                        placeholder="/collections?style=Solitaire"
                                    />
                                </div>

                                <div className="form-group" style={{ marginBottom: "14px" }}>
                                    <label>Display Order</label>
                                    <input
                                        type="number"
                                        value={currentStyle.order}
                                        onChange={(e) => setCurrentStyle({ ...currentStyle, order: e.target.value })}
                                    />
                                </div>

                                <div className="form-group" style={{ marginBottom: "14px" }}>
                                    <label>Avatar / Thumbnail Image</label>
                                    <div className="image-upload-wrapper">
                                        <div className="upload-input-group">
                                            <input
                                                type="text"
                                                value={currentStyle.img}
                                                onChange={(e) => setCurrentStyle({ ...currentStyle, img: e.target.value })}
                                                placeholder="Paste image URL or upload"
                                            />
                                            <input
                                                type="file"
                                                ref={modalImgInputRef}
                                                style={{ display: "none" }}
                                                accept="image/*"
                                                onChange={(e) => handleUploadAsset(e.target.files[0], 'modal')}
                                            />
                                            <button
                                                type="button"
                                                className="upload-btn"
                                                onClick={() => modalImgInputRef.current?.click()}
                                                disabled={isUploadingModalImg}
                                            >
                                                <CloudUploadIcon fontSize="small" />
                                                {isUploadingModalImg ? "Uploading..." : "Upload"}
                                            </button>
                                        </div>
                                        <div className="image-preview-box" style={{ maxWidth: "120px", height: "120px", borderRadius: "50%" }}>
                                            {currentStyle.img ? (
                                                <img src={currentStyle.img} alt="Style Avatar Preview" />
                                            ) : (
                                                <span className="empty-preview">No Avatar</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="form-group" style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "14px" }}>
                                    <CustomSwitch
                                        checked={currentStyle.status !== false}
                                        onChange={() => setCurrentStyle({ ...currentStyle, status: !currentStyle.status })}
                                    />
                                    <label style={{ margin: 0 }}>Active on Website</label>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="cancel-btn" onClick={() => setIsModalOpen(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="save-btn">
                                    {editingIndex !== null ? "Update Style" : "Add Style"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PromiseSection;
