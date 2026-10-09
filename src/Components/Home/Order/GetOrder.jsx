import { ArrowDownward, ArrowUpward, UnfoldMore } from "@mui/icons-material";
import { Tooltip } from "@mui/material";
import ViewButton from "../../../Pages/Custom/ViewButton";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../Middleware/Auth";
import { useLanguage } from "../../../Context/LanguageContext";
import { useFiscalYear } from "../../../Context/FiscalYearContext";
import CheckToken from "../../../utils/CheckToken";
import HandleUnauthorized from "../../../utils/HandleUnauthorized";
import LoadingSpinner from "../../../Pages/Custom/LoadingSpinner";
import Pagination from "../../../Pages/Custom/Pagination";
import WarningModal from "../../../Pages/Custom/WarningModal";
import AlertMessage from "../../../Pages/Custom/AlertMessage";
import { formatPriceWithCurrency } from "../../../utils/CurrencyFormatter";
import { formatDateTime } from "../../../utils/dateTimeFormatter";
import "../../../Scss/Home/Order/getorder.scss";

const getInitials = (name) => {
    if (!name) return "C";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};


const GetOrder = ({ searchValue = "" }) => {
    const { logoutUser } = useAuth();
    const navigate = useNavigate();
    const { translations } = useLanguage();
    const { selectedFiscalYear } = useFiscalYear();
    const adminPanelBackendPath = import.meta.env.VITE_BACKEND_URL;
    const tokenname = import.meta.env.VITE_AdminTOKEN_NAME;
    const token = localStorage.getItem(tokenname);

    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState([]);
    const [miscSettings, setMiscSettings] = useState(null);
    const [warningMessage, setWarningMessage] = useState("");
    const [showWarning, setShowWarning] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [sortColumn, setSortColumn] = useState(null);
    const [sortDirection, setSortDirection] = useState("desc");

    const handleViewDetails = (order) => {
        const orderKey = order._id || order.orderid;
        navigate(`/Home/OrderDetails/${orderKey}`, { state: { order } });
    };

    // Fetch orders based on selectedFiscalYear
    useEffect(() => {
        let isMounted = true;
        if (!CheckToken(token, logoutUser, navigate)) return;

        const fetchOrders = async () => {
            try {
                setLoading(true);
                const fyParam = selectedFiscalYear || "all";
                const response = await fetch(`${adminPanelBackendPath}/Customer/GetOrdersByFiscalYear/${fyParam}`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });

                const data = await response.json();
                if (HandleUnauthorized(data, logoutUser, navigate)) return;
                if (!isMounted) return;

                if (response.ok) {
                    setOrders(data.orders || []);
                    if (data.miscSettings) {
                        setMiscSettings(data.miscSettings);
                    }
                } else {
                    setWarningMessage(data.message || translations.servererror);
                    setShowWarning(true);
                }
            } catch {
                if (isMounted) {
                    setWarningMessage(translations.servererror);
                    setShowWarning(true);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchOrders();

        return () => {
            isMounted = false;
        };
    }, [adminPanelBackendPath, logoutUser, navigate, selectedFiscalYear, token, translations]);

    // Fetch misc settings for date and time formatting
    useEffect(() => {
        let isMounted = true;
        if (!CheckToken(token, logoutUser, navigate)) return;

        const fetchMiscSettings = async () => {
            try {
                const response = await fetch(`${adminPanelBackendPath}/System/GetMiscSetting`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });
                const data = await response.json();
                if (isMounted && response.ok && data) {
                    setMiscSettings(data);
                }
            } catch {
                // Ignore fallback to defaults
            }
        };

        fetchMiscSettings();
        return () => {
            isMounted = false;
        };
    }, [adminPanelBackendPath, logoutUser, navigate, token]);

    const handleSort = (column) => {
        const direction = sortColumn === column && sortDirection === "asc" ? "desc" : "asc";
        setSortColumn(column);
        setSortDirection(direction);
    };

    const renderSortIcon = (column) => (
        sortColumn !== column ? (
            <UnfoldMore fontSize="small" />
        ) : sortDirection === "asc" ? (
            <ArrowUpward fontSize="small" />
        ) : (
            <ArrowDownward fontSize="small" />
        )
    );

    const filteredAndSortedOrders = useMemo(() => {
        const search = (searchValue || "").toLowerCase().trim();
        let filtered = orders;

        if (search) {
            filtered = orders.filter((order) => {
                const orderNum = String(order.ordernumber || order.orderid || "").toLowerCase();
                const name = (order.customername || "").toLowerCase();
                const email = (order.customeremail || "").toLowerCase();
                const phone = (order.customerphone || "").toLowerCase();
                const status = (order.orderstatus || "").toLowerCase();
                const payStatus = (order.paymentstatus || "").toLowerCase();
                const payMethod = (order.paymentmethod || "").toLowerCase();
                const itemNames = (order.items || []).map(i => (i.itemname || "").toLowerCase()).join(" ");
                const formattedDate = formatDateTime(order.createdAt, miscSettings).toLowerCase();

                return (
                    orderNum.includes(search) ||
                    name.includes(search) ||
                    email.includes(search) ||
                    phone.includes(search) ||
                    status.includes(search) ||
                    payStatus.includes(search) ||
                    payMethod.includes(search) ||
                    itemNames.includes(search) ||
                    formattedDate.includes(search)
                );
            });
        }

        if (!sortColumn) return filtered;

        return [...filtered].sort((a, b) => {
            let valA = a[sortColumn] ?? "";
            let valB = b[sortColumn] ?? "";

            if (sortColumn === "ordernumber") {
                valA = Number(a.ordernumber || a.orderid) || 0;
                valB = Number(b.ordernumber || b.orderid) || 0;
                return sortDirection === "asc" ? valA - valB : valB - valA;
            } else if (sortColumn === "total") {
                valA = Number(a.total) || 0;
                valB = Number(b.total) || 0;
                return sortDirection === "asc" ? valA - valB : valB - valA;
            } else if (sortColumn === "createdAt") {
                const timeA = new Date(a.createdAt || 0).getTime();
                const timeB = new Date(b.createdAt || 0).getTime();
                return sortDirection === "asc" ? timeA - timeB : timeB - timeA;
            } else {
                valA = valA.toString().toLowerCase();
                valB = valB.toString().toLowerCase();
            }

            if (valA < valB) return sortDirection === "asc" ? -1 : 1;
            if (valA > valB) return sortDirection === "asc" ? 1 : -1;
            return 0;
        });
    }, [orders, searchValue, sortColumn, sortDirection]);

    const totalRecords = filteredAndSortedOrders.length;
    const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
    const visibleOrders = filteredAndSortedOrders.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    return (
        <>
            {showWarning && <WarningModal message={warningMessage} onClose={() => setShowWarning(false)} />}
            {successMessage && <AlertMessage message={successMessage} onClose={() => setSuccessMessage("")} />}

            <div className="tablediv">
                {loading ? (
                    <LoadingSpinner />
                ) : (
                    <table className="ordertable">
                        <thead>
                            <tr>
                                <th onClick={() => handleSort("ordernumber")} style={{ cursor: "pointer", width: "95px" }}>
                                    {translations.orderno} {renderSortIcon("ordernumber")}
                                </th>
                                <th onClick={() => handleSort("customername")} style={{ cursor: "pointer" }}>
                                    {translations.Customer} {renderSortIcon("customername")}
                                </th>
                                <th>
                                    {translations.items}
                                </th>
                                <th onClick={() => handleSort("total")} style={{ cursor: "pointer" }}>
                                    {translations.totalamount} {renderSortIcon("total")}
                                </th>
                                <th onClick={() => handleSort("paymentstatus")} style={{ cursor: "pointer" }}>
                                    {translations.paymentstatus} {renderSortIcon("paymentstatus")}
                                </th>
                                <th onClick={() => handleSort("orderstatus")} style={{ cursor: "pointer", width: "130px" }}>
                                    {translations.orderstatus} {renderSortIcon("orderstatus")}
                                </th>
                                <th onClick={() => handleSort("createdAt")} style={{ cursor: "pointer" }}>
                                    {translations.orderdate} {renderSortIcon("createdAt")}
                                </th>
                                <th style={{ textAlign: "center", width: "120px" }}>
                                    {translations.action}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {visibleOrders.length > 0 ? (
                                visibleOrders.map((order) => {
                                    const orderKey = order._id || order.orderid;
                                    const firstItem = order.items && order.items.length > 0 ? order.items[0] : null;
                                    const totalItemsCount = order.totalitems || (order.items || []).reduce((acc, i) => acc + (i.qty || 1), 0);
                                    const currentStatusClass = (order.orderstatus || "Confirmed").toLowerCase();
                                    const paymentStatusClass = (order.paymentstatus || "Paid").toLowerCase();

                                    return (
                                        <tr key={orderKey}>
                                            {/* Order Number */}
                                            <td>
                                                <Tooltip title={translations.viewdetails || translations.View} arrow>
                                                    <span
                                                        className="order-number-badge"
                                                        style={{ cursor: "pointer" }}
                                                        onClick={() => handleViewDetails(order)}
                                                    >
                                                        #{order.ordernumber != null ? order.ordernumber : order.orderid}
                                                    </span>
                                                </Tooltip>
                                            </td>

                                            {/* Customer */}
                                            <td>
                                                <div className="customer-info-cell">
                                                    <div className="customer-avatar">
                                                        {getInitials(order.customername)}
                                                    </div>
                                                    <div className="customer-text">
                                                        <strong>
                                                            {order.customername || translations.guestcustomer}
                                                        </strong>
                                                        {order.customeremail && (
                                                            <span className="customer-subtext">{order.customeremail}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Items Preview */}
                                            <td>
                                                <div className="order-items-preview">
                                                    {firstItem?.image ? (
                                                        <img
                                                            src={firstItem.image}
                                                            alt={firstItem.itemname || "Item"}
                                                            className="item-thumb"
                                                            onError={(e) => {
                                                                e.target.style.display = "none";
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="item-thumb-placeholder">💎</div>
                                                    )}
                                                    <div className="item-details-brief">
                                                        <span className="item-title">
                                                            {firstItem?.itemname || "Jewelry Item"}
                                                        </span>
                                                        <span className="item-badge-more">
                                                            {totalItemsCount} {totalItemsCount === 1 ? "item" : "items"}
                                                            {order.items && order.items.length > 1 && ` (${order.items.length} types)`}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Total Amount */}
                                            <td>
                                                <span className="order-price-cell">
                                                    {formatPriceWithCurrency(order.total, order.currencydetails)}
                                                </span>
                                            </td>

                                            {/* Payment */}
                                            <td>
                                                <span className={`payment-badge ${paymentStatusClass}`}>
                                                    {order.paymentstatus || "Paid"}
                                                </span>
                                            </td>

                                            {/* Order Status */}
                                            <td>
                                                <span className={`order-status-badge ${currentStatusClass}`}>
                                                    {order.orderstatus || "Confirmed"}
                                                </span>
                                            </td>

                                            {/* Date */}
                                            <td>
                                                <span style={{ fontSize: "13px", color: "var(--text-secondary, #64748b)", whiteSpace: "nowrap" }}>
                                                    {formatDateTime(order.createdAt, miscSettings)}
                                                </span>
                                            </td>

                                            {/* Action Buttons */}
                                            <td>
                                                <div className="action-cell">
                                                    <ViewButton
                                                        onClick={() => handleViewDetails(order)}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="8" style={{ textAlign: "center", padding: "32px 0", color: "#64748b" }}>
                                        {translations.noordersfound}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {!loading && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => setCurrentPage(page)}
                    pageSizeOptions={[10, 15, 20, 50]}
                    selectedPageSize={pageSize}
                    onPageSizeChange={(size) => {
                        setPageSize(size);
                        setCurrentPage(1);
                    }}
                    totalRecords={totalRecords}
                />
            )}
        </>
    );
};

export default GetOrder;
