import { useEffect, useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from '../../../Middleware/Auth';
import LoadingSpinner from '../../../Pages/Custom/LoadingSpinner';
import WarningModal from '../../../Pages/Custom/WarningModal';
import CustomSwitch from '../../../Pages/Custom/CustomSwitch';
import Dropdown from '../../Dropdown/Dropdown';
import "../../../Scss/Support/FAQ/addfaq.scss";
import CheckToken from '../../../utils/CheckToken';
import HandleUnauthorized from '../../../utils/HandleUnauthorized';
const EditFAQ = () => {
  const {
    id
  } = useParams();
  const navigate = useNavigate();
  const {
    logoutUser
  } = useAuth();
  const adminPanelBackendPath = import.meta.env.VITE_BACKEND_URL;
  const tokenname = import.meta.env.VITE_AdminTOKEN_NAME;
  const [warningMessage, setWarningMessage] = useState("");
  const [showWarning, setShowWarning] = useState(false);
  const token = localStorage.getItem(tokenname);
  const [faqType, setFaqType] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [status, setStatus] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const faqTypeOptions = [{
    value: "Shipping policy",
    label: "Shipping policy"
  }, {
    value: "Returns and exchanges",
    label: "Returns and exchanges"
  }, {
    value: "Frequently asked questions",
    label: "Frequently asked questions"
  }];
  useEffect(() => {
    document.title = "Edit FAQ";
  }, []);
  useEffect(() => {
    const fetchDetails = async () => {
      setIsLoading(true);
      if (!CheckToken(token, logoutUser, navigate)) {
        setIsLoading(false);
        return;
      }
      try {
        const response = await fetch(`${adminPanelBackendPath}/Support/EditFAQ/${id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const result = await response.json();
        if (HandleUnauthorized(result, logoutUser, navigate)) return;
        if (response.ok) {
          setFaqType(result.faqtype || "");
          setQuestion(result.question || "");
          setAnswer(result.answer || "");
          setStatus(Boolean(result.status));
        } else {
          const errorMessages = {
            "FAQ not found": "FAQ not found",
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
    fetchDetails();
  }, [id, token, adminPanelBackendPath, logoutUser, navigate]);
  const handleSubmit = async e => {
    e.preventDefault();
    if (!faqType || !question.trim() || !answer.trim()) {
      setWarningMessage("All fields are required");
      setShowWarning(true);
      return;
    }
    setIsLoading(true);
    if (!CheckToken(token, logoutUser, navigate)) {
      setIsLoading(false);
      return;
    }
    try {
      const payload = {
        faqtype: faqType,
        question: question.trim(),
        answer: answer.trim(),
        status
      };
      const response = await fetch(`${adminPanelBackendPath}/Support/UpdateFAQ/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (HandleUnauthorized(result, logoutUser, navigate)) return;
      if (response.ok) {
        navigate("/Support/FAQ", {
          state: {
            message: "FAQ updated successfully"
          }
        });
      } else {
        const errorMessages = {
          "All fields are required": "All fields are required",
          "FAQ Already Exists": "FAQ with this question already exists",
          "FAQ not found": "FAQ not found",
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
  const handleCancel = () => navigate(`/Support/FAQ`);
  return <>
            {showWarning && <WarningModal message={warningMessage} onClose={() => setShowWarning(false)} />}
            <div className="AddFAQ-container ">
                <div className="Addfaq-container">
                    <h6 className="Addfaq-headingname">{"Edit FAQ"}</h6>
                    <div className="Addfaq-form-container">
                        {isLoading ? <LoadingSpinner /> : <form onSubmit={handleSubmit}>
                                <div className="form-row">
                                    <div className="form-group">
                                        <Dropdown label={<>{"FAQ Type"} <span style={{
                    color: "red"
                  }}>*</span></>} options={faqTypeOptions} selectedValue={faqType} onValueChange={val => setFaqType(val)} labelKey="label" valueKey="value" placeholder={"Select FAQ Type"} showSearch={false} />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="status">{"Status"}</label>
                                        <div className="switch-container">
                                            <CustomSwitch checked={status} onChange={e => setStatus(e.target.checked)} />
                                        </div>
                                    </div>
                                </div>

                                <div className="form-row full-width">
                                    <div className="form-group">
                                        <label htmlFor="question">
                                            {"Question"} <span style={{
                    color: "red"
                  }}>*</span>
                                        </label>
                                        <input type="text" id="question" name="question" autoComplete="off" placeholder={"Enter Question"} required value={question} onChange={e => {
                  const value = e.target.value;
                  if (value.length === 1 && value === " ") return;
                  setQuestion(value);
                }} />
                                    </div>
                                </div>

                                <div className="form-row full-width">
                                    <div className="form-group">
                                        <label htmlFor="answer">
                                            {"Answer"} <span style={{
                    color: "red"
                  }}>*</span>
                                        </label>
                                        <textarea id="answer" name="answer" rows="5" autoComplete="off" placeholder={"Enter Answer"} required value={answer} onChange={e => {
                  const value = e.target.value;
                  if (value.length === 1 && value === " ") return;
                  setAnswer(value);
                }} />
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
export default EditFAQ;