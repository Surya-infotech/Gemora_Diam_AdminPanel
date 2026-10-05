import React, { useState } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { IosShare as ExportIcon } from '@mui/icons-material';
import { useLanguage } from '../../Context/LanguageContext';
import Dropdown from '../../Components/Dropdown/Dropdown';

const ExportButton = React.forwardRef(({ onExport, disabled = false }, ref) => {
    const { translations } = useLanguage();
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [exportFormat, setExportFormat] = useState("pdf");

    const handleExportClick = async () => {
        if (onExport) {
            await onExport(exportFormat);
        }
        setIsExportModalOpen(false);
    };

    return (
        <span ref={ref} className="export-button-wrapper">
            <Tooltip title={translations.export} arrow>
                <span>
                    <IconButton
                        className="export-icon-btn"
                        onClick={() => setIsExportModalOpen(true)}
                        disabled={disabled}
                    >
                        <ExportIcon />
                    </IconButton>
                </span>
            </Tooltip>

            {isExportModalOpen && (
                <div className="export-modal-overlay">
                    <div className="export-modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>{translations.export}</h3>
                        <div className="form-group">
                            <Dropdown
                                label={translations.exportFormat}
                                options={[{ label: "PDF", value: "pdf" }]}
                                selectedValue={exportFormat}
                                onValueChange={setExportFormat}
                                labelKey="label"
                                valueKey="value"
                                placeholder={translations.selectFormat}
                                showSearch={false}
                            />
                        </div>
                        <div className="export-modal-actions">
                            <button
                                type="button"
                                className="btn-cancel"
                                onClick={() => setIsExportModalOpen(false)}
                            >
                                {translations.cancel}
                            </button>
                            <button
                                type="button"
                                className="btn-submit"
                                onClick={handleExportClick}
                                disabled={disabled}
                            >
                                {disabled ? translations.loading : translations.export}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </span>
    );
});

ExportButton.displayName = 'ExportButton';

export default ExportButton;
