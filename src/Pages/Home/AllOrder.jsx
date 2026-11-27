import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import "../../Scss/Home/Order/allorder.scss";
import { usePermissions } from '../../Hooks/usePermissions';
import AlertMessage from '../Custom/AlertMessage';
import WarningModal from '../Custom/WarningModal';
import SearchInput from '../Custom/SearchInput';
import Dropdown from '../../Components/Dropdown/Dropdown';
import ExportDropdown from '../../Components/Custom/ExportDropdown';
import GetAllOrder from '../../Components/Home/AllOrder/GetAllOrder';
import { ALL_ORDER_EXPORT_COLUMNS, ALL_ORDER_STATUS_FILTER_OPTIONS } from '../../utils/allOrderHelpers';
import { exportToCsv, exportToExcel } from '../../utils/exportUtils';

const AllOrder = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { canAdd, canExport } = usePermissions();
  const [alertMessage, setAlertMessage] = useState(location.state?.message || "");
  const [warningMessage, setWarningMessage] = useState(location.state?.warning || "");
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [exportOrders, setExportOrders] = useState([]);

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

  const handleOrdersChange = useCallback(list => {
    setExportOrders(list);
  }, []);

  const handleAddNewClick = () => navigate('/Home/AddAllOrder');

  const handleExport = type => {
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
            <div className="search-filter-wrapper">
              <SearchInput
                placeholder={"Search..."}
                value={searchValue}
                onChange={e => setSearchValue(e.target.value)}
              />
              <div className="allorder-status-filter">
                <Dropdown
                  options={ALL_ORDER_STATUS_FILTER_OPTIONS}
                  labelKey="label"
                  valueKey="value"
                  selectedValue={statusFilter}
                  onValueChange={val => setStatusFilter(val)}
                  placeholder={"All Delivery Status"}
                  showSearch={false}
                />
              </div>
            </div>
            <div className="allorder-header-actions">
              {canAdd('allOrder') && (
                <button type="button" className="add-new-btn" onClick={handleAddNewClick}>
                  {"Add New"}
                </button>
              )}
              {canExport('allOrder') && (
                <ExportDropdown
                  onExportCsv={() => handleExport("csv")}
                  onExportExcel={() => handleExport("excel")}
                />
              )}
            </div>
          </div>
          <GetAllOrder searchValue={searchValue} statusFilter={statusFilter} onOrdersChange={handleOrdersChange} />
        </div>
      </div>
    </div>
  );
};

export default AllOrder;