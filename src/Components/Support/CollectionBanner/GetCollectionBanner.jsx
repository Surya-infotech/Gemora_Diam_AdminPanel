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
import "../../../Scss/Support/CollectionBanner/getcollectionbanner.scss";
import { useLanguage } from "../../../Context/LanguageContext";
import CheckToken from '../../../utils/CheckToken';
import HandleUnauthorized from '../../../utils/HandleUnauthorized';

const GetCollectionBanner = ({ searchValue = "" }) => {
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
                const response = await fetch(`${adminPanelBackendPath}/Support/GetCollectionBanners`, {
                    method: "GET",
                    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                });
                const data = await response.json();
                if (HandleUnauthorized(data, logoutUser, navigate)) return;
                if (response.ok) {
                    setBanners(data.collectionBanners || []);
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

        setBanners((prev) => [...prev].sort((a, b) => {
            let valA = a[column];
            let valB = b[column];

            if (valA === undefined || valA === null) valA = "";
            if (valB === undefined || valB === null) valB = "";

            if (typeof valA === "number" && typeof valB === "number") {
                return direction === "asc" ? valA - valB : valB - valA;
            }

            valA = valA.toString().toLowerCase();
            valB = valB.toString().toLowerCase();

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
        return (
            (item.title || "").toLowerCase().includes(search) ||
            (item.tag || "").toLowerCase().includes(search) ||
            (item.description || "").toLowerCase().includes(search) ||
            (item.buttonText || "").toLowerCase().includes(search) ||
            (item.buttonLink || "").toLowerCase().includes(search)
        );
    });

    const totalRecords = filteredItems.length;
    const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
    const visibleItems = filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const handleEditClick = (id) => navigate(`/Support/EditCollectionBanner/${id}`);

    const handleDeleteClick = (item) => {
        setIsModalOpen(true);
        setSelectedItem(item);
    };

    const handleStatusChange = async (item) => {
        if (!CheckToken(token, logoutUser, navigate)) return;
        try {
            const updatedStatus = !item.status;
            const targetId = item._id || item.bannerid;
            const response = await fetch(`${adminPanelBackendPath}/Support/UpdateCollectionBannerStatus/${targetId}`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify({ status: updatedStatus }),
            });

            const data = await response.json();
            if (HandleUnauthorized(data, logoutUser, navigate)) return;
            if (response.ok) {
                setBanners(banners.map(b => (b._id === item._id || b.bannerid === item.bannerid) ? { ...b, status: updatedStatus } : b));
                setSuccessMessage(updatedStatus ? (translations.collectionbannerstatusactive || "Collection Banner status updated to Active") : (translations.collectionbannerstatusinactive || "Collection Banner status updated to Inactive"));
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
            const response = await fetch(`${adminPanelBackendPath}/Support/DeleteCollectionBanner/${targetId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            });
            const result = await response.json();
            if (HandleUnauthorized(result, logoutUser, navigate)) return;
            if (response.ok) {
                setBanners(banners.filter(b => b._id !== targetId && b.bannerid !== targetId));
                setIsModalOpen(false);
                setSuccessMessage(translations.deletecollectionbannersuccessfull || "Collection Banner deleted successfully");
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
                    <table className="collectionbannertable">
                        <thead>
                            <tr>
                                <th>{translations.bannerimage || "Image"}</th>
                                <th onClick={() => sortItems("tag")}>
                                    {translations.collectionbannertag || "Tag / Eyebrow"} {renderSortIcon("tag")}
                                </th>
                                <th onClick={() => sortItems("title")}>
                                    {translations.title || "Title"} {renderSortIcon("title")}
                                </th>
                                <th>{translations.description || "Description"}</th>
                                <th>{translations.position || "Position"}</th>
                                <th onClick={() => sortItems("order")}>
                                    {translations.displayorder || "Order"} {renderSortIcon("order")}
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
                                    <tr key={item._id || item.bannerid}>
                                        <td>
                                            <img
                                                src={item.image}
                                                alt={item.title}
                                                className="banner-thumbnail"
                                                onError={(e) => { e.target.src = Placeholder; }}
                                            />
                                        </td>
                                        <td>
                                            <span className="banner-tag-badge">
                                                {item.tag || "ATELIER"}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="banner-heading-text">
                                                {item.title}
                                            </div>
                                        </td>
                                        <td>
                                            <p className="banner-desc-text" title={item.description}>
                                                {item.description || "-"}
                                            </p>
                                        </td>
                                        <td>
                                            <span className="position-badge">
                                                {item.position || "left"}
                                            </span>
                                        </td>
                                        <td>
                                            <span style={{ fontWeight: 600 }}>{item.order ?? 1}</span>
                                        </td>
                                        <td>
                                            <CustomSwitch checked={item.status} onChange={() => handleStatusChange(item)} />
                                        </td>
                                        <td>
                                            <EditButton onClick={() => handleEditClick(item._id || item.bannerid)} />
                                            <DeleteButton onClick={() => handleDeleteClick(item)} />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" style={{ textAlign: "center", padding: "24px 0" }}>
                                        {translations.nodatafound || "No data found"}
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
                    onDelete={() => DeleteItem(selectedItem._id || selectedItem.bannerid)}
                    name={`${selectedItem?.title}`}
                    message={translations.collectionbanner || "Collection Banner"}
                    headingname={translations.deletecollectionbanner || "Delete Collection Banner"}
                    isLoading={isDeleting}
                />
            )}
            {successMessage && (<AlertMessage message={successMessage} onClose={() => setSuccessMessage("")} />)}
        </>
    );
};

export default GetCollectionBanner;
