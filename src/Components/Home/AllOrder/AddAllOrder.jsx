import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../../Middleware/Auth';
import { useFiscalYear } from '../../../Context/FiscalYearContext';
import LoadingSpinner from '../../../Pages/Custom/LoadingSpinner';
import WarningModal from '../../../Pages/Custom/WarningModal';
import Dropdown from '../../Dropdown/Dropdown';
import CheckToken from '../../../utils/CheckToken';
import HandleUnauthorized from '../../../utils/HandleUnauthorized';
import {
  ALL_ORDER_STATUS_OPTIONS,
  COURIER_OPTIONS,
  INITIAL_ALL_ORDER_FORM,
  METAL_OPTIONS,
  SHOP_OPTIONS,
  buildAllOrderPayload,
  openDatePicker,
  validateAllOrderForm
} from '../../../utils/allOrderHelpers';
import "../../../Scss/Home/Order/addallorder.scss";

const AddAllOrder = () => {
  const navigate = useNavigate();
  const { logoutUser } = useAuth();
  const { selectedFiscalYear } = useFiscalYear();
  const adminPanelBackendPath = import.meta.env.VITE_BACKEND_URL;
  const tokenname = import.meta.env.VITE_AdminTOKEN_NAME;
  const token = localStorage.getItem(tokenname);

  const [form, setForm] = useState(INITIAL_ALL_ORDER_FORM);
  const [warningMessage, setWarningMessage] = useState("");
  const [showWarning, setShowWarning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.title = "Add Order";
  }, []);

  const handleFieldChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const validation = validateAllOrderForm(form);
    if (!validation.valid) {
      setWarningMessage(validation.message);
      setShowWarning(true);
      return;
    }

    setIsLoading(true);
    if (!CheckToken(token, logoutUser, navigate)) {
      setIsLoading(false);
      return;
    }

    try {
      const payload = buildAllOrderPayload({ form, selectedFiscalYear });
      const response = await fetch(`${adminPanelBackendPath}/Main/AddAllOrder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (HandleUnauthorized(result, logoutUser, navigate)) return;
      if (response.ok) {
        navigate('/Home/AllOrder', {
          state: {
            message: result.message || "Order added successfully"
          }
        });
      } else {
        setWarningMessage(result.message || "Server error");
        setShowWarning(true);
      }
    } catch {
      setWarningMessage("Server error");
      setShowWarning(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => navigate('/Home/AllOrder');

  return <>
    {showWarning && <WarningModal message={warningMessage} onClose={() => setShowWarning(false)} />}
    <div className="AddAllOrder-container ">
      <div className="Addallorder-container">
        <h6 className="Addallorder-headingname">{"Add Order"}</h6>
        <div className="Addallorder-form-container">
          {isLoading ? <LoadingSpinner /> : <form onSubmit={handleSubmit}>
            <h6 className="form-section-title">{"Order details"}</h6>
            <div className="form-row form-row-three">
              <div className="form-group">
                <label htmlFor="orderId">
                  {"Etsy Order ID"} <span style={{ color: "red" }}>*</span>
                </label>
                <input type="text" id="orderId" name="orderId" autoComplete="off" placeholder={"Enter Etsy Order ID"} autoFocus required value={form.orderId} onChange={e => handleFieldChange('orderId', e.target.value)} onInput={e => e.target.value = e.target.value.replace(/^\s+/, "")} />
              </div>
              <div className="form-group">
                <label htmlFor="customer">
                  {"Customer name"} <span style={{ color: "red" }}>*</span>
                </label>
                <input type="text" id="customer" name="customer" autoComplete="off" placeholder={"Enter Customer Name"} required value={form.customer} onChange={e => handleFieldChange('customer', e.target.value)} onInput={e => e.target.value = e.target.value.replace(/^\s+/, "")} />
              </div>
              <div className="form-group">
                <label htmlFor="orderDate">{"Order date"}</label>
                <input type="date" id="orderDate" name="orderDate" value={form.orderDate} onClick={openDatePicker} onChange={e => handleFieldChange('orderDate', e.target.value)} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="orderLink">{"Etsy order link"}</label>
                <input type="url" id="orderLink" name="orderLink" placeholder={"https://www.etsy.com/..."} value={form.orderLink} onChange={e => handleFieldChange('orderLink', e.target.value)} />
              </div>
            </div>

            <div className="form-row form-row-three">
              <div className="form-group">
                <label>{"Shop name"}</label>
                <Dropdown options={SHOP_OPTIONS} labelKey="label" valueKey="value" selectedValue={form.shopName} onValueChange={val => handleFieldChange('shopName', val)} placeholder={"Select shop"} showSearch={false} />
              </div>
              <div className="form-group">
                <label>{"Metal"}</label>
                <Dropdown options={METAL_OPTIONS} labelKey="label" valueKey="value" selectedValue={form.metal} onValueChange={val => handleFieldChange('metal', val)} placeholder={"Select metal"} showSearch={false} />
              </div>
              <div className="form-group">
                <label htmlFor="employee">{"Employee assigned"}</label>
                <input type="text" id="employee" name="employee" autoComplete="off" placeholder={"Employee name"} value={form.employee} onChange={e => handleFieldChange('employee', e.target.value)} />
              </div>
            </div>

            <h6 className="form-section-title">{"Production & customer communication"}</h6>
            <div className="form-row">
              <div className="form-group">
                <label>{"Current status"}</label>
                <Dropdown options={ALL_ORDER_STATUS_OPTIONS} labelKey="label" valueKey="value" selectedValue={form.status} onValueChange={val => handleFieldChange('status', val)} placeholder={"Order Received"} showSearch={false} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="conversation">{"Customer conversation"}</label>
                <textarea id="conversation" name="conversation" placeholder={"Add customer messages, promises, approvals and follow-up notes. Add newest notes at the top or bottom with dates."} value={form.conversation} onChange={e => handleFieldChange('conversation', e.target.value)} />
              </div>
            </div>

            <h6 className="form-section-title">{"Dispatch details"}</h6>
            <div className="form-row form-row-three">
              <div className="form-group">
                <label htmlFor="dispatchDate">{"Dispatch date"}</label>
                <input type="date" id="dispatchDate" name="dispatchDate" value={form.dispatchDate} onClick={openDatePicker} onChange={e => handleFieldChange('dispatchDate', e.target.value)} />
              </div>
              <div className="form-group">
                <label>{"Courier"}</label>
                <Dropdown options={COURIER_OPTIONS} labelKey="label" valueKey="value" selectedValue={form.courier} onValueChange={val => handleFieldChange('courier', val)} placeholder={"Select"} showSearch={false} />
              </div>
              <div className="form-group">
                <label htmlFor="tracking">{"Tracking number"}</label>
                <input type="text" id="tracking" name="tracking" autoComplete="off" placeholder={"Enter Tracking Number"} value={form.tracking} onChange={e => handleFieldChange('tracking', e.target.value)} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="trackingLink">{"Tracking link"}</label>
                <input type="url" id="trackingLink" name="trackingLink" placeholder={"https://..."} value={form.trackingLink} onChange={e => handleFieldChange('trackingLink', e.target.value)} />
              </div>
            </div>

            <div className="button-group">
              <button type="button" className="btn btn-secondary cancelbtn" onClick={handleCancel} disabled={isLoading}>
                {"Cancel"}
              </button>
              <button type="submit" className="btn btn-success submit-btn" disabled={isLoading}>
                {"Save"}
              </button>
            </div>
          </form>}
        </div>
      </div>
    </div>
  </>;
};

export default AddAllOrder;