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
import "../../../Scss/System/Currency/getcurrency.scss";
import CheckToken from '../../../utils/CheckToken';
import HandleUnauthorized from '../../../utils/HandleUnauthorized';
import { useLanguage } from '../../../Context/LanguageContext';

const GetCurrency = ({ searchValue = "" }) => {
    const navigate = useNavigate();
    const { logoutUser } = useAuth();
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
    const [sortColumn, setSortColumn] = useState("countryname");
    const [sortDirection, setSortDirection] = useState("asc");
    const [currencies, setCurrencies] = useState([]);
    const [selectedCurrency, setSelectedCurrency] = useState(null);

    useEffect(() => {
        if (!CheckToken(token, logoutUser, navigate)) return;

        const fetchCurrencies = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${adminPanelBackendPath}/System/GetCurrencies`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });
                const data = await response.json();
                if (HandleUnauthorized(data, logoutUser, navigate)) return;

                if (response.ok && Array.isArray(data)) {
                    setCurrencies(data);
                } else {
                    setWarningMessage(data.message || translations.servererror || "Failed to load currencies");
                    setShowWarning(true);
                }
            } catch {
                setWarningMessage(translations.servererror || "Server error");
                setShowWarning(true);
            } finally {
                setLoading(false);
            }
        };

        fetchCurrencies();
    }, [token, navigate, logoutUser, adminPanelBackendPath, translations]);

    const renderSortIcon = (column) => {
        if (sortColumn !== column) return <UnfoldMore fontSize="small" />;
        return sortDirection === "asc" ? (
            <ArrowUpward fontSize="small" />
        ) : (
            <ArrowDownward fontSize="small" />
        );
    };

    const sortCurrencies = (column) => {
        const direction = sortColumn === column && sortDirection === "asc" ? "desc" : "asc";
        setSortColumn(column);
        setSortDirection(direction);

        const sortedCurrencies = [...currencies].sort((a, b) => {
            let valA = a[column] || "";
            let valB = b[column] || "";

            if (column === "status") {
                valA = a[column] ? 1 : 0;
                valB = b[column] ? 1 : 0;
            }

            if (valA < valB) return direction === "asc" ? -1 : 1;
            if (valA > valB) return direction === "asc" ? 1 : -1;
            return 0;
        });

        setCurrencies(sortedCurrencies);
    };

    const filteredCurrencies = currencies.filter((currency) => {
        const search = (searchValue || "").toLowerCase().trim();
        if (!search) return true;
        return (
            (currency.countryname && currency.countryname.toLowerCase().includes(search)) ||
            (currency.currency && currency.currency.toLowerCase().includes(search)) ||
            (currency.currencysymbol && currency.currencysymbol.toLowerCase().includes(search))
        );
    });

    const totalRecords = filteredCurrencies.length;
    const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
    const visibleCurrencies = filteredCurrencies.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const handleStatusChange = async (currency) => {
        if (!CheckToken(token, logoutUser, navigate)) return;
        try {
            const updatedStatus = !currency.status;
            const response = await fetch(`${adminPanelBackendPath}/System/UpdateCurrency_status/${currency._id}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status: updatedStatus }),
            });

            const data = await response.json();
            if (HandleUnauthorized(data, logoutUser, navigate)) return;

            if (response.ok) {
                setCurrencies(currencies.map(c => (c._id === currency._id ? { ...c, status: updatedStatus } : c)));
                setSuccessMessage(updatedStatus ? (translations.currencystatusactive || "Currency Status updated to Active") : (translations.currencystatusinactive || "Currency Status updated to Inactive"));
            } else {
                setWarningMessage(data.message || translations.servererror || "Failed to update currency status");
                setShowWarning(true);
            }
        } catch {
            setWarningMessage(translations.servererror || "Server error");
            setShowWarning(true);
        }
    };

    const handleEditClick = (id) => navigate(`/System/EditCurrency/${id}`);

    const handleDeleteClick = (currency) => {
        setIsModalOpen(true);
        setSelectedCurrency(currency);
    };

    const deleteCurrency = async (currencyIdToDelete) => {
        if (!CheckToken(token, logoutUser, navigate)) return;
        try {
            const response = await fetch(`${adminPanelBackendPath}/System/DeleteCurrency/${currencyIdToDelete}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            const result = await response.json();
            if (HandleUnauthorized(result, logoutUser, navigate)) return;

            if (response.ok) {
                setCurrencies(currencies.filter(c => c._id !== currencyIdToDelete && c.currencyid !== currencyIdToDelete));
                setIsModalOpen(false);
                setSuccessMessage(translations.deletecurrencysuccessfull || "Currency Deleted Successfully");
            } else {
                setWarningMessage(result.message || translations.servererror || "Failed to delete currency");
                setShowWarning(true);
            }
        } catch {
            setWarningMessage(translations.servererror || "Server error");
            setShowWarning(true);
        }
    };

    const getCurrencyPositionText = (position) => {
        const positionMap = {
            "left": translations.Left || "Left",
            "right": translations.Right || "Right",
            "left-space": translations["Left with space"] || "Left with space",
            "right-space": translations["Right with space"] || "Right with space"
        };
        return positionMap[position] || position;
    };

    const handleWarningClose = () => setShowWarning(false);
    const handleCloseAlert = () => setSuccessMessage("");

    return (
        <>
            {showWarning && <WarningModal message={warningMessage} onClose={handleWarningClose} />}
            {loading ? (
                <LoadingSpinner />
            ) : (
                <div className="tablediv">
                    <table className="currencytable">
                        <thead>
                            <tr>
                                <th onClick={() => sortCurrencies("countryname")}>
                                    {translations.CountryName || "Country Name"} {renderSortIcon("countryname")}
                                </th>
                                <th onClick={() => sortCurrencies("currency")}>
                                    {translations.currencyname || "Currency Name"} {renderSortIcon("currency")}
                                </th>
                                <th onClick={() => sortCurrencies("currencysymbol")}>
                                    {translations.currencysymbol || "Currency Symbol"} {renderSortIcon("currencysymbol")}
                                </th>
                                <th onClick={() => sortCurrencies("currencyposition")}>
                                    {translations.CurrencyPosition || "Currency Position"} {renderSortIcon("currencyposition")}
                                </th>
                                <th onClick={() => sortCurrencies("status")}>
                                    {translations.status || "Status"} {renderSortIcon("status")}
                                </th>
                                <th>{translations.action || "Action"}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visibleCurrencies.length > 0 ? (
                                visibleCurrencies.map((currency) => (
                                    <tr key={currency._id || currency.currencyid}>
                                        <td>{currency.countryname}</td>
                                        <td>{currency.currency}</td>
                                        <td>{currency.currencysymbol}</td>
                                        <td>{getCurrencyPositionText(currency.currencyposition)}</td>
                                        <td>
                                            <CustomSwitch
                                                checked={currency.status}
                                                onChange={() => handleStatusChange(currency)}
                                            />
                                        </td>
                                        <td>
                                            <EditButton onClick={() => handleEditClick(currency._id)} />
                                            <DeleteButton onClick={() => handleDeleteClick(currency)} />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: "center", padding: "24px 0" }}>
                                        {translations.nodatafound || "No data found"}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
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
                    onDelete={() => deleteCurrency(selectedCurrency?._id || selectedCurrency?.currencyid)}
                    name={selectedCurrency?.currency}
                    message={translations.currency || "Currency"}
                    headingname={translations.deletecurrency || "Delete Currency"}
                />
            )}
            {successMessage && (
                <AlertMessage message={successMessage} onClose={handleCloseAlert} />
            )}
        </>
    );
};

export default GetCurrency;
