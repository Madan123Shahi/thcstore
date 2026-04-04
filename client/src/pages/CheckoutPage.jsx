import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FiCheck } from 'react-icons/fi';
import { createOrder } from '../store/slices/orderSlice';
import { clearCart, selectCartItems, selectCartSubtotal, selectCartShipping, selectCartTax, selectCartTotal } from '../store/slices/cartSlice';
import { formatPrice, getImageUrl, INDIAN_STATES } from '../utils/helpers';
import toast from 'react-hot-toast';

const PAYMENT_METHODS = [
  { id: 'cod', label: 'Cash on Delivery', icon: '💵' },
  { id: 'upi', label: 'UPI Payment', icon: '📱' },
  { id: 'razorpay', label: 'Card / Netbanking', icon: '💳' },
];

const STEPS = ['Shipping', 'Payment', 'Review'];

export default function CheckoutPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);
  const shipping = useSelector(selectCartShipping);
  const tax = useSelector(selectCartTax);
  const total = useSelector(selectCartTotal);
  const { user } = useSelector(s => s.auth);
  const { loading } = useSelector(s => s.orders);

  const [step, setStep] = useState(0);
  const [address, setAddress] = useState({
    name: user?.name || '', line1: '', line2: '', city: '', state: '', pincode: '', phone: user?.phone || '',
  });
  const [paymentMethod, setPaymentMethod] = useState('cod');

  const handleAddress = (e) => setAddress(a => ({ ...a, [e.target.name]: e.target.value }));

  const validateAddress = () => {
    const required = ['name', 'line1', 'city', 'state', 'pincode', 'phone'];
    for (const f of required) {
      if (!address[f].trim()) { toast.error(`${f.charAt(0).toUpperCase() + f.slice(1)} is required`); return false; }
    }
    if (!/^\d{6}$/.test(address.pincode)) { toast.error('Enter a valid 6-digit pincode'); return false; }
    if (!/^[6-9]\d{9}$/.test(address.phone)) { toast.error('Enter a valid 10-digit phone number'); return false; }
    return true;
  };

  const handlePlaceOrder = async () => {
    const orderData = {
      items: items.map(i => ({ product: i.product._id, quantity: i.quantity })),
      shippingAddress: address,
      paymentMethod,
    };
    const res = await dispatch(createOrder(orderData));
    if (!res.error) {
      dispatch(clearCart());
      navigate(`/order-success/${res.payload._id}`);
    } else {
      toast.error(res.payload || 'Failed to place order');
    }
  };

  if (items.length === 0) { navigate('/cart'); return null; }

  return (
    <div className="page-container py-8 animate-fade-in">
      <h1 className="section-heading text-2xl mb-6">Checkout</h1>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors
              ${i < step ? 'bg-primary-600 text-white' : i === step ? 'bg-primary-100 text-primary-700 ring-2 ring-primary-400' : 'bg-gray-100 text-gray-400'}`}>
              {i < step ? <FiCheck /> : i + 1}
            </div>
            <span className={`text-sm font-medium hidden sm:block ${i === step ? 'text-primary-700' : 'text-gray-400'}`}>{s}</span>
            {i < STEPS.length - 1 && <div className={`w-8 sm:w-16 h-0.5 ${i < step ? 'bg-primary-400' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Step 0: Address */}
          {step === 0 && (
            <div className="card p-6 space-y-4">
              <h2 className="font-display font-bold text-gray-900 text-xl mb-4">Shipping Address</h2>
              {user?.addresses?.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2 font-medium">Saved Addresses</p>
                  <div className="space-y-2">
                    {user.addresses.map((a, i) => (
                      <button key={i} onClick={() => setAddress({ name: a.name, line1: a.line1, line2: a.line2 || '', city: a.city, state: a.state, pincode: a.pincode, phone: a.phone })}
                        className="w-full text-left p-3 rounded-xl border border-gray-200 hover:border-primary-400 transition-colors text-sm">
                        <p className="font-semibold text-gray-800">{a.name}</p>
                        <p className="text-gray-500 text-xs mt-0.5">{a.line1}, {a.city}, {a.state} - {a.pincode}</p>
                      </button>
                    ))}
                  </div>
                  <div className="my-4 flex items-center gap-3 text-xs text-gray-400">
                    <div className="flex-1 h-px bg-gray-200" /> or add new <div className="flex-1 h-px bg-gray-200" />
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Full Name *</label>
                  <input name="name" value={address.name} onChange={handleAddress} className="input-field" placeholder="Rahul Kumar" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Address Line 1 *</label>
                  <input name="line1" value={address.line1} onChange={handleAddress} className="input-field" placeholder="Flat / House No, Building, Street" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Address Line 2</label>
                  <input name="line2" value={address.line2} onChange={handleAddress} className="input-field" placeholder="Area, Colony (optional)" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">City *</label>
                  <input name="city" value={address.city} onChange={handleAddress} className="input-field" placeholder="Mumbai" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">State *</label>
                  <select name="state" value={address.state} onChange={handleAddress} className="input-field">
                    <option value="">Select State</option>
                    {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Pincode *</label>
                  <input name="pincode" value={address.pincode} onChange={handleAddress} className="input-field" placeholder="400001" maxLength={6} />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Phone *</label>
                  <input name="phone" value={address.phone} onChange={handleAddress} className="input-field" placeholder="9999999999" maxLength={10} />
                </div>
              </div>
              <button onClick={() => { if (validateAddress()) setStep(1); }} className="btn-primary w-full py-3 mt-2">
                Continue to Payment
              </button>
            </div>
          )}

          {/* Step 1: Payment */}
          {step === 1 && (
            <div className="card p-6">
              <h2 className="font-display font-bold text-gray-900 text-xl mb-6">Payment Method</h2>
              <div className="space-y-3">
                {PAYMENT_METHODS.map(m => (
                  <label key={m.id} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all
                    ${paymentMethod === m.id ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" name="payment" value={m.id} checked={paymentMethod === m.id} onChange={e => setPaymentMethod(e.target.value)} className="sr-only" />
                    <span className="text-2xl">{m.icon}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{m.label}</p>
                      {m.id === 'cod' && <p className="text-xs text-gray-400">Pay when you receive your order</p>}
                      {m.id === 'upi' && <p className="text-xs text-gray-400">PhonePe, GPay, Paytm etc.</p>}
                      {m.id === 'razorpay' && <p className="text-xs text-gray-400">Visa, Mastercard, Net Banking</p>}
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === m.id ? 'border-primary-500 bg-primary-500' : 'border-gray-300'}`}>
                      {paymentMethod === m.id && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </label>
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(0)} className="btn-secondary flex-1 py-3">← Back</button>
                <button onClick={() => setStep(2)} className="btn-primary flex-1 py-3">Review Order →</button>
              </div>
            </div>
          )}

          {/* Step 2: Review */}
          {step === 2 && (
            <div className="card p-6 space-y-5">
              <h2 className="font-display font-bold text-gray-900 text-xl">Review Your Order</h2>
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Shipping to</h3>
                <p className="text-sm text-gray-600">{address.name}</p>
                <p className="text-sm text-gray-600">{address.line1}{address.line2 && `, ${address.line2}`}</p>
                <p className="text-sm text-gray-600">{address.city}, {address.state} - {address.pincode}</p>
                <p className="text-sm text-gray-600">📞 {address.phone}</p>
              </div>
              <div className="space-y-2">
                {items.map(({ product, quantity }) => (
                  <div key={product._id} className="flex gap-3 items-center">
                    <img src={getImageUrl(product.images?.[0]?.url)} alt={product.name} className="w-12 h-12 rounded-lg object-cover bg-gray-100 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 line-clamp-1">{product.name}</p>
                      <p className="text-xs text-gray-400">Qty: {quantity}</p>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{formatPrice(product.price * quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-secondary flex-1 py-3">← Back</button>
                <button onClick={handlePlaceOrder} disabled={loading} className="btn-primary flex-1 py-3">
                  {loading ? 'Placing Order…' : `Place Order • ${formatPrice(total)}`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order summary sidebar */}
        <div className="card p-5 h-fit space-y-3">
          <h3 className="font-semibold text-gray-900">Order Summary</h3>
          <div className="space-y-1.5 text-sm text-gray-600">
            <div className="flex justify-between"><span>Items ({items.reduce((a, i) => a + i.quantity, 0)})</span><span>{formatPrice(subtotal)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span className={shipping === 0 ? 'text-primary-600' : ''}>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span></div>
            <div className="flex justify-between"><span>Tax (5%)</span><span>{formatPrice(tax)}</span></div>
          </div>
          <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100">
            <span>Total</span><span>{formatPrice(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
