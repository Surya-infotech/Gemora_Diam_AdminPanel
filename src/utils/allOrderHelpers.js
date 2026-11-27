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

export const COUNTRY_OPTIONS = [
  { label: 'Select country', value: '' },
  { label: 'USA', value: 'USA' },
  { label: 'Australia', value: 'Australia' },
  { label: 'UK', value: 'UK' },
  { label: 'Canada', value: 'Canada' },
  { label: 'Other', value: 'Other' }
];

export const JEWELRY_TYPE_OPTIONS = [
  { label: 'Select type', value: '' },
  { label: 'Ring', value: 'Ring' },
  { label: 'Band', value: 'Band' },
  { label: 'Bracelet', value: 'Bracelet' },
  { label: 'Earring', value: 'Earring' },
  { label: 'Pendant', value: 'Pendant' }
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

export const STONE_TYPE_OPTIONS = [
  { label: 'Select stone type', value: '' },
  { label: 'Moissanite', value: 'Moissanite' },
  { label: 'Lab-Grown Diamond', value: 'Lab-Grown Diamond' }
];

export const STONE_SHAPE_OPTIONS = [
  { label: 'Select shape', value: '' },
  { label: 'Round', value: 'Round' },
  { label: 'Marquise', value: 'Marquise' },
  { label: 'Oval', value: 'Oval' },
  { label: 'Emerald', value: 'Emerald' },
  { label: 'Cushion', value: 'Cushion' },
  { label: 'Heart', value: 'Heart' },
  { label: 'Pear', value: 'Pear' }
];

export const CENTER_CARAT_OPTIONS = [
  { label: 'Select carat', value: '' },
  { label: '1.00 Ct', value: '1.00 Ct' },
  { label: '1.50 Ct', value: '1.50 Ct' },
  { label: '2.00 Ct', value: '2.00 Ct' },
  { label: '2.50 Ct', value: '2.50 Ct' },
  { label: '3.00 Ct', value: '3.00 Ct' }
];

export const SIDE_STONE_OPTIONS = [
  { label: 'Select side stone', value: '' },
  { label: 'Moissanite', value: 'Moissanite' },
  { label: 'Lab-Grown Diamond', value: 'Lab-Grown Diamond' }
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

export const PRIORITY_OPTIONS = [
  { label: 'Normal', value: 'Normal' },
  { label: 'Urgent', value: 'Urgent' },
  { label: 'Rush', value: 'Rush' }
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
  country: '',
  jewelryType: '',
  product: '',
  metal: '',
  ringSize: '',
  stoneType: '',
  stoneShape: '',
  centerCarat: '',
  sideStoneType: '',
  measurements: '',
  employee: '',
  stone: '',
  status: 'Order Received',
  targetDate: '',
  priority: 'Normal',
  productionNotes: '',
  conversation: '',
  totalAmount: '',
  paidAmount: '',
  dispatchDate: '',
  courier: '',
  tracking: '',
  trackingLink: '',
  deliveryDate: '',
  dispatchNotes: ''
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

export const buildAllOrderFormData = ({ form, files, selectedFiscalYear }) => {
  const formData = new FormData();
  Object.entries(form).forEach(([key, value]) => {
    formData.append(key, value ?? '');
  });
  if (selectedFiscalYear && selectedFiscalYear !== 'all') {
    formData.append('fiscalyearid', String(selectedFiscalYear));
  }
  if (files.photoFile) formData.append('photoFile', files.photoFile);
  if (files.cadFile) formData.append('cadFile', files.cadFile);
  if (files.otherFile) formData.append('otherFile', files.otherFile);
  return formData;
};