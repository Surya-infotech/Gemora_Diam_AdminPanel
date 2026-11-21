import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import LockResetIcon from '@mui/icons-material/LockReset';
import HistoryIcon from '@mui/icons-material/History';
import BoltIcon from '@mui/icons-material/Bolt';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import MenuIcon from '@mui/icons-material/Menu';
import { useEffect, useMemo, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../Middleware/Auth';
import CheckToken from '../../utils/CheckToken';
import HandleUnauthorized from '../../utils/HandleUnauthorized';
import "../../Scss/Partials/horinavbar.scss";
import profilePlaceholder from '../../assets/profile-placeholder.png';
import Dropdown from '../../Components/Dropdown/Dropdown';
import { useFiscalYear } from '../../Context/FiscalYearContext';
import { usePermissions } from '../../Hooks/usePermissions';
const HoriNavbar = () => {
  const navigate = useNavigate();
  const {
    logoutUser
  } = useAuth();
  const {
    isEmployee
  } = usePermissions();
  const {
    fiscalYears,
    selectedFiscalYear,
    setSelectedFiscalYear
  } = useFiscalYear();
  const location = useLocation();
  const currentPath = location.pathname;
  const showFiscalYearDropdown = ['/', '/Home/Dashboard', '/Home/Order'].includes(currentPath);
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [isQuickMenuVisible, setQuickMenuVisible] = useState(false);
  const adminPanelBackendPath = import.meta.env.VITE_BACKEND_URL;
  const tokenname = import.meta.env.VITE_AdminTOKEN_NAME;
  const token = localStorage.getItem(tokenname);
  const EmployeeId = localStorage.getItem("EmployeeID");
  const [adminProfileImage, setAdminProfileImage] = useState(profilePlaceholder);
  const getFullscreenElement = () => document.fullscreenElement ?? document.webkitFullscreenElement ?? null;
  const [isFullscreen, setIsFullscreen] = useState(() => !getFullscreenElement());
  const quickLinks = useMemo(() => {
    const links = [{
      to: isEmployee ? "/Home/EmployeeDashboard" : "/Home/Dashboard",
      label: "Dashboard",
      Icon: LeaderboardIcon
    }];
    if (!isEmployee) {
      links.push({
        to: "/System/Setting",
        label: "Setting",
        Icon: SettingsIcon
      });
    }
    return links;
  }, [isEmployee]);
  const toggleDropdown = () => {
    setQuickMenuVisible(false);
    setDropdownVisible(prev => !prev);
  };
  const toggleQuickMenu = () => {
    setDropdownVisible(false);
    setQuickMenuVisible(prev => !prev);
  };
  const handleDropdownSelect = () => setDropdownVisible(false);
  const handleQuickLinkSelect = () => setQuickMenuVisible(false);
  const handleClickOutside = event => {
    const profileSection = document.querySelector('.profile-section');
    const profileDropdown = document.querySelector('.profile-dropdown-menu');
    const quickSection = document.querySelector('.quick-menu-section');
    const quickDropdown = document.querySelector('.quick-dropdown-menu');
    if (profileDropdown && !profileDropdown.contains(event.target) && profileSection && !profileSection.contains(event.target)) {
      setDropdownVisible(false);
    }
    if (quickDropdown && !quickDropdown.contains(event.target) && quickSection && !quickSection.contains(event.target)) {
      setQuickMenuVisible(false);
    }
  };
  useEffect(() => {
    if (isDropdownVisible || isQuickMenuVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownVisible, isQuickMenuVisible]);
  useEffect(() => {
    const syncFullscreen = () => setIsFullscreen(!getFullscreenElement());
    document.addEventListener('fullscreenchange', syncFullscreen);
    document.addEventListener('webkitfullscreenchange', syncFullscreen);
    return () => {
      document.removeEventListener('fullscreenchange', syncFullscreen);
      document.removeEventListener('webkitfullscreenchange', syncFullscreen);
    };
  }, []);
  const handleFullscreenToggle = async () => {
    const root = document.documentElement;
    try {
      if (getFullscreenElement()) {
        if (document.exitFullscreen) await document.exitFullscreen();else if (document.webkitExitFullscreen) await document.webkitExitFullscreen();
      } else if (root.requestFullscreen) {
        await root.requestFullscreen();
      } else if (root.webkitRequestFullscreen) {
        await root.webkitRequestFullscreen();
      }
    } catch {
      /* User denied, API unsupported, or not allowed from this context */
    }
  };
  useEffect(() => {
    const fetchAdminProfileImage = async () => {
      if (!token) return;
      if (!CheckToken(token, logoutUser, navigate)) return;
      try {
        let endpoint = `${adminPanelBackendPath}/admin/GetAdminDetails/${EmployeeId}`;
        let response = await fetch(endpoint, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        const data = await response.json();
        if (HandleUnauthorized(data, logoutUser, navigate)) return;
        if (response.ok && data.admin && data.admin.profileimage) {
          setAdminProfileImage(data.admin.profileimage);
        }
      } catch (error) {
        console.log("Error fetching admin profile image:", error);
      }
    };
    fetchAdminProfileImage();
    window.addEventListener("adminProfileUpdated", fetchAdminProfileImage);
    return () => window.removeEventListener("adminProfileUpdated", fetchAdminProfileImage);
  }, [adminPanelBackendPath, token, logoutUser, navigate, EmployeeId]);
  return <>
        <nav className="hori-navbar ">
            <div className="hori-navbar-start">
                <button type="button" className="mobile-sidebar-toggle" onClick={() => window.dispatchEvent(new CustomEvent('toggleMobileSidebar'))} aria-label={"Toggle navigation"}>
                    <MenuIcon />
                </button>
                {showFiscalYearDropdown && <div className="left-side">
                        <div className="navbar-dropdown-group">
                            <div className="fiscal-year-dropdown-container">
                                <Dropdown options={fiscalYears} selectedValue={selectedFiscalYear} onValueChange={setSelectedFiscalYear} labelKey="fiscalyear" valueKey="fiscalyearid" placeholder={"Select Fiscal Year"} showSearch={false} />
                            </div>
                        </div>
                    </div>}
            </div>
            <div className="right-side">
                <div className={`quick-menu-section${isQuickMenuVisible ? ' is-open' : ''}`} onClick={toggleQuickMenu}>
                    <button type="button" className="quick-menu-btn" aria-label={"Quick"} aria-expanded={isQuickMenuVisible}>
                        <BoltIcon className="quick-menu-icon" />
                    </button>
                </div>
                <button type="button" className="hori-navbar__fullscreen-btn" onClick={handleFullscreenToggle} title={isFullscreen ? "Exit full screen" : "Full screen"} aria-label={isFullscreen ? "Exit full screen" : "Full screen"}>
                    {isFullscreen ? <FullscreenExitIcon style={{
            fontSize: 22
          }} aria-hidden /> : <FullscreenIcon style={{
            fontSize: 22
          }} aria-hidden />}
                </button>
                
                <div className="profile-section" onClick={toggleDropdown}>
                    <img src={adminProfileImage} alt={"Profile"} className="profile-photo" onError={e => {
            e.target.onerror = null;
            e.target.src = profilePlaceholder;
          }} />
                </div>
            </div>
            {isQuickMenuVisible && <div className="dropdown-menu quick-dropdown-menu" onClick={e => e.stopPropagation()}>
                    <ul className="quick-menu-grid">
                        {quickLinks.map(({
            to,
            label,
            Icon
          }) => <li key={to}>
                                <NavLink to={to} className={({
              isActive
            }) => isActive ? "active" : ""} onClick={handleQuickLinkSelect} aria-label={label}>
                                    <span className="quick-menu-icon-wrap">
                                        <Icon className="quick-menu-item-icon" />
                                    </span>
                                    <span className="quick-menu-label">{label}</span>
                                </NavLink>
                            </li>)}
                    </ul>
                </div>}
            {isDropdownVisible && <div className="dropdown-menu profile-dropdown-menu" onClick={e => e.stopPropagation()}>
                    <ul className="nav-links admintab admintab--hori-dropdown">
                        <li>
                            <NavLink to="/Home/Profile" className={({
              isActive
            }) => isActive ? 'active' : ''} onClick={handleDropdownSelect}>
                                <PersonIcon style={{
                color: 'var(--primary-color)',
                marginRight: '10px'
              }} />
                                {"Profile"}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/Home/ChangePassword" className={({
              isActive
            }) => isActive ? 'active' : ''} onClick={handleDropdownSelect}>
                                <LockResetIcon style={{
                color: 'var(--primary-color)',
                marginRight: '10px'
              }} />
                                {"Change Password"}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/Home/LoginActivity" className={({
              isActive
            }) => isActive ? 'active' : ''} onClick={handleDropdownSelect}>
                                <HistoryIcon style={{
                color: 'var(--primary-color)',
                marginRight: '10px'
              }} />
                                {"Login Activity"}
                            </NavLink>
                        </li>
                        <li className="hori-dropdown-divider" aria-hidden="true">
                            <hr />
                        </li>
                        <li>
                            <NavLink to="/Logout" className={({
              isActive
            }) => isActive ? 'active' : ''} onClick={handleDropdownSelect}>
                                <LogoutIcon style={{
                color: 'var(--primary-color)',
                marginRight: '10px'
              }} />
                                {"Logout"}
                            </NavLink>
                        </li>
                    </ul>
                </div>}
        </nav>
    </>;
};
export default HoriNavbar;