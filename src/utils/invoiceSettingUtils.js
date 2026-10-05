const DEFAULT_INVOICE_PREFIX = 'INV-';

export function parseInvoiceSettingsFromResponse(data) {
    if (!data || typeof data !== 'object') {
        return { notes: '', invoicePrefix: DEFAULT_INVOICE_PREFIX };
    }

    const payload = data.invoiceSetting ?? data.invoiceSettings ?? data.result ?? data.data ?? data;

    const notes =
        payload?.notes ??
        payload?.Notes ??
        data.notes ??
        payload?.thankyoumessage ??
        payload?.thankYouMessage ??
        data.thankyoumessage ??
        '';

    const invoicePrefix =
        payload?.invoiceprefix ?? payload?.invoicePrefix ?? data.invoiceprefix ?? DEFAULT_INVOICE_PREFIX;

    return {
        notes: String(notes).trim(),
        invoicePrefix: String(invoicePrefix).trim() || DEFAULT_INVOICE_PREFIX,
    };
}

export async function fetchInvoiceSettings(adminPanelBackendPath) {
    const defaults = { notes: '', invoicePrefix: DEFAULT_INVOICE_PREFIX };
    if (!adminPanelBackendPath) return defaults;

    const tokenname = import.meta.env.VITE_AdminTOKEN_NAME;
    const token = localStorage.getItem(tokenname);
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;

    try {
        const response = await fetch(`${adminPanelBackendPath}/System/GetInvoiceSetting`, {
            method: 'GET',
            headers,
        });
        const data = await response.json();
        if (!response.ok) return defaults;
        return parseInvoiceSettingsFromResponse(data);
    } catch {
        return defaults;
    }
}