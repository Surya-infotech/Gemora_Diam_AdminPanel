import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import GroupsIcon from '@mui/icons-material/Groups';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import PercentIcon from '@mui/icons-material/Percent';
import SettingsIcon from '@mui/icons-material/Settings';
import Tooltip from '@mui/material/Tooltip';
import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import "../../Scss/Partials/adminnavbar.scss";
import { useLanguage } from "../../Context/LanguageContext";
import { isAdminNavLinkActive } from '../../utils/navActiveMatchers';
import DiamondIcon from '@mui/icons-material/Diamond';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import HomeIcon from '@mui/icons-material/Home';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import PeopleIcon from '@mui/icons-material/People';
import CategoryIcon from '@mui/icons-material/Category';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import InterestsIcon from '@mui/icons-material/Interests';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import TokenIcon from '@mui/icons-material/Token';
import StyleIcon from '@mui/icons-material/Style';
import GridViewIcon from '@mui/icons-material/GridView';
import LiveHelpIcon from '@mui/icons-material/LiveHelp';
import PolicyIcon from '@mui/icons-material/Policy';

const AdminNavbar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const logoUrl = "/logo.png";
    const { translations, isRtl } = useLanguage();
    const { pathname } = useLocation();
    const navLinkClass = (to) => () => (isAdminNavLinkActive(to, pathname) ? 'active' : '');
    const toggleNavbar = () => setIsCollapsed(prevState => !prevState);

    const [expandedCategories, setExpandedCategories] = useState({
        main: true,
        users: false,
        attributes: false,
        system: false,
    });

    const getCategoryForPath = (path) => {
        if (path.startsWith('/Home')) return 'main';
        if (path.startsWith('/Users')) return 'users';
        if (path.startsWith('/Attributes')) return 'attributes';
        if (path.startsWith('/System')) return 'system';
        return null;
    };

    useEffect(() => {
        const activeCategory = getCategoryForPath(pathname);
        if (activeCategory) {
            setExpandedCategories({
                main: activeCategory === 'main',
                users: activeCategory === 'users',
                attributes: activeCategory === 'attributes',
                system: activeCategory === 'system',
            });
        }
    }, [pathname]);

    const toggleCategory = (categoryKey) => {
        if (isCollapsed) {
            setIsCollapsed(false);
            setExpandedCategories({
                main: categoryKey === 'main',
                subscription: categoryKey === 'subscription',
                users: categoryKey === 'users',
                attributes: categoryKey === 'attributes',
                reports: categoryKey === 'reports',
                system: categoryKey === 'system',
            });
        } else {
            setExpandedCategories(prev => {
                const nextState = !prev[categoryKey];
                return {
                    main: categoryKey === 'main' ? nextState : false,
                    subscription: categoryKey === 'subscription' ? nextState : false,
                    users: categoryKey === 'users' ? nextState : false,
                    attributes: categoryKey === 'attributes' ? nextState : false,
                    reports: categoryKey === 'reports' ? nextState : false,
                    system: categoryKey === 'system' ? nextState : false,
                };
            });
        }
    };

    useEffect(() => {
        const left80 = 'body-move-left-80';
        const left150 = 'body-move-left-150';
        const right80 = 'body-move-right-80';
        const right150 = 'body-move-right-150';

        if (isRtl) {
            document.body.classList.remove(left80, left150);
            if (isCollapsed) {
                document.body.classList.add(right80);
                document.body.classList.remove(right150);
            } else {
                document.body.classList.add(right150);
                document.body.classList.remove(right80);
            }
        } else {
            document.body.classList.remove(right80, right150);
            if (isCollapsed) {
                document.body.classList.add(left80);
                document.body.classList.remove(left150);
            } else {
                document.body.classList.add(left150);
                document.body.classList.remove(left80);
            }
        }
        return () => {
            document.body.classList.remove(left80, left150, right80, right150);
        };
    }, [isCollapsed, isRtl]);

    const NavTooltip = ({ title, children }) => {
        if (!isCollapsed) return children;
        return (
            <Tooltip title={title} placement={isRtl ? "left" : "right"} arrow disableFocusListener disableTouchListener>
                {children}
            </Tooltip>
        );
    };

    const CategoryChevron = ({ isExpanded }) => {
        if (isExpanded) return <ExpandMoreIcon />;
        return isRtl ? <ChevronLeftIcon /> : <ChevronRightIcon />;
    };

    return (<>
        <nav className={`navbar ${isCollapsed ? 'collapsed' : ''} ${isRtl ? 'rtl-navbar' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="logo">
                <Link to="/Home/Dashboard" className='logoimage'>
                    <img src={logoUrl} className="logo-img" alt={translations.logo} />
                </Link>
                <div className={`arrowdiv ${isCollapsed ? 'collapsed' : ''}`}>
                    {isRtl ? (
                        isCollapsed ? (
                            <KeyboardArrowLeftIcon className="arrow-icon" onClick={toggleNavbar} />
                        ) : (
                            <KeyboardArrowRightIcon className="arrow-icon" onClick={toggleNavbar} />
                        )
                    ) : (
                        isCollapsed ? (
                            <KeyboardArrowRightIcon className="arrow-icon" onClick={toggleNavbar} />
                        ) : (
                            <KeyboardArrowLeftIcon className="arrow-icon" onClick={toggleNavbar} />
                        )
                    )}
                </div>
            </div>
            <ul className="nav-links admintab">
                {/* Category 1: Main */}
                <NavTooltip title={translations.Main}>
                    <div className={`category-trigger ${pathname.startsWith('/Home') ? 'active-category' : ''}`} onClick={() => toggleCategory('main')}>
                        <div className="category-trigger-left">
                            <HomeIcon className="category-icon" style={{ color: 'var(--primary-color)' }} />
                            {!isCollapsed && <span className="category-title">{translations.Main}</span>}
                        </div>
                        {!isCollapsed && (
                            <span className="category-chevron">
                                <CategoryChevron isExpanded={expandedCategories.main} />
                            </span>
                        )}
                    </div>
                </NavTooltip>
                <div className={`submenu ${(expandedCategories.main && !isCollapsed) ? 'expanded' : ''}`}>
                    <div className="submenu-content">
                        <li>
                            <NavLink to="/Home/Dashboard" className={navLinkClass('/Home/Dashboard')}>
                                <NavTooltip title={translations.Dashboard}>
                                    <LeaderboardIcon style={{ color: 'var(--primary-color)', marginRight: isRtl ? 0 : '10px', marginLeft: isRtl ? '10px' : 0 }} />
                                </NavTooltip>
                                {translations.Dashboard}
                            </NavLink>
                        </li>
                    </div>
                </div>

                {/* Category 2: Users */}
                <NavTooltip title={translations.Users}>
                    <div className={`category-trigger ${pathname.startsWith('/Users') ? 'active-category' : ''}`} onClick={() => toggleCategory('users')}>
                        <div className="category-trigger-left">
                            <PeopleIcon className="category-icon" style={{ color: 'var(--primary-color)' }} />
                            {!isCollapsed && <span className="category-title">{translations.Users}</span>}
                        </div>
                        {!isCollapsed && (
                            <span className="category-chevron">
                                <CategoryChevron isExpanded={expandedCategories.users} />
                            </span>
                        )}
                    </div>
                </NavTooltip>
                <div className={`submenu ${(expandedCategories.users && !isCollapsed) ? 'expanded' : ''}`}>
                    <div className="submenu-content">
                        <li>
                            <NavLink to="/Users/Customer" className={navLinkClass('/Users/Customer')}>
                                <NavTooltip title={translations.Customer}>
                                    <GroupsIcon style={{ color: 'var(--primary-color)', marginRight: isRtl ? 0 : '10px', marginLeft: isRtl ? '10px' : 0 }} />
                                </NavTooltip>
                                {translations.Customer}
                            </NavLink>
                        </li>
                    </div>
                </div>

                {/* Category: Attributes */}
                <NavTooltip title={translations.Attributes || "Attributes"}>
                    <div className={`category-trigger ${pathname.startsWith('/Attributes') ? 'active-category' : ''}`} onClick={() => toggleCategory('attributes')}>
                        <div className="category-trigger-left">
                            <CategoryIcon className="category-icon" style={{ color: 'var(--primary-color)' }} />
                            {!isCollapsed && <span className="category-title">{translations.Attributes || "Attributes"}</span>}
                        </div>
                        {!isCollapsed && (
                            <span className="category-chevron">
                                <CategoryChevron isExpanded={expandedCategories.attributes} />
                            </span>
                        )}
                    </div>
                </NavTooltip>
                <div className={`submenu ${(expandedCategories.attributes && !isCollapsed) ? 'expanded' : ''}`}>
                    <div className="submenu-content">
                        <li>
                            <NavLink to="/Attributes/Metal" className={navLinkClass('/Attributes/Metal')}>
                                <NavTooltip title={translations.Metal || "Metal"}>
                                    <DiamondIcon style={{ color: 'var(--primary-color)', marginRight: isRtl ? 0 : '10px', marginLeft: isRtl ? '10px' : 0 }} />
                                </NavTooltip>
                                {translations.Metal || "Metal"}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/Attributes/DiamondSize" className={navLinkClass('/Attributes/DiamondSize')}>
                                <NavTooltip title={translations.DiamondSize || "Diamond Size"}>
                                    <AutoAwesomeIcon style={{ color: 'var(--primary-color)', marginRight: isRtl ? 0 : '10px', marginLeft: isRtl ? '10px' : 0 }} />
                                </NavTooltip>
                                {translations.DiamondSize || "Diamond Size"}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/Attributes/RingSize" className={navLinkClass('/Attributes/RingSize')}>
                                <NavTooltip title={translations.RingSize || "Ring Size"}>
                                    <RadioButtonUncheckedIcon style={{ color: 'var(--primary-color)', marginRight: isRtl ? 0 : '10px', marginLeft: isRtl ? '10px' : 0 }} />
                                </NavTooltip>
                                {translations.RingSize || "Ring Size"}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/Attributes/Shape" className={navLinkClass('/Attributes/Shape')}>
                                <NavTooltip title={translations.Shape || "Shape"}>
                                    <InterestsIcon style={{ color: 'var(--primary-color)', marginRight: isRtl ? 0 : '10px', marginLeft: isRtl ? '10px' : 0 }} />
                                </NavTooltip>
                                {translations.Shape || "Shape"}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/Attributes/Clarity" className={navLinkClass('/Attributes/Clarity')}>
                                <NavTooltip title={translations.Clarity || "Clarity"}>
                                    <VisibilityIcon style={{ color: 'var(--primary-color)', marginRight: isRtl ? 0 : '10px', marginLeft: isRtl ? '10px' : 0 }} />
                                </NavTooltip>
                                {translations.Clarity || "Clarity"}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/Attributes/DiamondColor" className={navLinkClass('/Attributes/DiamondColor')}>
                                <NavTooltip title={translations.DiamondColor || "Diamond Color"}>
                                    <ColorLensIcon style={{ color: 'var(--primary-color)', marginRight: isRtl ? 0 : '10px', marginLeft: isRtl ? '10px' : 0 }} />
                                </NavTooltip>
                                {translations.DiamondColor || "Diamond Color"}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/Attributes/Stone" className={navLinkClass('/Attributes/Stone')}>
                                <NavTooltip title={translations.Stone || "Stone"}>
                                    <TokenIcon style={{ color: 'var(--primary-color)', marginRight: isRtl ? 0 : '10px', marginLeft: isRtl ? '10px' : 0 }} />
                                </NavTooltip>
                                {translations.Stone || "Stone"}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/Attributes/Style" className={navLinkClass('/Attributes/Style')}>
                                <NavTooltip title={translations.Style || "Style"}>
                                    <StyleIcon style={{ color: 'var(--primary-color)', marginRight: isRtl ? 0 : '10px', marginLeft: isRtl ? '10px' : 0 }} />
                                </NavTooltip>
                                {translations.Style || "Style"}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/Attributes/Category" className={navLinkClass('/Attributes/Category')}>
                                <NavTooltip title={translations.Category || "Category"}>
                                    <GridViewIcon style={{ color: 'var(--primary-color)', marginRight: isRtl ? 0 : '10px', marginLeft: isRtl ? '10px' : 0 }} />
                                </NavTooltip>
                                {translations.Category || "Category"}
                            </NavLink>
                        </li>
                    </div>
                </div>

                {/* Category 4: System */}
                <NavTooltip title={translations.System}>
                    <div className={`category-trigger ${pathname.startsWith('/System') ? 'active-category' : ''}`} onClick={() => toggleCategory('system')}>
                        <div className="category-trigger-left">
                            <SettingsIcon className="category-icon" style={{ color: 'var(--primary-color)' }} />
                            {!isCollapsed && <span className="category-title">{translations.System}</span>}
                        </div>
                        {!isCollapsed && (
                            <span className="category-chevron">
                                <CategoryChevron isExpanded={expandedCategories.system} />
                            </span>
                        )}
                    </div>
                </NavTooltip>
                <div className={`submenu ${(expandedCategories.system && !isCollapsed) ? 'expanded' : ''}`}>
                    <div className="submenu-content">
                        <li>
                            <NavLink to="/System/HelpCenter" className={navLinkClass('/System/HelpCenter')}>
                                <NavTooltip title={translations.helpcenter}>
                                    <SupportAgentIcon style={{ color: 'var(--primary-color)', marginRight: isRtl ? 0 : '10px', marginLeft: isRtl ? '10px' : 0 }} />
                                </NavTooltip>
                                {translations.helpcenter}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/System/Currency" className={navLinkClass('/System/Currency')}>
                                <NavTooltip title={translations.currency}>
                                    <AttachMoneyIcon style={{ color: 'var(--primary-color)', marginRight: isRtl ? 0 : '10px', marginLeft: isRtl ? '10px' : 0 }} />
                                </NavTooltip>
                                {translations.currency}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/System/Taxes" className={navLinkClass('/System/Taxes')}>
                                <NavTooltip title={translations.Taxes}>
                                    <PercentIcon style={{ color: 'var(--primary-color)', marginRight: isRtl ? 0 : '10px', marginLeft: isRtl ? '10px' : 0 }} />
                                </NavTooltip>
                                {translations.Taxes}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/System/ContactUs" className={navLinkClass('/System/ContactUs')}>
                                <NavTooltip title={translations.ContactUs}>
                                    <ContactMailIcon style={{ color: 'var(--primary-color)', marginRight: isRtl ? 0 : '10px', marginLeft: isRtl ? '10px' : 0 }} />
                                </NavTooltip>
                                {translations.ContactUs}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/System/FAQ" className={navLinkClass('/System/FAQ')}>
                                <NavTooltip title={translations.FAQ || "FAQ"}>
                                    <LiveHelpIcon style={{ color: 'var(--primary-color)', marginRight: isRtl ? 0 : '10px', marginLeft: isRtl ? '10px' : 0 }} />
                                </NavTooltip>
                                {translations.FAQ || "FAQ"}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/System/Policy" className={navLinkClass('/System/Policy')}>
                                <NavTooltip title={translations.Policy || "Policy"}>
                                    <PolicyIcon style={{ color: 'var(--primary-color)', marginRight: isRtl ? 0 : '10px', marginLeft: isRtl ? '10px' : 0 }} />
                                </NavTooltip>
                                {translations.Policy || "Policy"}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/System/Subscribers" className={navLinkClass('/System/Subscribers')}>
                                <NavTooltip title={translations.Subscribers}>
                                    <MarkEmailReadIcon style={{ color: 'var(--primary-color)', marginRight: isRtl ? 0 : '10px', marginLeft: isRtl ? '10px' : 0 }} />
                                </NavTooltip>
                                {translations.Subscribers}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/System/Setting" className={navLinkClass('/System/Setting')}>
                                <NavTooltip title={translations.Setting}>
                                    <SettingsIcon style={{ color: 'var(--primary-color)', marginRight: isRtl ? 0 : '10px', marginLeft: isRtl ? '10px' : 0 }} />
                                </NavTooltip>
                                {translations.Setting}
                            </NavLink>
                        </li>
                    </div>
                </div>
            </ul>
        </nav>
    </>);
};

export default AdminNavbar;