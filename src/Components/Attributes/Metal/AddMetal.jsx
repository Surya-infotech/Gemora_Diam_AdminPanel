import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../../Middleware/Auth';
import LoadingSpinner from '../../../Pages/Custom/LoadingSpinner';
import WarningModal from '../../../Pages/Custom/WarningModal';
import "../../../Scss/Attributes/Metal/addmetal.scss";
import CheckToken from '../../../utils/CheckToken';
import HandleUnauthorized from '../../../utils/HandleUnauthorized';
const AddMetal = () => {
  const navigate = useNavigate();
  const {
    logoutUser
  } = useAuth();
  const adminPanelBackendPath = import.meta.env.VITE_BACKEND_URL;
  const tokenname = import.meta.env.VITE_AdminTOKEN_NAME;
  const [warningMessage, setWarningMessage] = useState("");
  const [showWarning, setShowWarning] = useState(false);
  const token = localStorage.getItem(tokenname);
  const [metalName, setMetalName] = useState("");
  const [metalType, setMetalType] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    document.title = "Add Metal";
  }, []);
  const handleSubmit = async e => {
    e.preventDefault();
    if (!metalName.trim() || !metalType.trim()) {
      setWarningMessage("All fields are required");
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
        metalname: metalName.trim(),
        metaltype: metalType.trim(),
        status: true
      };
      const response = await fetch(`${adminPanelBackendPath}/Attributes/AddMetal`, {
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
        navigate(`/Attributes/Metal`, {
          state: {
            message: "Metal added successfully"
          }
        });
      } else {
        const errorMessages = {
          "All fields are required": "All fields are required",
          "Metal Name Already Exists": "Metal Name Already Exists",
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
  const handleCancel = () => navigate(`/Attributes/Metal`);
  return <>
            {showWarning && <WarningModal message={warningMessage} onClose={() => setShowWarning(false)} />}
            <div className="AddMetal-container ">
                <div className="Addmetal-container">
                    <h6 className="Addmetal-headingname">{"Add Metal"}</h6>
                    <div className="Addmetal-form-container">
                        {isLoading ? <LoadingSpinner /> : <form onSubmit={handleSubmit}>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="metalname">
                                            {"Metal Name"} <span style={{
                    color: "red"
                  }}>*</span>
                                        </label>
                                        <input type="text" id="metalname" name="metalname" autoComplete="off" placeholder={"Enter Metal Name"} autoFocus required value={metalName} onChange={e => {
                  const value = e.target.value;
                  if (value.length === 1 && value === " ") return;
                  setMetalName(value);
                }} />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="metaltype">
                                            {"Metal Type"} <span style={{
                    color: "red"
                  }}>*</span>
                                        </label>
                                        <input type="text" id="metaltype" name="metaltype" autoComplete="off" placeholder={"Enter Metal Type"} required value={metalType} onChange={e => {
                  const value = e.target.value;
                  if (value.length === 1 && value === " ") return;
                  setMetalType(value);
                }} />
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
export default AddMetal;