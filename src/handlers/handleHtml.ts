import { BRAND, statusColors } from "../constants";
import { EVENT_TYPE } from "../types";
import { OrderNotificationData } from "../types/notification-types";
import { capitalizeFirstChar } from "./handleSubject";
import { customerName, esc, getItems, getSubtotal, money, orderDate, orderRef, paymentLabel } from "./orderHandler";

/* ------------------------------------------------------------------ */
/* Shared layout (header + footer) – reuse it for every email type     */
/* ------------------------------------------------------------------ */


const emailLayout = (opts: {
  title: string;
  headerSubtitle: string;
  preheader: string;
  body: string;
}) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(opts.title)}</title>
</head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:Arial,Helvetica,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
    ${esc(opts.preheader)}
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:8px;overflow:hidden;">

        <!-- Header -->
        <tr>
          <td style="background:${BRAND.color};padding:24px 32px;color:#ffffff;">
            <div style="font-size:22px;font-weight:bold;">${esc(BRAND.name)}</div>
            <div style="font-size:13px;opacity:.9;margin-top:4px;">${esc(opts.headerSubtitle)}</div>
          </td>
        </tr>

        ${opts.body}

        <!-- Footer -->
        <tr>
          <td style="background:#fafafa;padding:20px 32px;border-top:1px solid #eee;">
            <p style="margin:0 0 6px;font-size:12px;color:#777;line-height:1.6;">
              Questions about your order? Contact us at
              <a href="mailto:${BRAND.supportEmail}" style="color:${BRAND.color};">${BRAND.supportEmail}</a>
              or ${esc(BRAND.supportPhone)}.
            </p>
            <p style="margin:0;font-size:11px;color:#aaa;">
              &copy; ${new Date().getFullYear()} ${esc(BRAND.name)}. This is an automated message, please do not share it with anyone.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;


// Order of steps shown in the progress tracker
const STATUS_STEPS = [
  { key: "received", label: "Received" },
  { key: "confirmed", label: "Confirmed" },
  { key: "prepared", label: "Prepared" },
  { key: "out_for_delivery", label: "On the way" },
  { key: "delivered", label: "Delivered" },
];

// Headline + message shown for each status
const STATUS_COPY: Record<string, { headline: string; message: string }> = {
  received: {
    headline: "We've received your order",
    message: "Your order is in. We'll confirm it shortly.",
  },
  confirmed: {
    headline: "Your order is confirmed",
    message: "Great news! The restaurant has accepted your order and will start preparing it soon.",
  },
  prepared: {
    headline: "Your order is ready",
    message: "Your food has been freshly prepared and is waiting for a delivery partner.",
  },
  out_for_delivery: {
    headline: "Your order is on the way",
    message: "Our delivery partner has picked up your order and is heading to you. Please keep your phone handy.",
  },
  delivered: {
    headline: "Your order has been delivered",
    message: "Enjoy your meal! We'd love to hear how it was.",
  },
};

const readableStatus = (status: string) =>
  capitalizeFirstChar(String(status ?? "").replace(/_/g, " "));

