import FileDownloadIcon from '@mui/icons-material/FileDownload';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import DescriptionIcon from '@mui/icons-material/Description';
import TableChartIcon from '@mui/icons-material/TableChart';
import { useEffect, useRef, useState } from 'react';
import '../../Scss/Custom/General/exportdropdown.scss';

/**
 * Reusable Export button with CSV and Excel (.xlsx) dropdown menu.
 */
const ExportDropdown = ({ onExportCsv, onExportExcel }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="export-dropdown-wrapper" ref={dropdownRef}>
      <button
        type="button"
        className="export-btn"
        onClick={() => setIsOpen(prev => !prev)}
        aria-expanded={isOpen}
      >
        <FileDownloadIcon fontSize="small" />
        <span>{"Export"}</span>
        <KeyboardArrowDownIcon fontSize="small" />
      </button>
      {isOpen && (
        <div className="export-dropdown-menu">
          <button
            type="button"
            className="export-menu-item"
            onClick={() => {
              setIsOpen(false);
              onExportCsv?.();
            }}
          >
            <DescriptionIcon fontSize="small" />
            <span>{"Export as CSV"}</span>
          </button>
          <button
            type="button"
            className="export-menu-item"
            onClick={() => {
              setIsOpen(false);
              onExportExcel?.();
            }}
          >
            <TableChartIcon fontSize="small" />
            <span>{"Export as Excel"}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ExportDropdown;