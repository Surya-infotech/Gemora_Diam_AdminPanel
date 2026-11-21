import EditButton from '../../../Pages/Custom/EditButton';
import DeleteButton from '../../../Pages/Custom/DeleteButton';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../../Middleware/Auth';
import AlertMessage from '../../../Pages/Custom/AlertMessage';
import DeleteModal from '../../../Pages/Custom/DeleteModal';
import LoadingSpinner from '../../../Pages/Custom/LoadingSpinner';
import Pagination from '../../../Pages/Custom/Pagination';
import WarningModal from '../../../Pages/Custom/WarningModal';
import '../../../Scss/System/Setting/getfiscalyear.scss';
import CheckToken from '../../../utils/CheckToken';
import HandleUnauthorized from '../../../utils/HandleUnauthorized';
const GetFiscalYear = () => {
  const {
    logoutUser
  } = useAuth();
  const navigate = useNavigate();
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
  const [fiscalYears, setFiscalYears] = useState([]);
  const [selectedFiscalYear, setSelectedFiscalYear] = useState(null);
  const intervalRef = useRef(null);
  const fetchFiscalYears = useCallback(async () => {
    if (!CheckToken(token, logoutUser, navigate)) return;
    try {
      setLoading(true);
      const response = await fetch(`${adminPanelBackendPath}/System/GetFiscalYear`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      const data = await response.json();
      if (HandleUnauthorized(data, logoutUser, navigate)) return;
      if (response.ok) setFiscalYears(data);else {
        const errorMessages = {
          "Fiscal year not found": "Fiscal year not found",
          "Server error": "Server error"
        };
        setWarningMessage(errorMessages[data.message] || "Server error");
        setShowWarning(true);
      }
    } catch {
      setWarningMessage("Server error");
      setShowWarning(true);
    } finally {
      setLoading(false);
    }
  }, [token, logoutUser, navigate, adminPanelBackendPath]);
  const fetchCurrentFiscalYear = useCallback(async () => {
    try {
      const response = await fetch(`${adminPanelBackendPath}/System/CheckCurrentFiscalYear`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });
      const data = await response.json();
      if (data.isActive) {
        if (data.message === "New fiscal year created and active.") {
          fetchFiscalYears();
        }
      } else {
        const errorMessages = {
          "Server error": "Server error"
        };
        setWarningMessage(errorMessages[data.message] || "Server error");
        setShowWarning(true);
      }
    } catch {
      setWarningMessage("Server error");
      setShowWarning(true);
    }
  }, [adminPanelBackendPath, fetchFiscalYears]);
  useEffect(() => {
    setCurrentPage(1);
    fetchFiscalYears();
    fetchCurrentFiscalYear();
    const oneDayInMs = 24 * 60 * 60 * 1000;
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const timeUntilMidnight = tomorrow.getTime() - now.getTime();
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setTimeout(() => {
      fetchCurrentFiscalYear();
      intervalRef.current = setInterval(fetchCurrentFiscalYear, oneDayInMs);
    }, timeUntilMidnight);
    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
        clearInterval(intervalRef.current);
      }
    };
  }, [pageSize, navigate, logoutUser, token, adminPanelBackendPath, fetchFiscalYears, fetchCurrentFiscalYear]);
  const filteredFiscalYears = fiscalYears;
  const totalRecords = filteredFiscalYears.length;
  const totalPages = Math.ceil(totalRecords / pageSize);
  const visibleFiscalYears = filteredFiscalYears.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const handleEditClick = _id => navigate(`/System/Setting/EditFiscalYear/${_id}`);
  const handleDeleteClick = fiscalYear => {
    setIsModalOpen(true);
    setSelectedFiscalYear(fiscalYear);
  };
  const DeleteFiscalYear = async fiscalYearId => {
    if (!CheckToken(token, logoutUser, navigate)) return;
    try {
      const response = await fetch(`${adminPanelBackendPath}/System/DeleteFiscalYear/${fiscalYearId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      const data = await response.json();
      if (HandleUnauthorized(data, logoutUser, navigate)) return;
      if (response.ok) {
        setFiscalYears(fiscalYears.filter(fy => fy._id !== fiscalYearId));
        setIsModalOpen(false);
        setSuccessMessage("Fiscal Year Deleted Successfully");
      } else {
        const errorMessages = {
          "Fiscal year not found": "Fiscal year not found",
          "Server error": "Server error"
        };
        setWarningMessage(errorMessages[data.message] || "Server error");
        setShowWarning(true);
      }
    } catch (error) {
      setWarningMessage("Server error");
      setShowWarning(true);
      console.log("Error deleting fiscal year:", error);
    } finally {
      setIsModalOpen(false);
    }
  };
  const statusTranslations = {
    'Active': "Active",
    'Pending': "Pending",
    'Expired': "Expired"
  };
  const canEdit = fiscalYear => fiscalYear.status !== "Active" && fiscalYear.status !== "Expired";
  const canDelete = fiscalYear => fiscalYear.status !== "Active" && fiscalYear.status !== "Expired";
  const showActionColumn = visibleFiscalYears.some(fy => canEdit(fy) || canDelete(fy));
  return <>
        {showWarning && <WarningModal message={warningMessage} onClose={() => setShowWarning(false)} />}
        <div className="tablediv">
            {loading ? <LoadingSpinner /> : <table className="fiscalyeartable">
                    <thead>
                        <tr>
                            <th>{"Fiscal Year"}</th>
                            <th>{"Start Date"}</th>
                            <th>{"End Date"}</th>
                            <th>{"Status"}</th>
                            {showActionColumn && <th>{"Action"}</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {visibleFiscalYears.length > 0 ? visibleFiscalYears.map(fiscalYear => <tr key={fiscalYear._id}>
                                    <td>{fiscalYear.fiscalyear}</td>
                                    <td>{fiscalYear.startdate}</td>
                                    <td>{fiscalYear.enddate}</td>
                                    <td className="fiscal-year-status-cell">
                                        <span className={fiscalYear.status === "Active" ? "status-tag-active" : fiscalYear.status === "Pending" ? "status-tag-pending" : fiscalYear.status === "Expired" ? "status-tag-expired" : ""}>
                                            {statusTranslations[fiscalYear.status]}
                                        </span>
                                    </td>
                                    {showActionColumn && <td>
                                            {canEdit(fiscalYear) && <EditButton onClick={() => handleEditClick(fiscalYear._id)} />}
                                            {canDelete(fiscalYear) && <DeleteButton onClick={() => handleDeleteClick(fiscalYear)} />}
                                        </td>}
                                </tr>) : <tr>
                                <td colSpan={showActionColumn ? 5 : 4}>{"No fiscal years found"}</td>
                            </tr>}
                    </tbody>
                </table>}
        </div>
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={page => setCurrentPage(page)} pageSizeOptions={[10, 15, 20, 50]} selectedPageSize={pageSize} onPageSizeChange={size => setPageSize(size)} totalRecords={totalRecords} />
        {isModalOpen && <DeleteModal open={isModalOpen} onClose={() => setIsModalOpen(false)} onDelete={() => DeleteFiscalYear(selectedFiscalYear._id)} name={`${selectedFiscalYear?.fiscalyear}`} message={"Fiscal Year"} headingname={"Delete Fiscal Year"} />}
        {successMessage && <AlertMessage message={successMessage} onClose={() => setSuccessMessage("")} />}
    </>;
};
export default GetFiscalYear;