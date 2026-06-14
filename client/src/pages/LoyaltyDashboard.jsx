import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchLoyaltySummary,
  applyReferralCode,
  clearLoyaltyMessages,
} from "../store/loyaltySlice";

const TYPE_LABELS = {
  earned_purchase: { label: "Purchase Reward", color: "#15803d", sign: "+" },
  earned_first_order: { label: "First Order Bonus", color: "#15803d", sign: "+" },
  earned_referral: { label: "Referral Bonus", color: "#15803d", sign: "+" },
  earned_review: { label: "Review Bonus", color: "#15803d", sign: "+" },
  redeemed_discount: { label: "Redeemed — Discount", color: "#dc2626", sign: "-" },
  redeemed_shipping: { label: "Redeemed — Free Shipping", color: "#dc2626", sign: "-" },
  expired: { label: "Points Expired", color: "#9ca3af", sign: "-" },
  admin_adjustment: { label: "Admin Adjustment", color: "#7c3aed", sign: "" },
};

export default function LoyaltyDashboard() {
  const dispatch = useDispatch();
  const {
    loyaltyPoints,
    totalPointsEarned,
    referralCode,
    discountValue,
    canRedeem,
    minRedeemPoints,
    transactions,
    loading,
    error,
    referralSuccess,
  } = useSelector((state) => state.loyalty);

  const [referralInput, setReferralInput] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    dispatch(fetchLoyaltySummary());
    return () => dispatch(clearLoyaltyMessages());
  }, [dispatch]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyReferral = () => {
    if (!referralInput.trim()) return;
    dispatch(applyReferralCode(referralInput.trim().toUpperCase()));
  };

  if (loading) return <p style={styles.loading}>Loading loyalty data...</p>;

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>🌿 Loyalty & Rewards</h2>

      {/* ── Points Balance Card ─────────────────── */}
      <div style={styles.card}>
        <div style={styles.pointsRow}>
          <div>
            <p style={styles.label}>Available Points</p>
            <p style={styles.bigNumber}>{loyaltyPoints.toLocaleString("en-IN")}</p>
            <p style={styles.subText}>= ₹{discountValue} discount value</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={styles.label}>Total Earned</p>
            <p style={{ ...styles.bigNumber, fontSize: 20, color: "#6b7280" }}>
              {totalPointsEarned.toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        {/* Progress to min redeem */}
        {!canRedeem && (
          <div style={styles.progressWrapper}>
            <div style={styles.progressBar}>
              <div
                style={{
                  ...styles.progressFill,
                  width: `${Math.min((loyaltyPoints / minRedeemPoints) * 100, 100)}%`,
                }}
              />
            </div>
            <p style={styles.subText}>{minRedeemPoints - loyaltyPoints} more points to redeem</p>
          </div>
        )}

        {canRedeem && <p style={styles.redeemHint}>✅ You can redeem points at checkout!</p>}
      </div>

      {/* ── How to Earn ─────────────────────────── */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>How to Earn Points</h3>
        <ul style={styles.earnList}>
          <li>
            🛒 <strong>Every purchase</strong> — ₹1 = 1 point
          </li>
          <li>
            🎉 <strong>First order bonus</strong> — 100 points
          </li>
          <li>
            👥 <strong>Refer a friend</strong> — 200 points when they order
          </li>
          <li>
            ⭐ <strong>Leave a review</strong> — 25 points per review
          </li>
        </ul>
        <p style={styles.subText}>100 points = ₹1 discount at checkout</p>
      </div>

      {/* ── Referral Code ───────────────────────── */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Your Referral Code</h3>
        <p style={styles.subText}>
          Share your code. When a friend places their first order, you earn 200 points!
        </p>
        <div style={styles.referralRow}>
          <span style={styles.referralCode}>{referralCode}</span>
          <button style={styles.copyBtn} onClick={handleCopyCode}>
            {copied ? "Copied ✓" : "Copy"}
          </button>
        </div>

        {/* Apply someone else's referral */}
        <div style={{ marginTop: 16 }}>
          <p style={{ ...styles.label, marginBottom: 6 }}>Have a friend's referral code?</p>
          <div style={styles.referralRow}>
            <input
              style={styles.input}
              placeholder="Enter referral code"
              value={referralInput}
              onChange={(e) => setReferralInput(e.target.value)}
            />
            <button style={styles.applyBtn} onClick={handleApplyReferral}>
              Apply
            </button>
          </div>
          {referralSuccess && <p style={styles.success}>{referralSuccess}</p>}
          {error && <p style={styles.error}>{error}</p>}
        </div>
      </div>

      {/* ── Transaction History ─────────────────── */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Points History</h3>
        {transactions.length === 0 ? (
          <p style={styles.subText}>No transactions yet. Start earning!</p>
        ) : (
          <div>
            {transactions.map((tx) => {
              const meta = TYPE_LABELS[tx.type] || {
                label: tx.type,
                color: "#374151",
                sign: "",
              };
              return (
                <div key={tx._id} style={styles.txRow}>
                  <div>
                    <p style={styles.txLabel}>{meta.label}</p>
                    <p style={styles.txDesc}>{tx.description}</p>
                    <p style={styles.txDate}>
                      {new Date(tx.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ ...styles.txPoints, color: meta.color }}>
                      {meta.sign}
                      {Math.abs(tx.points)} pts
                    </p>
                    <p style={styles.txBalance}>Balance: {tx.balanceAfter}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────
const styles = {
  container: { maxWidth: 640, margin: "0 auto", padding: "24px 16px" },
  heading: { fontSize: 22, fontWeight: 700, color: "#111827", marginBottom: 20 },
  card: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  },
  cardTitle: { fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 12 },
  label: { fontSize: 12, color: "#9ca3af", marginBottom: 4 },
  bigNumber: { fontSize: 36, fontWeight: 800, color: "#15803d", margin: "4px 0" },
  subText: { fontSize: 12, color: "#6b7280", margin: "4px 0" },
  pointsRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  progressWrapper: { marginTop: 16 },
  progressBar: {
    background: "#e5e7eb",
    borderRadius: 99,
    height: 8,
    overflow: "hidden",
    marginBottom: 6,
  },
  progressFill: {
    background: "#15803d",
    height: "100%",
    borderRadius: 99,
    transition: "width 0.4s ease",
  },
  redeemHint: { marginTop: 12, fontSize: 13, color: "#15803d", fontWeight: 600 },
  earnList: {
    listStyle: "none",
    padding: 0,
    margin: "0 0 8px",
    display: "flex",
    flexDirection: "column",
    gap: 8,
    fontSize: 14,
    color: "#374151",
  },
  referralRow: { display: "flex", gap: 10, alignItems: "center", marginTop: 8 },
  referralCode: {
    flex: 1,
    background: "#f0fdf4",
    border: "1.5px dashed #86efac",
    borderRadius: 8,
    padding: "10px 14px",
    fontWeight: 700,
    fontSize: 16,
    color: "#15803d",
    letterSpacing: 2,
  },
  copyBtn: {
    background: "#15803d",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "10px 16px",
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  input: {
    flex: 1,
    border: "1px solid #d1d5db",
    borderRadius: 8,
    padding: "10px 12px",
    fontSize: 14,
    outline: "none",
  },
  applyBtn: {
    background: "#111827",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "10px 16px",
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer",
  },
  txRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: "12px 0",
    borderBottom: "1px solid #f3f4f6",
  },
  txLabel: { fontSize: 13, fontWeight: 600, color: "#111827", margin: 0 },
  txDesc: { fontSize: 12, color: "#6b7280", margin: "2px 0" },
  txDate: { fontSize: 11, color: "#9ca3af", margin: 0 },
  txPoints: { fontSize: 14, fontWeight: 700, margin: 0 },
  txBalance: { fontSize: 11, color: "#9ca3af", margin: "2px 0 0" },
  success: { fontSize: 13, color: "#15803d", marginTop: 8 },
  error: { fontSize: 13, color: "#dc2626", marginTop: 8 },
  loading: { textAlign: "center", color: "#6b7280", padding: 40 },
};
