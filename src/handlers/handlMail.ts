import { Message } from "kafkajs";
import { createNotificationTransport } from "../factories/notification-factory";
import { handleSubject } from "./handleSubject";
import { handleText } from "./handleText";
import { handleHtml } from "./handleHtml";


export const handleNotificationMail = async (message: Message) => {
  try {
    const order = JSON.parse(message.value!.toString());
    const orderDetails = order.data;
    const eventType = order.event_type;

    const recipient = "akshay.jadhao108@gmail.com";
    
    const transport = createNotificationTransport("mail");

    await transport.send({
      to: recipient,
      subject: handleSubject(eventType, orderDetails),
      text: handleText(eventType, orderDetails),
      html: handleHtml(eventType, orderDetails),
    });
  } catch (err) {
    console.error("Failed to send order mail", err);
  }
};