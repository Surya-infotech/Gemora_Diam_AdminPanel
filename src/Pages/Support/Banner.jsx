import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import "../../Scss/Support/Banner/banner.scss";
import { useLanguage } from '../../Context/LanguageContext';
import AlertMessage from '../Custom/AlertMessage';
import WarningModal from '../Custom/WarningModal';
import GetBanner from '../../Components/Support/Banner/GetBanner';
import SearchInput from '../Custom/SearchInput';

const Banner = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { translations, isRtl } = useLanguage();
    const [alertMessage, setAlertMessage] = useState(location.state?.message || "");
    const [warningMessage, setWarningMessage] = useState(location.state?.warning || "");
    const [searchValue, setSearchValue] = useState("");

    useEffect(() => {
        if (translations.Banner) document.title = translations.Banner;
    }, [translations]);

    useEffect(() => {
        if (location.state?.message || location.state?.warning) {
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location, navigate]);

    const handleAddNewClick = () => navigate(`/Support/AddBanner`);

    return (
        <div className={`Banner-container ${isRtl ? 'rtl-banner' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="banner-container">
                <h6 className="banner-headingname">{translations.Banner}</h6>
                <div className="banner-form-container">
                    {alertMessage && <AlertMessage message={alertMessage} onClose={() => setAlertMessage("")} />}
                    {warningMessage && <WarningModal message={warningMessage} onClose={() => setWarningMessage("")} />}
                    <div className="banner-header">
                        <SearchInput
                            placeholder={translations.searchPlaceholder}
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                        />
                        <button type="button" className="add-new-btn" onClick={handleAddNewClick}>
                            {translations.addNew}
                        </button>
                    </div>
                    <GetBanner searchValue={searchValue} />
                </div>
            </div>
        </div>
    );
};

export default Banner;
