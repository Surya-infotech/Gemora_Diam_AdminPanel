import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../Scss/System/Setting/invoicesetting.scss';
import { useAuth } from '../../../Middleware/Auth';
import LoadingSpinner from '../../../Pages/Custom/LoadingSpinner';
import WarningModal from '../../../Pages/Custom/WarningModal';
import AlertMessage from '../../../Pages/Custom/AlertMessage';
import CheckToken from '../../../utils/CheckToken';
import HandleUnauthorized from '../../../utils/HandleUnauthorized';
import { parseInvoiceSettingsFromResponse } from '../../../utils/invoiceSettingUtils';
const InvoiceSetting = () => {
  const navigate = useNavigate();
  const {
    logoutUser
  } = useAuth();
  const adminPanelBackendPath = import.meta.env.VITE_BACKEND_URL;
  const tokenname = import.meta.env.VITE_AdminTOKEN_NAME;
  const token = localStorage.getItem(tokenname);
  const [loading, setLoading] = useState(true);
  const [warningMessage, setWarningMessage] = useState('');
  const [showWarning, setShowWarning] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [notes, setNotes] = useState('');
  const [invoicePrefix, setInvoicePrefix] = useState('');
  useEffect(() => {
    document.title = "Invoice Setting";
  }, []);
  useEffect(() => {
    if (!CheckToken(token, logoutUser, navigate)) return;
    const fetchInvoiceSettings = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${adminPanelBackendPath}/System/GetInvoiceSetting`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();
        if (HandleUnauthorized(data, logoutUser, navigate)) return;
        if (response.ok && data) {
          const settings = parseInvoiceSettingsFromResponse(data);
          setNotes(settings.notes);
          setInvoicePrefix(settings.invoicePrefix);
        }
      } catch {
        setWarningMessage("Server error");
        setShowWarning(true);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoiceSettings();
  }, [token, navigate, logoutUser, adminPanelBackendPath]);
  const handleSubmit = async e => {
    e.preventDefault();
    if (!CheckToken(token, logoutUser, navigate)) return;
    const trimmedPrefix = invoicePrefix.trim();
    if (!trimmedPrefix) {
      setWarningMessage("All fields are required");
      setShowWarning(true);
      return;
    }
    try {
      const response = await fetch(`${adminPanelBackendPath}/System/UpdateInvoiceSetting`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          notes: notes.trim(),
          invoiceprefix: trimmedPrefix
        })
      });
      const data = await response.json();
      if (HandleUnauthorized(data, logoutUser, navigate)) return;
      if (response.ok) {
        setSuccessMessage("Invoice settings updated successfully");
      } else {
        const errorMessages = {
          'Server error': "Server error",
          'All fields are required': "All fields are required"
        };
        setWarningMessage(errorMessages[data.message] || "Server error");
        setShowWarning(true);
      }
    } catch {
      setWarningMessage("Server error");
      setShowWarning(true);
    }
  };
  const handleWarningClose = () => setShowWarning(false);
  const handleCloseAlert = () => setSuccessMessage('');
  return <>
            {showWarning && <WarningModal message={warningMessage} onClose={handleWarningClose} />}
            {successMessage && <AlertMessage message={successMessage} onClose={handleCloseAlert} />}
            <div className="InvoiceSetting-container">
                {loading ? <LoadingSpinner /> : <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="invoice-prefix">{"Invoice Number Prefix"}</label>
                            <input id="invoice-prefix" type="text" className="form-control" placeholder={"Enter invoice number prefix (e.g. INV-)"} value={invoicePrefix} onChange={e => setInvoicePrefix(e.target.value)} maxLength={20} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="invoice-notes">{"Notes"}</label>
                            <textarea id="invoice-notes" className="form-control" placeholder={"Enter notes for invoice footer"} value={notes} onChange={e => setNotes(e.target.value)} rows={4} maxLength={300} />
                        </div>
                        <div className="button-group">
                            <button type="submit" className="btn btn-success submit-btn">
                                {"Save"}
                            </button>
                        </div>
                    </form>}
            </div>
        </>;
};
export default InvoiceSetting;