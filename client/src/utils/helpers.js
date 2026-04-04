export const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

export const formatDate = (date) =>
  new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(date));

export const getDiscountPercent = (price, mrp) =>
  mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

export const truncate = (str, n = 80) =>
  str?.length > n ? str.slice(0, n) + '…' : str;

export const slugify = (str) =>
  str?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || '';

export const getImageUrl = (url) =>
  url || 'https://placehold.co/400x400/e5e7eb/9ca3af?text=No+Image';

export const ORDER_STATUS_COLORS = {
  pending:    'bg-yellow-100 text-yellow-800',
  confirmed:  'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped:    'bg-indigo-100 text-indigo-800',
  delivered:  'bg-green-100 text-green-800',
  cancelled:  'bg-red-100 text-red-800',
  refunded:   'bg-gray-100 text-gray-800',
};

export const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest First' },
  { value: 'price',     label: 'Price: Low to High' },
  { value: '-price',    label: 'Price: High to Low' },
  { value: '-rating',   label: 'Top Rated' },
  { value: '-numReviews', label: 'Most Reviewed' },
];

export const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Andaman and Nicobar Islands','Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu','Delhi','Jammu and Kashmir',
  'Ladakh','Lakshadweep','Puducherry',
];
