import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { useEffect, useRef, useState } from "react";
import "../../Scss/Custom/General/dropdown.scss";
const Dropdown = ({
  selectedValue,
  onValueChange,
  label,
  options,
  labelKey,
  valueKey,
  placeholder,
  disabled = false,
  showSearch = true
}) => {
  const [selected, setSelected] = useState(selectedValue || null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);
  const handleDropdownToggle = () => {
    if (!disabled) {
      setIsDropdownOpen(prev => !prev);
    }
  };
  const handleSelect = item => {
    setSelected(item[valueKey]);
    onValueChange(item[valueKey]);
    setIsDropdownOpen(false);
  };
  useEffect(() => {
    setSelected(selectedValue);
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
  return <>
        <div>
            {label && <label>{label}</label>}
            <div className="dropdown " ref={dropdownRef}>
                <button className="btn dropdown-toggle dropdownbtn" type="button" onClick={handleDropdownToggle} aria-expanded={isDropdownOpen ? "true" : "false"} disabled={disabled}>
                    {selected != null ? options.find(item => item[valueKey] === selected || String(item[valueKey]) === String(selected))?.[labelKey] || placeholder : placeholder}
                    {isDropdownOpen ? <KeyboardArrowUpIcon className="dropdown-icon" /> : <KeyboardArrowDownIcon className="dropdown-icon" />}
                </button>
                {isDropdownOpen && <ul className="dropdown-menu dropdownul " aria-labelledby="dropdownMenuButton">
                        {showSearch && <li className="dropdown-search-item">
                                <input type="text" className="dropdown-search-input" placeholder={"Search..."} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} autoFocus onClick={e => e.stopPropagation()} autoComplete="off" />
                            </li>}
                        {filteredOptions.length > 0 ? filteredOptions.map((item, index) => <li key={index}>
                                <a className={`dropdown-item ${selected === item[valueKey] || selected != null && String(selected) === String(item[valueKey]) ? 'selected' : ''}`} title={item[labelKey]} onClick={() => handleSelect(item)}>
                                    {item[labelKey]}
                                </a>
                            </li>) : <li className="dropdown-no-record">{"No record found"}</li>}
                    </ul>}
            </div>
        </div>
    </>;
};
export default Dropdown;