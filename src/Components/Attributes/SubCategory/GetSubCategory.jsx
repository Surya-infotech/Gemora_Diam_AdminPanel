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
import "../../../Scss/Attributes/SubCategory/getsubcategory.scss";
import { useLanguage } from "../../../Context/LanguageContext";
import { usePermissions } from '../../../Hooks/usePermissions';
import CheckToken from '../../../utils/CheckToken';
import HandleUnauthorized from '../../../utils/HandleUnauthorized';

const GetSubCategory = ({ searchValue = "" }) => {
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
    const [subCategories, setSubCategories] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const fetchSubCategories = async () => {
            if (!CheckToken(token, logoutUser, navigate)) return;
            try {
                setLoading(true);
                const response = await fetch(`${adminPanelBackendPath}/Attributes/GetSubCategories`, {
                    method: "GET",
                    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                });
                const data = await response.json();
                if (HandleUnauthorized(data, logoutUser, navigate)) return;
                if (response.ok) {
                    setSubCategories(data.subcategories || []);
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
        fetchSubCategories();
    }, [navigate, logoutUser, token, adminPanelBackendPath, translations]);

    const sortItems = (column) => {
        const direction = sortColumn === column && sortDirection === "asc" ? "desc" : "asc";
        setSortColumn(column);
        setSortDirection(direction);
        setSubCategories([...subCategories].sort((a, b) => {
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

    const filteredItems = subCategories.filter((item) => {
        const search = (searchValue || "").toLowerCase().trim();
        if (!search) return true;
        return Object.values(item).some((value) =>
            value !== null && value !== undefined && value.toString().toLowerCase().includes(search)
        );
    });

    const totalRecords = filteredItems.length;
    const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
    const visibleItems = filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const handleEditClick = (id) => navigate(`/Attributes/EditSubCategory/${id}`);

    const handleDeleteClick = (item) => {
        setIsModalOpen(true);
        setSelectedItem(item);
    };

    const showActionColumn = canEdit('subCategory') || canDelete('subCategory');

    const handleStatusChange = async (item) => {
        if (!canEdit('subCategory')) return;
        if (!CheckToken(token, logoutUser, navigate)) return;
        try {
            const updatedStatus = !item.status;
            const targetId = item._id || item.subcategoryid;
            const response = await fetch(`${adminPanelBackendPath}/Attributes/UpdateSubCategoryStatus/${targetId}`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify({ status: updatedStatus }),
            });

            const data = await response.json();
            if (HandleUnauthorized(data, logoutUser, navigate)) return;
            if (response.ok) {
                setSubCategories(subCategories.map(c => (c._id === item._id || c.subcategoryid === item.subcategoryid) ? { ...c, status: updatedStatus } : c));
                setSuccessMessage(updatedStatus ? (translations.subcategorystatusactive || "Sub Category Status updated to Active") : (translations.subcategorystatusinactive || "Sub Category Status updated to Inactive"));
            } else {
                const errorMessages = {
                    "Sub Category not found": translations.subcategorynotfound || "Sub Category not found",
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
            const response = await fetch(`${adminPanelBackendPath}/Attributes/DeleteSubCategory/${targetId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            });
            const result = await response.json();
            if (HandleUnauthorized(result, logoutUser, navigate)) return;
            if (response.ok) {
                setSubCategories(subCategories.filter(c => c._id !== targetId && c.subcategoryid !== targetId));
                setIsModalOpen(false);
                setSuccessMessage(translations.deletesubcategorysuccessfull || "Sub Category Deleted Successfully");
            } else {
                const errorMessages = {
                    "Sub Category not found": translations.subcategorynotfound || "Sub Category not found",
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
                    <table className="subcategorytable">
                        <thead>
                            <tr>
                                <th onClick={() => sortItems("subcategoryname")}>
                                    {translations.subcategoryname || "Sub Category Name"} {renderSortIcon("subcategoryname")}
                                </th>
                                <th onClick={() => sortItems("categoryname")}>
                                    {translations.Category || translations.category || "Category"} {renderSortIcon("categoryname")}
                                </th>
                                <th onClick={() => sortItems("status")}>
                                    {translations.status || "Status"} {renderSortIcon("status")}
                                </th>
                                {showActionColumn && <th>{translations.action || "Action"}</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {visibleItems.length > 0 ? (
                                visibleItems.map((item) => (
                                    <tr key={item._id || item.subcategoryid}>
                                        <td>
                                            <span className="subcategory-badge">
                                                {item.subcategoryname}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="category-badge">
                                                {item.categoryname || "-"}
                                            </span>
                                        </td>
                                        <td>
                                            <CustomSwitch checked={item.status} onChange={() => handleStatusChange(item)} disabled={!canEdit('subCategory')} />
                                        </td>
                                        {showActionColumn && (
                                            <td>
                                                {canEdit('subCategory') && <EditButton onClick={() => handleEditClick(item._id || item.subcategoryid)} />}
                                                {canDelete('subCategory') && <DeleteButton onClick={() => handleDeleteClick(item)} />}
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
                    onDelete={() => DeleteItem(selectedItem._id || selectedItem.subcategoryid)}
                    name={`${selectedItem?.subcategoryname}`}
                    message={translations.subcategory || "Sub Category"}
                    headingname={translations.deletesubcategory || "Delete Sub Category"}
                    isLoading={isDeleting}
                />
            )}
            {successMessage && (<AlertMessage message={successMessage} onClose={() => setSuccessMessage("")} />)}
        </>
    );
};

export default GetSubCategory;