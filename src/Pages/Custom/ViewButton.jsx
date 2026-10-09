import React from 'react';
import { Visibility as ViewIcon } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import { useLanguage } from '../../Context/LanguageContext';

const ViewButton = React.forwardRef(({ onClick, disabled = false, size = "small", ...props }, ref) => {
    const { translations } = useLanguage();

    return (
        <Tooltip title={translations.viewdetails || translations.View} arrow>
            <span ref={ref} {...props}>
                <IconButton
                    size={size}
                    onClick={onClick}
                    disabled={disabled}
                    aria-label={translations.viewdetails || translations.View}
                    className="view-icon"
                >
                    <ViewIcon fontSize="small" />
                </IconButton>
            </span>
        </Tooltip>
    );
});

ViewButton.displayName = 'ViewButton';

export default ViewButton;