import DiamondIcon from '@mui/icons-material/Diamond';
import CategoryIcon from '@mui/icons-material/Category';
import PaletteIcon from '@mui/icons-material/Palette';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import StyleIcon from '@mui/icons-material/Style';
import TollIcon from '@mui/icons-material/Toll';
import StraightenIcon from '@mui/icons-material/Straighten';
import TuneIcon from '@mui/icons-material/Tune';
import { isEarringsCategoryName, isRingCategoryName, normalizeClosureTypes } from '../../utils/itemCategoryHelpers';
const ItemAttributesTab = ({
  itemData
}) => {
  if (!itemData) {
    return <div className="no-data-message">
      <p>{"No data found"}</p>
    </div>;
  }
  const isRingCategory = isRingCategoryName(itemData.categoryname);
  const isEarringsCategory = isEarringsCategoryName(itemData.categoryname);
  const closureTypes = normalizeClosureTypes(itemData.closuretypes ?? itemData.closureTypes ?? itemData.closuretype ?? itemData.closureType).map(c => c.label);
  const attributeSections = [{
    key: 'shapes',
    label: "Shape",
    icon: <DiamondIcon className="section-icon" />,
    items: (itemData.shapes || []).map(s => s.shapename).filter(Boolean)
  }, {
    key: 'clarities',
    label: "Clarity",
    icon: <AutoAwesomeIcon className="section-icon" />,
    items: (itemData.clarities || []).map(c => c.clarityname).filter(Boolean)
  }, {
    key: 'diamondcolors',
    label: "Diamond Color",
    icon: <PaletteIcon className="section-icon" />,
    items: (itemData.diamondcolors || []).map(c => c.colorname).filter(Boolean)
  }, {
    key: 'bandcolors',
    label: "Metal Color",
    icon: <PaletteIcon className="section-icon" />,
    items: (itemData.bandcolors || []).map(c => c.colorname).filter(Boolean)
  }, {
    key: 'stones',
    label: "Stone",
    icon: <TollIcon className="section-icon" />,
    items: (itemData.stones || []).map(s => s.stonename).filter(Boolean)
  }, {
    key: 'styles',
    label: "Style",
    icon: <StyleIcon className="section-icon" />,
    items: (itemData.styles || []).map(st => st.stylename).filter(Boolean)
  }, ...(isRingCategory ? [{
    key: 'ringsizes',
    label: "Ring Size",
    icon: <StraightenIcon className="section-icon" />,
    items: (itemData.ringsizes || []).map(r => r.ringsize).filter(Boolean)
  }] : []), ...(isEarringsCategory ? [{
    key: 'closuretypes',
    label: "Closure Type",
    icon: <TuneIcon className="section-icon" />,
    items: closureTypes
  }] : [])];
  return <div className="item-attributes-tab-content">
    <div className="attributes-header-banner">
      <div className="banner-left">
        <div className="banner-icon-wrapper">
          <CategoryIcon className="banner-icon" />
        </div>
        <div className="banner-info">
          <div className="banner-title-row">
            <h5 className="banner-title">{"Attributes"}</h5>
            <span className="attributes-count-chip">
              {attributeSections.filter(s => s.items.length > 0).length} / {attributeSections.length} {"Configured"}
            </span>
          </div>
          <p className="banner-subtitle">
            {"Product specifications, diamond properties, and design variants"}
          </p>
        </div>
      </div>
    </div>

    <div className="attributes-spec-grid">
      {attributeSections.map(section => {
        const hasItems = section.items && section.items.length > 0;
        return <div key={section.key} className="attribute-spec-card">
          <div className="spec-card-header">
            <div className="spec-label-row">
              {section.icon}
              <span className="spec-label">{section.label}</span>
            </div>
            {hasItems && <span className="spec-badge-count">
              {section.items.length}
            </span>}
          </div>
          <div className="spec-card-body">
            {hasItems ? <div className="spec-chips-container">
              {section.items.map((val, idx) => <span key={idx} className="spec-chip">
                {val}
              </span>)}
            </div> : <span className="empty-spec-placeholder">-</span>}
          </div>
        </div>;
      })}
    </div>
  </div>;
};
export default ItemAttributesTab;