const progressTracker = (currentKey: string) => {
  const currentIndex = STATUS_STEPS.findIndex((s) => s.key === currentKey);

  const cells = STATUS_STEPS.map((step, index) => {
    const done = currentIndex >= 0 && index <= currentIndex;
    const isCurrent = index === currentIndex;
    return `
          <td width="20%" align="center" style="padding:0 2px;">
            <div style="height:6px;border-radius:3px;background:${done ? BRAND.color : "#e5e7eb"};"></div>
            <div style="margin-top:8px;font-size:11px;line-height:1.3;color:${done ? "#111" : "#999"};${isCurrent ? "font-weight:bold;" : ""}">
              ${esc(step.label)}
            </div>
          </td>`;
  }).join("");

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>${cells}</tr></table>`;
};

const orderCreatedHtml = (data: OrderNotificationData) => {
  const { mode, status } = paymentLabel(data);
  const badge =
    statusColors[status.toLowerCase()] ??
    statusColors.pending ??
    {
      bg: "#fef3c7",
      fg: "#92400e",
    };

  const rows = getItems(data)
    .map(
      (item) => {
        console.log("Data = ", item)
        return `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #eee;font-size:14px;color:#222;">
            <strong>${esc(item.name)}</strong> &times; ${item.qty}
            ${item.details ? `<br><span style="font-size:12px;color:#777;">${esc(item.details)}</span>` : ""}
          </td>
          <td align="right" style="padding:12px 0;border-bottom:1px solid #eee;font-size:14px;color:#222;white-space:nowrap;">
            ${money(item.lineTotal)}
          </td>
        </tr>`
      }
    )
    .join("");

  const line = (label: string, value: string, strong = false) => `
        <tr>
          <td style="padding:4px 0;font-size:${strong ? 16 : 14}px;color:${strong ? "#111" : "#555"};${strong ? "font-weight:bold;" : ""}">${label}</td>
          <td align="right" style="padding:4px 0;font-size:${strong ? 16 : 14}px;color:${strong ? "#111" : "#555"};${strong ? "font-weight:bold;" : ""}">${value}</td>
        </tr>`;

  const pendingNote =
    data.paymentMode === "card" && data.paymentStatus === "pending"
      ? `<p style="margin:12px 0 0;font-size:13px;color:#8a6100;">Your card payment is still pending. Your order will be confirmed once the payment goes through.</p>`
      : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
</head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:Arial,Helvetica,sans-serif;">
  <!-- Preheader (inbox preview text) -->
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
    We've received your order #${orderRef(data)}. Total ${money(data.total)}.
  </div>
 
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:8px;overflow:hidden;">
 
        <!-- Header -->
        <tr>
          <td style="background:${BRAND.color};padding:24px 32px;color:#ffffff;">
            <div style="font-size:22px;font-weight:bold;">${esc(BRAND.name)}</div>
            <div style="font-size:13px;opacity:.9;margin-top:4px;">Order confirmation</div>
          </td>
        </tr>
 
        <!-- Greeting -->
        <tr>
          <td style="padding:28px 32px 8px;">
            <h2 style="margin:0 0 8px;font-size:20px;color:#111;">Thanks for your order, ${esc(customerName(data))}!</h2>
            <p style="margin:0;font-size:14px;line-height:1.6;color:#555;">
              We've received your order and our kitchen is getting started. We'll keep you posted as it moves along.
            </p>
          </td>
        </tr>
 
        <!-- Order meta -->
        <tr>
          <td style="padding:16px 32px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fafafa;border-radius:6px;">
              <tr>
                <td style="padding:14px 16px;font-size:13px;color:#555;line-height:1.7;">
                  <strong style="color:#111;">Order ID:</strong> #${orderRef(data)}<br>
                  <strong style="color:#111;">Placed on:</strong> ${esc(orderDate(data))}<br>
                  <strong style="color:#111;">Deliver to:</strong> ${esc(data.address)}
                  ${data.comment ? `<br><strong style="color:#111;">Your note:</strong> ${esc(data.comment)}` : ""}
                </td>
              </tr>
            </table>
          </td>
        </tr>
 
        <!-- Items -->
        <tr>
          <td style="padding:8px 32px 0;">
            <h3 style="margin:0 0 4px;font-size:15px;color:#111;">Your items</h3>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>
          </td>
        </tr>
 
        <!-- Totals -->
        <tr>
          <td style="padding:12px 32px 8px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              ${line("Subtotal", money(getSubtotal(data)))}
              ${line("Delivery charges", money(data.deliveryCharges))}
              ${line("Taxes", money(data.taxes))}
              ${line("Discount", `<span style="color:#14683a;">-${money(data.discount)}</span>`)}
              <tr><td colspan="2" style="border-top:2px solid #111;padding-top:8px;"></td></tr>
              ${line("Total", money(data.total), true)}
            </table>
          </td>
        </tr>
 
        <!-- Payment -->
        <tr>
          <td style="padding:8px 32px 8px;">
            <p style="margin:0;font-size:13px;color:#555;">
              <strong style="color:#111;">Payment:</strong> ${mode}
              <span style="display:inline-block;margin-left:6px;padding:2px 10px;border-radius:12px;font-size:12px;background:${badge.bg};color:${badge.fg};">${status}</span>
            </p>
            ${pendingNote}
          </td>
        </tr>
 
        <!-- CTA -->
        <tr>
          <td align="center" style="padding:24px 32px 32px;">
            <a href="${BRAND.trackUrl}/${esc(data._id)}"
               style="display:inline-block;background:${BRAND.color};color:#ffffff;text-decoration:none;font-size:15px;font-weight:bold;padding:13px 32px;border-radius:6px;">
              Track your order
            </a>
          </td>
        </tr>
 
        <!-- Footer -->
        <tr>
          <td style="background:#fafafa;padding:20px 32px;border-top:1px solid #eee;">
            <p style="margin:0 0 6px;font-size:12px;color:#777;line-height:1.6;">
              Questions about your order? Contact us at
              <a href="mailto:${BRAND.supportEmail}" style="color:${BRAND.color};">${BRAND.supportEmail}</a>
              or ${esc(BRAND.supportPhone)}.
            </p>
            <p style="margin:0;font-size:11px;color:#aaa;">
              &copy; ${new Date().getFullYear()} ${esc(BRAND.name)}. This is an automated message, please do not share it with anyone.
            </p>
          </td>
        </tr>
 
      </table>
    </td></tr>
  </table>
</body>
</html>`;
};

