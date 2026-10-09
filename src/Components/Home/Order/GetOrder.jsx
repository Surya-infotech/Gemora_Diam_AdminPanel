import { ArrowDownward, ArrowUpward, UnfoldMore } from "@mui/icons-material";
import ViewButton from "../../../Pages/Custom/ViewButton";
import DeleteButton from "../../../Pages/Custom/DeleteButton";
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
import DeleteModal from "../../../Pages/Custom/DeleteModal";
import { formatPriceWithCurrency } from "../../../utils/CurrencyFormatter";
import "../../../Scss/Home/Order/getorder.scss";

const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return dateString;
        return d.toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    } catch {
        return dateString;
    }
};

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

    // Delete Modal
    const [orderToDelete, setOrderToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

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

                return (
                    orderNum.includes(search) ||
                    name.includes(search) ||
                    email.includes(search) ||
                    phone.includes(search) ||
                    status.includes(search) ||
                    payStatus.includes(search) ||
                    payMethod.includes(search) ||
                    itemNames.includes(search)
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

    // Delete Order Handler
    const handleDeleteOrder = async () => {
        if (!orderToDelete) return;
        if (!CheckToken(token, logoutUser, navigate)) return;

        const targetId = orderToDelete._id || orderToDelete.orderid;
        try {
            setIsDeleting(true);
            const response = await fetch(`${adminPanelBackendPath}/Customer/DeleteOrder/${targetId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            const data = await response.json();
            if (HandleUnauthorized(data, logoutUser, navigate)) return;

            if (response.ok) {
                setOrders((prev) => prev.filter((o) => o._id !== orderToDelete._id && o.orderid !== orderToDelete.orderid));
                setOrderToDelete(null);
                setSuccessMessage(translations.deleteordersuccessfull || "Order deleted successfully");
            } else {
                setWarningMessage(data.message || translations.servererror);
                setShowWarning(true);
            }
        } catch {
            setWarningMessage(translations.servererror);
            setShowWarning(true);
        } finally {
            setIsDeleting(false);
        }
    };

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
                                    {translations.orderno || "Order No."} {renderSortIcon("ordernumber")}
                                </th>
                                <th onClick={() => handleSort("customername")} style={{ cursor: "pointer" }}>
                                    {translations.Customer || "Customer"} {renderSortIcon("customername")}
                                </th>
                                <th>
                                    {translations.items || "Items"}
                                </th>
                                <th onClick={() => handleSort("total")} style={{ cursor: "pointer" }}>
                                    {translations.totalamount || "Total Amount"} {renderSortIcon("total")}
                                </th>
                                <th onClick={() => handleSort("paymentstatus")} style={{ cursor: "pointer" }}>
                                    {translations.paymentstatus || "Payment"} {renderSortIcon("paymentstatus")}
                                </th>
                                <th onClick={() => handleSort("orderstatus")} style={{ cursor: "pointer", width: "130px" }}>
                                    {translations.orderstatus || "Order Status"} {renderSortIcon("orderstatus")}
                                </th>
                                <th onClick={() => handleSort("createdAt")} style={{ cursor: "pointer" }}>
                                    {translations.orderdate || "Date"} {renderSortIcon("createdAt")}
                                </th>
                                <th style={{ textAlign: "center", width: "120px" }}>
                                    {translations.action || "Action"}
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
                                                <span
                                                    className="order-number-badge"
                                                    style={{ cursor: "pointer" }}
                                                    onClick={() => handleViewDetails(order)}
                                                    title={translations.viewdetails || "View Details"}
                                                >
                                                    #{order.ordernumber != null ? order.ordernumber : order.orderid}
                                                </span>
                                            </td>

                                            {/* Customer */}
                                            <td>
                                                <div className="customer-info-cell">
                                                    <div className="customer-avatar">
                                                        {getInitials(order.customername)}
                                                    </div>
                                                    <div className="customer-text">
                                                        <strong
                                                            style={{ cursor: "pointer" }}
                                                            onClick={() => handleViewDetails(order)}
                                                            title={translations.viewdetails || "View Details"}
                                                        >
                                                            {order.customername || "Guest Customer"}
                                                        </strong>
                                                        {order.customeremail && (
                                                            <span className="customer-subtext">{order.customeremail}</span>
                                                        )}
                                                        {order.customerphone && (
                                                            <span className="customer-subtext">{order.customerphone}</span>
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
                                                <div className="payment-info-cell">
                                                    <span className={`payment-badge ${paymentStatusClass}`}>
                                                        {order.paymentstatus || "Paid"}
                                                    </span>
                                                    <span className="payment-method-text">
                                                        {order.paymentmethod || "Card"}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Order Status */}
                                            <td>
                                                <span className={`order-status-badge ${currentStatusClass}`}>
                                                    {order.orderstatus || "Confirmed"}
                                                </span>
                                            </td>

                                            {/* Date */}
                                            <td>
                                                <span style={{ fontSize: "13px", color: "var(--text-secondary, #64748b)" }}>
                                                    {formatDate(order.createdAt)}
                                                </span>
                                            </td>

                                            {/* Action Buttons */}
                                            <td>
                                                <div className="action-cell">
                                                    <ViewButton
                                                        onClick={() => handleViewDetails(order)}
                                                    />
                                                    <DeleteButton
                                                        onClick={() => setOrderToDelete(order)}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="8" style={{ textAlign: "center", padding: "32px 0", color: "#64748b" }}>
                                        {translations.noordersfound || "No orders found"}
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

            {/* Delete Modal Confirmation */}
            {orderToDelete && (
                <DeleteModal
                    open={Boolean(orderToDelete)}
                    onClose={() => setOrderToDelete(null)}
                    onDelete={handleDeleteOrder}
                    name={`#${orderToDelete.ordernumber || orderToDelete.orderid}`}
                    message={`(Total: ${formatPriceWithCurrency(orderToDelete.total, orderToDelete.currencydetails)})`}
                    headingname={translations.deleteorder || "Delete Order"}
                    isLoading={isDeleting}
                />
            )}
        </>
    );
};

export default GetOrder;
