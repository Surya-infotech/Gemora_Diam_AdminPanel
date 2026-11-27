import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import "../../Scss/Home/Order/allorder.scss";
import { usePermissions } from '../../Hooks/usePermissions';
import AlertMessage from '../Custom/AlertMessage';
import WarningModal from '../Custom/WarningModal';
import SearchInput from '../Custom/SearchInput';
import GetAllOrder from '../../Components/Home/AllOrder/GetAllOrder';

const AllOrder = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { canAdd } = usePermissions();
  const [alertMessage, setAlertMessage] = useState(location.state?.message || "");
  const [warningMessage, setWarningMessage] = useState(location.state?.warning || "");
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    document.title = "All Order";
  }, []);

  useEffect(() => {
    if (location.state?.message || location.state?.warning) {
      navigate(location.pathname, {
        replace: true,
        state: {}
      });
    }
  }, [location, navigate]);

  const handleAddNewClick = () => navigate('/Home/AddAllOrder');

  return (
    <div className="AllOrder-container">
      <div className="allorder-container">
        <h6 className="allorder-headingname">{"All Order"}</h6>
        <div className="allorder-form-container">
          {alertMessage && <AlertMessage message={alertMessage} onClose={() => setAlertMessage("")} />}
          {warningMessage && <WarningModal message={warningMessage} onClose={() => setWarningMessage("")} />}
          <div className="allorder-header">
            <SearchInput
              placeholder={"Search..."}
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
            />
            {canAdd('allOrder') && (
              <button type="button" className="add-new-btn" onClick={handleAddNewClick}>
                {"Add New"}
              </button>
            )}
          </div>
          <GetAllOrder searchValue={searchValue} />
        </div>
      </div>
    </div>
  );
};

export default AllOrder;