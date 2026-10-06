/**
 * Path prefixes that should mark a sidebar NavLink active (list + add/edit/detail routes).
 * Keys match AdminNavbar `to` paths.
 */
const NAV_ACTIVE_PREFIXES = {
    '/Home/Dashboard': ['/Home/Dashboard'],
    '/Home/Business': ['/Home/Business'],
    '/Home/Branches': ['/Home/Branches'],
    '/Users/Customer': ['/Users/Customer'],
    '/System/HelpCenter': ['/System/HelpCenter', '/System/HelpCenterDetail'],
    '/System/Currency': ['/System/Currency', '/System/AddCurrency', '/System/EditCurrency'],
    '/System/Taxes': ['/System/Taxes', '/System/AddTax', '/System/EditTax'],
    '/Attributes/Metal': ['/Attributes/Metal', '/Attributes/AddMetal', '/Attributes/EditMetal'],
    '/Attributes/DiamondSize': ['/Attributes/DiamondSize', '/Attributes/AddDiamondSize', '/Attributes/EditDiamondSize'],
    '/Attributes/RingSize': ['/Attributes/RingSize', '/Attributes/AddRingSize', '/Attributes/EditRingSize'],
    '/Attributes/Shape': ['/Attributes/Shape', '/Attributes/AddShape', '/Attributes/EditShape'],
    '/Attributes/Clarity': ['/Attributes/Clarity', '/Attributes/AddClarity', '/Attributes/EditClarity'],
    '/Attributes/DiamondColor': ['/Attributes/DiamondColor', '/Attributes/AddDiamondColor', '/Attributes/EditDiamondColor'],
    '/Attributes/Stone': ['/Attributes/Stone', '/Attributes/AddStone', '/Attributes/EditStone'],
    '/Attributes/Style': ['/Attributes/Style', '/Attributes/AddStyle', '/Attributes/EditStyle'],
    '/Attributes/Category': ['/Attributes/Category', '/Attributes/AddCategory', '/Attributes/EditCategory'],
    '/System/ContactUs': ['/System/ContactUs'],
    '/System/Subscribers': ['/System/Subscribers'],
    '/System/Setting': ['/System/Setting', '/System/Setting/AddFiscalYear', '/System/Setting/EditFiscalYear'],
};

const matchesPrefix = (pathname, prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`);

/**
 * @param {string} navPath - AdminNavbar NavLink `to` value
 * @param {string} pathname - current location.pathname
 */
export function isAdminNavLinkActive(navPath, pathname) {
    const prefixes = NAV_ACTIVE_PREFIXES[navPath];
    if (prefixes) {
        return prefixes.some((prefix) => matchesPrefix(pathname, prefix));
    }
    return matchesPrefix(pathname, navPath);
}