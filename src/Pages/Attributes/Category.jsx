import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import "../../Scss/Attributes/Category/category.scss";
import { usePermissions } from '../../Hooks/usePermissions';
import AlertMessage from '../Custom/AlertMessage';
import WarningModal from '../Custom/WarningModal';
import GetCategory from '../../Components/Attributes/Category/GetCategory';
import SearchInput from '../Custom/SearchInput';
const Category = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    canAdd
  } = usePermissions();
  const [alertMessage, setAlertMessage] = useState("");
  const [warningMessage, setWarningMessage] = useState("");
  const [searchValue, setSearchValue] = useState("");
  useEffect(() => {
    document.title = "Category";
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
  const handleAddNewClick = () => navigate(`/Attributes/AddCategory`);
  return <div className="Category-container ">
            <div className="category-container">
                <h6 className="category-headingname">{"Category"}</h6>
                <div className="category-form-container">
                    {alertMessage && <AlertMessage message={alertMessage} onClose={() => setAlertMessage("")} />}
                    {warningMessage && <WarningModal message={warningMessage} onClose={() => setWarningMessage("")} />}
                    <div className="category-header">
                        <SearchInput placeholder={"Search..."} value={searchValue} onChange={e => setSearchValue(e.target.value)} />
                        {canAdd('category') && <button type="button" className="add-new-btn" onClick={handleAddNewClick}>
                                {"Add New"}
                            </button>}
                    </div>
                    <GetCategory searchValue={searchValue} />
                </div>
            </div>
        </div>;
};
export default Category;