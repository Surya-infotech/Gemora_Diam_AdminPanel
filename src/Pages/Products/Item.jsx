import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import "../../Scss/Products/item.scss";
import { useLanguage } from '../../Context/LanguageContext';
import { usePermissions } from '../../Hooks/usePermissions';
import AlertMessage from '../Custom/AlertMessage';
import WarningModal from '../Custom/WarningModal';
import GetItem from '../../Components/Products/GetItem';
import SearchInput from '../Custom/SearchInput';

const Item = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { translations, isRtl } = useLanguage();
    const { canAdd } = usePermissions();
    const [alertMessage, setAlertMessage] = useState("");
    const [warningMessage, setWarningMessage] = useState("");
    const [searchValue, setSearchValue] = useState("");

    useEffect(() => {
        if (translations.Item) document.title = translations.Item;
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

    const handleAddNewClick = () => navigate(`/Products/AddItem`);

    return (
        <div className={`Item-container ${isRtl ? 'rtl-item' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="item-container">
                <h6 className="item-headingname">{translations.Item}</h6>
                <div className="item-form-container">
                    {alertMessage && <AlertMessage message={alertMessage} onClose={() => setAlertMessage("")} />}
                    {warningMessage && <WarningModal message={warningMessage} onClose={() => setWarningMessage("")} />}
                    <div className="item-header">
                        <SearchInput
                            placeholder={translations.searchPlaceholder}
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                        />
                        {canAdd('item') && (
                            <button type="button" className="add-new-btn" onClick={handleAddNewClick}>
                                {translations.addNew}
                            </button>
                        )}
                    </div>
                    <GetItem searchValue={searchValue} />
                </div>
            </div>
        </div>
    );
};

export default Item;
