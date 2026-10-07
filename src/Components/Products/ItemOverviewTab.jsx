import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import moment from 'moment-timezone';
import Placeholder from '../../assets/placeholder.png';
import { useLanguage } from '../../Context/LanguageContext';
import { useAuth } from '../../Middleware/Auth';
import CheckToken from '../../utils/CheckToken';
import HandleUnauthorized from '../../utils/HandleUnauthorized';
import AlertMessage from '../../Pages/Custom/AlertMessage';

const ItemOverviewTab = ({ itemData, onItemUpdated }) => {
    const navigate = useNavigate();
    const { translations } = useLanguage();
    const { logoutUser } = useAuth();
    const adminPanelBackendPath = import.meta.env.VITE_BACKEND_URL;
    const tokenname = import.meta.env.VITE_AdminTOKEN_NAME;
    const token = localStorage.getItem(tokenname);

    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState('success');

    const formatDateTime = (dateString) => {
        if (!dateString) return '-';
        const misc = itemData?.miscSettings;
        const timeZone = misc?.timeZone;
        const dateFormat = misc?.dateFormat;
        const timeFormat = misc?.timeFormat;
        try {
            const m = moment.tz(dateString, timeZone);
            if (m.isValid()) {
                return m.format(`${dateFormat} ${timeFormat}`);
            }
            return String(dateString);
        } catch {
            return String(dateString);
        }
    };

    if (!itemData) {
        return (
            <div className="no-data-message">
                <p>{translations.nodatafound}</p>
            </div>
        );
    }

    const itemName = itemData.itemname || '-';
    const status = itemData.status || 'Draft';
    const isPublished = status === 'Published';

    const handleToggleStatus = async () => {
        if (!CheckToken(token, logoutUser, navigate)) return;
        const itemId = itemData?.itemid || itemData?._id;
        if (!itemId) return;

        const newStatus = isPublished ? 'Draft' : 'Published';
        setIsUpdatingStatus(true);
        setAlertMessage('');

        try {
            const response = await fetch(`${adminPanelBackendPath}/Products/UpdateItemStatus/${itemId}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });

            const data = await response.json();
            if (HandleUnauthorized(data, logoutUser, navigate)) return;

            if (response.ok) {
                if (onItemUpdated && data.item) {
                    onItemUpdated(data.item);
                }
                setAlertMessage(data.message || translations.statusupdatedsuccessfully || 'Item status updated successfully');
                setAlertType('success');
            } else {
                setAlertMessage(data.message || translations.servererror || 'Server error');
                setAlertType('error');
            }
        } catch (err) {
            console.error('Update item status error:', err);
            setAlertMessage(translations.servererror || 'Server error');
            setAlertType('error');
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    return (
        <div className="itemoverview-tab-wrapper">
            {alertMessage && (
                <div className="overview-tab-alert">
                    <AlertMessage
                        message={alertMessage}
                        type={alertType}
                        onClose={() => setAlertMessage('')}
                    />
                </div>
            )}

            <div className="itemoverview-card">
                <div className="item-header-section">
                    <div className="item-image-container">
                        <img
                            src={itemData.image || Placeholder}
                            alt={itemName}
                            className="item-overview-image"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = Placeholder;
                            }}
                        />
                    </div>
                    <div className="item-title-section">
                        <h4 className="item-name-title">{itemName}</h4>
                        {itemData.sku && (
                            <p className="item-sku-title">{itemData.sku}</p>
                        )}
                        <div className="item-meta-tags">
                            {itemData.categoryname && (
                                <span className="meta-pill category-pill">
                                    {itemData.categoryname}
                                </span>
                            )}
                            {itemData.subcategoryname && (
                                <span className="meta-pill subcategory-pill">
                                    {itemData.subcategoryname}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="item-header-actions">
                        <span className={`status-badge ${isPublished ? 'published' : 'draft'}`}>
                            {isPublished ? translations.published : translations.draft}
                        </span>
                        <button
                            type="button"
                            className={`publish-status-btn ${isPublished ? 'is-published' : 'is-draft'}`}
                            onClick={handleToggleStatus}
                            disabled={isUpdatingStatus}
                            title={isPublished ? (translations.markasdraft || 'Mark As Draft') : (translations.markaspublish || 'Mark As Publish')}
                        >
                            {isUpdatingStatus ? (
                                <span>{translations.saving || 'Updating...'}</span>
                            ) : isPublished ? (
                                <span>{translations.markasdraft || 'Mark As Draft'}</span>
                            ) : (
                                <span>{translations.markaspublish || 'Mark As Publish'}</span>
                            )}
                        </button>
                    </div>
                </div>

                <div className="item-details-section">
                    <div className="details-grid">
                        <div className="detail-item">
                            <span className="detail-label">{translations.Item} ID</span>
                            <span className="detail-value">{itemData.itemid || itemData._id || '-'}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">{translations.createdat}</span>
                            <span className="detail-value">{formatDateTime(itemData.createdAt)}</span>
                        </div>
                        {itemData.updatedAt && (
                            <div className="detail-item">
                                <span className="detail-label">{translations.updatedat}</span>
                                <span className="detail-value">{formatDateTime(itemData.updatedAt)}</span>
                            </div>
                        )}
                    </div>

                    {itemData.description && itemData.description.trim() && (
                        <div className="item-description-block">
                            <h6 className="description-heading">{translations.description}</h6>
                            <div
                                className="description-content"
                                dangerouslySetInnerHTML={{ __html: itemData.description }}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ItemOverviewTab;