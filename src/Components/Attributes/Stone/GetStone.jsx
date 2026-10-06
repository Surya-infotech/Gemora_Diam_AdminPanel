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
import "../../../Scss/Attributes/Stone/getstone.scss";
import { useLanguage } from "../../../Context/LanguageContext";
import CheckToken from '../../../utils/CheckToken';
import HandleUnauthorized from '../../../utils/HandleUnauthorized';

const GetStone = ({ searchValue = "" }) => {
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
    const [stones, setStones] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const fetchStones = async () => {
            if (!CheckToken(token, logoutUser, navigate)) return;
            try {
                setLoading(true);
                const response = await fetch(`${adminPanelBackendPath}/Attributes/GetStones`, {
                    method: "GET",
                    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                });
                const data = await response.json();
                if (HandleUnauthorized(data, logoutUser, navigate)) return;
                if (response.ok) {
                    setStones(data.stones || []);
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
        fetchStones();
    }, [navigate, logoutUser, token, adminPanelBackendPath, translations]);

    const sortItems = (column) => {
        const direction = sortColumn === column && sortDirection === "asc" ? "desc" : "asc";
        setSortColumn(column);
        setSortDirection(direction);
        setStones([...stones].sort((a, b) => {
            let valA = a[column] ?? "";
            let valB = b[column] ?? "";

            if (column === "status") {
                valA = a[column] ? 1 : 0;
                valB = b[column] ? 1 : 0;
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

    const filteredItems = stones.filter((item) => {
        const search = (searchValue || "").toLowerCase().trim();
        if (!search) return true;
        return Object.values(item).some((value) =>
            value !== null && value !== undefined && value.toString().toLowerCase().includes(search)
        );
    });

    const totalRecords = filteredItems.length;
    const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
    const visibleItems = filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const handleEditClick = (id) => navigate(`/Attributes/EditStone/${id}`);

    const handleDeleteClick = (item) => {
        setIsModalOpen(true);
        setSelectedItem(item);
    };

    const handleStatusChange = async (item) => {
        if (!CheckToken(token, logoutUser, navigate)) return;
        try {
            const updatedStatus = !item.status;
            const targetId = item._id || item.stoneid;
            const response = await fetch(`${adminPanelBackendPath}/Attributes/UpdateStoneStatus/${targetId}`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify({ status: updatedStatus }),
            });

            const data = await response.json();
            if (HandleUnauthorized(data, logoutUser, navigate)) return;
            if (response.ok) {
                setStones(stones.map(s => (s._id === item._id || s.stoneid === item.stoneid) ? { ...s, status: updatedStatus } : s));
                setSuccessMessage(updatedStatus ? (translations.stonestatusactive || "Stone Status updated to Active") : (translations.stonestatusinactive || "Stone Status updated to Inactive"));
            } else {
                const errorMessages = {
                    "Stone not found": translations.stonenotfound || "Stone not found",
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

    const DeleteItem = async (targetId) => {
        setIsDeleting(true);
        if (!CheckToken(token, logoutUser, navigate)) {
            setIsDeleting(false);
            return;
        }
        try {
            const response = await fetch(`${adminPanelBackendPath}/Attributes/DeleteStone/${targetId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            });
            const result = await response.json();
            if (HandleUnauthorized(result, logoutUser, navigate)) return;
            if (response.ok) {
                setStones(stones.filter(s => s._id !== targetId && s.stoneid !== targetId));
                setIsModalOpen(false);
                setSuccessMessage(translations.deletestonesuccessfull || "Stone Deleted Successfully");
            } else {
                const errorMessages = {
                    "Stone not found": translations.stonenotfound || "Stone not found",
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
                    <table className="stonetable">
                        <thead>
                            <tr>
                                <th onClick={() => sortItems("stonename")}>
                                    {translations.stonename || "Stone Name"} {renderSortIcon("stonename")}
                                </th>
                                <th onClick={() => sortItems("status")}>
                                    {translations.status || "Status"} {renderSortIcon("status")}
                                </th>
                                <th>{translations.action || "Action"}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visibleItems.length > 0 ? (
                                visibleItems.map((item) => (
                                    <tr key={item._id || item.stoneid}>
                                        <td>
                                            <span className="stone-badge">
                                                {item.stonename}
                                            </span>
                                        </td>
                                        <td>
                                            <CustomSwitch checked={item.status} onChange={() => handleStatusChange(item)} />
                                        </td>
                                        <td>
                                            <EditButton onClick={() => handleEditClick(item._id || item.stoneid)} />
                                            <DeleteButton onClick={() => handleDeleteClick(item)} />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" style={{ textAlign: "center", padding: "24px 0" }}>
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
            {isModalOpen && (
                <DeleteModal
                    open={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onDelete={() => DeleteItem(selectedItem._id || selectedItem.stoneid)}
                    name={`${selectedItem?.stonename}`}
                    message={translations.stone || "Stone"}
                    headingname={translations.deletestone || "Delete Stone"}
                    isLoading={isDeleting}
                />
            )}
            {successMessage && (<AlertMessage message={successMessage} onClose={() => setSuccessMessage("")} />)}
        </>
    );
};

export default GetStone;
