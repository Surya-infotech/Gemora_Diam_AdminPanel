import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../../Scss/System/Setting/fiscalyear.scss";
import GetFiscalYear from "./GetFiscalYear";
const FiscalYear = () => {
  const navigate = useNavigate();
  const handleAddNewClick = () => navigate(`/System/Setting/AddFiscalYear`);
  useEffect(() => {
    document.title = "Fiscal Year";
  }, []);
  return <div className="fiscal-year-container">
            <div className="add-new-button-section">
                <button type="button" className="add-new-btn" onClick={handleAddNewClick}>
                    {"Add New"}
                </button>
            </div>
            <GetFiscalYear />
        </div>;
};
export default FiscalYear;