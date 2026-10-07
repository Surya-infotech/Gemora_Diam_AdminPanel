import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowDownward, ArrowUpward, UnfoldMore } from "@mui/icons-material";
import Placeholder from "../../assets/placeholder.png";
import { useAuth } from "../../Middleware/Auth";
import AlertMessage from "../../Pages/Custom/AlertMessage";
import CustomSwitch from "../../Pages/Custom/CustomSwitch";
import DeleteButton from "../../Pages/Custom/DeleteButton";
import DeleteModal from "../../Pages/Custom/DeleteModal";
import EditButton from "../../Pages/Custom/EditButton";
import LoadingSpinner from "../../Pages/Custom/LoadingSpinner";
import Pagination from "../../Pages/Custom/Pagination";
import WarningModal from "../../Pages/Custom/WarningModal";
import "../../Scss/Products/getitem.scss";
import { useLanguage } from "../../Context/LanguageContext";
import { usePermissions } from "../../Hooks/usePermissions";
import CheckToken from "../../utils/CheckToken";
import HandleUnauthorized from "../../utils/HandleUnauthorized";

const ItemImage = ({ src, alt }) => {
    const [loaded, setLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        setLoaded(false);
        setHasError(false);
    }, [src]);

    if (!src || hasError) {
        return (
            <img
                src={Placeholder}
                alt={alt || "placeholder"}
                className="item-thumbnail"
            />
        );
    }

    return (
        <div className="item-thumbnail-wrapper">
            {!loaded && (
                <img
                    src={Placeholder}
                    alt="Loading..."
                    className="item-thumbnail placeholder-loading"
                />
            )}
            <img
                src={src}
                alt={alt || "item"}
                className={`item-thumbnail ${!loaded ? "is-loading" : ""}`}
                onLoad={() => setLoaded(true)}
                onError={() => setHasError(true)}
            />
        </div>
    );
};

const GetItem = ({ searchValue }) => {
    const navigate = useNavigate();
    const { translations } = useLanguage();
    const { canEdit, canDelete } = usePermissions();
    const { logoutUser } = useAuth();
    const adminPanelBackendPath = import.meta.env.VITE_BACKEND_URL;
    const tokenname = import.meta.env.VITE_AdminTOKEN_NAME;
    const token = localStorage.getItem(tokenname);

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [warningMessage, setWarningMessage] = useState("");
    const [showWarning, setShowWarning] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [sortColumn, setSortColumn] = useState("updatedAt");
    const [sortDirection, setSortDirection] = useState("desc");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const fetchItems = async () => {
            if (!CheckToken(token, logoutUser, navigate)) return;
            try {
                setLoading(true);
                const response = await fetch(`${adminPanelBackendPath}/Products/GetItems`, {
                    method: "GET",
                    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                });
                const data = await response.json();
                if (HandleUnauthorized(data, logoutUser, navigate)) return;
                if (response.ok) {
                    setItems(data.items || []);
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
        fetchItems();
    }, [navigate, logoutUser, token, adminPanelBackendPath, translations]);

    const sortItems = (column) => {
        const direction = sortColumn === column && sortDirection === "asc" ? "desc" : "asc";
        setSortColumn(column);
        setSortDirection(direction);
        setItems([...items].sort((a, b) => {
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

    const filteredItems = items.filter((item) => {
        const search = (searchValue || "").toLowerCase().trim();
        if (!search) return true;
        const skuMatch = (item.sku || "").toLowerCase().includes(search);
        const nameMatch = (item.itemname || "").toLowerCase().includes(search);
        const catMatch = (item.categoryname || "").toLowerCase().includes(search);
        const descMatch = (item.description || "").toLowerCase().includes(search);
        return skuMatch || nameMatch || catMatch || descMatch;
    });

    const totalRecords = filteredItems.length;
    const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
    const visibleItems = filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const handleEditClick = (id) => navigate(`/Products/EditItem/${id}`);

    const handleDeleteClick = (item) => {
        setIsModalOpen(true);
        setSelectedItem(item);
    };

    const handleStatusChange = async (item) => {
        if (!CheckToken(token, logoutUser, navigate)) return;
        try {
            const updatedStatus = !item.status;
            const targetId = item._id || item.itemid;
            const response = await fetch(`${adminPanelBackendPath}/Products/UpdateItemStatus/${targetId}`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify({ status: updatedStatus }),
            });

            const data = await response.json();
            if (HandleUnauthorized(data, logoutUser, navigate)) return;
            if (response.ok) {
                setItems(items.map(i => (i._id === item._id || i.itemid === item.itemid) ? { ...i, status: updatedStatus } : i));
                setSuccessMessage(updatedStatus ? (translations.itemstatusactive || "Item Status updated to Active") : (translations.itemstatusinactive || "Item Status updated to Inactive"));
            } else {
                const errorMessages = {
                    "Item not found": translations.itemnotfound || "Item not found",
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
            const response = await fetch(`${adminPanelBackendPath}/Products/DeleteItem/${targetId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            });
            const result = await response.json();
            if (HandleUnauthorized(result, logoutUser, navigate)) return;
            if (response.ok) {
                setItems(items.filter(i => i._id !== targetId && i.itemid !== targetId));
                setIsModalOpen(false);
                setSuccessMessage(translations.deleteitemsuccessfull || "Item Deleted Successfully");
            } else {
                const errorMessages = {
                    "Item not found": translations.itemnotfound || "Item not found",
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
                    <table className="itemtable">
                        <thead>
                            <tr>
                                <th className="item-name-col" onClick={() => sortItems("itemname")}>
                                    {translations.itemname || "Item Name"} {renderSortIcon("itemname")}
                                </th>
                                <th onClick={() => sortItems("categoryname")}>
                                    {translations.Category || "Category"} {renderSortIcon("categoryname")}
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
                                    <tr key={item._id || item.itemid}>
                                        <td className="item-name-col">
                                            <div className="item-info-cell">
                                                <ItemImage src={item.image} alt={item.itemname} />
                                                <div className="item-text-wrapper">
                                                    <strong className="item-name-text">{item.itemname}</strong>
                                                    {item.sku && <span className="item-sku-text">{item.sku}</span>}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="category-badge">
                                                {item.categoryname || "-"}
                                            </span>
                                        </td>
                                        <td>
                                            <CustomSwitch checked={item.status} onChange={() => handleStatusChange(item)} />
                                        </td>
                                        <td>
                                            {canEdit('item') && <EditButton onClick={() => handleEditClick(item._id || item.itemid)} />}
                                            {canDelete('item') && <DeleteButton onClick={() => handleDeleteClick(item)} />}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4">
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
                    onDelete={() => DeleteItem(selectedItem._id || selectedItem.itemid)}
                    name={`${selectedItem?.itemname}`}
                    message={translations.Item || "Item"}
                    headingname={translations.deleteitem || "Delete Item"}
                    isLoading={isDeleting}
                />
            )}
            {successMessage && (<AlertMessage message={successMessage} onClose={() => setSuccessMessage("")} />)}
        </>
    );
};

export default GetItem;
