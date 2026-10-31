import { Consumer, EachMessagePayload, Kafka } from "kafkajs";
import { MessageBroker } from "../types/broker";
import { createNotificationTransport } from "../factories/notification-factory";
import { handleHtml, handleSubject, handleText } from "../handlers/orderHandler";

export class KafkaBroker implements MessageBroker {
  private consumer: Consumer;

  constructor(clientId: string, brokers: string[]) {
    const kafka = new Kafka({ clientId, brokers });

    this.consumer = kafka.consumer({ groupId: clientId });
  }

  /**
   * Connect the consumer
   */
  async connectConsumer() {
    await this.consumer.connect();
  }

  /**
   * Disconnect the consumer
   */
  async disconnectConsumer() {
    await this.consumer.disconnect();
  }

  async consumeMessage(topics: string[], fromBeginning: boolean = false) {
    await this.consumer.subscribe({ topics, fromBeginning });

    await this.consumer.run({
      eachMessage: async ({
        topic,
        partition,
        message,
      }: EachMessagePayload) => {
        // Logic to handle incoming messages.
        console.log({
          value: message.value.toString(),
          topic,
          partition,
        });
        if(topic === "order"){
          const order = JSON.parse(message.value.toString());
          const orderDetails = order.data;
          const evenType = order.event_type;
          const transport = createNotificationTransport("mail");
          transport.send({
            to: "<alice@example.com>, <bob@example.com>",
            subject: handleSubject(order),
            text: handleText(orderDetails),
            html: handleHtml(order),
          })
        }
      },
    });
  }
}
