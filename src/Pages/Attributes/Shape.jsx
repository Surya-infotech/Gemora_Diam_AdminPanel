import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import "../../Scss/Attributes/Shape/shape.scss";
import { usePermissions } from '../../Hooks/usePermissions';
import AlertMessage from '../Custom/AlertMessage';
import WarningModal from '../Custom/WarningModal';
import GetShape from '../../Components/Attributes/Shape/GetShape';
import SearchInput from '../Custom/SearchInput';
const Shape = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    canAdd
  } = usePermissions();
  const [alertMessage, setAlertMessage] = useState("");
  const [warningMessage, setWarningMessage] = useState("");
  const [searchValue, setSearchValue] = useState("");
  useEffect(() => {
    document.title = "Shape";
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
  const handleAddNewClick = () => navigate(`/Attributes/AddShape`);
  return <div className="Shape-container ">
            <div className="shape-container">
                <h6 className="shape-headingname">{"Shape"}</h6>
                <div className="shape-form-container">
                    {alertMessage && <AlertMessage message={alertMessage} onClose={() => setAlertMessage("")} />}
                    {warningMessage && <WarningModal message={warningMessage} onClose={() => setWarningMessage("")} />}
                    <div className="shape-header">
                        <SearchInput placeholder={"Search..."} value={searchValue} onChange={e => setSearchValue(e.target.value)} />
                        {canAdd('shape') && <button type="button" className="add-new-btn" onClick={handleAddNewClick}>
                                {"Add New"}
                            </button>}
                    </div>
                    <GetShape searchValue={searchValue} />
                </div>
            </div>
        </div>;
};
export default Shape;