import { useEffect, useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from '../../../Middleware/Auth';
import LoadingSpinner from '../../../Pages/Custom/LoadingSpinner';
import WarningModal from '../../../Pages/Custom/WarningModal';
import CustomSwitch from '../../../Pages/Custom/CustomSwitch';
import Dropdown from '../../Dropdown/Dropdown';
import "../../../Scss/System/FAQ/addfaq.scss";
import { useLanguage } from "../../../Context/LanguageContext";
import CheckToken from '../../../utils/CheckToken';
import HandleUnauthorized from '../../../utils/HandleUnauthorized';

const EditFAQ = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { translations, isRtl } = useLanguage();
    const { logoutUser } = useAuth();
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

    const faqTypeOptions = [
        { value: "Shipping policy", label: translations.shippingpolicy || "Shipping policy" },
        { value: "Returns and exchanges", label: translations.returnsandexchanges || "Returns and exchanges" },
        { value: "Frequently asked questions", label: translations.frequentlyaskedquestions || "Frequently asked questions" }
    ];

    useEffect(() => {
        if (translations.editfaq) document.title = translations.editfaq;
    }, [translations]);

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
                    headers: { Authorization: `Bearer ${token}` }
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
                        "FAQ not found": translations.faqnotfound || "FAQ not found",
                        "Server error": translations.servererror
                    };
                    setWarningMessage(errorMessages[result.message] || translations.servererror);
                    setShowWarning(true);
                }
            } catch {
                setWarningMessage(translations.servererror);
                setShowWarning(true);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDetails();
    }, [id, token, adminPanelBackendPath, logoutUser, navigate, translations]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!faqType || !question.trim() || !answer.trim()) {
            setWarningMessage(translations.allfieldrequired || "All fields are required");
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
                body: JSON.stringify(payload),
            });

            const result = await response.json();
            if (HandleUnauthorized(result, logoutUser, navigate)) return;

            if (response.ok) {
                navigate("/Support/FAQ", {
                    state: { message: translations.updatefaqsuccessfull || "FAQ updated successfully" }
                });
            } else {
                const errorMessages = {
                    "All fields are required": translations.allfieldrequired || "All fields are required",
                    "FAQ Already Exists": translations.faqalreadyexists || "FAQ with this question already exists",
                    "FAQ not found": translations.faqnotfound || "FAQ not found",
                    "Server error": translations.servererror
                };
                setWarningMessage(errorMessages[result.message] || translations.servererror);
                setShowWarning(true);
            }
        } catch {
            setWarningMessage(translations.servererror);
            setShowWarning(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => navigate(`/Support/FAQ`);

    return (
        <>
            {showWarning && <WarningModal message={warningMessage} onClose={() => setShowWarning(false)} />}
            <div className={`AddFAQ-container ${isRtl ? 'rtl-addfaq' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
                <div className="Addfaq-container">
                    <h6 className="Addfaq-headingname">{translations.editfaq || "Edit FAQ"}</h6>
                    <div className="Addfaq-form-container">
                        {isLoading ? (
                            <LoadingSpinner />
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <div className="form-row">
                                    <div className="form-group">
                                        <Dropdown
                                            label={<>{translations.faqtype || "FAQ Type"} <span style={{ color: "red" }}>*</span></>}
                                            options={faqTypeOptions}
                                            selectedValue={faqType}
                                            onValueChange={(val) => setFaqType(val)}
                                            labelKey="label"
                                            valueKey="value"
                                            placeholder={translations.selectfaqtype || "Select FAQ Type"}
                                            showSearch={false}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="status">{translations.status || "Status"}</label>
                                        <div className="switch-container">
                                            <CustomSwitch
                                                checked={status}
                                                onChange={(e) => setStatus(e.target.checked)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="form-row full-width">
                                    <div className="form-group">
                                        <label htmlFor="question">
                                            {translations.question || "Question"} <span style={{ color: "red" }}>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="question"
                                            name="question"
                                            autoComplete="off"
                                            placeholder={translations.enterquestion || "Enter Question"}
                                            required
                                            value={question}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (value.length === 1 && value === " ") return;
                                                setQuestion(value);
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="form-row full-width">
                                    <div className="form-group">
                                        <label htmlFor="answer">
                                            {translations.answer || "Answer"} <span style={{ color: "red" }}>*</span>
                                        </label>
                                        <textarea
                                            id="answer"
                                            name="answer"
                                            rows="5"
                                            autoComplete="off"
                                            placeholder={translations.enteranswer || "Enter Answer"}
                                            required
                                            value={answer}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (value.length === 1 && value === " ") return;
                                                setAnswer(value);
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="button-group">
                                    <button
                                        type="button"
                                        className="btn btn-secondary cancelbtn"
                                        onClick={handleCancel}
                                        disabled={isLoading}
                                    >
                                        {translations.cancel}
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-success submit-btn"
                                        disabled={isLoading}
                                    >
                                        {translations.save}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default EditFAQ;
