import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import "../../Scss/Support/FAQ/faq.scss";
import AlertMessage from '../Custom/AlertMessage';
import WarningModal from '../Custom/WarningModal';
import GetFAQ from '../../Components/Support/FAQ/GetFAQ';
import SearchInput from '../Custom/SearchInput';
const FAQ = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [alertMessage, setAlertMessage] = useState("");
  const [warningMessage, setWarningMessage] = useState("");
  const [searchValue, setSearchValue] = useState("");
  useEffect(() => {
    document.title = "FAQ";
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
  const handleAddNewClick = () => navigate(`/Support/AddFAQ`);
  return <div className="FAQ-container ">
            <div className="faq-container">
                <h6 className="faq-headingname">{"FAQ"}</h6>
                <div className="faq-form-container">
                    {alertMessage && <AlertMessage message={alertMessage} onClose={() => setAlertMessage("")} />}
                    {warningMessage && <WarningModal message={warningMessage} onClose={() => setWarningMessage("")} />}
                    <div className="faq-header">
                        <SearchInput placeholder={"Search..."} value={searchValue} onChange={e => setSearchValue(e.target.value)} />
                        <button type="button" className="add-new-btn" onClick={handleAddNewClick}>
                            {"Add New"}
                        </button>
                    </div>
                    <GetFAQ searchValue={searchValue} />
                </div>
            </div>
        </div>;
};
export default FAQ;