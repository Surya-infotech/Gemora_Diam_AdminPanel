import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import GetCurrency from '../../Components/System/Currency/GetCurrency';
import "../../Scss/System/Currency/currency.scss";
import AlertMessage from '../Custom/AlertMessage';
import WarningModal from '../Custom/WarningModal';
import SearchInput from '../Custom/SearchInput';
const Currency = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [alertMessage, setAlertMessage] = useState("");
  const [warningMessage, setWarningMessage] = useState("");
  const [searchValue, setSearchValue] = useState("");
  useEffect(() => {
    document.title = "Currency";
  }, []);
  useEffect(() => {
    if (location.state && location.state.message) {
      setAlertMessage(location.state.message);
      navigate(location.pathname, {
        replace: true
      });
    }
  }, [location, navigate]);
  useEffect(() => {
    if (location.state && location.state.warning) {
      setWarningMessage(location.state.warning);
      navigate(location.pathname, {
        replace: true
      });
    }
  }, [location, navigate]);
  const handleAddNewClick = () => navigate(`/System/AddCurrency`);
  return <div className="Currency-container ">
            <div className="currency-container">
                <h6 className="currency-headingname">{"Currency"}</h6>
                <div className="currency-form-container">
                    {alertMessage && <AlertMessage message={alertMessage} onClose={() => setAlertMessage("")} />}
                    {warningMessage && <WarningModal message={warningMessage} onClose={() => setWarningMessage("")} />}
                    <div className="currency-header">
                        <SearchInput placeholder={"Search..."} value={searchValue} onChange={e => setSearchValue(e.target.value)} />
                        <button type="button" className="add-new-btn" onClick={handleAddNewClick}>
                            {"Add New"}
                        </button>
                    </div>
                    <GetCurrency searchValue={searchValue} />
                </div>
            </div>
        </div>;
};
export default Currency;