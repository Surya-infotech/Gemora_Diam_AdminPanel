import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import "../../Scss/Attributes/Clarity/clarity.scss";
import { usePermissions } from '../../Hooks/usePermissions';
import AlertMessage from '../Custom/AlertMessage';
import WarningModal from '../Custom/WarningModal';
import GetClarity from '../../Components/Attributes/Clarity/GetClarity';
import SearchInput from '../Custom/SearchInput';
const Clarity = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    canAdd
  } = usePermissions();
  const [alertMessage, setAlertMessage] = useState("");
  const [warningMessage, setWarningMessage] = useState("");
  const [searchValue, setSearchValue] = useState("");
  useEffect(() => {
    document.title = "Clarity";
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
  const handleAddNewClick = () => navigate(`/Attributes/AddClarity`);
  return <div className="Clarity-container ">
            <div className="clarity-container">
                <h6 className="clarity-headingname">{"Clarity"}</h6>
                <div className="clarity-form-container">
                    {alertMessage && <AlertMessage message={alertMessage} onClose={() => setAlertMessage("")} />}
                    {warningMessage && <WarningModal message={warningMessage} onClose={() => setWarningMessage("")} />}
                    <div className="clarity-header">
                        <SearchInput placeholder={"Search..."} value={searchValue} onChange={e => setSearchValue(e.target.value)} />
                        {canAdd('clarity') && <button type="button" className="add-new-btn" onClick={handleAddNewClick}>
                                {"Add New"}
                            </button>}
                    </div>
                    <GetClarity searchValue={searchValue} />
                </div>
            </div>
        </div>;
};
export default Clarity;