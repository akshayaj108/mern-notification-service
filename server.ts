import logger from "./src/config/logger";
import { createMessageBroker } from "./src/factories/broker-factory";
import { MessageBroker } from "./src/types/broker";

const startServer = async () => {

  let broker: MessageBroker | null = null;
  try {
    broker = createMessageBroker();
    await broker.connectConsumer();
    await broker.consumeMessage(["order"], false);
  } catch (err) {
     if(broker){
      await broker.disconnectConsumer();
    }
    if (err instanceof Error) {
    logger.error("Error happened:", err.message);
  } else {
    logger.error("Unknown error happened:", String(err));
  }

  process.exit(1);
  }
};

void startServer();
