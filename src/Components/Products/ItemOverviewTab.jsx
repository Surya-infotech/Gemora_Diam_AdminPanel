import moment from 'moment-timezone';
import Placeholder from '../../assets/placeholder.png';
import { useLanguage } from '../../Context/LanguageContext';

const ItemOverviewTab = ({ itemData }) => {
    const { translations } = useLanguage();

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

    return (
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
                <span className={`status-badge ${isPublished ? 'published' : 'draft'}`}>
                    {isPublished ? translations.published : translations.draft}
                </span>
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
    );
};

export default ItemOverviewTab;