import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../../Middleware/Auth';
import LoadingSpinner from '../../../Pages/Custom/LoadingSpinner';
import WarningModal from '../../../Pages/Custom/WarningModal';
import "../../../Scss/System/Employee/addemployee.scss";
import { useLanguage } from "../../../Context/LanguageContext";
import CheckToken from '../../../utils/CheckToken';
import HandleUnauthorized from '../../../utils/HandleUnauthorized';
import Dropdown from '../../Dropdown/Dropdown';
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

const AddEmployee = () => {
    const navigate = useNavigate();
    const { translations } = useLanguage();
    const { logoutUser } = useAuth();
    const adminPanelBackendPath = import.meta.env.VITE_BACKEND_URL;
    const tokenname = import.meta.env.VITE_AdminTOKEN_NAME;
    const token = localStorage.getItem(tokenname);

    const [warningMessage, setWarningMessage] = useState("");
    const [showWarning, setShowWarning] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [phoneError, setPhoneError] = useState("");

    const [formData, setFormData] = useState({
        firstname: "",
        lastname: "",
        email: "",
        password: "",
        phone: "",
        employeetype: "Employee"
    });

    const employeeTypeOptions = [
        { label: translations.Admin || "Admin", value: "Admin" },
        { label: translations.Employee || "Employee", value: "Employee" }
    ];

    useEffect(() => {
        if (translations.addemployee) {
            document.title = translations.addemployee;
        } else {
            document.title = "Add Employee";
        }
    }, [translations]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePhoneChange = (val) => {
        setFormData(prev => ({ ...prev, phone: val || "" }));
        if (!val || val.trim() === "") {
            setPhoneError("");
            return;
        }
        try {
            const valid = isValidPhoneNumber(val);
            if (!valid) {
                setPhoneError(translations.invalidphonenumber || "Invalid phone number");
            } else {
                setPhoneError("");
            }
        } catch {
            setPhoneError(translations.invalidphonenumber || "Invalid phone number");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.firstname.trim() || !formData.lastname.trim() || !formData.email.trim() || !formData.password || !formData.employeetype) {
            setWarningMessage(translations.allfieldrequired || "All fields are required");
            setShowWarning(true);
            return;
        }

        if (formData.phone && !isValidPhoneNumber(formData.phone)) {
            setWarningMessage(translations.invalidphonenumber || "Please enter a valid phone number");
            setShowWarning(true);
            return;
        }

        setIsLoading(true);
        if (!CheckToken(token, logoutUser, navigate)) return;

        try {
            const response = await fetch(`${adminPanelBackendPath}/System/AddEmployee`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();
            if (HandleUnauthorized(result, logoutUser, navigate)) return;

            if (response.ok) {
                navigate(`/System/Employee`, {
                    state: { message: translations.addemployeesuccessfull || "Employee added successfully" }
                });
            } else {
                const errorMessages = {
                    "All fields are required": translations.allfieldrequired || "All fields are required",
                    "Email Already Exists": translations.emailalreadyexists || "Email Already Exists",
                    "Server error": translations.servererror || "Server error"
                };
                setWarningMessage(errorMessages[result.message] || result.message || translations.servererror || "Server error");
                setShowWarning(true);
            }
        } catch {
            setWarningMessage(translations.servererror || "Server error");
            setShowWarning(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => navigate(`/System/Employee`);

    return (
        <>
            {showWarning && <WarningModal message={warningMessage} onClose={() => setShowWarning(false)} />}
            <div className="AddEmployee-container">
                <div className="Addemployee-container">
                    <h6 className="Addemployee-headingname">
                        {translations.addemployee || "Add Employee"}
                    </h6>
                    <div className="Addemployee-form-container">
                        {isLoading ? (
                            <LoadingSpinner />
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="firstname">
                                            {translations.firstname || "First Name"} <span style={{ color: "red" }}>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="firstname"
                                            name="firstname"
                                            autoComplete="off"
                                            placeholder={translations.enterfirstname || "Enter First Name"}
                                            autoFocus
                                            required
                                            value={formData.firstname}
                                            onChange={handleInputChange}
                                            onInput={(e) => (e.target.value = e.target.value.replace(/^\s+/, ""))}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="lastname">
                                            {translations.lastname || "Last Name"} <span style={{ color: "red" }}>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="lastname"
                                            name="lastname"
                                            autoComplete="off"
                                            placeholder={translations.enterlastname || "Enter Last Name"}
                                            required
                                            value={formData.lastname}
                                            onChange={handleInputChange}
                                            onInput={(e) => (e.target.value = e.target.value.replace(/^\s+/, ""))}
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="email">
                                            {translations.Email || "Email"} <span style={{ color: "red" }}>*</span>
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            autoComplete="off"
                                            placeholder={translations.enteremail || "Enter Email"}
                                            required
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            onInput={(e) => (e.target.value = e.target.value.replace(/^\s+/, ""))}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="password">
                                            {translations.password || "Password"} <span style={{ color: "red" }}>*</span>
                                        </label>
                                        <div className="password-input-wrapper">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                id="password"
                                                name="password"
                                                autoComplete="new-password"
                                                placeholder={translations.enterpassword || "Enter Password"}
                                                required
                                                value={formData.password}
                                                onChange={handleInputChange}
                                            />
                                            <button
                                                type="button"
                                                className="password-toggle-icon"
                                                onClick={() => setShowPassword(prev => !prev)}
                                                tabIndex="-1"
                                                aria-label={showPassword ? "Hide password" : "Show password"}
                                            >
                                                {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group phone-group">
                                        <label>{translations.phonenumber || translations.Phone || "Phone Number"}</label>
                                        <div className={`phone-input-wrapper ${phoneError ? 'has-phone-error' : ''}`}>
                                            <PhoneInput
                                                international
                                                defaultCountry="IN"
                                                value={formData.phone}
                                                onChange={handlePhoneChange}
                                                placeholder={translations.enterphone || "Enter Phone Number"}
                                            />
                                            {phoneError && (
                                                <div className="phone-error-message">{phoneError}</div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <Dropdown
                                            label={<>{translations.employeetype || "Employee Type"} <span style={{ color: "red" }}>*</span></>}
                                            options={employeeTypeOptions}
                                            selectedValue={formData.employeetype}
                                            onValueChange={(val) => setFormData(prev => ({ ...prev, employeetype: val }))}
                                            labelKey="label"
                                            valueKey="value"
                                            placeholder={translations.selectemployeetype || "Select Employee Type"}
                                            showSearch={false}
                                        />
                                    </div>
                                </div>

                                <div className="button-group">
                                    <button type="submit" className="btn btn-primary submit-btn">
                                        {translations.save || "Save"}
                                    </button>
                                    <button type="button" className="btn btn-secondary cancelbtn" onClick={handleCancel}>
                                        {translations.cancel || "Cancel"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default AddEmployee;
