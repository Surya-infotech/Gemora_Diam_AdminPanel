import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import "../../Scss/Support/CollectionBanner/collectionbanner.scss";
import { useLanguage } from '../../Context/LanguageContext';
import AlertMessage from '../Custom/AlertMessage';
import WarningModal from '../Custom/WarningModal';
import GetCollectionBanner from '../../Components/Support/CollectionBanner/GetCollectionBanner';
import SearchInput from '../Custom/SearchInput';

const CollectionBanner = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { translations, isRtl } = useLanguage();
    const [alertMessage, setAlertMessage] = useState(location.state?.message || "");
    const [warningMessage, setWarningMessage] = useState(location.state?.warning || "");
    const [searchValue, setSearchValue] = useState("");

    useEffect(() => {
        if (translations.CollectionBanner) document.title = translations.CollectionBanner;
    }, [translations]);

    useEffect(() => {
        if (location.state?.message || location.state?.warning) {
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location, navigate]);

    const handleAddNewClick = () => navigate(`/Support/AddCollectionBanner`);

    return (
        <div className={`CollectionBanner-container ${isRtl ? 'rtl-collectionbanner' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="collectionbanner-container">
                <h6 className="collectionbanner-headingname">{translations.CollectionBanner}</h6>
                <div className="collectionbanner-form-container">
                    {alertMessage && <AlertMessage message={alertMessage} onClose={() => setAlertMessage("")} />}
                    {warningMessage && <WarningModal message={warningMessage} onClose={() => setWarningMessage("")} />}
                    <div className="collectionbanner-header">
                        <SearchInput
                            placeholder={translations.searchPlaceholder}
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                        />
                        <button type="button" className="add-new-btn" onClick={handleAddNewClick}>
                            {translations.addNew}
                        </button>
                    </div>
                    <GetCollectionBanner searchValue={searchValue} />
                </div>
            </div>
        </div>
    );
};

export default CollectionBanner;