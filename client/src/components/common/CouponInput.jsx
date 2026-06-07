import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FiTag, FiX, FiCheck, FiLoader } from "react-icons/fi";
import { validateCoupon, removeCoupon } from "../../store/slices/couponSlice";
import {
  selectCartSubtotal,
  selectCartShipping,
} from "../../store/slices/cartSlice";
import toast from "react-hot-toast";

export default function CouponInput() {
  const dispatch = useDispatch();
  const [input, setInput] = useState("");

  const subtotal = useSelector(selectCartSubtotal);
  const shipping = useSelector(selectCartShipping);
  const {
    applied,
    code,
    discountAmount,
    discountType,
    description,
    loading,
    error,
  } = useSelector((s) => s.coupon);

  const handleApply = async () => {
    if (!input.trim()) {
      toast.error("Enter a coupon code");
      return;
    }

    const res = await dispatch(
      validateCoupon({
        code: input.trim(),
        orderTotal: subtotal,
        shippingPrice: shipping,
      }),
    );

    if (validateCoupon.fulfilled.match(res)) {
      toast.success(res.payload.message);
      setInput("");
    } else {
      toast.error(res.payload || "Invalid coupon");
    }
  };

  const handleRemove = () => {
    dispatch(removeCoupon());
    setInput("");
    toast.success("Coupon removed");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleApply();
  };

  // ── Applied state ─────────────────────────────────────────────
  if (applied) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiCheck className="text-green-600 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-green-700">
                {code} applied!
              </p>
              {description && (
                <p className="text-xs text-green-600">{description}</p>
              )}
            </div>
          </div>
          <button
            onClick={handleRemove}
            className="text-green-600 hover:text-green-800 transition-colors"
          >
            <FiX />
          </button>
        </div>
        <p className="text-xs text-green-600 mt-1.5 font-medium">
          {discountType === "free_shipping"
            ? "🚚 Free shipping applied"
            : `🎉 You save ₹${discountAmount.toLocaleString("en-IN")}`}
        </p>
      </div>
    );
  }

  // ── Input state ───────────────────────────────────────────────
  return (
    <div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <FiTag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value.toUpperCase())}
            onKeyDown={handleKeyDown}
            placeholder="Enter coupon code"
            className="input-field pl-9 uppercase text-sm"
            disabled={loading}
          />
        </div>
        <button
          onClick={handleApply}
          disabled={loading || !input.trim()}
          className="btn-secondary px-4 py-2 text-sm shrink-0 disabled:opacity-50"
        >
          {loading ? <FiLoader className="animate-spin" /> : "Apply"}
        </button>
      </div>
      {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
    </div>
  );
}
