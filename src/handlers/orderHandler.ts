import { EmailOrderItem, OrderNotificationData } from "../types/notification-types";



export const money = (n: number | string | undefined) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(Number(n ?? 0));

export const esc = (v: unknown) =>
    String(v ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
 
export const orderRef = (data: OrderNotificationData) =>
    String(data?._id ?? "").slice(-8).toUpperCase();
 
export const customerName = (data: OrderNotificationData) =>{
     const customer = data.customerId;

  if (!customer || typeof customer === "string") {
    return "there";
  }

  return (
    [customer.firstName, customer.lastName]
      .filter(Boolean)
      .join(" ") || "there"
  );
}

export const orderDate = (data: OrderNotificationData) =>
    new Date(data?.createdAt ?? Date.now()).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
 
export const paymentLabel = (data: OrderNotificationData) => {
    const mode = data?.paymentMode === "cash" ? "Cash on Delivery" : "Card";
    const status = String(data?.paymentStatus ?? "pending");
    return { mode, status: status.charAt(0).toUpperCase() + status.slice(1) };
};


 
/**
 * cart items are logged as [Object], so the exact shape is unknown.
 * This normaliser is defensive – adjust the field names to your cart schema.
 */
export const getItems = (
  data: OrderNotificationData,
): EmailOrderItem[] => {
  const cart = data.cart ?? [];

  return cart.map((item) => {
    const qty = Number(item.qty ?? 1);

    const allPrices = item.priceConfiguration ?? {};
    const selectedOptions =
      item.choosenConfiguration?.priceConfiguration ?? {};

    const selectedToppings =
      item.choosenConfiguration?.selectedToppings ?? [];

    let unitPrice = 0;

    // Calculate selected configuration prices
    for (const [group, option] of Object.entries(selectedOptions)) {
      const price =
        allPrices[group]?.availableOptions?.[option] ?? 0;

      unitPrice += Number(price);
    }

    // Calculate toppings prices
    for (const topping of selectedToppings) {
      unitPrice += Number(topping.price ?? 0);
    }

    const lineTotal = unitPrice * qty;

    const optionsText = Object.entries(selectedOptions)
      .map(([group, option]) => `${group}: ${option}`)
      .join(" • ");

    return {
      name: item.name ?? "Item",
      qty,
      unitPrice,
      lineTotal,
      details: optionsText,
    };
  });
};
 
export const getSubtotal = (data: OrderNotificationData) => {
    const fromItems = getItems(data).reduce(
        (sum, item) => sum + item.lineTotal,
        0
    );
    // fallback: total = subtotal + delivery + taxes - discount
    return (
        fromItems ||
        Number(data.total) -
            Number(data.deliveryCharges ?? 0) -
            Number(data.taxes ?? 0) +
            Number(data.discount ?? 0)
    );
};



