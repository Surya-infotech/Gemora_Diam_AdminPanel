import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../../Middleware/Auth';
import LoadingSpinner from '../../../Pages/Custom/LoadingSpinner';
import WarningModal from '../../../Pages/Custom/WarningModal';
import "../../../Scss/Attributes/DiamondSize/adddiamondsize.scss";
import CheckToken from '../../../utils/CheckToken';
import HandleUnauthorized from '../../../utils/HandleUnauthorized';
const AddDiamondSize = () => {
  const navigate = useNavigate();
  const {
    logoutUser
  } = useAuth();
  const adminPanelBackendPath = import.meta.env.VITE_BACKEND_URL;
  const tokenname = import.meta.env.VITE_AdminTOKEN_NAME;
  const [warningMessage, setWarningMessage] = useState("");
  const [showWarning, setShowWarning] = useState(false);
  const token = localStorage.getItem(tokenname);
  const [diamondSize, setDiamondSize] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    document.title = "Add Diamond Size";
  }, []);
  const handleSubmit = async e => {
    e.preventDefault();
    if (!diamondSize.trim()) {
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
        diamondsize: diamondSize.trim()
      };
      const response = await fetch(`${adminPanelBackendPath}/Attributes/AddDiamondSize`, {
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
        navigate(`/Attributes/DiamondSize`, {
          state: {
            message: "Diamond Size added successfully"
          }
        });
      } else {
        const errorMessages = {
          "All fields are required": "All fields are required",
          "Diamond Size Already Exists": "Diamond Size Already Exists",
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
  const handleCancel = () => navigate(`/Attributes/DiamondSize`);
  return <>
            {showWarning && <WarningModal message={warningMessage} onClose={() => setShowWarning(false)} />}
            <div className="AddDiamondSize-container ">
                <div className="Adddiamondsize-container">
                    <h6 className="Adddiamondsize-headingname">{"Add Diamond Size"}</h6>
                    <div className="Adddiamondsize-form-container">
                        {isLoading ? <LoadingSpinner /> : <form onSubmit={handleSubmit}>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="diamondsize">
                                            {"Diamond Size"} <span style={{
                    color: "red"
                  }}>*</span>
                                        </label>
                                        <input type="text" id="diamondsize" name="diamondsize" autoComplete="off" placeholder={"Enter Diamond Size"} autoFocus required value={diamondSize} onChange={e => {
                  const value = e.target.value;
                  if (value.length === 1 && value === " ") return;
                  setDiamondSize(value);
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
export default AddDiamondSize;