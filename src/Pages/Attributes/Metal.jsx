import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import "../../Scss/Attributes/Metal/metal.scss";
import { useLanguage } from '../../Context/LanguageContext';
import { usePermissions } from '../../Hooks/usePermissions';
import AlertMessage from '../Custom/AlertMessage';
import WarningModal from '../Custom/WarningModal';
import GetMetal from '../../Components/Attributes/Metal/GetMetal';
import SearchInput from '../Custom/SearchInput';

const Metal = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { translations, isRtl } = useLanguage();
    const { canAdd } = usePermissions();
    const [alertMessage, setAlertMessage] = useState("");
    const [warningMessage, setWarningMessage] = useState("");
    const [searchValue, setSearchValue] = useState("");

    useEffect(() => {
        if (translations.Metal) document.title = translations.Metal;
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

    const handleAddNewClick = () => navigate(`/Attributes/AddMetal`);

    return (
        <div className={`Metal-container ${isRtl ? 'rtl-metal' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="metal-container">
                <h6 className="metal-headingname">{translations.Metal}</h6>
                <div className="metal-form-container">
                    {alertMessage && <AlertMessage message={alertMessage} onClose={() => setAlertMessage("")} />}
                    {warningMessage && <WarningModal message={warningMessage} onClose={() => setWarningMessage("")} />}
                    <div className="metal-header">
                        <SearchInput
                            placeholder={translations.searchPlaceholder}
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                        />
                        {canAdd('metal') && (
                            <button type="button" className="add-new-btn" onClick={handleAddNewClick}>
                                {translations.addNew}
                            </button>
                        )}
                    </div>
                    <GetMetal searchValue={searchValue} />
                </div>
            </div>
        </div>
    );
};

export default Metal;
