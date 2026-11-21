import { useEffect, useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from '../../../Middleware/Auth';
import LoadingSpinner from '../../../Pages/Custom/LoadingSpinner';
import WarningModal from '../../../Pages/Custom/WarningModal';
import CustomSwitch from '../../../Pages/Custom/CustomSwitch';
import "../../../Scss/Attributes/Style/addstyle.scss";
import CheckToken from '../../../utils/CheckToken';
import HandleUnauthorized from '../../../utils/HandleUnauthorized';
const EditStyle = () => {
  const {
    id
  } = useParams();
  const navigate = useNavigate();
  const {
    logoutUser
  } = useAuth();
  const adminPanelBackendPath = import.meta.env.VITE_BACKEND_URL;
  const tokenname = import.meta.env.VITE_AdminTOKEN_NAME;
  const [warningMessage, setWarningMessage] = useState("");
  const [showWarning, setShowWarning] = useState(false);
  const token = localStorage.getItem(tokenname);
  const [styleName, setStyleName] = useState("");
  const [status, setStatus] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    document.title = "Edit Style";
  }, []);
  useEffect(() => {
    const fetchDetails = async () => {
      setIsLoading(true);
      if (!CheckToken(token, logoutUser, navigate)) {
        setIsLoading(false);
        return;
      }
      try {
        const response = await fetch(`${adminPanelBackendPath}/Attributes/EditStyle/${id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const result = await response.json();
        if (HandleUnauthorized(result, logoutUser, navigate)) return;
        if (response.ok) {
          setStyleName(result.stylename || "");
          setStatus(Boolean(result.status));
        } else {
          const errorMessages = {
            "Style not found": "Style not found",
            "Server error": "Server error"
          };
          setWarningMessage(errorMessages[result.message] || "Server error");
          setShowWarning(true);
        }
      } catch {
        setWarningMessage("Server error");
        setShowWarning(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetails();
  }, [id, token, adminPanelBackendPath, logoutUser, navigate]);
  const handleSubmit = async e => {
    e.preventDefault();
    if (!styleName.trim()) {
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
        stylename: styleName.trim(),
        status
      };
      const response = await fetch(`${adminPanelBackendPath}/Attributes/UpdateStyle/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (HandleUnauthorized(result, logoutUser, navigate)) return;
      if (response.ok) {
        navigate("/Attributes/Style", {
          state: {
            message: "Style updated successfully"
          }
        });
      } else {
        const errorMessages = {
          "All fields are required": "All fields are required",
          "Style Already Exists": "Style Already Exists",
          "Style not found": "Style not found",
          "Server error": "Server error"
        };
        setWarningMessage(errorMessages[result.message] || "Server error");
        setShowWarning(true);
      }
    } catch {
      setWarningMessage("Server error");
      setShowWarning(true);
    } finally {
      setIsLoading(false);
    }
  };
  const handleCancel = () => navigate(`/Attributes/Style`);
  return <>
            {showWarning && <WarningModal message={warningMessage} onClose={() => setShowWarning(false)} />}
            <div className="AddStyle-container ">
                <div className="Addstyle-container">
                    <h6 className="Addstyle-headingname">{"Edit Style"}</h6>
                    <div className="Addstyle-form-container">
                        {isLoading ? <LoadingSpinner /> : <form onSubmit={handleSubmit}>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="stylename">
                                            {"Style Name"} <span style={{
                    color: "red"
                  }}>*</span>
                                        </label>
                                        <input type="text" id="stylename" name="stylename" autoComplete="off" placeholder={"Enter Style Name"} required value={styleName} onChange={e => {
                  const value = e.target.value;
                  if (value.length === 1 && value === " ") return;
                  setStyleName(value);
                }} />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="status">{"Status"}</label>
                                        <div className="switch-container">
                                            <CustomSwitch checked={status} onChange={e => setStatus(e.target.checked)} />
                                        </div>
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
export default EditStyle;