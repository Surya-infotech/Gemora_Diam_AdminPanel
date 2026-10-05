import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../../Middleware/Auth';
import WarningModal from '../../../Pages/Custom/WarningModal';
import "../../../Scss/System/Currency/addcurrency.scss";
import { Country } from 'country-state-city';
import Dropdown from '../../Dropdown/Dropdown';
import CheckToken from '../../../utils/CheckToken';
import HandleUnauthorized from '../../../utils/HandleUnauthorized';
import { useLanguage } from '../../../Context/LanguageContext';

const AddCurrency = () => {
    const navigate = useNavigate();
    const { logoutUser } = useAuth();
    const { translations, isRtl } = useLanguage();
    const adminPanelBackendPath = import.meta.env.VITE_BACKEND_URL;
    const tokenname = import.meta.env.VITE_AdminTOKEN_NAME;
    const [warningMessage, setWarningMessage] = useState("");
    const [showWarning, setShowWarning] = useState(false);
    const token = localStorage.getItem(tokenname);
    const [countries, setCountries] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState("");
    const [currencyName, setCurrencyName] = useState("");
    const [currencySymbol, setCurrencySymbol] = useState("");
    const [currencyPosition, setCurrencyPosition] = useState("");
    const [decimalValue, setDecimalValue] = useState("");
    const [thousandSeparator, setThousandSeparator] = useState("");
    const [decimalSeparator, setDecimalSeparator] = useState("");

    useEffect(() => {
        if (translations.addcurrency) document.title = translations.addcurrency;
    }, [translations]);

    const currencyPositions = [
        { id: "left", name: translations.Left || "Left" },
        { id: "right", name: translations.Right || "Right" },
        { id: "left-space", name: translations["Left with space"] || "Left with space" },
        { id: "right-space", name: translations["Right with space"] || "Right with space" }
    ];

    useEffect(() => {
        if (!CheckToken(token, logoutUser, navigate)) return;

        const allCountries = Country.getAllCountries().map(country => ({
            isoCode: country.isoCode,
            name: country.name
        }));
        setCountries(allCountries);
    }, [adminPanelBackendPath, token, logoutUser, navigate]);

    const handleWarningClose = () => setShowWarning(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!CheckToken(token, logoutUser, navigate)) return;

        try {
            const selectedCountryName = countries.find((c) => c.isoCode === selectedCountry)?.name || "";
            const currencyData = {
                currencyName,
                currencySymbol,
                currencyPosition,
                decimalValue,
                thousandSeparator,
                decimalSeparator,
                countryname: selectedCountryName
            };
            const response = await fetch(`${adminPanelBackendPath}/System/AddCurrency`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(currencyData),
            });

            const data = await response.json();
            if (HandleUnauthorized(data, logoutUser, navigate, response)) return;

            if (response.ok) {
                navigate(`/System/Currency`, {
                    state: { message: translations.addcurrencysuccessfull || "Currency added successfully" }
                });
            } else {
                const errorMessages = {
                    "Country Name Already Exists": translations.countrynamealreadyexists,
                    "All fields are required": translations.allfieldrequired,
                    "Server error": translations.servererror
                };
                setWarningMessage(errorMessages[data.message] || data.message || translations.servererror || "Failed to add currency");
                setShowWarning(true);
            }
        } catch {
            setWarningMessage(translations.servererror || "Server error");
            setShowWarning(true);
        }
    };

    const handleCancel = () => navigate(`/System/Currency`);

    return (
        <>
            {showWarning && <WarningModal message={warningMessage} onClose={handleWarningClose} />}
            <div className={`AddCurrency-container ${isRtl ? 'rtl-addcurrency' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
                <div className="Addcurrency-container">
                    <h6 className="Addcurrency-headingname">{translations.addcurrency || "Add Currency"}</h6>
                    <div className="Addcurrency-form-container">
                        <form onSubmit={handleSubmit}>
                            <div className="form-row">
                                <div className="form-group">
                                    <Dropdown
                                        label={translations.CountryName || "Country Name"}
                                        options={countries}
                                        labelKey="name"
                                        valueKey="isoCode"
                                        selectedValue={selectedCountry}
                                        onValueChange={(value) => setSelectedCountry(value)}
                                        placeholder={translations.selectcountryname || "Select Country"}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="currencyName">{translations.currencyname || "Currency Name"}</label>
                                    <input
                                        type="text"
                                        id="currencyName"
                                        placeholder={translations.entercurrencyname || "Enter Currency Name"}
                                        required
                                        autoComplete="off"
                                        value={currencyName}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (value.length === 1 && value === " ") return;
                                            setCurrencyName(value);
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="currencySymbol">{translations.currencysymbol || "Currency Symbol"}</label>
                                    <input
                                        type="text"
                                        id="currencySymbol"
                                        placeholder={translations.entercurrencysymbol || "Enter Currency Symbol"}
                                        required
                                        autoComplete="off"
                                        value={currencySymbol}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (value.length === 1 && value === " ") return;
                                            setCurrencySymbol(value);
                                        }}
                                    />
                                </div>
                                <div className="form-group">
                                    <Dropdown
                                        label={translations.CurrencyPosition || "Currency Position"}
                                        options={currencyPositions}
                                        labelKey="name"
                                        valueKey="id"
                                        selectedValue={currencyPosition}
                                        onValueChange={(value) => setCurrencyPosition(value)}
                                        placeholder={translations.selectcurrencyposition || "Select Currency Position"}
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="decimalValue">{translations.decimalplaces || "Decimal Places"}</label>
                                    <input
                                        type="number"
                                        id="decimalValue"
                                        placeholder={translations.enterdecimalplaces || "Enter Decimal Places"}
                                        min="0"
                                        max="10"
                                        required
                                        autoComplete="off"
                                        value={decimalValue}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (/^\d*$/.test(value)) { setDecimalValue(value); }
                                        }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="thousandSeparator">{translations.ThousandSeparator || "Thousand Separator"}</label>
                                    <input
                                        type="text"
                                        id="thousandSeparator"
                                        placeholder={translations.enterthousandseparator || "Enter Thousand Separator"}
                                        required
                                        maxLength="1"
                                        autoComplete="off"
                                        value={thousandSeparator}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (value.length === 1 && value === " ") return;
                                            setThousandSeparator(value);
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="decimalSeparator">{translations.DecimalSeparator || "Decimal Separator"}</label>
                                    <input
                                        type="text"
                                        id="decimalSeparator"
                                        placeholder={translations.enterdecimalseparator || "Enter Decimal Separator"}
                                        required
                                        maxLength="1"
                                        autoComplete="off"
                                        value={decimalSeparator}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (value.length === 1 && value === " ") return;
                                            setDecimalSeparator(value);
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="button-group">
                                <button type="button" className="btn btn-secondary cancelbtn" onClick={handleCancel}>
                                    {translations.cancel || "Cancel"}
                                </button>
                                <button type="submit" className="btn btn-success submit-btn">
                                    {translations.save || "Save"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AddCurrency;
