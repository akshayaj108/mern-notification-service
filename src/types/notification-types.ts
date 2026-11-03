export interface Message {
    to: string;
    text: string;
    html?: string;
    subject?: string;
};

export interface NotificationTransport {
    send(message: Message): Promise<void>;
}

export type Price = number | string;

export interface NotificationCustomer {
  _id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface NotificationTopping {
  name?: string;
  price?: Price;
}

export interface NotificationPriceConfiguration {
  availableOptions?: Record<string, Price>;
}

export interface NotificationCartItem {
  _id?: string;
  name?: string;
  qty?: number | string;

  priceConfiguration?: Record<
    string,
    NotificationPriceConfiguration
  >;

  choosenConfiguration?: {
    priceConfiguration?: Record<string, string>;
    selectedToppings?: NotificationTopping[];
  };
}

export interface OrderNotificationData {
  _id?: string;
  cart?: NotificationCartItem[];

  customerId?: string | NotificationCustomer | null;

  address?: string;
  comment?: string;

  deliveryCharges?: Price;
  discount?: Price;
  taxes?: Price;
  total?: Price;

  tenantId?: string;
  orderStatus?: string;
  paymentMode?: string;
  paymentStatus?: string;
  paymentId?: string;

  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface EmailOrderItem {
  name: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
  details: string;
}