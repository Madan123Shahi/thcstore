// OrdersPage.jsx
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FiPackage } from 'react-icons/fi';
import { fetchMyOrders } from '../store/slices/orderSlice';
import { formatPrice, formatDate, ORDER_STATUS_COLORS } from '../utils/helpers';
import { PageLoader, EmptyState } from '../components/common';

export default function OrdersPage() {
  const dispatch = useDispatch();
  const { myOrders: orders, loading } = useSelector(s => s.orders);

  useEffect(() => { dispatch(fetchMyOrders()); }, [dispatch]);

  if (loading) return <PageLoader />;

  return (
    <div className="page-container py-8 max-w-3xl mx-auto animate-fade-in">
      <h1 className="section-heading text-2xl mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <EmptyState
          icon={FiPackage}
          title="No orders yet"
          description="Start shopping to see your orders here"
          action={<Link to="/products" className="btn-primary px-6 py-2.5 text-sm">Shop Now</Link>}
        />
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <Link key={order._id} to={`/orders/${order._id}`} className="card p-5 block hover:shadow-card-hover transition-shadow">
              <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                <div>
                  <p className="font-bold text-gray-900">#{order.orderNumber}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(order.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`badge ${ORDER_STATUS_COLORS[order.orderStatus]}`}>
                    {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                  </span>
                  <span className="font-bold text-gray-900">{formatPrice(order.totalPrice)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 overflow-hidden">
                {order.items?.slice(0, 4).map((item, i) => (
                  <div key={i} className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden shrink-0 text-xs flex items-center justify-center text-gray-400">
                    {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : '📦'}
                  </div>
                ))}
                {order.items?.length > 4 && (
                  <span className="text-xs text-gray-400">+{order.items.length - 4} more</span>
                )}
                <span className="text-xs text-gray-400 ml-1">
                  {order.items?.length} item{order.items?.length > 1 ? 's' : ''}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
