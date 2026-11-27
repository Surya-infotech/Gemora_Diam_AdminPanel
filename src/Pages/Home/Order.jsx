import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import "../../Scss/Home/Order/order.scss";
import AlertMessage from '../Custom/AlertMessage';
import WarningModal from '../Custom/WarningModal';
import GetOrder from '../../Components/Home/Order/GetOrder';
import SearchInput from '../Custom/SearchInput';
import ExportDropdown from '../../Components/Custom/ExportDropdown';
import { getOrderExportColumns } from '../../utils/orderExportHelper';
import { exportToCsv, exportToExcel } from '../../utils/exportUtils';

const Order = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [alertMessage, setAlertMessage] = useState(location.state?.message || "");
  const [warningMessage, setWarningMessage] = useState(location.state?.warning || "");
  const [searchValue, setSearchValue] = useState("");
  const [exportData, setExportData] = useState({ orders: [], miscSettings: null });

  useEffect(() => {
    document.title = "Order";
  }, []);

  useEffect(() => {
    if (location.state?.message || location.state?.warning) {
      navigate(location.pathname, {
        replace: true,
        state: {}
      });
    }
  }, [location, navigate]);

  const handleDataChange = useCallback((orders, miscSettings) => {
    setExportData({ orders, miscSettings });
  }, []);

  const handleExport = type => {
    if (!exportData.orders || exportData.orders.length === 0) {
      setWarningMessage("No orders available to export");
      return;
    }
    const columns = getOrderExportColumns(exportData.miscSettings);
    const dateStamp = new Date().toISOString().split("T")[0];
    if (type === "csv") {
      exportToCsv({
        columns,
        rows: exportData.orders,
        filename: `orders-${dateStamp}.csv`
      });
    } else {
      exportToExcel({
        columns,
        rows: exportData.orders,
        filename: `orders-${dateStamp}.xlsx`,
        sheetName: "Orders"
      });
    }
  };

  return (
    <div className="Order-container ">
      <div className="order-container">
        <h6 className="order-headingname">{"Order"}</h6>
        <div className="order-form-container">
          {alertMessage && <AlertMessage message={alertMessage} onClose={() => setAlertMessage("")} />}
          {warningMessage && <WarningModal message={warningMessage} onClose={() => setWarningMessage("")} />}
          <div className="order-header">
            <SearchInput placeholder={"Search..."} value={searchValue} onChange={e => setSearchValue(e.target.value)} />
            <div className="order-header-actions">
              <ExportDropdown
                onExportCsv={() => handleExport("csv")}
                onExportExcel={() => handleExport("excel")}
              />
            </div>
          </div>
          <GetOrder searchValue={searchValue} onDataChange={handleDataChange} />
        </div>
      </div>
    </div>
  );
};

export default Order;