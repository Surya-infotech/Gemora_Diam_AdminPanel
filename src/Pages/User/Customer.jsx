import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import "../../Scss/User/Customer/customer.scss";
import AlertMessage from '../Custom/AlertMessage';
import WarningModal from '../Custom/WarningModal';
import GetCustomer from '../../Components/User/Customer/GetCustomer';
import SearchInput from '../Custom/SearchInput';
const Customer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [alertMessage, setAlertMessage] = useState(location.state?.message || "");
  const [warningMessage, setWarningMessage] = useState(location.state?.warning || "");
  const [searchValue, setSearchValue] = useState("");
  useEffect(() => {
    document.title = "Customer";
  }, []);
  useEffect(() => {
    if (location.state?.message || location.state?.warning) {
      navigate(location.pathname, {
        replace: true,
        state: {}
      });
    }
  }, [location, navigate]);
  return <div className="Customer-container ">
            <div className="customer-container">
                <h6 className="customer-headingname">{"Customer"}</h6>
                <div className="customer-form-container">
                    {alertMessage && <AlertMessage message={alertMessage} onClose={() => setAlertMessage("")} />}
                    {warningMessage && <WarningModal message={warningMessage} onClose={() => setWarningMessage("")} />}
                    <div className="customer-header">
                        <SearchInput placeholder={"Search..."} value={searchValue} onChange={e => setSearchValue(e.target.value)} />
                    </div>
                    <GetCustomer searchValue={searchValue} />
                </div>
            </div>
        </div>;
};
export default Customer;