/**
 * Path prefixes that should mark a sidebar NavLink active (list + add/edit/detail routes).
 * Keys match AdminNavbar `to` paths.
 */
const NAV_ACTIVE_PREFIXES = {
    '/Home/Dashboard': ['/Home/Dashboard'],
    '/Home/Business': ['/Home/Business'],
    '/Home/Branches': ['/Home/Branches'],
    '/Subscription/Plan': ['/Subscription/Plan', '/Subscription/AddPlan', '/Subscription/EditPlan'],
    '/Reports/SubscriptionHistory': ['/Reports/SubscriptionHistory', '/Reports/AddSubscription', '/Reports/SubscriptionDetail'],
    '/Reports/TaxReport': ['/Reports/TaxReport'],
    '/Reports/ReferralHistory': ['/Reports/ReferralHistory', '/Reports/ReferralDetail'],
    '/Subscription/Coupon': ['/Subscription/Coupon', '/Subscription/AddCoupon', '/Subscription/EditCoupon'],
    '/Subscription/Addon': ['/Subscription/Addon', '/Subscription/AddAddon', '/Subscription/EditAddon'],
    '/Users/Owner': ['/Users/Owner'],
    '/Users/Employee': ['/Users/Employee'],
    '/Users/Customer': ['/Users/Customer'],
    '/System/HelpCenter': ['/System/HelpCenter', '/System/HelpCenterDetail'],
    '/System/Currency': ['/System/Currency', '/System/AddCurrency', '/System/EditCurrency'],
    '/System/Taxes': ['/System/Taxes', '/System/AddTax', '/System/EditTax'],
    '/System/WhiteLabelInquiries': ['/System/WhiteLabelInquiries'],
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