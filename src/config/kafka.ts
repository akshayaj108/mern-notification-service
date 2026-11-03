import config from "config";
import { Consumer, EachMessagePayload, Kafka, KafkaConfig } from "kafkajs";
import { MessageBroker } from "../types/broker";
import { handleNotificationMail } from "../handlers/handlMail";

export class KafkaBroker implements MessageBroker {
  private consumer: Consumer;

  constructor(clientId: string, brokers: string[]) {
    let kafkaConfig: KafkaConfig = {
      clientId,
      brokers
    };
    if(process.env.NODE_ENV === "production"){
      kafkaConfig = {
        ...kafkaConfig,
        ssl: true,
        connectionTimeout: 45000, //45 sec ref by ofc docs,
        sasl: {
          mechanism: "plain",
          username: config.get("kafka.sasl.username"),
          password: config.get("kafka.sasl.password")
        }
      }
    }
    //refer by docs of kafka js
    const kafka = new Kafka(kafkaConfig);
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
        if (!message.value) {
        throw new Error("Received Kafka message with empty value")
    }
        // Logic to handle incoming messages.
        console.log({
          value: message.value.toString(),
          topic,
          partition,
        });
        if(topic === "order"){
          handleNotificationMail(message)
        }
      },
    });
  }
}
