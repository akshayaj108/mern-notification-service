/* Plain text                                                          */

import { BRAND } from "../constants";
import { EVENT_TYPE } from "../types";
import { OrderNotificationData } from "../types/notification-types";
import { capitalizeFirstChar } from "./handleSubject";
import { customerName, getItems, getSubtotal, money, orderDate, orderRef, paymentLabel } from "./orderHandler";

/* ------------------------------------------------------------------ */
export const handleText = (evenType: string, data: OrderNotificationData) => {
    switch (evenType) {
        case EVENT_TYPE.ORDER_CREATE: {
            const { mode, status } = paymentLabel(data);
            const items = getItems(data)
                .map(
                    (item) =>
                        `  - ${item.name} x ${item.qty}  ${money(item.lineTotal)}` +
                        (item.details ? `\n    ${item.details}` : "")
                )
                .join("\n");
 
            return [
                `Hi ${customerName(data)},`,
                ``,
                `Thank you for your order! We have received it and our kitchen is getting started.`,
                ``,
                `ORDER SUMMARY`,
                `Order ID : #${orderRef(data)}`,
                `Placed on: ${orderDate(data)}`,
                `Deliver to: ${data.address}`,
                data.comment ? `Note     : ${data.comment}` : ``,
                ``,
                `ITEMS`,
                items || `  (no items)`,
                ``,
                `Subtotal         : ${money(getSubtotal(data))}`,
                `Delivery charges : ${money(data.deliveryCharges)}`,
                `Taxes            : ${money(data.taxes)}`,
                `Discount         : -${money(data.discount)}`,
                `TOTAL            : ${money(data.total)}`,
                ``,
                `Payment: ${mode} (${status})`,
                ``,
                `Track your order: ${BRAND.trackUrl}/${data._id}`,
                ``,
                `Need help? Reply to this email or contact ${BRAND.supportEmail} / ${BRAND.supportPhone}.`,
                ``,
                `Thanks,`,
                `Team ${BRAND.name}`,
            ]
                .filter((l) => l !== undefined)
                .join("\n");
        }
        default:
            return `Hi ${customerName(data)}, there is an update on your order #${orderRef(data)}. Current status: ${capitalizeFirstChar(data.orderStatus ?? "-")}. Team ${BRAND.name}`;
    }
};
