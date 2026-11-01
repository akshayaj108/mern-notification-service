


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
 
export const orderRef = (data: any) =>
    String(data?._id ?? "").slice(-8).toUpperCase();
 
export const customerName = (data: any) =>
    [data?.customerId?.firstName, data?.customerId?.lastName]
        .filter(Boolean)
        .join(" ") || "there";

export const orderDate = (data: any) =>
    new Date(data?.createdAt ?? Date.now()).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
 
export const paymentLabel = (data: any) => {
    const mode = data?.paymentMode === "cash" ? "Cash on Delivery" : "Card";
    const status = String(data?.paymentStatus ?? "pending");
    return { mode, status: status.charAt(0).toUpperCase() + status.slice(1) };
};


 
/**
 * cart items are logged as [Object], so the exact shape is unknown.
 * This normaliser is defensive – adjust the field names to your cart schema.
 */
export const getItems = (data: any) => {
    const cart = data.cart ?? [];

    return cart.map((item: any) => {
        const qty = Number(item.qty ?? 1);
 
        const allPrices = item.priceConfiguration ?? {};
        const selectedOptions = item.choosenConfiguration?.priceConfiguration ?? {};
        const selectedToppings = item.choosenConfiguration?.selectedToppings ?? [];
 
        // Step 1: add the price of every selected option (Size, Crust, Chilling ...)
        let unitPrice = 0;
        for (const [group, option] of Object.entries(selectedOptions)) {
            // example: group = "Size", option = "Medium"  ->  allPrices.Size.availableOptions.Medium = 550
            const price = allPrices[group]?.availableOptions?.[option as string] ?? 0;
            unitPrice += Number(price);
        }
 
        // Step 2: add the price of every selected topping
        for (const topping of selectedToppings) {
            unitPrice += Number(topping.price ?? 0);
        }
 
        // Step 3: multiply by quantity
        const lineTotal = unitPrice * qty;
 
        // Step 4: text shown under the item name, e.g. "Size: Medium • Crust: Thick"
        const optionsText = Object.entries(selectedOptions)
            .map(([group, option]) => `${group}: ${option}`)
            .join(" • ");
 
        return {
            name: item.name,
            qty,
            unitPrice,
            lineTotal,
            details: optionsText,
        };
    });
};
 
export const getSubtotal = (data: any) => {
    const fromItems = getItems(data).reduce(
        (sum: number, i: any) => sum + i.lineTotal,
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



