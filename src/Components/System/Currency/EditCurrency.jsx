import CustomSwitch from '../../../Pages/Custom/CustomSwitch';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from '../../../Middleware/Auth';
import WarningModal from '../../../Pages/Custom/WarningModal';
import { Country } from 'country-state-city';
import Dropdown from '../../Dropdown/Dropdown';
import CheckToken from '../../../utils/CheckToken';
import HandleUnauthorized from '../../../utils/HandleUnauthorized';
import { useLanguage } from '../../../Context/LanguageContext';
import "../../../Scss/System/Currency/addcurrency.scss";

const EditCurrency = () => {
    const navigate = useNavigate();
    const { logoutUser } = useAuth();
    const { translations, isRtl } = useLanguage();
    const adminPanelBackendPath = import.meta.env.VITE_BACKEND_URL;
    const tokenname = import.meta.env.VITE_AdminTOKEN_NAME;
    const [warningMessage, setWarningMessage] = useState("");
    const [showWarning, setShowWarning] = useState(false);
    const token = localStorage.getItem(tokenname);
    const { id } = useParams();
    const [countries, setCountries] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState("");
    const [currencyName, setCurrencyName] = useState("");
    const [currencySymbol, setCurrencySymbol] = useState("");
    const [status, setStatus] = useState(false);
    const [currencyPosition, setCurrencyPosition] = useState("");
    const [decimalValue, setDecimalValue] = useState("");
    const [thousandSeparator, setThousandSeparator] = useState("");
    const [decimalSeparator, setDecimalSeparator] = useState("");

    useEffect(() => {
        if (translations.editcurrency) document.title = translations.editcurrency;
    }, [translations]);

    const currencyPositions = [
        { id: "left", name: translations.Left },
        { id: "right", name: translations.Right },
        { id: "left-space", name: translations["Left with space"] },
        { id: "right-space", name: translations["Right with space"] }
    ];

    useEffect(() => {
        if (!CheckToken(token, logoutUser, navigate)) return;

        const fetchCurrencyDetails = async () => {
            try {
                const response = await fetch(`${adminPanelBackendPath}/System/EditCurrency/${id}`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });
                const data = await response.json();
                if (HandleUnauthorized(data, logoutUser, navigate, response)) return;

                if (response.ok && data) {
                    const match = Country.getAllCountries().find(c => c.name === (data.countryname || ""));
                    setSelectedCountry(match ? match.isoCode : "");
                    setCurrencyName(data.currency || "");
                    setCurrencySymbol(data.currencysymbol || "");
                    setStatus(data.status || false);
                    setCurrencyPosition(data.currencyposition || "before");
                    setDecimalValue(data.decimal !== undefined ? data.decimal : 2);
                    setThousandSeparator(data.thousandseparator || ",");
                    setDecimalSeparator(data.decimalseparator || ".");
                } else {
                    const errorMessages = {
                        "Currency not found": translations.currencynotfound,
                        "Server error": translations.servererror
                    };
                    setWarningMessage(errorMessages[data.message] || data.message || translations.servererror);
                    setShowWarning(true);
                }
            } catch {
                setWarningMessage(translations.servererror);
                setShowWarning(true);
            }
        };

        const allCountries = Country.getAllCountries().map(country => ({
            isoCode: country.isoCode,
            name: country.name
        }));
        setCountries(allCountries);

        fetchCurrencyDetails();
    }, [adminPanelBackendPath, token, id, logoutUser, navigate, translations]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!CheckToken(token, logoutUser, navigate)) return;

        try {
            const selectedCountryName = countries.find((c) => c.isoCode === selectedCountry)?.name || "";
            const currencyData = {
                currencyName,
                currencySymbol,
                currencyPosition,
                status,
                decimalValue,
                thousandSeparator,
                decimalSeparator,
                countryname: selectedCountryName
            };
            const response = await fetch(`${adminPanelBackendPath}/System/UpdateCurrency/${id}`, {
                method: "PUT",
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
                    state: { message: "Currency Updated Successfully!" }
                });
            } else {
                const errorMessages = {
                    "Country Name Already Exists": translations.countrynamealreadyexists,
                    "All fields are required": translations.allfieldrequired,
                    "Currency not found": translations.currencynotfound,
                    "Server error": translations.servererror
                };
                setWarningMessage(errorMessages[data.message] || data.message || translations.servererror);
                setShowWarning(true);
            }
        } catch {
            setWarningMessage(translations.servererror);
            setShowWarning(true);
        }
    };

    const handleSwitchChange = (event) => setStatus(event.target.checked);
    const handleWarningClose = () => setShowWarning(false);
    const handleCancel = () => navigate(`/System/Currency`);

    return (
        <>
            {showWarning && <WarningModal message={warningMessage} onClose={handleWarningClose} />}
            <div className={`AddCurrency-container ${isRtl ? 'rtl-addcurrency' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
                <div className="Addcurrency-container">
                    <h6 className="Addcurrency-headingname">{translations.editcurrency}</h6>
                    <div className="Addcurrency-form-container">
                        <form onSubmit={handleSubmit}>
                            <div className="form-row">
                                <div className="form-group">
                                    <Dropdown
                                        label={translations.CountryName}
                                        options={countries}
                                        labelKey="name"
                                        valueKey="isoCode"
                                        selectedValue={selectedCountry}
                                        onValueChange={(value) => setSelectedCountry(value)}
                                        placeholder={translations.selectcountryname}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="currencyName">{translations.currencyname}</label>
                                    <input
                                        type="text"
                                        id="currencyName"
                                        placeholder={translations.entercurrencyname}
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
                                    <label htmlFor="currencySymbol">{translations.currencysymbol}</label>
                                    <input
                                        type="text"
                                        id="currencySymbol"
                                        placeholder={translations.entercurrencysymbol}
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
                                        label={translations.CurrencyPosition}
                                        options={currencyPositions}
                                        labelKey="name"
                                        valueKey="id"
                                        selectedValue={currencyPosition}
                                        onValueChange={(value) => setCurrencyPosition(value)}
                                        placeholder={translations.selectcurrencyposition}
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="decimalValue">{translations.decimalplaces}</label>
                                    <input
                                        type="number"
                                        id="decimalValue"
                                        placeholder={translations.enterdecimalplaces}
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
                                    <label htmlFor="thousandSeparator">{translations.ThousandSeparator}</label>
                                    <input
                                        type="text"
                                        id="thousandSeparator"
                                        placeholder={translations.enterthousandseparator}
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
                                    <label htmlFor="decimalSeparator">{translations.DecimalSeparator}</label>
                                    <input
                                        type="text"
                                        id="decimalSeparator"
                                        placeholder={translations.enterdecimalseparator}
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
                                <div className="form-group">
                                    <label htmlFor="status">{translations.status}</label>
                                    <CustomSwitch checked={status} onChange={handleSwitchChange} />
                                </div>
                            </div>
                            <div className="button-group">
                                <button type="button" className="btn btn-secondary cancelbtn" onClick={handleCancel}>
                                    {translations.cancel}
                                </button>
                                <button type="submit" className="btn btn-success submit-btn">
                                    {translations.save}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default EditCurrency;
