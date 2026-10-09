import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
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
import { usePermissions } from '../../Hooks/usePermissions';
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
import CategoryIcon from '@mui/icons-material/Category';
import InterestsIcon from '@mui/icons-material/Interests';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import TokenIcon from '@mui/icons-material/Token';
import StyleIcon from '@mui/icons-material/Style';
import GridViewIcon from '@mui/icons-material/GridView';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import LiveHelpIcon from '@mui/icons-material/LiveHelp';
import PolicyIcon from '@mui/icons-material/Policy';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import BadgeIcon from '@mui/icons-material/Badge';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import ViewCarouselIcon from '@mui/icons-material/ViewCarousel';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';

const AdminNavbar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const logoUrl = "/logo.png";
    const { translations, isRtl } = useLanguage();
    const { canView, isEmployee } = usePermissions();
    const { pathname } = useLocation();
    const navLinkClass = (to) => () => (isAdminNavLinkActive(to, pathname) ? 'active' : '');
    const toggleNavbar = () => setIsCollapsed(prevState => !prevState);

    const attributeNavItems = [
        { id: 'metal', label: translations.Metal, to: '/Attributes/Metal', Icon: DiamondIcon },
        { id: 'diamondSize', label: translations.DiamondSize, to: '/Attributes/DiamondSize', Icon: AutoAwesomeIcon },
        { id: 'shape', label: translations.Shape, to: '/Attributes/Shape', Icon: InterestsIcon },
        { id: 'clarity', label: translations.Clarity, to: '/Attributes/Clarity', Icon: VisibilityIcon },
        { id: 'color', label: translations.Color, to: '/Attributes/Color', Icon: ColorLensIcon },
        { id: 'stone', label: translations.Stone, to: '/Attributes/Stone', Icon: TokenIcon },
        { id: 'style', label: translations.Style, to: '/Attributes/Style', Icon: StyleIcon },
        { id: 'category', label: translations.Category, to: '/Attributes/Category', Icon: GridViewIcon },
        { id: 'subCategory', label: translations.SubCategory, to: '/Attributes/SubCategory', Icon: AccountTreeIcon },
    ];
    const visibleAttributeItems = attributeNavItems.filter(item => canView(item.id));
    const showAttributes = visibleAttributeItems.length > 0;
    const showProducts = canView('item');

    const isProductsActive =
        pathname.startsWith('/Products');

    const isSupportActive =
        pathname.startsWith('/Support');

    const isUserActive =
        pathname.startsWith('/User');

    const isSystemActive =
        pathname.startsWith('/System');

    const [expandedCategories, setExpandedCategories] = useState({
        main: true,
        products: false,
        attributes: false,
        support: false,
        user: false,
        system: false,
    });

    const getCategoryForPath = (path) => {
        if (path.startsWith('/Home')) return 'main';
        if (path.startsWith('/Products')) return 'products';
        if (path.startsWith('/Attributes')) return 'attributes';
        if (path.startsWith('/Support')) return 'support';
        if (path.startsWith('/User')) return 'user';
        if (path.startsWith('/System')) return 'system';
        return null;
    };

    useEffect(() => {
        const activeCategory = getCategoryForPath(pathname);
        if (activeCategory) {
            setExpandedCategories({
                main: activeCategory === 'main',
                products: activeCategory === 'products',
                attributes: activeCategory === 'attributes',
                support: activeCategory === 'support',
                user: activeCategory === 'user',
                system: activeCategory === 'system',
            });
        }
    }, [pathname]);

    const toggleCategory = (categoryKey) => {
        if (isCollapsed) {
            setIsCollapsed(false);
            setExpandedCategories({
                main: categoryKey === 'main',
                products: categoryKey === 'products',
                attributes: categoryKey === 'attributes',
                support: categoryKey === 'support',
                user: categoryKey === 'user',
                system: categoryKey === 'system',
            });
        } else {
            setExpandedCategories(prev => {
                const nextState = !prev[categoryKey];
                return {
                    main: categoryKey === 'main' ? nextState : false,
                    products: categoryKey === 'products' ? nextState : false,
                    attributes: categoryKey === 'attributes' ? nextState : false,
                    support: categoryKey === 'support' ? nextState : false,
                    user: categoryKey === 'user' ? nextState : false,
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
                <Link to={isEmployee ? "/Home/EmployeeDashboard" : "/Home/Dashboard"} className='logoimage'>
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
                            <NavLink to={isEmployee ? "/Home/EmployeeDashboard" : "/Home/Dashboard"} className={navLinkClass(isEmployee ? '/Home/EmployeeDashboard' : '/Home/Dashboard')}>
                                <NavTooltip title={translations.Dashboard}>
                                    <LeaderboardIcon style={{ color: 'var(--primary-color)', marginRight: isRtl ? 0 : '10px', marginLeft: isRtl ? '10px' : 0 }} />
                                </NavTooltip>
                                {translations.Dashboard}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/Home/Order" className={navLinkClass('/Home/Order')}>
                                <NavTooltip title={translations.Order}>
                                    <ShoppingBagIcon style={{ color: 'var(--primary-color)', marginRight: isRtl ? 0 : '10px', marginLeft: isRtl ? '10px' : 0 }} />
                                </NavTooltip>
                                {translations.Order}
                            </NavLink>
                        </li>
                    </div>
                </div>

                {/* Category 2: Products */}
                {showProducts && (
                    <>
                        <NavTooltip title={translations.Products}>
                            <div className={`category-trigger ${isProductsActive ? 'active-category' : ''}`} onClick={() => toggleCategory('products')}>
                                <div className="category-trigger-left">
                                    <Inventory2Icon className="category-icon" style={{ color: 'var(--primary-color)' }} />
                                    {!isCollapsed && <span className="category-title">{translations.Products}</span>}
                                </div>
                                {!isCollapsed && (
                                    <span className="category-chevron">
                                        <CategoryChevron isExpanded={expandedCategories.products} />
                                    </span>
                                )}
                            </div>
                        </NavTooltip>
                        <div className={`submenu ${(expandedCategories.products && !isCollapsed) ? 'expanded' : ''}`}>
                            <div className="submenu-content">
                                <li>
                                    <NavLink to="/Products/Item" className={navLinkClass('/Products/Item')}>
                                        <NavTooltip title={translations.Item}>
                                            <LocalOfferIcon style={{ color: 'var(--primary-color)', marginRight: isRtl ? 0 : '10px', marginLeft: isRtl ? '10px' : 0 }} />
                                        </NavTooltip>
                                        {translations.Item}
                                    </NavLink>
                                </li>
                            </div>
                        </div>
                    </>
                )}

                {/* Category 3: Attributes */}
                {showAttributes && (
                    <>
                        <NavTooltip title={translations.Attributes}>
                            <div className={`category-trigger ${pathname.startsWith('/Attributes') ? 'active-category' : ''}`} onClick={() => toggleCategory('attributes')}>
                                <div className="category-trigger-left">
                                    <CategoryIcon className="category-icon" style={{ color: 'var(--primary-color)' }} />
                                    {!isCollapsed && <span className="category-title">{translations.Attributes}</span>}
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
                                {visibleAttributeItems.map(({ id, label, to, Icon }) => (
                                    <li key={id}>
                                        <NavLink to={to} className={navLinkClass(to)}>
                                            <NavTooltip title={label}>
                                                <Icon style={{ color: 'var(--primary-color)', marginRight: isRtl ? 0 : '10px', marginLeft: isRtl ? '10px' : 0 }} />
                                            </NavTooltip>
                                            {label}
                                        </NavLink>
                                    </li>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {/* Category 4: Content & Support (Admin only) */}
                {!isEmployee && (
                    <>
                        <NavTooltip title={translations.contentsupport}>
                            <div className={`category-trigger ${isSupportActive ? 'active-category' : ''}`} onClick={() => toggleCategory('support')}>
                                <div className="category-trigger-left">
                                    <SupportAgentIcon className="category-icon" style={{ color: 'var(--primary-color)' }} />
                                    {!isCollapsed && <span className="category-title">{translations.contentsupport}</span>}
                                </div>
                                {!isCollapsed && (
                                    <span className="category-chevron">
                                        <CategoryChevron isExpanded={expandedCategories.support} />
                                    </span>
                                )}
                            </div>
                        </NavTooltip>
                        <div className={`submenu ${(expandedCategories.support && !isCollapsed) ? 'expanded' : ''}`}>
                            <div className="submenu-content">
                                <li>
                                    <NavLink to="/Support/ContactUs" className={navLinkClass('/Support/ContactUs')}>
                                        <NavTooltip title={translations.ContactUs}>
                                            <ContactMailIcon style={{ color: 'var(--primary-color)', marginRight: isRtl ? 0 : '10px', marginLeft: isRtl ? '10px' : 0 }} />
                                        </NavTooltip>
                                        {translations.ContactUs}
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/Support/Subscribers" className={navLinkClass('/Support/Subscribers')}>
                                        <NavTooltip title={translations.Subscribers}>
                                            <MarkEmailReadIcon style={{ color: 'var(--primary-color)', marginRight: isRtl ? 0 : '10px', marginLeft: isRtl ? '10px' : 0 }} />
                                        </NavTooltip>
                                        {translations.Subscribers}
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/Support/FAQ" className={navLinkClass('/Support/FAQ')}>
                                        <NavTooltip title={translations.FAQ}>
                                            <LiveHelpIcon style={{ color: 'var(--primary-color)', marginRight: isRtl ? 0 : '10px', marginLeft: isRtl ? '10px' : 0 }} />
                                        </NavTooltip>
                                        {translations.FAQ}
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/Support/Policy" className={navLinkClass('/Support/Policy')}>
                                        <NavTooltip title={translations.Policy}>
                                            <PolicyIcon style={{ color: 'var(--primary-color)', marginRight: isRtl ? 0 : '10px', marginLeft: isRtl ? '10px' : 0 }} />
                                        </NavTooltip>
                                        {translations.Policy}
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/Support/Banner" className={navLinkClass('/Support/Banner')}>
                                        <NavTooltip title={translations.Banner}>
                                            <ViewCarouselIcon style={{ color: 'var(--primary-color)', marginRight: isRtl ? 0 : '10px', marginLeft: isRtl ? '10px' : 0 }} />
                                        </NavTooltip>
                                        {translations.Banner}
                                    </NavLink>
                                </li>
                            </div>
                        </div>
                    </>
                )}

                {/* Category 5: User (Admin only) */}
                {!isEmployee && (
                    <>
                        <NavTooltip title={translations.User}>
                            <div className={`category-trigger ${isUserActive ? 'active-category' : ''}`} onClick={() => toggleCategory('user')}>
                                <div className="category-trigger-left">
                                    <ManageAccountsIcon className="category-icon" style={{ color: 'var(--primary-color)' }} />
                                    {!isCollapsed && <span className="category-title">{translations.User}</span>}
                                </div>
                                {!isCollapsed && (
                                    <span className="category-chevron">
                                        <CategoryChevron isExpanded={expandedCategories.user} />
                                    </span>
                                )}
                            </div>
                        </NavTooltip>
                        <div className={`submenu ${(expandedCategories.user && !isCollapsed) ? 'expanded' : ''}`}>
                            <div className="submenu-content">
                                <li>
                                    <NavLink to="/User/Employee" className={navLinkClass('/User/Employee')}>
                                        <NavTooltip title={translations.Employee}>
                                            <BadgeIcon style={{ color: 'var(--primary-color)', marginRight: isRtl ? 0 : '10px', marginLeft: isRtl ? '10px' : 0 }} />
                                        </NavTooltip>
                                        {translations.Employee}
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/User/Customer" className={navLinkClass('/User/Customer')}>
                                        <NavTooltip title={translations.Customer}>
                                            <PeopleAltIcon style={{ color: 'var(--primary-color)', marginRight: isRtl ? 0 : '10px', marginLeft: isRtl ? '10px' : 0 }} />
                                        </NavTooltip>
                                        {translations.Customer}
                                    </NavLink>
                                </li>
                            </div>
                        </div>
                    </>
                )}

                {/* Category 6: System (Admin only) */}
                {!isEmployee && (
                    <>
                        <NavTooltip title={translations.System}>
                            <div className={`category-trigger ${isSystemActive ? 'active-category' : ''}`} onClick={() => toggleCategory('system')}>
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
                                    <NavLink to="/System/Setting" className={navLinkClass('/System/Setting')}>
                                        <NavTooltip title={translations.Setting}>
                                            <SettingsIcon style={{ color: 'var(--primary-color)', marginRight: isRtl ? 0 : '10px', marginLeft: isRtl ? '10px' : 0 }} />
                                        </NavTooltip>
                                        {translations.Setting}
                                    </NavLink>
                                </li>
                            </div>
                        </div>
                    </>
                )}
            </ul>
        </nav>
    </>);
};

export default AdminNavbar;