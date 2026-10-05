import CustomSwitch from '../../../Pages/Custom/CustomSwitch';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "../../../Context/LanguageContext";
import { useAuth } from '../../../Middleware/Auth';
import LoadingSpinner from '../../../Pages/Custom/LoadingSpinner';
import WarningModal from '../../../Pages/Custom/WarningModal';
import "../../../Scss/System/Tax/addtax.scss";
import CheckToken from '../../../utils/CheckToken';
import HandleUnauthorized from '../../../utils/HandleUnauthorized';
import { Country } from 'country-state-city';
import Dropdown from '../../Dropdown/Dropdown';

const EditTax = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { logoutUser } = useAuth();
    const { translations } = useLanguage();
    const adminPanelBackendPath = import.meta.env.VITE_BACKEND_URL;
    const tokenName = import.meta.env.VITE_AdminTOKEN_NAME;
    const token = localStorage.getItem(tokenName);
    const [warningMessage, setWarningMessage] = useState("");
    const [showWarning, setShowWarning] = useState(false);
    const [formData, setFormData] = useState({ taxname: "", taxtype: "fixed", price: "", taxcomputation: "exclusive", country: "" });
    const [status, setStatus] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [countries, setCountries] = useState([]);

    useEffect(() => {
        if (translations.edittax) document.title = translations.edittax;
    }, [translations]);

    useEffect(() => {
        const allCountries = Country.getAllCountries().map(country => ({
            value: country.name,
            label: country.name
        }));
        setCountries(allCountries);
    }, []);

    const handleCountryChange = (val) => {
        setFormData(prev => ({ ...prev, country: val }));
    };

    useEffect(() => {
        setIsLoading(true);
        if (!CheckToken(token, logoutUser, navigate)) return;
        const fetchTaxDetails = async () => {
            try {
                const response = await fetch(`${adminPanelBackendPath}/System/EditTax/${id}`, {
                    method: "GET",
                    headers: { Authorization: `Bearer ${token}` }
                });

                const result = await response.json();
                if (HandleUnauthorized(result, logoutUser, navigate)) return;
                if (response.ok) {
                    setFormData({
                        taxname: result.taxname || "",
                        taxtype: result.taxtype || "fixed",
                        price: result.price ?? "",
                        taxcomputation: result.taxcomputation || "exclusive",
                        country: result.country || ""
                    });
                    setStatus(result.status || false);
                } else {
                    const errorMessages = {
                        "Tax not found": translations.taxnotfound,
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

        fetchTaxDetails();
    }, [id, token, navigate, logoutUser, adminPanelBackendPath, translations]);

    const handleSwitchChange = (event) => setStatus(event.target.checked);

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === "price") {
            let newValue = value.replace(/^\s+/, "");
            if (formData.taxtype === "percentage" && parseFloat(newValue) > 99) newValue = "";
            setFormData({ ...formData, [name]: newValue });
        } else setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.country) {
            setWarningMessage(translations.allfieldrequired);
            setShowWarning(true);
            return;
        }
        setIsLoading(true);
        if (!CheckToken(token, logoutUser, navigate)) return;
        try {
            const response = await fetch(`${adminPanelBackendPath}/System/UpdateTax/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ ...formData, status: status }),
            });

            const result = await response.json();
            if (HandleUnauthorized(result, logoutUser, navigate)) return;
            if (response.ok) navigate(`/System/Taxes`, { state: { message: translations.updatetaxsuccessfull } });
            else {
                const errorMessages = {
                    "All fields are required": translations.allfieldrequired,
                    "Tax Name Already Exists": translations.taxnamealreadyexists,
                    "Tax not found": translations.taxnotfound,
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

    const handleCancel = () => navigate(`/System/Taxes`);

    return (
        <>
            {showWarning && <WarningModal message={warningMessage} onClose={() => setShowWarning(false)} />}
            <div className="AddTax-container">
                <div className="Addtax-container">
                    <h6 className="Addtax-headingname">{translations.edittax}</h6>
                    <div className="Addtax-form-container">
                        {isLoading ? (
                            <LoadingSpinner />
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="taxname">{translations.taxname} <span style={{ color: "red" }}>*</span></label>
                                        <input
                                            type="text"
                                            id="taxname"
                                            name="taxname"
                                            autoComplete="off"
                                            placeholder={translations.taxnameplaceholder}
                                            required
                                            value={formData.taxname}
                                            onChange={handleInputChange}
                                            onInput={(e) => (e.target.value = e.target.value.replace(/^\s+/, ""))}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <Dropdown
                                            label={<>{translations.Country} <span style={{ color: "red" }}>*</span></>}
                                            options={countries}
                                            selectedValue={formData.country}
                                            onValueChange={handleCountryChange}
                                            labelKey="label"
                                            valueKey="value"
                                            placeholder={translations.countryselect}
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>{translations.taxtype}</label>
                                        <div className="radio-group">
                                            <label className="radio-label">
                                                <input
                                                    type="radio"
                                                    name="taxtype"
                                                    value="fixed"
                                                    checked={formData.taxtype === "fixed"}
                                                    onChange={handleInputChange}
                                                />
                                                {translations.fixed}
                                            </label>
                                            <label className="radio-label">
                                                <input
                                                    type="radio"
                                                    name="taxtype"
                                                    value="percentage"
                                                    checked={formData.taxtype === "percentage"}
                                                    onChange={handleInputChange}
                                                />
                                                {translations.percentage}
                                            </label>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>{translations.taxcomputation}</label>
                                        <div className="radio-group">
                                            <label className="radio-label">
                                                <input
                                                    type="radio"
                                                    name="taxcomputation"
                                                    value="exclusive"
                                                    checked={formData.taxcomputation === "exclusive"}
                                                    onChange={handleInputChange}
                                                />
                                                {translations.exclusive}
                                            </label>
                                            <label className="radio-label">
                                                <input
                                                    type="radio"
                                                    name="taxcomputation"
                                                    value="inclusive"
                                                    checked={formData.taxcomputation === "inclusive"}
                                                    onChange={handleInputChange}
                                                />
                                                {translations.inclusive}
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="price">
                                            {translations.price} {formData.taxtype === "percentage" && <span className="percentage-sign"> (%)</span>}
                                        </label>
                                        <input
                                            type="number"
                                            id="price"
                                            name="price"
                                            autoComplete="off"
                                            placeholder={translations.priceplaceholder}
                                            required
                                            value={formData.price}
                                            onChange={handleInputChange}
                                            onInput={(e) => (e.target.value = e.target.value.replace(/^\s+/, ""))}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="status">{translations.status}</label>
                                        <CustomSwitch checked={status} onChange={handleSwitchChange} />
                                    </div>
                                </div>
                                <div className="button-group">
                                    <button type="button" className="btn btn-secondary cancelbtn" onClick={handleCancel} disabled={isLoading}>{translations.cancel}</button>
                                    <button type="submit" className="btn btn-success submit-btn" disabled={isLoading}>{translations.save}</button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default EditTax;
