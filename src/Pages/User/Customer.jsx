import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import "../../Scss/User/Customer/customer.scss";
import { useLanguage } from '../../Context/LanguageContext';
import AlertMessage from '../Custom/AlertMessage';
import WarningModal from '../Custom/WarningModal';
import GetCustomer from '../../Components/User/Customer/GetCustomer';
import SearchInput from '../Custom/SearchInput';

const Customer = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { translations, isRtl } = useLanguage();
    const [alertMessage, setAlertMessage] = useState(location.state?.message || "");
    const [warningMessage, setWarningMessage] = useState(location.state?.warning || "");
    const [searchValue, setSearchValue] = useState("");

    const pageTitle = translations.Customer || "Customer";

    useEffect(() => {
        if (pageTitle) document.title = pageTitle;
    }, [pageTitle]);

    useEffect(() => {
        if (location.state?.message || location.state?.warning) {
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location, navigate]);

    return (
        <div className={`Customer-container ${isRtl ? 'rtl-customer' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="customer-container">
                <h6 className="customer-headingname">{pageTitle}</h6>
                <div className="customer-form-container">
                    {alertMessage && <AlertMessage message={alertMessage} onClose={() => setAlertMessage("")} />}
                    {warningMessage && <WarningModal message={warningMessage} onClose={() => setWarningMessage("")} />}
                    <div className="customer-header">
                        <SearchInput
                            placeholder={translations.searchPlaceholder || "Search..."}
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                        />
                    </div>
                    <GetCustomer searchValue={searchValue} />
                </div>
            </div>
        </div>
    );
};

export default Customer;
