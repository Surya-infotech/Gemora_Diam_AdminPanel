import { useEffect, useRef, useState } from 'react';
import { useNavigate } from "react-router-dom";
import Placeholder from '../../../assets/placeholder.png';
import { useAuth } from '../../../Middleware/Auth';
import LoadingSpinner from '../../../Pages/Custom/LoadingSpinner';
import WarningModal from '../../../Pages/Custom/WarningModal';
import "../../../Scss/Support/CollectionBanner/addcollectionbanner.scss";
import CheckToken from '../../../utils/CheckToken';
import HandleUnauthorized from '../../../utils/HandleUnauthorized';
const AddCollectionBanner = () => {
  const navigate = useNavigate();
  const {
    logoutUser
  } = useAuth();
  const adminPanelBackendPath = import.meta.env.VITE_BACKEND_URL;
  const tokenname = import.meta.env.VITE_AdminTOKEN_NAME;
  const [warningMessage, setWarningMessage] = useState("");
  const [showWarning, setShowWarning] = useState(false);
  const token = localStorage.getItem(tokenname);
  const fileInputRef = useRef(null);
  const [tag, setTag] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [buttonText, setButtonText] = useState("");
  const [buttonLink, setButtonLink] = useState("");
  const [position, setPosition] = useState("");
  const [order, setOrder] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState(Placeholder);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    if ("Add Collection Banner") {
      document.title = "Add Collection Banner";
    }
  }, []);
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  const handleFileChange = e => {
    const file = e.target.files[0];
    if (file) {
      const allowed = ["jpg", "jpeg", "png", "webp"];
      const ext = file.name.split('.').pop().toLowerCase();
      if (!allowed.includes(ext)) {
        setWarningMessage("Invalid file extension. Only JPG, JPEG, PNG files are allowed.");
        setShowWarning(true);
        e.target.value = '';
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setWarningMessage("File size too large. Maximum size is 10MB.");
        setShowWarning(true);
        e.target.value = '';
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };
  const handleSubmit = async e => {
    e.preventDefault();
    if (!title.trim()) {
      setWarningMessage("All fields are required");
      setShowWarning(true);
      return;
    }
    if (!imageFile && !imageUrl.trim()) {
      setWarningMessage("Banner image is required");
      setShowWarning(true);
      return;
    }
    setIsLoading(true);
    if (!CheckToken(token, logoutUser, navigate)) {
      setIsLoading(false);
      return;
    }
    try {
      const formData = new FormData();
      formData.append("tag", tag.trim());
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("buttonText", buttonText.trim());
      formData.append("buttonLink", buttonLink.trim());
      formData.append("position", position || "left");
      formData.append("order", order ? String(order) : "1");
      if (imageFile) {
        formData.append("image", imageFile);
      } else if (imageUrl.trim()) {
        formData.append("image", imageUrl.trim());
      }
      const response = await fetch(`${adminPanelBackendPath}/Support/AddCollectionBanner`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });
      const result = await response.json();
      if (HandleUnauthorized(result, logoutUser, navigate)) return;
      if (response.ok) {
        navigate("/Support/CollectionBanner", {
          state: {
            message: "Collection Banner added successfully"
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
  const handleCancel = () => navigate(`/Support/CollectionBanner`);
  return <>
            {showWarning && <WarningModal message={warningMessage} onClose={() => setShowWarning(false)} />}
            <div className="AddCollectionBanner-container ">
                <div className="Addcollectionbanner-container">
                    <h6 className="Addcollectionbanner-headingname">{"Add Collection Banner"}</h6>
                    <div className="Addcollectionbanner-form-container">
                        {isLoading ? <LoadingSpinner /> : <form onSubmit={handleSubmit}>
                                <div className="imageflex">
                                    <div className="formdiv">
                                        <div className="form-group">
                                            <label htmlFor="tag">
                                                {"Eyebrow / Tag"}
                                            </label>
                                            <input type="text" id="tag" name="tag" autoComplete="off" placeholder={"e.g. FEATURED ATELIER"} value={tag} onChange={e => {
                    const value = e.target.value;
                    if (value.length === 1 && value === " ") return;
                    setTag(value);
                  }} />
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="title">
                                                {"Title"} <span style={{
                      color: "red"
                    }}>*</span>
                                            </label>
                                            <input type="text" id="title" name="title" autoComplete="off" placeholder={"e.g. Bracelets Collection"} required value={title} onChange={e => {
                    const value = e.target.value;
                    if (value.length === 1 && value === " ") return;
                    setTitle(value);
                  }} />
                                        </div>
                                    </div>

                                    <div className="imagediv">
                                        <div className="form-group">
                                            <div className="imgpreview">
                                                <div className="image-preview-container">
                                                    <img src={imagePreview} alt={"Banner Preview"} className="image-preview" onError={e => {
                        e.target.onerror = null;
                        e.target.src = Placeholder;
                      }} />
                                                </div>
                                                <button type="button" className="btn btn-primary upload-btn" onClick={handleUploadClick}>
                                                    {"Upload"}
                                                </button>
                                                <input type="file" id="bannerimage" name="image" accept="image/*" ref={fileInputRef} onChange={handleFileChange} style={{
                      display: "none"
                    }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="buttonText">
                                            {"Button Text"}
                                        </label>
                                        <input type="text" id="buttonText" name="buttonText" autoComplete="off" placeholder={"e.g. EXPLORE COLLECTION"} value={buttonText} onChange={e => {
                  const value = e.target.value;
                  if (value.length === 1 && value === " ") return;
                  setButtonText(value);
                }} />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="buttonLink">
                                            {"Button Link"}
                                        </label>
                                        <input type="text" id="buttonLink" name="buttonLink" autoComplete="off" placeholder={"e.g. /collections"} value={buttonLink} onChange={e => {
                  const value = e.target.value;
                  if (value.length === 1 && value === " ") return;
                  setButtonLink(value);
                }} />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="position">
                                            {"Image Position"}
                                        </label>
                                        <select id="position" name="position" value={position} onChange={e => setPosition(e.target.value)}>
                                            <option value="">{"Select Image Position"}</option>
                                            <option value="left">{"Image Left, Content Right"}</option>
                                            <option value="right">{"Content Left, Image Right"}</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="order">
                                            {"Display Order"}
                                        </label>
                                        <input type="number" id="order" name="order" min="1" placeholder={"Enter display order number"} value={order} onChange={e => setOrder(e.target.value)} />
                                    </div>
                                </div>

                                <div className="form-row full-width">
                                    <div className="form-group">
                                        <label htmlFor="imageurl">
                                            {"Or Banner Image URL (Optional)"}
                                        </label>
                                        <input type="text" id="imageurl" name="imageurl" autoComplete="off" placeholder={"Enter banner image URL"} value={imageUrl} onChange={e => {
                  const value = e.target.value;
                  setImageUrl(value);
                  if (!imageFile) {
                    setImagePreview(value.trim() ? value.trim() : Placeholder);
                  }
                }} />
                                    </div>
                                </div>

                                <div className="form-row full-width">
                                    <div className="form-group">
                                        <label htmlFor="description">
                                            {"Description"}
                                        </label>
                                        <textarea id="description" name="description" rows="3" autoComplete="off" placeholder={"Enter Description"} value={description} onChange={e => {
                  const value = e.target.value;
                  if (value.length === 1 && value === " ") return;
                  setDescription(value);
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
export default AddCollectionBanner;