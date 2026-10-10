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
import "../../../Scss/Support/Menu/getmenu.scss";
import { useLanguage } from "../../../Context/LanguageContext";
import CheckToken from '../../../utils/CheckToken';
import HandleUnauthorized from '../../../utils/HandleUnauthorized';

const GetMenu = ({ searchValue = "" }) => {
    const { logoutUser } = useAuth();
    const navigate = useNavigate();
    const { translations } = useLanguage();
    const adminPanelBackendPath = import.meta.env.VITE_BACKEND_URL;
    const tokenname = import.meta.env.VITE_AdminTOKEN_NAME;
    const token = localStorage.getItem(tokenname);

    const [loading, setLoading] = useState(true);
    const [menus, setMenus] = useState([]);
    const [warningMessage, setWarningMessage] = useState("");
    const [showWarning, setShowWarning] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [sortColumn, setSortColumn] = useState(null);
    const [sortDirection, setSortDirection] = useState("asc");

    const fetchMenus = async () => {
        if (!CheckToken(token, logoutUser, navigate)) return;
        try {
            setLoading(true);
            const response = await fetch(`${adminPanelBackendPath}/Support/GetMenus`, {
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
            });
            const data = await response.json();
            if (HandleUnauthorized(data, logoutUser, navigate)) return;
            if (response.ok) {
                setMenus(data.menus || []);
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

    useEffect(() => {
        setCurrentPage(1);
        fetchMenus();
    }, [navigate, logoutUser, token, adminPanelBackendPath]);

    const sortItems = (column) => {
        const direction = sortColumn === column && sortDirection === "asc" ? "desc" : "asc";
        setSortColumn(column);
        setSortDirection(direction);
        setMenus([...menus].sort((a, b) => {
            let valA = a[column] ?? "";
            let valB = b[column] ?? "";

            if (column === "status") {
                valA = a[column] ? 1 : 0;
                valB = b[column] ? 1 : 0;
            } else if (column === "order") {
                valA = Number(valA) || 0;
                valB = Number(valB) || 0;
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

    const handleStatusToggle = async (menu) => {
        if (!CheckToken(token, logoutUser, navigate)) return;
        try {
            const updatedStatus = !menu.status;
            const targetId = menu.menuid || menu._id;
            const res = await fetch(`${adminPanelBackendPath}/Support/UpdateMenuStatus/${targetId}`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify({ status: updatedStatus })
            });
            const data = await res.json();
            if (HandleUnauthorized(data, logoutUser, navigate)) return;
            if (res.ok) {
                setMenus(prev => prev.map(m => (m.menuid === targetId || m._id === targetId) ? { ...m, status: updatedStatus } : m));
                setSuccessMessage(updatedStatus ? translations.menustatusactive : translations.menustatusinactive);
            } else {
                setWarningMessage(data.message || translations.servererror);
                setShowWarning(true);
            }
        } catch {
            setWarningMessage(translations.servererror);
            setShowWarning(true);
        }
    };

    const handleDelete = async () => {
        if (!selectedItem) return;
        const targetId = selectedItem.menuid || selectedItem._id;
        try {
            setIsDeleting(true);
            if (!CheckToken(token, logoutUser, navigate)) {
                setIsDeleting(false);
                return;
            }
            const res = await fetch(`${adminPanelBackendPath}/Support/DeleteMenu/${targetId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (HandleUnauthorized(data, logoutUser, navigate)) return;
            if (res.ok) {
                setMenus(prev => prev.filter(m => m.menuid !== targetId && m._id !== targetId));
                setSuccessMessage(translations.deletemenusuccessfull);
                setIsModalOpen(false);
            } else {
                setWarningMessage(data.message || translations.servererror);
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

    const filteredItems = menus.filter(m => {
        if (!searchValue) return true;
        const q = searchValue.toLowerCase().trim();
        return (
            (m.title || "").toLowerCase().includes(q) ||
            (m.slug || "").toLowerCase().includes(q) ||
            (m.banner?.title || "").toLowerCase().includes(q)
        );
    });

    const totalRecords = filteredItems.length;
    const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
    const visibleItems = filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const handleEditClick = (id) => navigate(`/Support/EditMenu/${id}`);

    const handleDeleteClick = (item) => {
        setSelectedItem(item);
        setIsModalOpen(true);
    };

    return (
        <>
            {showWarning && <WarningModal message={warningMessage} onClose={() => setShowWarning(false)} />}
            {successMessage && <AlertMessage message={successMessage} onClose={() => setSuccessMessage("")} />}
            <div className="tablediv">
                {loading ? <LoadingSpinner /> : (
                    <table className="menutable">
                        <thead>
                            <tr>
                                <th onClick={() => sortItems("order")}>
                                    {translations.displayorder} {renderSortIcon("order")}
                                </th>
                                <th onClick={() => sortItems("title")}>
                                    {translations.menutitle} {renderSortIcon("title")}
                                </th>
                                <th onClick={() => sortItems("slug")}>
                                    {translations.menuslug} {renderSortIcon("slug")}
                                </th>
                                <th onClick={() => sortItems("status")}>
                                    {translations.status} {renderSortIcon("status")}
                                </th>
                                <th>{translations.action}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visibleItems.length > 0 ? (
                                visibleItems.map((item, idx) => {
                                    const itemId = item.menuid || item._id || idx;
                                    return (
                                        <tr key={itemId}>
                                            <td style={{ fontWeight: 600 }}>
                                                {item.order !== undefined && item.order !== null && item.order !== "" ? item.order : idx + 1}
                                            </td>
                                            <td>
                                                <div className="menu-title-text">
                                                    {item.title || "-"}
                                                </div>
                                            </td>
                                            <td>
                                                <span className="slug-badge">
                                                    {item.slug || "-"}
                                                </span>
                                            </td>
                                            <td>
                                                <CustomSwitch
                                                    checked={Boolean(item.status)}
                                                    onChange={() => handleStatusToggle(item)}
                                                />
                                            </td>
                                            <td className="action-cell">
                                                <EditButton onClick={() => handleEditClick(item.menuid || item._id)} />
                                                <DeleteButton onClick={() => handleDeleteClick(item)} />
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: "center", padding: "24px 0" }}>
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
                    onDelete={handleDelete}
                    name={`${selectedItem?.title || ""}`}
                    message={translations.menu}
                    headingname={translations.deletemenu}
                    isLoading={isDeleting}
                />
            )}
        </>
    );
};

export default GetMenu;