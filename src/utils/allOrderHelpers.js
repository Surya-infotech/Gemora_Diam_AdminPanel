import { Country, State } from 'country-state-city';
import HandleUnauthorized from './HandleUnauthorized';

export const ORDER_STATUS_OPTIONS = [
  { label: 'Pending', value: 'Pending' },
  { label: 'Confirmed', value: 'Confirmed' },
  { label: 'Processing', value: 'Processing' },
  { label: 'Shipped', value: 'Shipped' },
  { label: 'Delivered', value: 'Delivered' },
  { label: 'Cancelled', value: 'Cancelled' }
];

export const PAYMENT_STATUS_OPTIONS = [
  { label: 'Paid', value: 'Paid' },
  { label: 'Pending', value: 'Pending' },
  { label: 'Failed', value: 'Failed' },
  { label: 'Refunded', value: 'Refunded' }
];

export const PAYMENT_METHOD_OPTIONS = [
  { label: 'Cash', value: 'Cash' },
  { label: 'Credit/Debit Card', value: 'Credit/Debit Card' },
  { label: 'UPI', value: 'UPI' },
  { label: 'Bank Transfer', value: 'Bank Transfer' },
  { label: 'PayPal', value: 'PayPal' },
  { label: 'Other', value: 'Other' }
];

export const createEmptyItemRow = () => ({
  itemid: null,
  itemname: '',
  sku: '',
  image: '',
  metalname: '',
  shapename: '',
  clarityname: '',
  stonename: '',
  ringsize: '',
  closuretype: '',
  specialinstruction: '',
  qty: 1,
  price: ''
});

export const getItemDefaultPrice = item => {
  const pricing = item?.pricing;
  if (!pricing) return '';
  if (pricing.priceType === 'metal_wise' && Array.isArray(pricing.metalWisePrices) && pricing.metalWisePrices.length > 0) {
    return pricing.metalWisePrices[0].price ?? '';
  }
  if (Array.isArray(pricing.metalWithStoneDiamondCaratPrices) && pricing.metalWithStoneDiamondCaratPrices.length > 0) {
    const first = pricing.metalWithStoneDiamondCaratPrices[0];
    if (first.hasCarat && Array.isArray(first.caratPrices) && first.caratPrices.length > 0) {
      return first.caratPrices[0].price ?? '';
    }
    return first.price ?? '';
  }
  return '';
};

export const toDateInputValue = dateStr => {
  if (!dateStr) return new Date().toISOString().split('T')[0];
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? new Date().toISOString().split('T')[0] : d.toISOString().split('T')[0];
};

export const computeSubtotal = items => (
  items.reduce((sum, row) => {
    const qty = Math.max(1, parseInt(row.qty, 10) || 1);
    const price = Math.max(0, Number(row.price) || 0);
    return sum + qty * price;
  }, 0)
);

export const applyCustomerSelection = (val, customers) => {
  if (!val) return null;
  const cust = customers.find(c => String(c.customerid) === String(val));
  if (!cust) return null;
  const result = {
    customerName: cust.fullname || '',
    customerEmail: cust.email || '',
    customerPhone: cust.phone || ''
  };
  if (cust.defaultAddress) {
    result.address = cust.defaultAddress.address || '';
    result.cityName = cust.defaultAddress.city || '';
    result.stateName = cust.defaultAddress.state || '';
    result.countryName = cust.defaultAddress.country || '';
    const matchedCountry = Country.getAllCountries().find(
      c => c.name.toLowerCase() === String(cust.defaultAddress.country || '').toLowerCase()
    );
    if (matchedCountry) {
      result.countryCode = matchedCountry.isoCode;
      const matchedState = State.getStatesOfCountry(matchedCountry.isoCode).find(
        s => s.name.toLowerCase() === String(cust.defaultAddress.state || '').toLowerCase()
      );
      result.stateCode = matchedState ? matchedState.isoCode : '';
    }
  }
  return result;
};

export const applyProductSelectionToRow = (row, itemIdStr, catalogItems) => {
  if (!itemIdStr) {
    return { ...row, itemid: null, sku: '', image: '' };
  }
  const product = catalogItems.find(it => String(it.itemid) === String(itemIdStr));
  if (!product) return row;
  const defaultPrice = getItemDefaultPrice(product);
  return {
    ...row,
    itemid: product.itemid,
    itemname: product.itemname || row.itemname,
    sku: product.sku || '',
    image: product.image || '',
    price: row.price === '' || Number(row.price) === 0 ? defaultPrice : row.price,
    shapename: product.shapes?.[0]?.shapename || row.shapename,
    clarityname: product.clarities?.[0]?.clarityname || row.clarityname,
    stonename: product.stones?.[0]?.stonename || row.stonename,
    ringsize: product.ringsizes?.[0]?.ringsize || row.ringsize,
    closuretype: Array.isArray(product.closuretypes) && product.closuretypes.length > 0
      ? (typeof product.closuretypes[0] === 'string' ? product.closuretypes[0] : product.closuretypes[0]?.label || '')
      : row.closuretype
  };
};

