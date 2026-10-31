import { MailTransport } from "../mails";
import { NotificationTransport } from "../types/notification-types"

export const createNotificationTransport = (
    type: "mail" | "sms"
) => {
    const transports: NotificationTransport[] = [];

    switch (type) {
        case "mail": {
            const requiredTransportCache = transports.find((transport) => transport instanceof MailTransport);
            if (requiredTransportCache) return requiredTransportCache;
            const transportIntance = new MailTransport();
            transports.push(transportIntance)
            return transportIntance;
        }
        case "sms":
            throw new Error("SMS notification is not supported currently.");

        default:
            throw new Error(`${type} notification provider is not supported`);
    }
}