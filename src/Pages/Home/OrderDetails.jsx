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

    const handleDownloadInvoice = () => {
        if (!order) return;

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
                    <td style="padding: 14px 16px; border-bottom: 1px solid #eef2f6; vertical-align: top;">
                        <div style="font-weight: 700; color: #0f172a; font-size: 13.5px; margin-bottom: 4px;">
                            ${idx + 1}. ${escapeHtml(item.itemname || 'Fine Jewelry Piece')}
                        </div>
                        ${specs ? `<div style="font-size: 11.5px; color: #64748b; line-height: 1.5; margin-bottom: 4px;">${escapeHtml(specs)}</div>` : ''}
                        ${item.specialinstruction ? `<div style="font-size: 11px; color: #047857; background: #ecfdf5; display: inline-block; padding: 2px 8px; border-radius: 4px; font-style: italic;">Special Note: ${escapeHtml(item.specialinstruction)}</div>` : ''}
                    </td>
                    <td style="padding: 14px 16px; border-bottom: 1px solid #eef2f6; text-align: center; vertical-align: top; font-weight: 600; font-size: 13.5px; color: #334155;">
                        ${qty}
                    </td>
                    <td style="padding: 14px 16px; border-bottom: 1px solid #eef2f6; text-align: right; vertical-align: top; font-size: 13.5px; color: #334155; white-space: nowrap;">
                        ${escapeHtml(unitPriceStr)}
                    </td>
                    <td style="padding: 14px 16px; border-bottom: 1px solid #eef2f6; text-align: right; vertical-align: top; font-weight: 700; font-size: 13.5px; color: #0f172a; white-space: nowrap;">
                        ${escapeHtml(totalPriceStr)}
                    </td>
                </tr>
            `;
        }).join('');

        const subtotalStr = formatPriceWithCurrency(order.subtotal, order.currencydetails);
        const grandTotalStr = formatPriceWithCurrency(order.total, order.currencydetails);
        const invoiceNotes = invoiceSettings?.notes || 'Thank you for choosing Gemora Diam. Each gemstone is ethically crafted, graded, and authenticated.';

        const invoiceHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice ${escapeHtml(invoiceNumber)} - ${escapeHtml(brandName)}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;1,600&display=swap" rel="stylesheet">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
            background-color: #f8fafc;
            color: #1e293b;
            line-height: 1.5;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }
        .action-bar {
            background: #0f172a;
            padding: 12px 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            color: #fff;
            position: sticky;
            top: 0;
            z-index: 100;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
        .action-btn {
            background: #10b981;
            color: #fff;
            border: none;
            padding: 8px 18px;
            border-radius: 6px;
            font-weight: 600;
            font-size: 13px;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            transition: background 0.2s;
        }
        .action-btn:hover { background: #059669; }
        .close-btn {
            background: transparent;
            color: #94a3b8;
            border: 1px solid #475569;
            padding: 7px 14px;
            border-radius: 6px;
            font-size: 13px;
            cursor: pointer;
        }
        .close-btn:hover { color: #fff; border-color: #cbd5e1; }
        .invoice-wrapper {
            max-width: 860px;
            margin: 24px auto;
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 40px 48px;
            box-shadow: 0 4px 20px -2px rgba(0,0,0,0.06);
        }
        .brand-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding-bottom: 24px;
            border-bottom: 2px solid #0f172a;
            margin-bottom: 28px;
        }
        .brand-title {
            font-family: 'Playfair Display', serif;
            font-size: 28px;
            font-weight: 700;
            color: #044e39;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            line-height: 1.2;
        }
        .brand-subtitle {
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.16em;
            text-transform: uppercase;
            color: #b4833e;
            margin-top: 4px;
        }
        .invoice-badge-box {
            text-align: right;
        }
        .invoice-type {
            font-size: 22px;
            font-weight: 800;
            color: #0f172a;
            letter-spacing: 0.04em;
            text-transform: uppercase;
        }
        .invoice-id {
            font-size: 15px;
            font-weight: 700;
            color: #10b981;
            font-family: monospace;
            margin-top: 2px;
        }
        .meta-strip {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 14px 18px;
            margin-bottom: 28px;
            gap: 12px;
        }
        .meta-item .meta-label {
            font-size: 11px;
            text-transform: uppercase;
            font-weight: 600;
            color: #64748b;
            letter-spacing: 0.05em;
        }
        .meta-item .meta-value {
            font-size: 13px;
            font-weight: 700;
            color: #0f172a;
            margin-top: 2px;
        }
        .status-badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
        }
        .status-delivered { background: #dcfce7; color: #15803d; }
        .status-paid { background: #dcfce7; color: #15803d; }

        .parties-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 28px;
            margin-bottom: 32px;
        }
        .party-card {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 16px 18px;
        }
        .party-card h6 {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: #044e39;
            font-weight: 700;
            margin-bottom: 8px;
            padding-bottom: 6px;
            border-bottom: 1px solid #f1f5f9;
        }
        .party-name { font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 4px; }
        .party-line { font-size: 12.5px; color: #475569; line-height: 1.5; }

        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 24px;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            overflow: hidden;
        }
        .items-table th {
            background: #f1f5f9;
            color: #334155;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            padding: 12px 16px;
            border-bottom: 2px solid #cbd5e1;
        }

        .summary-wrap {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 28px;
        }
        .summary-card {
            width: 320px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 16px 20px;
        }
        .summary-row {
            display: flex;
            justify-content: space-between;
            padding: 6px 0;
            font-size: 13px;
            color: #475569;
        }
        .summary-row.total-row {
            border-top: 2px solid #0f172a;
            margin-top: 8px;
            padding-top: 10px;
            font-size: 16px;
            font-weight: 800;
            color: #0f172a;
        }

        .invoice-footer-section {
            border-top: 1px dashed #cbd5e1;
            padding-top: 20px;
            margin-top: 24px;
        }
        .notes-heading {
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            color: #64748b;
            letter-spacing: 0.06em;
            margin-bottom: 4px;
        }
        .notes-content {
            font-size: 12px;
            color: #475569;
            line-height: 1.6;
        }
        .guarantee-box {
            margin-top: 16px;
            text-align: center;
            padding: 12px;
            background: #fafaf9;
            border: 1px solid #e7e5e4;
            border-radius: 6px;
            font-size: 11px;
            color: #78716c;
            letter-spacing: 0.04em;
        }

        @media print {
            .no-print { display: none !important; }
            body { background: #fff !important; }
            .invoice-wrapper {
                margin: 0 !important;
                padding: 0 !important;
                border: none !important;
                box-shadow: none !important;
                max-width: 100% !important;
            }
            @page {
                size: A4 portrait;
                margin: 14mm 16mm;
            }
        }
    </style>
</head>
<body>
    <div class="action-bar no-print">
        <div style="font-weight: 600; font-size: 14px;">Gemora Diam — Official Invoice Preview</div>
        <div style="display: flex; gap: 10px;">
            <button class="action-btn" onclick="window.print()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/></svg>
                Print / Save as PDF
            </button>
            <button class="close-btn" onclick="window.close()">Close</button>
        </div>
    </div>

    <div class="invoice-wrapper">
        <div class="brand-header">
            <div>
                <div class="brand-title">${escapeHtml(brandName)}</div>
                <div class="brand-subtitle">Official Invoice</div>
            </div>
            <div class="invoice-badge-box">
                <div class="invoice-type">Tax Invoice</div>
                <div class="invoice-id">${escapeHtml(invoiceNumber)}</div>
            </div>
        </div>

        <div class="meta-strip">
            <div class="meta-item">
                <div class="meta-label">Invoice Date</div>
                <div class="meta-value">${escapeHtml(invoiceDate)}</div>
            </div>
            <div class="meta-item">
                <div class="meta-label">Order Number</div>
                <div class="meta-value">#${escapeHtml(orderNumberDisplay)}</div>
            </div>
            <div class="meta-item">
                <div class="meta-label">Order Status</div>
                <div class="meta-value"><span class="status-badge status-delivered">${escapeHtml(order.orderstatus || 'Delivered')}</span></div>
            </div>
            <div class="meta-item">
                <div class="meta-label">Payment Status</div>
                <div class="meta-value"><span class="status-badge status-paid">${escapeHtml(order.paymentstatus || 'Paid')}</span></div>
            </div>
        </div>

        <div class="parties-grid">
            <div class="party-card">
                <h6>Billed &amp; Delivered To</h6>
                <div class="party-name">${escapeHtml(customerName)}</div>
                ${customerEmail ? `<div class="party-line">Email: ${escapeHtml(customerEmail)}</div>` : ''}
                ${customerPhone ? `<div class="party-line">Phone: ${escapeHtml(customerPhone)}</div>` : ''}
                ${shippingAddressParts ? `<div class="party-line" style="margin-top: 6px;">${shippingAddressParts}</div>` : ''}
            </div>

            <div class="party-card">
                <h6>Issued By</h6>
                <div class="party-name">${escapeHtml(brandName)}</div>
                ${brandEmail ? `<div class="party-line">Email: ${escapeHtml(brandEmail)}</div>` : ''}
                ${brandPhone ? `<div class="party-line">Phone: ${escapeHtml(brandPhone)}</div>` : ''}
                ${brandAddress ? `<div class="party-line" style="margin-top: 6px;">${escapeHtml(brandAddress)}</div>` : ''}
                <div class="party-line" style="margin-top: 6px;"><strong>Payment Method:</strong> ${escapeHtml(order.paymentmethod || 'Credit/Debit Card')}</div>
            </div>
        </div>

        <table class="items-table">
            <thead>
                <tr>
                    <th style="text-align: left;">Product Details</th>
                    <th style="text-align: center; width: 80px;">Qty</th>
                    <th style="text-align: right; width: 140px;">Unit Rate</th>
                    <th style="text-align: right; width: 140px;">Amount</th>
                </tr>
            </thead>
            <tbody>
                ${itemRows}
            </tbody>
        </table>

        <div class="summary-wrap">
            <div class="summary-card">
                <div class="summary-row">
                    <span>Subtotal:</span>
                    <span>${escapeHtml(subtotalStr)}</span>
                </div>
                <div class="summary-row total-row">
                    <span>Grand Total:</span>
                    <span>${escapeHtml(grandTotalStr)}</span>
                </div>
            </div>
        </div>

        <div class="invoice-footer-section">
            ${invoiceNotes ? `
                <div class="notes-heading">Notes</div>
                <div class="notes-content">${escapeHtml(invoiceNotes)}</div>
            ` : ''}
            <div class="guarantee-box">
                Ethically Sourced • Certified Lab-Grown Diamonds • Lifetime Craftsmanship Guarantee
            </div>
        </div>
    </div>
</body>
</html>`;

        const printWin = window.open('', '_blank');
        if (!printWin) {
            setWarningMessage('Please allow popups to download and print the order invoice.');
            setShowWarning(true);
            return;
        }

        printWin.document.open();
        printWin.document.write(invoiceHtml);
        printWin.document.close();
        printWin.focus();

        setTimeout(() => {
            try {
                printWin.print();
            } catch {
                // User can still use top print button in the opened window
            }
        }, 450);
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
                                title={translations.downloadinvoice || 'Download Invoice'}
                            >
                                <PictureAsPdfIcon style={{ fontSize: 17 }} />
                                <span>{translations.invoice || 'Invoice'}</span>
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
