import { useEffect, useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from '../../../Middleware/Auth';
import LoadingSpinner from '../../../Pages/Custom/LoadingSpinner';
import WarningModal from '../../../Pages/Custom/WarningModal';
import CustomSwitch from '../../../Pages/Custom/CustomSwitch';
import Dropdown from '../../Dropdown/Dropdown';
import "../../../Scss/Attributes/Color/addcolor.scss";
import CheckToken from '../../../utils/CheckToken';
import HandleUnauthorized from '../../../utils/HandleUnauthorized';
const EditColor = () => {
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
  const [colorName, setColorName] = useState("");
  const [colorType, setColorType] = useState(null);
  const [status, setStatus] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const colorTypeOptions = [{
    label: "Diamond",
    value: "Diamond"
  }, {
    label: "Band",
    value: "Band"
  }];
  useEffect(() => {
    document.title = "Edit Color";
  }, []);
  useEffect(() => {
    const fetchDetails = async () => {
      setIsLoading(true);
      if (!CheckToken(token, logoutUser, navigate)) {
        setIsLoading(false);
        return;
      }
      try {
        const response = await fetch(`${adminPanelBackendPath}/Attributes/EditColor/${id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const result = await response.json();
        if (HandleUnauthorized(result, logoutUser, navigate)) return;
        if (response.ok) {
          setColorName(result.colorname || "");
          setColorType(result.colortype || null);
          setStatus(Boolean(result.status));
        } else {
          const errorMessages = {
            "Color not found": "Color not found",
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
    if (!colorName.trim()) {
      setWarningMessage("All fields are required");
      setShowWarning(true);
      return;
    }
    if (!colorType) {
      setWarningMessage("Please select a Color Type");
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
        colorname: colorName.trim(),
        colortype: colorType,
        status
      };
      const response = await fetch(`${adminPanelBackendPath}/Attributes/UpdateColor/${id}`, {
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
        navigate("/Attributes/Color", {
          state: {
            message: "Color updated successfully"
          }
        });
      } else {
        const errorMessages = {
          "All fields are required": "All fields are required",
          "Color with this type already exists": "Color with this type already exists",
          "Color Type must be either Diamond or Band": "Color Type must be either Diamond or Band",
          "Color not found": "Color not found",
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
  const handleCancel = () => navigate(`/Attributes/Color`);
  return <>
            {showWarning && <WarningModal message={warningMessage} onClose={() => setShowWarning(false)} />}
            <div className="AddColor-container ">
                <div className="Addcolor-container">
                    <h6 className="Addcolor-headingname">{"Edit Color"}</h6>
                    <div className="Addcolor-form-container">
                        {isLoading ? <LoadingSpinner /> : <form onSubmit={handleSubmit}>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="colorname">
                                            {"Color Name"} <span style={{
                    color: "red"
                  }}>*</span>
                                        </label>
                                        <input type="text" id="colorname" name="colorname" autoComplete="off" placeholder={"Enter Color Name"} autoFocus required value={colorName} onChange={e => {
                  const value = e.target.value;
                  if (value.length === 1 && value === " ") return;
                  setColorName(value);
                }} onInput={e => e.target.value = e.target.value.replace(/^\s+/, "")} />
                                    </div>
                                    <div className="form-group">
                                        <label>
                                            {"Color Type"} <span style={{
                    color: "red"
                  }}>*</span>
                                        </label>
                                        <Dropdown options={colorTypeOptions} labelKey="label" valueKey="value" selectedValue={colorType} onValueChange={val => setColorType(val)} placeholder={"Select Color Type"} showSearch={false} />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>{"Status"}</label>
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
export default EditColor;