import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import "../../Scss/Attributes/DiamondColor/diamondcolor.scss";
import { useLanguage } from '../../Context/LanguageContext';
import AlertMessage from '../Custom/AlertMessage';
import WarningModal from '../Custom/WarningModal';
import GetDiamondColor from '../../Components/Attributes/DiamondColor/GetDiamondColor';
import SearchInput from '../Custom/SearchInput';

const DiamondColor = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { translations, isRtl } = useLanguage();
    const [alertMessage, setAlertMessage] = useState("");
    const [warningMessage, setWarningMessage] = useState("");
    const [searchValue, setSearchValue] = useState("");

    useEffect(() => {
        if (translations.DiamondColor) document.title = translations.DiamondColor;
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

    const handleAddNewClick = () => navigate(`/Attributes/AddDiamondColor`);

    return (
        <div className={`DiamondColor-container ${isRtl ? 'rtl-diamondcolor' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="diamondcolor-container">
                <h6 className="diamondcolor-headingname">{translations.DiamondColor || "Diamond Color"}</h6>
                <div className="diamondcolor-form-container">
                    {alertMessage && <AlertMessage message={alertMessage} onClose={() => setAlertMessage("")} />}
                    {warningMessage && <WarningModal message={warningMessage} onClose={() => setWarningMessage("")} />}
                    <div className="diamondcolor-header">
                        <SearchInput
                            placeholder={translations.searchPlaceholder}
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                        />
                        <button type="button" className="add-new-btn" onClick={handleAddNewClick}>
                            {translations.addNew}
                        </button>
                    </div>
                    <GetDiamondColor searchValue={searchValue} />
                </div>
            </div>
        </div>
    );
};

export default DiamondColor;
