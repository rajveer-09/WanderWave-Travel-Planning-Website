import mongoose, { Schema, type Document, type Model } from "mongoose"

export interface IMessage extends Document {
  trip: mongoose.Types.ObjectId
  sender: mongoose.Types.ObjectId
  content: string
  readBy: mongoose.Types.ObjectId[]
}

const MessageSchema = new Schema<IMessage>(
  {
    trip: {
      type: Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: [true, "Please provide a message content"],
      trim: true,
    },
    readBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true },
)

const Message: Model<IMessage> = mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema)

export default Message

