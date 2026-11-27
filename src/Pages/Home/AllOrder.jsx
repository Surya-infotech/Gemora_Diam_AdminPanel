import FileDownloadIcon from '@mui/icons-material/FileDownload';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import DescriptionIcon from '@mui/icons-material/Description';
import TableChartIcon from '@mui/icons-material/TableChart';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import "../../Scss/Home/Order/allorder.scss";
import { usePermissions } from '../../Hooks/usePermissions';
import AlertMessage from '../Custom/AlertMessage';
import WarningModal from '../Custom/WarningModal';
import SearchInput from '../Custom/SearchInput';
import GetAllOrder from '../../Components/Home/AllOrder/GetAllOrder';
import { ALL_ORDER_EXPORT_COLUMNS } from '../../utils/allOrderHelpers';
import { exportToCsv, exportToExcel } from '../../utils/exportUtils';

const AllOrder = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { canAdd } = usePermissions();
  const [alertMessage, setAlertMessage] = useState(location.state?.message || "");
  const [warningMessage, setWarningMessage] = useState(location.state?.warning || "");
  const [searchValue, setSearchValue] = useState("");
  const [exportOrders, setExportOrders] = useState([]);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const exportDropdownRef = useRef(null);

  useEffect(() => {
    document.title = "All Order";
  }, []);

  useEffect(() => {
    if (location.state?.message || location.state?.warning) {
      navigate(location.pathname, {
        replace: true,
        state: {}
      });
    }
  }, [location, navigate]);

  useEffect(() => {
    const handleClickOutside = event => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target)) {
        setIsExportOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleOrdersChange = useCallback(list => {
    setExportOrders(list);
  }, []);

  const handleAddNewClick = () => navigate('/Home/AddAllOrder');

  const handleExport = type => {
    setIsExportOpen(false);
    if (!exportOrders || exportOrders.length === 0) {
      setWarningMessage("No orders available to export");
      return;
    }
    const dateStamp = new Date().toISOString().split("T")[0];
    if (type === "csv") {
      exportToCsv({
        columns: ALL_ORDER_EXPORT_COLUMNS,
        rows: exportOrders,
        filename: `all-orders-${dateStamp}.csv`
      });
    } else {
      exportToExcel({
        columns: ALL_ORDER_EXPORT_COLUMNS,
        rows: exportOrders,
        filename: `all-orders-${dateStamp}.xlsx`,
        sheetName: "All Orders"
      });
    }
  };

  return (
    <div className="AllOrder-container">
      <div className="allorder-container">
        <h6 className="allorder-headingname">{"All Order"}</h6>
        <div className="allorder-form-container">
          {alertMessage && <AlertMessage message={alertMessage} onClose={() => setAlertMessage("")} />}
          {warningMessage && <WarningModal message={warningMessage} onClose={() => setWarningMessage("")} />}
          <div className="allorder-header">
            <SearchInput
              placeholder={"Search..."}
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
            />
            <div className="allorder-header-actions">
              {canAdd('allOrder') && (
                <button type="button" className="add-new-btn" onClick={handleAddNewClick}>
                  {"Add New"}
                </button>
              )}
              <div className="export-dropdown-wrapper" ref={exportDropdownRef}>
                <button
                  type="button"
                  className="export-btn"
                  onClick={() => setIsExportOpen(prev => !prev)}
                  aria-expanded={isExportOpen}
                >
                  <FileDownloadIcon fontSize="small" />
                  <span>{"Export"}</span>
                  <KeyboardArrowDownIcon fontSize="small" />
                </button>
                {isExportOpen && (
                  <div className="export-dropdown-menu">
                    <button type="button" className="export-menu-item" onClick={() => handleExport("csv")}>
                      <DescriptionIcon fontSize="small" />
                      <span>{"Export as CSV"}</span>
                    </button>
                    <button type="button" className="export-menu-item" onClick={() => handleExport("excel")}>
                      <TableChartIcon fontSize="small" />
                      <span>{"Export as Excel"}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <GetAllOrder searchValue={searchValue} onOrdersChange={handleOrdersChange} />
        </div>
      </div>
    </div>
  );
};

export default AllOrder;