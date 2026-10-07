import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '../../Context/LanguageContext';
import { useAuth } from '../../Middleware/Auth';
import LoadingSpinner from '../../Pages/Custom/LoadingSpinner';
import WarningModal from '../../Pages/Custom/WarningModal';
import CheckToken from '../../utils/CheckToken';
import HandleUnauthorized from '../../utils/HandleUnauthorized';
import "../../Scss/Products/itemoverview.scss";
import ItemOverviewTab from './ItemOverviewTab';
import ItemAttributesTab from './ItemAttributesTab';
import ItemPriceTab from './ItemPriceTab';

const ItemOverview = () => {
    const navigate = useNavigate();
    const { translations, isRtl } = useLanguage();
    const { logoutUser } = useAuth();
    const { id } = useParams();
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
                    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                });

                if (response.status === 404) {
                    response = await fetch(`${adminPanelBackendPath}/Products/EditItem/${id}`, {
                        method: "GET",
                        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                    });
                }

                const data = await response.json();
                if (HandleUnauthorized(data, logoutUser, navigate)) return;

                if (response.ok) {
                    setItemData(data);
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

        fetchItemDetails();
    }, [id, adminPanelBackendPath, token, logoutUser, navigate, translations]);

    const itemName = itemData?.itemname || '';

    useEffect(() => {
        if (translations.itemoverview) document.title = translations.itemoverview;
    }, [translations]);

    const handleBackClick = () => {
        navigate('/Products/Item');
    };

    const tabs = [
        {
            title: translations.overview,
            content: (
                <ItemOverviewTab
                    itemData={itemData}
                    onItemUpdated={(updated) => setItemData(prev => ({ ...prev, ...updated }))}
                />
            )
        },
        {
            title: translations.Attributes,
            content: <ItemAttributesTab itemData={itemData} />
        },
        {
            title: translations.pricetab,
            content: (
                <ItemPriceTab
                    itemData={itemData}
                    onItemUpdated={(updated) => setItemData(prev => ({ ...prev, ...updated }))}
                />
            )
        }
    ];

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <>
            {showWarning && <WarningModal message={warningMessage} onClose={() => setShowWarning(false)} />}
            <div className={`ItemOverview-container ${isRtl ? 'rtl-itemoverview' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
                <div className="itemoverview-container">
                    <div className="itemoverview-header">
                        <div className="itemoverview-header__titles">
                            <h6 className="itemoverview-headingname">
                                {itemName ? `${itemName} - ` : ''}{translations.itemoverview}
                            </h6>
                        </div>
                        <button
                            type="button"
                            className="itemoverview-back"
                            onClick={handleBackClick}
                        >
                            <ArrowBackIcon className="itemoverview-back-icon" aria-hidden />
                            {translations.back}
                        </button>
                    </div>

                    <div className="tabs-container">
                        <div className="horizontal-tabs" role="tablist" aria-label={translations.itemoverview}>
                            {tabs.map((tab, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    role="tab"
                                    aria-selected={activeTab === index}
                                    className={`tab-button ${activeTab === index ? 'active' : ''}`}
                                    onClick={() => setActiveTab(index)}
                                >
                                    {tab.title}
                                </button>
                            ))}
                        </div>
                        <div className="tab-content">
                            <div className="tab-content-body">{tabs[activeTab]?.content || tabs[0]?.content}</div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ItemOverview;
