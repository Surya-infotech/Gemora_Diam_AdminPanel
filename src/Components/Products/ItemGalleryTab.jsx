import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import UploadIcon from '@mui/icons-material/Upload';
import DeleteIcon from '@mui/icons-material/Delete';
import CollectionsIcon from '@mui/icons-material/Collections';
import VideocamIcon from '@mui/icons-material/Videocam';
import MovieCreationOutlinedIcon from '@mui/icons-material/MovieCreationOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
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

    // Notification states
    const [warningMessage, setWarningMessage] = useState('');
    const [showWarning, setShowWarning] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState('success');
    const [loading, setLoading] = useState(true);

    // Gallery Images states
    const [uploading, setUploading] = useState(false);
    const [galleryImages, setGalleryImages] = useState(itemData?.galleryimages || []);
    const [selectedImages, setSelectedImages] = useState([]);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [imageToDelete, setImageToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Item Videos states
    const [galleryVideos, setGalleryVideos] = useState(
        Array.isArray(itemData?.galleryvideos) && itemData.galleryvideos.length > 0
            ? itemData.galleryvideos
            : (itemData?.video ? [{ _id: 'legacy_video', videoUrl: itemData.video }] : [])
    );
    const [selectedVideos, setSelectedVideos] = useState([]);
    const [videoUploading, setVideoUploading] = useState(false);
    const [videoDeleting, setVideoDeleting] = useState(false);
    const [deleteVideoModalOpen, setDeleteVideoModalOpen] = useState(false);
    const [videoToDelete, setVideoToDelete] = useState(null);

    // Refs
    const fileInputRef = useRef(null);
    const videoInputRef = useRef(null);
    const onItemUpdatedRef = useRef(onItemUpdated);

    useEffect(() => {
        onItemUpdatedRef.current = onItemUpdated;
    }, [onItemUpdated]);

    const userCanEdit = canEdit('item') || canEdit('itemOverview');
    const userCanDelete = canDelete('item') || canDelete('itemOverview');

    const fetchGalleryData = useCallback(async () => {
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

                let videos = data.galleryvideos || [];
                if (videos.length === 0 && data.video) {
                    videos = [{ _id: 'legacy_video', videoUrl: data.video }];
                }
                setGalleryVideos(Array.isArray(videos) ? videos : []);

                if (onItemUpdatedRef.current) {
                    onItemUpdatedRef.current({
                        galleryimages: resolvedImages,
                        galleryvideos: Array.isArray(videos) ? videos : [],
                        video: data.video || (videos[0]?.videoUrl || '')
                    });
                }
            } else {
                setWarningMessage(data.message || translations.servererror);
                setShowWarning(true);
                setGalleryImages([]);
                setGalleryVideos([]);
            }
        } catch (error) {
            console.error('Error fetching gallery data:', error);
            setWarningMessage(translations.servererror);
            setShowWarning(true);
            setGalleryImages([]);
            setGalleryVideos([]);
        } finally {
            setLoading(false);
        }
    }, [adminPanelBackendPath, itemId, token, logoutUser, navigate, translations]);

    useEffect(() => {
        fetchGalleryData();
    }, [fetchGalleryData]);

    // Clean up preview object URLs when unmounting
    useEffect(() => {
        return () => {
            selectedImages.forEach(img => {
                if (img.preview) {
                    URL.revokeObjectURL(img.preview);
                }
            });
            selectedVideos.forEach(vid => {
                if (vid.preview) {
                    URL.revokeObjectURL(vid.preview);
                }
            });
        };
    }, [selectedImages, selectedVideos]);

    /* =========================================
       Image Gallery Handlers
    ========================================= */
    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        if (files.length > 10) {
            setWarningMessage(translations.maximages);
            setShowWarning(true);
            e.target.value = '';
            return;
        }

        const totalAfterSelection = selectedImages.length + files.length;
        if (totalAfterSelection > 10) {
            setWarningMessage(translations.maximagestotal);
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
            setWarningMessage(translations.invalidfileextension);
            setShowWarning(true);
            e.target.value = '';
            return;
        }

        if (oversizedFiles.length > 0) {
            setWarningMessage(translations.filesizetoolarge);
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
            setWarningMessage(translations.pleaseselectimages);
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
                setAlertMessage(data.message || translations.imagesuploadedsuccessfully);
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
                setWarningMessage(data.message || translations.servererror);
                setShowWarning(true);
            }
        } catch (error) {
            console.error('Error saving gallery images:', error);
            setWarningMessage(translations.servererror);
            setShowWarning(true);
        } finally {
            setUploading(false);
        }
    };

    const handleOpenDeleteModal = (imageId) => {
        setImageToDelete(imageId);
        setDeleteModalOpen(true);
    };

    const handleConfirmDeleteImage = async () => {
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
                setAlertMessage(data.message || translations.imagedeletedsuccessfully);
                setAlertType('success');

                const updatedImages = data.galleryimages || galleryImages.filter(img => (img._id || img.id) !== imageToDelete);
                setGalleryImages(updatedImages);
                if (onItemUpdatedRef.current) {
                    onItemUpdatedRef.current({ galleryimages: updatedImages });
                }
            } else {
                setWarningMessage(data.message || translations.servererror);
                setShowWarning(true);
            }
        } catch (error) {
            console.error('Error deleting gallery image:', error);
            setWarningMessage(translations.servererror);
            setShowWarning(true);
        } finally {
            setIsDeleting(false);
            setDeleteModalOpen(false);
            setImageToDelete(null);
        }
    };

    /* =========================================
       Item Video Handlers
    ========================================= */
    const handleVideoUploadClick = () => {
        videoInputRef.current?.click();
    };

    const handleVideoFileChange = (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        if (files.length > 10) {
            setWarningMessage(translations.maxvideos);
            setShowWarning(true);
            e.target.value = '';
            return;
        }

        const totalAfterSelection = selectedVideos.length + files.length;
        if (totalAfterSelection > 10) {
            setWarningMessage(translations.maxvideostotal);
            setShowWarning(true);
            e.target.value = '';
            return;
        }

        const allowedExtensions = ['mp4', 'webm', 'mov', 'mkv', 'ogg', 'm4v'];
        const maxSize = 100 * 1024 * 1024; // 100MB limit per video

        const invalidTypeFiles = files.filter(file => {
            const ext = (file.name.split('.').pop() || '').toLowerCase();
            return !allowedExtensions.includes(ext);
        });

        if (invalidTypeFiles.length > 0) {
            setWarningMessage(translations.invalidvideoextension);
            setShowWarning(true);
            e.target.value = '';
            return;
        }

        const oversizedFiles = files.filter(file => file.size > maxSize);
        if (oversizedFiles.length > 0) {
            setWarningMessage(translations.videofilesizetoolarge);
            setShowWarning(true);
            e.target.value = '';
            return;
        }

        const newSelectedVideos = files.map(file => ({
            file,
            preview: URL.createObjectURL(file),
            name: file.name,
            size: (file.size / (1024 * 1024)).toFixed(1) + ' MB'
        }));

        setSelectedVideos(prev => [...prev, ...newSelectedVideos]);
        e.target.value = '';
    };

    const handleRemoveSelectedVideo = (index) => {
        setSelectedVideos(prev => {
            const removed = prev[index];
            if (removed?.preview) {
                URL.revokeObjectURL(removed.preview);
            }
            return prev.filter((_, i) => i !== index);
        });
    };

    const handleCancelSelectedVideos = () => {
        selectedVideos.forEach(vid => {
            if (vid.preview) {
                URL.revokeObjectURL(vid.preview);
            }
        });
        setSelectedVideos([]);
    };

    const handleSaveVideos = async () => {
        if (selectedVideos.length === 0) {
            setWarningMessage(translations.pleaseselectvideo);
            setShowWarning(true);
            return;
        }

        if (!CheckToken(token, logoutUser, navigate)) return;

        setVideoUploading(true);
        try {
            const formData = new FormData();
            selectedVideos.forEach(v => {
                formData.append('videos', v.file);
            });

            const response = await fetch(`${adminPanelBackendPath}/Products/UploadItemVideos/${itemId}`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();
            if (HandleUnauthorized(data, logoutUser, navigate)) return;

            if (response.ok) {
                setAlertMessage(data.message || translations.videosuploadedsuccessfully);
                setAlertType('success');

                selectedVideos.forEach(v => {
                    if (v.preview) {
                        URL.revokeObjectURL(v.preview);
                    }
                });
                setSelectedVideos([]);

                const updatedVideos = data.galleryvideos || [];
                setGalleryVideos(updatedVideos);

                if (onItemUpdatedRef.current) {
                    onItemUpdatedRef.current({
                        galleryvideos: updatedVideos,
                        video: data.video || (updatedVideos[0]?.videoUrl || '')
                    });
                }
            } else {
                setWarningMessage(data.message || translations.servererror);
                setShowWarning(true);
            }
        } catch (error) {
            console.error('Error saving item videos:', error);
            setWarningMessage(translations.servererror);
            setShowWarning(true);
        } finally {
            setVideoUploading(false);
        }
    };

    const handleOpenDeleteVideoModal = (videoItem) => {
        setVideoToDelete(videoItem);
        setDeleteVideoModalOpen(true);
    };

    const handleConfirmDeleteVideo = async () => {
        if (!videoToDelete) return;
        if (!CheckToken(token, logoutUser, navigate)) return;

        setVideoDeleting(true);
        try {
            const videoId = videoToDelete._id || encodeURIComponent(videoToDelete.videoUrl);
            const response = await fetch(`${adminPanelBackendPath}/Products/DeleteItemVideo/${itemId}/${videoId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            if (HandleUnauthorized(data, logoutUser, navigate)) return;

            if (response.ok) {
                setAlertMessage(data.message || translations.videodeletedsuccessfully);
                setAlertType('success');

                const updatedVideos = data.galleryvideos || galleryVideos.filter(
                    v => v._id !== videoToDelete._id && v.videoUrl !== videoToDelete.videoUrl
                );
                setGalleryVideos(updatedVideos);

                if (onItemUpdatedRef.current) {
                    onItemUpdatedRef.current({
                        galleryvideos: updatedVideos,
                        video: data.video || (updatedVideos[0]?.videoUrl || '')
                    });
                }
            } else {
                setWarningMessage(data.message || translations.servererror);
                setShowWarning(true);
            }
        } catch (error) {
            console.error('Error deleting item video:', error);
            setWarningMessage(translations.servererror);
            setShowWarning(true);
        } finally {
            setVideoDeleting(false);
            setDeleteVideoModalOpen(false);
            setVideoToDelete(null);
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
                onDelete={handleConfirmDeleteImage}
                headingname={translations.deleteimage}
                customMessage={translations.deleteimagemessage}
                isLoading={isDeleting}
            />
            <DeleteModal
                open={deleteVideoModalOpen}
                onClose={() => setDeleteVideoModalOpen(false)}
                onDelete={handleConfirmDeleteVideo}
                headingname={translations.deletevideo}
                customMessage={translations.deletevideomessage}
                isLoading={videoDeleting}
            />

            <div className="gallery-tab-content">
                {/* =========================================
                   1. Gallery Images Section
                ========================================= */}
                <div className="gallery-header">
                    <div className="gallery-header-actions">
                        {userCanEdit && (
                            <button
                                type="button"
                                className="btn upload-gallery-btn"
                                onClick={handleUploadClick}
                                disabled={uploading || selectedImages.length >= 10}
                                title={selectedImages.length >= 10 ? translations.maximagesreached : ''}
                            >
                                <UploadIcon className="upload-icon" />
                                <span>
                                    {selectedImages.length >= 10
                                        ? translations.maxreached
                                        : translations.selectimages}
                                </span>
                            </button>
                        )}
                        {userCanEdit && selectedImages.length > 0 && (
                            <button
                                type="button"
                                className="btn save-gallery-btn"
                                onClick={handleSaveImages}
                                disabled={uploading}
                            >
                                <SaveIcon className="save-icon" />
                                <span>{uploading ? translations.uploading : translations.save}</span>
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
                                    title={translations.remove}
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
                                            title={translations.deleteimage}
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
                        <p>{translations.nogalleryimagesfound}</p>
                    </div>
                )}

                {/* =========================================
                   2. Item Video Section (Multi-Video Support)
                ========================================= */}
                <hr className="gallery-section-divider" />

                <div className="video-section">
                    <div className="video-section-header">
                        <div className="video-header-title">
                            <span className="video-icon-badge">
                                <VideocamIcon />
                            </span>
                            <h5>{translations.itemvideos}</h5>
                            <span className="video-hint">MP4, WebM, MOV • Max 100MB</span>
                        </div>
                        <div className="video-header-actions">
                            {userCanEdit && (
                                <button
                                    type="button"
                                    className="btn upload-video-btn"
                                    onClick={handleVideoUploadClick}
                                    disabled={videoUploading || selectedVideos.length >= 10}
                                    title={selectedVideos.length >= 10 ? translations.maxreached : ''}
                                >
                                    <UploadIcon />
                                    <span>
                                        {selectedVideos.length >= 10
                                            ? translations.maxreached
                                            : translations.selectvideos}
                                    </span>
                                </button>
                            )}
                            {userCanEdit && selectedVideos.length > 0 && (
                                <>
                                    <button
                                        type="button"
                                        className="btn cancel-video-btn"
                                        onClick={handleCancelSelectedVideos}
                                        disabled={videoUploading}
                                    >
                                        <CloseIcon />
                                        <span>{translations.cancel}</span>
                                    </button>
                                    <button
                                        type="button"
                                        className="btn save-video-btn"
                                        onClick={handleSaveVideos}
                                        disabled={videoUploading}
                                    >
                                        <SaveIcon />
                                        <span>
                                            {videoUploading
                                                ? translations.uploading
                                                : translations.savevideos}
                                        </span>
                                    </button>
                                </>
                            )}
                            <input
                                type="file"
                                ref={videoInputRef}
                                className="video-file-input"
                                accept="video/mp4,video/webm,video/quicktime,video/x-matroska,video/ogg,video/x-m4v,video/*"
                                multiple
                                onChange={handleVideoFileChange}
                            />
                        </div>
                    </div>

                    {(selectedVideos.length > 0 || galleryVideos.length > 0) ? (
                        <div className="video-grid">
                            {/* Pending Preview Videos */}
                            {selectedVideos.map((videoObj, index) => (
                                <div className="video-item-card preview-video-card" key={`preview-${index}`}>
                                    <div className="video-card-top-bar">
                                        <span className="video-status-tag">Pending Upload</span>
                                        <button
                                            type="button"
                                            className="remove-video-btn"
                                            onClick={() => handleRemoveSelectedVideo(index)}
                                            disabled={videoUploading}
                                            title="Remove Video"
                                        >
                                            &times;
                                        </button>
                                    </div>
                                    <div className="video-player-container">
                                        <video
                                            src={videoObj.preview}
                                            controls
                                            className="item-video-element"
                                        />
                                    </div>
                                    <div className="video-card-info-footer">
                                        <span className="video-filename" title={videoObj.name}>
                                            {videoObj.name}
                                        </span>
                                        <span className="video-filesize">{videoObj.size}</span>
                                    </div>
                                </div>
                            ))}

                            {/* Existing Saved Gallery Videos */}
                            {galleryVideos.map((videoItem, index) => {
                                const videoId = videoItem._id || videoItem.videoUrl;
                                return (
                                    <div className="video-item-card" key={`saved-${videoId || index}`}>
                                        <div className="video-card-top-bar">
                                            <span className="video-count-badge">Video #{index + 1}</span>
                                            {userCanDelete && (
                                                <button
                                                    type="button"
                                                    className="delete-video-btn"
                                                    onClick={() => handleOpenDeleteVideoModal(videoItem)}
                                                    disabled={videoUploading || videoDeleting}
                                                    title={translations.deletevideo}
                                                >
                                                    <DeleteIcon className="delete-icon" />
                                                </button>
                                            )}
                                        </div>
                                        <div className="video-player-container">
                                            <video
                                                src={videoItem.videoUrl}
                                                controls
                                                preload="metadata"
                                                className="item-video-element"
                                            />
                                        </div>
                                        <div className="video-card-info-footer">
                                            <span className="video-filename">
                                                {itemData?.itemname ? `${itemData.itemname} - Video ${index + 1}` : `Video ${index + 1}`}
                                            </span>
                                            <span className="video-filesize">Uploaded showcase video</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        /* Empty State Card */
                        <div className="empty-video-card">
                            <MovieCreationOutlinedIcon className="empty-video-icon" />
                            <h6 className="empty-video-title">{translations.novideofound}</h6>
                            <p className="empty-video-desc">
                                Upload multiple videos to showcase the jewelry or diamond from every angle
                            </p>
                            {userCanEdit && (
                                <button
                                    type="button"
                                    className="btn empty-video-btn"
                                    onClick={handleVideoUploadClick}
                                    disabled={videoUploading}
                                >
                                    <VideocamIcon />
                                    <span>{translations.selectvideos}</span>
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default ItemGalleryTab;