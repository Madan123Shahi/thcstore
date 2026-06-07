import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.FROM_EMAIL || "THC Store <noreply@thcstore.in>";
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// ─────────────────────────────────────────────
// ✅ Helper — send email via Resend
// ─────────────────────────────────────────────
const sendEmail = async ({ to, subject, html }) => {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });
    if (error) {
      console.error("Resend error:", error);
      return false;
    }
    console.log(`✅ Email sent to ${to}: ${data.id}`);
    return true;
  } catch (err) {
    console.error("Email send failed:", err.message);
    return false;
  }
};

// ─────────────────────────────────────────────
// Shared styles for all emails
// ─────────────────────────────────────────────
const baseStyle = `
  font-family: 'DM Sans', Arial, sans-serif;
  max-width: 600px;
  margin: 0 auto;
  background: #ffffff;
`;

const headerHtml = `
  <div style="background: #15803d; padding: 24px 32px; border-radius: 12px 12px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 700;">🌿 THC Store</h1>
    <p style="color: #bbf7d0; margin: 4px 0 0; font-size: 13px;">Premium Cannabis Wellness</p>
  </div>
`;

const footerHtml = `
  <div style="background: #f9fafb; padding: 20px 32px; border-radius: 0 0 12px 12px; text-align: center; border-top: 1px solid #e5e7eb;">
    <p style="color: #9ca3af; font-size: 12px; margin: 0;">
      © ${new Date().getFullYear()} THC Store India. All rights reserved.<br/>
      <a href="${CLIENT_URL}" style="color: #15803d;">Visit our store</a>
    </p>
  </div>
`;

// ─────────────────────────────────────────────
// 1. Order Confirmation Email
// ─────────────────────────────────────────────
export const sendOrderConfirmationEmail = async (order, user) => {
  const itemsHtml = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
        <span style="font-size: 14px; color: #374151;">${item.name}</span><br/>
        <span style="font-size: 12px; color: #9ca3af;">Qty: ${item.quantity}</span>
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; text-align: right;">
        <span style="font-size: 14px; font-weight: 600; color: #111827;">
          ₹${(item.price * item.quantity).toLocaleString("en-IN")}
        </span>
      </td>
    </tr>
  `,
    )
    .join("");

  const html = `
    <div style="${baseStyle}">
      ${headerHtml}
      <div style="padding: 32px;">
        <h2 style="color: #111827; font-size: 20px; margin: 0 0 8px;">Order Confirmed! 🎉</h2>
        <p style="color: #6b7280; font-size: 14px; margin: 0 0 24px;">
          Hi ${user.name}, your order has been placed successfully.
        </p>

        <!-- Order Info -->
        <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="font-size: 13px; color: #6b7280;">Order Number</span>
            <span style="font-size: 13px; font-weight: 700; color: #111827;">#${order.orderNumber}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="font-size: 13px; color: #6b7280;">Payment Method</span>
            <span style="font-size: 13px; color: #111827;">${order.paymentMethod === "stripe" ? "Card (Stripe)" : "Cash on Delivery"}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="font-size: 13px; color: #6b7280;">Payment Status</span>
            <span style="font-size: 13px; font-weight: 600; color: ${order.isPaid ? "#15803d" : "#d97706"};">
              ${order.isPaid ? "✅ Paid" : "⏳ Pending"}
            </span>
          </div>
        </div>

        <!-- Items -->
        <h3 style="font-size: 15px; color: #111827; margin: 0 0 12px;">Order Items</h3>
        <table style="width: 100%; border-collapse: collapse;">
          ${itemsHtml}
          <tr>
            <td style="padding: 12px 0; color: #6b7280; font-size: 13px;">Subtotal</td>
            <td style="padding: 12px 0; text-align: right; font-size: 13px;">₹${order.itemsPrice.toLocaleString("en-IN")}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #6b7280; font-size: 13px;">Shipping</td>
            <td style="padding: 4px 0; text-align: right; font-size: 13px; color: ${order.shippingPrice === 0 ? "#15803d" : "#111827"};">
              ${order.shippingPrice === 0 ? "Free" : `₹${order.shippingPrice}`}
            </td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #6b7280; font-size: 13px;">Tax (5%)</td>
            <td style="padding: 4px 0; text-align: right; font-size: 13px;">₹${order.taxPrice.toLocaleString("en-IN")}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0 0; font-weight: 700; font-size: 16px; color: #111827; border-top: 2px solid #e5e7eb;">Total</td>
            <td style="padding: 12px 0 0; text-align: right; font-weight: 700; font-size: 16px; color: #15803d; border-top: 2px solid #e5e7eb;">
              ₹${order.totalPrice.toLocaleString("en-IN")}
            </td>
          </tr>
        </table>

        <!-- Shipping Address -->
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin-top: 24px;">
          <h3 style="font-size: 14px; color: #15803d; margin: 0 0 8px;">📦 Shipping To</h3>
          <p style="font-size: 13px; color: #374151; margin: 0; line-height: 1.6;">
            ${order.shippingAddress.name}<br/>
            ${order.shippingAddress.line1}${order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""}<br/>
            ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}<br/>
            📞 ${order.shippingAddress.phone}
          </p>
        </div>

        <!-- CTA -->
        <div style="text-align: center; margin-top: 28px;">
          <a href="${CLIENT_URL}/orders/${order._id}"
            style="background: #15803d; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
            Track Your Order →
          </a>
        </div>
      </div>
      ${footerHtml}
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject: `Order Confirmed #${order.orderNumber} — THC Store`,
    html,
  });
};

