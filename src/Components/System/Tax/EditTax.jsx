import CustomSwitch from '../../../Pages/Custom/CustomSwitch';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from '../../../Middleware/Auth';
import LoadingSpinner from '../../../Pages/Custom/LoadingSpinner';
import WarningModal from '../../../Pages/Custom/WarningModal';
import "../../../Scss/System/Tax/addtax.scss";
import CheckToken from '../../../utils/CheckToken';
import HandleUnauthorized from '../../../utils/HandleUnauthorized';
import { Country } from 'country-state-city';
import Dropdown from '../../Dropdown/Dropdown';
const EditTax = () => {
  const {
    id
  } = useParams();
  const navigate = useNavigate();
  const {
    logoutUser
  } = useAuth();
  const adminPanelBackendPath = import.meta.env.VITE_BACKEND_URL;
  const tokenName = import.meta.env.VITE_AdminTOKEN_NAME;
  const token = localStorage.getItem(tokenName);
  const [warningMessage, setWarningMessage] = useState("");
  const [showWarning, setShowWarning] = useState(false);
  const [formData, setFormData] = useState({
    taxname: "",
    taxtype: "fixed",
    price: "",
    taxcomputation: "exclusive",
    country: ""
  });
  const [status, setStatus] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [countries, setCountries] = useState([]);
  useEffect(() => {
    document.title = "Edit Tax";
  }, []);
  useEffect(() => {
    const allCountries = Country.getAllCountries().map(country => ({
      value: country.name,
      label: country.name
    }));
    setCountries(allCountries);
  }, []);
  const handleCountryChange = val => {
    setFormData(prev => ({
      ...prev,
      country: val
    }));
  };
  useEffect(() => {
    setIsLoading(true);
    if (!CheckToken(token, logoutUser, navigate)) return;
    const fetchTaxDetails = async () => {
      try {
        const response = await fetch(`${adminPanelBackendPath}/System/EditTax/${id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const result = await response.json();
        if (HandleUnauthorized(result, logoutUser, navigate)) return;
        if (response.ok) {
          setFormData({
            taxname: result.taxname || "",
            taxtype: result.taxtype || "fixed",
            price: result.price ?? "",
            taxcomputation: result.taxcomputation || "exclusive",
            country: result.country || ""
          });
          setStatus(result.status || false);
        } else {
          const errorMessages = {
            "Tax not found": "Tax not found",
            "Server error": "Server error"
          };
          setWarningMessage(errorMessages[result.message] || "Server error");
          setShowWarning(true);
        }
      } catch {
        setWarningMessage("Server error");
        setShowWarning(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTaxDetails();
  }, [id, token, navigate, logoutUser, adminPanelBackendPath]);
  const handleSwitchChange = event => setStatus(event.target.checked);
  const handleInputChange = e => {
    const {
      name,
      value
    } = e.target;
    if (name === "price") {
      let newValue = value.replace(/^\s+/, "");
      if (formData.taxtype === "percentage" && parseFloat(newValue) > 99) newValue = "";
      setFormData({
        ...formData,
        [name]: newValue
      });
    } else setFormData({
      ...formData,
      [name]: value
    });
  };
  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.country) {
      setWarningMessage("All fields are required");
      setShowWarning(true);
      return;
    }
    setIsLoading(true);
    if (!CheckToken(token, logoutUser, navigate)) return;
    try {
      const response = await fetch(`${adminPanelBackendPath}/System/UpdateTax/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          status: status
        })
      });
      const result = await response.json();
      if (HandleUnauthorized(result, logoutUser, navigate)) return;
      if (response.ok) navigate(`/System/Taxes`, {
        state: {
          message: "Tax updated successfully"
        }
      });else {
        const errorMessages = {
          "All fields are required": "All fields are required",
          "Tax Name Already Exists": "Tax name Already Exists",
          "Tax not found": "Tax not found",
          "Server error": "Server error"
        };
        setWarningMessage(errorMessages[result.message] || "Server error");
        setShowWarning(true);
      }
    } catch {
      setWarningMessage("Server error");
      setShowWarning(true);
    } finally {
      setIsLoading(false);
    }
  };
  const handleCancel = () => navigate(`/System/Taxes`);
  return <>
            {showWarning && <WarningModal message={warningMessage} onClose={() => setShowWarning(false)} />}
            <div className="AddTax-container">
                <div className="Addtax-container">
                    <h6 className="Addtax-headingname">{"Edit Tax"}</h6>
                    <div className="Addtax-form-container">
                        {isLoading ? <LoadingSpinner /> : <form onSubmit={handleSubmit}>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="taxname">{"Tax Name"} <span style={{
                    color: "red"
                  }}>*</span></label>
                                        <input type="text" id="taxname" name="taxname" autoComplete="off" placeholder={"Enter Tax Name"} required value={formData.taxname} onChange={handleInputChange} onInput={e => e.target.value = e.target.value.replace(/^\s+/, "")} />
                                    </div>
                                    <div className="form-group">
                                        <Dropdown label={<>{"Country"} <span style={{
                    color: "red"
                  }}>*</span></>} options={countries} selectedValue={formData.country} onValueChange={handleCountryChange} labelKey="label" valueKey="value" placeholder={"Select Country"} />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>{"Tax Type"}</label>
                                        <div className="radio-group">
                                            <label className="radio-label">
                                                <input type="radio" name="taxtype" value="fixed" checked={formData.taxtype === "fixed"} onChange={handleInputChange} />
                                                {"Fixed"}
                                            </label>
                                            <label className="radio-label">
                                                <input type="radio" name="taxtype" value="percentage" checked={formData.taxtype === "percentage"} onChange={handleInputChange} />
                                                {"Percentage"}
                                            </label>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>{"Tax Computation"}</label>
                                        <div className="radio-group">
                                            <label className="radio-label">
                                                <input type="radio" name="taxcomputation" value="exclusive" checked={formData.taxcomputation === "exclusive"} onChange={handleInputChange} />
                                                {"Exclusive"}
                                            </label>
                                            <label className="radio-label">
                                                <input type="radio" name="taxcomputation" value="inclusive" checked={formData.taxcomputation === "inclusive"} onChange={handleInputChange} />
                                                {"Inclusive"}
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="price">
                                            {"Price"} {formData.taxtype === "percentage" && <span className="percentage-sign"> (%)</span>}
                                        </label>
                                        <input type="number" id="price" name="price" autoComplete="off" placeholder={"Enter Price"} required value={formData.price} onChange={handleInputChange} onInput={e => e.target.value = e.target.value.replace(/^\s+/, "")} />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="status">{"Status"}</label>
                                        <CustomSwitch checked={status} onChange={handleSwitchChange} />
                                    </div>
                                </div>
                                <div className="button-group">
                                    <button type="button" className="btn btn-secondary cancelbtn" onClick={handleCancel} disabled={isLoading}>{"Cancel"}</button>
                                    <button type="submit" className="btn btn-success submit-btn" disabled={isLoading}>{"Save"}</button>
                                </div>
                            </form>}
                    </div>
                </div>
            </div>
        </>;
};
export default EditTax;