import mongoose, { Schema, type Document, type Model } from "mongoose"

export enum PaymentStatus {
  PENDING = "pending",
  PARTIAL = "partial",
  COMPLETED = "completed",
}

export interface IExpenseShare {
  user: mongoose.Types.ObjectId
  amount: number
  amountPaid: number
  status: PaymentStatus
}

export interface IExpense extends Document {
  trip: mongoose.Types.ObjectId
  title: string
  description?: string
  amount: number
  date: Date
  addedBy: mongoose.Types.ObjectId
  shares: IExpenseShare[]
}

const ExpenseSchema = new Schema<IExpense>(
  {
    trip: {
      type: Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Please provide an expense title"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, "Please provide an amount"],
      min: [0, "Amount cannot be negative"],
    },
    date: {
      type: Date,
      default: Date.now,
    },
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    shares: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        amount: {
          type: Number,
          required: true,
          min: [0, "Amount cannot be negative"],
        },
        amountPaid: {
          type: Number,
          default: 0,
          min: [0, "Amount paid cannot be negative"],
        },
        status: {
          type: String,
          enum: Object.values(PaymentStatus),
          default: PaymentStatus.PENDING,
        },
      },
    ],
  },
  { timestamps: true },
)

const Expense: Model<IExpense> = mongoose.models.Expense || mongoose.model<IExpense>("Expense", ExpenseSchema)

export default Expense

