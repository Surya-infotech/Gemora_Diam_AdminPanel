import CustomSwitch from '../../../Pages/Custom/CustomSwitch';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from '../../../Middleware/Auth';
import LoadingSpinner from '../../../Pages/Custom/LoadingSpinner';
import WarningModal from '../../../Pages/Custom/WarningModal';
import "../../../Scss/User/Employee/addemployee.scss";
import CheckToken from '../../../utils/CheckToken';
import HandleUnauthorized from '../../../utils/HandleUnauthorized';
import Dropdown from '../../Dropdown/Dropdown';
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
const EditEmployee = () => {
  const {
    id
  } = useParams();
  const navigate = useNavigate();
  const {
    logoutUser
  } = useAuth();
  const adminPanelBackendPath = import.meta.env.VITE_BACKEND_URL;
  const tokenName = import.meta.env.VITE_AdminTOKEN_NAME;
  const token = localStorage.getItem(tokenName);
  const [warningMessage, setWarningMessage] = useState("");
  const [showWarning, setShowWarning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState(true);
  const [phoneError, setPhoneError] = useState("");
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    role: "Employee"
  });
  const roleOptions = [{
    label: "Admin",
    value: "Admin"
  }, {
    label: "Employee",
    value: "Employee"
  }];
  useEffect(() => {
    document.title = "Edit Employee";
  }, []);
  useEffect(() => {
    if (!CheckToken(token, logoutUser, navigate)) return;
    const fetchEmployeeDetails = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${adminPanelBackendPath}/User/EditEmployee/${id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const result = await response.json();
        if (HandleUnauthorized(result, logoutUser, navigate)) return;
        if (response.ok) {
          setFormData({
            firstname: result.firstname || "",
            lastname: result.lastname || "",
            email: result.email || "",
            phone: result.phone || "",
            role: result.role || "Employee"
          });
          setStatus(result.status !== undefined ? result.status : true);
        } else {
          const errorMessages = {
            "Employee not found": "Employee not found",
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
    fetchEmployeeDetails();
  }, [id, token, navigate, logoutUser, adminPanelBackendPath]);
  const handleSwitchChange = event => setStatus(event.target.checked);
  const handleInputChange = e => {
    const {
      name,
      value
    } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handlePhoneChange = value => {
    setFormData(prev => ({
      ...prev,
      phone: value || ''
    }));
    if (!value || value.trim() === '') {
      setPhoneError("");
      return;
    }
    try {
      const isValid = isValidPhoneNumber(value);
      if (isValid) {
        setPhoneError("");
      } else {
        if (value.length >= 10) {
          setPhoneError("Invalid phone number");
        } else {
          setPhoneError("");
        }
      }
    } catch {
      if (value.length >= 10) {
        setPhoneError("Invalid phone number");
      } else {
        setPhoneError("");
      }
    }
  };
  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.firstname.trim() || !formData.lastname.trim() || !formData.email.trim() || !formData.role) {
      setWarningMessage("All fields are required");
      setShowWarning(true);
      return;
    }
    let isPhoneValid = true;
    if (formData.phone && formData.phone.trim() !== '') {
      try {
        isPhoneValid = isValidPhoneNumber(formData.phone);
      } catch {
        isPhoneValid = false;
      }
    }
    if (formData.phone && formData.phone.trim() !== '' && !isPhoneValid) {
      setPhoneError("Invalid phone number");
      setWarningMessage("Invalid phone number");
      setShowWarning(true);
      return;
    }
    setIsLoading(true);
    if (!CheckToken(token, logoutUser, navigate)) return;
    try {
      const response = await fetch(`${adminPanelBackendPath}/User/UpdateEmployee/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          firstname: formData.firstname.trim(),
          lastname: formData.lastname.trim(),
          email: formData.email.trim(),
          phone: formData.phone,
          role: formData.role,
          status
        })
      });
      const result = await response.json();
      if (HandleUnauthorized(result, logoutUser, navigate)) return;
      if (response.ok) {
        navigate(`/User/Employee`, {
          state: {
            message: "Employee updated successfully"
          }
        });
      } else {
        const errorMessages = {
          "All fields are required": "All fields are required",
          "Email Already Exists": "Email Already Exists",
          "Employee not found": "Employee not found",
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
  const handleCancel = () => navigate(`/User/Employee`);
  return <>
            {showWarning && <WarningModal message={warningMessage} onClose={() => setShowWarning(false)} />}
            <div className="AddEmployee-container ">
                <div className="Addemployee-container">
                    <h6 className="Addemployee-headingname">
                        {"Edit Employee"}
                    </h6>
                    <div className="Addemployee-form-container">
                        {isLoading ? <LoadingSpinner /> : <form onSubmit={handleSubmit}>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="firstname">
                                            {"First Name"} <span style={{
                    color: "red"
                  }}>*</span>
                                        </label>
                                        <input type="text" id="firstname" name="firstname" autoComplete="off" placeholder={"Enter First Name"} autoFocus required value={formData.firstname} onChange={handleInputChange} onInput={e => e.target.value = e.target.value.replace(/^\s+/, "")} />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="lastname">
                                            {"Last Name"} <span style={{
                    color: "red"
                  }}>*</span>
                                        </label>
                                        <input type="text" id="lastname" name="lastname" autoComplete="off" placeholder={"Enter Last Name"} required value={formData.lastname} onChange={handleInputChange} onInput={e => e.target.value = e.target.value.replace(/^\s+/, "")} />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="email">
                                            {"Email"} <span style={{
                    color: "red"
                  }}>*</span>
                                        </label>
                                        <input type="email" id="email" name="email" autoComplete="off" placeholder={"Enter email"} required value={formData.email} onChange={handleInputChange} onInput={e => e.target.value = e.target.value.replace(/^\s+/, "")} />
                                    </div>
                                    <div className="form-group">
                                        <Dropdown label={<>{"Role"} <span style={{
                    color: "red"
                  }}>*</span></>} options={roleOptions} selectedValue={formData.role} onValueChange={val => setFormData(prev => ({
                  ...prev,
                  role: val
                }))} labelKey="label" valueKey="value" placeholder={"Select Role"} showSearch={false} />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group phone-group">
                                        <label>{"Phone"}</label>
                                        <div className={`phone-input-wrapper ${phoneError ? 'has-phone-error' : ''}`}>
                                            <PhoneInput international defaultCountry="IN" value={formData.phone} onChange={handlePhoneChange} placeholder={"Phone"} />
                                            {phoneError && <div className="phone-error-message">{phoneError}</div>}
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>{"Status"}</label>
                                        <div className="switch-wrapper">
                                            <CustomSwitch checked={status} onChange={handleSwitchChange} />
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
export default EditEmployee;