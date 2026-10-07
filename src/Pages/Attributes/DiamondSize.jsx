import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import "../../Scss/Attributes/DiamondSize/diamondsize.scss";
import { useLanguage } from '../../Context/LanguageContext';
import { usePermissions } from '../../Hooks/usePermissions';
import AlertMessage from '../Custom/AlertMessage';
import WarningModal from '../Custom/WarningModal';
import GetDiamondSize from '../../Components/Attributes/DiamondSize/GetDiamondSize';
import SearchInput from '../Custom/SearchInput';

const DiamondSize = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { translations, isRtl } = useLanguage();
    const { canAdd } = usePermissions();
    const [alertMessage, setAlertMessage] = useState("");
    const [warningMessage, setWarningMessage] = useState("");
    const [searchValue, setSearchValue] = useState("");

    useEffect(() => {
        if (translations.DiamondSize) document.title = translations.DiamondSize;
        else document.title = "Diamond Size";
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

    const handleAddNewClick = () => navigate(`/Attributes/AddDiamondSize`);

    return (
        <div className={`DiamondSize-container ${isRtl ? 'rtl-diamondsize' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="diamondsize-container">
                <h6 className="diamondsize-headingname">{translations.DiamondSize || "Diamond Size"}</h6>
                <div className="diamondsize-form-container">
                    {alertMessage && <AlertMessage message={alertMessage} onClose={() => setAlertMessage("")} />}
                    {warningMessage && <WarningModal message={warningMessage} onClose={() => setWarningMessage("")} />}
                    <div className="diamondsize-header">
                        <SearchInput
                            placeholder={translations.searchPlaceholder}
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                        />
                        {canAdd('diamondSize') && (
                            <button type="button" className="add-new-btn" onClick={handleAddNewClick}>
                                {translations.addNew}
                            </button>
                        )}
                    </div>
                    <GetDiamondSize searchValue={searchValue} />
                </div>
            </div>
        </div>
    );
};

export default DiamondSize;
