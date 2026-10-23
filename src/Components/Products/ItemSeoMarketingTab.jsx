import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import CampaignIcon from '@mui/icons-material/Campaign';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SaveIcon from '@mui/icons-material/Save';
import ComputerIcon from '@mui/icons-material/Computer';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import CheckIcon from '@mui/icons-material/Check';
import LanguageIcon from '@mui/icons-material/Language';
import LinkIcon from '@mui/icons-material/Link';
import DiamondIcon from '@mui/icons-material/Diamond';

import { useLanguage } from '../../Context/LanguageContext';
import { useAuth } from '../../Middleware/Auth';
import CheckToken from '../../utils/CheckToken';
import HandleUnauthorized from '../../utils/HandleUnauthorized';
import WarningModal from '../../Pages/Custom/WarningModal';
import AlertMessage from '../../Pages/Custom/AlertMessage';
import '../../Scss/Products/itemseomarketingtab.scss';

// Utility to convert text to URL slug
const slugify = (text = '') => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
};

// Utility to strip HTML tags for descriptions
const stripHtml = (html = '') => {
    if (!html) return '';
    return html.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
};

// Character counter component with visual progress bar and status badge
const FieldCharacterCounter = ({ current = 0, max = 60, recommendedMin, recommendedMax, translations = {} }) => {
    const percentage = Math.min(Math.round((current / max) * 100), 100);

    let statusType = 'neutral';
    let statusText = `${current} / ${max}`;

    if (current === 0) {
        statusType = 'empty';
        statusText = translations.empty || 'Empty';
    } else if (recommendedMin && recommendedMax) {
        if (current >= recommendedMin && current <= recommendedMax) {
            statusType = 'optimal';
            statusText = translations.optimal || 'Optimal';
        } else if (current < recommendedMin) {
            statusType = 'progress';
            statusText = `${recommendedMin - current} more for optimal`;
        } else if (current > recommendedMax && current < max) {
            statusType = 'warning';
            statusText = translations.nearlimit || 'Near limit';
        } else {
            statusType = 'max-reached';
            statusText = translations.maxreached || 'Max limit';
        }
    } else {
        if (current >= max) {
            statusType = 'max-reached';
            statusText = translations.maxreached || 'Max limit';
        } else if (percentage >= 90) {
            statusType = 'warning';
            statusText = translations.nearlimit || 'Near limit';
        } else {
            statusType = 'progress';
            statusText = `${max - current} left`;
        }
    }

    return (
        <div className={`field-char-counter-wrapper status-${statusType}`}>
            <div className="counter-row">
                <span className="counter-counts">
                    <strong>{current}</strong> / {max} {translations.characters || 'chars'}
                </span>
                <span className={`counter-badge badge-${statusType}`}>
                    {statusType === 'optimal' && <CheckCircleIcon className="badge-icon" fontSize="inherit" />}
                    {statusType === 'max-reached' && <WarningAmberIcon className="badge-icon" fontSize="inherit" />}
                    {statusText}
                </span>
            </div>
            <div className="char-progress-bar-track">
                <div
                    className={`char-progress-bar-fill fill-${statusType}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};

const ItemSeoMarketingTab = ({ itemData, onItemUpdated }) => {
    const navigate = useNavigate();
    const { translations, isRtl } = useLanguage();
    const { logoutUser } = useAuth();
    const adminPanelBackendPath = import.meta.env.VITE_BACKEND_URL;
    const tokenname = import.meta.env.VITE_AdminTOKEN_NAME;
    const token = localStorage.getItem(tokenname);

    // Limits
    const LIMITS = {
        metaTitle: 60,
        metaTitleOptimalMin: 50,
        metaTitleOptimalMax: 60,

        metaDescription: 160,
        metaDescriptionOptimalMin: 140,
        metaDescriptionOptimalMax: 160,

        slug: 100,
        slugOptimalMin: 10,
        slugOptimalMax: 70,

        metaKeywords: 255,
        canonicalUrl: 255
    };

    // SEO Form State
    const [metaTitle, setMetaTitle] = useState('');
    const [metaDescription, setMetaDescription] = useState('');
    const [slug, setSlug] = useState('');
    const [metaKeywords, setMetaKeywords] = useState('');
    const [canonicalUrl, setCanonicalUrl] = useState('');

    // UI State
    const [isSaving, setIsSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [warningMessage, setWarningMessage] = useState('');
    const [showWarning, setShowWarning] = useState(false);
    const [previewMode, setPreviewMode] = useState('desktop'); // 'desktop' | 'mobile'
    const [copiedSlug, setCopiedSlug] = useState(false);

    // Initialize state from itemData
    const resetFormFromData = (data) => {
        if (!data) return;
        const seo = data.seo || {};
        setMetaTitle(seo.metaTitle || '');
        setMetaDescription(seo.metaDescription || '');
        setSlug(seo.slug || (data.itemname ? slugify(data.itemname) : ''));
        setMetaKeywords(seo.metaKeywords || '');
        setCanonicalUrl(seo.canonicalUrl || '');
    };

    useEffect(() => {
        if (itemData) {
            resetFormFromData(itemData);
        }
    }, [itemData]);


    // Calculate SEO Optimization Health Score (0 - 100%)
    const seoHealth = useMemo(() => {
        let score = 0;
        let checks = 0;

        // Meta Title Check (30 pts)
        checks += 30;
        if (metaTitle.trim().length >= LIMITS.metaTitleOptimalMin && metaTitle.trim().length <= LIMITS.metaTitleOptimalMax) {
            score += 30;
        } else if (metaTitle.trim().length > 0) {
            score += 18;
        }

        // Meta Description Check (30 pts)
        checks += 30;
        if (metaDescription.trim().length >= LIMITS.metaDescriptionOptimalMin && metaDescription.trim().length <= LIMITS.metaDescriptionOptimalMax) {
            score += 30;
        } else if (metaDescription.trim().length > 0) {
            score += 18;
        }

        // Slug Check (20 pts)
        checks += 20;
        if (slug.trim().length >= 3) {
            score += 20;
        }

        // Focus Keywords Check (10 pts)
        checks += 10;
        if (metaKeywords.trim().length >= 5) {
            score += 10;
        }

        // Canonical URL Check (10 pts)
        checks += 10;
        if (canonicalUrl.trim().length >= 10) {
            score += 10;
        }

        const percentage = Math.round((score / checks) * 100);
        return {
            percentage,
            level: percentage >= 80 ? 'excellent' : percentage >= 50 ? 'moderate' : 'basic',
            label: percentage >= 80 ? 'High Optimization' : percentage >= 50 ? 'Moderate Optimization' : 'Needs Optimization'
        };
    }, [metaTitle, metaDescription, slug, metaKeywords, canonicalUrl]);

    // Copy live product slug / URL to clipboard
    const handleCopySlug = () => {
        const fullUrl = `https://gemoradiam.com/products/${slug || slugify(itemData?.itemname || 'item')}`;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(fullUrl);
            setCopiedSlug(true);
            setTimeout(() => setCopiedSlug(false), 2200);
        }
    };

    // Keyword chips parsed from comma-separated input
    const parsedKeywords = useMemo(() => {
        if (!metaKeywords) return [];
        return metaKeywords
            .split(',')
            .map(k => k.trim())
            .filter(Boolean);
    }, [metaKeywords]);

    // Handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!CheckToken(token, logoutUser, navigate)) return;

        const itemId = itemData?.itemid || itemData?._id;
        if (!itemId) {
            setWarningMessage(translations.itemnotfound || 'Item not found');
            setShowWarning(true);
            return;
        }

        setIsSaving(true);
        setSuccessMessage('');

        const payload = {
            metaTitle: metaTitle.trim(),
            metaDescription: metaDescription.trim(),
            slug: slugify(slug || itemData?.itemname || ''),
            metaKeywords: metaKeywords.trim(),
            canonicalUrl: canonicalUrl.trim()
        };

        try {
            const response = await fetch(`${adminPanelBackendPath}/Products/UpdateItemSeo/${itemId}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            if (HandleUnauthorized(data, logoutUser, navigate)) return;

            if (response.ok) {
                setSuccessMessage(data.message || translations.seocontentupdatedsuccessfully || 'SEO Marketing content updated successfully');
                if (onItemUpdated && data.item) {
                    onItemUpdated(data.item);
                }
            } else {
                setWarningMessage(data.message || translations.servererror);
                setShowWarning(true);
            }
        } catch (err) {
            console.error('Update item SEO error:', err);
            setWarningMessage(translations.servererror);
            setShowWarning(true);
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = () => {
        resetFormFromData(itemData);
        setSuccessMessage('');
    };

    const displayTitle = metaTitle || itemData?.itemname || 'Diamond Ring - Haute Joaillerie';
    const displaySlug = slug || slugify(itemData?.itemname || 'ring');
    const displayDescription = metaDescription || stripHtml(itemData?.description) || 'Discover exquisite diamond creations, certified gemstones, and fine luxury jewelry handcrafted to perfection.';

    return (
        <>
            {showWarning && <WarningModal message={warningMessage} onClose={() => setShowWarning(false)} />}

            <div className={`item-seo-tab-container ${isRtl ? 'rtl-seotab' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
                {successMessage && (
                    <div className="seo-tab-alert">
                        <AlertMessage message={successMessage} type="success" onClose={() => setSuccessMessage('')} />
                    </div>
                )}

                {/* ========================================================= */}
                {/* Header Banner */}
                {/* ========================================================= */}
                <div className="seo-header-banner">
                    <div className="banner-left">
                        <div className="banner-icon-wrapper">
                            <CampaignIcon className="banner-icon" />
                        </div>
                        <div className="banner-info">
                            <div className="banner-title-row">
                                <h5 className="banner-title">{translations.seomarketingcontent || 'SEO Marketing Content'}</h5>
                                <div className={`seo-health-chip level-${seoHealth.level}`}>
                                    <span className="health-dot" />
                                    <span className="health-text">{seoHealth.percentage}% {seoHealth.label}</span>
                                </div>
                            </div>
                            <p className="banner-subtitle">
                                {translations.seomarketingsubtitle || 'Optimize search engine rankings, URL slug, and meta tags'}
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="seo-config-form">
                    <div className="seo-grid-layout">
                        {/* ========================================================= */}
                        {/* LEFT COLUMN: Input Fields */}
                        {/* ========================================================= */}
                        <div className="seo-inputs-column">
                            {/* Card: Search Engine Optimization */}
                            <div className="seo-section-card">
                                <div className="card-section-header">
                                    <div className="header-left">
                                        <div className="section-icon-badge">
                                            <TravelExploreIcon />
                                        </div>
                                        <div>
                                            <h6 className="section-title">
                                                {translations.searchengineoptimization || 'Search Engine Optimization (SERP)'}
                                            </h6>
                                            <span className="section-description">
                                                {translations.searchenginesubtitle || 'Configure meta tags for Google, Bing, and other search engines'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="card-form-body">
                                    {/* Field: Meta Title */}
                                    <div className="form-group field-with-counter">
                                        <div className="field-label-row">
                                            <label htmlFor="metaTitle" className="field-label">
                                                {translations.metatitle || 'Meta Title (Page Title)'}
                                            </label>
                                            <span className="recommended-tag">
                                                {translations.recommended || 'Recommended'}: {LIMITS.metaTitleOptimalMin}-{LIMITS.metaTitleOptimalMax} {translations.characters || 'chars'}
                                            </span>
                                        </div>
                                        <input
                                            type="text"
                                            id="metaTitle"
                                            className="form-control seo-input"
                                            placeholder={translations.entermetatitle || 'e.g. Solitaire Diamond Ring | Gemora Diam'}
                                            value={metaTitle}
                                            maxLength={LIMITS.metaTitle}
                                            onChange={(e) => setMetaTitle(e.target.value)}
                                        />
                                        <FieldCharacterCounter
                                            current={metaTitle.length}
                                            max={LIMITS.metaTitle}
                                            recommendedMin={LIMITS.metaTitleOptimalMin}
                                            recommendedMax={LIMITS.metaTitleOptimalMax}
                                            translations={translations}
                                        />
                                        <small className="field-hint">
                                            {translations.metatitlehelp || 'Headline in Google search results and browser tab. Recommended: 50-60 characters.'}
                                        </small>
                                    </div>

                                    {/* Field: URL Slug */}
                                    <div className="form-group field-with-counter">
                                        <div className="field-label-row">
                                            <label htmlFor="slug" className="field-label">
                                                {translations.urlslug || 'URL Slug'}
                                            </label>
                                            <span className="recommended-tag">
                                                {translations.recommended || 'Recommended'}: {LIMITS.slugOptimalMin}-{LIMITS.slugOptimalMax} {translations.characters || 'chars'}
                                            </span>
                                        </div>
                                        <div className="slug-input-wrapper">
                                            <span className="slug-prefix">gemoradiam.com/products/</span>
                                            <input
                                                type="text"
                                                id="slug"
                                                className="form-control seo-input slug-input"
                                                placeholder={translations.enterurlslug || 'solitaire-diamond-ring'}
                                                value={slug}
                                                maxLength={LIMITS.slug}
                                                onChange={(e) => setSlug(slugify(e.target.value))}
                                                onBlur={(e) => setSlug(slugify(e.target.value))}
                                            />
                                        </div>
                                        <FieldCharacterCounter
                                            current={slug.length}
                                            max={LIMITS.slug}
                                            recommendedMin={LIMITS.slugOptimalMin}
                                            recommendedMax={LIMITS.slugOptimalMax}
                                            translations={translations}
                                        />
                                        <small className="field-hint">
                                            {translations.urlslughelp || 'SEO-friendly URL path for this product. Lowercase letters, numbers, and hyphens only.'}
                                        </small>
                                    </div>

                                    {/* Field: Meta Description */}
                                    <div className="form-group field-with-counter">
                                        <div className="field-label-row">
                                            <label htmlFor="metaDescription" className="field-label">
                                                {translations.metadescription || 'Meta Description'}
                                            </label>
                                            <span className="recommended-tag">
                                                {translations.recommended || 'Recommended'}: {LIMITS.metaDescriptionOptimalMin}-{LIMITS.metaDescriptionOptimalMax} {translations.characters || 'chars'}
                                            </span>
                                        </div>
                                        <textarea
                                            id="metaDescription"
                                            rows="3"
                                            className="form-control seo-textarea"
                                            placeholder={translations.entermetadescription || 'Enter brief description displayed in search results...'}
                                            value={metaDescription}
                                            maxLength={LIMITS.metaDescription}
                                            onChange={(e) => setMetaDescription(e.target.value)}
                                        />
                                        <FieldCharacterCounter
                                            current={metaDescription.length}
                                            max={LIMITS.metaDescription}
                                            recommendedMin={LIMITS.metaDescriptionOptimalMin}
                                            recommendedMax={LIMITS.metaDescriptionOptimalMax}
                                            translations={translations}
                                        />
                                        <small className="field-hint">
                                            {translations.metadescriptionhelp || 'Summary displayed beneath title in search results. Recommended: 140-160 characters.'}
                                        </small>
                                    </div>

                                    {/* Field: Focus Keywords */}
                                    <div className="form-group field-with-counter">
                                        <div className="field-label-row">
                                            <label htmlFor="metaKeywords" className="field-label">
                                                {translations.focuskeywords || 'Focus / Meta Keywords'}
                                            </label>
                                            <span className="character-limit-label">
                                                Max {LIMITS.metaKeywords} {translations.characters || 'chars'}
                                            </span>
                                        </div>
                                        <input
                                            type="text"
                                            id="metaKeywords"
                                            className="form-control seo-input"
                                            placeholder={translations.enterfocuskeywords || 'e.g. solitaire ring, 18k gold, conflict-free diamond'}
                                            value={metaKeywords}
                                            maxLength={LIMITS.metaKeywords}
                                            onChange={(e) => setMetaKeywords(e.target.value)}
                                        />
                                        <FieldCharacterCounter
                                            current={metaKeywords.length}
                                            max={LIMITS.metaKeywords}
                                            translations={translations}
                                        />
                                        {parsedKeywords.length > 0 && (
                                            <div className="keyword-chips-list">
                                                {parsedKeywords.map((kw, i) => (
                                                    <span key={i} className="keyword-chip">
                                                        #{kw}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        <small className="field-hint">
                                            {translations.focuskeywordshelp || 'Relevant keywords for search engine indexing and internal search optimization.'}
                                        </small>
                                    </div>

                                    {/* Field: Canonical URL */}
                                    <div className="form-group field-with-counter">
                                        <div className="field-label-row">
                                            <label htmlFor="canonicalUrl" className="field-label">
                                                {translations.canonicalurl || 'Canonical URL'}
                                            </label>
                                            <span className="character-limit-label">
                                                Max {LIMITS.canonicalUrl} {translations.characters || 'chars'}
                                            </span>
                                        </div>
                                        <div className="input-with-icon-wrapper">
                                            <LanguageIcon className="input-inner-icon" />
                                            <input
                                                type="url"
                                                id="canonicalUrl"
                                                className="form-control seo-input has-inner-icon"
                                                placeholder={translations.entercanonicalurl || 'https://gemoradiam.com/products/ring'}
                                                value={canonicalUrl}
                                                maxLength={LIMITS.canonicalUrl}
                                                onChange={(e) => setCanonicalUrl(e.target.value)}
                                            />
                                        </div>
                                        <FieldCharacterCounter
                                            current={canonicalUrl.length}
                                            max={LIMITS.canonicalUrl}
                                            translations={translations}
                                        />
                                        <small className="field-hint">
                                            {translations.canonicalurlhelp || 'Preferred URL version to prevent duplicate content indexing across variants.'}
                                        </small>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ========================================================= */}
                        {/* RIGHT COLUMN: Live Interactive Previews */}
                        {/* ========================================================= */}
                        <div className="seo-previews-column">
                            {/* Sticky Previews Container */}
                            <div className="sticky-previews-box">
                                <div className="previews-header-row">
                                    <div className="previews-title-group">
                                        <TravelExploreIcon className="previews-title-icon" />
                                        <h6 className="previews-heading">{translations.livepreview || 'Live Previews'}</h6>
                                    </div>
                                    <div className="device-toggle-group">
                                        <button
                                            type="button"
                                            className={`device-btn ${previewMode === 'desktop' ? 'active' : ''}`}
                                            onClick={() => setPreviewMode('desktop')}
                                            title="Desktop View"
                                        >
                                            <ComputerIcon fontSize="small" />
                                            <span>{translations.desktopview || 'Desktop'}</span>
                                        </button>
                                        <button
                                            type="button"
                                            className={`device-btn ${previewMode === 'mobile' ? 'active' : ''}`}
                                            onClick={() => setPreviewMode('mobile')}
                                            title="Mobile View"
                                        >
                                            <PhoneAndroidIcon fontSize="small" />
                                            <span>{translations.mobileview || 'Mobile'}</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Preview: Google SERP Snippet */}
                                <div className="preview-card google-serp-card">
                                    <div className="preview-card-header">
                                        <span className="card-tag google-tag">Google SERP</span>
                                        <span className="card-subtitle-note">
                                            {previewMode === 'desktop' ? 'Desktop Search Result' : 'Mobile Search Result'}
                                        </span>
                                    </div>
                                    <div className={`google-snippet-content mode-${previewMode}`}>
                                        <div className="google-snippet-top">
                                            <div className="google-favicon">
                                                <DiamondIcon fontSize="inherit" />
                                            </div>
                                            <div className="google-url-details">
                                                <span className="google-site-name">Gemora Diam</span>
                                                <span className="google-breadcrumb-path">
                                                    https://gemoradiam.com › products › {displaySlug}
                                                </span>
                                            </div>
                                        </div>
                                        <h4 className="google-result-title">
                                            {displayTitle}
                                        </h4>
                                        <p className="google-result-desc">
                                            {displayDescription}
                                        </p>
                                    </div>
                                    <div className="snippet-footer-bar">
                                        <button
                                            type="button"
                                            className="btn-copy-url"
                                            onClick={handleCopySlug}
                                        >
                                            {copiedSlug ? (
                                                <>
                                                    <CheckIcon fontSize="small" />
                                                    <span>{translations.linkcopied || 'Link copied!'}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <LinkIcon fontSize="small" />
                                                    <span>{translations.copyurl || 'Copy Link'}</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ========================================================= */}
                    {/* Bottom Sticky Action Footer */}
                    {/* ========================================================= */}
                    <div className="seo-form-actions-bar">
                        <div className="actions-left-info">
                            <span className="actions-status-dot" />
                            <span className="actions-status-text">
                                {translations.seoperformanceoverview || 'SEO Health'}: <strong>{seoHealth.percentage}%</strong> ({seoHealth.label})
                            </span>
                        </div>
                        <div className="actions-right-buttons">
                            <button
                                type="button"
                                className="btn btn-secondary btn-reset"
                                onClick={handleReset}
                                disabled={isSaving}
                            >
                                <RestartAltIcon fontSize="small" />
                                <span>{translations.reset || 'Reset'}</span>
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary btn-save"
                                disabled={isSaving}
                            >
                                <SaveIcon fontSize="small" />
                                <span>{isSaving ? (translations.saving || 'Saving...') : (translations.saveseocontent || 'Save SEO Content')}</span>
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
};

export default ItemSeoMarketingTab;
