import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiChevronRight, FiPackage } from 'react-icons/fi';
import { fetchOrder } from '../store/slices/orderSlice';
import { formatPrice, formatDate, ORDER_STATUS_COLORS, getImageUrl } from '../utils/helpers';
import { PageLoader } from '../components/common';

const ORDER_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

export default function OrderDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { current: order, loading } = useSelector(s => s.orders);

  useEffect(() => { dispatch(fetchOrder(id)); }, [id, dispatch]);

  if (loading) return <PageLoader />;
  if (!order) return null;

  const stepIdx = ORDER_STEPS.indexOf(order.orderStatus);

  return (
    <div className="page-container py-8 max-w-3xl mx-auto animate-fade-in">
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link to="/orders" className="hover:text-primary-600">Orders</Link>
        <FiChevronRight className="text-xs" />
        <span className="text-gray-700">#{order.orderNumber}</span>
      </nav>

      <div className="flex items-center justify-between mb-6">
        <h1 className="section-heading text-xl">Order #{order.orderNumber}</h1>
        <span className={`badge ${ORDER_STATUS_COLORS[order.orderStatus]} text-sm px-3 py-1`}>
          {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
        </span>
      </div>

      {/* Progress */}
      {order.orderStatus !== 'cancelled' && order.orderStatus !== 'refunded' && (
        <div className="card p-5 mb-5">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 z-0" />
            <div
              className="absolute top-4 left-0 h-0.5 bg-primary-500 z-0 transition-all duration-700"
              style={{ width: `${(Math.max(stepIdx, 0) / (ORDER_STEPS.length - 1)) * 100}%` }}
            />
            {ORDER_STEPS.map((s, i) => (
              <div key={s} className="relative z-10 flex flex-col items-center gap-1.5">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors
                  ${i <= stepIdx ? 'bg-primary-600 border-primary-600 text-white' : 'bg-white border-gray-300 text-gray-400'}`}>
                  {i < stepIdx ? '✓' : i + 1}
                </div>
                <span className="text-[10px] text-gray-500 capitalize hidden sm:block">{s}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        {/* Shipping */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><FiPackage className="text-primary-600" /> Shipping Address</h3>
          <p className="text-sm text-gray-700 font-medium">{order.shippingAddress?.name}</p>
          <p className="text-sm text-gray-500">{order.shippingAddress?.line1}</p>
          {order.shippingAddress?.line2 && <p className="text-sm text-gray-500">{order.shippingAddress.line2}</p>}
          <p className="text-sm text-gray-500">{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
          <p className="text-sm text-gray-500 mt-1">📞 {order.shippingAddress?.phone}</p>
        </div>

        {/* Payment */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 mb-3">Payment</h3>
          <p className="text-sm text-gray-700 capitalize">Method: {order.paymentMethod}</p>
          <p className="text-sm mt-1">
            Status: <span className={order.isPaid ? 'text-primary-600 font-medium' : 'text-orange-500 font-medium'}>
              {order.isPaid ? `Paid on ${formatDate(order.paidAt)}` : 'Pending'}
            </span>
          </p>
          {order.trackingNumber && (
            <p className="text-sm text-gray-600 mt-2">
              Tracking: <span className="font-mono font-semibold">{order.trackingNumber}</span>
            </p>
          )}
          <div className="mt-3 pt-3 border-t border-gray-100 space-y-1 text-sm">
            <div className="flex justify-between text-gray-500"><span>Items</span><span>{formatPrice(order.itemsPrice)}</span></div>
            <div className="flex justify-between text-gray-500"><span>Shipping</span><span>{order.shippingPrice === 0 ? 'Free' : formatPrice(order.shippingPrice)}</span></div>
            <div className="flex justify-between text-gray-500"><span>Tax</span><span>{formatPrice(order.taxPrice)}</span></div>
            <div className="flex justify-between font-bold text-gray-900 pt-1 border-t border-gray-100">
              <span>Total</span><span>{formatPrice(order.totalPrice)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="card p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Order Items</h3>
        <div className="space-y-3">
          {order.items?.map(item => (
            <div key={item._id} className="flex items-center gap-4">
              <img src={getImageUrl(item.image)} alt={item.name} className="w-14 h-14 rounded-xl object-cover bg-gray-50 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 line-clamp-2">{item.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">Qty: {item.quantity} × {formatPrice(item.price)}</p>
              </div>
              <span className="font-bold text-gray-900 text-sm shrink-0">{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
