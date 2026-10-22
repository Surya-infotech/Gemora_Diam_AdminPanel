import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Middleware/Auth';
import LoadingSpinner from '../Custom/LoadingSpinner';
import WarningModal from '../Custom/WarningModal';
import AlertMessage from '../Custom/AlertMessage';
import CustomSwitch from '../Custom/CustomSwitch';
import EditButton from '../Custom/EditButton';
import DeleteButton from '../Custom/DeleteButton';
import "../../Scss/Support/ShapeSection/shapesection.scss";
import { useLanguage } from "../../Context/LanguageContext";
import CheckToken from '../../utils/CheckToken';
import HandleUnauthorized from '../../utils/HandleUnauthorized';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const ShapeSection = () => {
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
    const [headerDescription, setHeaderDescription] = useState("");

    // Design Your Ring Left Card
    const [designEyebrow, setDesignEyebrow] = useState("");
    const [designTitle, setDesignTitle] = useState("");
    const [designDescription, setDesignDescription] = useState("");
    const [primaryBtnText, setPrimaryBtnText] = useState("");
    const [primaryBtnLink, setPrimaryBtnLink] = useState("");
    const [secondaryBtnText, setSecondaryBtnText] = useState("");
    const [secondaryBtnLink, setSecondaryBtnLink] = useState("");

    // 3 Steps
    const [step1Num, setStep1Num] = useState("");
    const [step1Title, setStep1Title] = useState("");
    const [step1Desc, setStep1Desc] = useState("");

    const [step2Num, setStep2Num] = useState("");
    const [step2Title, setStep2Title] = useState("");
    const [step2Desc, setStep2Desc] = useState("");

    const [step3Num, setStep3Num] = useState("");
    const [step3Title, setStep3Title] = useState("");
    const [step3Desc, setStep3Desc] = useState("");

    // Shapes List
    const [shapes, setShapes] = useState([]);

    // Modal State for Shape Edit / Add
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null); // null means adding new
    const [currentShape, setCurrentShape] = useState({
        shapeid: "",
        name: "",
        tagline: "",
        description: "",
        bestFor: "",
        brilliance: "",
        shapeIcon: "",
        showcaseImage: "",
        showcaseTitle: "",
        buttonLink: "",
        order: 1,
        status: true
    });
    const [isUploadingIcon, setIsUploadingIcon] = useState(false);
    const [isUploadingShowcase, setIsUploadingShowcase] = useState(false);

    const iconInputRef = useRef(null);
    const showcaseInputRef = useRef(null);

    useEffect(() => {
        document.title = `${translations.shapeSection || "Shop By Shape"} | Gemora Diam`;
    }, [translations]);

    const fetchSectionData = async () => {
        setIsLoading(true);
        if (!CheckToken(token, logoutUser, navigate)) {
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch(`${adminPanelBackendPath}/Support/GetShapeSection`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const result = await res.json();
            if (HandleUnauthorized(result, logoutUser, navigate)) return;

            if (res.ok && result) {
                setSectionStatus(result.status !== false);
                setHeaderEyebrow(result.headerEyebrow || "");
                setHeaderTitle(result.headerTitle || "");
                setHeaderDescription(result.headerDescription || "");

                setDesignEyebrow(result.designEyebrow || "");
                setDesignTitle(result.designTitle || "");
                setDesignDescription(result.designDescription || "");
                setPrimaryBtnText(result.primaryBtnText || "");
                setPrimaryBtnLink(result.primaryBtnLink || "");
                setSecondaryBtnText(result.secondaryBtnText || "");
                setSecondaryBtnLink(result.secondaryBtnLink || "");

                setStep1Num(result.step1Num || "");
                setStep1Title(result.step1Title || "");
                setStep1Desc(result.step1Desc || "");

                setStep2Num(result.step2Num || "");
                setStep2Title(result.step2Title || "");
                setStep2Desc(result.step2Desc || "");

                setStep3Num(result.step3Num || "");
                setStep3Title(result.step3Title || "");
                setStep3Desc(result.step3Desc || "");

                if (Array.isArray(result.shapes)) {
                    setShapes(result.shapes);
                }
            }
        } catch (error) {
            console.error("Error fetching shape section:", error);
            setWarningMessage("Failed to load section data from server.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSectionData();
    }, []);

    // Save all changes
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
                headerDescription,
                designEyebrow,
                designTitle,
                designDescription,
                primaryBtnText,
                primaryBtnLink,
                secondaryBtnText,
                secondaryBtnLink,
                step1Num,
                step1Title,
                step1Desc,
                step2Num,
                step2Title,
                step2Desc,
                step3Num,
                step3Title,
                step3Desc,
                shapes
            };

            const res = await fetch(`${adminPanelBackendPath}/Support/UpdateShapeSection`, {
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
                setAlertMessage("Shop By Shape section updated successfully!");
            } else {
                setWarningMessage(result.message || "Failed to update section.");
            }
        } catch (error) {
            console.error("Save error:", error);
            setWarningMessage("An unexpected error occurred while saving.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        navigate('/Home/Dashboard');
    };

    // Modal Openers
    const handleOpenAddModal = () => {
        setEditingIndex(null);
        setCurrentShape({
            shapeid: `shape-${Date.now()}`,
            name: "",
            tagline: "",
            description: "",
            bestFor: "",
            brilliance: "Very High",
            shapeIcon: "",
            showcaseImage: "",
            showcaseTitle: "",
            buttonLink: "",
            order: shapes.length + 1,
            status: true
        });
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (index) => {
        setEditingIndex(index);
        setCurrentShape({ ...shapes[index] });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingIndex(null);
    };

    const handleSaveShapeModal = (e) => {
        e.preventDefault();
        if (!currentShape.name.trim()) {
            alert("Shape name is required");
            return;
        }

        const shapeToSave = {
            ...currentShape,
            shapeid: currentShape.shapeid || currentShape.name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
            order: parseInt(currentShape.order) || 1
        };

        if (editingIndex !== null) {
            const updated = [...shapes];
            updated[editingIndex] = shapeToSave;
            setShapes(updated);
        } else {
            setShapes([...shapes, shapeToSave]);
        }

        setIsModalOpen(false);
    };

    const handleDeleteShape = (index) => {
        if (window.confirm(`Are you sure you want to delete "${shapes[index]?.name}"?`)) {
            const updated = shapes.filter((_, idx) => idx !== index);
            setShapes(updated);
        }
    };

    const handleToggleShapeStatus = (index) => {
        const updated = [...shapes];
        updated[index] = {
            ...updated[index],
            status: updated[index].status === false ? true : false
        };
        setShapes(updated);
    };

    const handleUploadAsset = async (file, type) => {
        if (!file) return;
        const formData = new FormData();
        formData.append("image", file);

        try {
            if (type === 'icon') setIsUploadingIcon(true);
            if (type === 'showcase') setIsUploadingShowcase(true);

            const res = await fetch(`${adminPanelBackendPath}/Support/UploadShapeAsset`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            });
            const data = await res.json();
            if (res.ok && data.url) {
                if (type === 'icon') {
                    setCurrentShape(prev => ({ ...prev, shapeIcon: data.url }));
                } else {
                    setCurrentShape(prev => ({ ...prev, showcaseImage: data.url }));
                }
            } else {
                alert(data.message || "Upload failed");
            }
        } catch (err) {
            console.error("Upload error:", err);
            alert("Error uploading file");
        } finally {
            if (type === 'icon') setIsUploadingIcon(false);
            if (type === 'showcase') setIsUploadingShowcase(false);
        }
    };

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return (
        <div className={`ShapeSection-container ${isRtl ? 'rtl-shapesection' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="shapesection-container">
                <h6 className="shapesection-headingname">
                    {translations.shapeSection || "Shop By Shape"}
                </h6>

                <div className="shapesection-form-container">
                    {alertMessage && <AlertMessage message={alertMessage} onClose={() => setAlertMessage("")} />}
                    {warningMessage && <WarningModal message={warningMessage} onClose={() => setWarningMessage("")} />}

                    <form onSubmit={handleSave}>
                        {/* Top bar controls */}
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
                                <button type="submit" className="btn btn-success submit-btn" disabled={isSaving}>
                                    <SaveIcon fontSize="small" />
                                    {isSaving ? (translations.saving || "Saving...") : (translations.save || "Save All Changes")}
                                </button>
                            </div>
                        </div>

                        {/* Section 1: Section Header Texts */}
                        <div className="form-section-divider">
                            <h6 className="form-section-title">1. Section Header & Intro</h6>
                            <span className="form-section-subtitle">Controls the main headline and subtitle shown at the top of the section.</span>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Eyebrow Tag</label>
                                <input
                                    type="text"
                                    value={headerEyebrow}
                                    onChange={(e) => setHeaderEyebrow(e.target.value)}
                                    placeholder="e.g. CURATED SILHOUETTES"
                                />
                            </div>
                            <div className="form-group">
                                <label>Headline Title</label>
                                <input
                                    type="text"
                                    value={headerTitle}
                                    onChange={(e) => setHeaderTitle(e.target.value)}
                                    placeholder="e.g. Shop By Shape"
                                />
                            </div>
                        </div>

                        <div className="form-row full-width">
                            <div className="form-group">
                                <label>Subtitle Description</label>
                                <textarea
                                    value={headerDescription}
                                    onChange={(e) => setHeaderDescription(e.target.value)}
                                    placeholder="e.g. Every diamond cut tells a unique story. Discover our masterfully cut shapes..."
                                />
                            </div>
                        </div>

                        {/* Section 2: "Design Your Ring" Feature Box */}
                        <div className="form-section-divider">
                            <h6 className="form-section-title">2. "Design Your Ring" Feature Box (Left Column)</h6>
                            <span className="form-section-subtitle">Configure the promotional card, buttons, and 3 workflow steps.</span>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Box Eyebrow</label>
                                <input
                                    type="text"
                                    value={designEyebrow}
                                    onChange={(e) => setDesignEyebrow(e.target.value)}
                                    placeholder="e.g. BESPOKE ATELIER"
                                />
                            </div>
                            <div className="form-group">
                                <label>Box Title</label>
                                <input
                                    type="text"
                                    value={designTitle}
                                    onChange={(e) => setDesignTitle(e.target.value)}
                                    placeholder="e.g. Design Your Ring"
                                />
                            </div>
                        </div>

                        <div className="form-row full-width">
                            <div className="form-group">
                                <label>Box Description</label>
                                <textarea
                                    value={designDescription}
                                    onChange={(e) => setDesignDescription(e.target.value)}
                                    placeholder="Bring your dream ring to life in three intuitive steps..."
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Primary Button Label</label>
                                <input
                                    type="text"
                                    value={primaryBtnText}
                                    onChange={(e) => setPrimaryBtnText(e.target.value)}
                                    placeholder="e.g. Start with a Diamond"
                                />
                            </div>
                            <div className="form-group">
                                <label>Primary Button Link</label>
                                <input
                                    type="text"
                                    value={primaryBtnLink}
                                    onChange={(e) => setPrimaryBtnLink(e.target.value)}
                                    placeholder="e.g. /custom/diamonds"
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Secondary Button Label</label>
                                <input
                                    type="text"
                                    value={secondaryBtnText}
                                    onChange={(e) => setSecondaryBtnText(e.target.value)}
                                    placeholder="e.g. Start with a Setting"
                                />
                            </div>
                            <div className="form-group">
                                <label>Secondary Button Link</label>
                                <input
                                    type="text"
                                    value={secondaryBtnLink}
                                    onChange={(e) => setSecondaryBtnLink(e.target.value)}
                                    placeholder="e.g. /custom/settings"
                                />
                            </div>
                        </div>

                        {/* Workflow Steps */}
                        <div className="form-section-divider">
                            <h6 className="form-section-title">Workflow Steps (Cards 01, 02, 03)</h6>
                        </div>

                        <div className="steps-grid">
                            <div className="step-card-box">
                                <span className="step-number-tag">Step 1</span>
                                <div className="form-group">
                                    <label>Number Label</label>
                                    <input type="text" value={step1Num} onChange={(e) => setStep1Num(e.target.value)} placeholder="01" />
                                </div>
                                <div className="form-group">
                                    <label>Step Title</label>
                                    <input type="text" value={step1Title} onChange={(e) => setStep1Title(e.target.value)} placeholder="Choose Diamond" />
                                </div>
                                <div className="form-group">
                                    <label>Step Summary</label>
                                    <textarea value={step1Desc} onChange={(e) => setStep1Desc(e.target.value)} placeholder="Filter certified diamonds..." />
                                </div>
                            </div>

                            <div className="step-card-box">
                                <span className="step-number-tag">Step 2</span>
                                <div className="form-group">
                                    <label>Number Label</label>
                                    <input type="text" value={step2Num} onChange={(e) => setStep2Num(e.target.value)} placeholder="02" />
                                </div>
                                <div className="form-group">
                                    <label>Step Title</label>
                                    <input type="text" value={step2Title} onChange={(e) => setStep2Title(e.target.value)} placeholder="Select Setting" />
                                </div>
                                <div className="form-group">
                                    <label>Step Summary</label>
                                    <textarea value={step2Desc} onChange={(e) => setStep2Desc(e.target.value)} placeholder="Match with handcrafted settings..." />
                                </div>
                            </div>

                            <div className="step-card-box">
                                <span className="step-number-tag">Step 3</span>
                                <div className="form-group">
                                    <label>Number Label</label>
                                    <input type="text" value={step3Num} onChange={(e) => setStep3Num(e.target.value)} placeholder="03" />
                                </div>
                                <div className="form-group">
                                    <label>Step Title</label>
                                    <input type="text" value={step3Title} onChange={(e) => setStep3Title(e.target.value)} placeholder="Complete Ring" />
                                </div>
                                <div className="form-group">
                                    <label>Step Summary</label>
                                    <textarea value={step3Desc} onChange={(e) => setStep3Desc(e.target.value)} placeholder="Select finger size, engraving..." />
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Diamond Shapes Management */}
                        <div className="form-section-divider">
                            <div className="form-section-title-wrap">
                                <div>
                                    <h6 className="form-section-title">3. Diamond Shapes & Dial Showcase ({shapes.length} Shapes)</h6>
                                    <span className="form-section-subtitle">Manage each diamond shape on the rotating dial, specs, and right showcase card.</span>
                                </div>
                                <button type="button" className="add-new-btn" onClick={handleOpenAddModal}>
                                    <AddIcon fontSize="small" /> Add New Shape
                                </button>
                            </div>
                        </div>

                        <div className="table-wrapper">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Icon</th>
                                        <th>Shape Name</th>
                                        <th>Best For</th>
                                        <th>Brilliance</th>
                                        <th>Showcase Photo</th>
                                        <th>Showcase Title</th>
                                        <th>Status</th>
                                        <th style={{ textAlign: 'center' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {shapes.length === 0 ? (
                                        <tr>
                                            <td colSpan="9" style={{ textAlign: 'center', padding: '24px 0' }}>
                                                {translations.nodatafound || "No shapes found."}
                                            </td>
                                        </tr>
                                    ) : (
                                        shapes.map((s, idx) => (
                                            <tr key={s.shapeid || idx}>
                                                <td><strong>#{s.order || idx + 1}</strong></td>
                                                <td>
                                                    {s.shapeIcon ? (
                                                        <img
                                                            src={s.shapeIcon}
                                                            alt={s.name}
                                                            className="shape-icon-thumb"
                                                            onError={(e) => (e.currentTarget.style.display = 'none')}
                                                        />
                                                    ) : (
                                                        <span className="text-muted">—</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <strong>{s.name}</strong>
                                                    {s.shapeid && <div style={{ fontSize: '11px', color: 'var(--muted-text)' }}>ID: {s.shapeid}</div>}
                                                </td>
                                                <td>{s.bestFor || "—"}</td>
                                                <td>{s.brilliance || "—"}</td>
                                                <td>
                                                    {s.showcaseImage ? (
                                                        <img
                                                            src={s.showcaseImage}
                                                            alt={s.showcaseTitle}
                                                            className="showcase-thumb"
                                                            onError={(e) => (e.currentTarget.style.display = 'none')}
                                                        />
                                                    ) : (
                                                        <span className="text-muted">—</span>
                                                    )}
                                                </td>
                                                <td style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {s.showcaseTitle || "—"}
                                                </td>
                                                <td>
                                                    <CustomSwitch
                                                        checked={s.status !== false}
                                                        onChange={() => handleToggleShapeStatus(idx)}
                                                    />
                                                </td>
                                                <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                                                    <EditButton onClick={() => handleOpenEditModal(idx)} />
                                                    <DeleteButton onClick={() => handleDeleteShape(idx)} />
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

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
                                type="submit"
                                className="btn btn-success submit-btn"
                                disabled={isSaving}
                            >
                                {isSaving ? (translations.saving || "Saving...") : (translations.save || "Save All Changes")}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Modal for Shape Add/Edit */}
            {isModalOpen && (
                <div className="modal-backdrop-custom" onClick={handleCloseModal}>
                    <div className="shape-modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header-custom">
                            <h5>{editingIndex !== null ? `Edit "${currentShape.name}" Shape` : "Add New Diamond Shape"}</h5>
                            <button type="button" className="close-btn" onClick={handleCloseModal}>×</button>
                        </div>
                        <form onSubmit={handleSaveShapeModal}>
                            <div className="modal-body-custom">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Shape Name *</label>
                                        <input
                                            type="text"
                                            value={currentShape.name}
                                            onChange={(e) => setCurrentShape({ ...currentShape, name: e.target.value })}
                                            placeholder="e.g. Round Brilliant"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Shape ID / Slug</label>
                                        <input
                                            type="text"
                                            value={currentShape.shapeid}
                                            onChange={(e) => setCurrentShape({ ...currentShape, shapeid: e.target.value })}
                                            placeholder="e.g. round"
                                        />
                                    </div>
                                </div>

                                <div className="form-row full-width">
                                    <div className="form-group">
                                        <label>Tagline (Italic under shape title)</label>
                                        <input
                                            type="text"
                                            value={currentShape.tagline}
                                            onChange={(e) => setCurrentShape({ ...currentShape, tagline: e.target.value })}
                                            placeholder="e.g. Timeless & Iconic"
                                        />
                                    </div>
                                </div>

                                <div className="form-row full-width">
                                    <div className="form-group">
                                        <label>Description</label>
                                        <textarea
                                            value={currentShape.description}
                                            onChange={(e) => setCurrentShape({ ...currentShape, description: e.target.value })}
                                            placeholder="Detailed description of this cut..."
                                            rows="2"
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Best For (Specification)</label>
                                        <input
                                            type="text"
                                            value={currentShape.bestFor}
                                            onChange={(e) => setCurrentShape({ ...currentShape, bestFor: e.target.value })}
                                            placeholder="e.g. Maximum Fire & Sparkle"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Brilliance Rating</label>
                                        <select
                                            value={currentShape.brilliance}
                                            onChange={(e) => setCurrentShape({ ...currentShape, brilliance: e.target.value })}
                                        >
                                            <option value="">Select Brilliance</option>
                                            <option value="Very High">Very High (5 / 5)</option>
                                            <option value="High">High (4 / 5)</option>
                                            <option value="Medium">Medium (3 / 5)</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Shape Cut Icon Upload / Link */}
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Shape Cut Icon (PNG with transparent bg)</label>
                                        <div className="upload-input-wrap">
                                            <input
                                                type="text"
                                                value={currentShape.shapeIcon}
                                                onChange={(e) => setCurrentShape({ ...currentShape, shapeIcon: e.target.value })}
                                                placeholder="Icon URL or upload"
                                            />
                                            <input
                                                type="file"
                                                ref={iconInputRef}
                                                accept="image/*"
                                                style={{ display: 'none' }}
                                                onChange={(e) => handleUploadAsset(e.target.files[0], 'icon')}
                                            />
                                            <button
                                                type="button"
                                                className="upload-btn"
                                                onClick={() => iconInputRef.current?.click()}
                                                disabled={isUploadingIcon}
                                            >
                                                <CloudUploadIcon fontSize="small" /> Upload
                                            </button>
                                        </div>
                                        {currentShape.shapeIcon && (
                                            <div className="preview-thumb-box">
                                                <img
                                                    src={currentShape.shapeIcon}
                                                    alt="Icon Preview"
                                                    style={{ width: '40px', height: '40px', objectFit: 'contain', background: '#f5f5f5', borderRadius: '4px', padding: '2px', border: '1px solid var(--border-color)' }}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Showcase Ring Image Upload / Link */}
                                    <div className="form-group">
                                        <label>Showcase Image (Model hand ring photo)</label>
                                        <div className="upload-input-wrap">
                                            <input
                                                type="text"
                                                value={currentShape.showcaseImage}
                                                onChange={(e) => setCurrentShape({ ...currentShape, showcaseImage: e.target.value })}
                                                placeholder="Image URL or upload"
                                            />
                                            <input
                                                type="file"
                                                ref={showcaseInputRef}
                                                accept="image/*"
                                                style={{ display: 'none' }}
                                                onChange={(e) => handleUploadAsset(e.target.files[0], 'showcase')}
                                            />
                                            <button
                                                type="button"
                                                className="upload-btn"
                                                onClick={() => showcaseInputRef.current?.click()}
                                                disabled={isUploadingShowcase}
                                            >
                                                <CloudUploadIcon fontSize="small" /> Upload
                                            </button>
                                        </div>
                                        {currentShape.showcaseImage && (
                                            <div className="preview-thumb-box">
                                                <img
                                                    src={currentShape.showcaseImage}
                                                    alt="Showcase Preview"
                                                    style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Showcase Card Title</label>
                                        <input
                                            type="text"
                                            value={currentShape.showcaseTitle}
                                            onChange={(e) => setCurrentShape({ ...currentShape, showcaseTitle: e.target.value })}
                                            placeholder="e.g. Classic Round Brilliant Solitaire"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Shop Button Link</label>
                                        <input
                                            type="text"
                                            value={currentShape.buttonLink}
                                            onChange={(e) => setCurrentShape({ ...currentShape, buttonLink: e.target.value })}
                                            placeholder="e.g. /collections/round-cut-rings"
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Display Order</label>
                                        <input
                                            type="number"
                                            value={currentShape.order}
                                            onChange={(e) => setCurrentShape({ ...currentShape, order: e.target.value })}
                                            min="1"
                                        />
                                    </div>
                                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                        <label>Dial Visibility Status</label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '6px' }}>
                                            <CustomSwitch
                                                checked={currentShape.status !== false}
                                                onChange={(e) => setCurrentShape({ ...currentShape, status: e.target.checked })}
                                            />
                                            <span style={{ fontSize: '13px', fontWeight: 600, color: currentShape.status !== false ? 'var(--primary-color)' : '#dc2626' }}>
                                                {currentShape.status !== false ? "Active on Dial" : "Disabled on Dial"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer-custom">
                                <button type="button" className="btn btn-secondary cancelbtn" onClick={handleCloseModal}>
                                    {translations.cancel || "Cancel"}
                                </button>
                                <button type="submit" className="btn btn-success submit-btn">
                                    {editingIndex !== null ? "Update Shape" : "Add Shape"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShapeSection;