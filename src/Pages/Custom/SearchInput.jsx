import "../../Scss/Pages/Custom/searchinput.scss";
const SearchInput = ({
  value,
  onChange,
  placeholder,
  className = ""
}) => {
  return <div className={`search-input-container ${className}`.trim()}>
            <input type="text" className="search-input" placeholder={placeholder || "Search..." || "Search..." || "Search" || "Search..."} value={value} onChange={onChange} />
        </div>;
};
export default SearchInput;