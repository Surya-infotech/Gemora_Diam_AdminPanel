import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import profilePlaceholder from '../../../assets/profile-placeholder.png';
import { useLanguage } from '../../../Context/LanguageContext';

const OverviewTab = ({ employeeData }) => {
    const { translations } = useLanguage();

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;
            return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        } catch {
            return dateString;
        }
    };

    if (!employeeData) {
        return (
            <div className="no-data-message">
                <p>{translations.nodatafound}</p>
            </div>
        );
    }

    const fullName = `${employeeData.firstname || ''} ${employeeData.lastname || ''}`.trim() || '-';
    const role = employeeData.role || employeeData.employeetype || 'Employee';

    return (
        <div className="employeeoverview-card">
            <div className="employee-header-section">
                <div className="employee-image-container">
                    <img
                        src={employeeData.profileimage || profilePlaceholder}
                        alt={fullName}
                        className="employee-overview-image"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = profilePlaceholder;
                        }}
                    />
                </div>
                <div className="employee-title-section">
                    <h4 className="employee-name-title">{fullName}</h4>
                    <p className="employee-business-title">{role}</p>
                    <div className="employee-contact-info">
                        {employeeData.phone && (
                            <p className="employee-mobile">
                                <PhoneIcon className="contact-icon" />
                                {employeeData.phone}
                            </p>
                        )}
                        {employeeData.email && (
                            <p className="employee-mobile">
                                <EmailIcon className="contact-icon" />
                                {employeeData.email}
                            </p>
                        )}
                    </div>
                </div>
                <span className={`status-badge ${employeeData.status ? 'active' : 'inactive'}`}>
                    {employeeData.status ? (translations.active) : (translations.inactive)}
                </span>
            </div>

            <div className="employee-details-section">
                <div className="details-grid">
                    <div className="detail-item">
                        <span className="detail-label">{translations.employeeid}</span>
                        <span className="detail-value">{employeeData.employeeid || employeeData._id || '-'}</span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">{translations.role}</span>
                        <span className="detail-value">{role}</span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">{translations.gender}</span>
                        <span className="detail-value">{employeeData.gender || '-'}</span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">{translations.status}</span>
                        <span className={`detail-value ${employeeData.status ? 'active' : 'inactive'}`}>
                            {employeeData.status ? (translations.active) : (translations.inactive)}
                        </span>
                    </div>
                    {employeeData.address && (
                        <div className="detail-item">
                            <span className="detail-label">{translations.address}</span>
                            <span className="detail-value">{employeeData.address}</span>
                        </div>
                    )}
                    {employeeData.cityname && (
                        <div className="detail-item">
                            <span className="detail-label">{translations.city}</span>
                            <span className="detail-value">{employeeData.cityname}</span>
                        </div>
                    )}
                    {employeeData.statename && (
                        <div className="detail-item">
                            <span className="detail-label">{translations.state}</span>
                            <span className="detail-value">{employeeData.statename}</span>
                        </div>
                    )}
                    {employeeData.countryname && (
                        <div className="detail-item">
                            <span className="detail-label">{translations.country}</span>
                            <span className="detail-value">{employeeData.countryname}</span>
                        </div>
                    )}
                    <div className="detail-item">
                        <span className="detail-label">{translations.createdat}</span>
                        <span className="detail-value">{formatDate(employeeData.createdAt)}</span>
                    </div>
                    {employeeData.updatedAt && (
                        <div className="detail-item">
                            <span className="detail-label">{translations.updatedat}</span>
                            <span className="detail-value">{formatDate(employeeData.updatedAt)}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OverviewTab;