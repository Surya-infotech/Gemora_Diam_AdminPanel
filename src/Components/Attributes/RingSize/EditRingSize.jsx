import { useEffect, useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from '../../../Middleware/Auth';
import LoadingSpinner from '../../../Pages/Custom/LoadingSpinner';
import WarningModal from '../../../Pages/Custom/WarningModal';
import CustomSwitch from '../../../Pages/Custom/CustomSwitch';
import "../../../Scss/Attributes/RingSize/addringsize.scss";
import CheckToken from '../../../utils/CheckToken';
import HandleUnauthorized from '../../../utils/HandleUnauthorized';
const EditRingSize = () => {
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
  const [ringSize, setRingSize] = useState("");
  const [status, setStatus] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    document.title = "Edit Ring Size";
  }, []);
  useEffect(() => {
    const fetchDetails = async () => {
      setIsLoading(true);
      if (!CheckToken(token, logoutUser, navigate)) {
        setIsLoading(false);
        return;
      }
      try {
        const response = await fetch(`${adminPanelBackendPath}/Attributes/EditRingSize/${id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const result = await response.json();
        if (HandleUnauthorized(result, logoutUser, navigate)) return;
        if (response.ok && result) {
          setRingSize(result.ringsize || "");
          setStatus(result.status !== undefined ? Boolean(result.status) : false);
        } else {
          const errorMessages = {
            "Ring Size not found": "Ring Size not found",
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
  }, [id, token, navigate, logoutUser, adminPanelBackendPath]);
  const handleSubmit = async e => {
    e.preventDefault();
    if (!ringSize.trim()) {
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
        ringsize: ringSize.trim(),
        status: Boolean(status)
      };
      const response = await fetch(`${adminPanelBackendPath}/Attributes/UpdateRingSize/${id}`, {
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
        navigate(`/Attributes/RingSize`, {
          state: {
            message: "Ring Size updated successfully"
          }
        });
      } else {
        const errorMessages = {
          "All fields are required": "All fields are required",
          "Ring Size Already Exists": "Ring Size Already Exists",
          "Ring Size not found": "Ring Size not found",
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
  const handleCancel = () => navigate(`/Attributes/RingSize`);
  return <>
    {showWarning && <WarningModal message={warningMessage} onClose={() => setShowWarning(false)} />}
    <div className="AddRingSize-container ">
      <div className="Addringsize-container">
        <h6 className="Addringsize-headingname">{"Edit Ring Size"}</h6>
        <div className="Addringsize-form-container">
          {isLoading ? <LoadingSpinner /> : <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="ringsize">
                  {"Ring Size"} <span style={{
                    color: "red"
                  }}>*</span>
                </label>
                <input type="text" id="ringsize" name="ringsize" autoComplete="off" placeholder={"Enter Ring Size"} required value={ringSize} onChange={e => {
                  const value = e.target.value;
                  if (value.length === 1 && value === " ") return;
                  setRingSize(value);
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
export default EditRingSize;
