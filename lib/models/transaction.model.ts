import mongoose, { Schema, type Document, type Model } from "mongoose"

export enum TransactionType {
  PAYMENT = "payment",
  WITHDRAWAL = "withdrawal",
  DEPOSIT = "deposit",
  TRANSFER = "transfer",
}

export enum TransactionStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
}

export interface ITransaction extends Document {
  user: mongoose.Types.ObjectId
  trip?: mongoose.Types.ObjectId
  expense?: mongoose.Types.ObjectId
  type: TransactionType
  amount: number
  status: TransactionStatus
  description: string
  paymentId?: string
  metadata?: Record<string, any>
}

const TransactionSchema = new Schema<ITransaction>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    trip: {
      type: Schema.Types.ObjectId,
      ref: "Trip",
    },
    expense: {
      type: Schema.Types.ObjectId,
      ref: "Expense",
    },
    type: {
      type: String,
      enum: Object.values(TransactionType),
      required: true,
    },
    amount: {
      type: Number,
      required: [true, "Please provide an amount"],
      min: [0, "Amount cannot be negative"],
    },
    status: {
      type: String,
      enum: Object.values(TransactionStatus),
      default: TransactionStatus.PENDING,
    },
    description: {
      type: String,
      required: [true, "Please provide a description"],
      trim: true,
    },
    paymentId: {
      type: String,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  { timestamps: true },
)

const Transaction: Model<ITransaction> =
  mongoose.models.Transaction || mongoose.model<ITransaction>("Transaction", TransactionSchema)

export default Transaction

