import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import InboxIcon from '@mui/icons-material/Inbox';
import BuildIcon from '@mui/icons-material/Build';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import "../../Scss/Home/Order/allorder.scss";
import { usePermissions } from '../../Hooks/usePermissions';
import AlertMessage from '../Custom/AlertMessage';
import WarningModal from '../Custom/WarningModal';
import SearchInput from '../Custom/SearchInput';
import Dropdown from '../../Components/Dropdown/Dropdown';
import ExportDropdown from '../../Components/Custom/ExportDropdown';
import GetAllOrder from '../../Components/Home/AllOrder/GetAllOrder';
import {
  ALL_ORDER_EXPORT_COLUMNS,
  ALL_ORDER_KPI_DEFS,
  ALL_ORDER_STATUS_FILTER_OPTIONS
} from '../../utils/allOrderHelpers';
import { exportToCsv, exportToExcel } from '../../utils/exportUtils';

const KPI_ICONS = {
  all: ReceiptLongIcon,
  order_received: InboxIcon,
  in_production: BuildIcon,
  ready_to_dispatch: Inventory2Icon,
  dispatched_delivered: LocalShippingIcon,
  tracking_pending: ScheduleIcon,
  on_hold: PauseCircleIcon,
  unassigned: PersonOffIcon
};

const AllOrder = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { canAdd, canExport } = usePermissions();
  const [alertMessage, setAlertMessage] = useState(location.state?.message || "");
  const [warningMessage, setWarningMessage] = useState(location.state?.warning || "");
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [kpiFilter, setKpiFilter] = useState("");
  const [allOrders, setAllOrders] = useState([]);
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

  const handleOrdersChange = useCallback((filteredList, rawList) => {
    setExportOrders(filteredList);
    if (Array.isArray(rawList)) {
      setAllOrders(rawList);
    }
  }, []);

  const kpiCards = useMemo(() => (
    ALL_ORDER_KPI_DEFS.map(def => ({
      ...def,
      count: allOrders.filter(def.matches).length,
      Icon: KPI_ICONS[def.key] || ReceiptLongIcon
    }))
  ), [allOrders]);

  const handleKpiClick = card => {
    if (card.key === 'all' || kpiFilter === card.key) {
      setKpiFilter("");
      setStatusFilter("");
      return;
    }
    setKpiFilter(card.key);
    setStatusFilter(card.singleStatus || "");
  };

  const handleStatusDropdownChange = val => {
    setStatusFilter(val);
    setKpiFilter("");
  };

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

          <div className="allorder-kpi-grid">
            {kpiCards.map(card => {
              const IconComp = card.Icon;
              const isActive = card.key === 'all' ? !kpiFilter && !statusFilter : kpiFilter === card.key;
              return (
                <div
                  key={card.key}
                  className={`kpi-card ${isActive ? 'active' : ''}`}
                  onClick={() => handleKpiClick(card)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleKpiClick(card);
                    }
                  }}
                >
                  <div className="kpi-info">
                    <span className="kpi-title">{card.title}</span>
                    <span className="kpi-value">{card.count}</span>
                  </div>
                  <div className="kpi-icon-box">
                    <IconComp />
                  </div>
                </div>
              );
            })}
          </div>

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
                  onValueChange={handleStatusDropdownChange}
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
          <GetAllOrder
            searchValue={searchValue}
            statusFilter={statusFilter}
            kpiFilter={kpiFilter}
            onOrdersChange={handleOrdersChange}
          />
        </div>
      </div>
    </div>
  );
};

export default AllOrder;