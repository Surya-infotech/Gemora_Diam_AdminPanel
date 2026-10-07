import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import UploadIcon from '@mui/icons-material/Upload';
import DeleteIcon from '@mui/icons-material/Delete';
import CollectionsIcon from '@mui/icons-material/Collections';
import { useAuth } from '../../Middleware/Auth';
import { usePermissions } from '../../Context/PermissionContext';
import { useLanguage } from '../../Context/LanguageContext';
import CheckToken from '../../utils/CheckToken';
import HandleUnauthorized from '../../utils/HandleUnauthorized';
import LoadingSpinner from '../../Pages/Custom/LoadingSpinner';
import WarningModal from '../../Pages/Custom/WarningModal';
import AlertMessage from '../../Pages/Custom/AlertMessage';
import DeleteModal from '../../Pages/Custom/DeleteModal';
import '../../Scss/Products/itemgallerytab.scss';

const ItemGalleryTab = ({ itemData, onItemUpdated }) => {
    const { translations = {} } = useLanguage();
    const { logoutUser } = useAuth();
    const { canEdit, canDelete } = usePermissions();
    const navigate = useNavigate();
    const { id } = useParams();

    const adminPanelBackendPath = import.meta.env.VITE_BACKEND_URL;
    const tokenname = import.meta.env.VITE_AdminTOKEN_NAME;
    const token = localStorage.getItem(tokenname);

    const itemId = itemData?._id || itemData?.itemid || id;

    const [warningMessage, setWarningMessage] = useState('');
    const [showWarning, setShowWarning] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState('success');
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [galleryImages, setGalleryImages] = useState(itemData?.galleryimages || []);
    const [selectedImages, setSelectedImages] = useState([]);

    // Delete modal states
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [imageToDelete, setImageToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fileInputRef = useRef(null);
    const onItemUpdatedRef = useRef(onItemUpdated);

    useEffect(() => {
        onItemUpdatedRef.current = onItemUpdated;
    }, [onItemUpdated]);

    const userCanEdit = canEdit('item') || canEdit('itemOverview');
    const userCanDelete = canDelete('item') || canDelete('itemOverview');

    const fetchGalleryImages = useCallback(async () => {
        if (!itemId || !CheckToken(token, logoutUser, navigate)) return;
        setLoading(true);
        try {
            const response = await fetch(`${adminPanelBackendPath}/Products/GetItemGalleryImages/${itemId}`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            if (HandleUnauthorized(data, logoutUser, navigate)) return;

            if (response.ok) {
                const images = Array.isArray(data) ? data : (data.galleryimages || []);
                const resolvedImages = Array.isArray(images) ? images : [];
                setGalleryImages(resolvedImages);
            } else {
                setWarningMessage(data.message || translations.servererror || 'Server error');
                setShowWarning(true);
                setGalleryImages([]);
            }
        } catch (error) {
            console.error('Error fetching gallery images:', error);
            setWarningMessage(translations.servererror || 'Server error');
            setShowWarning(true);
            setGalleryImages([]);
        } finally {
            setLoading(false);
        }
    }, [adminPanelBackendPath, itemId, token, logoutUser, navigate, translations]);

    useEffect(() => {
        fetchGalleryImages();
    }, [fetchGalleryImages]);

    // Clean up preview object URLs when unmounting
    useEffect(() => {
        return () => {
            selectedImages.forEach(img => {
                if (img.preview) {
                    URL.revokeObjectURL(img.preview);
                }
            });
        };
    }, [selectedImages]);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        if (files.length > 10) {
            setWarningMessage(translations.maximages || 'Maximum 10 images allowed at a time');
            setShowWarning(true);
            e.target.value = '';
            return;
        }

        const totalAfterSelection = selectedImages.length + files.length;
        if (totalAfterSelection > 10) {
            setWarningMessage(translations.maximagestotal || 'Maximum 10 images allowed in total');
            setShowWarning(true);
            e.target.value = '';
            return;
        }

        const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        const maxSize = 10 * 1024 * 1024; // 10MB

        const invalidTypeFiles = files.filter(file => {
            const fileExtension = file.name.split('.').pop().toLowerCase();
            return !allowedExtensions.includes(fileExtension);
        });

        const oversizedFiles = files.filter(file => file.size > maxSize);

        if (invalidTypeFiles.length > 0) {
            setWarningMessage(translations.invalidfileextension || 'Invalid file format. Please upload jpg, jpeg, png, gif, or webp images.');
            setShowWarning(true);
            e.target.value = '';
            return;
        }

        if (oversizedFiles.length > 0) {
            setWarningMessage(translations.filesizetoolarge || 'File size exceeds the 10MB limit.');
            setShowWarning(true);
            e.target.value = '';
            return;
        }

        const newSelectedImages = files.map(file => ({
            file: file,
            preview: URL.createObjectURL(file),
            id: `preview-${Date.now()}-${Math.random()}`,
            isPreview: true
        }));

        setSelectedImages(prev => [...prev, ...newSelectedImages]);
        e.target.value = '';
    };

    const handleRemoveSelectedImage = (imageId) => {
        setSelectedImages(prev => {
            const imageToRemove = prev.find(img => img.id === imageId);
            if (imageToRemove && imageToRemove.preview) {
                URL.revokeObjectURL(imageToRemove.preview);
            }
            return prev.filter(img => img.id !== imageId);
        });
    };

    const handleSaveImages = async () => {
        if (selectedImages.length === 0) {
            setWarningMessage(translations.pleaseselectimages || 'Please select images to upload');
            setShowWarning(true);
            return;
        }

        if (!CheckToken(token, logoutUser, navigate)) return;

        setUploading(true);
        try {
            const formData = new FormData();
            selectedImages.forEach((imageObj) => {
                formData.append('images', imageObj.file);
            });

            const response = await fetch(`${adminPanelBackendPath}/Products/UploadItemGalleryImages/${itemId}`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();
            if (HandleUnauthorized(data, logoutUser, navigate)) return;

            if (response.ok) {
                setAlertMessage(data.message || translations.imagesuploadedsuccessfully || 'Gallery images uploaded successfully');
                setAlertType('success');

                selectedImages.forEach(img => {
                    if (img.preview) {
                        URL.revokeObjectURL(img.preview);
                    }
                });
                setSelectedImages([]);

                const updatedImages = data.galleryimages || [];
                setGalleryImages(updatedImages);
                if (onItemUpdatedRef.current) {
                    onItemUpdatedRef.current({ galleryimages: updatedImages });
                }
            } else {
                setWarningMessage(data.message || translations.servererror || 'Server error');
                setShowWarning(true);
            }
        } catch (error) {
            console.error('Error saving gallery images:', error);
            setWarningMessage(translations.servererror || 'Server error');
            setShowWarning(true);
        } finally {
            setUploading(false);
        }
    };

    const handleOpenDeleteModal = (imageId) => {
        setImageToDelete(imageId);
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!imageToDelete) return;
        if (!CheckToken(token, logoutUser, navigate)) return;

        setIsDeleting(true);
        try {
            const response = await fetch(`${adminPanelBackendPath}/Products/DeleteItemGalleryImage/${itemId}/${imageToDelete}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            if (HandleUnauthorized(data, logoutUser, navigate)) return;

            if (response.ok) {
                setAlertMessage(data.message || translations.imagedeletedsuccessfully || 'Gallery image deleted successfully');
                setAlertType('success');

                const updatedImages = data.galleryimages || galleryImages.filter(img => (img._id || img.id) !== imageToDelete);
                setGalleryImages(updatedImages);
                if (onItemUpdatedRef.current) {
                    onItemUpdatedRef.current({ galleryimages: updatedImages });
                }
            } else {
                setWarningMessage(data.message || translations.servererror || 'Server error');
                setShowWarning(true);
            }
        } catch (error) {
            console.error('Error deleting gallery image:', error);
            setWarningMessage(translations.servererror || 'Server error');
            setShowWarning(true);
        } finally {
            setIsDeleting(false);
            setDeleteModalOpen(false);
            setImageToDelete(null);
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <>
            {alertMessage && (
                <AlertMessage
                    message={alertMessage}
                    type={alertType}
                    onClose={() => setAlertMessage('')}
                />
            )}
            {showWarning && (
                <WarningModal
                    message={warningMessage}
                    onClose={() => setShowWarning(false)}
                />
            )}
            <DeleteModal
                open={deleteModalOpen}
                onClose={() => {
                    setDeleteModalOpen(false);
                    setImageToDelete(null);
                }}
                onDelete={handleConfirmDelete}
                headingname={translations.deleteimage || 'Delete Image'}
                customMessage={translations.deleteimagemessage || 'Are you sure you want to delete this gallery image?'}
                isLoading={isDeleting}
            />

            <div className="gallery-tab-content">
                <div className="gallery-header">
                    <div className="gallery-header-actions">
                        {userCanEdit && (
                            <button
                                type="button"
                                className="upload-gallery-btn"
                                onClick={handleUploadClick}
                                disabled={uploading || selectedImages.length >= 10}
                                title={selectedImages.length >= 10 ? (translations.maximagesreached || 'Maximum 10 images reached') : ''}
                            >
                                <UploadIcon className="upload-icon" />
                                <span>
                                    {selectedImages.length >= 10
                                        ? (translations.maxreached || 'Max Reached')
                                        : (translations.selectimages || 'Select Images')}
                                </span>
                            </button>
                        )}
                        {userCanEdit && selectedImages.length > 0 && (
                            <button
                                type="button"
                                className="save-gallery-btn"
                                onClick={handleSaveImages}
                                disabled={uploading}
                            >
                                <span>{uploading ? (translations.uploading || 'Uploading...') : (translations.save || 'Save')}</span>
                            </button>
                        )}
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="gallery-file-input"
                            accept="image/png, image/jpeg, image/jpg, image/gif, image/webp"
                            multiple
                            onChange={handleFileChange}
                        />
                    </div>
                </div>

                {(selectedImages.length > 0 || galleryImages.length > 0) ? (
                    <div className="gallery-grid">
                        {/* Selected / Preview images */}
                        {selectedImages.map((imageObj) => (
                            <div key={imageObj.id} className="gallery-item preview-item">
                                <img
                                    src={imageObj.preview}
                                    alt="Preview"
                                    className="gallery-image"
                                />
                                <span className="preview-badge">New</span>
                                <button
                                    className="remove-image-btn"
                                    onClick={() => handleRemoveSelectedImage(imageObj.id)}
                                    type="button"
                                    title={translations.remove || 'Remove'}
                                >
                                    ×
                                </button>
                            </div>
                        ))}

                        {/* Existing gallery images */}
                        {galleryImages.map((image) => {
                            const imageId = image._id || image.id;
                            return (
                                <div key={imageId} className="gallery-item">
                                    <img
                                        src={image.imageUrl}
                                        alt="Gallery item"
                                        className="gallery-image"
                                        loading="lazy"
                                        decoding="async"
                                        onError={(e) => {
                                            console.log('Image failed to load:', image.imageUrl);
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                    {userCanDelete && (
                                        <button
                                            className="delete-image-btn"
                                            onClick={() => handleOpenDeleteModal(imageId)}
                                            type="button"
                                            disabled={uploading || isDeleting}
                                            title={translations.deleteimage || 'Delete Image'}
                                        >
                                            <DeleteIcon className="delete-icon" />
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="no-gallery-message">
                        <CollectionsIcon className="empty-gallery-icon" />
                        <p>{translations.nogalleryimagesfound || 'No gallery images found'}</p>
                    </div>
                )}
            </div>
        </>
    );
};

export default ItemGalleryTab;
