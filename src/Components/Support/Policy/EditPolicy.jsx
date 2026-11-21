import { useEffect, useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from '../../../Middleware/Auth';
import LoadingSpinner from '../../../Pages/Custom/LoadingSpinner';
import WarningModal from '../../../Pages/Custom/WarningModal';
import CustomSwitch from '../../../Pages/Custom/CustomSwitch';
import "../../../Scss/Support/Policy/addpolicy.scss";
import RichTextEditor from '../../Custom/RichTextEditor';
import CheckToken from '../../../utils/CheckToken';
import HandleUnauthorized from '../../../utils/HandleUnauthorized';
const EditPolicy = () => {
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
  const [policyName, setPolicyName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    document.title = "Edit Policy";
  }, []);
  useEffect(() => {
    const fetchDetails = async () => {
      setIsLoading(true);
      if (!CheckToken(token, logoutUser, navigate)) {
        setIsLoading(false);
        return;
      }
      try {
        const response = await fetch(`${adminPanelBackendPath}/Support/EditPolicy/${id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const result = await response.json();
        if (HandleUnauthorized(result, logoutUser, navigate)) return;
        if (response.ok) {
          setPolicyName(result.policyname || "");
          setDescription(result.description || "");
          setStatus(Boolean(result.status));
        } else {
          const errorMessages = {
            "Policy not found": "Policy not found",
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
    if (!policyName.trim() || !description.trim()) {
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
        policyname: policyName.trim(),
        description: description.trim(),
        status
      };
      const response = await fetch(`${adminPanelBackendPath}/Support/UpdatePolicy/${id}`, {
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
        navigate("/Support/Policy", {
          state: {
            message: "Policy updated successfully"
          }
        });
      } else {
        const errorMessages = {
          "All fields are required": "All fields are required",
          "Policy Already Exists": "Policy Already Exists",
          "Policy not found": "Policy not found",
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
  const handleCancel = () => navigate(`/Support/Policy`);
  return <>
            {showWarning && <WarningModal message={warningMessage} onClose={() => setShowWarning(false)} />}
            <div className="AddPolicy-container ">
                <div className="Addpolicy-container">
                    <h6 className="Addpolicy-headingname">{"Edit Policy"}</h6>
                    <div className="Addpolicy-form-container">
                        {isLoading ? <LoadingSpinner /> : <form onSubmit={handleSubmit}>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="policyname">
                                            {"Policy Name"} <span style={{
                    color: "red"
                  }}>*</span>
                                        </label>
                                        <input type="text" id="policyname" name="policyname" autoComplete="off" placeholder={"Enter Policy Name"} required value={policyName} onChange={e => {
                  const value = e.target.value;
                  if (value.length === 1 && value === " ") return;
                  setPolicyName(value);
                }} />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="status">{"Status"}</label>
                                        <div className="switch-container">
                                            <CustomSwitch checked={status} onChange={e => setStatus(e.target.checked)} />
                                        </div>
                                    </div>
                                </div>

                                <div className="form-row full-width">
                                    <div className="form-group">
                                        <label htmlFor="description">
                                            {"Policy Description"} <span style={{
                    color: "red"
                  }}>*</span>
                                        </label>
                                        <RichTextEditor value={description} onChange={val => setDescription(val)} placeholder={"Enter Policy Description"} />
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
export default EditPolicy;