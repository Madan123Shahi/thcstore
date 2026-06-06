import { useSelector } from 'react-redux';

// ─────────────────────────────────────────────
// Order status steps in sequence
// ─────────────────────────────────────────────
const STEPS = [
  { key: 'pending',    label: 'Order Placed',  icon: '🛒' },
  { key: 'confirmed',  label: 'Confirmed',      icon: '✅' },
  { key: 'processing', label: 'Processing',     icon: '⚙️' },
  { key: 'shipped',    label: 'Shipped',        icon: '🚚' },
  { key: 'delivered',  label: 'Delivered',      icon: '📦' },
];

const STEP_INDEX = {
  pending: 0, confirmed: 1, processing: 2, shipped: 3, delivered: 4,
};

// ─────────────────────────────────────────────
// ✅ OrderTracking — live progress bar
// Updates instantly via Socket.io without page refresh
// ─────────────────────────────────────────────
export default function OrderTracking({ order }) {
  if (!order) return null;

  // Don't show progress bar for cancelled/refunded orders
  if (['cancelled', 'refunded'].includes(order.orderStatus)) {
    return (
      <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium
        ${order.orderStatus === 'refunded' ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'}`}>
        {order.orderStatus === 'refunded' ? '💰 Order Refunded' : '❌ Order Cancelled'}
      </div>
    );
  }

  const currentStep = STEP_INDEX[order.orderStatus] ?? 0;

  return (
    <div className="w-full">
      {/* Progress steps */}
      <div className="flex items-start justify-between relative">
        {/* ✅ Progress line behind steps */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 z-0" />
        <div
          className="absolute top-5 left-0 h-0.5 bg-primary-500 z-0 transition-all duration-700"
          style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
        />

        {STEPS.map((step, i) => {
          const isDone    = i < currentStep;
          const isCurrent = i === currentStep;

          return (
            <div key={step.key} className="flex flex-col items-center z-10 flex-1">
              {/* Circle */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition-all duration-500
                ${isDone    ? 'bg-primary-500 border-primary-500 text-white'       : ''}
                ${isCurrent ? 'bg-white border-primary-500 shadow-md scale-110'    : ''}
                ${!isDone && !isCurrent ? 'bg-white border-gray-200 text-gray-300' : ''}`}
              >
                {step.icon}
              </div>

              {/* Label */}
              <p className={`text-xs mt-2 text-center font-medium transition-colors
                ${isDone || isCurrent ? 'text-primary-700' : 'text-gray-400'}`}>
                {step.label}
              </p>

              {/* "Current" indicator */}
              {isCurrent && (
                <span className="text-[10px] text-primary-500 font-semibold mt-0.5 animate-pulse">
                  Now
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Tracking number if available */}
      {order.trackingNumber && (
        <div className="mt-4 bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-600 flex items-center gap-2">
          🚚 <span>Tracking: <strong className="text-gray-900">{order.trackingNumber}</strong></span>
        </div>
      )}
    </div>
  );
}