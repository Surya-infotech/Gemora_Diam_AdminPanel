import "../../Scss/Custom/pagination.scss";
import { useLanguage } from "../../Context/LanguageContext";

const Pagination = ({
    currentPage = 1,
    totalPages = 1,
    onPageChange = () => {},
    pageSizeOptions = [10, 15, 20, 50],
    selectedPageSize = 10,
    onPageSizeChange = () => {},
    totalRecords = 0
}) => {
    const { translations, isRtl } = useLanguage();
    const maxPagesToShow = 3;
    let startPage, endPage;

    if (totalPages <= maxPagesToShow) {
        startPage = 1;
        endPage = totalPages;
    } else {
        if (currentPage === 1) {
            startPage = 1;
            endPage = maxPagesToShow;
        } else if (currentPage === totalPages) {
            startPage = totalPages - (maxPagesToShow - 1);
            endPage = totalPages;
        } else {
            startPage = currentPage - 1;
            endPage = currentPage + 1;
        }
    }

    const pageNumbers = [];
    for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
    }

    const startRecord = totalRecords === 0 ? 0 : (currentPage - 1) * selectedPageSize + 1;
    const endRecord = totalRecords === 0 ? 0 : Math.min(currentPage * selectedPageSize, totalRecords);

    return (
        <div className={`d-flex justify-content-between align-items-center paginationdiv ${isRtl ? 'rtl-pagination' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="page-size-dropdown">
                <select
                    id="pageSize"
                    className="form-select"
                    value={selectedPageSize}
                    onChange={(e) => onPageSizeChange(Number(e.target.value))}
                >
                    {(pageSizeOptions || [10, 15, 20, 50]).map((size) => (
                        <option key={size} value={size}>
                            {size}
                        </option>
                    ))}
                </select>
            </div>

            <div className="records-info">
                {translations.showing} {startRecord} {translations.to} {endRecord} {translations.of} {totalRecords} {translations.entries}
            </div>

            <nav aria-label={translations.pagenavigation}>
                <ul className="pagination justify-content-end">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button
                            className="page-link"
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            {translations.previous}
                        </button>
                    </li>
                    {pageNumbers.map((number) => (
                        <li
                            key={number}
                            className={`page-item ${currentPage === number ? 'active' : ''}`}
                        >
                            <button
                                className="page-link"
                                onClick={() => onPageChange(number)}
                            >
                                {number}
                            </button>
                        </li>
                    ))}
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button
                            className="page-link"
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            {translations.next}
                        </button>
                    </li>
                </ul>
            </nav>
        </div>
    );
};

export default Pagination;
