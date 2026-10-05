import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import HomeIcon from '@mui/icons-material/Home';
import LockResetIcon from '@mui/icons-material/LockReset';
import HistoryIcon from '@mui/icons-material/History';
import BoltIcon from '@mui/icons-material/Bolt';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import StorefrontIcon from '@mui/icons-material/Storefront';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import { useEffect, useMemo, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import ReactWorldFlags from 'react-world-flags';

const Flag = (props) => {
    const Component = typeof ReactWorldFlags === 'function'
        ? ReactWorldFlags
        : (typeof ReactWorldFlags?.default === 'function'
            ? ReactWorldFlags.default
            : ReactWorldFlags?.default?.default || ReactWorldFlags);

    if (typeof Component === 'function') {
        return <Component {...props} />;
    }
    return <span style={{ width: '20px', display: 'inline-block' }}>🏳️</span>;
};
import { useLanguage } from "../../Context/LanguageContext";
import { getLanguageOptions } from "../../constants/languages";
import "../../Scss/Partials/horinavbar.scss";
import profilePlaceholder from '../../assets/profile-placeholder.png';
import Dropdown from '../../Components/Dropdown/Dropdown';
import { useFiscalYear } from '../../Context/FiscalYearContext';

const HoriNavbar = () => {
    const { fiscalYears, selectedFiscalYear, setSelectedFiscalYear } = useFiscalYear();
    const location = useLocation();
    const currentPath = location.pathname;

    const showFiscalYearDropdown = [
        '/',
        '/Home/Dashboard',
        '/Reports/TaxReport'
    ].includes(currentPath);

    const [isDropdownVisible, setDropdownVisible] = useState(false);
    const [isLanguageDropdownVisible, setLanguageDropdownVisible] = useState(false);
    const [isQuickMenuVisible, setQuickMenuVisible] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState(() => localStorage.getItem('selectedLanguage') || 'English');
    const { translations, isRtl } = useLanguage();
    const adminPanelBackendPath = import.meta.env.VITE_BACKEND_URL;
    const tokenname = import.meta.env.VITE_AdminTOKEN_NAME;
    const token = localStorage.getItem(tokenname);
    const [adminProfileImage, setAdminProfileImage] = useState(profilePlaceholder);
    const homeNavlink = import.meta.env.VITE_HOME_URL || '/Home/Dashboard';

    const getFullscreenElement = () =>
        document.fullscreenElement ?? document.webkitFullscreenElement ?? null;

    const [isFullscreen, setIsFullscreen] = useState(() => !getFullscreenElement());

    const sortedLanguages = getLanguageOptions();

    const quickLinks = useMemo(() => [
        { to: "/Home/Dashboard", label: translations.Dashboard, Icon: LeaderboardIcon },
        { to: "/Subscription/Plan", label: translations.Plan, Icon: WorkspacePremiumIcon },
        { to: "/Reports/SubscriptionHistory", label: translations.Subscriptionhistory, Icon: ReceiptLongIcon },
        { to: "/System/Setting", label: translations.Setting, Icon: SettingsIcon },
        { to: "/Home/Business", label: translations.Business, Icon: StorefrontIcon },
        { to: "/Users/Owner", label: translations.Owner, Icon: AccountCircleIcon },
    ], [translations]);

    const toggleDropdown = () => {
        setQuickMenuVisible(false);
        setDropdownVisible((prev) => !prev);
    };
    const toggleLanguageDropdown = () => setLanguageDropdownVisible(!isLanguageDropdownVisible);
    const toggleQuickMenu = () => {
        setDropdownVisible(false);
        setQuickMenuVisible((prev) => !prev);
    };

    const handleLanguageSelect = (language) => {
        setSelectedLanguage(language.name);
        localStorage.setItem('selectedLanguage', language.name);
        setLanguageDropdownVisible(false);
        window.location.reload();
    };

    const handleDropdownSelect = () => setDropdownVisible(false);
    const handleQuickLinkSelect = () => setQuickMenuVisible(false);

    const handleClickOutside = (event) => {
        const languageDropdown = document.querySelector('.language-dropdown');
        const profileSection = document.querySelector('.profile-section');
        const profileDropdown = document.querySelector('.profile-dropdown-menu');
        const quickSection = document.querySelector('.quick-menu-section');
        const quickDropdown = document.querySelector('.quick-dropdown-menu');

        if (languageDropdown && !languageDropdown.contains(event.target)) {
            setLanguageDropdownVisible(false);
        }
        if (
            profileDropdown &&
            !profileDropdown.contains(event.target) &&
            profileSection &&
            !profileSection.contains(event.target)
        ) {
            setDropdownVisible(false);
        }
        if (
            quickDropdown &&
            !quickDropdown.contains(event.target) &&
            quickSection &&
            !quickSection.contains(event.target)
        ) {
            setQuickMenuVisible(false);
        }
    };

    useEffect(() => {
        if (isDropdownVisible || isLanguageDropdownVisible || isQuickMenuVisible) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownVisible, isLanguageDropdownVisible, isQuickMenuVisible]);

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
                if (document.exitFullscreen) await document.exitFullscreen();
                else if (document.webkitExitFullscreen) await document.webkitExitFullscreen();
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
            try {
                let response = await fetch(`${adminPanelBackendPath}/admin/GetAdminDetails`, {
                    method: "GET",
                    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                });
                if (response.status === 404) {
                    response = await fetch(`${adminPanelBackendPath}/General/admin/GetAdminDetails`, {
                        method: "GET",
                        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                    });
                }

                if (response.ok) {
                    const data = await response.json();
                    if (data.admin && data.admin.profileimage) {
                        setAdminProfileImage(data.admin.profileimage);
                    }
                }
            } catch (error) {
                console.log("Error fetching admin profile image:", error);
            }
        };

        fetchAdminProfileImage();
    }, [adminPanelBackendPath, token]);

    return (<>
        <nav className={`hori-navbar ${isRtl ? 'rtl-horinav' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
            {showFiscalYearDropdown && (
                <div className="left-side">
                    <div className="navbar-dropdown-group">
                        <div className="fiscal-year-dropdown-container">
                            <Dropdown
                                options={fiscalYears}
                                selectedValue={selectedFiscalYear}
                                onValueChange={setSelectedFiscalYear}
                                labelKey="fiscalyear"
                                valueKey="fiscalyearid"
                                placeholder={translations.selectfiscalyear}
                                showSearch={false}
                            />
                        </div>
                    </div>
                </div>
            )}
            <div className="right-side">
                <div className={`quick-menu-section${isQuickMenuVisible ? ' is-open' : ''}`} onClick={toggleQuickMenu}>
                    <button type="button" className="quick-menu-btn" aria-label={translations.quick} aria-expanded={isQuickMenuVisible}>
                        <BoltIcon className="quick-menu-icon" />
                    </button>
                </div>
                <button
                    type="button"
                    className="hori-navbar__fullscreen-btn"
                    onClick={handleFullscreenToggle}
                    title={isFullscreen ? translations.exitfullscreen : translations.fullscreen}
                    aria-label={isFullscreen ? translations.exitfullscreen : translations.fullscreen}
                >
                    {isFullscreen ? (
                        <FullscreenExitIcon style={{ fontSize: 22 }} aria-hidden />
                    ) : (
                        <FullscreenIcon style={{ fontSize: 22 }} aria-hidden />
                    )}
                </button>
                <div className="language-dropdown" onClick={toggleLanguageDropdown}>
                    <button type="button">
                        <Flag
                            code={sortedLanguages.find(lang => lang.name === selectedLanguage)?.code}
                            style={{ width: '20px' }}
                            alt={selectedLanguage}
                        />
                        <span className="language-dropdown__name">{selectedLanguage.substring(0, 3)}</span>
                    </button>
                    {isLanguageDropdownVisible && (
                        <div className="language-dropdown-menu">
                            <ul>
                                {sortedLanguages.map((language, index) => (
                                    <li
                                        key={index}
                                        className={language.name === selectedLanguage ? 'selected' : ''}
                                        onClick={() => handleLanguageSelect(language)}
                                    >
                                        <Flag code={language.code} style={{ width: '20px' }} alt={language.name} />
                                        <span className="language-dropdown__name">{language.name}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
                <div className="profile-section" onClick={toggleDropdown}>
                    <img
                        src={adminProfileImage}
                        alt="Profile"
                        className="profile-photo"
                    />
                </div>
            </div>
            {isQuickMenuVisible && (
                <div className="dropdown-menu quick-dropdown-menu" onClick={(e) => e.stopPropagation()}>
                    <ul className="quick-menu-grid">
                        {quickLinks.map(({ to, label, Icon }) => (
                            <li key={to}>
                                <NavLink
                                    to={to}
                                    className={({ isActive }) => (isActive ? "active" : "")}
                                    onClick={handleQuickLinkSelect}
                                    aria-label={label}
                                >
                                    <span className="quick-menu-icon-wrap">
                                        <Icon className="quick-menu-item-icon" />
                                    </span>
                                    <span className="quick-menu-label">{label}</span>
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {isDropdownVisible && (
                <div className="dropdown-menu profile-dropdown-menu" onClick={(e) => e.stopPropagation()}>
                    <ul className="nav-links admintab admintab--hori-dropdown">
                        <li>
                            <NavLink
                                to="/Home/Profile"
                                className={({ isActive }) => (isActive ? 'active' : '')}
                                onClick={handleDropdownSelect}
                            >
                                <PersonIcon style={{ color: 'var(--primary-color)', marginRight: '10px' }} />
                                {translations.Profile}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/Home/ChangePassword"
                                className={({ isActive }) => (isActive ? 'active' : '')}
                                onClick={handleDropdownSelect}
                            >
                                <LockResetIcon style={{ color: 'var(--primary-color)', marginRight: '10px' }} />
                                {translations.ChangePassword}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/Home/LoginActivity"
                                className={({ isActive }) => (isActive ? 'active' : '')}
                                onClick={handleDropdownSelect}
                            >
                                <HistoryIcon style={{ color: 'var(--primary-color)', marginRight: '10px' }} />
                                {translations.LoginActivity}
                            </NavLink>
                        </li>
                        <li className="hori-dropdown-divider" aria-hidden="true">
                            <hr />
                        </li>
                        <li>
                            <NavLink
                                to="/Logout"
                                className={({ isActive }) => (isActive ? 'active' : '')}
                                onClick={handleDropdownSelect}
                            >
                                <LogoutIcon style={{ color: 'var(--primary-color)', marginRight: '10px' }} />
                                {translations.Logout}
                            </NavLink>
                        </li>
                    </ul>
                </div>
            )}
        </nav>
    </>);
};

export default HoriNavbar;