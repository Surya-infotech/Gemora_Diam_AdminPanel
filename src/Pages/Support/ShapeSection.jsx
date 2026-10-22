import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Middleware/Auth';
import LoadingSpinner from '../Custom/LoadingSpinner';
import WarningModal from '../Custom/WarningModal';
import AlertMessage from '../Custom/AlertMessage';
import "../../Scss/Support/ShapeSection/shapesection.scss";
import { useLanguage } from "../../Context/LanguageContext";
import CheckToken from '../../utils/CheckToken';
import HandleUnauthorized from '../../utils/HandleUnauthorized';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
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
        document.title = "Shop By Shape Section | Gemora Diam Admin";
    }, []);

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
        if (!CheckToken(token, logoutUser, navigate)) return;

        setIsSaving(true);
        setAlertMessage("");
        setWarningMessage("");

        const payload = {
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
            shapes,
            status: sectionStatus
        };

        try {
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
                setAlertMessage("Shop by shape section updated successfully!");
                if (result.shapeSection?.shapes) {
                    setShapes(result.shapeSection.shapes);
                }
            } else {
                setWarningMessage(result.message || "Failed to update shape section.");
            }
        } catch (err) {
            console.error("Error updating shape section:", err);
            setWarningMessage("Network error saving shape section.");
        } finally {
            setIsSaving(false);
        }
    };

    // Open Modal for Add
    const handleOpenAddModal = () => {
        setEditingIndex(null);
        setCurrentShape({
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
            order: shapes.length + 1,
            status: true
        });
        setIsModalOpen(true);
    };

    // Open Modal for Edit
    const handleOpenEditModal = (idx) => {
        setEditingIndex(idx);
        setCurrentShape({ ...shapes[idx] });
        setIsModalOpen(true);
    };

    // Close Modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingIndex(null);
    };

    // Save Shape from Modal
    const handleSaveShapeModal = (e) => {
        e.preventDefault();
        if (!currentShape.name.trim()) {
            alert("Shape name is required!");
            return;
        }

        const normalizedShape = {
            ...currentShape,
            shapeid: currentShape.shapeid.trim() || currentShape.name.toLowerCase().replace(/\s+/g, '-'),
            name: currentShape.name.trim(),
            order: Number(currentShape.order) || 1
        };

        if (editingIndex !== null) {
            // Update existing
            const updated = [...shapes];
            updated[editingIndex] = normalizedShape;
            setShapes(updated);
        } else {
            // Add new
            setShapes([...shapes, normalizedShape]);
        }
        setIsModalOpen(false);
    };

    // Delete Shape
    const handleDeleteShape = (idx) => {
        if (window.confirm(`Are you sure you want to remove "${shapes[idx]?.name}" shape?`)) {
            setShapes(shapes.filter((_, i) => i !== idx));
        }
    };

    // Toggle Shape Status
    const handleToggleShapeStatus = (idx) => {
        const updated = [...shapes];
        updated[idx] = { ...updated[idx], status: !updated[idx].status };
        setShapes(updated);
    };

    // Upload asset
    const handleUploadAsset = async (file, type) => {
        if (!file) return;
        const formData = new FormData();
        formData.append("image", file);

        if (type === 'icon') setIsUploadingIcon(true);
        if (type === 'showcase') setIsUploadingShowcase(true);

        try {
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
                    <AutoAwesomeIcon style={{ marginRight: '8px', verticalAlign: 'middle', color: 'var(--primary-color)' }} />
                    {translations.shapeSection || "Shop By Shape Section"}
                </h6>

                <div className="shapesection-form-container">
                    {alertMessage && <AlertMessage message={alertMessage} onClose={() => setAlertMessage("")} />}
                    {warningMessage && <WarningModal message={warningMessage} onClose={() => setWarningMessage("")} />}

                    <form onSubmit={handleSave}>
                        {/* Top bar controls */}
                        <div className="top-actions-bar">
                            <div className="section-toggle-wrap">
                                <input
                                    type="checkbox"
                                    id="sectionStatusToggle"
                                    checked={sectionStatus}
                                    onChange={(e) => setSectionStatus(e.target.checked)}
                                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                />
                                <label htmlFor="sectionStatusToggle">
                                    Section Visible on Website Homepage ({sectionStatus ? "Active" : "Disabled"})
                                </label>
                            </div>
                            <div className="top-action-btns">
                                <button type="submit" className="btn-save" disabled={isSaving}>
                                    <SaveIcon fontSize="small" />
                                    {isSaving ? "Saving..." : "Save All Changes"}
                                </button>
                            </div>
                        </div>

                        {/* Card 1: Section Header Texts */}
                        <div className="form-section-card">
                            <div className="form-section-header">
                                <div>
                                    <h5 className="section-title">1. Section Header & Intro</h5>
                                    <p className="section-subtitle">Controls the main headline and subtitle shown at the top of the section.</p>
                                </div>
                            </div>
                            <div className="form-grid-2">
                                <div className="form-group">
                                    <label>Eyebrow Tag</label>
                                    <input
                                        type="text"
                                        value={headerEyebrow}
                                        onChange={(e) => setHeaderEyebrow(e.target.value)}
                                        placeholder=""
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Headline Title</label>
                                    <input
                                        type="text"
                                        value={headerTitle}
                                        onChange={(e) => setHeaderTitle(e.target.value)}
                                        placeholder=""
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Subtitle Description</label>
                                <textarea
                                    value={headerDescription}
                                    onChange={(e) => setHeaderDescription(e.target.value)}
                                    placeholder=""
                                />
                            </div>
                        </div>

                        {/* Card 2: "Design Your Ring" Left Box Content */}
                        <div className="form-section-card">
                            <div className="form-section-header">
                                <div>
                                    <h5 className="section-title">2. "Design Your Ring" Feature Box (Left Column)</h5>
                                    <p className="section-subtitle">Configure the promotional card, buttons, and 3 workflow steps.</p>
                                </div>
                            </div>
                            <div className="form-grid-2">
                                <div className="form-group">
                                    <label>Box Eyebrow</label>
                                    <input
                                        type="text"
                                        value={designEyebrow}
                                        onChange={(e) => setDesignEyebrow(e.target.value)}
                                        placeholder=""
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Box Title</label>
                                    <input
                                        type="text"
                                        value={designTitle}
                                        onChange={(e) => setDesignTitle(e.target.value)}
                                        placeholder=""
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Box Description</label>
                                <textarea
                                    value={designDescription}
                                    onChange={(e) => setDesignDescription(e.target.value)}
                                    placeholder=""
                                />
                            </div>

                            <div className="form-grid-2">
                                <div className="form-group">
                                    <label>Primary Button Label</label>
                                    <input
                                        type="text"
                                        value={primaryBtnText}
                                        onChange={(e) => setPrimaryBtnText(e.target.value)}
                                        placeholder=""
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Primary Button Link</label>
                                    <input
                                        type="text"
                                        value={primaryBtnLink}
                                        onChange={(e) => setPrimaryBtnLink(e.target.value)}
                                        placeholder=""
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Secondary Button Label</label>
                                    <input
                                        type="text"
                                        value={secondaryBtnText}
                                        onChange={(e) => setSecondaryBtnText(e.target.value)}
                                        placeholder=""
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Secondary Button Link</label>
                                    <input
                                        type="text"
                                        value={secondaryBtnLink}
                                        onChange={(e) => setSecondaryBtnLink(e.target.value)}
                                        placeholder=""
                                    />
                                </div>
                            </div>

                            <div className="form-section-header" style={{ marginTop: '20px' }}>
                                <h6 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Workflow Steps (Cards 01, 02, 03)</h6>
                            </div>
                            <div className="form-grid-3">
                                <div className="step-card-box">
                                    <span className="step-number-tag">Step 1</span>
                                    <div className="form-group">
                                        <label>Number Label</label>
                                        <input type="text" value={step1Num} onChange={(e) => setStep1Num(e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label>Step Title</label>
                                        <input type="text" value={step1Title} onChange={(e) => setStep1Title(e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label>Step Summary</label>
                                        <textarea value={step1Desc} onChange={(e) => setStep1Desc(e.target.value)} />
                                    </div>
                                </div>

                                <div className="step-card-box">
                                    <span className="step-number-tag">Step 2</span>
                                    <div className="form-group">
                                        <label>Number Label</label>
                                        <input type="text" value={step2Num} onChange={(e) => setStep2Num(e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label>Step Title</label>
                                        <input type="text" value={step2Title} onChange={(e) => setStep2Title(e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label>Step Summary</label>
                                        <textarea value={step2Desc} onChange={(e) => setStep2Desc(e.target.value)} />
                                    </div>
                                </div>

                                <div className="step-card-box">
                                    <span className="step-number-tag">Step 3</span>
                                    <div className="form-group">
                                        <label>Number Label</label>
                                        <input type="text" value={step3Num} onChange={(e) => setStep3Num(e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label>Step Title</label>
                                        <input type="text" value={step3Title} onChange={(e) => setStep3Title(e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label>Step Summary</label>
                                        <textarea value={step3Desc} onChange={(e) => setStep3Desc(e.target.value)} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Card 3: Diamond Shapes Management */}
                        <div className="form-section-card">
                            <div className="form-section-header">
                                <div>
                                    <h5 className="section-title">3. Diamond Shapes & Dial Showcase ({shapes.length} Shapes)</h5>
                                    <p className="section-subtitle">Manage each diamond shape on the rotating dial, specs, and right showcase card.</p>
                                </div>
                                <button type="button" className="btn-save" onClick={handleOpenAddModal} style={{ padding: '8px 16px', fontSize: '13px' }}>
                                    <AddIcon fontSize="small" />
                                    Add New Shape
                                </button>
                            </div>

                            <div className="shapes-table-wrap">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Order</th>
                                            <th>Icon</th>
                                            <th>Shape Name</th>
                                            <th>Best For</th>
                                            <th>Brilliance</th>
                                            <th>Showcase Photo</th>
                                            <th>Showcase Title</th>
                                            <th>Status</th>
                                            <th style={{ textAlign: 'right' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {shapes.map((s, idx) => (
                                            <tr key={s.shapeid || idx}>
                                                <td><strong>#{s.order || idx + 1}</strong></td>
                                                <td>
                                                    <img
                                                        src={s.shapeIcon || "/placeholder.png"}
                                                        alt={s.name}
                                                        className="shape-icon-thumb"
                                                        onError={(e) => (e.currentTarget.style.display = 'none')}
                                                    />
                                                </td>
                                                <td>
                                                    <strong style={{ fontSize: '14px' }}>{s.name}</strong>
                                                    <div style={{ fontSize: '11px', color: '#6b7280' }}>ID: {s.shapeid}</div>
                                                </td>
                                                <td>{s.bestFor || "—"}</td>
                                                <td><span className="badge bg-light text-dark border">{s.brilliance || "—"}</span></td>
                                                <td>
                                                    <img
                                                        src={s.showcaseImage || "/placeholder.png"}
                                                        alt={s.showcaseTitle}
                                                        className="showcase-thumb"
                                                        onError={(e) => (e.currentTarget.style.display = 'none')}
                                                    />
                                                </td>
                                                <td style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {s.showcaseTitle || "—"}
                                                </td>
                                                <td>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleShapeStatus(idx)}
                                                        className={`btn btn-sm ${s.status !== false ? 'btn-success' : 'btn-secondary'}`}
                                                        style={{ fontSize: '11px', padding: '2px 8px' }}
                                                    >
                                                        {s.status !== false ? "Active" : "Inactive"}
                                                    </button>
                                                </td>
                                                <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-primary btn-sm me-2"
                                                        onClick={() => handleOpenEditModal(idx)}
                                                        title="Edit Shape"
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-danger btn-sm"
                                                        onClick={() => handleDeleteShape(idx)}
                                                        title="Delete Shape"
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Bottom Save */}
                        <div className="save-btn-container">
                            <button type="submit" className="btn-save" disabled={isSaving}>
                                <SaveIcon fontSize="small" />
                                {isSaving ? "Saving..." : "Save All Changes"}
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
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label>Shape Name *</label>
                                            <input
                                                type="text"
                                                value={currentShape.name}
                                                onChange={(e) => setCurrentShape({ ...currentShape, name: e.target.value })}
                                                placeholder=""
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label>Shape ID / Slug</label>
                                            <input
                                                type="text"
                                                value={currentShape.shapeid}
                                                onChange={(e) => setCurrentShape({ ...currentShape, shapeid: e.target.value })}
                                                placeholder=""
                                            />
                                        </div>
                                    </div>

                                    <div className="col-12">
                                        <div className="form-group">
                                            <label>Tagline (Italic under shape title)</label>
                                            <input
                                                type="text"
                                                value={currentShape.tagline}
                                                onChange={(e) => setCurrentShape({ ...currentShape, tagline: e.target.value })}
                                                placeholder=""
                                            />
                                        </div>
                                    </div>

                                    <div className="col-12">
                                        <div className="form-group">
                                            <label>Description</label>
                                            <textarea
                                                value={currentShape.description}
                                                onChange={(e) => setCurrentShape({ ...currentShape, description: e.target.value })}
                                                placeholder=""
                                                rows="2"
                                            />
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label>Best For (Specification)</label>
                                            <input
                                                type="text"
                                                value={currentShape.bestFor}
                                                onChange={(e) => setCurrentShape({ ...currentShape, bestFor: e.target.value })}
                                                placeholder=""
                                            />
                                        </div>
                                    </div>

                                    <div className="col-md-6">
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
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label>Shape Cut Icon (PNG with transparent bg)</label>
                                            <div className="d-flex gap-2 align-items-center mb-1">
                                                <input
                                                    type="text"
                                                    value={currentShape.shapeIcon}
                                                    onChange={(e) => setCurrentShape({ ...currentShape, shapeIcon: e.target.value })}
                                                    placeholder=""
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
                                                    className="btn btn-outline-secondary btn-sm"
                                                    onClick={() => iconInputRef.current?.click()}
                                                    disabled={isUploadingIcon}
                                                    title="Upload PNG to S3"
                                                >
                                                    <CloudUploadIcon fontSize="small" />
                                                </button>
                                            </div>
                                            {currentShape.shapeIcon && (
                                                <img
                                                    src={currentShape.shapeIcon}
                                                    alt="Icon Preview"
                                                    style={{ width: '40px', height: '40px', objectFit: 'contain', background: '#f5f5f5', borderRadius: '4px', padding: '2px' }}
                                                />
                                            )}
                                        </div>
                                    </div>

                                    {/* Showcase Ring Image Upload / Link */}
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label>Showcase Image (Model hand ring photo)</label>
                                            <div className="d-flex gap-2 align-items-center mb-1">
                                                <input
                                                    type="text"
                                                    value={currentShape.showcaseImage}
                                                    onChange={(e) => setCurrentShape({ ...currentShape, showcaseImage: e.target.value })}
                                                    placeholder=""
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
                                                    className="btn btn-outline-secondary btn-sm"
                                                    onClick={() => showcaseInputRef.current?.click()}
                                                    disabled={isUploadingShowcase}
                                                    title="Upload photo to S3"
                                                >
                                                    <CloudUploadIcon fontSize="small" />
                                                </button>
                                            </div>
                                            {currentShape.showcaseImage && (
                                                <img
                                                    src={currentShape.showcaseImage}
                                                    alt="Showcase Preview"
                                                    style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px' }}
                                                />
                                            )}
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label>Showcase Card Title</label>
                                            <input
                                                type="text"
                                                value={currentShape.showcaseTitle}
                                                onChange={(e) => setCurrentShape({ ...currentShape, showcaseTitle: e.target.value })}
                                                placeholder=""
                                            />
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label>Shop Button Link</label>
                                            <input
                                                type="text"
                                                value={currentShape.buttonLink}
                                                onChange={(e) => setCurrentShape({ ...currentShape, buttonLink: e.target.value })}
                                                placeholder=""
                                            />
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label>Display Order</label>
                                            <input
                                                type="number"
                                                value={currentShape.order}
                                                onChange={(e) => setCurrentShape({ ...currentShape, order: e.target.value })}
                                                min="1"
                                            />
                                        </div>
                                    </div>

                                    <div className="col-md-6 d-flex align-items-center mt-4">
                                        <div className="form-check">
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                id="shapeStatusCheck"
                                                checked={currentShape.status !== false}
                                                onChange={(e) => setCurrentShape({ ...currentShape, status: e.target.checked })}
                                            />
                                            <label className="form-check-label ms-2" htmlFor="shapeStatusCheck">
                                                Active on Dial
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer-custom">
                                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
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