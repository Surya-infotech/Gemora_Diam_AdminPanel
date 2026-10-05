import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import BadgeIcon from '@mui/icons-material/Badge';
import GroupsIcon from '@mui/icons-material/Groups';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import PercentIcon from '@mui/icons-material/Percent';
import SettingsIcon from '@mui/icons-material/Settings';
import StorefrontIcon from '@mui/icons-material/Storefront';
import AddBusinessIcon from '@mui/icons-material/AddBusiness';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import HandshakeIcon from '@mui/icons-material/Handshake';
import Tooltip from '@mui/material/Tooltip';
import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import "../../Scss/Partials/adminnavbar.scss";
import { useLanguage } from "../../Context/LanguageContext";
import { isAdminNavLinkActive } from '../../utils/navActiveMatchers';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import SummarizeIcon from '@mui/icons-material/Summarize';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import ExtensionIcon from '@mui/icons-material/Extension';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import HomeIcon from '@mui/icons-material/Home';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const AdminNavbar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const logoUrl = "/logo.png";
    const { translations, isRtl } = useLanguage();
    const { pathname } = useLocation();
    const navLinkClass = (to) => () => (isAdminNavLinkActive(to, pathname) ? 'active' : '');
    const toggleNavbar = () => setIsCollapsed(prevState => !prevState);

    const [expandedCategories, setExpandedCategories] = useState({
        main: true,
        subscription: false,
        users: false,
        reports: false,
        system: false,
    });

    const getCategoryForPath = (path) => {
        if (path.startsWith('/Home')) return 'main';
        if (path.startsWith('/Subscription')) return 'subscription';
        if (path.startsWith('/Users')) return 'users';
        if (path.startsWith('/Reports')) return 'reports';
        if (path.startsWith('/System')) return 'system';
        return null;
    };

    useEffect(() => {
        const activeCategory = getCategoryForPath(pathname);
        if (activeCategory) {
            setExpandedCategories({
                main: activeCategory === 'main',
                subscription: activeCategory === 'subscription',
                users: activeCategory === 'users',
                reports: activeCategory === 'reports',
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
                    <img src={logoUrl} className="logo-img" alt="Logo" />
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
                        <li>
                            <NavLink to="/Home/Business" className={navLinkClass('/Home/Business')}>
                                <NavTooltip title={translations.Business}>
                                    <StorefrontIcon style={{ color: 'var(--primary-color)', marginRight: isRtl ? 0 : '10px', marginLeft: isRtl ? '10px' : 0 }} />
                                </NavTooltip>
                                {translations.Business}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/Home/Branches" className={navLinkClass('/Home/Branches')}>
                                <NavTooltip title={translations.Branches}>
                                    <AddBusinessIcon style={{ color: 'var(--primary-color)', marginRight: isRtl ? 0 : '10px', marginLeft: isRtl ? '10px' : 0 }} />
                                </NavTooltip>
                                {translations.Branches}
                            </NavLink>
                        </li>
                    </div>
                </div>

                {/* Category 2: Subscription */}
                <NavTooltip title={translations.Subscription}>
                    <div className={`category-trigger ${pathname.startsWith('/Subscription') ? 'active-category' : ''}`} onClick={() => toggleCategory('subscription')}>
                        <div className="category-trigger-left">
                            <WorkspacePremiumIcon className="category-icon" style={{ color: 'var(--primary-color)' }} />
                            {!isCollapsed && <span className="category-title">{translations.Subscription}</span>}
                        </div>
                        {!isCollapsed && (
                            <span className="category-chevron">
                                <CategoryChevron isExpanded={expandedCategories.subscription} />
                            </span>
                        )}
                    </div>
                </NavTooltip>
                <div className={`submenu ${(expandedCategories.subscription && !isCollapsed) ? 'expanded' : ''}`}>
                    <div className="submenu-content">
                        <li>
                            <NavLink to="/Subscription/Plan" className={navLinkClass('/Subscription/Plan')}>
                                <NavTooltip title={translations.Plan}>
                                    <WorkspacePremiumIcon style={{ color: 'var(--primary-color)', marginRight: isRtl ? 0 : '10px', marginLeft: isRtl ? '10px' : 0 }} />
                                </NavTooltip>
                                {translations.Plan}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/Subscription/Addon" className={navLinkClass('/Subscription/Addon')}>
                                <NavTooltip title={translations.Addon}>
                                    <ExtensionIcon style={{ color: 'var(--primary-color)', marginRight: isRtl ? 0 : '10px', marginLeft: isRtl ? '10px' : 0 }} />
                                </NavTooltip>
                                {translations.Addon}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/Subscription/Coupon" className={navLinkClass('/Subscription/Coupon')}>
                                <NavTooltip title={translations.Coupon}>
                                    <LocalOfferIcon style={{ color: 'var(--primary-color)', marginRight: isRtl ? 0 : '10px', marginLeft: isRtl ? '10px' : 0 }} />
                                </NavTooltip>
                                {translations.Coupon}
                            </NavLink>
                        </li>
                    </div>
                </div>

                {/* Category 3: Users */}
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
                            <NavLink to="/Users/Owner" className={navLinkClass('/Users/Owner')}>
                                <NavTooltip title={translations.Owner}>
                                    <AccountCircleIcon style={{ color: 'var(--primary-color)', marginRight: isRtl ? 0 : '10px', marginLeft: isRtl ? '10px' : 0 }} />
                                </NavTooltip>
                                {translations.Owner}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/Users/Employee" className={navLinkClass('/Users/Employee')}>
                                <NavTooltip title={translations.Employee}>
                                    <BadgeIcon style={{ color: 'var(--primary-color)', marginRight: isRtl ? 0 : '10px', marginLeft: isRtl ? '10px' : 0 }} />
                                </NavTooltip>
                                {translations.Employee}
                            </NavLink>
                        </li>
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

                {/* Category 4: Reports */}
                <NavTooltip title={translations.Reports}>
                    <div className={`category-trigger ${pathname.startsWith('/Reports') ? 'active-category' : ''}`} onClick={() => toggleCategory('reports')}>
                        <div className="category-trigger-left">
                            <TrendingUpIcon className="category-icon" style={{ color: 'var(--primary-color)' }} />
                            {!isCollapsed && <span className="category-title">{translations.Reports}</span>}
                        </div>
                        {!isCollapsed && (
                            <span className="category-chevron">
                                <CategoryChevron isExpanded={expandedCategories.reports} />
                            </span>
                        )}
                    </div>
                </NavTooltip>
                <div className={`submenu ${(expandedCategories.reports && !isCollapsed) ? 'expanded' : ''}`}>
                    <div className="submenu-content">
                        <li>
                            <NavLink to="/Reports/SubscriptionHistory" className={navLinkClass('/Reports/SubscriptionHistory')}>
                                <NavTooltip title={translations.Subscriptionhistory}>
                                    <ReceiptLongIcon style={{ color: 'var(--primary-color)', marginRight: isRtl ? 0 : '10px', marginLeft: isRtl ? '10px' : 0 }} />
                                </NavTooltip>
                                {translations.Subscriptionhistory}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/Reports/TaxReport" className={navLinkClass('/Reports/TaxReport')}>
                                <NavTooltip title={translations.TaxReport}>
                                    <SummarizeIcon style={{ color: 'var(--primary-color)', marginRight: isRtl ? 0 : '10px', marginLeft: isRtl ? '10px' : 0 }} />
                                </NavTooltip>
                                {translations.TaxReport}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/Reports/ReferralHistory" className={navLinkClass('/Reports/ReferralHistory')}>
                                <NavTooltip title={translations.referralhistory}>
                                    <GroupsIcon style={{ color: 'var(--primary-color)', marginRight: isRtl ? 0 : '10px', marginLeft: isRtl ? '10px' : 0 }} />
                                </NavTooltip>
                                {translations.referralhistory}
                            </NavLink>
                        </li>
                    </div>
                </div>

                {/* Category 5: System */}
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
                                <NavTooltip title={translations.Pages}>
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
                            <NavLink to="/System/PartnerApplications" className={navLinkClass('/System/PartnerApplications')}>
                                <NavTooltip title={translations.PartnerApplications}>
                                    <HandshakeIcon style={{ color: 'var(--primary-color)', marginRight: isRtl ? 0 : '10px', marginLeft: isRtl ? '10px' : 0 }} />
                                </NavTooltip>
                                {translations.PartnerApplications}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/System/WhiteLabelInquiries" className={navLinkClass('/System/WhiteLabelInquiries')}>
                                <NavTooltip title={translations.WhiteLabelInquiries}>
                                    <AutoAwesomeIcon style={{ color: 'var(--primary-color)', marginRight: isRtl ? 0 : '10px', marginLeft: isRtl ? '10px' : 0 }} />
                                </NavTooltip>
                                {translations.WhiteLabelInquiries}
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