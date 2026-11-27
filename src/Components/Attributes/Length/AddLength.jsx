import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../../Middleware/Auth';
import LoadingSpinner from '../../../Pages/Custom/LoadingSpinner';
import WarningModal from '../../../Pages/Custom/WarningModal';
import Dropdown from '../../Dropdown/Dropdown';
import "../../../Scss/Attributes/Length/addlength.scss";
import CheckToken from '../../../utils/CheckToken';
import HandleUnauthorized from '../../../utils/HandleUnauthorized';

const LENGTH_TYPE_OPTIONS = [{
  label: "Bracelet",
  value: "Bracelet"
}, {
  label: "Pendant",
  value: "Pendant"
}];

const AddLength = () => {
  const navigate = useNavigate();
  const {
    logoutUser
  } = useAuth();
  const adminPanelBackendPath = import.meta.env.VITE_BACKEND_URL;
  const tokenname = import.meta.env.VITE_AdminTOKEN_NAME;
  const [warningMessage, setWarningMessage] = useState("");
  const [showWarning, setShowWarning] = useState(false);
  const token = localStorage.getItem(tokenname);
  const [lengthName, setLengthName] = useState("");
  const [lengthType, setLengthType] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.title = "Add Length";
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!lengthName.trim()) {
      setWarningMessage("All fields are required");
      setShowWarning(true);
      return;
    }
    if (!lengthType) {
      setWarningMessage("Please select a Length Type");
      setShowWarning(true);
      return;
    }
    setIsLoading(true);
    if (!CheckToken(token, logoutUser, navigate)) {
      setIsLoading(false);
      return;
    }
    try {
      const payload = {
        lengthname: lengthName.trim(),
        lengthtype: lengthType
      };
      const response = await fetch(`${adminPanelBackendPath}/Attributes/AddLength`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (HandleUnauthorized(result, logoutUser, navigate)) return;
      if (response.ok) {
        navigate("/Attributes/Length", {
          state: {
            message: "Length added successfully"
          }
        });
      } else {
        const errorMessages = {
          "All fields are required": "All fields are required",
          "Invalid length type": "Invalid length type",
          "Length with this type already exists": "Length with this type already exists",
          "Server error": "Server error"
        };
        setWarningMessage(errorMessages[result.message] || result.message || "Server error");
        setShowWarning(true);
      }
    } catch {
      setWarningMessage("Server error");
      setShowWarning(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => navigate(`/Attributes/Length`);

  return <>
    {showWarning && <WarningModal message={warningMessage} onClose={() => setShowWarning(false)} />}
    <div className="AddLength-container ">
      <div className="Addlength-container">
        <h6 className="Addlength-headingname">{"Add Length"}</h6>
        <div className="Addlength-form-container">
          {isLoading ? <LoadingSpinner /> : <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="lengthname">
                  {"Length Name"} <span style={{
                    color: "red"
                  }}>*</span>
                </label>
                <input type="text" id="lengthname" name="lengthname" autoComplete="off" placeholder={"Enter Length Name"} autoFocus required value={lengthName} onChange={e => {
                  const value = e.target.value;
                  if (value.length === 1 && value === " ") return;
                  setLengthName(value);
                }} onInput={e => e.target.value = e.target.value.replace(/^\s+/, "")} />
              </div>
              <div className="form-group">
                <label>
                  {"Length Type"} <span style={{
                    color: "red"
                  }}>*</span>
                </label>
                <Dropdown options={LENGTH_TYPE_OPTIONS} labelKey="label" valueKey="value" selectedValue={lengthType} onValueChange={val => setLengthType(val)} placeholder={"Select Length Type"} showSearch={false} />
              </div>
            </div>

            <div className="button-group">
              <button type="button" className="btn btn-secondary cancelbtn" onClick={handleCancel} disabled={isLoading}>
                {"Cancel"}
              </button>
              <button type="submit" className="btn btn-success submit-btn" disabled={isLoading}>
                {"Save"}
              </button>
            </div>
          </form>}
        </div>
      </div>
    </div>
  </>;
};

export default AddLength;