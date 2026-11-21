import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import "../../Scss/Support/Menu/menu.scss";
import AlertMessage from '../Custom/AlertMessage';
import WarningModal from '../Custom/WarningModal';
import GetMenu from '../../Components/Support/Menu/GetMenu';
import SearchInput from '../Custom/SearchInput';
const Menu = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [alertMessage, setAlertMessage] = useState(location.state?.message || "");
  const [warningMessage, setWarningMessage] = useState(location.state?.warning || "");
  const [searchValue, setSearchValue] = useState("");
  useEffect(() => {
    document.title = "Menu";
  }, []);
  useEffect(() => {
    if (location.state?.message || location.state?.warning) {
      navigate(location.pathname, {
        replace: true,
        state: {}
      });
    }
  }, [location, navigate]);
  const handleAddNewClick = () => navigate('/Support/AddMenu');
  return <div className="Menu-container ">
            <div className="menu-container">
                <h6 className="menu-headingname">{"Menu"}</h6>
                <div className="menu-form-container">
                    {alertMessage && <AlertMessage message={alertMessage} onClose={() => setAlertMessage("")} />}
                    {warningMessage && <WarningModal message={warningMessage} onClose={() => setWarningMessage("")} />}
                    <div className="menu-header">
                        <SearchInput placeholder={"Search..."} value={searchValue} onChange={e => setSearchValue(e.target.value)} />
                        <button type="button" className="add-new-btn" onClick={handleAddNewClick}>
                            {"Add New"}
                        </button>
                    </div>
                    <GetMenu searchValue={searchValue} />
                </div>
            </div>
        </div>;
};
export default Menu;