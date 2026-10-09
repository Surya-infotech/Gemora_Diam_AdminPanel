import DiamondIcon from '@mui/icons-material/Diamond';
import CategoryIcon from '@mui/icons-material/Category';
import PaletteIcon from '@mui/icons-material/Palette';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import StyleIcon from '@mui/icons-material/Style';
import TollIcon from '@mui/icons-material/Toll';
import { useLanguage } from '../../Context/LanguageContext';

const ItemAttributesTab = ({ itemData }) => {
    const { translations } = useLanguage();

    if (!itemData) {
        return (
            <div className="no-data-message">
                <p>{translations.nodatafound}</p>
            </div>
        );
    }

    const attributeSections = [
        {
            key: 'shapes',
            label: translations.shape,
            icon: <DiamondIcon className="section-icon" />,
            items: (itemData.shapes || []).map(s => s.shapename).filter(Boolean)
        },
        {
            key: 'clarities',
            label: translations.clarity,
            icon: <AutoAwesomeIcon className="section-icon" />,
            items: (itemData.clarities || []).map(c => c.clarityname).filter(Boolean)
        },
        {
            key: 'diamondcolors',
            label: translations.diamondcolor,
            icon: <PaletteIcon className="section-icon" />,
            items: (itemData.diamondcolors || []).map(c => c.colorname).filter(Boolean)
        },
        {
            key: 'bandcolors',
            label: translations.bandcolor,
            icon: <PaletteIcon className="section-icon" />,
            items: (itemData.bandcolors || []).map(c => c.colorname).filter(Boolean)
        },
        {
            key: 'stones',
            label: translations.stone,
            icon: <TollIcon className="section-icon" />,
            items: (itemData.stones || []).map(s => s.stonename).filter(Boolean)
        },
        {
            key: 'styles',
            label: translations.style,
            icon: <StyleIcon className="section-icon" />,
            items: (itemData.styles || []).map(st => st.stylename).filter(Boolean)
        }
    ];

    return (
        <div className="item-attributes-tab-content">
            <div className="attributes-header-banner">
                <div className="banner-left">
                    <div className="banner-icon-wrapper">
                        <CategoryIcon className="banner-icon" />
                    </div>
                    <div className="banner-info">
                        <div className="banner-title-row">
                            <h5 className="banner-title">{translations.Attributes}</h5>
                            <span className="attributes-count-chip">
                                {attributeSections.filter(s => s.items.length > 0).length} / {attributeSections.length} {translations.configured}
                            </span>
                        </div>
                        <p className="banner-subtitle">
                            {translations.attributessubtitle}
                        </p>
                    </div>
                </div>
            </div>

            <div className="attributes-spec-grid">
                {attributeSections.map(section => {
                    const hasItems = section.items && section.items.length > 0;
                    return (
                        <div key={section.key} className="attribute-spec-card">
                            <div className="spec-card-header">
                                <div className="spec-label-row">
                                    {section.icon}
                                    <span className="spec-label">{section.label}</span>
                                </div>
                                {hasItems && (
                                    <span className="spec-badge-count">
                                        {section.items.length}
                                    </span>
                                )}
                            </div>
                            <div className="spec-card-body">
                                {hasItems ? (
                                    <div className="spec-chips-container">
                                        {section.items.map((val, idx) => (
                                            <span key={idx} className="spec-chip">
                                                {val}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <span className="empty-spec-placeholder">-</span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ItemAttributesTab;
