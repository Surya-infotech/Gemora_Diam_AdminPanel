export const SHOP_OPTIONS = [
  { label: 'Select shop', value: '' },
  { label: 'Aura', value: 'Aura' },
  { label: 'Gemora', value: 'Gemora' },
  { label: 'Domixa', value: 'Domixa' },
  { label: 'SmilingstonebyUk', value: 'SmilingstonebyUk' },
  { label: 'SmilingstoneJewels', value: 'SmilingstoneJewels' },
  { label: 'Valora', value: 'Valora' },
  { label: 'Nexa', value: 'Nexa' }
];

export const METAL_OPTIONS = [
  { label: 'Select metal', value: '' },
  { label: '925 Silver', value: '925 Silver' },
  { label: '925 Silver Rose', value: '925 Silver Rose' },
  { label: '925 Silver Yellow', value: '925 Silver Yellow' },
  { label: '10K White Gold', value: '10K White Gold' },
  { label: '10K Yellow Gold', value: '10K Yellow Gold' },
  { label: '10K Rose Gold', value: '10K Rose Gold' },
  { label: '14K White Gold', value: '14K White Gold' },
  { label: '14K Yellow Gold', value: '14K Yellow Gold' },
  { label: '14K Rose Gold', value: '14K Rose Gold' },
  { label: '18K White Gold', value: '18K White Gold' },
  { label: '18K Yellow Gold', value: '18K Yellow Gold' },
  { label: '18K Rose Gold', value: '18K Rose Gold' },
  { label: '950 Platinum', value: '950 Platinum' }
];

export const ALL_ORDER_STATUS_OPTIONS = [
  { label: 'Order Received', value: 'Order Received' },
  { label: 'CAD Pending', value: 'CAD Pending' },
  { label: 'CAD Approved', value: 'CAD Approved' },
  { label: 'Casting', value: 'Casting' },
  { label: 'Polishing', value: 'Polishing' },
  { label: 'Diamond Setting', value: 'Diamond Setting' },
  { label: 'Quality Check', value: 'Quality Check' },
  { label: 'Ready to Dispatch', value: 'Ready to Dispatch' },
  { label: 'Dispatched', value: 'Dispatched' },
  { label: 'Delivered', value: 'Delivered' },
  { label: 'On Hold', value: 'On Hold' }
];

export const COURIER_OPTIONS = [
  { label: 'Select', value: '' },
  { label: 'FedEx', value: 'FedEx' },
  { label: 'UPS', value: 'UPS' },
  { label: 'DHL', value: 'DHL' },
  { label: 'USPS', value: 'USPS' },
  { label: 'Other', value: 'Other' }
];

export const INITIAL_ALL_ORDER_FORM = {
  orderId: '',
  customer: '',
  orderDate: '',
  orderLink: '',
  shopName: '',
  metal: '',
  employee: '',
  status: 'Order Received',
  conversation: '',
  dispatchDate: '',
  courier: '',
  tracking: '',
  trackingLink: ''
};

export const validateAllOrderForm = form => {
  if (!String(form.orderId || '').trim()) {
    return { valid: false, message: 'Etsy Order ID is required' };
  }
  if (!String(form.customer || '').trim()) {
    return { valid: false, message: 'Customer name is required' };
  }
  return { valid: true };
};

export const buildAllOrderPayload = ({ form, selectedFiscalYear }) => ({
  ...form,
  fiscalyearid: selectedFiscalYear && selectedFiscalYear !== 'all' ? Number(selectedFiscalYear) : undefined
});

export const openDatePicker = e => {
  try {
    e.currentTarget.showPicker?.();
  } catch {
    // Ignore browsers where showPicker is unsupported or restricted
  }
};