const orderStatusHtml = (data: OrderNotificationData) => {
  const statusKey = String(data.orderStatus ?? "").toLowerCase();
  const copy = STATUS_COPY[statusKey] ?? {
    headline: `Your order is now ${readableStatus(statusKey)}`,
    message: "There's a new update on your order.",
  };

  const body = `
        <!-- Greeting -->
        <tr>
          <td style="padding:28px 32px 8px;">
            <p style="margin:0 0 4px;font-size:14px;color:#777;">Hi ${esc(customerName(data))},</p>
            <h2 style="margin:0 0 8px;font-size:20px;color:#111;">${esc(copy.headline)}</h2>
            <p style="margin:0;font-size:14px;line-height:1.6;color:#555;">${esc(copy.message)}</p>
          </td>
        </tr>

        <!-- Progress tracker -->
        <tr>
          <td style="padding:20px 32px 8px;">
            ${progressTracker(statusKey)}
          </td>
        </tr>

        <!-- Order meta -->
        <tr>
          <td style="padding:16px 32px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fafafa;border-radius:6px;">
              <tr>
                <td style="padding:14px 16px;font-size:13px;color:#555;line-height:1.7;">
                  <strong style="color:#111;">Order ID:</strong> #${orderRef(data)}<br>
                  <strong style="color:#111;">Status:</strong> ${esc(readableStatus(statusKey))}<br>
                  <strong style="color:#111;">Placed on:</strong> ${esc(orderDate(data))}<br>
                  <strong style="color:#111;">Deliver to:</strong> ${esc(data.address)}<br>
                  <strong style="color:#111;">Order total:</strong> ${money(data.total)}
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td align="center" style="padding:16px 32px 32px;">
            <a href="${BRAND.trackUrl}/${esc(data._id)}"
               style="display:inline-block;background:${BRAND.color};color:#ffffff;text-decoration:none;font-size:15px;font-weight:bold;padding:13px 32px;border-radius:6px;">
              Track your order
            </a>
          </td>
        </tr>`;

  return emailLayout({
    title: "Order Status Update",
    headerSubtitle: "Order status update",
    preheader: `Order #${orderRef(data)}: ${copy.headline}.`,
    body,
  });
};

/* ------------------------------------------------------------------ */
/* Entry point                                                         */

export const handleHtml = (evenType: string, data: OrderNotificationData) => {
  switch (evenType) {
    case EVENT_TYPE.ORDER_CREATE:
      return orderCreatedHtml(data); // your existing function
    case EVENT_TYPE.ORDER_STATUS_UPDATE:
      return orderStatusHtml(data);
    case EVENT_TYPE.PAYMENT_STATUS_UPDATE:
      return `<p>Hi ${esc(customerName(data))}, there is an update on your order #${orderRef(data)}. Payment status: <strong>${esc(capitalizeFirstChar(data.paymentStatus ?? "pending"))}</strong>.</p>`;
    default:
      return "";
  }
};