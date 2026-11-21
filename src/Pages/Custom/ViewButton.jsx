import React from 'react';
import { Visibility as ViewIcon } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
const ViewButton = React.forwardRef(({
  onClick,
  disabled = false,
  size = "small",
  ...props
}, ref) => {
  return <Tooltip title={"View Details"} arrow>
            <span ref={ref} {...props}>
                <IconButton size={size} onClick={onClick} disabled={disabled} aria-label={"View Details"} className="view-icon">
                    <ViewIcon fontSize="small" />
                </IconButton>
            </span>
        </Tooltip>;
});
ViewButton.displayName = 'ViewButton';
export default ViewButton;