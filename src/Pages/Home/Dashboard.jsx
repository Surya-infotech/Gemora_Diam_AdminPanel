import { Groups, Paid, Payments, Savings, TrendingDown, TrendingUp } from "@mui/icons-material";
import { Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Area, AreaChart, Bar, BarChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useLanguage } from '../../Context/LanguageContext';
import { usePermissions } from "../../Hooks/usePermissions";
import { useAuth } from "../../Middleware/Auth";
import "../../Scss/Home/Dashboard/dashboard.scss";
import CheckToken from "../../utils/CheckToken";
import HandleUnauthorized from "../../utils/HandleUnauthorized";
import AlertMessage from "../Custom/AlertMessage";
import WarningModal from "../Custom/WarningModal";
import profilePlaceholder from '../../assets/profile-placeholder.png';
import { useFiscalYear } from "../../Context/FiscalYearContext";

const sampleFallbackData = {
    activeSubscriptionCount: 148,
    totalSubscriptionCount: 230,
    totalOwnerCount: 85,
    totalTaxSum: 14200,
    totalSubtotalSum: 184500,
    totalPriceSum: 198700,
    monthlySummary: [
        { _id: 1, monthlyRevenue: 12500, subscriptionCount: 15 },
        { _id: 2, monthlyRevenue: 15400, subscriptionCount: 19 },
        { _id: 3, monthlyRevenue: 18200, subscriptionCount: 22 },
        { _id: 4, monthlyRevenue: 14800, subscriptionCount: 18 },
        { _id: 5, monthlyRevenue: 21000, subscriptionCount: 25 },
        { _id: 6, monthlyRevenue: 24500, subscriptionCount: 30 },
        { _id: 7, monthlyRevenue: 19800, subscriptionCount: 24 },
        { _id: 8, monthlyRevenue: 26000, subscriptionCount: 32 },
        { _id: 9, monthlyRevenue: 28500, subscriptionCount: 35 },
        { _id: 10, monthlyRevenue: 17800, subscriptionCount: 20 },
    ],
    kpiDifferences: {
        ownerCountDifference: "+12%",
        totalSubscriptionCountDifference: "+18%",
        taxDifference: "+8%",
        subtotalDifference: "+22%",
        revenueDifference: "+20%"
    },
    recentlyAddedOwners: [
        { ownerfirstname: "Rajesh", ownerlastname: "Patel", email: "rajesh@diamjewels.com" },
        { ownerfirstname: "Amit", ownerlastname: "Shah", email: "amit.shah@gemoralux.com" },
        { ownerfirstname: "Suresh", ownerlastname: "Mehta", email: "suresh@shreediam.com" },
    ],
    recentlyAddedBusinesses: [
        { businessname: "Gemora Luxury Diamonds", email: "contact@gemoralux.com" },
        { businessname: "Shree Diam Exports", email: "exports@shreediam.com" },
        { businessname: "Surat Diamond Hub", email: "info@suratdiamhub.com" },
    ]
};

const Dashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logoutUser } = useAuth();
    const { translations, isRtl } = useLanguage();
    const { isEmployee } = usePermissions();
    const { selectedFiscalYear } = useFiscalYear();
    const adminPanelBackendPath = import.meta.env.VITE_BACKEND_URL;
    const tokenname = import.meta.env.VITE_AdminTOKEN_NAME;
    const token = localStorage.getItem(tokenname);
    const [warningMessage, setWarningMessage] = useState("");
    const [showWarning, setShowWarning] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [dashboardData, setDashboardData] = useState(sampleFallbackData);
    const [currencyDetails, setCurrencyDetails] = useState({ currencysymbol: '$', currencyposition: 'left' });

    useEffect(() => {
        if (isEmployee) {
            navigate('/Home/EmployeeDashboard', { replace: true });
        }
    }, [isEmployee, navigate]);

    useEffect(() => {
        if (translations.Dashboard) document.title = translations.Dashboard;

        const successMessage = localStorage.getItem('loginSuccessMessage');
        if (successMessage) {
            setAlertMessage(successMessage);
            localStorage.removeItem('loginSuccessMessage');
        }
    }, [translations]);

    useEffect(() => {
        if (location.state && location.state.message) {
            setAlertMessage(location.state.message);
            navigate(location.pathname, { replace: true });
        }
    }, [location, navigate]);

    useEffect(() => {
        if (location.state && location.state.warning) {
            setWarningMessage(location.state.warning);
            setShowWarning(true);
            navigate(location.pathname, { replace: true });
        }
    }, [location, navigate]);

    const formatCurrency = (amount, details) => {
        if (!details || Object.keys(details).length === 0) return `$${amount}`;

        const { decimal, thousandseparator, decimalseparator, currencysymbol, currencyposition } = details;
        let formattedAmount = parseFloat(amount || 0).toFixed(decimal || 2);
        formattedAmount = formattedAmount.replace(/\B(?=(\d{3})+(?!\d))/g, thousandseparator || ',');
        if (decimalseparator && decimalseparator !== '.') formattedAmount = formattedAmount.replace('.', decimalseparator);

        switch (currencyposition) {
            case "left": return `${currencysymbol || '$'}${formattedAmount}`;
            case "left-space": return `${currencysymbol || '$'} ${formattedAmount}`;
            case "right": return `${formattedAmount}${currencysymbol || '$'}`;
            case "right-space": return `${formattedAmount} ${currencysymbol || '$'}`;
            default: return `${currencysymbol || '$'}${formattedAmount}`;
        }
    };

    useEffect(() => {
        if (isEmployee) return;
        if (!CheckToken(token, logoutUser, navigate)) return;
        const fetchDashboardData = async () => {
            try {
                const response = await fetch(`${adminPanelBackendPath}/Main/GetDashboard/${selectedFiscalYear || 'default'}`, {
                    method: "GET",
                    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                });
                const data = await response.json();
                if (HandleUnauthorized(data, logoutUser, navigate)) return;

                if (response.ok) {
                    setDashboardData(prevData => ({
                        ...prevData,
                        ...data
                    }));
                    if (data.currencyDetails || data.currency) {
                        setCurrencyDetails(data.currencyDetails || data.currency);
                    }
                } else {
                    const errorMessages = {
                        "Server error": translations.servererror
                    };
                    setWarningMessage(errorMessages[data.message] || data.message || translations.servererror);
                    setShowWarning(true);
                }
            } catch (err) {
                console.error("Dashboard fetch notice:", err);
                // Keep sample fallback data
            }
        };

        fetchDashboardData();
    }, [selectedFiscalYear, token, logoutUser, navigate, adminPanelBackendPath, translations]);

    const parseKpiNumber = (value) => {
        if (value === null || value === undefined || value === "") return null;
        const num = parseFloat(String(value).replace("+", "").replace("%", "").trim());
        return Number.isNaN(num) ? null : num;
    };

    const formatKpiDifference = (value) => {
        const num = parseKpiNumber(value);
        if (num === null) return null;
        const prefix = num > 0 ? "+" : "";
        return `${prefix}${num}%`;
    };

    const getKpiDifferenceClassName = (value) => {
        const num = parseKpiNumber(value);
        if (num === null || num === 0) return "neutral";
        return num > 0 ? "positive" : "negative";
    };

    const renderKpiDifferenceIcon = (value) => {
        const num = parseKpiNumber(value);
        if (num === null || num === 0) return null;
        if (num < 0) return <TrendingDown className="card-difference-icon" />;
        return <TrendingUp className="card-difference-icon" />;
    };

    const kpiDifferences = dashboardData.kpiDifferences || {};

    const handleOwnersCardClick = () => navigate('/Home/Dashboard');
    const handleRevenueCardClick = () => navigate('/Home/Dashboard');
    const handleTaxCardClick = () => navigate('/Home/Dashboard');

    const cardData = [
        {
            name: translations.owners,
            count: dashboardData.totalOwnerCount || 0,
            difference: kpiDifferences.ownerCountDifference,
            icon: <Groups className="card-icon" />,
            onClick: handleOwnersCardClick,
            isClickable: true,
            variant: "highlight",
        },
        {
            name: translations.totaltax,
            count: formatCurrency(dashboardData.totalTaxSum || 0, currencyDetails),
            difference: kpiDifferences.taxDifference,
            icon: <Payments className="card-icon" />,
            onClick: handleTaxCardClick,
            isClickable: true,
            variant: "warning",
        },
        {
            name: translations.totalearning,
            count: formatCurrency(dashboardData.totalSubtotalSum || 0, currencyDetails),
            difference: kpiDifferences.subtotalDifference,
            icon: <Paid className="card-icon" />,
            onClick: handleRevenueCardClick,
            isClickable: true,
            variant: "income",
        },
        {
            name: translations.totalrevenue,
            count: formatCurrency(dashboardData.totalPriceSum || 0, currencyDetails),
            difference: kpiDifferences.revenueDifference,
            icon: <Savings className="card-icon" />,
            onClick: handleRevenueCardClick,
            isClickable: true,
            variant: "revenue",
        },
    ];

    const monthNames = [
        translations.Jan,
        translations.Feb,
        translations.Mar,
        translations.Apr,
        translations.May,
        translations.Jun,
        translations.Jul,
        translations.Aug,
        translations.Sep,
        translations.Oct,
        translations.Nov,
        translations.Dec
    ];

    const initialChartData = monthNames.map((month) => ({ month, Revenue: 0, Orders: 0 }));

    (dashboardData.monthlySummary || []).forEach((item) => {
        const monthIndex = (item._id ?? 0) - 1;
        if (monthIndex >= 0 && monthIndex < 12) {
            initialChartData[monthIndex].Revenue = item.monthlyRevenue ?? 0;
            initialChartData[monthIndex].Orders = item.subscriptionCount ?? 0;
        }
    });

    const chartData = [...initialChartData];

    const CustomTooltip = ({ active, payload, label, translations, currencyDetails, formatCurrency }) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip">
                    <p className="label">{`${label}`}</p>
                    {payload.map((entry, index) => (
                        <p key={index} className="tooltip-data">
                            {`${entry.dataKey === "Revenue" ? translations.revenue : translations.subscriptions}: ${entry.dataKey === "Revenue" ? formatCurrency(entry.value, currencyDetails) : entry.value}`}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    const handleWarningClose = () => {
        setShowWarning(false);
        setWarningMessage("");
    };

    if (isEmployee) {
        return null;
    }

    return (<>
        {alertMessage && <AlertMessage message={alertMessage} onClose={() => setAlertMessage("")} />}
        {showWarning && <WarningModal message={warningMessage} onClose={handleWarningClose} />}
        <div className={`dashboard-container ${isRtl ? 'rtl-dashboard' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="kpi-summary-cards">
                {cardData.map((card, index) => (
                    <div
                        key={index}
                        className={`kpi-card ${card.variant || ''}`}
                        onClick={card.isClickable ? card.onClick : undefined}
                        style={{ cursor: card.isClickable ? 'pointer' : 'default' }}
                    >
                        <div className="kpi-info">
                            <span className="kpi-title">{card.name}</span>
                            <span className="kpi-value">{card.count}</span>
                            {card.difference !== undefined && card.difference !== null && formatKpiDifference(card.difference) && (
                                <div className={`card-difference-wrap ${getKpiDifferenceClassName(card.difference)}`}>
                                    {renderKpiDifferenceIcon(card.difference)}
                                    <span className="card-difference">
                                        {formatKpiDifference(card.difference)}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="kpi-icon-box">{card.icon}</div>
                    </div>
                ))}
            </div>

            <div className="dashboard-row row-1">
                <div className="chart-container monthly-revenue-chart">
                    <Typography variant="h6" className="chart-title">{translations.monthlyrevenue}</Typography>
                    <ResponsiveContainer width="100%" height={350}>
                        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <XAxis dataKey="month" className="chart-axis" interval={0} axisLine={false} tickLine={false} />
                            <YAxis className="chart-axis" axisLine={false} tickLine={false} width={75} tickFormatter={(value) => formatCurrency(value, currencyDetails)} />
                            <Tooltip content={(props) => <CustomTooltip {...props} translations={translations} currencyDetails={currencyDetails} formatCurrency={formatCurrency} />} />
                            <Legend className="chart-legend" />
                            <Area type="monotone" dataKey="Revenue" stroke="var(--primary-color)" fill="var(--primary-color)" fillOpacity={0.3} strokeWidth={4} name={translations.revenue} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="recently-added-container">
                    <Typography variant="h6" className="section-title">
                        {translations.recentowners}
                    </Typography>
                    {dashboardData.recentlyAddedOwners && dashboardData.recentlyAddedOwners.length > 0 ? (
                        <div className="owners-list">
                            {dashboardData.recentlyAddedOwners.map((owner, index) => (
                                <div key={index} className="owner-item-card" onClick={() => navigate('/Home/Dashboard')}>
                                    <div className="owner-content">
                                        <div className="owner-image">
                                            <img
                                                src={owner.imageUrl || profilePlaceholder}
                                                alt={`${owner.ownerfirstname} ${owner.ownerlastname}`}
                                                className="owner-avatar"
                                            />
                                        </div>
                                        <div className="owner-details">
                                            <Typography variant="body1" className="owner-name">
                                                {owner.ownerfirstname} {owner.ownerlastname}
                                            </Typography>
                                            <Typography variant="body2" className="owner-email">
                                                {owner.email}
                                            </Typography>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="no-data-message">
                            <Typography variant="body2">
                                {translations.notfoundrecentowners}
                            </Typography>
                        </div>
                    )}
                </div>
            </div>

            <div className="dashboard-row row-2">
                <div className="recently-added-container">
                    <Typography variant="h6" className="section-title">
                        {translations.recentbusinesses}
                    </Typography>
                    {dashboardData.recentlyAddedBusinesses && dashboardData.recentlyAddedBusinesses.length > 0 ? (
                        <div className="businesses-list">
                            {dashboardData.recentlyAddedBusinesses.map((business, index) => (
                                <div key={index} className="business-item-card" onClick={() => navigate('/Home/Dashboard')}>
                                    <div className="business-content">
                                        <div className="business-image">
                                            <img
                                                src={business.imageUrl || profilePlaceholder}
                                                alt={business.businessname}
                                                className="business-avatar"
                                            />
                                        </div>
                                        <div className="business-details">
                                            <Typography variant="body1" className="business-name">
                                                {business.businessname}
                                            </Typography>
                                            <Typography variant="body2" className="business-email">
                                                {business.email}
                                            </Typography>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="no-data-message">
                            <Typography variant="body2">
                                {translations.notfoundrecentbusinesses}
                            </Typography>
                        </div>
                    )}
                </div>

                <div className="chart-container monthly-order-chart">
                    <Typography variant="h6" className="chart-title">{translations.monthlysubscriptions}</Typography>
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={chartData} barSize={22} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <XAxis dataKey="month" className="chart-axis" axisLine={false} tickLine={false} />
                            <YAxis className="chart-axis" axisLine={false} tickLine={false} width={65} allowDecimals={false} tickFormatter={(value) => Math.round(value)} />
                            <Tooltip content={(props) => <CustomTooltip {...props} translations={translations} currencyDetails={currencyDetails} formatCurrency={formatCurrency} />} />
                            <Legend className="chart-legend" />
                            <Bar dataKey="Orders" fill="var(--primary-color)" name={translations.subscriptions} radius={[10, 10, 10, 10]} isAnimationActive={false} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    </>);
};

export default Dashboard;
