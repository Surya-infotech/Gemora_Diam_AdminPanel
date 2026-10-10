import { ArrowDownward, ArrowUpward, UnfoldMore } from '@mui/icons-material';
import EditButton from '../../../Pages/Custom/EditButton';
import DeleteButton from '../../../Pages/Custom/DeleteButton';
import CustomSwitch from '../../../Pages/Custom/CustomSwitch';
import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import Placeholder from '../../../assets/placeholder.png';
import { useAuth } from '../../../Middleware/Auth';
import AlertMessage from '../../../Pages/Custom/AlertMessage';
import DeleteModal from '../../../Pages/Custom/DeleteModal';
import LoadingSpinner from '../../../Pages/Custom/LoadingSpinner';
import Pagination from '../../../Pages/Custom/Pagination';
import WarningModal from '../../../Pages/Custom/WarningModal';
import "../../../Scss/Support/Banner/getbanner.scss";
import { useLanguage } from "../../../Context/LanguageContext";
import CheckToken from '../../../utils/CheckToken';
import HandleUnauthorized from '../../../utils/HandleUnauthorized';

const GetBanner = ({ searchValue = "" }) => {
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
    const [banners, setBanners] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const fetchBanners = async () => {
            if (!CheckToken(token, logoutUser, navigate)) return;
            try {
                setLoading(true);
                const response = await fetch(`${adminPanelBackendPath}/Support/GetBanners`, {
                    method: "GET",
                    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                });
                const data = await response.json();
                if (HandleUnauthorized(data, logoutUser, navigate)) return;
                if (response.ok) {
                    setBanners(data.banners || []);
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
        fetchBanners();
    }, [navigate, logoutUser, token, adminPanelBackendPath, translations]);

    const sortItems = (column) => {
        const direction = sortColumn === column && sortDirection === "asc" ? "desc" : "asc";
        setSortColumn(column);
        setSortDirection(direction);
        setBanners([...banners].sort((a, b) => {
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

    const filteredItems = banners.filter((item) => {
        const search = (searchValue || "").toLowerCase().trim();
        if (!search) return true;
        return Object.values(item).some((value) =>
            value !== null && value !== undefined && value.toString().toLowerCase().includes(search)
        );
    });

    const totalRecords = filteredItems.length;
    const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
    const visibleItems = filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const handleEditClick = (id) => navigate(`/Support/EditBanner/${id}`);

    const handleDeleteClick = (item) => {
        setSelectedItem(item);
        setIsModalOpen(true);
    };

    const handleStatusChange = async (item) => {
        if (!CheckToken(token, logoutUser, navigate)) return;
        try {
            const updatedStatus = !item.status;
            const targetId = item._id || item.bannerid;
            const response = await fetch(`${adminPanelBackendPath}/Support/UpdateBannerStatus/${targetId}`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify({ status: updatedStatus }),
            });

            const data = await response.json();
            if (HandleUnauthorized(data, logoutUser, navigate)) return;
            if (response.ok) {
                setBanners(banners.map(b => (b._id === item._id || b.bannerid === item.bannerid) ? { ...b, status: updatedStatus } : b));
                setSuccessMessage(updatedStatus ? translations.bannerstatusactive : translations.bannerstatusinactive);
            } else {
                setWarningMessage(data.message || translations.servererror);
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
            const response = await fetch(`${adminPanelBackendPath}/Support/DeleteBanner/${targetId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            });
            const result = await response.json();
            if (HandleUnauthorized(result, logoutUser, navigate)) return;
            if (response.ok) {
                setBanners(banners.filter(b => b._id !== targetId && b.bannerid !== targetId));
                setIsModalOpen(false);
                setSuccessMessage(translations.deletebannersuccessfull);
            } else {
                setWarningMessage(result.message || translations.servererror);
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
                    <table className="bannertable">
                        <thead>
                            <tr>
                                <th>{translations.bannerimage}</th>
                                <th onClick={() => sortItems("tag")}>
                                    {translations.bannertag} {renderSortIcon("tag")}
                                </th>
                                <th onClick={() => sortItems("headingLine1")}>
                                    {translations.headingline1} {renderSortIcon("headingLine1")}
                                </th>
                                <th onClick={() => sortItems("order")}>
                                    {translations.displayorder} {renderSortIcon("order")}
                                </th>
                                <th onClick={() => sortItems("status")}>
                                    {translations.status} {renderSortIcon("status")}
                                </th>
                                <th>{translations.action}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visibleItems.length > 0 ? (
                                visibleItems.map((item, index) => {
                                    const bannerKey = item._id || item.bannerid || index;
                                    return (
                                        <tr key={bannerKey}>
                                            <td>
                                                <img
                                                    src={item.image || Placeholder}
                                                    alt={item.headingLine1 || item.title || "Banner"}
                                                    className="banner-thumbnail"
                                                    loading="lazy"
                                                    decoding="async"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = Placeholder;
                                                    }}
                                                />
                                            </td>
                                            <td>
                                                {item.tag ? (
                                                    <span className="banner-tag-badge">
                                                        {item.tag}
                                                    </span>
                                                ) : (
                                                    "-"
                                                )}
                                            </td>
                                            <td>
                                                <div className="banner-heading-text">
                                                    {item.headingLine1 || item.title || "-"}
                                                    {item.headingLine2 && (
                                                        <span className="banner-accent">{item.headingLine2}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                {item.order !== undefined && item.order !== null && item.order !== "" ? item.order : "-"}
                                            </td>
                                            <td>
                                                <CustomSwitch
                                                    checked={Boolean(item.status)}
                                                    onChange={() => handleStatusChange(item)}
                                                />
                                            </td>
                                            <td>
                                                <EditButton
                                                    onClick={() => handleEditClick(item._id || item.bannerid)}
                                                />
                                                <DeleteButton
                                                    onClick={() => handleDeleteClick(item)}
                                                />
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: "center", padding: "24px 0" }}>
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
                    onDelete={() => DeleteItem(selectedItem?._id || selectedItem?.bannerid)}
                    name={`${selectedItem?.headingLine1 || selectedItem?.title || ""}`}
                    message={translations.banner || translations.homebanners}
                    headingname={translations.deletebanner}
                    isLoading={isDeleting}
                />
            )}

            {successMessage && (<AlertMessage message={successMessage} onClose={() => setSuccessMessage("")} />)}
        </>
    );
};

export default GetBanner;
