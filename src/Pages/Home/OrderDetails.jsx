import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PrintIcon from '@mui/icons-material/Print';
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

        fetchMiscSettings();
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

    const handlePrint = () => {
        window.print();
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

                        <button type="button" className="print-btn" onClick={handlePrint} title="Print Order">
                            <PrintIcon style={{ fontSize: 17 }} />
                            <span>Print</span>
                        </button>
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
