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
import "../../../Scss/Attributes/Length/getlength.scss";
import { usePermissions } from '../../../Hooks/usePermissions';
import CheckToken from '../../../utils/CheckToken';
import HandleUnauthorized from '../../../utils/HandleUnauthorized';

const GetLength = ({
  searchValue = ""
}) => {
  const {
    logoutUser
  } = useAuth();
  const navigate = useNavigate();
  const {
    canEdit,
    canDelete
  } = usePermissions();
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
  const [lengths, setLengths] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchLengths = async () => {
      if (!CheckToken(token, logoutUser, navigate)) return;
      try {
        setLoading(true);
        const response = await fetch(`${adminPanelBackendPath}/Attributes/GetLengths`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        const data = await response.json();
        if (HandleUnauthorized(data, logoutUser, navigate)) return;
        if (response.ok) {
          setLengths(data.lengths || []);
        } else {
          setWarningMessage(data.message || "Server error");
          setShowWarning(true);
        }
      } catch {
        setWarningMessage("Server error");
        setShowWarning(true);
      } finally {
        setLoading(false);
      }
    };
    fetchLengths();
  }, [navigate, logoutUser, token, adminPanelBackendPath]);

  const sortItems = column => {
    const direction = sortColumn === column && sortDirection === "asc" ? "desc" : "asc";
    setSortColumn(column);
    setSortDirection(direction);
    setLengths([...lengths].sort((a, b) => {
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

  const renderSortIcon = column => sortColumn !== column ? <UnfoldMore fontSize="small" /> : sortDirection === "asc" ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />;

  const filteredItems = lengths.filter(item => {
    const search = (searchValue || "").toLowerCase().trim();
    if (!search) return true;
    return Object.values(item).some(value => value !== null && value !== undefined && value.toString().toLowerCase().includes(search));
  });

  const totalRecords = filteredItems.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const visibleItems = filteredItems.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize);

  const handleEditClick = id => navigate(`/Attributes/EditLength/${id}`);
  const handleDeleteClick = item => {
    setIsModalOpen(true);
    setSelectedItem(item);
  };

  const showActionColumn = canEdit('length') || canDelete('length');

  const handleStatusChange = async item => {
    if (!canEdit('length')) return;
    if (!CheckToken(token, logoutUser, navigate)) return;
    try {
      const updatedStatus = !item.status;
      const targetId = item._id || item.lengthid;
      const response = await fetch(`${adminPanelBackendPath}/Attributes/UpdateLengthStatus/${targetId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          status: updatedStatus
        })
      });
      const data = await response.json();
      if (HandleUnauthorized(data, logoutUser, navigate)) return;
      if (response.ok) {
        setLengths(lengths.map(l => l._id === item._id || l.lengthid === item.lengthid ? {
          ...l,
          status: updatedStatus
        } : l));
        setSuccessMessage(updatedStatus ? "Length Status updated to Active" : "Length Status updated to Inactive");
      } else {
        const errorMessages = {
          "Length not found": "Length not found",
          "Server error": "Server error"
        };
        setWarningMessage(errorMessages[data.message] || "Server error");
        setShowWarning(true);
      }
    } catch {
      setWarningMessage("Server error");
      setShowWarning(true);
    }
  };

  const DeleteItem = async targetId => {
    setIsDeleting(true);
    if (!CheckToken(token, logoutUser, navigate)) {
      setIsDeleting(false);
      return;
    }
    try {
      const response = await fetch(`${adminPanelBackendPath}/Attributes/DeleteLength/${targetId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      const result = await response.json();
      if (HandleUnauthorized(result, logoutUser, navigate)) return;
      if (response.ok) {
        setLengths(lengths.filter(l => l._id !== targetId && l.lengthid !== targetId));
        setIsModalOpen(false);
        setSuccessMessage("Length Deleted Successfully");
      } else {
        const errorMessages = {
          "Length not found": "Length not found",
          "Server error": "Server error"
        };
        setWarningMessage(errorMessages[result.message] || "Server error");
        setShowWarning(true);
      }
    } catch {
      setWarningMessage("Server error");
      setShowWarning(true);
    } finally {
      setIsDeleting(false);
      setIsModalOpen(false);
    }
  };

  return <>
    {showWarning && <WarningModal message={warningMessage} onClose={() => setShowWarning(false)} />}
    <div className="tablediv">
      {loading ? <LoadingSpinner /> : <table className="lengthtable">
        <thead>
          <tr>
            <th onClick={() => sortItems("lengthname")}>
              {"Length Name"} {renderSortIcon("lengthname")}
            </th>
            <th onClick={() => sortItems("lengthtype")}>
              {"Length Type"} {renderSortIcon("lengthtype")}
            </th>
            <th onClick={() => sortItems("status")}>
              {"Status"} {renderSortIcon("status")}
            </th>
            {showActionColumn && <th>{"Action"}</th>}
          </tr>
        </thead>
        <tbody>
          {visibleItems.length > 0 ? visibleItems.map(item => <tr key={item._id || item.lengthid}>
            <td>
              <span className="length-badge">
                {item.lengthname}
              </span>
            </td>
            <td>
              <span className={`type-badge ${item.lengthtype ? item.lengthtype.toLowerCase() : ''}`}>
                {item.lengthtype}
              </span>
            </td>
            <td>
              <CustomSwitch checked={item.status} onChange={() => handleStatusChange(item)} disabled={!canEdit('length')} />
            </td>
            {showActionColumn && <td>
              {canEdit('length') && <EditButton onClick={() => handleEditClick(item._id || item.lengthid)} />}
              {canDelete('length') && <DeleteButton onClick={() => handleDeleteClick(item)} />}
            </td>}
          </tr>) : <tr>
            <td colSpan={showActionColumn ? 4 : 3} style={{
              textAlign: "center",
              padding: "24px 0"
            }}>
              {"No data found"}
            </td>
          </tr>}
        </tbody>
      </table>}
    </div>
    {!loading && <Pagination currentPage={safeCurrentPage} totalPages={totalPages} onPageChange={page => setCurrentPage(page)} pageSizeOptions={[10, 15, 20, 50]} selectedPageSize={pageSize} onPageSizeChange={size => {
      setPageSize(size);
      setCurrentPage(1);
    }} totalRecords={totalRecords} />}
    {isModalOpen && <DeleteModal open={isModalOpen} onClose={() => setIsModalOpen(false)} onDelete={() => DeleteItem(selectedItem._id || selectedItem.lengthid)} name={`${selectedItem?.lengthname}`} message={"Length"} headingname={"Delete Length"} isLoading={isDeleting} />}
    {successMessage && <AlertMessage message={successMessage} onClose={() => setSuccessMessage("")} />}
  </>;
};

export default GetLength;
