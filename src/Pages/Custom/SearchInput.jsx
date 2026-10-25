import { useLanguage } from "../../Context/LanguageContext";
import "../../Scss/Pages/Custom/searchinput.scss";

const SearchInput = ({ value, onChange, placeholder, className = "" }) => {
    const { translations } = useLanguage();
    return (
        <div className={`search-input-container ${className}`.trim()}>
            <input
                type="text"
                className="search-input"
                placeholder={placeholder || translations?.searchPlaceholder || translations?.searchplaceholder || translations?.search || "Search..."}
                value={value}
                onChange={onChange}
            />
        </div>
    );
};

export default SearchInput;
