import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { FiChevronDown, FiRefreshCw } from "react-icons/fi";
import {
  fetchAllOrders,
  updateOrderStatus,
  refundOrder,
} from "../../store/slices/orderSlice"; // ✅ added refundOrder
import {
  formatPrice,
  formatDate,
  ORDER_STATUS_COLORS,
} from "../../utils/helpers";
import AdminLayout from "../../components/layout/AdminLayout";
import { PageLoader } from "../../components/common";
import toast from "react-hot-toast";

const STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
];

export default function AdminOrders() {
  const dispatch = useDispatch();
  const { allOrders, loading, refunding } = useSelector((s) => s.orders); // ✅ added refunding
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [updating, setUpdating] = useState(null);
  const [refundingId, setRefundingId] = useState(null); // ✅ tracks which order is refunding

  useEffect(() => {
    const q = { page, limit: 20 };
    if (statusFilter) q.status = statusFilter;
    dispatch(fetchAllOrders(q));
  }, [dispatch, page, statusFilter]);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdating(orderId);
    const res = await dispatch(
      updateOrderStatus({ id: orderId, status: newStatus }),
    );
    setUpdating(null);
    if (!res.error) toast.success("Order status updated");
    else toast.error(res.payload || "Failed to update");
  };

  // ✅ Uses Redux thunk — no direct api call
  const handleRefund = async (orderId, orderNumber) => {
    const confirmed = window.confirm(
      `Are you sure you want to refund order #${orderNumber}? This cannot be undone.`,
    );
    if (!confirmed) return;

    setRefundingId(orderId);
    const res = await dispatch(refundOrder(orderId));
    setRefundingId(null);

    if (!res.error)
      toast.success(`Order #${orderNumber} refunded successfully`);
    else toast.error(res.payload || "Refund failed");
  };

  return (
    <AdminLayout title="Orders">
      {/* Filter bar */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="input-field py-2 pr-8 text-sm appearance-none"
          >
            <option value="">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s} className="capitalize">
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
          <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-sm" />
        </div>
        <p className="text-sm text-gray-400">{allOrders.length} orders</p>
      </div>

      {loading && allOrders.length === 0 ? (
        <PageLoader />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {[
                    "Order",
                    "Customer",
                    "Date",
                    "Amount",
                    "Payment",
                    "Status",
                    "Update",
                    "Refund",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide first:rounded-tl last:rounded-tr whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {allOrders.map((order) => (
                  <tr
                    key={order._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Link
                        to={`/orders/${order._id}`}
                        className="font-semibold text-primary-600 hover:text-primary-700"
                      >
                        #{order.orderNumber}
                      </Link>
                    </td>

                    <td className="px-4 py-3 text-gray-700">
                      {order.user?.name || "—"}
                    </td>

                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {formatDate(order.createdAt)}
                    </td>

                    <td className="px-4 py-3 font-semibold text-gray-900">
                      {formatPrice(order.totalPrice)}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`badge text-xs ${order.isPaid ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                      >
                        {order.isPaid ? "Paid" : "Pending"}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`badge ${ORDER_STATUS_COLORS[order.orderStatus]} text-xs capitalize`}
                      >
                        {order.orderStatus}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="relative">
                        <select
                          value={order.orderStatus}
                          onChange={(e) =>
                            handleStatusChange(order._id, e.target.value)
                          }
                          disabled={
                            updating === order._id ||
                            order.orderStatus === "refunded"
                          }
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 pr-6 bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-primary-300 cursor-pointer disabled:opacity-50"
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s} className="capitalize">
                              {s}
                            </option>
                          ))}
                        </select>
                        <FiChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs" />
                      </div>
                    </td>

                    {/* ✅ Refund button — only for paid Stripe orders not already refunded */}
                    <td className="px-4 py-3">
                      {order.isPaid &&
                      order.paymentMethod === "stripe" &&
                      order.orderStatus !== "refunded" ? (
                        <button
                          onClick={() =>
                            handleRefund(order._id, order.orderNumber)
                          }
                          disabled={refundingId === order._id}
                          className="flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700 border border-red-200 hover:border-red-400 rounded-lg px-2.5 py-1.5 transition-all disabled:opacity-50"
                        >
                          <FiRefreshCw
                            className={`text-xs ${refundingId === order._id ? "animate-spin" : ""}`}
                          />
                          {refundingId === order._id
                            ? "Refunding..."
                            : "Refund"}
                        </button>
                      ) : (
                        <span className="text-xs text-gray-300">
                          {order.orderStatus === "refunded"
                            ? "✅ Refunded"
                            : "—"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {allOrders.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-400">
                      No orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-400">Page {page}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 1}
                className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-40"
              >
                ← Prev
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={allOrders.length < 20}
                className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

// import { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { Link } from 'react-router-dom';
// import { FiChevronDown } from 'react-icons/fi';
// import { fetchAllOrders, updateOrderStatus } from '../../store/slices/orderSlice';
// import { formatPrice, formatDate, ORDER_STATUS_COLORS } from '../../utils/helpers';
// import AdminLayout from '../../components/layout/AdminLayout';
// import { PageLoader } from '../../components/common';
// import toast from 'react-hot-toast';

// const STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

// export default function AdminOrders() {
//   const dispatch = useDispatch();
//   const { allOrders, loading } = useSelector(s => s.orders);
//   const [statusFilter, setStatusFilter] = useState('');
//   const [page, setPage] = useState(1);
//   const [updating, setUpdating] = useState(null);

//   useEffect(() => {
//     const q = { page, limit: 20 };
//     if (statusFilter) q.status = statusFilter;
//     dispatch(fetchAllOrders(q));
//   }, [dispatch, page, statusFilter]);

//   const handleStatusChange = async (orderId, newStatus) => {
//     setUpdating(orderId);
//     const res = await dispatch(updateOrderStatus({ id: orderId, status: newStatus }));
//     setUpdating(null);
//     if (!res.error) toast.success('Order status updated');
//     else toast.error(res.payload || 'Failed to update');
//   };

//   return (
//     <AdminLayout title="Orders">
//       {/* Filter bar */}
//       <div className="flex items-center gap-3 mb-5 flex-wrap">
//         <div className="relative">
//           <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="input-field py-2 pr-8 text-sm appearance-none">
//             <option value="">All Statuses</option>
//             {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
//           </select>
//           <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-sm" />
//         </div>
//         <p className="text-sm text-gray-400">{allOrders.length} orders</p>
//       </div>

//       {loading && allOrders.length === 0 ? <PageLoader /> : (
//         <div className="card overflow-hidden">
//           <div className="overflow-x-auto">
//             <table className="w-full text-sm">
//               <thead className="bg-gray-50 border-b border-gray-200">
//                 <tr>
//                   {['Order', 'Customer', 'Date', 'Amount', 'Payment', 'Status', 'Actions'].map(h => (
//                     <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide first:rounded-tl last:rounded-tr whitespace-nowrap">{h}</th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-100">
//                 {allOrders.map(order => (
//                   <tr key={order._id} className="hover:bg-gray-50 transition-colors">
//                     <td className="px-4 py-3">
//                       <Link to={`/orders/${order._id}`} className="font-semibold text-primary-600 hover:text-primary-700">
//                         #{order.orderNumber}
//                       </Link>
//                     </td>
//                     <td className="px-4 py-3 text-gray-700">{order.user?.name || '—'}</td>
//                     <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(order.createdAt)}</td>
//                     <td className="px-4 py-3 font-semibold text-gray-900">{formatPrice(order.totalPrice)}</td>
//                     <td className="px-4 py-3">
//                       <span className={`badge text-xs ${order.isPaid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
//                         {order.isPaid ? 'Paid' : 'Pending'}
//                       </span>
//                     </td>
//                     <td className="px-4 py-3">
//                       <span className={`badge ${ORDER_STATUS_COLORS[order.orderStatus]} text-xs capitalize`}>
//                         {order.orderStatus}
//                       </span>
//                     </td>
//                     <td className="px-4 py-3">
//                       <div className="relative">
//                         <select
//                           value={order.orderStatus}
//                           onChange={e => handleStatusChange(order._id, e.target.value)}
//                           disabled={updating === order._id}
//                           className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 pr-6 bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-primary-300 cursor-pointer disabled:opacity-50"
//                         >
//                           {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
//                         </select>
//                         <FiChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs" />
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//                 {allOrders.length === 0 && (
//                   <tr><td colSpan={7} className="py-12 text-center text-gray-400">No orders found</td></tr>
//                 )}
//               </tbody>
//             </table>
//           </div>

//           {/* Pagination controls */}
//           <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
//             <p className="text-xs text-gray-400">Page {page}</p>
//             <div className="flex gap-2">
//               <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-40">← Prev</button>
//               <button onClick={() => setPage(p => p + 1)} disabled={allOrders.length < 20} className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-40">Next →</button>
//             </div>
//           </div>
//         </div>
//       )}
//     </AdminLayout>
//   );
// }
