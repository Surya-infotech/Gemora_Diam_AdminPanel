import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import "../../Scss/Attributes/Length/length.scss";
import { usePermissions } from '../../Hooks/usePermissions';
import AlertMessage from '../Custom/AlertMessage';
import WarningModal from '../Custom/WarningModal';
import GetLength from '../../Components/Attributes/Length/GetLength';
import SearchInput from '../Custom/SearchInput';

const Length = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { canAdd } = usePermissions();
  const [alertMessage, setAlertMessage] = useState(() => location.state?.message || "");
  const [warningMessage, setWarningMessage] = useState(() => location.state?.warning || "");
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    document.title = "Length";
  }, []);

  useEffect(() => {
    if (location.state?.message || location.state?.warning) {
      navigate(location.pathname, { replace: true });
    }
  }, [location.pathname, location.state, navigate]);

  const handleAddNewClick = () => navigate(`/Attributes/AddLength`);

  return (
    <div className="Length-container">
      <div className="length-container">
        <h6 className="length-headingname">{"Length"}</h6>
        <div className="length-form-container">
          {alertMessage && <AlertMessage message={alertMessage} onClose={() => setAlertMessage("")} />}
          {warningMessage && <WarningModal message={warningMessage} onClose={() => setWarningMessage("")} />}
          <div className="length-header">
            <SearchInput
              placeholder={"Search..."}
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
            />
            {canAdd('length') && (
              <button type="button" className="add-new-btn" onClick={handleAddNewClick}>
                {"Add New"}
              </button>
            )}
          </div>
          <GetLength searchValue={searchValue} />
        </div>
      </div>
    </div>
  );
};

export default Length;