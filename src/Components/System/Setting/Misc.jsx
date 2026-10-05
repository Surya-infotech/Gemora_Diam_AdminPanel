import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../../../Scss/System/Setting/misc.scss";
import { useLanguage } from '../../../Context/LanguageContext';
import { useAuth } from '../../../Middleware/Auth';
import LoadingSpinner from '../../../Pages/Custom/LoadingSpinner';
import WarningModal from '../../../Pages/Custom/WarningModal';
import AlertMessage from '../../../Pages/Custom/AlertMessage';
import CheckToken from '../../../utils/CheckToken';
import HandleUnauthorized from '../../../utils/HandleUnauthorized';
import DateFormat from "../../General/DateFormat";
import TimeFormat from "../../General/TimeFormat";
import TimeZone from "../../General/TimeZone";
import Dropdown from "../../Dropdown/Dropdown";

const Misc = () => {
    const navigate = useNavigate();
    const { logoutUser } = useAuth();
    const { translations } = useLanguage();
    const adminPanelBackendPath = import.meta.env.VITE_BACKEND_URL;
    const tokenname = import.meta.env.VITE_AdminTOKEN_NAME;
    const token = localStorage.getItem(tokenname);
    const [loading, setLoading] = useState(true);
    const [warningMessage, setWarningMessage] = useState("");
    const [showWarning, setShowWarning] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [timeZone, setTimeZone] = useState('');
    const [timeFormat, setTimeFormat] = useState('');
    const [dateFormat, setDateFormat] = useState('');
    const [currency, setCurrency] = useState('');
    const [currencies, setCurrencies] = useState([]);

    useEffect(() => {
        if (translations.miscsetting) document.title = translations.miscsetting;
    }, [translations]);

    useEffect(() => {
        if (!CheckToken(token, logoutUser, navigate)) return;

        const fetchCurrencies = async () => {
            try {
                const response = await fetch(`${adminPanelBackendPath}/System/GetCurrencies_statustrue`, {
                    method: "GET",
                    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                });
                const data = await response.json();
                if (HandleUnauthorized(data, logoutUser, navigate, response)) return;

                if (response.ok && Array.isArray(data)) {
                    const currencyOptions = data.map((curr) => ({
                        name: `${curr.currency} (${curr.currencysymbol})`,
                        value: curr.currencyid
                    }));
                    setCurrencies(currencyOptions);
                }
            } catch {
                setWarningMessage(translations.servererror);
                setShowWarning(true);
            } finally {
                setLoading(false);
            }
        };

        fetchCurrencies();
    }, [token, navigate, logoutUser, adminPanelBackendPath, translations]);

    useEffect(() => {
        if (!CheckToken(token, logoutUser, navigate)) return;

        const fetchMiscSettings = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${adminPanelBackendPath}/System/GetMiscSetting`, {
                    method: "GET",
                    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                });
                const data = await response.json();
                if (HandleUnauthorized(data, logoutUser, navigate, response)) return;

                if (response.ok && data) {
                    setTimeZone(data.timeZone || '');
                    setTimeFormat(data.timeFormat || '');
                    setDateFormat(data.dateFormat || '');
                    setCurrency(data.currencyid || '');
                }
            } catch {
                setWarningMessage(translations.servererror);
                setShowWarning(true);
            } finally {
                setLoading(false);
            }
        };

        fetchMiscSettings();
    }, [token, navigate, logoutUser, adminPanelBackendPath, translations]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!CheckToken(token, logoutUser, navigate)) return;

        try {
            const settingsData = {
                timeZone,
                timeFormat,
                dateFormat,
                currencyid: currency
            };

            const response = await fetch(`${adminPanelBackendPath}/System/UpdateMiscSetting`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify(settingsData),
            });

            const data = await response.json();
            if (HandleUnauthorized(data, logoutUser, navigate, response)) return;

            if (response.ok) {
                setSuccessMessage(translations.updatemiscsettingssuccessfull);
            } else {
                const errorMessages = {
                    "Server error": translations.servererror,
                    "All fields are required": translations.allfieldrequired
                };
                setWarningMessage(errorMessages[data.message] || data.message || translations.servererror);
                setShowWarning(true);
            }
        } catch {
            setWarningMessage(translations.servererror);
            setShowWarning(true);
        }
    };

    const handleWarningClose = () => setShowWarning(false);
    const handleCloseAlert = () => setSuccessMessage("");

    return (<>
        {showWarning && <WarningModal message={warningMessage} onClose={handleWarningClose} />}
        {successMessage && <AlertMessage message={successMessage} onClose={handleCloseAlert} />}
        <div className="Misc-container">
            {loading ? (
                <LoadingSpinner />
            ) : (
                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <TimeZone selectedTimeZone={timeZone} onTimeZoneChange={(tz) => setTimeZone(tz)} />
                        </div>
                        <div className="form-group">
                            <TimeFormat selectedTimeFormat={timeFormat} onFormatChange={(tf) => setTimeFormat(tf)} />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <DateFormat selectedDateFormat={dateFormat} onFormatChange={(df) => setDateFormat(df)} />
                        </div>
                        <div className="form-group">
                            <Dropdown
                                selectedValue={currency}
                                onValueChange={(value) => setCurrency(value)}
                                label={translations.currency}
                                options={currencies}
                                labelKey="name"
                                valueKey="value"
                                placeholder={translations.selectcurrency}
                            />
                        </div>
                    </div>
                    <div className="button-group">
                        <button type="submit" className="btn btn-success submit-btn">{translations.save}</button>
                    </div>
                </form>
            )}
        </div>
    </>);
}

export default Misc;