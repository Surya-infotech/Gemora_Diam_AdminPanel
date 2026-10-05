import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import GetCurrency from '../../Components/System/Currency/GetCurrency';
import "../../Scss/System/Currency/currency.scss";
import AlertMessage from '../Custom/AlertMessage';
import WarningModal from '../Custom/WarningModal';
import { useLanguage } from '../../Context/LanguageContext';
import SearchInput from '../Custom/SearchInput';

const Currency = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { translations, isRtl } = useLanguage();
    const [alertMessage, setAlertMessage] = useState("");
    const [warningMessage, setWarningMessage] = useState("");
    const [searchValue, setSearchValue] = useState("");

    useEffect(() => {
        if (translations.currency) document.title = translations.currency;
    }, [translations]);

    useEffect(() => {
        if (location.state && location.state.message) {
            setAlertMessage(location.state.message);
            navigate(location.pathname, { replace: true });
        }
    }, [location, navigate]);

    useEffect(() => {
        if (location.state && location.state.warning) {
            setWarningMessage(location.state.warning);
            navigate(location.pathname, { replace: true });
        }
    }, [location, navigate]);

    const handleAddNewClick = () => navigate(`/System/AddCurrency`);

    return (
        <div className={`Currency-container ${isRtl ? 'rtl-currency' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="currency-container">
                <h6 className="currency-headingname">{translations.currency}</h6>
                <div className="currency-form-container">
                    {alertMessage && <AlertMessage message={alertMessage} onClose={() => setAlertMessage("")} />}
                    {warningMessage && <WarningModal message={warningMessage} onClose={() => setWarningMessage("")} />}
                    <div className="currency-header">
                        <SearchInput
                            placeholder={translations.searchPlaceholder}
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                        />
                        <button type="button" className="add-new-btn" onClick={handleAddNewClick}>
                            {translations.addNew}
                        </button>
                    </div>
                    <GetCurrency searchValue={searchValue} />
                </div>
            </div>
        </div>
    );
};

export default Currency;
