import { useEffect, useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from '../../../Middleware/Auth';
import { useFiscalYear } from '../../../Context/FiscalYearContext';
import LoadingSpinner from '../../../Pages/Custom/LoadingSpinner';
import WarningModal from '../../../Pages/Custom/WarningModal';
import Dropdown from '../../Dropdown/Dropdown';
import CheckToken from '../../../utils/CheckToken';
import HandleUnauthorized from '../../../utils/HandleUnauthorized';
import {
  ALL_ORDER_STATUS_OPTIONS,
  CENTER_CARAT_OPTIONS,
  COUNTRY_OPTIONS,
  COURIER_OPTIONS,
  INITIAL_ALL_ORDER_FORM,
  JEWELRY_TYPE_OPTIONS,
  METAL_OPTIONS,
  PRIORITY_OPTIONS,
  SHOP_OPTIONS,
  SIDE_STONE_OPTIONS,
  STONE_SHAPE_OPTIONS,
  STONE_TYPE_OPTIONS,
  buildAllOrderFormData,
  validateAllOrderForm
} from '../../../utils/allOrderHelpers';
import "../../../Scss/Home/Order/addallorder.scss";

const EditAllOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { logoutUser } = useAuth();
  const { selectedFiscalYear } = useFiscalYear();
  const adminPanelBackendPath = import.meta.env.VITE_BACKEND_URL;
  const tokenname = import.meta.env.VITE_AdminTOKEN_NAME;
  const token = localStorage.getItem(tokenname);

  const [form, setForm] = useState(INITIAL_ALL_ORDER_FORM);
  const [files, setFiles] = useState({ photoFile: null, cadFile: null, otherFile: null });
  const [existingFiles, setExistingFiles] = useState({ photoFile: null, cadFile: null, otherFile: null });
  const [warningMessage, setWarningMessage] = useState("");
  const [showWarning, setShowWarning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = "Edit Order";
  }, []);

  useEffect(() => {
    if (!CheckToken(token, logoutUser, navigate)) return;
    let isMounted = true;

    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(`${adminPanelBackendPath}/Main/EditAllOrder/${id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        const data = await response.json();
        if (HandleUnauthorized(data, logoutUser, navigate)) return;
        if (!isMounted) return;

        if (response.ok && data.order) {
          const ord = data.order;
          setForm({
            orderId: ord.orderId || "",
            customer: ord.customer || "",
            orderDate: ord.orderDate || "",
            orderLink: ord.orderLink || "",
            shopName: ord.shopName || "",
            country: ord.country || "",
            jewelryType: ord.jewelryType || "",
            product: ord.product || "",
            metal: ord.metal || "",
            ringSize: ord.ringSize || "",
            stoneType: ord.stoneType || "",
            stoneShape: ord.stoneShape || "",
            centerCarat: ord.centerCarat || "",
            sideStoneType: ord.sideStoneType || "",
            measurements: ord.measurements || "",
            employee: ord.employee || "",
            stone: ord.stone || "",
            status: ord.status || "Order Received",
            targetDate: ord.targetDate || "",
            priority: ord.priority || "Normal",
            productionNotes: ord.productionNotes || "",
            conversation: ord.conversation || "",
            totalAmount: ord.totalAmount != null ? String(ord.totalAmount) : "",
            paidAmount: ord.paidAmount != null ? String(ord.paidAmount) : "",
            dispatchDate: ord.dispatchDate || "",
            courier: ord.courier || "",
            tracking: ord.tracking || "",
            trackingLink: ord.trackingLink || "",
            deliveryDate: ord.deliveryDate || "",
            dispatchNotes: ord.dispatchNotes || ""
          });
          setExistingFiles({
            photoFile: ord.photoFile || null,
            cadFile: ord.cadFile || null,
            otherFile: ord.otherFile || null
          });
        } else {
          setWarningMessage(data.message || "Order not found");
          setShowWarning(true);
        }
      } catch {
        if (isMounted) {
          setWarningMessage("Server error");
          setShowWarning(true);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchOrderDetails();
    return () => {
      isMounted = false;
    };
  }, [adminPanelBackendPath, id, logoutUser, navigate, token]);

  const handleFieldChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (field, file) => {
    setFiles(prev => ({ ...prev, [field]: file || null }));
  };

  const balanceDue = Math.max(0, (Number(form.totalAmount) || 0) - (Number(form.paidAmount) || 0)).toFixed(2);
  const savedAttachments = [
    existingFiles.photoFile?.url ? { label: 'Photo', ...existingFiles.photoFile } : null,
    existingFiles.cadFile?.url ? { label: 'CAD', ...existingFiles.cadFile } : null,
    existingFiles.otherFile?.url ? { label: 'Document', ...existingFiles.otherFile } : null
  ].filter(Boolean);

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
      const formData = buildAllOrderFormData({ form, files, selectedFiscalYear });
      const response = await fetch(`${adminPanelBackendPath}/Main/UpdateAllOrder/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });
      const result = await response.json();
      if (HandleUnauthorized(result, logoutUser, navigate)) return;
      if (response.ok) {
        navigate('/Home/AllOrder', {
          state: {
            message: result.message || "Order updated successfully"
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
    <div className="EditAllOrder-container ">
      <div className="Editallorder-container">
        <h6 className="Editallorder-headingname">{"Edit Order"}</h6>
        <div className="Editallorder-form-container">
          {isLoading ? <LoadingSpinner /> : <form onSubmit={handleSubmit}>
            {/* Section 1: Order details */}
            <h6 className="form-section-title">{"Order details"}</h6>
            <div className="form-row form-row-three">
              <div className="form-group">
                <label htmlFor="orderId">
                  {"Etsy Order ID"} <span style={{ color: "red" }}>*</span>
                </label>
                <input type="text" id="orderId" name="orderId" autoComplete="off" required value={form.orderId} onChange={e => handleFieldChange('orderId', e.target.value)} onInput={e => e.target.value = e.target.value.replace(/^\s+/, "")} />
              </div>
              <div className="form-group">
                <label htmlFor="customer">
                  {"Customer name"} <span style={{ color: "red" }}>*</span>
                </label>
                <input type="text" id="customer" name="customer" autoComplete="off" required value={form.customer} onChange={e => handleFieldChange('customer', e.target.value)} onInput={e => e.target.value = e.target.value.replace(/^\s+/, "")} />
              </div>
              <div className="form-group">
                <label htmlFor="orderDate">{"Order date"}</label>
                <input type="date" id="orderDate" name="orderDate" value={form.orderDate} onChange={e => handleFieldChange('orderDate', e.target.value)} />
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
                <label>{"Country"}</label>
                <Dropdown options={COUNTRY_OPTIONS} labelKey="label" valueKey="value" selectedValue={form.country} onValueChange={val => handleFieldChange('country', val)} placeholder={"Select country"} showSearch={false} />
              </div>
              <div className="form-group">
                <label>{"Jewelry type"}</label>
                <Dropdown options={JEWELRY_TYPE_OPTIONS} labelKey="label" valueKey="value" selectedValue={form.jewelryType} onValueChange={val => handleFieldChange('jewelryType', val)} placeholder={"Select type"} showSearch={false} />
              </div>
            </div>

            <div className="form-row form-row-three">
              <div className="form-group">
                <label htmlFor="product">{"Product / design name"}</label>
                <input type="text" id="product" name="product" autoComplete="off" value={form.product} onChange={e => handleFieldChange('product', e.target.value)} />
              </div>
              <div className="form-group">
                <label>{"Metal"}</label>
                <Dropdown options={METAL_OPTIONS} labelKey="label" valueKey="value" selectedValue={form.metal} onValueChange={val => handleFieldChange('metal', val)} placeholder={"Select metal"} showSearch={false} />
              </div>
              <div className="form-group">
                <label htmlFor="ringSize">{"Ring size"}</label>
                <input type="text" id="ringSize" name="ringSize" autoComplete="off" value={form.ringSize} onChange={e => handleFieldChange('ringSize', e.target.value)} />
              </div>
            </div>

            <div className="form-row form-row-three">
              <div className="form-group">
                <label>{"Center stone type"}</label>
                <Dropdown options={STONE_TYPE_OPTIONS} labelKey="label" valueKey="value" selectedValue={form.stoneType} onValueChange={val => handleFieldChange('stoneType', val)} placeholder={"Select stone type"} showSearch={false} />
              </div>
              <div className="form-group">
                <label>{"Center stone shape"}</label>
                <Dropdown options={STONE_SHAPE_OPTIONS} labelKey="label" valueKey="value" selectedValue={form.stoneShape} onValueChange={val => handleFieldChange('stoneShape', val)} placeholder={"Select shape"} showSearch={false} />
              </div>
              <div className="form-group">
                <label>{"Center carat"}</label>
                <Dropdown options={CENTER_CARAT_OPTIONS} labelKey="label" valueKey="value" selectedValue={form.centerCarat} onValueChange={val => handleFieldChange('centerCarat', val)} placeholder={"Select carat"} showSearch={false} />
              </div>
            </div>

            <div className="form-row form-row-three">
              <div className="form-group">
                <label>{"Side stone type"}</label>
                <Dropdown options={SIDE_STONE_OPTIONS} labelKey="label" valueKey="value" selectedValue={form.sideStoneType} onValueChange={val => handleFieldChange('sideStoneType', val)} placeholder={"Select side stone"} showSearch={false} />
              </div>
              <div className="form-group">
                <label htmlFor="measurements">{"Stone measurements (mm)"}</label>
                <input type="text" id="measurements" name="measurements" autoComplete="off" placeholder={"10 × 7 × 4.5"} value={form.measurements} onChange={e => handleFieldChange('measurements', e.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="employee">{"Employee assigned"}</label>
                <input type="text" id="employee" name="employee" autoComplete="off" placeholder={"Employee name"} value={form.employee} onChange={e => handleFieldChange('employee', e.target.value)} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="stone">{"Other stone details / notes (legacy field)"}</label>
                <input type="text" id="stone" name="stone" autoComplete="off" placeholder={"Color, clarity, certificate, extra stone details"} value={form.stone} onChange={e => handleFieldChange('stone', e.target.value)} />
              </div>
            </div>

            {/* Section 2: Production & customer communication */}
            <h6 className="form-section-title">{"Production & customer communication"}</h6>
            <div className="form-row form-row-three">
              <div className="form-group">
                <label>{"Current status"}</label>
                <Dropdown options={ALL_ORDER_STATUS_OPTIONS} labelKey="label" valueKey="value" selectedValue={form.status} onValueChange={val => handleFieldChange('status', val)} placeholder={"Order Received"} showSearch={false} />
              </div>
              <div className="form-group">
                <label htmlFor="targetDate">{"Target completion date"}</label>
                <input type="date" id="targetDate" name="targetDate" value={form.targetDate} onChange={e => handleFieldChange('targetDate', e.target.value)} />
              </div>
              <div className="form-group">
                <label>{"Work priority"}</label>
                <Dropdown options={PRIORITY_OPTIONS} labelKey="label" valueKey="value" selectedValue={form.priority} onValueChange={val => handleFieldChange('priority', val)} placeholder={"Normal"} showSearch={false} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="productionNotes">{"Production notes"}</label>
                <textarea id="productionNotes" name="productionNotes" placeholder={"CAD approval, casting, setting instructions…"} value={form.productionNotes} onChange={e => handleFieldChange('productionNotes', e.target.value)} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="conversation">{"Customer conversation / message history"}</label>
                <textarea id="conversation" name="conversation" placeholder={"Add customer messages, promises, approvals and follow-up notes. Add newest notes at the top or bottom with dates."} value={form.conversation} onChange={e => handleFieldChange('conversation', e.target.value)} />
              </div>
            </div>

            {/* Section 3: Payment tracking */}
            <h6 className="form-section-title">{"Payment tracking"}</h6>
            <div className="form-row form-row-three">
              <div className="form-group">
                <label htmlFor="totalAmount">{"Total order amount"}</label>
                <input type="number" id="totalAmount" name="totalAmount" min="0" step="0.01" value={form.totalAmount} onChange={e => handleFieldChange('totalAmount', e.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="paidAmount">{"Amount paid"}</label>
                <input type="number" id="paidAmount" name="paidAmount" min="0" step="0.01" value={form.paidAmount} onChange={e => handleFieldChange('paidAmount', e.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="balanceDisplay">{"Balance due (auto-calculated)"}</label>
                <input type="text" id="balanceDisplay" className="readonly-total-input" readOnly placeholder={"0.00"} value={balanceDue} />
              </div>
            </div>

            {/* Section 4: Photos & CAD files */}
            <h6 className="form-section-title">{"Photos & CAD files"}</h6>
            <div className="form-row form-row-three">
              <div className="form-group">
                <label htmlFor="photoFile">{"Product / reference photo"}</label>
                <input type="file" id="photoFile" name="photoFile" accept="image/*" onChange={e => handleFileChange('photoFile', e.target.files?.[0])} />
              </div>
              <div className="form-group">
                <label htmlFor="cadFile">{"CAD / design file"}</label>
                <input type="file" id="cadFile" name="cadFile" accept=".stl,.obj,.3dm,.step,.stp,.pdf,.jpg,.jpeg,.png,.zip,.rar,.3mf" onChange={e => handleFileChange('cadFile', e.target.files?.[0])} />
              </div>
              <div className="form-group">
                <label htmlFor="otherFile">{"Other order document"}</label>
                <input type="file" id="otherFile" name="otherFile" onChange={e => handleFileChange('otherFile', e.target.files?.[0])} />
              </div>
            </div>
            <div className="attachments-info-row">
              {savedAttachments.length > 0 && (
                <div className="existing-files-links">
                  <span>{"Saved attachments:"}</span>
                  {savedAttachments.map((file, idx) => (
                    <a key={idx} href={file.url} target="_blank" rel="noopener noreferrer">
                      {file.label}: {file.name}
                    </a>
                  ))}
                </div>
              )}
              <div>{"Choose files to attach them to this order. Existing attachments stay saved unless you delete the order."}</div>
            </div>

            {/* Section 5: Dispatch details */}
            <h6 className="form-section-title">{"Dispatch details"}</h6>
            <div className="form-row form-row-three">
              <div className="form-group">
                <label htmlFor="dispatchDate">{"Dispatch date"}</label>
                <input type="date" id="dispatchDate" name="dispatchDate" value={form.dispatchDate} onChange={e => handleFieldChange('dispatchDate', e.target.value)} />
              </div>
              <div className="form-group">
                <label>{"Courier"}</label>
                <Dropdown options={COURIER_OPTIONS} labelKey="label" valueKey="value" selectedValue={form.courier} onValueChange={val => handleFieldChange('courier', val)} placeholder={"Select"} showSearch={false} />
              </div>
              <div className="form-group">
                <label htmlFor="tracking">{"Tracking number"}</label>
                <input type="text" id="tracking" name="tracking" autoComplete="off" value={form.tracking} onChange={e => handleFieldChange('tracking', e.target.value)} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="trackingLink">{"Tracking link"}</label>
                <input type="url" id="trackingLink" name="trackingLink" placeholder={"https://..."} value={form.trackingLink} onChange={e => handleFieldChange('trackingLink', e.target.value)} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="deliveryDate">{"Expected delivery date"}</label>
                <input type="date" id="deliveryDate" name="deliveryDate" value={form.deliveryDate} onChange={e => handleFieldChange('deliveryDate', e.target.value)} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="dispatchNotes">{"Dispatch / customer notes"}</label>
                <textarea id="dispatchNotes" name="dispatchNotes" value={form.dispatchNotes} onChange={e => handleFieldChange('dispatchNotes', e.target.value)} />
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

export default EditAllOrder;