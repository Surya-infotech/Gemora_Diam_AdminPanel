import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import Placeholder from '../../../assets/placeholder.png';
import { useAuth } from '../../../Middleware/Auth';
import LoadingSpinner from '../../../Pages/Custom/LoadingSpinner';
import WarningModal from '../../../Pages/Custom/WarningModal';
import CustomSwitch from '../../../Pages/Custom/CustomSwitch';
import "../../../Scss/Attributes/Category/addcategory.scss";
import CheckToken from '../../../utils/CheckToken';
import HandleUnauthorized from '../../../utils/HandleUnauthorized';
const EditCategory = () => {
  const {
    id
  } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const {
    logoutUser
  } = useAuth();
  const adminPanelBackendPath = import.meta.env.VITE_BACKEND_URL;
  const tokenname = import.meta.env.VITE_AdminTOKEN_NAME;
  const [warningMessage, setWarningMessage] = useState("");
  const [showWarning, setShowWarning] = useState(false);
  const token = localStorage.getItem(tokenname);
  const [categoryName, setCategoryName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(Placeholder);
  const [isLoading, setIsLoading] = useState(false);
  const MAX_DESCRIPTION_LENGTH = 120;
  useEffect(() => {
    document.title = "Edit Category";
  }, []);
  useEffect(() => {
    const fetchDetails = async () => {
      setIsLoading(true);
      if (!CheckToken(token, logoutUser, navigate)) {
        setIsLoading(false);
        return;
      }
      try {
        const response = await fetch(`${adminPanelBackendPath}/Attributes/EditCategory/${id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const result = await response.json();
        if (HandleUnauthorized(result, logoutUser, navigate)) return;
        if (response.ok) {
          setCategoryName(result.categoryname || "");
          setDescription(result.description || "");
          setStatus(Boolean(result.status));
          if (result.image) {
            setImagePreview(result.image);
          } else {
            setImagePreview(Placeholder);
          }
        } else {
          const errorMessages = {
            "Category not found": "Category not found",
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
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  const handleImageChange = e => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const allowedExtensions = ['jpg', 'jpeg', 'png'];
      const fileExtension = file.name.split('.').pop().toLowerCase();
      if (!allowedExtensions.includes(fileExtension)) {
        setWarningMessage("Invalid file extension. Only JPG, JPEG, PNG files are allowed.");
        setShowWarning(true);
        e.target.value = '';
        return;
      }
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
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
    if (!categoryName.trim() || !description.trim()) {
      setWarningMessage("All fields are required");
      setShowWarning(true);
      return;
    }
    if (description.trim().length > MAX_DESCRIPTION_LENGTH) {
      setWarningMessage("Description cannot exceed 120 characters");
      setShowWarning(true);
      return;
    }
    if (!imageFile && (!imagePreview || imagePreview === Placeholder)) {
      setWarningMessage("Image is required");
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
      formData.append("categoryname", categoryName.trim());
      formData.append("description", description.trim());
      formData.append("status", status);
      if (imageFile) {
        formData.append("image", imageFile);
      }
      const response = await fetch(`${adminPanelBackendPath}/Attributes/UpdateCategory/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });
      const result = await response.json();
      if (HandleUnauthorized(result, logoutUser, navigate)) return;
      if (response.ok) {
        navigate("/Attributes/Category", {
          state: {
            message: "Category updated successfully"
          }
        });
      } else {
        const errorMessages = {
          "All fields are required": "All fields are required",
          "Category Already Exists": "Category Already Exists",
          "Category not found": "Category not found",
          "Image is required": "Image is required",
          "Description cannot exceed 120 characters": "Description cannot exceed 120 characters",
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
  const handleCancel = () => navigate(`/Attributes/Category`);
  return <>
    {showWarning && <WarningModal message={warningMessage} onClose={() => setShowWarning(false)} />}
    <div className="AddCategory-container ">
      <div className="Addcategory-container">
        <h6 className="Addcategory-headingname">{"Edit Category"}</h6>
        <div className="Addcategory-form-container">
          {isLoading ? <LoadingSpinner /> : <form onSubmit={handleSubmit}>
            <div className="imageflex">
              <div className="formdiv">
                <div className="form-group">
                  <label htmlFor="categoryname">
                    {"Category Name"} <span style={{
                      color: "red"
                    }}>*</span>
                  </label>
                  <input type="text" id="categoryname" name="categoryname" autoComplete="off" placeholder={"Enter Category Name"} required value={categoryName} onChange={e => {
                    const value = e.target.value;
                    if (value.length === 1 && value === " ") return;
                    setCategoryName(value);
                  }} />
                </div>

                <div className="form-group">
                  <label htmlFor="description">
                    {"Description"} <span style={{
                      color: "red"
                    }}>*</span>
                  </label>
                  <textarea id="description" name="description" rows="3" autoComplete="off" placeholder={"Enter Category Description"} required maxLength={MAX_DESCRIPTION_LENGTH} value={description} onChange={e => {
                    const value = e.target.value;
                    if (value.length === 1 && value === " ") return;
                    if (value.length <= MAX_DESCRIPTION_LENGTH) {
                      setDescription(value);
                    }
                  }} />
                  <div className={`description-counter ${(description || "").length >= MAX_DESCRIPTION_LENGTH ? 'max-reached' : ''}`}>
                    {(description || "").length}/{MAX_DESCRIPTION_LENGTH}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="status">{"Status"}</label>
                  <div className="switch-container">
                    <CustomSwitch checked={status} onChange={e => setStatus(e.target.checked)} />
                  </div>
                </div>
              </div>

              <div className="imagediv">
                <div className="form-group">
                  <div className="imgpreview">
                    {imagePreview && <div className="image-preview-container">
                      <img src={imagePreview} alt={"Category Preview"} className="image-preview" onError={e => {
                        e.target.onerror = null;
                        e.target.src = Placeholder;
                      }} />
                    </div>}
                    <button type="button" className="btn btn-primary upload-btn" onClick={handleUploadClick}>
                      {"Upload"}
                    </button>
                    <input type="file" id="categoryimage" name="image" accept="image/*" ref={fileInputRef} onChange={handleImageChange} style={{
                      display: "none"
                    }} />
                  </div>
                </div>
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
export default EditCategory;