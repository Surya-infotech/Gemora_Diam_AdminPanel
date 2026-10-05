import { ArrowDownward, ArrowUpward, UnfoldMore } from '@mui/icons-material';
import EditButton from '../../../Pages/Custom/EditButton';
import DeleteButton from '../../../Pages/Custom/DeleteButton';
import CustomSwitch from '../../../Pages/Custom/CustomSwitch';
import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../../Middleware/Auth';
import AlertMessage from '../../../Pages/Custom/AlertMessage';
import DeleteModal from '../../../Pages/Custom/DeleteModal';
import LoadingSpinner from '../../../Pages/Custom/LoadingSpinner';
import Pagination from '../../../Pages/Custom/Pagination';
import WarningModal from '../../../Pages/Custom/WarningModal';
import "../../../Scss/System/Tax/gettax.scss";
import { useLanguage } from "../../../Context/LanguageContext";
import CheckToken from '../../../utils/CheckToken';
import HandleUnauthorized from '../../../utils/HandleUnauthorized';
import { formatTaxPrice } from '../../../utils/CurrencyFormatter';

const GetTax = ({ searchValue = "" }) => {
    const { logoutUser } = useAuth();
    const navigate = useNavigate();
    const { translations } = useLanguage();
    const adminPanelBackendPath = import.meta.env.VITE_BACKEND_URL;
    const tokenname = import.meta.env.VITE_AdminTOKEN_NAME;
    const [loading, setLoading] = useState(true);
    const [warningMessage, setWarningMessage] = useState("");
    const [showWarning, setShowWarning] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const token = localStorage.getItem(tokenname);
    const [sortColumn, setSortColumn] = useState(null);
    const [sortDirection, setSortDirection] = useState("asc");
    const [taxes, setTaxes] = useState([]);
    const [currency, setCurrency] = useState(null);
    const [selectedTax, setSelectedTax] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const fetchTaxes = async () => {
            if (!CheckToken(token, logoutUser, navigate)) return;
            try {
                setLoading(true);
                const response = await fetch(`${adminPanelBackendPath}/System/GetTaxes`, {
                    method: "GET",
                    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                });
                const data = await response.json();
                if (HandleUnauthorized(data, logoutUser, navigate)) return;
                if (response.ok) {
                    setTaxes(data.taxes || []);
                    setCurrency(data.currency || null);
                } else {
                    setWarningMessage(data.message || translations.servererror);
                    setShowWarning(true);
                }
            } catch {
                setWarningMessage(translations.servererror);
                setShowWarning(true);
            } finally {
                setLoading(false);
            }
        };

        setCurrentPage(1);
        fetchTaxes();
    }, [navigate, logoutUser, token, adminPanelBackendPath, translations]);

    const sortTaxes = (column) => {
        const direction = sortColumn === column && sortDirection === "asc" ? "desc" : "asc";
        setSortColumn(column);
        setSortDirection(direction);
        setTaxes([...taxes].sort((a, b) => {
            let valA = a[column] ?? "";
            let valB = b[column] ?? "";

            if (column === "status") {
                valA = a[column] ? 1 : 0;
                valB = b[column] ? 1 : 0;
            } else if (column === "price") {
                valA = parseFloat(a[column]) || 0;
                valB = parseFloat(b[column]) || 0;
            } else {
                valA = valA.toString().toLowerCase();
                valB = valB.toString().toLowerCase();
            }

            if (valA < valB) return direction === "asc" ? -1 : 1;
            if (valA > valB) return direction === "asc" ? 1 : -1;
            return 0;
        }));
    };

    const renderSortIcon = (column) => (
        sortColumn !== column ? <UnfoldMore fontSize="small" /> : sortDirection === "asc" ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />
    );

    const getTaxComputationTranslation = (taxcomputation) => {
        switch (taxcomputation) {
            case "inclusive":
                return translations.inclusive;
            case "exclusive":
                return translations.exclusive;
            default:
                return translations.exclusive;
        }
    };

    const getTaxCurrency = (tax) => {
        return {
            currencysymbol: tax.currencysymbol || currency?.currencysymbol || "$",
            currencyposition: tax.currencyposition || currency?.currencyposition || "left",
            thousandseparator: tax.thousandseparator !== undefined && tax.thousandseparator !== null ? tax.thousandseparator : (currency?.thousandseparator ?? ""),
            decimalseparator: tax.decimalseparator !== undefined && tax.decimalseparator !== null ? tax.decimalseparator : (currency?.decimalseparator ?? "."),
            decimal: tax.decimal !== undefined && tax.decimal !== null ? tax.decimal : (currency?.decimal ?? 2)
        };
    };

    const filteredTaxes = taxes.filter((tax) => {
        const search = (searchValue || "").toLowerCase().trim();
        if (!search) return true;
        return Object.values(tax).some((value) =>
            value !== null && value !== undefined && value.toString().toLowerCase().includes(search)
        );
    });

    const totalRecords = filteredTaxes.length;
    const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
    const visibleTaxes = filteredTaxes.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const handleEditClick = (_id) => navigate(`/System/EditTax/${_id}`);

    const handleDeleteClick = (tax) => {
        setIsModalOpen(true);
        setSelectedTax(tax);
    };

    const handleStatusChange = async (tax) => {
        if (!CheckToken(token, logoutUser, navigate)) return;
        try {
            const updatedStatus = !tax.status;
            const response = await fetch(`${adminPanelBackendPath}/System/UpdateTaxStatus/${tax._id || tax.taxid}`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify({ status: updatedStatus }),
            });

            const data = await response.json();
            if (HandleUnauthorized(data, logoutUser, navigate)) return;
            if (response.ok) {
                setTaxes(taxes.map(t => (t._id === tax._id || t.taxid === tax.taxid) ? { ...t, status: updatedStatus } : t));
                setSuccessMessage(`${updatedStatus ? translations.taxstatusactive : translations.taxstatusinactive}`);
            } else {
                const errorMessages = {
                    "Tax not found": translations.taxnotfound,
                    "Server error": translations.servererror
                };
                setWarningMessage(errorMessages[data.message] || translations.servererror);
                setShowWarning(true);
            }
        } catch {
            setWarningMessage(translations.servererror);
            setShowWarning(true);
        }
    };

    const DeleteTax = async (taxId) => {
        setIsDeleting(true);
        if (!CheckToken(token, logoutUser, navigate)) {
            setIsDeleting(false);
            return;
        }
        try {
            const response = await fetch(`${adminPanelBackendPath}/System/DeleteTax/${taxId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            });
            const result = await response.json();
            if (HandleUnauthorized(result, logoutUser, navigate)) return;
            if (response.ok) {
                setTaxes(taxes.filter(t => t._id !== taxId && t.taxid !== taxId));
                setIsModalOpen(false);
                setSuccessMessage(translations.deletetaxsuccessfull);
            } else {
                const errorMessages = {
                    "Tax not found": translations.taxnotfound,
                    "Server error": translations.servererror
                };
                setWarningMessage(errorMessages[result.message] || translations.servererror);
                setShowWarning(true);
            }
        } catch {
            setWarningMessage(translations.servererror);
            setShowWarning(true);
        } finally {
            setIsDeleting(false);
            setIsModalOpen(false);
        }
    };

    return (
        <>
            {showWarning && <WarningModal message={warningMessage} onClose={() => setShowWarning(false)} />}
            <div className="tablediv">
                {loading ? <LoadingSpinner /> : (
                    <table className="taxtable">
                        <thead>
                            <tr>
                                <th onClick={() => sortTaxes("taxname")}>{translations.taxname} {renderSortIcon("taxname")}</th>
                                <th>{translations.Country}</th>
                                <th>{translations.taxcomputation}</th>
                                <th onClick={() => sortTaxes("price")}>{translations.price} {renderSortIcon("price")}</th>
                                <th onClick={() => sortTaxes("status")}>{translations.status} {renderSortIcon("status")}</th>
                                <th>{translations.action}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visibleTaxes.length > 0 ? (
                                visibleTaxes.map((tax) => (
                                    <tr key={tax._id || tax.taxid}>
                                        <td>{tax.taxname}</td>
                                        <td>{tax.country}</td>
                                        <td>{getTaxComputationTranslation(tax.taxcomputation)}</td>
                                        <td>{formatTaxPrice(tax.price, tax.taxtype, getTaxCurrency(tax))}</td>
                                        <td>
                                            <CustomSwitch checked={tax.status} onChange={() => handleStatusChange(tax)} />
                                        </td>
                                        <td>
                                            <EditButton onClick={() => handleEditClick(tax._id || tax.taxid)} />
                                            <DeleteButton onClick={() => handleDeleteClick(tax)} />
                                        </td>
                                    </tr>
                                ))
                            ) : <tr><td colSpan="6" style={{ textAlign: "center", padding: "24px 0" }}>{translations.nodatafound}</td></tr>}
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
            {isModalOpen && (
                <DeleteModal
                    open={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onDelete={() => DeleteTax(selectedTax._id || selectedTax.taxid)}
                    name={`${selectedTax?.taxname}`}
                    message={translations.tax}
                    headingname={translations.deletetax}
                    isLoading={isDeleting}
                />
            )}
            {successMessage && (<AlertMessage message={successMessage} onClose={() => setSuccessMessage("")} />)}
        </>
    );
};

export default GetTax;
