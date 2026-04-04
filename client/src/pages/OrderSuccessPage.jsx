// OrderSuccessPage.jsx
import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiCheckCircle, FiPackage } from 'react-icons/fi';
import { fetchOrder } from '../store/slices/orderSlice';
import { formatPrice, formatDate } from '../utils/helpers';

export default function OrderSuccessPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { current: order } = useSelector(s => s.orders);

  useEffect(() => { dispatch(fetchOrder(id)); }, [id, dispatch]);

  return (
    <div className="page-container py-16 max-w-2xl mx-auto text-center animate-fade-in">
      <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <FiCheckCircle className="text-4xl text-primary-600" />
      </div>
      <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">Order Placed!</h1>
      <p className="text-gray-400 mb-6">Thank you for your order. We'll send you a confirmation email shortly.</p>

      {order && (
        <div className="card p-6 text-left mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-gray-400">Order Number</p>
              <p className="font-bold text-gray-900">#{order.orderNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Order Date</p>
              <p className="font-medium text-gray-700 text-sm">{formatDate(order.createdAt)}</p>
            </div>
          </div>
          <div className="space-y-2 mb-4">
            {order.items?.map(item => (
              <div key={item._id} className="flex items-center justify-between text-sm">
                <span className="text-gray-700 line-clamp-1 flex-1 mr-4">{item.name} × {item.quantity}</span>
                <span className="font-semibold text-gray-900 shrink-0">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="pt-3 border-t border-gray-100 flex justify-between font-bold text-gray-900">
            <span>Total Paid</span>
            <span>{formatPrice(order.totalPrice)}</span>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/orders" className="btn-primary px-8 py-3 flex items-center gap-2 justify-center">
          <FiPackage /> Track Order
        </Link>
        <Link to="/products" className="btn-secondary px-8 py-3">Continue Shopping</Link>
      </div>
    </div>
  );
}
