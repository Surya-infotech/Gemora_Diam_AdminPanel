import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import "../../Scss/Home/Order/order.scss";
import { useLanguage } from '../../Context/LanguageContext';
import AlertMessage from '../Custom/AlertMessage';
import WarningModal from '../Custom/WarningModal';
import GetOrder from '../../Components/Home/Order/GetOrder';
import SearchInput from '../Custom/SearchInput';

const Order = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { translations, isRtl } = useLanguage();
    const [alertMessage, setAlertMessage] = useState(location.state?.message || "");
    const [warningMessage, setWarningMessage] = useState(location.state?.warning || "");
    const [searchValue, setSearchValue] = useState("");

    useEffect(() => {
        if (translations.Order) document.title = translations.Order;
    }, [translations]);

    useEffect(() => {
        if (location.state?.message || location.state?.warning) {
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location, navigate]);

    return (
        <div className={`Order-container ${isRtl ? 'rtl-order' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="order-container">
                <h6 className="order-headingname">{translations.Order || "Order"}</h6>
                <div className="order-form-container">
                    {alertMessage && <AlertMessage message={alertMessage} onClose={() => setAlertMessage("")} />}
                    {warningMessage && <WarningModal message={warningMessage} onClose={() => setWarningMessage("")} />}
                    <div className="order-header">
                        <SearchInput
                            placeholder={translations.searchPlaceholder || "Search..."}
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                        />
                    </div>
                    <GetOrder searchValue={searchValue} />
                </div>
            </div>
        </div>
    );
};

export default Order;
