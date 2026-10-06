import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import "../../Scss/Support/Policy/policy.scss";
import { useLanguage } from '../../Context/LanguageContext';
import AlertMessage from '../Custom/AlertMessage';
import WarningModal from '../Custom/WarningModal';
import GetPolicy from '../../Components/Support/Policy/GetPolicy';
import SearchInput from '../Custom/SearchInput';

const Policy = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { translations, isRtl } = useLanguage();
    const [alertMessage, setAlertMessage] = useState("");
    const [warningMessage, setWarningMessage] = useState("");
    const [searchValue, setSearchValue] = useState("");

    useEffect(() => {
        if (translations.Policy) document.title = translations.Policy;
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

    const handleAddNewClick = () => navigate(`/Support/AddPolicy`);

    return (
        <div className={`Policy-container ${isRtl ? 'rtl-policy' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="policy-container">
                <h6 className="policy-headingname">{translations.Policy || "Policy"}</h6>
                <div className="policy-form-container">
                    {alertMessage && <AlertMessage message={alertMessage} onClose={() => setAlertMessage("")} />}
                    {warningMessage && <WarningModal message={warningMessage} onClose={() => setWarningMessage("")} />}
                    <div className="policy-header">
                        <SearchInput
                            placeholder={translations.searchPlaceholder}
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                        />
                        <button type="button" className="add-new-btn" onClick={handleAddNewClick}>
                            {translations.addNew}
                        </button>
                    </div>
                    <GetPolicy searchValue={searchValue} />
                </div>
            </div>
        </div>
    );
};

export default Policy;
