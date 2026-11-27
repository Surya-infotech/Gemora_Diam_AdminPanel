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
import "../../../Scss/Home/Order/getorder.scss";

const GetAllOrder = ({ searchValue = "" }) => {
  const { logoutUser } = useAuth();
  const navigate = useNavigate();
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
      filtered = orders.filter(order => (
        [
          order.orderId,
          order.ordernumber,
          order.customer,
          order.shopName,
          order.metal,
          order.employee,
          order.status,
          order.conversation,
          order.tracking,
          order.courier,
          order.orderDate,
          order.dispatchDate
        ].join(" ").toLowerCase().includes(search)
      ));
    }
    if (!sortColumn) return filtered;
    return [...filtered].sort((a, b) => {
      if (sortColumn === "orderDate" || sortColumn === "dispatchDate") {
        const valA = String(a[sortColumn] || a.createdAt || "");
        const valB = String(b[sortColumn] || b.createdAt || "");
        return sortDirection === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      const valA = String(a[sortColumn] ?? "").toLowerCase();
      const valB = String(b[sortColumn] ?? "").toLowerCase();
      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [orders, searchValue, sortColumn, sortDirection]);

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
        name={deleteTarget ? `Order ${deleteTarget.orderId || `#${deleteTarget.ordernumber}`}` : ""}
        message=""
        isLoading={isDeleting}
      />

      <div className="tablediv">
        {loading ? <LoadingSpinner /> : (
          <table className="ordertable">
            <thead>
              <tr>
                <th onClick={() => handleSort("orderId")} style={{ cursor: "pointer" }}>
                  {"Order ID"} {renderSortIcon("orderId")}
                </th>
                <th onClick={() => handleSort("customer")} style={{ cursor: "pointer" }}>
                  {"Customer"} {renderSortIcon("customer")}
                </th>
                <th onClick={() => handleSort("shopName")} style={{ cursor: "pointer" }}>
                  {"Shop"} {renderSortIcon("shopName")}
                </th>
                <th onClick={() => handleSort("metal")} style={{ cursor: "pointer" }}>
                  {"Metal"} {renderSortIcon("metal")}
                </th>
                <th onClick={() => handleSort("employee")} style={{ cursor: "pointer" }}>
                  {"Employee"} {renderSortIcon("employee")}
                </th>
                <th onClick={() => handleSort("status")} style={{ cursor: "pointer" }}>
                  {"Current Status"} {renderSortIcon("status")}
                </th>
                <th onClick={() => handleSort("orderDate")} style={{ cursor: "pointer" }}>
                  {"Order Date"} {renderSortIcon("orderDate")}
                </th>
                <th onClick={() => handleSort("dispatchDate")} style={{ cursor: "pointer" }}>
                  {"Dispatch"} {renderSortIcon("dispatchDate")}
                </th>
                <th style={{ textAlign: "center", width: "120px" }}>
                  {"Action"}
                </th>
              </tr>
            </thead>
            <tbody>
              {visibleOrders.length > 0 ? visibleOrders.map(order => {
                const orderKey = order._id || order.allorderid;

                return (
                  <tr key={orderKey}>
                    <td>
                      <Tooltip title={"Edit Order"} arrow>
                        <span
                          className="order-number-badge"
                          style={{ cursor: "pointer" }}
                          onClick={() => handleEdit(order)}
                        >
                          {order.orderId || `#${order.ordernumber ?? order.allorderid}`}
                        </span>
                      </Tooltip>
                    </td>

                    <td><strong>{order.customer || "—"}</strong></td>

                    <td><strong>{order.shopName || "—"}</strong></td>

                    <td>{order.metal || "—"}</td>

                    <td>{order.employee || "—"}</td>

                    <td>
                      <span className="order-status-badge confirmed">
                        {order.status || "Order Received"}
                      </span>
                    </td>

                    <td>
                      <span style={{ fontSize: "13px", color: "var(--text-secondary, #64748b)", whiteSpace: "nowrap" }}>
                        {order.orderDate || "—"}
                      </span>
                    </td>

                    <td>
                      <div style={{ fontSize: "12px", lineHeight: 1.45 }}>
                        <div>{order.dispatchDate || "—"}</div>
                        {order.courier && <div style={{ color: "var(--text-secondary, #64748b)" }}>{order.courier}</div>}
                        {order.trackingLink ? (
                          <a href={order.trackingLink} target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary-color)" }}>
                            {order.tracking || "Track"}
                          </a>
                        ) : (
                          order.tracking && <span>{order.tracking}</span>
                        )}
                      </div>
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
                  <td colSpan="9" style={{ textAlign: "center", padding: "32px 0", color: "#64748b" }}>
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