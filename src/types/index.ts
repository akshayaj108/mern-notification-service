
export enum PaymentMode {
  CARD = "card",
  CASH = "cash",
};


export enum PaymentStatus {
  PENDING = "pending",
  PAID = "paid",
  FAILED = "failed",
};

export enum EVENT_TYPE {
  ORDER_CREATE = "ORDER_CREATE",
  PAYMENT_STATUS_UPDATE = "PAYMENT_STATUS_UPDATE",
  ORDER_STATUS_UPDATE = "ORDER_STATUS_UPDATE"
};