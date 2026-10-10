/**
 * Path prefixes that should mark a sidebar NavLink active (list + add/edit/detail routes).
 * Keys match AdminNavbar `to` paths.
 */
const NAV_ACTIVE_PREFIXES = {
    '/Home/Dashboard': ['/Home/Dashboard', '/Home/EmployeeDashboard'],
    '/Home/EmployeeDashboard': ['/Home/EmployeeDashboard', '/Home/Dashboard'],
    '/Home/Order': ['/Home/Order', '/Home/OrderDetails', '/Home/OrderOverview'],
    '/Products/Item': ['/Products/Item', '/Products/AddItem', '/Products/EditItem', '/Products/ItemOverview'],
    '/System/Currency': ['/System/Currency', '/System/AddCurrency', '/System/EditCurrency'],
    '/System/Taxes': ['/System/Taxes', '/System/AddTax', '/System/EditTax'],
    '/Attributes/Metal': ['/Attributes/Metal', '/Attributes/AddMetal', '/Attributes/EditMetal'],
    '/Attributes/DiamondSize': ['/Attributes/DiamondSize', '/Attributes/AddDiamondSize', '/Attributes/EditDiamondSize'],
    '/Attributes/Shape': ['/Attributes/Shape', '/Attributes/AddShape', '/Attributes/EditShape'],
    '/Attributes/Clarity': ['/Attributes/Clarity', '/Attributes/AddClarity', '/Attributes/EditClarity'],
    '/Attributes/Color': ['/Attributes/Color', '/Attributes/AddColor', '/Attributes/EditColor'],
    '/Attributes/Stone': ['/Attributes/Stone', '/Attributes/AddStone', '/Attributes/EditStone'],
    '/Attributes/Style': ['/Attributes/Style', '/Attributes/AddStyle', '/Attributes/EditStyle'],
    '/Attributes/Category': ['/Attributes/Category', '/Attributes/AddCategory', '/Attributes/EditCategory'],
    '/Attributes/SubCategory': ['/Attributes/SubCategory', '/Attributes/AddSubCategory', '/Attributes/EditSubCategory'],
    '/Support/ContactUs': ['/Support/ContactUs'],
    '/Support/FAQ': ['/Support/FAQ', '/Support/AddFAQ', '/Support/EditFAQ'],
    '/Support/Policy': ['/Support/Policy', '/Support/AddPolicy', '/Support/EditPolicy'],
    '/Support/Banner': ['/Support/Banner', '/Support/AddBanner', '/Support/EditBanner'],
    '/Support/CollectionBanner': ['/Support/CollectionBanner', '/Support/AddCollectionBanner', '/Support/EditCollectionBanner'],
    '/Support/Menu': ['/Support/Menu', '/Support/AddMenu', '/Support/EditMenu'],
    '/Support/AboutUs': ['/Support/AboutUs'],
    '/Support/Subscribers': ['/Support/Subscribers'],
    '/System/Setting': ['/System/Setting', '/System/Setting/AddFiscalYear', '/System/Setting/EditFiscalYear'],
    '/User/Employee': ['/User/Employee', '/User/AddEmployee', '/User/EditEmployee', '/User/EmployeeOverview'],
    '/User/Customer': ['/User/Customer'],
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