import { useEffect, useState } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../Middleware/Auth';
import '../../Scss/General/signin.scss';
import AlertMessage from '../Custom/AlertMessage';
import WarningModal from '../Custom/WarningModal';
import CheckToken from '../../utils/CheckToken';
import { getBrowserAndDeviceDetails, getIpAndLocation } from '../../utils/deviceDetails';
import { setEncryptedRole } from '../../utils/cryptoStorage';
const OwnerLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    storetoken,
    logoutUser
  } = useAuth();
  const [alertMessage, setAlertMessage] = useState("");
  const BackendPath = import.meta.env.VITE_BACKEND_URL;
  const tokenname = import.meta.env.VITE_AdminTOKEN_NAME;
  const token = localStorage.getItem(tokenname);
  const [warningMessage, setWarningMessage] = useState("");
  const [showWarning, setShowWarning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const FALLBACK_LOGO = `${import.meta.env.BASE_URL}GEMORALOGO.png`;
  const [logoUrl, setLogoUrl] = useState(FALLBACK_LOGO);
  const softwareName = 'Gemora Diam';
  const HOME_URL = import.meta.env.VITE_HOME_URL || '/';
  useEffect(() => {
    document.title = "Sign In";
  }, []);
  useEffect(() => {
    const messageParam = searchParams.get('message');
    if (messageParam) {
      setAlertMessage(decodeURIComponent(messageParam));
      setSearchParams({}, {
        replace: true
      });
    } else if (location.state && location.state.message) {
      setAlertMessage(location.state.message);
      navigate(location.pathname, {
        replace: true
      });
    }
    if (location.state && location.state.warning) {
      setWarningMessage(location.state.warning);
      setShowWarning(true);
      navigate(location.pathname, {
        replace: true
      });
    }
  }, [location, navigate, searchParams, setSearchParams]);
  const checkToken = async () => {
    if (!CheckToken(token, logoutUser, navigate)) return;
    try {
      let response = await fetch(`${BackendPath}/admin/verify-token`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.status === 404) {
        response = await fetch(`${BackendPath}/General/admin/verify-token`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
      if (response.ok) {
        const data = await response.json();
        const userRole = data.role || data.employee?.role || data.admin?.role;
        if (userRole) {
          setEncryptedRole(userRole);
        }
        const employeeId = data.employee?._id;
        if (employeeId) {
          localStorage.setItem('EmployeeID', employeeId);
        }
        const isEmp = (userRole || '').trim().toLowerCase() === 'employee';
        navigate(isEmp ? '/Home/EmployeeDashboard' : '/Home/Dashboard');
      } else {
        logoutUser();
        navigate("/Signin");
      }
    } catch {
      logoutUser();
      navigate("/Signin");
    }
  };
  useEffect(() => {
    checkToken();
  }, [BackendPath, navigate, token, logoutUser, tokenname]);
  useEffect(() => {
    const fetchLandingPageSettings = async () => {
      try {
        const response = await fetch(`${BackendPath}/System/GetGeneralSetting_landingpage`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          }
        });
        const data = await response.json();
        if (!response.ok || !data) return;
      } catch {
        /* keep defaults when API fails */
      }
    };
    fetchLandingPageSettings();
  }, [BackendPath]);
  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);
    setFormError('');
    try {
      const {
        browserdetails,
        device
      } = getBrowserAndDeviceDetails();
      let ipaddress = "Unknown";
      let location = "Unknown";
      try {
        const ipLocation = await getIpAndLocation();
        if (ipLocation) {
          ipaddress = ipLocation.ipaddress || "Unknown";
          location = ipLocation.location || "Unknown";
        }
      } catch {
        // Fallback to unknown if network lookup fails
      }
      let response;
      response = await fetch(`${BackendPath}/admin/Signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password,
          browserdetails,
          device,
          ipaddress,
          location
        })
      });
      const data = await response.json();
      if (response.ok) {
        const authToken = data.employee?.Token || data.token;
        const userRole = data.role || data.employee?.role || "Employee";
        const employeeId = data.employee?._id;
        storetoken(authToken, userRole, employeeId);
        setEncryptedRole(userRole);
        if (employeeId) {
          localStorage.setItem('EmployeeID', employeeId);
        }
        if (data.employee?.permissions) {
          localStorage.setItem('EMPLOYEE_PERMISSIONS', JSON.stringify(data.employee.permissions));
        } else {
          localStorage.removeItem('EMPLOYEE_PERMISSIONS');
        }
        const isEmp = (userRole || '').trim().toLowerCase() === 'employee';
        navigate(isEmp ? '/Home/EmployeeDashboard' : '/Home/Dashboard');
      } else {
        const errorMessages = {
          "Invalid Email": "Invalid Email",
          "All fields are required": "All fields are required",
          "Invalid Password": "Invalid Password"
        };
        setFormError(errorMessages[data.message] || data.message || "Server error");
      }
    } catch {
      setWarningMessage("Server error");
      setShowWarning(true);
    } finally {
      setIsLoading(false);
    }
  };
  return <>
        {showWarning && <WarningModal message={warningMessage} onClose={() => setShowWarning(false)} />}
        {alertMessage && <AlertMessage message={alertMessage} onClose={() => setAlertMessage("")} />}
        <div className="full-page">
            
            <div className="login-container">
                <div className="logo-container">
                    <a href={HOME_URL} className="logo-button">
                        <img src={logoUrl} className="logo" alt={"Logo"} onError={() => setLogoUrl(FALLBACK_LOGO)} />
                        <h2>{softwareName}</h2>
                    </a>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>{"Email"}</label>
                        <input type="email" placeholder={"Enter email"} value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>{"Password"}</label>
                        <input type="password" placeholder={"Enter Password"} value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>

                    {formError && <div className="error-message">{formError}</div>}
                    <button type="submit" className="login-button" disabled={isLoading}>
                        {isLoading ? "Signing In..." : "Sign In"}
                    </button>
                </form>
            </div>
        </div>
    </>;
};
export default OwnerLogin;