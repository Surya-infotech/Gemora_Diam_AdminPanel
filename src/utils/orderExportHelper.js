import { formatPriceWithCurrency } from './CurrencyFormatter';
import { formatDateTime } from './dateTimeFormatter';

const formatOrderItemDetails = (items = [], currencyDetails) => {
  if (!Array.isArray(items) || items.length === 0) return '';
  return items
    .map(item => {
      const specs = [
        item.metalname && `Metal: ${item.metalname}`,
        item.stonename && `Stone: ${item.stonename}`,
        item.diamondsize && `Diamond Size: ${item.diamondsize}`,
        item.shapename && `Shape: ${item.shapename}`,
        item.clarityname && `Clarity: ${item.clarityname}`,
        item.diamondcolor && `Diamond Color: ${item.diamondcolor}`,
        item.bandcolor && `Metal Color: ${item.bandcolor}`,
        (item.ringsize || item.size) && `Ring Size: ${item.ringsize || item.size}`,
        item.closuretype && `Closure Type: ${item.closuretype}`
      ].filter(Boolean).join(', ');
      const qty = item.qty || 1;
      const unitPrice = formatPriceWithCurrency(item.price || 0, currencyDetails);
      const lineTotal = formatPriceWithCurrency(item.totalprice ?? (item.price || 0) * qty, currencyDetails);
      const note = item.specialinstruction ? `, Note: ${item.specialinstruction}` : '';
      return `${item.itemname || 'Item'} (Qty: ${qty}, Price: ${unitPrice}, Total: ${lineTotal}${specs ? `, ${specs}` : ''}${note})`;
    })
    .join(' | ');
};

/**
 * Column definitions for exporting full Order details to CSV / Excel.
 */
export const getOrderExportColumns = miscSettings => [
  {
    key: 'ordernumber',
    label: 'Order No.',
    getValue: row => `#${row.ordernumber != null ? row.ordernumber : row.orderid || ''}`
  },
  { key: 'orderid', label: 'Order ID' },
  { key: 'customername', label: 'Customer Name' },
  { key: 'customeremail', label: 'Customer Email' },
  { key: 'customerphone', label: 'Customer Phone' },
  {
    key: 'totalitems',
    label: 'Total Items',
    getValue: row => row.totalitems || (row.items || []).reduce((acc, i) => acc + (i.qty || 1), 0)
  },
  {
    key: 'items',
    label: 'Items Details',
    getValue: row => formatOrderItemDetails(row.items, row.currencydetails)
  },
  {
    key: 'subtotal',
    label: 'Subtotal',
    getValue: row => formatPriceWithCurrency(row.subtotal || 0, row.currencydetails)
  },
  {
    key: 'total',
    label: 'Total Amount',
    getValue: row => formatPriceWithCurrency(row.total || 0, row.currencydetails)
  },
  {
    key: 'currency',
    label: 'Currency',
    getValue: row => row.currencydetails?.currency || ''
  },
  {
    key: 'paymentstatus',
    label: 'Payment Status',
    getValue: row => row.paymentstatus || 'Paid'
  },
  { key: 'paymentmethod', label: 'Payment Method' },
  { key: 'transactionid', label: 'Transaction ID' },
  {
    key: 'orderstatus',
    label: 'Order Status',
    getValue: row => row.orderstatus || 'Confirmed'
  },
  { key: 'cancelreason', label: 'Cancel Reason' },
  { key: 'cancelledby', label: 'Cancelled By' },
  {
    key: 'cancelledat',
    label: 'Cancelled At',
    getValue: row => (row.cancelledat ? formatDateTime(row.cancelledat, miscSettings) : '')
  },
  {
    key: 'addressTitle',
    label: 'Address Title',
    getValue: row => row.shippingaddress?.title || ''
  },
  {
    key: 'shippingAddress',
    label: 'Shipping Address',
    getValue: row => row.shippingaddress?.address || ''
  },
  {
    key: 'city',
    label: 'City',
    getValue: row => row.shippingaddress?.cityname || ''
  },
  {
    key: 'state',
    label: 'State',
    getValue: row => row.shippingaddress?.statename || ''
  },
  {
    key: 'country',
    label: 'Country',
    getValue: row => row.shippingaddress?.countryname || ''
  },
  {
    key: 'pincode',
    label: 'Postal / PIN Code',
    getValue: row => row.shippingaddress?.pincode || ''
  },
  {
    key: 'createdAt',
    label: 'Order Date',
    getValue: row => (row.createdAt ? formatDateTime(row.createdAt, miscSettings) : '')
  },
  {
    key: 'updatedAt',
    label: 'Updated At',
    getValue: row => (row.updatedAt ? formatDateTime(row.updatedAt, miscSettings) : '')
  }
];