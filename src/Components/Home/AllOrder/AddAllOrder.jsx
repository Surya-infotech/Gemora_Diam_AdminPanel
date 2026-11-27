import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { Country, State, City } from 'country-state-city';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../../Middleware/Auth';
import { useFiscalYear } from '../../../Context/FiscalYearContext';
import LoadingSpinner from '../../../Pages/Custom/LoadingSpinner';
import WarningModal from '../../../Pages/Custom/WarningModal';
import Dropdown from '../../Dropdown/Dropdown';
import CheckToken from '../../../utils/CheckToken';
import HandleUnauthorized from '../../../utils/HandleUnauthorized';
import { formatPriceWithCurrency } from '../../../utils/CurrencyFormatter';
import {
  ORDER_STATUS_OPTIONS,
  PAYMENT_METHOD_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
  applyCustomerSelection,
  applyProductSelectionToRow,
  buildAllOrderPayload,
  computeSubtotal,
  createEmptyItemRow,
  fetchAllOrderLookups,
  validateAllOrderFields
} from '../../../utils/allOrderHelpers';
import "../../../Scss/Home/Order/addallorder.scss";

const AddAllOrder = () => {
  const navigate = useNavigate();
  const { logoutUser } = useAuth();
  const { selectedFiscalYear } = useFiscalYear();
  const adminPanelBackendPath = import.meta.env.VITE_BACKEND_URL;
  const tokenname = import.meta.env.VITE_AdminTOKEN_NAME;
  const token = localStorage.getItem(tokenname);

  const [warningMessage, setWarningMessage] = useState("");
  const [showWarning, setShowWarning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [customers, setCustomers] = useState([]);
  const [catalogItems, setCatalogItems] = useState([]);
  const [activeCurrency, setActiveCurrency] = useState(null);

  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const [orderItems, setOrderItems] = useState([createEmptyItemRow()]);
  const [manualTotal, setManualTotal] = useState("");
  const [isTotalManuallyEdited, setIsTotalManuallyEdited] = useState(false);

  const [orderStatus, setOrderStatus] = useState("Confirmed");
  const [paymentStatus, setPaymentStatus] = useState("Paid");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState("");

  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [countryName, setCountryName] = useState("");
  const [stateCode, setStateCode] = useState("");
  const [stateName, setStateName] = useState("");
  const [cityName, setCityName] = useState("");

  useEffect(() => {
    document.title = "Add Order";
  }, []);

  useEffect(() => {
    if (!CheckToken(token, logoutUser, navigate)) return;
    let isMounted = true;
    const loadLookups = async () => {
      try {
        const result = await fetchAllOrderLookups({ adminPanelBackendPath, token, logoutUser, navigate });
        if (!isMounted || !result) return;
        setCustomers(result.customers);
        setCatalogItems(result.catalogItems);
        if (result.activeCurrency) setActiveCurrency(result.activeCurrency);
      } catch (err) {
        console.error("Error loading order lookups:", err);
      }
    };
    loadLookups();
    return () => {
      isMounted = false;
    };
  }, [adminPanelBackendPath, logoutUser, navigate, token]);

  const customerOptions = useMemo(() => [
    { label: "Manual / Walk-in Customer", value: "" },
    ...customers.map(c => ({
      label: `${c.fullname || "Customer"}${c.email ? ` (${c.email})` : ""}`,
      value: String(c.customerid)
    }))
  ], [customers]);

  const itemDropdownOptions = useMemo(() => [
    { label: "Custom Item (Manual Entry)", value: "" },
    ...catalogItems.map(it => ({
      label: `${it.itemname}${it.sku ? ` (${it.sku})` : ""}`,
      value: String(it.itemid)
    }))
  ], [catalogItems]);

  const countries = useMemo(() => Country.getAllCountries(), []);
  const states = useMemo(() => (countryCode ? State.getStatesOfCountry(countryCode) : []), [countryCode]);
  const cities = useMemo(() => (countryCode && stateCode ? City.getCitiesOfState(countryCode, stateCode) : []), [countryCode, stateCode]);

  const subtotal = useMemo(() => computeSubtotal(orderItems), [orderItems]);
  const displayedTotal = isTotalManuallyEdited ? manualTotal : subtotal.toFixed(2);

  const handleSelectCustomer = val => {
    setSelectedCustomerId(val);
    const matched = applyCustomerSelection(val, customers);
    if (!matched) return;
    setCustomerName(matched.customerName);
    setCustomerEmail(matched.customerEmail);
    setCustomerPhone(matched.customerPhone);
    if (matched.address !== undefined) setAddress(matched.address);
    if (matched.cityName !== undefined) setCityName(matched.cityName);
    if (matched.stateName !== undefined) setStateName(matched.stateName);
    if (matched.countryName !== undefined) setCountryName(matched.countryName);
    if (matched.countryCode !== undefined) setCountryCode(matched.countryCode);
    if (matched.stateCode !== undefined) setStateCode(matched.stateCode);
  };

  const handleItemFieldChange = (index, field, value) => {
    setOrderItems(prev => prev.map((row, idx) => (idx === index ? { ...row, [field]: value } : row)));
  };

  const handleSelectProduct = (index, itemIdStr) => {
    setOrderItems(prev => prev.map((row, idx) => (
      idx === index ? applyProductSelectionToRow(row, itemIdStr, catalogItems) : row
    )));
  };

  const handleAddItemRow = () => setOrderItems(prev => [...prev, createEmptyItemRow()]);

  const handleRemoveItemRow = index => {
    setOrderItems(prev => (prev.length > 1 ? prev.filter((_, idx) => idx !== index) : prev));
  };

  const handleCountryChange = code => {
    const c = countries.find(item => item.isoCode === code);
    setCountryCode(code || "");
    setCountryName(c?.name || "");
    setStateCode("");
    setStateName("");
    setCityName("");
  };

  const handleStateChange = code => {
    const s = states.find(item => item.isoCode === code);
    setStateCode(code || "");
    setStateName(s?.name || "");
    setCityName("");
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const validation = validateAllOrderFields({ customerName, orderItems });
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
      const payload = buildAllOrderPayload({
        selectedCustomerId,
        customerName,
        customerEmail,
        customerPhone,
        validItems: validation.validItems,
        displayedTotal,
        orderStatus,
        paymentStatus,
        paymentMethod,
        orderDate,
        notes,
        address,
        pincode,
        countryName,
        countryCode,
        stateName,
        stateCode,
        cityName,
        selectedFiscalYear
      });

      const response = await fetch(`${adminPanelBackendPath}/Main/AddAllOrder`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
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
            <div className="form-row">
              <div className="form-group">
                <label>{"Select Customer (Optional)"}</label>
                <Dropdown options={customerOptions} labelKey="label" valueKey="value" selectedValue={selectedCustomerId} onValueChange={handleSelectCustomer} placeholder={"Manual / Walk-in Customer"} />
              </div>
              <div className="form-group">
                <label htmlFor="customername">
                  {"Customer Name"} <span style={{ color: "red" }}>*</span>
                </label>
                <input type="text" id="customername" name="customername" autoComplete="off" placeholder={"Enter Customer Name"} autoFocus required value={customerName} onChange={e => {
                  const value = e.target.value;
                  if (value.length === 1 && value === " ") return;
                  setCustomerName(value);
                }} onInput={e => e.target.value = e.target.value.replace(/^\s+/, "")} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="customeremail">{"Customer Email"}</label>
                <input type="email" id="customeremail" name="customeremail" autoComplete="off" placeholder={"Enter Customer Email"} value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="customerphone">{"Customer Phone"}</label>
                <input type="text" id="customerphone" name="customerphone" autoComplete="off" placeholder={"Enter Customer Phone"} value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} />
              </div>
            </div>

            <div className="items-toolbar-row">
              <h6 className="items-section-label">{"Order Items"}</h6>
              <button type="button" className="add-item-btn" onClick={handleAddItemRow}>
                <AddIcon fontSize="small" />
                {"Add Item"}
              </button>
            </div>

            {orderItems.map((item, idx) => {
              const lineTotal = (Math.max(1, parseInt(item.qty, 10) || 1)) * (Math.max(0, Number(item.price) || 0));
              return <div key={idx} className="order-item-block">
                <div className="order-item-block-header">
                  <span className="item-index-label">Item #{idx + 1}</span>
                  {orderItems.length > 1 && <button type="button" className="remove-item-btn" onClick={() => handleRemoveItemRow(idx)}>
                    <DeleteIcon fontSize="small" />
                    {"Remove"}
                  </button>}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>{"Select Product (Optional)"}</label>
                    <Dropdown options={itemDropdownOptions} labelKey="label" valueKey="value" selectedValue={item.itemid != null ? String(item.itemid) : ""} onValueChange={val => handleSelectProduct(idx, val)} placeholder={"Custom Item (Manual Entry)"} />
                  </div>
                  <div className="form-group">
                    <label>
                      {"Item Name"} <span style={{ color: "red" }}>*</span>
                    </label>
                    <input type="text" placeholder={"Enter Item Name"} required value={item.itemname} onChange={e => handleItemFieldChange(idx, 'itemname', e.target.value)} />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>{"SKU"}</label>
                    <input type="text" placeholder={"Enter SKU"} value={item.sku} onChange={e => handleItemFieldChange(idx, 'sku', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>
                      {"Quantity"} <span style={{ color: "red" }}>*</span>
                    </label>
                    <input type="number" min="1" required value={item.qty} onChange={e => handleItemFieldChange(idx, 'qty', e.target.value)} />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>
                      {"Unit Price"} <span style={{ color: "red" }}>*</span>
                    </label>
                    <input type="number" min="0" step="0.01" placeholder={"0.00"} required value={item.price} onChange={e => handleItemFieldChange(idx, 'price', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>{"Line Total"}</label>
                    <input type="text" className="readonly-total-input" readOnly value={formatPriceWithCurrency(lineTotal, activeCurrency)} />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>{"Metal"}</label>
                    <input type="text" placeholder={"e.g. 14K White Gold"} value={item.metalname} onChange={e => handleItemFieldChange(idx, 'metalname', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>{"Shape"}</label>
                    <input type="text" placeholder={"e.g. Round"} value={item.shapename} onChange={e => handleItemFieldChange(idx, 'shapename', e.target.value)} />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>{"Ring Size"}</label>
                    <input type="text" placeholder={"e.g. 6"} value={item.ringsize} onChange={e => handleItemFieldChange(idx, 'ringsize', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>{"Closure Type"}</label>
                    <input type="text" placeholder={"e.g. Screw Back"} value={item.closuretype} onChange={e => handleItemFieldChange(idx, 'closuretype', e.target.value)} />
                  </div>
                </div>
              </div>;
            })}

            <div className="form-row form-row-three">
              <div className="form-group">
                <label>
                  {"Order Status"} <span style={{ color: "red" }}>*</span>
                </label>
                <Dropdown options={ORDER_STATUS_OPTIONS} labelKey="label" valueKey="value" selectedValue={orderStatus} onValueChange={val => setOrderStatus(val)} placeholder={"Select Order Status"} showSearch={false} />
              </div>
              <div className="form-group">
                <label>
                  {"Payment Status"} <span style={{ color: "red" }}>*</span>
                </label>
                <Dropdown options={PAYMENT_STATUS_OPTIONS} labelKey="label" valueKey="value" selectedValue={paymentStatus} onValueChange={val => setPaymentStatus(val)} placeholder={"Select Payment Status"} showSearch={false} />
              </div>
              <div className="form-group">
                <label>
                  {"Payment Method"} <span style={{ color: "red" }}>*</span>
                </label>
                <Dropdown options={PAYMENT_METHOD_OPTIONS} labelKey="label" valueKey="value" selectedValue={paymentMethod} onValueChange={val => setPaymentMethod(val)} placeholder={"Select Payment Method"} showSearch={false} />
              </div>
            </div>

            <div className="form-row form-row-three">
              <div className="form-group">
                <label htmlFor="orderdate">{"Order Date"}</label>
                <input type="date" id="orderdate" value={orderDate} onChange={e => setOrderDate(e.target.value)} />
              </div>
              <div className="form-group">
                <label>{"Subtotal"}</label>
                <input type="text" className="readonly-total-input" readOnly value={formatPriceWithCurrency(subtotal, activeCurrency)} />
              </div>
              <div className="form-group">
                <label htmlFor="total">
                  {"Total Amount"} <span style={{ color: "red" }}>*</span>
                </label>
                <input type="number" id="total" min="0" step="0.01" required value={displayedTotal} onChange={e => {
                  setIsTotalManuallyEdited(true);
                  setManualTotal(e.target.value);
                }} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="address">{"Shipping Address"}</label>
                <input type="text" id="address" placeholder={"Enter Address"} value={address} onChange={e => setAddress(e.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="pincode">{"Postal / PIN Code"}</label>
                <input type="text" id="pincode" placeholder={"Enter PIN Code"} value={pincode} onChange={e => setPincode(e.target.value)} />
              </div>
            </div>

            <div className="form-row form-row-three">
              <div className="form-group">
                <label>{"Country"}</label>
                <Dropdown options={countries} labelKey="name" valueKey="isoCode" selectedValue={countryCode} onValueChange={handleCountryChange} placeholder={"Select Country"} />
              </div>
              <div className="form-group">
                <label>{"State"}</label>
                <Dropdown options={states} labelKey="name" valueKey="isoCode" selectedValue={stateCode} onValueChange={handleStateChange} placeholder={"Select State"} disabled={!countryCode || states.length === 0} />
              </div>
              <div className="form-group">
                <label>{"City"}</label>
                <Dropdown options={cities} labelKey="name" valueKey="name" selectedValue={cityName} onValueChange={val => setCityName(val || "")} placeholder={"Select City"} disabled={!stateCode || cities.length === 0} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="notes">{"Notes"}</label>
                <textarea id="notes" placeholder={"Optional order notes or special instructions"} value={notes} onChange={e => setNotes(e.target.value)} />
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