import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import "../../Scss/Attributes/RingSize/ringsize.scss";
import { usePermissions } from '../../Hooks/usePermissions';
import AlertMessage from '../Custom/AlertMessage';
import WarningModal from '../Custom/WarningModal';
import GetRingSize from '../../Components/Attributes/RingSize/GetRingSize';
import SearchInput from '../Custom/SearchInput';
const RingSize = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    canAdd
  } = usePermissions();
  const [alertMessage, setAlertMessage] = useState("");
  const [warningMessage, setWarningMessage] = useState("");
  const [searchValue, setSearchValue] = useState("");
  useEffect(() => {
    document.title = "Ring Size";
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
  const handleAddNewClick = () => navigate(`/Attributes/AddRingSize`);
  return <div className="RingSize-container ">
    <div className="ringsize-container">
      <h6 className="ringsize-headingname">{"Ring Size"}</h6>
      <div className="ringsize-form-container">
        {alertMessage && <AlertMessage message={alertMessage} onClose={() => setAlertMessage("")} />}
        {warningMessage && <WarningModal message={warningMessage} onClose={() => setWarningMessage("")} />}
        <div className="ringsize-header">
          <SearchInput placeholder={"Search..."} value={searchValue} onChange={e => setSearchValue(e.target.value)} />
          {canAdd('ringSize') && <button type="button" className="add-new-btn" onClick={handleAddNewClick}>
            {"Add New"}
          </button>}
        </div>
        <GetRingSize searchValue={searchValue} />
      </div>
    </div>
  </div>;
};
export default RingSize;
