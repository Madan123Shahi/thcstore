import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  FiCheckCircle, FiPackage, FiAlertCircle, FiLoader,
} from "react-icons/fi";
import { fetchOrder } from "../store/slices/orderSlice";
import { formatPrice, formatDate } from "../utils/helpers";
import OrderTracking from "../components/common/OrderTracking";
import api from "../utils/api";
import { trackPurchase } from '../utils/useAnalytics'; // ✅ keep only what's used
import toast from "react-hot-toast";

export default function OrderSuccessPage() {
  const { id }     = useParams();
  const dispatch   = useDispatch();
  const { current: order } = useSelector((s) => s.orders);

  const [verifying,   setVerifying]   = useState(false);
  const [verified,    setVerified]    = useState(false);
  const [verifyError, setVerifyError] = useState(null);

  useEffect(() => {
    dispatch(fetchOrder(id));
  }, [id, dispatch]);

  useEffect(() => {
    const verifyStripePayment = async () => {
      if (!order || order.paymentMethod !== "stripe" || order.isPaid) {
        setVerified(true);

        // ✅ Track COD purchase — order already confirmed
        if (order && !verified) {
          trackPurchase(order._id, order.totalPrice);
        }
        return;
      }
      if (!order.paymentIntentId) {
        setVerifyError("No payment intent found for this order.");
        return;
      }
      setVerifying(true);
      try {
        await api.post("/payments/verify", { paymentIntentId: order.paymentIntentId });
        setVerified(true);
        dispatch(fetchOrder(id));
        toast.success("Payment verified successfully!");

        // ✅ Track Stripe purchase — after payment verified
        trackPurchase(order._id, order.totalPrice);
      } catch (err) {
        setVerifyError(err.response?.data?.message || "Payment verification failed.");
        toast.error("Payment verification failed. Contact support.");
      } finally {
        setVerifying(false);
      }
    };
    if (order) verifyStripePayment();
  }, [order?.paymentIntentId]);

  return (
    <div className="page-container py-16 max-w-2xl mx-auto text-center animate-fade-in">

      {/* ── Verifying state ── */}
      {verifying && (
        <div className="mb-6 flex flex-col items-center gap-3">
          <FiLoader className="text-4xl text-primary-500 animate-spin" />
          <p className="text-gray-500 text-sm">Verifying your payment with Stripe...</p>
        </div>
      )}

      {/* ── Verify error state ── */}
      {verifyError && !verifying && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 text-left flex gap-3">
          <FiAlertCircle className="text-red-500 shrink-0 mt-0.5 text-lg" />
          <div>
            <p className="font-semibold text-red-700 text-sm">Payment Verification Failed</p>
            <p className="text-red-600 text-xs mt-0.5">{verifyError}</p>
            <p className="text-red-500 text-xs mt-1">Please contact support with your order number.</p>
          </div>
        </div>
      )}

      {/* ── Success state ── */}
      {!verifying && !verifyError && (
        <>
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiCheckCircle className="text-4xl text-primary-600" />
          </div>
          <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">Order Placed!</h1>
          <p className="text-gray-400 mb-6">
            Thank you for your order. We'll send you a confirmation email shortly.
          </p>
        </>
      )}

      {/* ── Order summary card ── */}
      {order && (
        <div className="card p-6 text-left mb-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">Order Number</p>
              <p className="font-bold text-gray-900">#{order.orderNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Order Date</p>
              <p className="font-medium text-gray-700 text-sm">{formatDate(order.createdAt)}</p>
            </div>
          </div>

          <OrderTracking order={order} />

          <div className="flex gap-2 flex-wrap">
            <span className={`badge text-xs px-2 py-1 rounded-full font-medium
              ${order.isPaid ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
              {order.isPaid ? "✅ Payment Confirmed" : "⏳ Payment Pending"}
            </span>
            {order.paymentMethod === "cod" && (
              <span className="badge text-xs px-2 py-1 rounded-full font-medium bg-blue-100 text-blue-700">
                💵 Cash on Delivery
              </span>
            )}
          </div>

          <div className="space-y-2">
            {order.items?.map((item) => (
              <div key={item._id} className="flex items-center justify-between text-sm">
                <span className="text-gray-700 line-clamp-1 flex-1 mr-4">
                  {item.name} × {item.quantity}
                </span>
                <span className="font-semibold text-gray-900 shrink-0">
                  {formatPrice(item.price * item.quantity)}
                </span>
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