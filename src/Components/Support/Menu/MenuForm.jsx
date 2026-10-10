import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Placeholder from '../../../assets/placeholder.png';
import { useAuth } from '../../../Middleware/Auth';
import LoadingSpinner from '../../../Pages/Custom/LoadingSpinner';
import WarningModal from '../../../Pages/Custom/WarningModal';
import { useLanguage } from '../../../Context/LanguageContext';
import CheckToken from '../../../utils/CheckToken';
import HandleUnauthorized from '../../../utils/HandleUnauthorized';
import "../../../Scss/Support/Menu/addmenu.scss";

function slugify(text) {
    if (!text) return "";
    return "/" + text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^\w\-]+/g, "")
        .replace(/\-\-+/g, "-");
}

export function MenuForm({ initialData = null, isEdit = false }) {
    const navigate = useNavigate();
    const { translations, isRtl } = useLanguage();
    const { logoutUser } = useAuth();
    const adminPanelBackendPath = import.meta.env.VITE_BACKEND_URL;
    const tokenname = import.meta.env.VITE_AdminTOKEN_NAME;
    const token = localStorage.getItem(tokenname);
    const fileInputRef = useRef(null);

    const [activeTab, setActiveTab] = useState("general");
    const [warningMessage, setWarningMessage] = useState("");
    const [showWarning, setShowWarning] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const tabs = [
        { id: "general", title: translations.menugeneral || "General & URL" },
        { id: "col1", title: translations.column1 || "Column 1" },
        { id: "col2", title: translations.column2 || "Column 2" },
        { id: "col3", title: translations.column3 || "Column 3" },
        { id: "banner", title: translations.menubanner || "Promotional Banner" },
        { id: "bottom", title: translations.bottombar || "Bottom Strip" },
    ];

    // Form fields - empty by default (no dummy data)
    const [title, setTitle] = useState(initialData?.title || "");
    const [slug, setSlug] = useState(initialData?.slug || "");
    const [order, setOrder] = useState(initialData?.order !== undefined && initialData?.order !== null ? initialData.order : "");

    // Column 1
    const [col1Title, setCol1Title] = useState(initialData?.column1?.title || "");
    const [col1BottomText, setCol1BottomText] = useState(initialData?.column1?.bottomText || "");
    const [col1BottomUrl, setCol1BottomUrl] = useState(initialData?.column1?.bottomUrl || "");
    const [col1Items, setCol1Items] = useState(Array.isArray(initialData?.column1?.items) ? initialData.column1.items : []);

    // Column 2
    const [col2Title, setCol2Title] = useState(initialData?.column2?.title || "");
    const [col2BottomText, setCol2BottomText] = useState(initialData?.column2?.bottomText || "");
    const [col2BottomUrl, setCol2BottomUrl] = useState(initialData?.column2?.bottomUrl || "");
    const [col2Items, setCol2Items] = useState(Array.isArray(initialData?.column2?.items) ? initialData.column2.items : []);

    // Column 3
    const [col3Title, setCol3Title] = useState(initialData?.column3?.title || "");
    const [col3Items, setCol3Items] = useState(Array.isArray(initialData?.column3?.items) ? initialData.column3.items : []);

    // Banner
    const [bannerEyebrow, setBannerEyebrow] = useState(initialData?.banner?.eyebrow || "");
    const [bannerTitle, setBannerTitle] = useState(initialData?.banner?.title || "");
    const [bannerDescription, setBannerDescription] = useState(initialData?.banner?.description || "");
    const [bannerButtonText, setBannerButtonText] = useState(initialData?.banner?.buttonText || "");
    const [bannerButtonLink, setBannerButtonLink] = useState(initialData?.banner?.buttonLink || "");
    const [bannerImage, setBannerImage] = useState(initialData?.banner?.image || "");
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(initialData?.banner?.image || Placeholder);

    // Bottom Bar
    const [bottomBarText, setBottomBarText] = useState(initialData?.bottomBar?.text || "");
    const [bottomBarLink, setBottomBarLink] = useState(initialData?.bottomBar?.link || "");

    useEffect(() => {
        const pageTitle = isEdit ? translations.editmenu : translations.addmenu;
        if (pageTitle) document.title = pageTitle;
    }, [isEdit, translations]);

    useEffect(() => {
        if (!slug && title && !isEdit) {
            setSlug(slugify(title));
        }
    }, [title, isEdit, slug]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const allowed = ["jpg", "jpeg", "png", "webp"];
            const ext = file.name.split('.').pop().toLowerCase();
            if (!allowed.includes(ext)) {
                setWarningMessage(translations.invalidfileextension || "Invalid file format");
                setShowWarning(true);
                e.target.value = '';
                return;
            }
            if (file.size > 10 * 1024 * 1024) {
                setWarningMessage(translations.filesizetoolarge || "File size is too large (max 10MB)");
                setShowWarning(true);
                e.target.value = '';
                return;
            }
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    // Repeater handlers
    const addCol1Item = () => setCol1Items([...col1Items, { label: "", slug: "", filterType: "style", filterValue: "" }]);
    const updateCol1Item = (index, field, val) => {
        const next = [...col1Items];
        next[index][field] = val;
        if (field === "label" && !next[index].slug) {
            next[index].slug = slugify(val);
        }
        if (field === "label" && !next[index].filterValue) {
            next[index].filterValue = val.replace(/ Rings| Bands| Collection/gi, "").trim();
        }
        setCol1Items(next);
    };
    const removeCol1Item = (index) => setCol1Items(col1Items.filter((_, i) => i !== index));

    const addCol2Item = () => setCol2Items([...col2Items, { label: "", shape: "round", slug: "", filterType: "shape", filterValue: "round" }]);
    const updateCol2Item = (index, field, val) => {
        const next = [...col2Items];
        next[index][field] = val;
        if (field === "label" && !next[index].slug) {
            next[index].slug = slugify(val);
        }
        if (field === "shape") {
            next[index].filterValue = val;
        }
        setCol2Items(next);
    };
    const removeCol2Item = (index) => setCol2Items(col2Items.filter((_, i) => i !== index));

    const addCol3Item = () => setCol3Items([...col3Items, { label: "", slug: "", badge: "", filterType: "featured", filterValue: "" }]);
    const updateCol3Item = (index, field, val) => {
        const next = [...col3Items];
        next[index][field] = val;
        if (field === "label" && !next[index].slug) {
            next[index].slug = slugify(val);
        }
        setCol3Items(next);
    };
    const removeCol3Item = (index) => setCol3Items(col3Items.filter((_, i) => i !== index));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) {
            setWarningMessage(translations.allfieldrequired || "Menu title is required");
            setShowWarning(true);
            return;
        }

        setIsLoading(true);
        if (!CheckToken(token, logoutUser, navigate)) {
            setIsLoading(false);
            return;
        }

        try {
            const formData = new FormData();
            formData.append("title", title.trim());
            formData.append("slug", slug.trim() ? (slug.startsWith("/") ? slug.trim() : "/" + slug.trim()) : slugify(title));
            formData.append("order", order !== "" ? String(order) : "1");

            const col1Obj = { title: col1Title.trim(), bottomText: col1BottomText.trim(), bottomUrl: col1BottomUrl.trim(), items: col1Items.filter(i => i.label?.trim()) };
            const col2Obj = { title: col2Title.trim(), bottomText: col2BottomText.trim(), bottomUrl: col2BottomUrl.trim(), items: col2Items.filter(i => i.label?.trim()) };
            const col3Obj = { title: col3Title.trim(), items: col3Items.filter(i => i.label?.trim()) };
            const bannerObj = {
                eyebrow: bannerEyebrow.trim(),
                title: bannerTitle.trim(),
                description: bannerDescription.trim(),
                image: bannerImage,
                buttonText: bannerButtonText.trim(),
                buttonLink: bannerButtonLink.trim()
            };
            const bottomBarObj = { text: bottomBarText.trim(), link: bottomBarLink.trim() };

            formData.append("column1", JSON.stringify(col1Obj));
            formData.append("column2", JSON.stringify(col2Obj));
            formData.append("column3", JSON.stringify(col3Obj));
            formData.append("banner", JSON.stringify(bannerObj));
            formData.append("bottomBar", JSON.stringify(bottomBarObj));

            if (imageFile) {
                formData.append("image", imageFile);
            }

            const targetId = initialData?.menuid || initialData?._id;
            const url = isEdit
                ? `${adminPanelBackendPath}/Support/UpdateMenu/${targetId}`
                : `${adminPanelBackendPath}/Support/AddMenu`;
            const method = isEdit ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });

            const data = await res.json();
            if (HandleUnauthorized(data, logoutUser, navigate)) return;

            if (res.ok) {
                navigate("/Support/Menu", {
                    state: {
                        message: isEdit ? (translations.updatemenusuccessfull || "Menu updated successfully") : (translations.addmenusuccessfull || "Menu added successfully")
                    }
                });
            } else {
                setWarningMessage(data.message || translations.servererror);
                setShowWarning(true);
            }
        } catch {
            setWarningMessage(translations.servererror);
            setShowWarning(true);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {showWarning && <WarningModal message={warningMessage} onClose={() => setShowWarning(false)} />}
            <div className={`AddMenu-container ${isRtl ? 'rtl-addmenu' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
                <div className="Addmenu-container">
                    <h6 className="Addmenu-headingname">
                        {isEdit ? (translations.editmenu || "Edit Menu") : (translations.addmenu || "Add Menu")}
                    </h6>
                    <div className="Addmenu-form-container">
                        {isLoading ? (
                            <LoadingSpinner />
                        ) : (
                            <form onSubmit={handleSubmit}>
                                {/* Tabs Container - Same as Employee Overview */}
                                <div className="tabs-container">
                                    <div className="horizontal-tabs" role="tablist">
                                        {tabs.map((tab) => (
                                            <button
                                                key={tab.id}
                                                type="button"
                                                role="tab"
                                                aria-selected={activeTab === tab.id}
                                                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                                                onClick={() => setActiveTab(tab.id)}
                                            >
                                                {tab.title}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="tab-content">
                                        <div className="tab-content-body">
                                            {/* Tab 1: General */}
                                            {activeTab === "general" && (
                                                <div>
                                                    <div className="form-grid-3">
                                                        <div className="form-group">
                                                            <label htmlFor="menutitle">
                                                                {translations.menutitle || "Menu Tab Title"} <span style={{ color: "red" }}>*</span>
                                                            </label>
                                                            <input
                                                                type="text"
                                                                id="menutitle"
                                                                autoComplete="off"
                                                                value={title}
                                                                placeholder={translations.entermenutitle || "e.g. Engagement Rings"}
                                                                onChange={(e) => setTitle(e.target.value)}
                                                                required
                                                            />
                                                        </div>
                                                        <div className="form-group">
                                                            <label htmlFor="menuslug">
                                                                {translations.menuslug || "Page URL (Slug)"} <span style={{ color: "red" }}>*</span>
                                                            </label>
                                                            <input
                                                                type="text"
                                                                id="menuslug"
                                                                autoComplete="off"
                                                                value={slug}
                                                                placeholder={translations.entermenuslug || "/engagement-rings"}
                                                                onChange={(e) => setSlug(e.target.value)}
                                                                required
                                                            />
                                                            <span className="field-hint">e.g. /engagement-rings, /wedding-rings</span>
                                                        </div>
                                                        <div className="form-group">
                                                            <label htmlFor="menuorder">
                                                                {translations.order || translations.displayorder || "Display Order"}
                                                            </label>
                                                            <input
                                                                type="number"
                                                                id="menuorder"
                                                                value={order}
                                                                placeholder={translations.entermenuorder || "1"}
                                                                onChange={(e) => setOrder(e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Tab 2: Column 1 */}
                                            {activeTab === "col1" && (
                                                <div>
                                                    <div className="form-grid-3">
                                                        <div className="form-group">
                                                            <label>{translations.columnheader || "Column Header"}</label>
                                                            <input
                                                                type="text"
                                                                value={col1Title}
                                                                placeholder="e.g. SHOP BY RING STYLE"
                                                                onChange={(e) => setCol1Title(e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="form-group">
                                                            <label>{translations.bottomlinktext || "Bottom Link Text"}</label>
                                                            <input
                                                                type="text"
                                                                value={col1BottomText}
                                                                placeholder="e.g. VIEW ALL RING COLLECTIONS"
                                                                onChange={(e) => setCol1BottomText(e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="form-group">
                                                            <label>{translations.bottomlinkurl || "Bottom Link URL"}</label>
                                                            <input
                                                                type="text"
                                                                value={col1BottomUrl}
                                                                placeholder="e.g. /collections"
                                                                onChange={(e) => setCol1BottomUrl(e.target.value)}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="repeater-section">
                                                        <label className="repeater-header-label">
                                                            {translations.column1 || "Column Items"}:
                                                        </label>
                                                        {col1Items.length === 0 ? (
                                                            <div className="empty-items-notice">
                                                                {translations.nodatafound || "No items added yet. Click '+ Add Style Item' below to create links."}
                                                            </div>
                                                        ) : (
                                                            col1Items.map((item, idx) => (
                                                                <div key={idx} className="repeater-row">
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Label (e.g. Solitaire Rings)"
                                                                        value={item.label}
                                                                        onChange={(e) => updateCol1Item(idx, "label", e.target.value)}
                                                                    />
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Clean URL (e.g. /solitaire-rings)"
                                                                        value={item.slug}
                                                                        onChange={(e) => updateCol1Item(idx, "slug", e.target.value)}
                                                                    />
                                                                    <select
                                                                        value={item.filterType}
                                                                        onChange={(e) => updateCol1Item(idx, "filterType", e.target.value)}
                                                                        style={{ maxWidth: "150px" }}
                                                                    >
                                                                        <option value="style">Style</option>
                                                                        <option value="category">Category</option>
                                                                        <option value="subcategory">Subcategory</option>
                                                                        <option value="search">Search</option>
                                                                    </select>
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Filter Value (e.g. Solitaire)"
                                                                        value={item.filterValue}
                                                                        onChange={(e) => updateCol1Item(idx, "filterValue", e.target.value)}
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        className="btn-remove-row"
                                                                        onClick={() => removeCol1Item(idx)}
                                                                        title="Remove Item"
                                                                    >
                                                                        ✕
                                                                    </button>
                                                                </div>
                                                            ))
                                                        )}
                                                        <button type="button" className="btn-add-row" onClick={addCol1Item}>
                                                            + {translations.additem || "Add Style Item"}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Tab 3: Column 2 */}
                                            {activeTab === "col2" && (
                                                <div>
                                                    <div className="form-grid-3">
                                                        <div className="form-group">
                                                            <label>{translations.columnheader || "Column Header"}</label>
                                                            <input
                                                                type="text"
                                                                value={col2Title}
                                                                placeholder="e.g. SHOP BY DIAMOND SHAPE"
                                                                onChange={(e) => setCol2Title(e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="form-group">
                                                            <label>{translations.bottomlinktext || "Bottom Link Text"}</label>
                                                            <input
                                                                type="text"
                                                                value={col2BottomText}
                                                                placeholder="e.g. EXPLORE ALL SHAPES"
                                                                onChange={(e) => setCol2BottomText(e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="form-group">
                                                            <label>{translations.bottomlinkurl || "Bottom Link URL"}</label>
                                                            <input
                                                                type="text"
                                                                value={col2BottomUrl}
                                                                placeholder="e.g. /collections"
                                                                onChange={(e) => setCol2BottomUrl(e.target.value)}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="repeater-section">
                                                        <label className="repeater-header-label">
                                                            {translations.column2 || "Diamond Shapes"}:
                                                        </label>
                                                        {col2Items.length === 0 ? (
                                                            <div className="empty-items-notice">
                                                                {translations.nodatafound || "No shape items added yet. Click '+ Add Diamond Shape' below."}
                                                            </div>
                                                        ) : (
                                                            col2Items.map((item, idx) => (
                                                                <div key={idx} className="repeater-row">
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Label (e.g. Emerald Cut)"
                                                                        value={item.label}
                                                                        onChange={(e) => updateCol2Item(idx, "label", e.target.value)}
                                                                    />
                                                                    <select
                                                                        value={item.shape}
                                                                        onChange={(e) => updateCol2Item(idx, "shape", e.target.value)}
                                                                        style={{ maxWidth: "160px" }}
                                                                    >
                                                                        <option value="round">Round</option>
                                                                        <option value="emerald">Emerald</option>
                                                                        <option value="oval">Oval</option>
                                                                        <option value="cushion">Cushion</option>
                                                                        <option value="princess">Princess</option>
                                                                        <option value="pear">Pear</option>
                                                                        <option value="radiant">Radiant</option>
                                                                        <option value="marquise">Marquise</option>
                                                                        <option value="heart">Heart</option>
                                                                        <option value="asscher">Asscher</option>
                                                                        <option value="baguette">Baguette</option>
                                                                        <option value="antique">Antique</option>
                                                                        <option value="old cut">Old Cut</option>
                                                                        <option value="rose cut">Rose Cut</option>
                                                                    </select>
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Clean URL (e.g. /emerald-cut-diamonds)"
                                                                        value={item.slug}
                                                                        onChange={(e) => updateCol2Item(idx, "slug", e.target.value)}
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        className="btn-remove-row"
                                                                        onClick={() => removeCol2Item(idx)}
                                                                        title="Remove Item"
                                                                    >
                                                                        ✕
                                                                    </button>
                                                                </div>
                                                            ))
                                                        )}
                                                        <button type="button" className="btn-add-row" onClick={addCol2Item}>
                                                            + {translations.additem || "Add Diamond Shape"}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Tab 4: Column 3 */}
                                            {activeTab === "col3" && (
                                                <div>
                                                    <div className="form-grid-2">
                                                        <div className="form-group">
                                                            <label>{translations.columnheader || "Column Header"}</label>
                                                            <input
                                                                type="text"
                                                                value={col3Title}
                                                                placeholder="e.g. FEATURED"
                                                                onChange={(e) => setCol3Title(e.target.value)}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="repeater-section">
                                                        <label className="repeater-header-label">
                                                            {translations.column3 || "Featured Items"}:
                                                        </label>
                                                        {col3Items.length === 0 ? (
                                                            <div className="empty-items-notice">
                                                                {translations.nodatafound || "No featured items added yet. Click '+ Add Featured Item' below."}
                                                            </div>
                                                        ) : (
                                                            col3Items.map((item, idx) => (
                                                                <div key={idx} className="repeater-row">
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Label (e.g. Top 20 Engagement Rings)"
                                                                        value={item.label}
                                                                        onChange={(e) => updateCol3Item(idx, "label", e.target.value)}
                                                                    />
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Clean URL (e.g. /top-20-engagement-rings)"
                                                                        value={item.slug}
                                                                        onChange={(e) => updateCol3Item(idx, "slug", e.target.value)}
                                                                    />
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Badge (e.g. NEW, HOT)"
                                                                        value={item.badge}
                                                                        onChange={(e) => updateCol3Item(idx, "badge", e.target.value)}
                                                                        style={{ maxWidth: "130px" }}
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        className="btn-remove-row"
                                                                        onClick={() => removeCol3Item(idx)}
                                                                        title="Remove Item"
                                                                    >
                                                                        ✕
                                                                    </button>
                                                                </div>
                                                            ))
                                                        )}
                                                        <button type="button" className="btn-add-row" onClick={addCol3Item}>
                                                            + {translations.additem || "Add Featured Item"}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Tab 5: Promo Card */}
                                            {activeTab === "banner" && (
                                                <div>
                                                    <div className="form-grid-2">
                                                        <div className="form-group">
                                                            <label>Eyebrow Tag</label>
                                                            <input
                                                                type="text"
                                                                value={bannerEyebrow}
                                                                placeholder="e.g. FEATURED ATELIER"
                                                                onChange={(e) => setBannerEyebrow(e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="form-group">
                                                            <label>Card Title</label>
                                                            <input
                                                                type="text"
                                                                value={bannerTitle}
                                                                placeholder="e.g. Bracelets Collection"
                                                                onChange={(e) => setBannerTitle(e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="form-group">
                                                            <label>Button Text</label>
                                                            <input
                                                                type="text"
                                                                value={bannerButtonText}
                                                                placeholder="e.g. EXPLORE COLLECTION"
                                                                onChange={(e) => setBannerButtonText(e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="form-group">
                                                            <label>Button Link</label>
                                                            <input
                                                                type="text"
                                                                value={bannerButtonLink}
                                                                placeholder="e.g. /bracelets-collection"
                                                                onChange={(e) => setBannerButtonLink(e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="form-group">
                                                        <label>Description Subtitle</label>
                                                        <textarea
                                                            value={bannerDescription}
                                                            placeholder="e.g. Complimentary Insured Delivery & Lifetime Polish on bespoke creations."
                                                            onChange={(e) => setBannerDescription(e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="form-group">
                                                        <label>{translations.bannerimage || "Promo Card Image"}</label>
                                                        <input
                                                            type="file"
                                                            ref={fileInputRef}
                                                            onChange={handleFileChange}
                                                            accept="image/*"
                                                            style={{ display: "none" }}
                                                        />
                                                        <div className="image-upload-wrapper">
                                                            <img
                                                                src={imagePreview}
                                                                alt="Promo Card Preview"
                                                                className="preview-box"
                                                                onError={(e) => {
                                                                    e.target.onerror = null;
                                                                    e.target.src = Placeholder;
                                                                }}
                                                            />
                                                            <button
                                                                type="button"
                                                                className="upload-action-btn"
                                                                onClick={() => fileInputRef.current?.click()}
                                                            >
                                                                {translations.upload || "Upload Image"}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Tab 6: Bottom Bar */}
                                            {activeTab === "bottom" && (
                                                <div>
                                                    <div className="form-group">
                                                        <label>Strip Text</label>
                                                        <input
                                                            type="text"
                                                            value={bottomBarText}
                                                            placeholder="e.g. DESIGN YOUR OWN BESPOKE ENGAGEMENT RING · BOOK AN ATELIER APPOINTMENT"
                                                            onChange={(e) => setBottomBarText(e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="form-group">
                                                        <label>Action Link</label>
                                                        <input
                                                            type="text"
                                                            value={bottomBarLink}
                                                            placeholder="e.g. /contact"
                                                            onChange={(e) => setBottomBarLink(e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Buttons Group */}
                                <div className="button-group">
                                    <button
                                        type="button"
                                        className="btn btn-secondary cancelbtn"
                                        onClick={() => navigate("/Support/Menu")}
                                        disabled={isLoading}
                                    >
                                        {translations.cancel || "Cancel"}
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-success submit-btn"
                                        disabled={isLoading}
                                    >
                                        {translations.save || "Save"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}