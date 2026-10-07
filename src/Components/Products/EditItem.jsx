import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import Placeholder from '../../assets/placeholder.png';
import { useAuth } from '../../Middleware/Auth';
import LoadingSpinner from '../../Pages/Custom/LoadingSpinner';
import WarningModal from '../../Pages/Custom/WarningModal';
import Dropdown from '../Dropdown/Dropdown';
import MultiDropdown from '../Dropdown/MultiDropdown';
import "../../Scss/Products/additem.scss";
import { useLanguage } from "../../Context/LanguageContext";
import CheckToken from '../../utils/CheckToken';
import HandleUnauthorized from '../../utils/HandleUnauthorized';

const EditItem = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const { translations, isRtl } = useLanguage();
    const { logoutUser } = useAuth();
    const adminPanelBackendPath = import.meta.env.VITE_BACKEND_URL;
    const tokenname = import.meta.env.VITE_AdminTOKEN_NAME;
    const token = localStorage.getItem(tokenname);

    const [warningMessage, setWarningMessage] = useState("");
    const [showWarning, setShowWarning] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [sku, setSku] = useState("");
    const [itemName, setItemName] = useState("");
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [subCategories, setSubCategories] = useState([]);
    const [selectedSubCategory, setSelectedSubCategory] = useState(null);
    const [ringSizes, setRingSizes] = useState([]);
    const [selectedRingSizes, setSelectedRingSizes] = useState([]);
    const [shapes, setShapes] = useState([]);
    const [selectedShapes, setSelectedShapes] = useState([]);
    const [clarities, setClarities] = useState([]);
    const [selectedClarities, setSelectedClarities] = useState([]);
    const [stones, setStones] = useState([]);
    const [selectedStones, setSelectedStones] = useState([]);
    const [styles, setStyles] = useState([]);
    const [selectedStyles, setSelectedStyles] = useState([]);
    const [diamondColors, setDiamondColors] = useState([]);
    const [selectedDiamondColors, setSelectedDiamondColors] = useState([]);
    const [bandColors, setBandColors] = useState([]);
    const [selectedBandColors, setSelectedBandColors] = useState([]);
    const [description, setDescription] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(Placeholder);

    useEffect(() => {
        if (translations.edititem) document.title = translations.edititem;
    }, [translations]);

    // Fetch active categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch(`${adminPanelBackendPath}/Attributes/GetActiveCategories`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" }
                });
                const data = await response.json();
                if (response.ok && Array.isArray(data)) {
                    setCategories(data);
                }
            } catch (err) {
                console.error("Error loading categories:", err);
            }
        };

        fetchCategories();
    }, [adminPanelBackendPath]);

    // Fetch active subcategories for dropdown
    useEffect(() => {
        const fetchSubCategories = async () => {
            try {
                const response = await fetch(`${adminPanelBackendPath}/Attributes/GetActiveSubCategories`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" }
                });
                const data = await response.json();
                if (response.ok && Array.isArray(data)) {
                    setSubCategories(data);
                }
            } catch (err) {
                console.error("Error loading subcategories:", err);
            }
        };

        fetchSubCategories();
    }, [adminPanelBackendPath]);

    const filteredSubCategories = selectedCategory != null
        ? subCategories.filter(sc => Number(sc.categoryid) === Number(selectedCategory))
        : [];

    // Fetch active ring sizes for dropdown
    useEffect(() => {
        const fetchRingSizes = async () => {
            try {
                const response = await fetch(`${adminPanelBackendPath}/Attributes/GetActiveRingSizes`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" }
                });
                const data = await response.json();
                if (response.ok && Array.isArray(data)) {
                    setRingSizes(data);
                }
            } catch (err) {
                console.error("Error loading ring sizes:", err);
            }
        };

        fetchRingSizes();
    }, [adminPanelBackendPath]);

    const ringSizeOptions = ringSizes.map(r => ({
        ringsizeid: r.ringsizeid,
        ringsize: r.ringsize,
        label: r.ringsize,
        value: r.ringsizeid
    }));

    // Fetch active shapes for dropdown
    useEffect(() => {
        const fetchShapes = async () => {
            try {
                const response = await fetch(`${adminPanelBackendPath}/Attributes/GetActiveShapes`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" }
                });
                const data = await response.json();
                if (response.ok && Array.isArray(data)) {
                    setShapes(data);
                }
            } catch (err) {
                console.error("Error loading shapes:", err);
            }
        };

        fetchShapes();
    }, [adminPanelBackendPath]);

    const shapeOptions = shapes.map(s => ({
        shapeid: s.shapeid,
        shapename: s.shapename,
        label: s.shapename,
        value: s.shapeid
    }));

    // Fetch active clarities for dropdown
    useEffect(() => {
        const fetchClarities = async () => {
            try {
                const response = await fetch(`${adminPanelBackendPath}/Attributes/GetActiveClarities`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" }
                });
                const data = await response.json();
                if (response.ok && Array.isArray(data)) {
                    setClarities(data);
                }
            } catch (err) {
                console.error("Error loading clarities:", err);
            }
        };

        fetchClarities();
    }, [adminPanelBackendPath]);

    const clarityOptions = clarities.map(c => ({
        clarityid: c.clarityid,
        clarityname: c.clarityname,
        label: c.clarityname,
        value: c.clarityid
    }));

    // Fetch active stones for dropdown
    useEffect(() => {
        const fetchStones = async () => {
            try {
                const response = await fetch(`${adminPanelBackendPath}/Attributes/GetActiveStones`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" }
                });
                const data = await response.json();
                if (response.ok && Array.isArray(data)) {
                    setStones(data);
                }
            } catch (err) {
                console.error("Error loading stones:", err);
            }
        };

        fetchStones();
    }, [adminPanelBackendPath]);

    const stoneOptions = stones.map(s => ({
        stoneid: s.stoneid,
        stonename: s.stonename,
        label: s.stonename,
        value: s.stoneid
    }));

    // Fetch active styles for dropdown
    useEffect(() => {
        const fetchStyles = async () => {
            try {
                const response = await fetch(`${adminPanelBackendPath}/Attributes/GetActiveStyles`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" }
                });
                const data = await response.json();
                if (response.ok && Array.isArray(data)) {
                    setStyles(data);
                }
            } catch (err) {
                console.error("Error loading styles:", err);
            }
        };

        fetchStyles();
    }, [adminPanelBackendPath]);

    const styleOptions = styles.map(st => ({
        styleid: st.styleid,
        stylename: st.stylename,
        label: st.stylename,
        value: st.styleid
    }));

    // Fetch active colors for dropdowns (Diamond Color and Band Color)
    useEffect(() => {
        const fetchColors = async () => {
            try {
                const response = await fetch(`${adminPanelBackendPath}/Attributes/GetActiveColors`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" }
                });
                const data = await response.json();
                if (response.ok && Array.isArray(data)) {
                    setDiamondColors(data.filter(c => c.colortype === "Diamond"));
                    setBandColors(data.filter(c => c.colortype === "Band"));
                }
            } catch (err) {
                console.error("Error loading colors:", err);
            }
        };

        fetchColors();
    }, [adminPanelBackendPath]);

    const diamondColorOptions = diamondColors.map(c => ({
        colorid: c.colorid,
        colorname: c.colorname,
        label: c.colorname,
        value: c.colorid
    }));

    const bandColorOptions = bandColors.map(c => ({
        colorid: c.colorid,
        colorname: c.colorname,
        label: c.colorname,
        value: c.colorid
    }));

    // Fetch item details
    useEffect(() => {
        const fetchDetails = async () => {
            setIsLoading(true);
            if (!CheckToken(token, logoutUser, navigate)) {
                setIsLoading(false);
                return;
            }

            try {
                const response = await fetch(`${adminPanelBackendPath}/Products/EditItem/${id}`, {
                    method: "GET",
                    headers: { Authorization: `Bearer ${token}` }
                });

                const result = await response.json();
                if (HandleUnauthorized(result, logoutUser, navigate)) return;

                if (response.ok) {
                    setSku(result.sku || "");
                    setItemName(result.itemname || "");
                    setSelectedCategory(result.categoryid != null ? result.categoryid : null);
                    setSelectedSubCategory(result.subcategoryid != null ? result.subcategoryid : null);
                    if (result.ringsizes && Array.isArray(result.ringsizes)) {
                        setSelectedRingSizes(result.ringsizes.map(r => ({
                            ringsizeid: r.ringsizeid,
                            ringsize: r.ringsize,
                            label: r.ringsize,
                            value: r.ringsizeid
                        })));
                    } else {
                        setSelectedRingSizes([]);
                    }
                    if (result.shapes && Array.isArray(result.shapes)) {
                        setSelectedShapes(result.shapes.map(s => ({
                            shapeid: s.shapeid,
                            shapename: s.shapename,
                            label: s.shapename,
                            value: s.shapeid
                        })));
                    } else {
                        setSelectedShapes([]);
                    }
                    if (result.clarities && Array.isArray(result.clarities)) {
                        setSelectedClarities(result.clarities.map(c => ({
                            clarityid: c.clarityid,
                            clarityname: c.clarityname,
                            label: c.clarityname,
                            value: c.clarityid
                        })));
                    } else {
                        setSelectedClarities([]);
                    }
                    if (result.stones && Array.isArray(result.stones)) {
                        setSelectedStones(result.stones.map(s => ({
                            stoneid: s.stoneid,
                            stonename: s.stonename,
                            label: s.stonename,
                            value: s.stoneid
                        })));
                    } else {
                        setSelectedStones([]);
                    }
                    if (result.styles && Array.isArray(result.styles)) {
                        setSelectedStyles(result.styles.map(st => ({
                            styleid: st.styleid,
                            stylename: st.stylename,
                            label: st.stylename,
                            value: st.styleid
                        })));
                    } else {
                        setSelectedStyles([]);
                    }
                    if (result.diamondcolors && Array.isArray(result.diamondcolors)) {
                        setSelectedDiamondColors(result.diamondcolors.map(dc => ({
                            colorid: dc.colorid,
                            colorname: dc.colorname,
                            label: dc.colorname,
                            value: dc.colorid
                        })));
                    } else {
                        setSelectedDiamondColors([]);
                    }
                    if (result.bandcolors && Array.isArray(result.bandcolors)) {
                        setSelectedBandColors(result.bandcolors.map(bc => ({
                            colorid: bc.colorid,
                            colorname: bc.colorname,
                            label: bc.colorname,
                            value: bc.colorid
                        })));
                    } else {
                        setSelectedBandColors([]);
                    }
                    setDescription(result.description || "");
                    if (result.image) {
                        setImagePreview(result.image);
                    } else {
                        setImagePreview(Placeholder);
                    }
                } else {
                    const errorMessages = {
                        "Item not found": translations.itemnotfound,
                        "Server error": translations.servererror
                    };
                    setWarningMessage(errorMessages[result.message] || translations.servererror);
                    setShowWarning(true);
                }
            } catch {
                setWarningMessage(translations.servererror);
                setShowWarning(true);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDetails();
    }, [id, token, adminPanelBackendPath, logoutUser, navigate, translations]);

    const handleUploadClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
            const allowedExtensions = ['jpg', 'jpeg', 'png'];
            const fileExtension = file.name.split('.').pop().toLowerCase();

            if (!allowedExtensions.includes(fileExtension)) {
                setWarningMessage(translations.invalidfileextension);
                setShowWarning(true);
                e.target.value = '';
                return;
            }

            const maxSize = 10 * 1024 * 1024;
            if (file.size > maxSize) {
                setWarningMessage(translations.filesizetoolarge);
                setShowWarning(true);
                e.target.value = '';
                return;
            }

            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!sku.trim()) {
            setWarningMessage(translations.skurequired);
            setShowWarning(true);
            return;
        }

        if (!itemName.trim()) {
            setWarningMessage(translations.itemnamerequired);
            setShowWarning(true);
            return;
        }

        if (!selectedCategory) {
            setWarningMessage(translations.categoryrequired);
            setShowWarning(true);
            return;
        }

        if (!imageFile && (!imagePreview || imagePreview === Placeholder)) {
            setWarningMessage(translations.imagerequired);
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
            formData.append("sku", sku.trim());
            formData.append("itemname", itemName.trim());
            formData.append("categoryid", selectedCategory);
            if (selectedSubCategory) {
                formData.append("subcategoryid", selectedSubCategory);
            } else {
                formData.append("subcategoryid", "");
            }
            formData.append("ringsizes", JSON.stringify(selectedRingSizes));
            formData.append("shapes", JSON.stringify(selectedShapes));
            formData.append("clarities", JSON.stringify(selectedClarities));
            formData.append("diamondcolors", JSON.stringify(selectedDiamondColors));
            formData.append("bandcolors", JSON.stringify(selectedBandColors));
            formData.append("stones", JSON.stringify(selectedStones));
            formData.append("styles", JSON.stringify(selectedStyles));
            formData.append("description", description.trim());
            if (imageFile) {
                formData.append("image", imageFile);
            }

            const response = await fetch(`${adminPanelBackendPath}/Products/UpdateItem/${id}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData,
            });

            const result = await response.json();
            if (HandleUnauthorized(result, logoutUser, navigate)) return;

            if (response.ok) {
                navigate("/Products/Item", {
                    state: { message: translations.updateitemsuccessfull }
                });
            } else {
                const errorMessages = {
                    "SKU is required": translations.skurequired,
                    "SKU Already Exists": translations.skualreadyexists,
                    "Item Name is required": translations.itemnamerequired,
                    "Category is required": translations.categoryrequired,
                    "Image is required": translations.imagerequired,
                    "Item Already Exists": translations.itemalreadyexists,
                    "Item not found": translations.itemnotfound,
                    "Server error": translations.servererror
                };
                setWarningMessage(errorMessages[result.message] || result.message || translations.servererror);
                setShowWarning(true);
            }
        } catch {
            setWarningMessage(translations.servererror);
            setShowWarning(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => navigate(`/Products/Item`);

    return (
        <>
            {showWarning && <WarningModal message={warningMessage} onClose={() => setShowWarning(false)} />}
            <div className={`AddItem-container ${isRtl ? 'rtl-additem' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
                <div className="Additem-container">
                    <h6 className="Additem-headingname">{translations.edititem}</h6>
                    <div className="Additem-form-container">
                        {isLoading ? (
                            <LoadingSpinner />
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <div className="imageflex">
                                    <div className="formdiv">
                                        <div className="form-group">
                                            <label htmlFor="sku">
                                                {translations.sku} <span style={{ color: "red" }}>*</span>
                                            </label>
                                            <input
                                                type="text"
                                                id="sku"
                                                name="sku"
                                                autoComplete="off"
                                                placeholder={translations.entersku}
                                                autoFocus
                                                required
                                                value={sku}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    if (value.length === 1 && value === " ") return;
                                                    setSku(value);
                                                }}
                                                onInput={(e) => (e.target.value = e.target.value.replace(/^\s+/, ""))}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="itemname">
                                                {translations.itemname} <span style={{ color: "red" }}>*</span>
                                            </label>
                                            <input
                                                type="text"
                                                id="itemname"
                                                name="itemname"
                                                autoComplete="off"
                                                placeholder={translations.enteritemname}
                                                required
                                                value={itemName}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    if (value.length === 1 && value === " ") return;
                                                    setItemName(value);
                                                }}
                                                onInput={(e) => (e.target.value = e.target.value.replace(/^\s+/, ""))}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="description">
                                                {translations.description}
                                            </label>
                                            <textarea
                                                id="description"
                                                name="description"
                                                rows="1"
                                                placeholder={translations.enterdescription}
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="imagediv">
                                        <div className="form-group">
                                            <div className="imgpreview">
                                                {imagePreview && (
                                                    <div className="image-preview-container">
                                                        <img
                                                            src={imagePreview}
                                                            alt={translations.itempreview}
                                                            className="image-preview"
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.src = Placeholder;
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                                <button
                                                    type="button"
                                                    className="btn btn-primary upload-btn"
                                                    onClick={handleUploadClick}
                                                >
                                                    {translations.upload}
                                                </button>
                                                <input
                                                    type="file"
                                                    id="itemimage"
                                                    name="image"
                                                    accept="image/*"
                                                    ref={fileInputRef}
                                                    onChange={handleImageChange}
                                                    style={{ display: "none" }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>
                                            {translations.Category} <span style={{ color: "red" }}>*</span>
                                        </label>
                                        <Dropdown
                                            options={categories}
                                            labelKey="categoryname"
                                            valueKey="categoryid"
                                            selectedValue={selectedCategory}
                                            onValueChange={(val) => {
                                                setSelectedCategory(val);
                                                setSelectedSubCategory(null);
                                            }}
                                            placeholder={translations.selectcategory}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>
                                            {translations.SubCategory || translations.subcategory}
                                        </label>
                                        <Dropdown
                                            options={filteredSubCategories}
                                            labelKey="subcategoryname"
                                            valueKey="subcategoryid"
                                            selectedValue={selectedSubCategory}
                                            onValueChange={(val) => setSelectedSubCategory(val)}
                                            placeholder={translations.selectsubcategory}
                                            disabled={!selectedCategory || filteredSubCategories.length === 0}
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>
                                            {translations.RingSize || translations.ringsize}
                                        </label>
                                        <MultiDropdown
                                            options={ringSizeOptions}
                                            labelKey="label"
                                            valueKey="value"
                                            selectedValue={selectedRingSizes}
                                            onValueChange={(val) => setSelectedRingSizes(val)}
                                            placeholder={translations.selectringsize}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>
                                            {translations.Shape || translations.shape}
                                        </label>
                                        <MultiDropdown
                                            options={shapeOptions}
                                            labelKey="label"
                                            valueKey="value"
                                            selectedValue={selectedShapes}
                                            onValueChange={(val) => setSelectedShapes(val)}
                                            placeholder={translations.selectshape}
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>
                                            {translations.Clarity || translations.clarity}
                                        </label>
                                        <MultiDropdown
                                            options={clarityOptions}
                                            labelKey="label"
                                            valueKey="value"
                                            selectedValue={selectedClarities}
                                            onValueChange={(val) => setSelectedClarities(val)}
                                            placeholder={translations.selectclarity}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>
                                            {translations.Stone || translations.stone}
                                        </label>
                                        <MultiDropdown
                                            options={stoneOptions}
                                            labelKey="label"
                                            valueKey="value"
                                            selectedValue={selectedStones}
                                            onValueChange={(val) => setSelectedStones(val)}
                                            placeholder={translations.selectstone}
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>
                                            {translations.Style || translations.style}
                                        </label>
                                        <MultiDropdown
                                            options={styleOptions}
                                            labelKey="label"
                                            valueKey="value"
                                            selectedValue={selectedStyles}
                                            onValueChange={(val) => setSelectedStyles(val)}
                                            placeholder={translations.selectstyle}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>
                                            {translations.DiamondColor || translations.diamondcolor}
                                        </label>
                                        <MultiDropdown
                                            options={diamondColorOptions}
                                            labelKey="label"
                                            valueKey="value"
                                            selectedValue={selectedDiamondColors}
                                            onValueChange={(val) => setSelectedDiamondColors(val)}
                                            placeholder={translations.selectdiamondcolor}
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>
                                            {translations.BandColor || translations.bandcolor}
                                        </label>
                                        <MultiDropdown
                                            options={bandColorOptions}
                                            labelKey="label"
                                            valueKey="value"
                                            selectedValue={selectedBandColors}
                                            onValueChange={(val) => setSelectedBandColors(val)}
                                            placeholder={translations.selectbandcolor}
                                        />
                                    </div>
                                </div>

                                <div className="button-group">
                                    <button
                                        type="button"
                                        className="btn btn-secondary cancelbtn"
                                        onClick={handleCancel}
                                        disabled={isLoading}
                                    >
                                        {translations.cancel}
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary submit-btn"
                                        disabled={isLoading}
                                    >
                                        {translations.save}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default EditItem;
