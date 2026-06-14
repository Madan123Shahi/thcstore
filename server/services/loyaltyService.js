import User from "../models/User.js";
import LoyaltyTransaction from "../models/LoyaltyTransaction.js";
import Order from "../models/Order.js";

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────
export const POINTS_CONFIG = {
  PURCHASE_RATE: 1, // ₹1 = 1 point
  FIRST_ORDER_BONUS: 100, // bonus points on first order
  REFERRAL_BONUS: 200, // referrer earns this when referee places first order
  REFEREE_BONUS: 50, // new user gets this for using a referral code
  REVIEW_BONUS: 25, // points for leaving a review
  REDEEM_RATE: 100, // 100 points = ₹1 discount  (adjust to your liking)
  MIN_REDEEM: 500, // minimum points required to redeem
  FREE_SHIPPING_POINTS: 300, // points needed to unlock free shipping
};

// ─────────────────────────────────────────────
// Core: award points to a user
// ─────────────────────────────────────────────
export const awardPoints = async ({
  userId,
  points,
  type,
  description,
  orderId = null,
  referredUserId = null,
  productId = null,
  session = null,
}) => {
  const opts = session ? { session } : {};

  const user = await User.findById(userId).session(session || null);
  if (!user) throw new Error("User not found");

  user.loyaltyPoints += points;
  user.totalPointsEarned += points;
  await user.save(opts);

  await LoyaltyTransaction.create(
    [
      {
        user: userId,
        type,
        points,
        balanceAfter: user.loyaltyPoints,
        description,
        order: orderId,
        referredUser: referredUserId,
        product: productId,
      },
    ],
    opts
  );

  return user.loyaltyPoints;
};

// ─────────────────────────────────────────────
// Core: redeem points (returns discount amount in ₹)
// ─────────────────────────────────────────────
export const redeemPoints = async ({
  userId,
  points,
  type,
  description,
  orderId = null,
  session = null,
}) => {
  const opts = session ? { session } : {};

  const user = await User.findById(userId).session(session || null);
  if (!user) throw new Error("User not found");
  if (user.loyaltyPoints < points) throw new Error("Insufficient loyalty points");
  if (points < POINTS_CONFIG.MIN_REDEEM)
    throw new Error(`Minimum ${POINTS_CONFIG.MIN_REDEEM} points required to redeem`);

  user.loyaltyPoints -= points;
  await user.save(opts);

  await LoyaltyTransaction.create(
    [
      {
        user: userId,
        type,
        points: -points, // negative = deducted
        balanceAfter: user.loyaltyPoints,
        description,
        order: orderId,
      },
    ],
    opts
  );

  const discountAmount = Math.floor(points / POINTS_CONFIG.REDEEM_RATE);
  return { discountAmount, remainingPoints: user.loyaltyPoints };
};

// ─────────────────────────────────────────────
// On order placed: award purchase + first order bonus
// Call this from createOrder after order is saved
// ─────────────────────────────────────────────
export const handleOrderLoyalty = async ({ user, order, session }) => {
  const isFirstOrder = (await Order.countDocuments({ user: user._id })) === 1;

  // ₹1 = 1 point based on itemsPrice (before tax/shipping)
  const purchasePoints = Math.floor(order.itemsPrice * POINTS_CONFIG.PURCHASE_RATE);

  await awardPoints({
    userId: user._id,
    points: purchasePoints,
    type: "earned_purchase",
    description: `Earned ${purchasePoints} points for order #${order.orderNumber}`,
    orderId: order._id,
    session,
  });

  // First order bonus
  if (isFirstOrder) {
    await awardPoints({
      userId: user._id,
      points: POINTS_CONFIG.FIRST_ORDER_BONUS,
      type: "earned_first_order",
      description: `First order bonus — ${POINTS_CONFIG.FIRST_ORDER_BONUS} points`,
      orderId: order._id,
      session,
    });
  }

  // Referral: if this user was referred and hasn't used referral yet
  const freshUser = await User.findById(user._id).session(session || null);
  if (freshUser.referredBy && !freshUser.isReferralUsed && isFirstOrder) {
    // Award referrer
    await awardPoints({
      userId: freshUser.referredBy,
      points: POINTS_CONFIG.REFERRAL_BONUS,
      type: "earned_referral",
      description: `Referral bonus — ${freshUser.name} placed their first order`,
      orderId: order._id,
      referredUserId: user._id,
      session,
    });

    // Award referee
    await awardPoints({
      userId: user._id,
      points: POINTS_CONFIG.REFEREE_BONUS,
      type: "earned_referral",
      description: `Welcome bonus for using a referral code`,
      orderId: order._id,
      session,
    });

    freshUser.isReferralUsed = true;
    await freshUser.save(session ? { session } : {});
  }
};

// ─────────────────────────────────────────────
// On review submitted: award review points
// Call this from your review controller
// ─────────────────────────────────────────────
export const handleReviewLoyalty = async ({ userId, productId, orderId }) => {
  await awardPoints({
    userId,
    points: POINTS_CONFIG.REVIEW_BONUS,
    type: "earned_review",
    description: `Earned ${POINTS_CONFIG.REVIEW_BONUS} points for leaving a review`,
    orderId,
    productId,
  });
};
