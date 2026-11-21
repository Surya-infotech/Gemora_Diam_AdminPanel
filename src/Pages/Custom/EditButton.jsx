import React from 'react';
import { Edit as EditIcon } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
const EditButton = React.forwardRef(({
  onClick,
  disabled = false,
  size = "small",
  ...props
}, ref) => {
  return <Tooltip title={"Edit"} arrow>
            <span ref={ref} {...props}>
                <IconButton size={size} onClick={onClick} disabled={disabled} aria-label={"Edit"} className="edit-icon">
                    <EditIcon fontSize="small" />
                </IconButton>
            </span>
        </Tooltip>;
});
EditButton.displayName = 'EditButton';
export default EditButton;