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
        if (translations.promiseSection) {
            document.title = `${translations.promiseSection} | Gemora Diam`;
        }
    }, [translations]);

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
            setWarningMessage(translations.failedtoconnectserver);
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
                setAlertMessage(translations.promisesectionupdatedsuccessfully);
            } else {
                setWarningMessage(result.message || translations.failedtoupdatesection);
            }
        } catch {
            setWarningMessage(translations.failedtoupdatesection);
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
                alert(data.message || translations.uploadfailed);
            }
        } catch {
            alert(translations.uploadfailedconnectionerror);
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
            alert(translations.stylenamerequired);
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
        if (window.confirm(translations.confirmdeletestyle)) {
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
                    {translations.promisesectionheading}
                </h6>

                <div className="promisesection-form-container">
                    {alertMessage && <AlertMessage message={alertMessage} onClose={() => setAlertMessage("")} />}
                    {warningMessage && <WarningModal message={warningMessage} onClose={() => setWarningMessage("")} />}

                    <form onSubmit={handleSave}>
                        {/* Top bar controls */}
                        <div className="top-actions-bar">
                            <div className="section-toggle-wrap">
                                <span className="toggle-label">{translations.sectionvisibility}:</span>
                                <CustomSwitch
                                    checked={sectionStatus}
                                    onChange={() => setSectionStatus(!sectionStatus)}
                                />
                                <span className={`status-badge ${sectionStatus ? 'active' : 'inactive'}`}>
                                    {sectionStatus ? translations.activeonhomepage : translations.hidden}
                                </span>
                            </div>

                            <div className="top-action-btns">
                                <button type="button" className="cancel-btn" onClick={() => navigate('/Home/Dashboard')}>
                                    {translations.cancel}
                                </button>
                                <button type="submit" className="save-btn" disabled={isSaving}>
                                    <SaveIcon fontSize="small" />
                                    {isSaving ? translations.saving : translations.savechanges}
                                </button>
                            </div>
                        </div>

                        {/* SECTION 1: HEADER */}
                        <div className="form-section-divider">
                            <div className="form-section-title-wrap">
                                <h4 className="form-section-title">
                                    <DiamondIcon fontSize="small" /> {translations.mainsectionheading}
                                </h4>
                            </div>
                            <span className="form-section-subtitle">
                                {translations.mainsectionheadingdesc}
                            </span>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>{translations.headereyebrow}</label>
                                <input
                                    type="text"
                                    value={headerEyebrow}
                                    onChange={(e) => setHeaderEyebrow(e.target.value)}
                                    placeholder={translations.enterheadereyebrow}
                                />
                            </div>
                            <div className="form-group">
                                <label>{translations.headertitle}</label>
                                <input
                                    type="text"
                                    value={headerTitle}
                                    onChange={(e) => setHeaderTitle(e.target.value)}
                                    placeholder={translations.enterheadertitle}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>{translations.highlightedaccentword}</label>
                                <input
                                    type="text"
                                    value={headerHighlightText}
                                    onChange={(e) => setHeaderHighlightText(e.target.value)}
                                    placeholder={translations.enterhighlightedaccentword}
                                />
                            </div>
                            <div className="form-group">
                                <label>{translations.headerdescription}</label>
                                <input
                                    type="text"
                                    value={headerDescription}
                                    onChange={(e) => setHeaderDescription(e.target.value)}
                                    placeholder={translations.enterheaderdescription}
                                />
                            </div>
                        </div>

                        {/* SECTION 2: LEFT CARD - WEDDING BANDS */}
                        <div className="form-section-divider">
                            <div className="form-section-title-wrap">
                                <h4 className="form-section-title">
                                    <DiamondIcon fontSize="small" /> {translations.vowscardheading}
                                </h4>
                            </div>
                            <span className="form-section-subtitle">
                                {translations.vowscarddesc}
                            </span>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>{translations.cardeyebrow}</label>
                                <input
                                    type="text"
                                    value={vowsEyebrow}
                                    onChange={(e) => setVowsEyebrow(e.target.value)}
                                    placeholder={translations.entervowseyebrow}
                                />
                            </div>
                            <div className="form-group">
                                <label>{translations.cardmaintitle}</label>
                                <input
                                    type="text"
                                    value={vowsTitle}
                                    onChange={(e) => setVowsTitle(e.target.value)}
                                    placeholder={translations.entervowstitle}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>{translations.carditalicsubtitle}</label>
                                <input
                                    type="text"
                                    value={vowsSubtitle}
                                    onChange={(e) => setVowsSubtitle(e.target.value)}
                                    placeholder={translations.entervowssubtitle}
                                />
                            </div>
                            <div className="form-group">
                                <label>{translations.buttontext}</label>
                                <input
                                    type="text"
                                    value={vowsButtonText}
                                    onChange={(e) => setVowsButtonText(e.target.value)}
                                    placeholder={translations.enterbuttontext}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>{translations.buttonlinkurl}</label>
                                <input
                                    type="text"
                                    value={vowsButtonLink}
                                    onChange={(e) => setVowsButtonLink(e.target.value)}
                                    placeholder={translations.entervowsbuttonlink}
                                />
                            </div>
                            <div className="form-group">
                                <label>{translations.backgroundimageupload}</label>
                                <div className="image-upload-wrapper">
                                    <div className="upload-input-group">
                                        <input
                                            type="text"
                                            value={vowsImage}
                                            onChange={(e) => setVowsImage(e.target.value)}
                                            placeholder={translations.pasteimageurlorupload}
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
                                            {isUploadingVows ? translations.uploading : translations.uploadimage}
                                        </button>
                                    </div>
                                    <div className="image-preview-box">
                                        {vowsImage ? (
                                            <img src={vowsImage} alt="Wedding Bands Preview" />
                                        ) : (
                                            <span className="empty-preview">{translations.noimageselected}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SECTION 3: RIGHT TOP CARD - ENGAGEMENT RINGS */}
                        <div className="form-section-divider">
                            <div className="form-section-title-wrap">
                                <h4 className="form-section-title">
                                    <DiamondIcon fontSize="small" /> {translations.proposalcardheading}
                                </h4>
                            </div>
                            <span className="form-section-subtitle">
                                {translations.proposalcarddesc}
                            </span>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>{translations.cardeyebrow}</label>
                                <input
                                    type="text"
                                    value={proposalEyebrow}
                                    onChange={(e) => setProposalEyebrow(e.target.value)}
                                    placeholder={translations.enterproposaleyebrow}
                                />
                            </div>
                            <div className="form-group">
                                <label>{translations.cardmaintitle}</label>
                                <input
                                    type="text"
                                    value={proposalTitle}
                                    onChange={(e) => setProposalTitle(e.target.value)}
                                    placeholder={translations.enterproposaltitle}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>{translations.carditalicsubtitle}</label>
                                <input
                                    type="text"
                                    value={proposalSubtitle}
                                    onChange={(e) => setProposalSubtitle(e.target.value)}
                                    placeholder={translations.enterproposalsubtitle}
                                />
                            </div>
                            <div className="form-group">
                                <label>{translations.buttontext}</label>
                                <input
                                    type="text"
                                    value={proposalButtonText}
                                    onChange={(e) => setProposalButtonText(e.target.value)}
                                    placeholder={translations.enterbuttontext}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>{translations.buttonlinkurl}</label>
                                <input
                                    type="text"
                                    value={proposalButtonLink}
                                    onChange={(e) => setProposalButtonLink(e.target.value)}
                                    placeholder={translations.enterproposalbuttonlink}
                                />
                            </div>
                            <div className="form-group">
                                <label>{translations.backgroundimageupload}</label>
                                <div className="image-upload-wrapper">
                                    <div className="upload-input-group">
                                        <input
                                            type="text"
                                            value={proposalImage}
                                            onChange={(e) => setProposalImage(e.target.value)}
                                            placeholder={translations.pasteimageurlorupload}
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
                                            {isUploadingProposal ? translations.uploading : translations.uploadimage}
                                        </button>
                                    </div>
                                    <div className="image-preview-box">
                                        {proposalImage ? (
                                            <img src={proposalImage} alt="Engagement Rings Preview" />
                                        ) : (
                                            <span className="empty-preview">{translations.noimageselected}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SECTION 4: SHOP BY STYLE */}
                        <div className="form-section-divider">
                            <div className="form-section-title-wrap">
                                <h4 className="form-section-title">
                                    <DiamondIcon fontSize="small" /> {translations.shopbystyledialheading}
                                </h4>
                                <button type="button" className="add-new-btn" onClick={handleOpenAddModal}>
                                    <AddIcon fontSize="small" /> {translations.addstyle}
                                </button>
                            </div>
                            <span className="form-section-subtitle">
                                {translations.shopbystyledialdesc}
                            </span>
                        </div>

                        <div className="form-row full-width">
                            <div className="form-group">
                                <label>{translations.sectionsubtitlelabel}</label>
                                <input
                                    type="text"
                                    value={styleSectionTitle}
                                    onChange={(e) => setStyleSectionTitle(e.target.value)}
                                    placeholder={translations.entersectionsubtitlelabel}
                                />
                            </div>
                        </div>

                        {/* Styles Table */}
                        <div className="table-wrapper">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th style={{ width: "65px", textAlign: "center" }}>{translations.thumb}</th>
                                        <th style={{ minWidth: "120px", textAlign: "left" }}>{translations.stylename}</th>
                                        <th style={{ minWidth: "260px", maxWidth: "340px", textAlign: "left" }}>{translations.description}</th>
                                        <th style={{ minWidth: "190px", maxWidth: "240px", textAlign: "left" }}>{translations.linkurl}</th>
                                        <th style={{ width: "70px", textAlign: "center" }}>{translations.displayorder || translations.order}</th>
                                        <th style={{ width: "90px", textAlign: "center" }}>{translations.status}</th>
                                        <th style={{ width: "100px", textAlign: "center" }}>{translations.actions}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {styles.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" style={{ textAlign: "center", padding: "28px", color: "#9ca3af" }}>
                                                {translations.nostylesyet}
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
                                {translations.cancel}
                            </button>
                            <button type="submit" className="save-btn" disabled={isSaving}>
                                <SaveIcon fontSize="small" />
                                {isSaving ? translations.saving : translations.savechanges}
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
                            <h5>{editingIndex !== null ? translations.editringstyle : translations.addnewringstyle}</h5>
                            <button type="button" className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>
                        </div>
                        <form onSubmit={handleSaveStyleModal}>
                            <div className="modal-body">
                                <div className="form-group" style={{ marginBottom: "14px" }}>
                                    <label>{translations.stylename} *</label>
                                    <input
                                        type="text"
                                        required
                                        value={currentStyle.name}
                                        onChange={(e) => setCurrentStyle({ ...currentStyle, name: e.target.value })}
                                        placeholder={translations.enterstylename}
                                    />
                                </div>

                                <div className="form-group" style={{ marginBottom: "14px" }}>
                                    <label>{translations.shortdescription} *</label>
                                    <textarea
                                        rows="2"
                                        value={currentStyle.desc}
                                        onChange={(e) => setCurrentStyle({ ...currentStyle, desc: e.target.value })}
                                        placeholder={translations.entershortdescription}
                                    />
                                </div>

                                <div className="form-group" style={{ marginBottom: "14px" }}>
                                    <label>{translations.destinationlinkurl}</label>
                                    <input
                                        type="text"
                                        value={currentStyle.link}
                                        onChange={(e) => setCurrentStyle({ ...currentStyle, link: e.target.value })}
                                        placeholder={translations.enterdestinationlinkurl}
                                    />
                                </div>

                                <div className="form-group" style={{ marginBottom: "14px" }}>
                                    <label>{translations.displayorder}</label>
                                    <input
                                        type="number"
                                        value={currentStyle.order}
                                        onChange={(e) => setCurrentStyle({ ...currentStyle, order: e.target.value })}
                                    />
                                </div>

                                <div className="form-group" style={{ marginBottom: "14px" }}>
                                    <label>{translations.avatarthumbnailimage}</label>
                                    <div className="image-upload-wrapper">
                                        <div className="upload-input-group">
                                            <input
                                                type="text"
                                                value={currentStyle.img}
                                                onChange={(e) => setCurrentStyle({ ...currentStyle, img: e.target.value })}
                                                placeholder={translations.pasteimageurlorupload}
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
                                                {isUploadingModalImg ? translations.uploading : translations.upload}
                                            </button>
                                        </div>
                                        <div className="image-preview-box" style={{ maxWidth: "120px", height: "120px", borderRadius: "50%" }}>
                                            {currentStyle.img ? (
                                                <img src={currentStyle.img} alt="Style Avatar Preview" />
                                            ) : (
                                                <span className="empty-preview">{translations.noavatar}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="form-group" style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "14px" }}>
                                    <CustomSwitch
                                        checked={currentStyle.status !== false}
                                        onChange={() => setCurrentStyle({ ...currentStyle, status: !currentStyle.status })}
                                    />
                                    <label style={{ margin: 0 }}>{translations.activeonwebsite}</label>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="cancel-btn" onClick={() => setIsModalOpen(false)}>
                                    {translations.cancel}
                                </button>
                                <button type="submit" className="save-btn">
                                    {editingIndex !== null ? translations.updatestyle : translations.addstyle}
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
