import moment from 'moment-timezone';

export const formatDateTime = (dateString, miscSettings) => {
    if (!dateString) return '-';
    const timeZone = miscSettings?.timeZone;
    const dateFormat = miscSettings?.dateFormat || 'DD/MM/YYYY';
    const timeFormat = miscSettings?.timeFormat || 'hh:mm A';
    try {
        const m = timeZone ? moment.tz(dateString, timeZone) : moment(dateString);
        if (m.isValid()) {
            return m.format(`${dateFormat} ${timeFormat}`);
        }
        return String(dateString);
    } catch {
        return String(dateString);
    }
};

export const formatDate = (dateString, miscSettings) => {
    if (!dateString) return '-';
    const timeZone = miscSettings?.timeZone;
    const dateFormat = miscSettings?.dateFormat || 'DD/MM/YYYY';
    try {
        const m = timeZone ? moment.tz(dateString, timeZone) : moment(dateString);
        if (m.isValid()) {
            return m.format(dateFormat);
        }
        return String(dateString);
    } catch {
        return String(dateString);
    }
};

export default formatDateTime;
