import { ArrowDownward, ArrowUpward, UnfoldMore } from '@mui/icons-material';
import CustomSwitch from '../../../Pages/Custom/CustomSwitch';
import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../../Middleware/Auth';
import AlertMessage from '../../../Pages/Custom/AlertMessage';
import LoadingSpinner from '../../../Pages/Custom/LoadingSpinner';
import Pagination from '../../../Pages/Custom/Pagination';
import WarningModal from '../../../Pages/Custom/WarningModal';
import "../../../Scss/User/Customer/getcustomer.scss";
import { useLanguage } from "../../../Context/LanguageContext";
import CheckToken from '../../../utils/CheckToken';
import HandleUnauthorized from '../../../utils/HandleUnauthorized';
import profilePlaceholder from '../../../assets/profile-placeholder.png';

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

const GetCustomer = ({ searchValue = "" }) => {
    const { logoutUser } = useAuth();
    const navigate = useNavigate();
    const { translations } = useLanguage();
    const adminPanelBackendPath = import.meta.env.VITE_BACKEND_URL;
    const tokenname = import.meta.env.VITE_AdminTOKEN_NAME;
    const token = localStorage.getItem(tokenname);

    const [loading, setLoading] = useState(true);
    const [warningMessage, setWarningMessage] = useState("");
    const [showWarning, setShowWarning] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [sortColumn, setSortColumn] = useState(null);
    const [sortDirection, setSortDirection] = useState("asc");
    const [customers, setCustomers] = useState([]);
    const [updatingStatusId, setUpdatingStatusId] = useState(null);

    useEffect(() => {
        let isMounted = true;
        if (!CheckToken(token, logoutUser, navigate)) return;

        const loadCustomers = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${adminPanelBackendPath}/User/GetCustomers`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                });
                const data = await response.json();
                if (HandleUnauthorized(data, logoutUser, navigate)) return;
                if (!isMounted) return;

                if (response.ok) {
                    setCustomers(data.customers || []);
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

        loadCustomers();

        return () => {
            isMounted = false;
        };
    }, [adminPanelBackendPath, logoutUser, navigate, token, translations]);

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

    const filteredAndSortedCustomers = useMemo(() => {
        const search = (searchValue || "").toLowerCase().trim();
        let filtered = customers;

        if (search) {
            filtered = customers.filter((cust) => {
                const name = (cust.fullname || "").toLowerCase();
                const email = (cust.email || "").toLowerCase();
                const phone = (cust.phone || "").toLowerCase();
                const idStr = (cust.customerid != null ? String(cust.customerid) : "").toLowerCase();
                return (
                    name.includes(search) ||
                    email.includes(search) ||
                    phone.includes(search) ||
                    idStr.includes(search)
                );
            });
        }

        if (!sortColumn) return filtered;

        return [...filtered].sort((a, b) => {
            let valA = a[sortColumn] ?? "";
            let valB = b[sortColumn] ?? "";

            if (sortColumn === "status") {
                valA = a.status ? 1 : 0;
                valB = b.status ? 1 : 0;
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
    }, [customers, searchValue, sortColumn, sortDirection]);

    const totalRecords = filteredAndSortedCustomers.length;
    const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
    const visibleCustomers = filteredAndSortedCustomers.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    const handleStatusChange = async (customer) => {
        if (!CheckToken(token, logoutUser, navigate)) return;
        const targetId = customer._id || customer.customerid;
        try {
            setUpdatingStatusId(targetId);
            const updatedStatus = !customer.status;
            const response = await fetch(`${adminPanelBackendPath}/User/UpdateCustomerStatus/${targetId}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ status: updatedStatus }),
            });

            const data = await response.json();
            if (HandleUnauthorized(data, logoutUser, navigate)) return;

            if (response.ok) {
                setCustomers(prev =>
                    prev.map(c => (c._id === customer._id || c.customerid === customer.customerid ? { ...c, status: updatedStatus } : c))
                );
                setSuccessMessage(
                    updatedStatus
                        ? translations.customerstatusactive
                        : translations.customerstatusinactive
                );
            } else {
                setWarningMessage(data.message || translations.servererror);
                setShowWarning(true);
            }
        } catch {
            setWarningMessage(translations.servererror);
            setShowWarning(true);
        } finally {
            setUpdatingStatusId(null);
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
                    <table className="customertable">
                        <thead>
                            <tr>
                                <th onClick={() => handleSort("fullname")} style={{ cursor: "pointer" }}>
                                    {translations.Customer} {renderSortIcon("fullname")}
                                </th>
                                <th onClick={() => handleSort("email")} style={{ cursor: "pointer" }}>
                                    {translations.Email} {renderSortIcon("email")}
                                </th>
                                <th onClick={() => handleSort("phone")} style={{ cursor: "pointer" }}>
                                    {translations.Phone} {renderSortIcon("phone")}
                                </th>
                                <th onClick={() => handleSort("createdAt")} style={{ cursor: "pointer" }}>
                                    {translations.joineddate} {renderSortIcon("createdAt")}
                                </th>
                                <th onClick={() => handleSort("status")} style={{ cursor: "pointer", width: "120px", textAlign: "center" }}>
                                    {translations.status} {renderSortIcon("status")}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {visibleCustomers.length > 0 ? (
                                visibleCustomers.map((customer) => {
                                    const customerKey = customer._id || customer.customerid;
                                    const hasImage = Boolean(customer.profileimage);
                                    return (
                                        <tr key={customerKey}>
                                            <td>
                                                <div className="customer-name-container">
                                                    {hasImage ? (
                                                        <img
                                                            src={customer.profileimage}
                                                            alt={customer.fullname || "Customer"}
                                                            className="customer-avatar"
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.src = profilePlaceholder;
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="customer-avatar-initials">
                                                            {getInitials(customer.fullname)}
                                                        </div>
                                                    )}
                                                    <strong>{customer.fullname || "-"}</strong>
                                                </div>
                                            </td>
                                            <td className="customer-email-cell">
                                                {customer.email || "-"}
                                            </td>
                                            <td>
                                                {customer.phone || "-"}
                                            </td>
                                            <td className="customer-date-cell">
                                                {formatDate(customer.createdAt)}
                                            </td>
                                            <td style={{ textAlign: "center" }}>
                                                <CustomSwitch
                                                    checked={Boolean(customer.status)}
                                                    disabled={updatingStatusId === customerKey}
                                                    onChange={() => handleStatusChange(customer)}
                                                />
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: "center", padding: "28px 0" }}>
                                        {translations.nodatafound}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

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

export default GetCustomer;
