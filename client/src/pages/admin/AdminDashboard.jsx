import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  FiBox,
  FiShoppingBag,
  FiUsers,
  FiTrendingUp,
  FiArrowRight,
  FiAlertCircle,
} from "react-icons/fi";
import { fetchAllOrders } from "../../store/slices/orderSlice";
import { fetchProducts } from "../../store/slices/productSlice";
import { formatPrice, formatDate, ORDER_STATUS_COLORS } from "../../utils/helpers";
import AdminLayout from "../../components/layout/AdminLayout";
import { PageLoader } from "../../components/common";

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const { allOrders, loading: ordersLoading } = useSelector((s) => s.orders);
  const { list: products, pagination } = useSelector((s) => s.products);

  useEffect(() => {
    dispatch(fetchAllOrders({ limit: 5 }));
    dispatch(fetchProducts({ limit: 100 }));
  }, [dispatch]);

  const totalRevenue = allOrders.reduce((a, o) => a + (o.totalPrice || 0), 0);
  const pendingOrders = allOrders.filter((o) => o.orderStatus === "pending").length;
  const lowStock = products.filter((p) => p.stock <= 5 && p.stock > 0);
  const outOfStock = products.filter((p) => p.stock === 0);

  const STATS = [
    {
      label: "Total Revenue",
      value: formatPrice(totalRevenue),
      icon: FiTrendingUp,
      color: "text-primary-600 bg-primary-100",
      change: "This month",
    },
    {
      label: "Total Orders",
      value: allOrders.length,
      icon: FiShoppingBag,
      color: "text-blue-600 bg-blue-100",
      change: `${pendingOrders} pending`,
    },
    {
      label: "Products",
      value: pagination?.total ?? products.length,
      icon: FiBox,
      color: "text-purple-600 bg-purple-100",
      change: `${outOfStock.length} out of stock`,
    },
    {
      label: "Low Stock",
      value: lowStock.length,
      icon: FiAlertCircle,
      color: "text-orange-600 bg-orange-100",
      change: "Need restocking",
    },
  ];

  if (ordersLoading && allOrders.length === 0)
    return (
      <AdminLayout title="Dashboard">
        <PageLoader />
      </AdminLayout>
    );

  return (
    <AdminLayout title="Dashboard">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STATS.map(({ label, value, icon: Icon, color, change }) => (
          <div key={label} className="card p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon className="text-lg" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{label}</p>
            <p className="text-xs text-gray-400 mt-1">{change}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent orders */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Recent Orders</h3>
            <Link
              to="/admin/orders"
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              View all <FiArrowRight className="text-xs" />
            </Link>
          </div>
          <div className="space-y-3">
            {allOrders.slice(0, 5).map((o) => (
              <Link
                key={o._id}
                to={`/orders/${o._id}`}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">#{o.orderNumber}</p>
                  <p className="text-xs text-gray-400">
                    {o.user?.name} · {formatDate(o.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`badge ${ORDER_STATUS_COLORS[o.orderStatus]} text-xs`}>
                    {o.orderStatus}
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {formatPrice(o.totalPrice)}
                  </span>
                </div>
              </Link>
            ))}
            {allOrders.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">No orders yet</p>
            )}
          </div>
        </div>

        {/* Low / out of stock */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Stock Alerts</h3>
            <Link
              to="/admin/products"
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              Manage <FiArrowRight className="text-xs" />
            </Link>
          </div>
          <div className="space-y-2">
            {[...outOfStock.slice(0, 3), ...lowStock.slice(0, 3)].map((p) => (
              <Link
                key={p._id}
                to={`/admin/products/${p._id}/edit`}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <p className="text-sm text-gray-800 line-clamp-1 flex-1 mr-3">{p.name}</p>
                <span
                  className={`badge text-xs shrink-0 ${p.stock === 0 ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"}`}
                >
                  {p.stock === 0 ? "Out of stock" : `${p.stock} left`}
                </span>
              </Link>
            ))}
            {outOfStock.length === 0 && lowStock.length === 0 && (
              <div className="flex items-center gap-2 py-4 justify-center">
                <span className="text-2xl">✅</span>
                <p className="text-sm text-gray-400">All products well-stocked</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
