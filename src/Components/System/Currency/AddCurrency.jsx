import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../../Middleware/Auth';
import WarningModal from '../../../Pages/Custom/WarningModal';
import "../../../Scss/System/Currency/addcurrency.scss";
import { Country } from 'country-state-city';
import Dropdown from '../../Dropdown/Dropdown';
import CheckToken from '../../../utils/CheckToken';
import HandleUnauthorized from '../../../utils/HandleUnauthorized';
const AddCurrency = () => {
  const navigate = useNavigate();
  const {
    logoutUser
  } = useAuth();
  const adminPanelBackendPath = import.meta.env.VITE_BACKEND_URL;
  const tokenname = import.meta.env.VITE_AdminTOKEN_NAME;
  const [warningMessage, setWarningMessage] = useState("");
  const [showWarning, setShowWarning] = useState(false);
  const token = localStorage.getItem(tokenname);
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [currencyName, setCurrencyName] = useState("");
  const [currencySymbol, setCurrencySymbol] = useState("");
  const [currencyPosition, setCurrencyPosition] = useState("");
  const [decimalValue, setDecimalValue] = useState("");
  const [thousandSeparator, setThousandSeparator] = useState("");
  const [decimalSeparator, setDecimalSeparator] = useState("");
  useEffect(() => {
    document.title = "Add Currency";
  }, []);
  const currencyPositions = [{
    id: "left",
    name: "Left"
  }, {
    id: "right",
    name: "Right"
  }, {
    id: "left-space",
    name: "Left with space"
  }, {
    id: "right-space",
    name: "Right with space"
  }];
  useEffect(() => {
    if (!CheckToken(token, logoutUser, navigate)) return;
    const allCountries = Country.getAllCountries().map(country => ({
      isoCode: country.isoCode,
      name: country.name
    }));
    setCountries(allCountries);
  }, [adminPanelBackendPath, token, logoutUser, navigate]);
  const handleWarningClose = () => setShowWarning(false);
  const handleSubmit = async e => {
    e.preventDefault();
    if (!CheckToken(token, logoutUser, navigate)) return;
    try {
      const selectedCountryName = countries.find(c => c.isoCode === selectedCountry)?.name || "";
      const currencyData = {
        currencyName,
        currencySymbol,
        currencyPosition,
        decimalValue,
        thousandSeparator,
        decimalSeparator,
        countryname: selectedCountryName
      };
      const response = await fetch(`${adminPanelBackendPath}/System/AddCurrency`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(currencyData)
      });
      const data = await response.json();
      if (HandleUnauthorized(data, logoutUser, navigate, response)) return;
      if (response.ok) {
        navigate(`/System/Currency`, {
          state: {
            message: "Currency added successfully"
          }
        });
      } else {
        const errorMessages = {
          "Country Name Already Exists": "Country name Already Exists",
          "All fields are required": "All fields are required",
          "Server error": "Server error"
        };
        setWarningMessage(errorMessages[data.message] || data.message || "Server error");
        setShowWarning(true);
      }
    } catch {
      setWarningMessage("Server error");
      setShowWarning(true);
    }
  };
  const handleCancel = () => navigate(`/System/Currency`);
  return <>
            {showWarning && <WarningModal message={warningMessage} onClose={handleWarningClose} />}
            <div className="AddCurrency-container ">
                <div className="Addcurrency-container">
                    <h6 className="Addcurrency-headingname">{"Add Currency"}</h6>
                    <div className="Addcurrency-form-container">
                        <form onSubmit={handleSubmit}>
                            <div className="form-row">
                                <div className="form-group">
                                    <Dropdown label={"Country Name"} options={countries} labelKey="name" valueKey="isoCode" selectedValue={selectedCountry} onValueChange={value => setSelectedCountry(value)} placeholder={"Select a Country Name"} />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="currencyName">{"Currency Name"}</label>
                                    <input type="text" id="currencyName" placeholder={"Enter Currency Name"} required autoComplete="off" value={currencyName} onChange={e => {
                  const value = e.target.value;
                  if (value.length === 1 && value === " ") return;
                  setCurrencyName(value);
                }} />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="currencySymbol">{"Currency Symbol"}</label>
                                    <input type="text" id="currencySymbol" placeholder={"Enter Currency Symbol"} required autoComplete="off" value={currencySymbol} onChange={e => {
                  const value = e.target.value;
                  if (value.length === 1 && value === " ") return;
                  setCurrencySymbol(value);
                }} />
                                </div>
                                <div className="form-group">
                                    <Dropdown label={"Currency Position"} options={currencyPositions} labelKey="name" valueKey="id" selectedValue={currencyPosition} onValueChange={value => setCurrencyPosition(value)} placeholder={"Select Currency Position"} />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="decimalValue">{"Decimal Places"}</label>
                                    <input type="number" id="decimalValue" placeholder={"Enter Decimal Places"} min="0" max="10" required autoComplete="off" value={decimalValue} onChange={e => {
                  const value = e.target.value;
                  if (/^\d*$/.test(value)) {
                    setDecimalValue(value);
                  }
                }} />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="thousandSeparator">{"Thousand Separator"}</label>
                                    <input type="text" id="thousandSeparator" placeholder={"Enter Thousand Separator"} required maxLength="1" autoComplete="off" value={thousandSeparator} onChange={e => {
                  const value = e.target.value;
                  if (value.length === 1 && value === " ") return;
                  setThousandSeparator(value);
                }} />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="decimalSeparator">{"Decimal Separator"}</label>
                                    <input type="text" id="decimalSeparator" placeholder={"Enter Decimal Separator"} required maxLength="1" autoComplete="off" value={decimalSeparator} onChange={e => {
                  const value = e.target.value;
                  if (value.length === 1 && value === " ") return;
                  setDecimalSeparator(value);
                }} />
                                </div>
                            </div>
                            <div className="button-group">
                                <button type="button" className="btn btn-secondary cancelbtn" onClick={handleCancel}>
                                    {"Cancel"}
                                </button>
                                <button type="submit" className="btn btn-success submit-btn">
                                    {"Save"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>;
};
export default AddCurrency;