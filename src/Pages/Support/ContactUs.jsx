import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import GetContactUs from '../../Components/Support/ContactUs/GetContactUs';
import AlertMessage from '../Custom/AlertMessage';
import WarningModal from '../Custom/WarningModal';
import "../../Scss/Support/ContactUs/contactus.scss";
import SearchInput from '../Custom/SearchInput';
const ContactUs = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [alertMessage, setAlertMessage] = useState("");
  const [warningMessage, setWarningMessage] = useState("");
  const [searchValue, setSearchValue] = useState("");
  useEffect(() => {
    document.title = "Contact Us";
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
  return <>
            <div className="ContactUs-container">
                <div className="contactus-container">
                    <h6 className="contactus-headingname">{"Contact Us"}</h6>
                    <div className="contactus-form-container">
                        {alertMessage && <AlertMessage message={alertMessage} onClose={() => setAlertMessage("")} />}
                        {warningMessage && <WarningModal message={warningMessage} onClose={() => setWarningMessage("")} />}
                        <div className="contactus-header">
                            <SearchInput placeholder={"Search..."} value={searchValue} onChange={e => setSearchValue(e.target.value)} />
                        </div>
                        <GetContactUs searchValue={searchValue} />
                    </div>
                </div>
            </div>
        </>;
};
export default ContactUs;