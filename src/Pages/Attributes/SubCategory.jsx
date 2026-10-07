import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import "../../Scss/Attributes/SubCategory/subcategory.scss";
import { useLanguage } from '../../Context/LanguageContext';
import { usePermissions } from '../../Hooks/usePermissions';
import AlertMessage from '../Custom/AlertMessage';
import WarningModal from '../Custom/WarningModal';
import GetSubCategory from '../../Components/Attributes/SubCategory/GetSubCategory';
import SearchInput from '../Custom/SearchInput';

const SubCategory = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { translations, isRtl } = useLanguage();
    const { canAdd } = usePermissions();
    const [alertMessage, setAlertMessage] = useState("");
    const [warningMessage, setWarningMessage] = useState("");
    const [searchValue, setSearchValue] = useState("");

    useEffect(() => {
        if (translations.SubCategory) document.title = translations.SubCategory;
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

    const handleAddNewClick = () => navigate(`/Attributes/AddSubCategory`);

    return (
        <div className={`SubCategory-container ${isRtl ? 'rtl-subcategory' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="subcategory-container">
                <h6 className="subcategory-headingname">{translations.SubCategory}</h6>
                <div className="subcategory-form-container">
                    {alertMessage && <AlertMessage message={alertMessage} onClose={() => setAlertMessage("")} />}
                    {warningMessage && <WarningModal message={warningMessage} onClose={() => setWarningMessage("")} />}
                    <div className="subcategory-header">
                        <SearchInput
                            placeholder={translations.searchPlaceholder}
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                        />
                        {canAdd('subCategory') && (
                            <button type="button" className="add-new-btn" onClick={handleAddNewClick}>
                                {translations.addNew}
                            </button>
                        )}
                    </div>
                    <GetSubCategory searchValue={searchValue} />
                </div>
            </div>
        </div>
    );
};

export default SubCategory;
