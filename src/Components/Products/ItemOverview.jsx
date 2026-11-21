import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../Middleware/Auth';
import LoadingSpinner from '../../Pages/Custom/LoadingSpinner';
import WarningModal from '../../Pages/Custom/WarningModal';
import CheckToken from '../../utils/CheckToken';
import HandleUnauthorized from '../../utils/HandleUnauthorized';
import "../../Scss/Products/itemoverview.scss";
import ItemOverviewTab from './ItemOverviewTab';
import ItemAttributesTab from './ItemAttributesTab';
import ItemGalleryTab from './ItemGalleryTab';
import ItemPriceTab from './ItemPriceTab';
import ItemSeoMarketingTab from './ItemSeoMarketingTab';
const ItemOverview = () => {
  const navigate = useNavigate();
  const {
    logoutUser
  } = useAuth();
  const {
    id
  } = useParams();
  const adminPanelBackendPath = import.meta.env.VITE_BACKEND_URL;
  const tokenname = import.meta.env.VITE_AdminTOKEN_NAME;
  const token = localStorage.getItem(tokenname);
  const [activeTab, setActiveTab] = useState(0);
  const [itemData, setItemData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [warningMessage, setWarningMessage] = useState("");
  const [showWarning, setShowWarning] = useState(false);
  useEffect(() => {
    if (!id || !CheckToken(token, logoutUser, navigate)) return;
    const fetchItemDetails = async () => {
      setLoading(true);
      try {
        let response = await fetch(`${adminPanelBackendPath}/Products/GetItemDetails/${id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        if (response.status === 404) {
          response = await fetch(`${adminPanelBackendPath}/Products/EditItem/${id}`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          });
        }
        const data = await response.json();
        if (HandleUnauthorized(data, logoutUser, navigate)) return;
        if (response.ok) {
          setItemData(data);
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
    fetchItemDetails();
  }, [id, adminPanelBackendPath, token, logoutUser, navigate]);
  const itemName = itemData?.itemname || '';
  useEffect(() => {
    document.title = "Item Overview";
  }, []);
  const handleBackClick = () => {
    navigate('/Products/Item');
  };
  const handleItemUpdated = useCallback(updated => {
    setItemData(prev => ({
      ...prev,
      ...updated
    }));
  }, []);
  const tabs = [{
    title: "Overview"
  }, {
    title: "Attributes"
  }, {
    title: "Gallery"
  }, {
    title: "Price"
  }, {
    title: "SEO Marketing Content"
  }];
  if (loading) {
    return <LoadingSpinner />;
  }
  return <>
            {showWarning && <WarningModal message={warningMessage} onClose={() => setShowWarning(false)} />}
            <div className="ItemOverview-container ">
                <div className="itemoverview-container">
                    <div className="itemoverview-header">
                        <div className="itemoverview-header__titles">
                            <h6 className="itemoverview-headingname" title={itemName ? `${itemName} - ${"Item Overview"}` : "Item Overview"}>
                                {itemName && <>
                                        <span className="heading-item-name">{itemName}</span>
                                        <span className="heading-separator"> - </span>
                                    </>}
                                <span className="heading-page-suffix">{"Item Overview"}</span>
                            </h6>
                        </div>
                        <button type="button" className="itemoverview-back" onClick={handleBackClick}>
                            <ArrowBackIcon className="itemoverview-back-icon" aria-hidden />
                            {"Back"}
                        </button>
                    </div>

                    <div className="tabs-container">
                        <div className="horizontal-tabs" role="tablist" aria-label={"Item Overview"}>
                            {tabs.map((tab, index) => <button key={index} type="button" role="tab" aria-selected={activeTab === index} className={`tab-button ${activeTab === index ? 'active' : ''}`} onClick={() => setActiveTab(index)}>
                                    {tab.title}
                                </button>)}
                        </div>
                        <div className="tab-content">
                            <div className="tab-content-body">
                                {activeTab === 0 && <ItemOverviewTab itemData={itemData} onItemUpdated={handleItemUpdated} />}
                                {activeTab === 1 && <ItemAttributesTab itemData={itemData} />}
                                {activeTab === 2 && <ItemGalleryTab itemData={itemData} onItemUpdated={handleItemUpdated} />}
                                {activeTab === 3 && <ItemPriceTab itemData={itemData} onItemUpdated={handleItemUpdated} />}
                                {activeTab === 4 && <ItemSeoMarketingTab itemData={itemData} onItemUpdated={handleItemUpdated} />}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>;
};
export default ItemOverview;