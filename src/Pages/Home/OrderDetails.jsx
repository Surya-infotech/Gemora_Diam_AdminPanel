import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import PersonIcon from '@mui/icons-material/Person';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PaymentIcon from '@mui/icons-material/Payment';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../Middleware/Auth';
import { useLanguage } from '../../Context/LanguageContext';
import CheckToken from '../../utils/CheckToken';
import HandleUnauthorized from '../../utils/HandleUnauthorized';
import LoadingSpinner from '../Custom/LoadingSpinner';
import AlertMessage from '../Custom/AlertMessage';
import WarningModal from '../Custom/WarningModal';
import { formatPriceWithCurrency } from '../../utils/CurrencyFormatter';
import { formatDateTime } from '../../utils/dateTimeFormatter';
import { fetchInvoiceSettings } from '../../utils/invoiceSettingUtils';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import '../../Scss/Home/Order/orderdetails.scss';

const ORDER_STATUS_OPTIONS = [
    'Confirmed',
    'Processing',
    'Shipped',
    'Delivered',
    'Cancelled'
];

const OrderDetails = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { logoutUser } = useAuth();
    const { translations, isRtl } = useLanguage();
    const adminPanelBackendPath = import.meta.env.VITE_BACKEND_URL;
    const tokenname = import.meta.env.VITE_AdminTOKEN_NAME;
    const token = localStorage.getItem(tokenname);

    const [order, setOrder] = useState(location.state?.order || null);
    const [miscSettings, setMiscSettings] = useState(null);
    const [invoiceSettings, setInvoiceSettings] = useState(null);
    const [generalSettings, setGeneralSettings] = useState(null);
    const [loading, setLoading] = useState(!location.state?.order);
    const [downloadingInvoice, setDownloadingInvoice] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [warningMessage, setWarningMessage] = useState('');
    const [showWarning, setShowWarning] = useState(false);


    useEffect(() => {
        const orderNum = order?.ordernumber != null ? order.ordernumber : (order?.orderid || id);
        document.title = `${translations.orderdetails || 'Order Details'} #${orderNum}`;
    }, [order, id, translations]);

    useEffect(() => {
        let isMounted = true;
        if (!CheckToken(token, logoutUser, navigate)) return;

        const fetchDetails = async () => {
            try {
                if (!order) setLoading(true);
                const response = await fetch(`${adminPanelBackendPath}/Customer/GetOrderDetails/${id}`, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                const data = await response.json();
                if (HandleUnauthorized(data, logoutUser, navigate)) return;
                if (!isMounted) return;

                if (response.ok && data.order) {
                    setOrder(data.order);
                } else if (!order) {
                    setWarningMessage(data.message || translations.servererror);
                    setShowWarning(true);
                }
            } catch {
                if (isMounted && !order) {
                    setWarningMessage(translations.servererror);
                    setShowWarning(true);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchDetails();

        return () => {
            isMounted = false;
        };
    }, [adminPanelBackendPath, id, logoutUser, navigate, token, translations]);

    useEffect(() => {
        let isMounted = true;
        if (!CheckToken(token, logoutUser, navigate)) return;

        const fetchMiscSettings = async () => {
            try {
                const response = await fetch(`${adminPanelBackendPath}/System/GetMiscSetting`, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                const data = await response.json();
                if (isMounted && response.ok && data) {
                    setMiscSettings(data);
                }
            } catch {
                // Ignore fallback to defaults
            }
        };

        const fetchExtraSettings = async () => {
            try {
                const inv = await fetchInvoiceSettings(adminPanelBackendPath);
                if (isMounted && inv) {
                    setInvoiceSettings(inv);
                }
            } catch {
                // Ignore fallback
            }

            try {
                const genRes = await fetch(`${adminPanelBackendPath}/System/GetGeneralSetting`, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (isMounted && genRes.ok) {
                    const genData = await genRes.json();
                    setGeneralSettings(genData);
                }
            } catch {
                // Ignore fallback
            }
        };

        fetchMiscSettings();
        fetchExtraSettings();
        return () => {
            isMounted = false;
        };
    }, [adminPanelBackendPath, logoutUser, navigate, token]);

    const handleStatusChange = async (newStatus) => {
        if (!order) return;
        if (!CheckToken(token, logoutUser, navigate)) return;
        const targetId = order._id || order.orderid || id;

        try {
            const response = await fetch(`${adminPanelBackendPath}/Customer/UpdateOrderStatus/${targetId}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ orderstatus: newStatus })
            });

            const data = await response.json();
            if (HandleUnauthorized(data, logoutUser, navigate)) return;

            if (response.ok) {
                setOrder((prev) => ({ ...prev, orderstatus: newStatus }));
                setAlertMessage(translations.updateordersuccessfull || 'Order status updated successfully');
            } else {
                setWarningMessage(data.message || translations.servererror);
                setShowWarning(true);
            }
        } catch {
            setWarningMessage(translations.servererror);
            setShowWarning(true);
        }
    };

    const escapeHtml = (text) => {
        if (text == null) return '';
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    };

    const handleDownloadInvoice = async () => {
        if (!order || downloadingInvoice) return;
        setDownloadingInvoice(true);

        try {
            const orderNumberDisplay = order.ordernumber != null ? order.ordernumber : (order.orderid || id);
            const prefix = invoiceSettings?.invoicePrefix || 'INV-';
            const invoiceNumber = `${prefix}${orderNumberDisplay}`;
            const invoiceDate = formatDateTime(order.createdAt, miscSettings) || new Date().toLocaleDateString();

            const brandName = generalSettings?.softwarename || 'Gemora Diam';
            const brandEmail = generalSettings?.email || '';
            const brandPhone = generalSettings?.phone || '';
            const brandAddressParts = [
                generalSettings?.address,
                generalSettings?.cityname,
                generalSettings?.statename,
                generalSettings?.countryname,
                generalSettings?.postalcode
            ].filter(Boolean);
            const brandAddress = brandAddressParts.join(', ');

            const customerName = order.customername || 'Valued Customer';
            const customerEmail = order.customeremail || '';
            const customerPhone = order.customerphone || '';

            const shippingAddr = order.shippingaddress;
            const shippingAddressParts = shippingAddr
                ? [
                    shippingAddr.title ? `<strong>${escapeHtml(shippingAddr.title)}</strong>` : '',
                    shippingAddr.address,
                    shippingAddr.cityname,
                    shippingAddr.statename,
                    shippingAddr.countryname,
                    shippingAddr.pincode ? `PIN: ${shippingAddr.pincode}` : ''
                ].filter(Boolean).join('<br>')
                : '';

            const items = order.items || [];
            const itemRows = items.map((item, idx) => {
                const specs = [
                    item.metalname && `Metal: ${item.metalname}`,
                    item.diamondsize && `Diamond: ${item.diamondsize}`,
                    item.shapename && `Shape: ${item.shapename}`,
                    item.clarityname && `Clarity: ${item.clarityname}`,
                    item.stonename && `Stone: ${item.stonename}`,
                    item.size && `Size: ${item.size}`,
                    item.diamondcolor && `Color: ${item.diamondcolor}`,
                    item.bandcolor && `Band: ${item.bandcolor}`
                ].filter(Boolean).join(' • ');

                const unitPriceStr = formatPriceWithCurrency(item.price, order.currencydetails);
                const totalPriceStr = formatPriceWithCurrency(item.totalprice || (item.price * (item.qty || 1)), order.currencydetails);
                const qty = item.qty || 1;

                return `
                    <tr>
                        <td style="padding: 12px 14px; border-bottom: 1px solid #eef2f6; vertical-align: top;">
                            <div style="font-weight: 700; color: #0f172a; font-size: 13.5px; margin-bottom: 4px;">
                                ${idx + 1}. ${escapeHtml(item.itemname || 'Fine Jewelry Piece')}
                            </div>
                            ${specs ? `<div style="font-size: 11.5px; color: #64748b; line-height: 1.5; margin-bottom: 4px;">${escapeHtml(specs)}</div>` : ''}
                            ${item.specialinstruction ? `<div style="font-size: 11px; color: #047857; background: #ecfdf5; display: inline-block; padding: 2px 8px; border-radius: 4px; font-style: italic;">Special Note: ${escapeHtml(item.specialinstruction)}</div>` : ''}
                        </td>
                        <td style="padding: 12px 14px; border-bottom: 1px solid #eef2f6; text-align: center; vertical-align: top; font-weight: 600; font-size: 13.5px; color: #334155;">
                            ${qty}
                        </td>
                        <td style="padding: 12px 14px; border-bottom: 1px solid #eef2f6; text-align: right; vertical-align: top; font-size: 13.5px; color: #334155; white-space: nowrap;">
                            ${escapeHtml(unitPriceStr)}
                        </td>
                        <td style="padding: 12px 14px; border-bottom: 1px solid #eef2f6; text-align: right; vertical-align: top; font-weight: 700; font-size: 13.5px; color: #0f172a; white-space: nowrap;">
                            ${escapeHtml(totalPriceStr)}
                        </td>
                    </tr>
                `;
            }).join('');

            const subtotalStr = formatPriceWithCurrency(order.subtotal, order.currencydetails);
            const grandTotalStr = formatPriceWithCurrency(order.total, order.currencydetails);
            const invoiceNotes = invoiceSettings?.notes || 'Thank you for choosing Gemora Diam. Each gemstone is ethically crafted, graded, and authenticated.';

            const container = document.createElement('div');
            container.style.position = 'fixed';
            container.style.left = '-9999px';
            container.style.top = '0';
            container.style.width = '794px';
            container.style.backgroundColor = '#ffffff';
            container.style.zIndex = '-9999';

            container.innerHTML = `
                <div style="font-family: Arial, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #ffffff; color: #1e293b; padding: 36px 40px; width: 794px; box-sizing: border-box;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 18px; border-bottom: 2px solid #0f172a; margin-bottom: 22px;">
                        <div>
                            <div style="font-size: 26px; font-weight: 700; color: #044e39; letter-spacing: 0.05em; text-transform: uppercase;">
                                ${escapeHtml(brandName)}
                            </div>
                            <div style="font-size: 12px; font-weight: 600; text-transform: uppercase; color: #64748b; letter-spacing: 0.08em; margin-top: 4px;">
                                Official Invoice
                            </div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-size: 20px; font-weight: 800; color: #0f172a; text-transform: uppercase;">
                                Tax Invoice
                            </div>
                            <div style="font-size: 14px; font-weight: 700; color: #10b981; font-family: monospace; margin-top: 2px;">
                                ${escapeHtml(invoiceNumber)}
                            </div>
                        </div>
                    </div>

                    <div style="display: flex; justify-content: space-between; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 18px; margin-bottom: 22px;">
                        <div>
                            <div style="font-size: 11px; text-transform: uppercase; font-weight: 600; color: #64748b;">Invoice Date</div>
                            <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-top: 2px;">${escapeHtml(invoiceDate)}</div>
                        </div>
                        <div>
                            <div style="font-size: 11px; text-transform: uppercase; font-weight: 600; color: #64748b;">Order Number</div>
                            <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-top: 2px;">#${escapeHtml(orderNumberDisplay)}</div>
                        </div>
                        <div>
                            <div style="font-size: 11px; text-transform: uppercase; font-weight: 600; color: #64748b;">Order Status</div>
                            <div style="margin-top: 2px;">
                                <span style="display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; text-transform: uppercase; background: #dcfce7; color: #15803d;">
                                    ${escapeHtml(order.orderstatus || 'Delivered')}
                                </span>
                            </div>
                        </div>
                        <div>
                            <div style="font-size: 11px; text-transform: uppercase; font-weight: 600; color: #64748b;">Payment Status</div>
                            <div style="margin-top: 2px;">
                                <span style="display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; text-transform: uppercase; background: #dcfce7; color: #15803d;">
                                    ${escapeHtml(order.paymentstatus || 'Paid')}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div style="display: flex; gap: 18px; margin-bottom: 22px;">
                        <div style="flex: 1; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 16px; background: #ffffff;">
                            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #044e39; font-weight: 700; margin-bottom: 6px; padding-bottom: 4px; border-bottom: 1px solid #f1f5f9;">
                                Billed &amp; Delivered To
                            </div>
                            <div style="font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 4px;">${escapeHtml(customerName)}</div>
                            ${customerEmail ? `<div style="font-size: 12px; color: #475569;">Email: ${escapeHtml(customerEmail)}</div>` : ''}
                            ${customerPhone ? `<div style="font-size: 12px; color: #475569;">Phone: ${escapeHtml(customerPhone)}</div>` : ''}
                            ${shippingAddressParts ? `<div style="font-size: 12px; color: #475569; margin-top: 6px; line-height: 1.4;">${shippingAddressParts}</div>` : ''}
                        </div>

                        <div style="flex: 1; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 16px; background: #ffffff;">
                            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #044e39; font-weight: 700; margin-bottom: 6px; padding-bottom: 4px; border-bottom: 1px solid #f1f5f9;">
                                Issued By
                            </div>
                            <div style="font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 4px;">${escapeHtml(brandName)}</div>
                            ${brandEmail ? `<div style="font-size: 12px; color: #475569;">Email: ${escapeHtml(brandEmail)}</div>` : ''}
                            ${brandPhone ? `<div style="font-size: 12px; color: #475569;">Phone: ${escapeHtml(brandPhone)}</div>` : ''}
                            ${brandAddress ? `<div style="font-size: 12px; color: #475569; margin-top: 6px; line-height: 1.4;">${escapeHtml(brandAddress)}</div>` : ''}
                            <div style="font-size: 12px; color: #475569; margin-top: 6px;"><strong>Payment Method:</strong> ${escapeHtml(order.paymentmethod || 'Credit/Debit Card')}</div>
                        </div>
                    </div>

                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 22px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                        <thead>
                            <tr style="background: #f1f5f9;">
                                <th style="text-align: left; padding: 10px 14px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #334155; border-bottom: 2px solid #cbd5e1;">Product Details</th>
                                <th style="text-align: center; width: 70px; padding: 10px 14px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #334155; border-bottom: 2px solid #cbd5e1;">Qty</th>
                                <th style="text-align: right; width: 120px; padding: 10px 14px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #334155; border-bottom: 2px solid #cbd5e1;">Unit Rate</th>
                                <th style="text-align: right; width: 120px; padding: 10px 14px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #334155; border-bottom: 2px solid #cbd5e1;">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemRows}
                        </tbody>
                    </table>

                    <div style="display: flex; justify-content: flex-end; margin-bottom: 22px;">
                        <div style="width: 280px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 18px;">
                            <div style="display: flex; justify-content: space-between; font-size: 13px; color: #475569; margin-bottom: 6px;">
                                <span>Subtotal:</span>
                                <span>${escapeHtml(subtotalStr)}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; font-size: 15px; font-weight: 800; color: #0f172a; border-top: 2px solid #0f172a; padding-top: 8px; margin-top: 6px;">
                                <span>Grand Total:</span>
                                <span>${escapeHtml(grandTotalStr)}</span>
                            </div>
                        </div>
                    </div>

                    <div style="border-top: 1px dashed #cbd5e1; padding-top: 16px;">
                        ${invoiceNotes ? `
                            <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 4px;">Notes</div>
                            <div style="font-size: 12px; color: #475569; line-height: 1.5; margin-bottom: 12px;">${escapeHtml(invoiceNotes)}</div>
                        ` : ''}
                        <div style="text-align: center; padding: 10px; background: #fafaf9; border: 1px solid #e7e5e4; border-radius: 6px; font-size: 11px; color: #78716c;">
                            Ethically Sourced • Certified Lab-Grown Diamonds • Lifetime Craftsmanship Guarantee
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(container);

            const canvas = await html2canvas(container, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
                windowWidth: 794
            });

            document.body.removeChild(container);

            const imgData = canvas.toDataURL('image/jpeg', 0.98);
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = pdfWidth;
            const imgHeight = (canvas.height * pdfWidth) / canvas.width;

            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
            heightLeft -= pdfHeight;

            while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
                heightLeft -= pdfHeight;
            }

            const safeFilename = `Invoice-${String(invoiceNumber).replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
            pdf.save(safeFilename);
            setAlertMessage(translations.invoicedownloaded || 'Invoice PDF downloaded successfully');
        } catch {
            setWarningMessage(translations.invoicedownloadfailed || 'Failed to download invoice PDF. Please try again.');
            setShowWarning(true);
        } finally {
            setDownloadingInvoice(false);
        }
    };

    if (loading) {
        return (
            <div className={`OrderDetails-container ${isRtl ? 'rtl-orderdetails' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
                <div className="orderdetails-container">
                    <LoadingSpinner />
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className={`OrderDetails-container ${isRtl ? 'rtl-orderdetails' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
                <div className="orderdetails-container">
                    {showWarning && <WarningModal message={warningMessage} onClose={() => setShowWarning(false)} />}
                    <div style={{ textAlign: 'center', padding: '60px 0' }}>
                        <h5>Order Not Found</h5>
                        <button type="button" className="btn btn-secondary mt-3" onClick={() => navigate('/Home/Order')}>
                            Back to Orders
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const orderNumberDisplay = order.ordernumber != null ? order.ordernumber : (order.orderid || id);
    const statusClass = (order.orderstatus || 'Confirmed').toLowerCase();
    const paymentStatusClass = (order.paymentstatus || 'Paid').toLowerCase();
    const totalItemsCount = order.totalitems || (order.items || []).reduce((acc, i) => acc + (i.qty || 1), 0);
    const isDelivered = String(order.orderstatus || '').trim().toLowerCase() === 'delivered';
    const isPaid = String(order.paymentstatus || '').trim().toLowerCase() === 'paid';
    const canDownloadInvoice = isDelivered && isPaid;

    return (
        <div className={`OrderDetails-container ${isRtl ? 'rtl-orderdetails' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="orderdetails-container">
                {alertMessage && <AlertMessage message={alertMessage} onClose={() => setAlertMessage('')} />}
                {showWarning && <WarningModal message={warningMessage} onClose={() => setShowWarning(false)} />}

                {/* Header */}
                <div className="orderdetails-header">
                    <div className="orderdetails-header-left">
                        <button
                            type="button"
                            className="orderdetails-back-btn"
                            onClick={() => navigate('/Home/Order')}
                            title={translations.back || 'Back to Orders'}
                        >
                            <ArrowBackIcon style={{ fontSize: 20 }} />
                        </button>
                        <h5 className="orderdetails-heading">
                            <span>{translations.orderdetails || 'Order Details'}</span>
                            <span className="order-badge-highlight">#{orderNumberDisplay}</span>
                        </h5>
                    </div>

                    <div className="orderdetails-header-actions">
                        <div className="status-change-box">
                            <select
                                className={`status-select-header ${statusClass}`}
                                value={order.orderstatus || 'Confirmed'}
                                onChange={(e) => handleStatusChange(e.target.value)}
                            >
                                {ORDER_STATUS_OPTIONS.map((st) => (
                                    <option key={st} value={st}>
                                        {st}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {canDownloadInvoice && (
                            <button
                                type="button"
                                className="invoice-btn"
                                onClick={handleDownloadInvoice}
                                disabled={downloadingInvoice}
                                title={translations.downloadinvoice || 'Download Invoice'}
                            >
                                {downloadingInvoice ? (
                                    <span
                                        className="spinner-border spinner-border-sm"
                                        role="status"
                                        aria-hidden="true"
                                        style={{ width: 14, height: 14, borderWidth: 2 }}
                                    />
                                ) : (
                                    <PictureAsPdfIcon style={{ fontSize: 17 }} />
                                )}
                                <span>
                                    {downloadingInvoice
                                        ? (translations.downloading || 'Downloading...')
                                        : (translations.invoice || 'Invoice')}
                                </span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="orderdetails-content">
                    {/* Information Grid */}
                    <div className="details-grid">
                        {/* Order Summary Card */}
                        <div className="info-card">
                            <div className="info-card-header">
                                <ReceiptLongIcon className="card-icon" />
                                <h6>Order Info</h6>
                            </div>
                            <div className="info-card-body">
                                <div className="info-row">
                                    <span className="info-label">Order Number:</span>
                                    <span className="info-val">#{orderNumberDisplay}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Placed On:</span>
                                    <span className="info-val">{formatDateTime(order.createdAt, miscSettings)}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Total Items:</span>
                                    <span className="info-val">{totalItemsCount}</span>
                                </div>
                            </div>
                        </div>

                        {/* Customer Info Card */}
                        <div className="info-card">
                            <div className="info-card-header">
                                <PersonIcon className="card-icon" />
                                <h6>{translations.customerdetails || 'Customer Details'}</h6>
                            </div>
                            <div className="info-card-body">
                                <div className="info-row">
                                    <span className="info-label">Name:</span>
                                    <span className="info-val">{order.customername || 'Guest Customer'}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Email:</span>
                                    <span className="info-val">{order.customeremail || '-'}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Phone:</span>
                                    <span className="info-val">{order.customerphone || '-'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Shipping Address Card */}
                        <div className="info-card">
                            <div className="info-card-header">
                                <LocalShippingIcon className="card-icon" />
                                <h6>{translations.shippingaddress || 'Shipping Address'}</h6>
                            </div>
                            <div className="info-card-body">
                                {order.shippingaddress ? (
                                    <>
                                        <div style={{ fontWeight: 600 }}>{order.shippingaddress.title || 'Address'}</div>
                                        <div>{order.shippingaddress.address}</div>
                                        <div>
                                            {[
                                                order.shippingaddress.cityname,
                                                order.shippingaddress.statename,
                                                order.shippingaddress.pincode
                                            ].filter(Boolean).join(', ')}
                                        </div>
                                        <div>{order.shippingaddress.countryname}</div>
                                    </>
                                ) : (
                                    <div>No shipping address recorded</div>
                                )}
                            </div>
                        </div>

                        {/* Payment & Financial Card */}
                        <div className="info-card">
                            <div className="info-card-header">
                                <PaymentIcon className="card-icon" />
                                <h6>{translations.paymentmethod || 'Payment Details'}</h6>
                            </div>
                            <div className="info-card-body">
                                <div className="info-row">
                                    <span className="info-label">Method:</span>
                                    <span className="info-val">{order.paymentmethod || 'Prepaid'}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Payment Status:</span>
                                    <span className={`badge-pill ${paymentStatusClass}`}>
                                        {order.paymentstatus || 'Paid'}
                                    </span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Currency:</span>
                                    <span className="info-val">
                                        {order.currencydetails?.currency || order.currency || 'INR'} ({order.currencydetails?.currencysymbol || '₹'})
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Ordered Items Table Card */}
                    <div className="items-card">
                        <div className="items-card-title">
                            <span>{translations.itemdetails || 'Ordered Items'}</span>
                            <span className="items-count-badge">
                                {order.items?.length || 0} {order.items?.length === 1 ? 'type' : 'types'} • {totalItemsCount} total
                            </span>
                        </div>

                        <div className="items-table-wrapper">
                            <table className="items-table">
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th style={{ textAlign: 'center' }}>{translations.quantity || 'Qty'}</th>
                                        <th style={{ textAlign: 'right' }}>{translations.unitprice || 'Unit Price'}</th>
                                        <th style={{ textAlign: 'right' }}>{translations.totalprice || 'Total Price'}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(order.items || []).map((item, index) => {
                                        const specs = [
                                            item.metalname && `Metal: ${item.metalname}`,
                                            item.diamondsize && `Diamond: ${item.diamondsize}`,
                                            item.shapename && `Shape: ${item.shapename}`,
                                            item.clarityname && `Clarity: ${item.clarityname}`,
                                            item.stonename && `Stone: ${item.stonename}`,
                                            item.size && `Size: ${item.size}`
                                        ].filter(Boolean).join(' • ');

                                        return (
                                            <tr key={index}>
                                                <td>
                                                    <div className="item-media">
                                                        {item.image ? (
                                                            <img src={item.image} alt={item.itemname || 'Item'} className="item-img" />
                                                        ) : (
                                                            <div className="item-placeholder">💎</div>
                                                        )}
                                                        <div className="item-meta">
                                                            <strong>{item.itemname || 'Fine Jewelry Piece'}</strong>
                                                            {specs && <div className="specs-row">{specs}</div>}
                                                            {item.specialinstruction && (
                                                                <div className="instruction-row">
                                                                    Instruction: {item.specialinstruction}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ textAlign: 'center', fontWeight: 600 }}>
                                                    {item.qty || 1}
                                                </td>
                                                <td style={{ textAlign: 'right' }}>
                                                    {formatPriceWithCurrency(item.price, order.currencydetails)}
                                                </td>
                                                <td style={{ textAlign: 'right', fontWeight: 700 }}>
                                                    {formatPriceWithCurrency(
                                                        item.totalprice || (item.price * (item.qty || 1)),
                                                        order.currencydetails
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Totals Breakdown */}
                        <div className="order-financial-breakdown">
                            <div className="breakdown-box">
                                <div className="breakdown-row">
                                    <span>{translations.subtotal || 'Subtotal'}:</span>
                                    <span>{formatPriceWithCurrency(order.subtotal, order.currencydetails)}</span>
                                </div>
                                <div className="breakdown-row grand-total">
                                    <span>{translations.total || 'Grand Total'}:</span>
                                    <span>{formatPriceWithCurrency(order.total, order.currencydetails)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default OrderDetails;