export const validateAllOrderFields = ({ customerName, orderItems }) => {
  if (!customerName.trim()) {
    return { valid: false, message: 'Customer Name is required' };
  }
  const validItems = orderItems.filter(it => it.itemname.trim());
  if (validItems.length === 0) {
    return { valid: false, message: 'Please enter at least one item' };
  }
  for (let i = 0; i < validItems.length; i += 1) {
    const row = validItems[i];
    if (!row.qty || Number(row.qty) < 1) {
      return { valid: false, message: `Item #${i + 1}: Quantity must be at least 1` };
    }
    if (row.price === '' || Number(row.price) < 0 || isNaN(Number(row.price))) {
      return { valid: false, message: `Item #${i + 1}: Please enter a valid unit price` };
    }
  }
  return { valid: true, validItems };
};

export const buildAllOrderPayload = ({
  selectedCustomerId,
  customerName,
  customerEmail,
  customerPhone,
  validItems,
  displayedTotal,
  orderStatus,
  paymentStatus,
  paymentMethod,
  orderDate,
  notes,
  address,
  pincode,
  countryName,
  countryCode,
  stateName,
  stateCode,
  cityName,
  selectedFiscalYear
}) => ({
  customerid: selectedCustomerId ? Number(selectedCustomerId) : null,
  customername: customerName.trim(),
  customeremail: customerEmail.trim(),
  customerphone: customerPhone.trim(),
  items: validItems.map(it => ({
    itemid: it.itemid,
    itemname: it.itemname.trim(),
    sku: it.sku.trim(),
    image: it.image,
    metalname: it.metalname.trim(),
    shapename: it.shapename.trim(),
    clarityname: it.clarityname.trim(),
    stonename: it.stonename.trim(),
    ringsize: it.ringsize.trim(),
    closuretype: it.closuretype.trim(),
    specialinstruction: it.specialinstruction.trim(),
    qty: Math.max(1, parseInt(it.qty, 10) || 1),
    price: Math.max(0, Number(it.price) || 0)
  })),
  total: Number(displayedTotal) || 0,
  orderstatus: orderStatus,
  paymentstatus: paymentStatus,
  paymentmethod: paymentMethod,
  orderdate: orderDate ? new Date(orderDate).toISOString() : new Date().toISOString(),
  notes: notes.trim(),
  shippingaddress: {
    address: address.trim(),
    pincode: pincode.trim(),
    countryname: countryName,
    countrycode: countryCode,
    statename: stateName,
    statecode: stateCode,
    cityname: cityName
  },
  fiscalyearid: selectedFiscalYear && selectedFiscalYear !== 'all' ? Number(selectedFiscalYear) : undefined
});

export const fetchAllOrderLookups = async ({ adminPanelBackendPath, token, logoutUser, navigate }) => {
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
  const [custRes, itemRes, miscRes, currRes] = await Promise.all([
    fetch(`${adminPanelBackendPath}/User/GetCustomers`, { headers }),
    fetch(`${adminPanelBackendPath}/Products/GetItems`, { headers }),
    fetch(`${adminPanelBackendPath}/System/GetMiscSetting`, { headers }),
    fetch(`${adminPanelBackendPath}/System/GetCurrencies`, { headers })
  ]);
  const [custData, itemData, miscData, currData] = await Promise.all([
    custRes.json(),
    itemRes.json(),
    miscRes.json(),
    currRes.json()
  ]);

  if (HandleUnauthorized(custData, logoutUser, navigate)) return null;

  const currList = Array.isArray(currData) ? currData : currData?.currencies || [];
  const matchedCurrency = miscRes.ok && currRes.ok
    ? currList.find(c => Number(c.currencyid) === Number(miscData?.currencyid)) || null
    : null;

  return {
    customers: custRes.ok && Array.isArray(custData?.customers) ? custData.customers : [],
    catalogItems: itemRes.ok && Array.isArray(itemData?.items) ? itemData.items : [],
    activeCurrency: matchedCurrency
  };
};