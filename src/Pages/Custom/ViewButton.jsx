import React from 'react';
import { Visibility as ViewIcon } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
const ViewButton = React.forwardRef(({
  onClick,
  disabled = false,
  size = "small",
  title = "View Details",
  ...props
}, ref) => {
  return <Tooltip title={title} arrow>
            <span ref={ref} {...props}>
                <IconButton size={size} onClick={onClick} disabled={disabled} aria-label={title} className="view-icon">
                    <ViewIcon fontSize="small" />
                </IconButton>
            </span>
        </Tooltip>;
});
ViewButton.displayName = 'ViewButton';
export default ViewButton;