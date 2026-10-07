import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import "../../Scss/Attributes/Stone/stone.scss";
import { useLanguage } from '../../Context/LanguageContext';
import { usePermissions } from '../../Hooks/usePermissions';
import AlertMessage from '../Custom/AlertMessage';
import WarningModal from '../Custom/WarningModal';
import GetStone from '../../Components/Attributes/Stone/GetStone';
import SearchInput from '../Custom/SearchInput';

const Stone = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { translations, isRtl } = useLanguage();
    const { canAdd } = usePermissions();
    const [alertMessage, setAlertMessage] = useState("");
    const [warningMessage, setWarningMessage] = useState("");
    const [searchValue, setSearchValue] = useState("");

    useEffect(() => {
        if (translations.Stone) document.title = translations.Stone;
        else document.title = "Stone";
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

    const handleAddNewClick = () => navigate(`/Attributes/AddStone`);

    return (
        <div className={`Stone-container ${isRtl ? 'rtl-stone' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="stone-container">
                <h6 className="stone-headingname">{translations.Stone || "Stone"}</h6>
                <div className="stone-form-container">
                    {alertMessage && <AlertMessage message={alertMessage} onClose={() => setAlertMessage("")} />}
                    {warningMessage && <WarningModal message={warningMessage} onClose={() => setWarningMessage("")} />}
                    <div className="stone-header">
                        <SearchInput
                            placeholder={translations.searchPlaceholder}
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                        />
                        {canAdd('stone') && (
                            <button type="button" className="add-new-btn" onClick={handleAddNewClick}>
                                {translations.addNew}
                            </button>
                        )}
                    </div>
                    <GetStone searchValue={searchValue} />
                </div>
            </div>
        </div>
    );
};

export default Stone;