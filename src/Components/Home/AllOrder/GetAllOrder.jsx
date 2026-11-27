import { ArrowDownward, ArrowUpward, UnfoldMore } from "@mui/icons-material";
import { Tooltip } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../Middleware/Auth";
import { useFiscalYear } from "../../../Context/FiscalYearContext";
import CheckToken from "../../../utils/CheckToken";
import HandleUnauthorized from "../../../utils/HandleUnauthorized";
import LoadingSpinner from "../../../Pages/Custom/LoadingSpinner";
import Pagination from "../../../Pages/Custom/Pagination";
import WarningModal from "../../../Pages/Custom/WarningModal";
import AlertMessage from "../../../Pages/Custom/AlertMessage";
import EditButton from "../../../Pages/Custom/EditButton";
import DeleteButton from "../../../Pages/Custom/DeleteButton";
import DeleteModal from "../../../Pages/Custom/DeleteModal";
import { formatPriceWithCurrency } from "../../../utils/CurrencyFormatter";
import { formatDateTime } from "../../../utils/dateTimeFormatter";
import "../../../Scss/Home/Order/getorder.scss";

const getInitials = name => {
  if (!name) return "C";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const GetAllOrder = ({ searchValue = "" }) => {
  const { logoutUser } = useAuth();
  const navigate = useNavigate();
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

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (!CheckToken(token, logoutUser, navigate)) return;
    const fetchAllOrders = async () => {
      try {
        setLoading(true);
        const fyParam = selectedFiscalYear || "all";
        const response = await fetch(`${adminPanelBackendPath}/Main/GetAllOrders/${fyParam}`, {
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
          setWarningMessage(data.message || "Server error");
          setShowWarning(true);
        }
      } catch {
        if (isMounted) {
          setWarningMessage("Server error");
          setShowWarning(true);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    fetchAllOrders();
    return () => {
      isMounted = false;
    };
  }, [adminPanelBackendPath, logoutUser, navigate, selectedFiscalYear, token]);

  const handleEdit = order => {
    const orderKey = order._id || order.allorderid;
    navigate(`/Home/EditAllOrder/${orderKey}`, {
      state: { order }
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    if (!CheckToken(token, logoutUser, navigate)) return;
    const orderKey = deleteTarget._id || deleteTarget.allorderid;
    setIsDeleting(true);
    try {
      const response = await fetch(`${adminPanelBackendPath}/Main/DeleteAllOrder/${orderKey}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      const data = await response.json();
      if (HandleUnauthorized(data, logoutUser, navigate)) return;
      if (response.ok) {
        setOrders(prev => prev.filter(o => (o._id || o.allorderid) !== orderKey));
        setSuccessMessage(data.message || "Order deleted successfully");
        setDeleteTarget(null);
      } else {
        setWarningMessage(data.message || "Server error");
        setShowWarning(true);
      }
    } catch {
      setWarningMessage("Server error");
      setShowWarning(true);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSort = column => {
    const direction = sortColumn === column && sortDirection === "asc" ? "desc" : "asc";
    setSortColumn(column);
    setSortDirection(direction);
  };

  const renderSortIcon = column => (
    sortColumn !== column
      ? <UnfoldMore fontSize="small" />
      : sortDirection === "asc"
        ? <ArrowUpward fontSize="small" />
        : <ArrowDownward fontSize="small" />
  );

  const filteredAndSortedOrders = useMemo(() => {
    const search = (searchValue || "").toLowerCase().trim();
    let filtered = orders;
    if (search) {
      filtered = orders.filter(order => {
        const orderNum = String(order.ordernumber || order.allorderid || "").toLowerCase();
        const name = (order.customername || "").toLowerCase();
        const email = (order.customeremail || "").toLowerCase();
        const phone = (order.customerphone || "").toLowerCase();
        const status = (order.orderstatus || "").toLowerCase();
        const payStatus = (order.paymentstatus || "").toLowerCase();
        const payMethod = (order.paymentmethod || "").toLowerCase();
        const itemNames = (order.items || []).map(i => (i.itemname || "").toLowerCase()).join(" ");
        const formattedDate = formatDateTime(order.orderdate || order.createdAt, miscSettings).toLowerCase();
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
      if (sortColumn === "ordernumber") {
        const valA = Number(a.ordernumber || a.allorderid) || 0;
        const valB = Number(b.ordernumber || b.allorderid) || 0;
        return sortDirection === "asc" ? valA - valB : valB - valA;
      }
      if (sortColumn === "total") {
        const valA = Number(a.total) || 0;
        const valB = Number(b.total) || 0;
        return sortDirection === "asc" ? valA - valB : valB - valA;
      }
      if (sortColumn === "orderdate") {
        const timeA = new Date(a.orderdate || a.createdAt || 0).getTime();
        const timeB = new Date(b.orderdate || b.createdAt || 0).getTime();
        return sortDirection === "asc" ? timeA - timeB : timeB - timeA;
      }
      const valA = String(a[sortColumn] ?? "").toLowerCase();
      const valB = String(b[sortColumn] ?? "").toLowerCase();
      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [orders, searchValue, sortColumn, sortDirection, miscSettings]);

  const totalRecords = filteredAndSortedOrders.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const visibleOrders = filteredAndSortedOrders.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <>
      {showWarning && <WarningModal message={warningMessage} onClose={() => setShowWarning(false)} />}
      {successMessage && <AlertMessage message={successMessage} onClose={() => setSuccessMessage("")} />}
      <DeleteModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onDelete={handleConfirmDelete}
        name={deleteTarget ? `Order #${deleteTarget.ordernumber ?? deleteTarget.allorderid}` : ""}
        message=""
        isLoading={isDeleting}
      />

      <div className="tablediv">
        {loading ? <LoadingSpinner /> : (
          <table className="ordertable">
            <thead>
              <tr>
                <th onClick={() => handleSort("ordernumber")} style={{ cursor: "pointer", width: "95px" }}>
                  {"Order No."} {renderSortIcon("ordernumber")}
                </th>
                <th onClick={() => handleSort("customername")} style={{ cursor: "pointer" }}>
                  {"Customer"} {renderSortIcon("customername")}
                </th>
                <th>{"Items"}</th>
                <th onClick={() => handleSort("total")} style={{ cursor: "pointer" }}>
                  {"Total Amount"} {renderSortIcon("total")}
                </th>
                <th onClick={() => handleSort("paymentstatus")} style={{ cursor: "pointer" }}>
                  {"Payment Status"} {renderSortIcon("paymentstatus")}
                </th>
                <th onClick={() => handleSort("orderstatus")} style={{ cursor: "pointer", width: "130px" }}>
                  {"Order Status"} {renderSortIcon("orderstatus")}
                </th>
                <th onClick={() => handleSort("orderdate")} style={{ cursor: "pointer" }}>
                  {"Order Date"} {renderSortIcon("orderdate")}
                </th>
                <th style={{ textAlign: "center", width: "120px" }}>
                  {"Action"}
                </th>
              </tr>
            </thead>
            <tbody>
              {visibleOrders.length > 0 ? visibleOrders.map(order => {
                const orderKey = order._id || order.allorderid;
                const firstItem = order.items && order.items.length > 0 ? order.items[0] : null;
                const totalItemsCount = order.totalitems || (order.items || []).reduce((acc, i) => acc + (i.qty || 1), 0);
                const currentStatusClass = (order.orderstatus || "Confirmed").toLowerCase();
                const paymentStatusClass = (order.paymentstatus || "Paid").toLowerCase();
                const contactSubtext = order.customeremail || order.customerphone || "";

                return (
                  <tr key={orderKey}>
                    <td>
                      <Tooltip title={"Edit Order"} arrow>
                        <span
                          className="order-number-badge"
                          style={{ cursor: "pointer" }}
                          onClick={() => handleEdit(order)}
                        >
                          #{order.ordernumber != null ? order.ordernumber : order.allorderid}
                        </span>
                      </Tooltip>
                    </td>

                    <td>
                      <div className="customer-info-cell">
                        <div className="customer-avatar">
                          {getInitials(order.customername)}
                        </div>
                        <div className="customer-text">
                          <strong>{order.customername || "Walk-in Customer"}</strong>
                          {contactSubtext && <span className="customer-subtext">{contactSubtext}</span>}
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="order-items-preview">
                        {firstItem?.image ? (
                          <img
                            src={firstItem.image}
                            alt={firstItem.itemname || "Item"}
                            className="item-thumb"
                            onError={e => {
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
                            {totalItemsCount} {totalItemsCount === 1 ? "Item" : "Items"}
                            {order.items && order.items.length > 1 && ` (${order.items.length} types)`}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="order-price-cell">
                        {formatPriceWithCurrency(order.total, order.currencydetails)}
                      </span>
                    </td>

                    <td>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px" }}>
                        <span className={`payment-badge ${paymentStatusClass}`}>
                          {order.paymentstatus || "Paid"}
                        </span>
                        {order.paymentmethod && (
                          <span style={{ fontSize: "11px", color: "var(--text-secondary, #64748b)" }}>
                            {order.paymentmethod}
                          </span>
                        )}
                      </div>
                    </td>

                    <td>
                      <span className={`order-status-badge ${currentStatusClass}`}>
                        {order.orderstatus || "Confirmed"}
                      </span>
                    </td>

                    <td>
                      <span style={{ fontSize: "13px", color: "var(--text-secondary, #64748b)", whiteSpace: "nowrap" }}>
                        {formatDateTime(order.orderdate || order.createdAt, miscSettings)}
                      </span>
                    </td>

                    <td>
                      <div className="action-cell">
                        <EditButton onClick={() => handleEdit(order)} />
                        <DeleteButton onClick={() => setDeleteTarget(order)} />
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", padding: "32px 0", color: "#64748b" }}>
                    {"No orders found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {!loading && (
        <Pagination
          currentPage={safePage}
          totalPages={totalPages}
          onPageChange={page => setCurrentPage(page)}
          pageSizeOptions={[10, 15, 20, 50]}
          selectedPageSize={pageSize}
          onPageSizeChange={size => {
            setPageSize(size);
            setCurrentPage(1);
          }}
          totalRecords={totalRecords}
        />
      )}
    </>
  );
};

export default GetAllOrder;