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
        .replace(/[^\w-]+/g, "")
        .replace(/--+/g, "-");
}

function parseFilterValue(val) {
    if (Array.isArray(val)) return val.filter(Boolean);
    if (typeof val === "string" && val.trim()) {
        return val.includes(",") ? val.split(",").map(s => s.trim()).filter(Boolean) : [val.trim()];
    }
    return [];
}

function normalizeItems(items, defaultType = "style") {
    if (!Array.isArray(items)) return [];
    return items.map(item => {
        let fVal = item.filterValue;
        if ((!fVal || (Array.isArray(fVal) && fVal.length === 0)) && item.shape) {
            fVal = [item.shape];
        }
        return {
            label: item.label || "",
            slug: item.slug || "",
            shape: item.shape || "",
            badge: item.badge || "",
            filterType: (item.filterType || defaultType).toLowerCase().replace(/[^a-z]/g, "") || defaultType,
            filterValue: parseFilterValue(fVal)
        };
    });
}

function AttributeMultiSelect({
    options = [],
    selected = [],
    onChange,
    placeholder = "Select attribute details...",
    attributeName = "Attribute",
    isRtl = false,
    translations = {}
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedArray = Array.isArray(selected)
        ? selected
        : (typeof selected === "string" && selected.trim()
            ? (selected.includes(",") ? selected.split(",").map(s => s.trim()).filter(Boolean) : [selected.trim()])
            : []);

    // Combine active options with any pre-selected values not currently in the active list
    const allAvailableOptions = Array.from(new Set([...options, ...selectedArray])).filter(Boolean);

    const filteredOptions = allAvailableOptions.filter((opt) =>
        String(opt).toLowerCase().includes(searchQuery.toLowerCase().trim())
    );

    const toggleOption = (val) => {
        if (selectedArray.includes(val)) {
            onChange(selectedArray.filter(v => v !== val));
        } else {
            onChange([...selectedArray, val]);
        }
    };

    const handleRemoveChip = (e, val) => {
        e.stopPropagation();
        onChange(selectedArray.filter(v => v !== val));
    };

    const handleClearAll = (e) => {
        e.stopPropagation();
        onChange([]);
    };

    const handleSelectAll = (e) => {
        e.stopPropagation();
        const merged = Array.from(new Set([...selectedArray, ...filteredOptions]));
        onChange(merged);
    };

    const handleAddCustom = () => {
        const trimmed = searchQuery.trim();
        if (trimmed && !selectedArray.includes(trimmed)) {
            onChange([...selectedArray, trimmed]);
            setSearchQuery("");
        }
    };

    const maxVisibleChips = 2;
    const visibleChips = selectedArray.slice(0, maxVisibleChips);
    const hiddenCount = selectedArray.length - maxVisibleChips;

    return (
        <div className="attribute-multiselect" ref={containerRef} dir={isRtl ? "rtl" : "ltr"}>
            <div
                className={`multiselect-trigger ${isOpen ? "is-open" : ""}`}
                onClick={() => setIsOpen(prev => !prev)}
                tabIndex={0}
                role="button"
                aria-haspopup="listbox"
                aria-expanded={isOpen}
            >
                <div className="multiselect-chips-container">
                    {selectedArray.length === 0 ? (
                        <span className="multiselect-placeholder">{placeholder}</span>
                    ) : (
                        <>
                            {visibleChips.map((val) => (
                                <span key={val} className="multiselect-chip" title={val}>
                                    <span className="chip-label">{val}</span>
                                    <button
                                        type="button"
                                        className="chip-remove"
                                        onClick={(e) => handleRemoveChip(e, val)}
                                        title="Remove"
                                    >
                                        ✕
                                    </button>
                                </span>
                            ))}
                            {hiddenCount > 0 && (
                                <span className="multiselect-more-badge" title={selectedArray.slice(maxVisibleChips).join(", ")}>
                                    +{hiddenCount} {translations.more || "more"}
                                </span>
                            )}
                        </>
                    )}
                </div>
                <div className="multiselect-trigger-actions">
                    {selectedArray.length > 0 && (
                        <button
                            type="button"
                            className="clear-all-btn"
                            onClick={handleClearAll}
                            title={translations.clearall || "Clear all"}
                        >
                            ✕
                        </button>
                    )}
                    <span className={`chevron-icon ${isOpen ? "is-open" : ""}`}>▼</span>
                </div>
            </div>

            {isOpen && (
                <div className="multiselect-dropdown-menu">
                    <div className="multiselect-search-wrapper">
                        <input
                            type="text"
                            className="multiselect-search-input"
                            placeholder={`${translations.search || "Search"} ${attributeName}...`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleAddCustom();
                                }
                            }}
                            autoFocus
                        />
                    </div>

                    <div className="multiselect-quick-actions">
                        <span className="selected-count-label">
                            {translations.selected || "Selected"}: {selectedArray.length}
                        </span>
                        <div className="actions-buttons">
                            {filteredOptions.length > 0 && (
                                <button type="button" onClick={handleSelectAll}>
                                    {translations.selectall || "Select All"}
                                </button>
                            )}
                            {selectedArray.length > 0 && (
                                <button type="button" onClick={handleClearAll}>
                                    {translations.clearall || "Clear All"}
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="multiselect-options-list" role="listbox">
                        {filteredOptions.length === 0 ? (
                            <div className="multiselect-empty-notice">
                                {searchQuery.trim() ? (
                                    <div>
                                        <span>{translations.nomatchingoptions || "No matching options"}</span>
                                        <button
                                            type="button"
                                            className="btn-add-custom-val"
                                            onClick={handleAddCustom}
                                        >
                                            + {translations.add || "Add"} "{searchQuery.trim()}"
                                        </button>
                                    </div>
                                ) : (
                                    <span>{translations.nooptionsavailable || "No options available"}</span>
                                )}
                            </div>
                        ) : (
                            filteredOptions.map((opt) => {
                                const isChecked = selectedArray.includes(opt);
                                return (
                                    <label
                                        key={opt}
                                        className={`multiselect-option-item ${isChecked ? "is-selected" : ""}`}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isChecked}
                                            onChange={() => toggleOption(opt)}
                                        />
                                        <span className="option-text">{opt}</span>
                                    </label>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
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

    // Attribute types definition matching sidebar
    const ATTRIBUTE_KEYS = [
        { key: "metal", label: translations.metal || "Metal" },
        { key: "diamondsize", label: translations.diamondsize || "Diamond Size" },
        { key: "shape", label: translations.shape || "Shape" },
        { key: "clarity", label: translations.clarity || "Clarity" },
        { key: "color", label: translations.color || "Color" },
        { key: "stone", label: translations.stone || "Stone" },
        { key: "style", label: translations.style || "Style" },
        { key: "category", label: translations.category || "Category" },
        { key: "subcategory", label: translations.subcategory || "Sub Category" }
    ];

    // State holding active attribute options from the system
    const [attributeOptionsMap, setAttributeOptionsMap] = useState({
        metal: [],
        diamondsize: [],
        shape: [],
        clarity: [],
        color: [],
        stone: [],
        style: [],
        category: [],
        subcategory: []
    });

    // Fetch all active attribute options
    useEffect(() => {
        const fetchAttributeOptions = async () => {
            try {
                const headers = token ? { Authorization: `Bearer ${token}` } : {};
                const [
                    metalsRes,
                    diamondSizesRes,
                    shapesRes,
                    claritiesRes,
                    colorsRes,
                    stonesRes,
                    stylesRes,
                    categoriesRes,
                    subCategoriesRes
                ] = await Promise.all([
                    fetch(`${adminPanelBackendPath}/Attributes/GetActiveMetals`, { headers }),
                    fetch(`${adminPanelBackendPath}/Attributes/GetActiveDiamondSizes`, { headers }),
                    fetch(`${adminPanelBackendPath}/Attributes/GetActiveShapes`, { headers }),
                    fetch(`${adminPanelBackendPath}/Attributes/GetActiveClarities`, { headers }),
                    fetch(`${adminPanelBackendPath}/Attributes/GetActiveColors`, { headers }),
                    fetch(`${adminPanelBackendPath}/Attributes/GetActiveStones`, { headers }),
                    fetch(`${adminPanelBackendPath}/Attributes/GetActiveStyles`, { headers }),
                    fetch(`${adminPanelBackendPath}/Attributes/GetActiveCategories`, { headers }),
                    fetch(`${adminPanelBackendPath}/Attributes/GetActiveSubCategories`, { headers })
                ]);

                const [
                    metalsData,
                    diamondSizesData,
                    shapesData,
                    claritiesData,
                    colorsData,
                    stonesData,
                    stylesData,
                    categoriesData,
                    subCategoriesData
                ] = await Promise.all([
                    metalsRes.ok ? metalsRes.json() : [],
                    diamondSizesRes.ok ? diamondSizesRes.json() : [],
                    shapesRes.ok ? shapesRes.json() : [],
                    claritiesRes.ok ? claritiesRes.json() : [],
                    colorsRes.ok ? colorsRes.json() : [],
                    stonesRes.ok ? stonesRes.json() : [],
                    stylesRes.ok ? stylesRes.json() : [],
                    categoriesRes.ok ? categoriesRes.json() : [],
                    subCategoriesRes.ok ? subCategoriesRes.json() : []
                ]);

                const extractNames = (data, key) => {
                    if (!Array.isArray(data)) return [];
                    return data
                        .map(item => (typeof item === 'string' ? item : item?.[key] || item?.name || ''))
                        .filter(Boolean);
                };

                setAttributeOptionsMap({
                    metal: extractNames(metalsData, 'metalname'),
                    diamondsize: extractNames(diamondSizesData, 'diamondsize'),
                    shape: extractNames(shapesData, 'shapename'),
                    clarity: extractNames(claritiesData, 'clarityname'),
                    color: extractNames(colorsData, 'colorname'),
                    stone: extractNames(stonesData, 'stonename'),
                    style: extractNames(stylesData, 'stylename'),
                    category: extractNames(categoriesData, 'categoryname'),
                    subcategory: extractNames(subCategoriesData, 'subcategoryname')
                });
            } catch (err) {
                console.error("Error loading active attributes for menu:", err);
            }
        };

        fetchAttributeOptions();
    }, [adminPanelBackendPath, token]);

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
    const [col1Items, setCol1Items] = useState(() => normalizeItems(initialData?.column1?.items, "style"));

    // Column 2
    const [col2Title, setCol2Title] = useState(initialData?.column2?.title || "");
    const [col2BottomText, setCol2BottomText] = useState(initialData?.column2?.bottomText || "");
    const [col2BottomUrl, setCol2BottomUrl] = useState(initialData?.column2?.bottomUrl || "");
    const [col2Items, setCol2Items] = useState(() => normalizeItems(initialData?.column2?.items, "shape"));

    // Column 3
    const [col3Title, setCol3Title] = useState(initialData?.column3?.title || "");
    const [col3Items, setCol3Items] = useState(Array.isArray(initialData?.column3?.items) ? initialData.column3.items : []);

    // Banner
    const [bannerEyebrow, setBannerEyebrow] = useState(initialData?.banner?.eyebrow || "");
    const [bannerTitle, setBannerTitle] = useState(initialData?.banner?.title || "");
    const [bannerDescription, setBannerDescription] = useState(initialData?.banner?.description || "");
    const [bannerButtonText, setBannerButtonText] = useState(initialData?.banner?.buttonText || "");
    const [bannerButtonLink, setBannerButtonLink] = useState(initialData?.banner?.buttonLink || "");
    const [bannerImage] = useState(initialData?.banner?.image || "");
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(initialData?.banner?.image || Placeholder);

    // Bottom Bar
    const [bottomBarText, setBottomBarText] = useState(initialData?.bottomBar?.text || "");
    const [bottomBarLink, setBottomBarLink] = useState(initialData?.bottomBar?.link || "");

    useEffect(() => {
        const pageTitle = isEdit ? translations.editmenu : translations.addmenu;
        if (pageTitle) document.title = pageTitle;
    }, [isEdit, translations]);

    const handleTitleChange = (e) => {
        const val = e.target.value;
        setTitle(val);
        if (!isEdit && (!slug || slug === slugify(title))) {
            setSlug(slugify(val));
        }
    };

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
    const addCol1Item = () => setCol1Items([...col1Items, { label: "", slug: "", filterType: "style", filterValue: [] }]);
    const updateCol1Item = (index, field, val) => {
        const next = [...col1Items];
        next[index][field] = val;
        if (field === "label" && !next[index].slug) {
            next[index].slug = slugify(val);
        }
        setCol1Items(next);
    };
    const removeCol1Item = (index) => setCol1Items(col1Items.filter((_, i) => i !== index));

    const addCol2Item = () => setCol2Items([...col2Items, { label: "", slug: "", filterType: "shape", filterValue: [], shape: "" }]);
    const updateCol2Item = (index, field, val) => {
        const next = [...col2Items];
        next[index][field] = val;
        if (field === "label" && !next[index].slug) {
            next[index].slug = slugify(val);
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

    const sanitizeColItems = (items, defaultType) => {
        return items
            .filter(i => i.label?.trim())
            .map(i => {
                const cleanType = (i.filterType || defaultType).toLowerCase().replace(/[^a-z]/g, "") || defaultType;
                const vals = Array.isArray(i.filterValue)
                    ? i.filterValue
                    : (i.filterValue ? (i.filterValue.includes(",") ? i.filterValue.split(",").map(s => s.trim()).filter(Boolean) : [i.filterValue]) : []);
                return {
                    label: i.label.trim(),
                    slug: i.slug?.trim() ? (i.slug.startsWith("/") ? i.slug.trim() : "/" + i.slug.trim()) : slugify(i.label),
                    filterType: cleanType,
                    filterValue: vals,
                    shape: cleanType === "shape" ? (vals[0] || i.shape || "") : (i.shape || "")
                };
            });
    };

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

            const col1Obj = {
                title: col1Title.trim(),
                bottomText: col1BottomText.trim(),
                bottomUrl: col1BottomUrl.trim(),
                items: sanitizeColItems(col1Items, "style")
            };
            const col2Obj = {
                title: col2Title.trim(),
                bottomText: col2BottomText.trim(),
                bottomUrl: col2BottomUrl.trim(),
                items: sanitizeColItems(col2Items, "shape")
            };
            const col3Obj = {
                title: col3Title.trim(),
                items: col3Items
                    .filter(i => i.label?.trim())
                    .map(i => ({
                        label: i.label.trim(),
                        slug: i.slug?.trim() ? (i.slug.startsWith("/") ? i.slug.trim() : "/" + i.slug.trim()) : slugify(i.label),
                        badge: i.badge?.trim() || "",
                        filterType: i.filterType || "featured",
                        filterValue: i.filterValue || ""
                    }))
            };
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
                        message: isEdit
                            ? (translations.updatemenusuccessfull || "Menu updated successfully")
                            : (translations.addmenusuccessfull || "Menu added successfully")
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
                                                                onChange={handleTitleChange}
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
                                                                {translations.nodatafound || "No items added yet. Click '+ Add Item' below to create links."}
                                                            </div>
                                                        ) : (
                                                            col1Items.map((item, idx) => {
                                                                const currentAttrKey = (item.filterType || "style").toLowerCase().replace(/[^a-z]/g, "") || "style";
                                                                const optionsForType = attributeOptionsMap[currentAttrKey] || [];
                                                                const selectedValues = Array.isArray(item.filterValue)
                                                                    ? item.filterValue
                                                                    : (item.filterValue ? (item.filterValue.includes(",") ? item.filterValue.split(",").map(s => s.trim()).filter(Boolean) : [item.filterValue]) : []);

                                                                return (
                                                                    <div key={idx} className="repeater-row">
                                                                        <input
                                                                            type="text"
                                                                            placeholder={translations.itemlabel || "Label (e.g. Nature Inspired Rings)"}
                                                                            value={item.label}
                                                                            onChange={(e) => updateCol1Item(idx, "label", e.target.value)}
                                                                            style={{ flex: 1.2, minWidth: "150px" }}
                                                                        />
                                                                        <input
                                                                            type="text"
                                                                            placeholder={translations.cleanurl || "Clean URL (e.g. /nature-inspired-rings)"}
                                                                            value={item.slug}
                                                                            onChange={(e) => updateCol1Item(idx, "slug", e.target.value)}
                                                                            style={{ flex: 1.2, minWidth: "150px" }}
                                                                        />
                                                                        <select
                                                                            value={currentAttrKey}
                                                                            onChange={(e) => {
                                                                                const newType = e.target.value;
                                                                                updateCol1Item(idx, "filterType", newType);
                                                                                updateCol1Item(idx, "filterValue", []);
                                                                            }}
                                                                            style={{ flex: 0.9, minWidth: "130px", maxWidth: "160px" }}
                                                                        >
                                                                            {ATTRIBUTE_KEYS.map((attr) => (
                                                                                <option key={attr.key} value={attr.key}>
                                                                                    {attr.label}
                                                                                </option>
                                                                            ))}
                                                                        </select>
                                                                        <AttributeMultiSelect
                                                                            options={optionsForType}
                                                                            selected={selectedValues}
                                                                            onChange={(newVals) => updateCol1Item(idx, "filterValue", newVals)}
                                                                            placeholder={translations.selectattributedetails || "Select attribute details..."}
                                                                            attributeName={ATTRIBUTE_KEYS.find(a => a.key === currentAttrKey)?.label || "Attribute"}
                                                                            isRtl={isRtl}
                                                                            translations={translations}
                                                                        />
                                                                        <button
                                                                            type="button"
                                                                            className="btn-remove-row"
                                                                            onClick={() => removeCol1Item(idx)}
                                                                            title={translations.removeitem || "Remove Item"}
                                                                        >
                                                                            ✕
                                                                        </button>
                                                                    </div>
                                                                );
                                                            })
                                                        )}
                                                        <button type="button" className="btn-add-row" onClick={addCol1Item}>
                                                            + {translations.additem || "Add Item"}
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
                                                                {translations.nodatafound || "No shape items added yet. Click '+ Add Item' below."}
                                                            </div>
                                                        ) : (
                                                            col2Items.map((item, idx) => {
                                                                const currentAttrKey = (item.filterType || "shape").toLowerCase().replace(/[^a-z]/g, "") || "shape";
                                                                const optionsForType = attributeOptionsMap[currentAttrKey] || [];
                                                                const selectedValues = Array.isArray(item.filterValue)
                                                                    ? item.filterValue
                                                                    : (item.filterValue ? (item.filterValue.includes(",") ? item.filterValue.split(",").map(s => s.trim()).filter(Boolean) : [item.filterValue]) : (item.shape ? [item.shape] : []));

                                                                return (
                                                                    <div key={idx} className="repeater-row">
                                                                        <input
                                                                            type="text"
                                                                            placeholder={translations.itemlabel || "Label (e.g. Emerald Cut)"}
                                                                            value={item.label}
                                                                            onChange={(e) => updateCol2Item(idx, "label", e.target.value)}
                                                                            style={{ flex: 1.2, minWidth: "150px" }}
                                                                        />
                                                                        <input
                                                                            type="text"
                                                                            placeholder={translations.cleanurl || "Clean URL (e.g. /emerald-cut-diamonds)"}
                                                                            value={item.slug}
                                                                            onChange={(e) => updateCol2Item(idx, "slug", e.target.value)}
                                                                            style={{ flex: 1.2, minWidth: "150px" }}
                                                                        />
                                                                        <select
                                                                            value={currentAttrKey}
                                                                            onChange={(e) => {
                                                                                const newType = e.target.value;
                                                                                updateCol2Item(idx, "filterType", newType);
                                                                                updateCol2Item(idx, "filterValue", []);
                                                                            }}
                                                                            style={{ flex: 0.9, minWidth: "130px", maxWidth: "160px" }}
                                                                        >
                                                                            {ATTRIBUTE_KEYS.map((attr) => (
                                                                                <option key={attr.key} value={attr.key}>
                                                                                    {attr.label}
                                                                                </option>
                                                                            ))}
                                                                        </select>
                                                                        <AttributeMultiSelect
                                                                            options={optionsForType}
                                                                            selected={selectedValues}
                                                                            onChange={(newVals) => {
                                                                                updateCol2Item(idx, "filterValue", newVals);
                                                                                if (currentAttrKey === "shape") {
                                                                                    updateCol2Item(idx, "shape", newVals[0] || "");
                                                                                }
                                                                            }}
                                                                            placeholder={translations.selectattributedetails || "Select attribute details..."}
                                                                            attributeName={ATTRIBUTE_KEYS.find(a => a.key === currentAttrKey)?.label || "Attribute"}
                                                                            isRtl={isRtl}
                                                                            translations={translations}
                                                                        />
                                                                        <button
                                                                            type="button"
                                                                            className="btn-remove-row"
                                                                            onClick={() => removeCol2Item(idx)}
                                                                            title={translations.removeitem || "Remove Item"}
                                                                        >
                                                                            ✕
                                                                        </button>
                                                                    </div>
                                                                );
                                                            })
                                                        )}
                                                        <button type="button" className="btn-add-row" onClick={addCol2Item}>
                                                            + {translations.additem || "Add Item"}
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