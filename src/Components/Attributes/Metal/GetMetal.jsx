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
import "../../../Scss/Attributes/Metal/getmetal.scss";
import { useLanguage } from "../../../Context/LanguageContext";
import { usePermissions } from '../../../Hooks/usePermissions';
import CheckToken from '../../../utils/CheckToken';
import HandleUnauthorized from '../../../utils/HandleUnauthorized';

const GetMetal = ({ searchValue = "" }) => {
    const { logoutUser } = useAuth();
    const navigate = useNavigate();
    const { translations } = useLanguage();
    const { canEdit, canDelete } = usePermissions();
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
    const [metals, setMetals] = useState([]);
    const [selectedMetal, setSelectedMetal] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const fetchMetals = async () => {
            if (!CheckToken(token, logoutUser, navigate)) return;
            try {
                setLoading(true);
                const response = await fetch(`${adminPanelBackendPath}/Attributes/GetMetals`, {
                    method: "GET",
                    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                });
                const data = await response.json();
                if (HandleUnauthorized(data, logoutUser, navigate)) return;
                if (response.ok) {
                    setMetals(data.metals || []);
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
        fetchMetals();
    }, [navigate, logoutUser, token, adminPanelBackendPath, translations]);

    const sortMetals = (column) => {
        const direction = sortColumn === column && sortDirection === "asc" ? "desc" : "asc";
        setSortColumn(column);
        setSortDirection(direction);
        setMetals([...metals].sort((a, b) => {
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

    const filteredMetals = metals.filter((metal) => {
        const search = (searchValue || "").toLowerCase().trim();
        if (!search) return true;
        return Object.values(metal).some((value) =>
            value !== null && value !== undefined && value.toString().toLowerCase().includes(search)
        );
    });

    const totalRecords = filteredMetals.length;
    const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
    const visibleMetals = filteredMetals.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const handleEditClick = (id) => navigate(`/Attributes/EditMetal/${id}`);

    const handleDeleteClick = (metal) => {
        setIsModalOpen(true);
        setSelectedMetal(metal);
    };

    const showActionColumn = canEdit('metal') || canDelete('metal');

    const handleStatusChange = async (metal) => {
        if (!canEdit('metal')) return;
        if (!CheckToken(token, logoutUser, navigate)) return;
        try {
            const updatedStatus = !metal.status;
            const targetId = metal._id || metal.metalid;
            const response = await fetch(`${adminPanelBackendPath}/Attributes/UpdateMetalStatus/${targetId}`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify({ status: updatedStatus }),
            });

            const data = await response.json();
            if (HandleUnauthorized(data, logoutUser, navigate)) return;
            if (response.ok) {
                setMetals(metals.map(m => (m._id === metal._id || m.metalid === metal.metalid) ? { ...m, status: updatedStatus } : m));
                setSuccessMessage(updatedStatus ? (translations.metalstatusactive) : (translations.metalstatusinactive));
            } else {
                const errorMessages = {
                    "Metal not found": translations.metalnotfound,
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

    const DeleteMetal = async (metalId) => {
        setIsDeleting(true);
        if (!CheckToken(token, logoutUser, navigate)) {
            setIsDeleting(false);
            return;
        }
        try {
            const response = await fetch(`${adminPanelBackendPath}/Attributes/DeleteMetal/${metalId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            });
            const result = await response.json();
            if (HandleUnauthorized(result, logoutUser, navigate)) return;
            if (response.ok) {
                setMetals(metals.filter(m => m._id !== metalId && m.metalid !== metalId));
                setIsModalOpen(false);
                setSuccessMessage(translations.deletemetalsuccessfull);
            } else {
                const errorMessages = {
                    "Metal not found": translations.metalnotfound,
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
                    <table className="metaltable">
                        <thead>
                            <tr>
                                <th onClick={() => sortMetals("metalname")}>
                                    {translations.metalname} {renderSortIcon("metalname")}
                                </th>
                                <th onClick={() => sortMetals("metaltype")}>
                                    {translations.metaltype} {renderSortIcon("metaltype")}
                                </th>
                                <th onClick={() => sortMetals("status")}>
                                    {translations.status} {renderSortIcon("status")}
                                </th>
                                {showActionColumn && <th>{translations.action}</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {visibleMetals.length > 0 ? (
                                visibleMetals.map((metal) => (
                                    <tr key={metal._id || metal.metalid}>
                                        <td><strong>{metal.metalname}</strong></td>
                                        <td>
                                            <span className="metal-badge">
                                                {metal.metaltype}
                                            </span>
                                        </td>
                                        <td>
                                            <CustomSwitch checked={metal.status} onChange={() => handleStatusChange(metal)} disabled={!canEdit('metal')} />
                                        </td>
                                        {showActionColumn && (
                                            <td>
                                                {canEdit('metal') && <EditButton onClick={() => handleEditClick(metal._id || metal.metalid)} />}
                                                {canDelete('metal') && <DeleteButton onClick={() => handleDeleteClick(metal)} />}
                                            </td>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={showActionColumn ? 4 : 3} style={{ textAlign: "center", padding: "24px 0" }}>
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
                    onDelete={() => DeleteMetal(selectedMetal._id || selectedMetal.metalid)}
                    name={`${selectedMetal?.metalname}`}
                    message={translations.metal}
                    headingname={translations.deletemetal}
                    isLoading={isDeleting}
                />
            )}
            {successMessage && (<AlertMessage message={successMessage} onClose={() => setSuccessMessage("")} />)}
        </>
    );
};

export default GetMetal;
