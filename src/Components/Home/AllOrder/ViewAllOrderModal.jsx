import CloseIcon from '@mui/icons-material/Close';

const DetailItem = ({ label, value, isLink = false, fullSpan = false, multiline = false }) => (
  <div className={`allorder-detail-item${fullSpan ? ' full-span' : ''}`}>
    <span className="detail-label">{label}</span>
    <span className={`detail-value${multiline ? ' multiline' : ''}`}>
      {isLink && value ? (
        <a href={value} target="_blank" rel="noopener noreferrer">
          {value}
        </a>
      ) : (
        value || "—"
      )}
    </span>
  </div>
);

const ViewAllOrderModal = ({ order, onClose, onEdit }) => {
  if (!order) return null;

  return (
    <>
      <div className="modal fade show allorder-view-modal" tabIndex="-1" onClick={onClose}>
        <div className="modal-dialog modal-lg modal-dialog-centered" onClick={e => e.stopPropagation()}>
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {"Order Details"} {order.orderId ? `— ${order.orderId}` : ""}
              </h5>
              <button type="button" className="allorder-modal-close" onClick={onClose} aria-label={"Close"}>
                <CloseIcon fontSize="small" />
              </button>
            </div>

            <div className="modal-body allorder-view-body">
              <h6 className="view-section-title">{"Order details"}</h6>
              <div className="allorder-details-grid">
                <DetailItem label={"Etsy Order ID"} value={order.orderId} />
                <DetailItem label={"Customer name"} value={order.customer} />
                <DetailItem label={"Order date"} value={order.orderDate} />
                <DetailItem label={"Shop name"} value={order.shopName} />
                <DetailItem label={"Metal"} value={order.metal} />
                <DetailItem label={"Employee assigned"} value={order.employee} />
                <DetailItem label={"Etsy order link"} value={order.orderLink} isLink fullSpan />
              </div>

              <h6 className="view-section-title">{"Production & customer communication"}</h6>
              <div className="allorder-details-grid">
                <DetailItem label={"Current status"} value={order.status || "Order Received"} />
                <DetailItem label={"Customer conversation"} value={order.conversation} fullSpan multiline />
              </div>

              <h6 className="view-section-title">{"Dispatch details"}</h6>
              <div className="allorder-details-grid">
                <DetailItem label={"Dispatch date"} value={order.dispatchDate} />
                <DetailItem label={"Courier"} value={order.courier} />
                <DetailItem label={"Tracking number"} value={order.tracking} />
                <DetailItem label={"Tracking link"} value={order.trackingLink} isLink fullSpan />
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary cancelbtn" onClick={onClose}>
                {"Close"}
              </button>
              {onEdit && (
                <button
                  type="button"
                  className="btn btn-success submit-btn"
                  onClick={() => {
                    onClose();
                    onEdit(order);
                  }}
                >
                  {"Edit"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show"></div>
    </>
  );
};

export default ViewAllOrderModal;