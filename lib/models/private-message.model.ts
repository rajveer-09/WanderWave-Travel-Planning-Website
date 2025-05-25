import mongoose, { Schema, type Document, type Model } from "mongoose"

export interface IPrivateMessage extends Document {
  sender: mongoose.Types.ObjectId
  recipient: mongoose.Types.ObjectId
  content: string
  read: boolean
  createdAt: Date
}

const PrivateMessageSchema = new Schema<IPrivateMessage>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    content: {
      type: String,
      required: [true, "Message content is required"],
      trim: true
    },
    read: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
)

// Create indexes for querying messages between users
PrivateMessageSchema.index({ sender: 1, recipient: 1 })
PrivateMessageSchema.index({ recipient: 1, read: 1 })

const PrivateMessage: Model<IPrivateMessage> = mongoose.models.PrivateMessage ||
  mongoose.model<IPrivateMessage>("PrivateMessage", PrivateMessageSchema)

export default PrivateMessage
