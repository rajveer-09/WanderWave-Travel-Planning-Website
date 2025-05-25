declare module "razorpay" {
  export interface RazorpayOptions {
    key_id: string;
    key_secret: string;
  }

  export interface RazorpayOrderOptions {
    amount: number;
    currency: string;
    receipt?: string;
    notes?: Record<string, string>;
    payment_capture?: 0 | 1;
  }

  export interface RazorpayOrder {
    id: string;
    entity: string;
    amount: number;
    amount_paid: number;
    amount_due: number;
    currency: string;
    receipt: string;
    status: string;
    attempts: number;
    notes: Record<string, string>;
    created_at: number;
  }

  export interface RazorpayPayment {
    id: string;
    entity: string;
    amount: number;
    currency: string;
    status: string;
    order_id: string;
    invoice_id: string | null;
    international: boolean;
    method: string;
    amount_refunded: number;
    refund_status: string | null;
    captured: boolean;
    description: string | null;
    card_id: string | null;
    bank: string | null;
    wallet: string | null;
    vpa: string | null;
    email: string;
    contact: string;
    notes: Record<string, string>;
    fee: number;
    tax: number;
    error_code: string | null;
    error_description: string | null;
    created_at: number;
  }

  export default class Razorpay {
    constructor(options: RazorpayOptions);

    orders: {
      create(options: RazorpayOrderOptions): Promise<RazorpayOrder>;
      fetch(orderId: string): Promise<RazorpayOrder>;
      all(options?: object): Promise<{ items: RazorpayOrder[] }>;
    };

    payments: {
      fetch(paymentId: string): Promise<RazorpayPayment>;
      all(options?: object): Promise<{ items: RazorpayPayment[] }>;
      capture(paymentId: string, amount: number): Promise<RazorpayPayment>;
      refund(paymentId: string, amount?: number): Promise<any>;
    };
  }
}
