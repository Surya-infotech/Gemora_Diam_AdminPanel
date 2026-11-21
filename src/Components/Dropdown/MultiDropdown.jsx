import CloseIcon from "@mui/icons-material/Close";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { useEffect, useRef, useState } from "react";
import "../../Scss/Custom/General/multidropdown.scss";
const MultiDropdown = ({
  selectedValue = [],
  onValueChange,
  label,
  options,
  labelKey,
  valueKey,
  placeholder
}) => {
  const [selected, setSelected] = useState(selectedValue || []);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);
  const handleDropdownToggle = () => setIsDropdownOpen(prev => !prev);
  const handleSelect = item => {
    const isSelected = selected.some(val => val[valueKey] === item[valueKey]);
    const newSelection = isSelected ? selected.filter(val => val[valueKey] !== item[valueKey]) : [...selected, item];
    setSelected(newSelection);
    onValueChange(newSelection);
  };
  const handleRemoveSelected = item => {
    const newSelection = selected.filter(val => val[valueKey] !== item[valueKey]);
    setSelected(newSelection);
    onValueChange(newSelection);
  };
  useEffect(() => {
    if (JSON.stringify(selected) !== JSON.stringify(selectedValue)) {
      setSelected(selectedValue);
    }
  }, [selectedValue]);
  useEffect(() => {
    if (!isDropdownOpen) {
      setSearchTerm("");
    }
  }, [isDropdownOpen]);
  const filteredOptions = (options || []).filter(item => {
    const val = item[labelKey];
    return val ? String(val).toLowerCase().includes(searchTerm.toLowerCase()) : false;
  });
  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);
  return <div>
            {label && <label>{label}</label>}
            <div className="dropdown " ref={dropdownRef}>
                <button className="btn dropdown-toggle dropdownbtn" type="button" onClick={handleDropdownToggle} aria-expanded={isDropdownOpen ? "true" : "false"}>
                    <div className="selected-values">
                        {selected.length > 0 ? selected.map(item => <span key={item[valueKey]} className="selected-item">
                                    {item[labelKey]}
                                    <CloseIcon className="close-icon" onClick={e => {
              e.stopPropagation();
              handleRemoveSelected(item);
            }} />
                                </span>) : <span className="placeholder-text">{placeholder}</span>}
                    </div>
                    {isDropdownOpen ? <KeyboardArrowUpIcon className="dropdown-icon" /> : <KeyboardArrowDownIcon className="dropdown-icon" />}
                </button>

                {isDropdownOpen && <ul className="dropdown-menu dropdownul ">
                        <li className="dropdown-search-item">
                            <input type="text" className="dropdown-search-input" placeholder={"Search..."} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} autoFocus onClick={e => e.stopPropagation()} autoComplete="off" />
                        </li>
                        {filteredOptions.length > 0 ? filteredOptions.map(item => <li key={item[valueKey]} onClick={() => handleSelect(item)}>
                                    <a className={`dropdown-item ${selected.some(val => val[valueKey] === item[valueKey]) ? "selected" : ""}`}>
                                        {item[labelKey]}
                                    </a>
                                </li>) : <li className="dropdown-no-record">{"No record found"}</li>}
                    </ul>}
            </div>
        </div>;
};
export default MultiDropdown;