// ─────────────────────────────────────────────
// 2. Shipping Update Email
// ─────────────────────────────────────────────
export const sendShippingUpdateEmail = async (order, user) => {
  const statusMessages = {
    confirmed: {
      title: "Order Confirmed ✅",
      msg: "Your order has been confirmed and is being prepared.",
      color: "#15803d",
    },
    processing: {
      title: "Order Processing ⚙️",
      msg: "Your order is being carefully packed and prepared for dispatch.",
      color: "#d97706",
    },
    shipped: {
      title: "Order Shipped 🚚",
      msg: "Great news! Your order is on its way.",
      color: "#2563eb",
    },
    delivered: {
      title: "Order Delivered 📦",
      msg: "Your order has been delivered. Enjoy your products!",
      color: "#15803d",
    },
    cancelled: {
      title: "Order Cancelled ❌",
      msg: "Your order has been cancelled.",
      color: "#dc2626",
    },
    refunded: {
      title: "Refund Processed 💰",
      msg: "Your refund has been processed and will reflect in 5-7 days.",
      color: "#7c3aed",
    },
  };

  const { title, msg, color } = statusMessages[order.orderStatus] || {
    title: "Order Update",
    msg: "Your order status has been updated.",
    color: "#374151",
  };

  const html = `
    <div style="${baseStyle}">
      ${headerHtml}
      <div style="padding: 32px;">
        <h2 style="color: ${color}; font-size: 20px; margin: 0 0 8px;">${title}</h2>
        <p style="color: #6b7280; font-size: 14px; margin: 0 0 24px;">Hi ${user.name}, ${msg}</p>

        <!-- Order Info -->
        <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="font-size: 13px; color: #6b7280;">Order Number</span>
            <span style="font-size: 13px; font-weight: 700; color: #111827;">#${order.orderNumber}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="font-size: 13px; color: #6b7280;">Status</span>
            <span style="font-size: 13px; font-weight: 600; color: ${color}; text-transform: capitalize;">${order.orderStatus}</span>
          </div>
          ${
            order.trackingNumber
              ? `
          <div style="display: flex; justify-content: space-between;">
            <span style="font-size: 13px; color: #6b7280;">Tracking Number</span>
            <span style="font-size: 13px; font-weight: 600; color: #2563eb;">${order.trackingNumber}</span>
          </div>`
              : ""
          }
        </div>

        <!-- CTA -->
        <div style="text-align: center;">
          <a href="${CLIENT_URL}/orders/${order._id}"
            style="background: #15803d; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
            Track Your Order →
          </a>
        </div>
      </div>
      ${footerHtml}
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject: `${title} — Order #${order.orderNumber}`,
    html,
  });
};

// ─────────────────────────────────────────────
// 3. Password Reset Email
// ─────────────────────────────────────────────
export const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${CLIENT_URL}/reset-password/${resetToken}`;

  const html = `
    <div style="${baseStyle}">
      ${headerHtml}
      <div style="padding: 32px;">
        <h2 style="color: #111827; font-size: 20px; margin: 0 0 8px;">Reset Your Password 🔐</h2>
        <p style="color: #6b7280; font-size: 14px; margin: 0 0 24px;">
          Hi ${user.name}, we received a request to reset your password.
          Click the button below to set a new password. This link expires in <strong>1 hour</strong>.
        </p>

        <!-- Reset Button -->
        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetUrl}"
            style="background: #15803d; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
            Reset Password →
          </a>
        </div>

        <!-- Security note -->
        <div style="background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 16px;">
          <p style="font-size: 13px; color: #92400e; margin: 0;">
            ⚠️ If you didn't request this, ignore this email. Your password won't change.
            Never share this link with anyone.
          </p>
        </div>

        <!-- Fallback URL -->
        <p style="font-size: 12px; color: #9ca3af; margin-top: 24px; word-break: break-all;">
          If the button doesn't work, copy this link:<br/>
          <a href="${resetUrl}" style="color: #15803d;">${resetUrl}</a>
        </p>
      </div>
      ${footerHtml}
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject: "Reset Your THC Store Password",
    html,
  });
};

// ─────────────────────────────────────────────
// 4. Welcome Email (on register)
// ─────────────────────────────────────────────
export const sendWelcomeEmail = async (user) => {
  const html = `
    <div style="${baseStyle}">
      ${headerHtml}
      <div style="padding: 32px;">
        <h2 style="color: #111827; font-size: 20px; margin: 0 0 8px;">Welcome to THC Store! 🌿</h2>
        <p style="color: #6b7280; font-size: 14px; margin: 0 0 24px;">
          Hi ${user.name}, thank you for joining us on your wellness journey.
          Explore our lab-tested, AYUSH-approved products.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${CLIENT_URL}/products"
            style="background: #15803d; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
            Shop Now →
          </a>
        </div>
      </div>
      ${footerHtml}
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject: "Welcome to THC Store India 🌿",
    html,
  });
};
