/* Subject                                                             */

import { BRAND } from "../constants";
import { EVENT_TYPE } from "../types";
import { OrderNotificationData } from "../types/notification-types";
import { money, orderRef } from "./orderHandler";

export const capitalizeFirstChar = (status: string): string => {
  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/^./, (char) => char.toUpperCase());
};
/* ------------------------------------------------------------------ */
export const handleSubject = (evenType: string, data: OrderNotificationData) => {
    switch (evenType) {
        case EVENT_TYPE.ORDER_CREATE:
            return `Order #${orderRef(data)} confirmed – ${money(data.total)} | ${BRAND.name}`;
        case EVENT_TYPE.PAYMENT_STATUS_UPDATE:
            return `Payment update for order #${orderRef(data)} | ${BRAND.name}`;
        case EVENT_TYPE.ORDER_STATUS_UPDATE:
            return `Your order #${orderRef(data)} is now ${capitalizeFirstChar(data.orderStatus ?? "-")} | ${BRAND.name}`;
        default:
            return `Update on your order #${orderRef(data)} | ${BRAND.name}`;
    }
};