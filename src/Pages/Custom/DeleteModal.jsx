import CircularProgress from '@mui/material/CircularProgress';
import { useLanguage } from "../../Context/LanguageContext";
import "../../Scss/Custom/deletemodal.scss";

const DeleteModal = ({
    open,
    onClose,
    onDelete,
    name,
    message,
    headingname,
    isLoading,
    confirmText,
    cancelText,
    customMessage
}) => {
    const { translations } = useLanguage();
    if (!open) return null;

    return (<>
        <div className="modal fade show" style={{ display: "block", zIndex: 99999 }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{headingname || translations.delete}</h5>
                        <button type="button" className="btn-close closebtn" onClick={onClose} disabled={isLoading} aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        {isLoading ? (
                            <div className="delete-modal-loader">
                                <CircularProgress size={36} style={{ color: "var(--primary-color, #e53935)" }} />
                            </div>
                        ) : customMessage ? (
                            typeof customMessage === 'string' ? <p>{customMessage}</p> : customMessage
                        ) : (
                            <p>{translations.deletemsg || translations.areyousureyouwanttodeletethe} <strong>{name}</strong> {message}?</p>
                        )}
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isLoading}>
                            {cancelText || translations.cancel}
                        </button>
                        <button type="button" className="btn btn-danger" onClick={onDelete} disabled={isLoading}>
                            {confirmText || translations.delete}
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div className="modal-backdrop fade show" style={{ zIndex: 99998 }}></div>
    </>);
};

export default DeleteModal;