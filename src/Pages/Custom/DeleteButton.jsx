import React from 'react';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
const DeleteButton = React.forwardRef(({
  onClick,
  disabled = false,
  size = "small",
  ...props
}, ref) => {
  return <Tooltip title={"Delete"} arrow>
            <span ref={ref} {...props}>
                <IconButton size={size} onClick={onClick} disabled={disabled} aria-label={"Delete"} className="delete-icon">
                    <DeleteIcon fontSize="small" />
                </IconButton>
            </span>
        </Tooltip>;
});
DeleteButton.displayName = 'DeleteButton';
export default DeleteButton;