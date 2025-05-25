import mongoose, { Schema, type Document, type Model } from "mongoose"

export enum FriendRequestStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  REJECTED = "rejected"
}

export interface IFriendRequest extends Document {
  sender: mongoose.Types.ObjectId
  recipient: mongoose.Types.ObjectId
  status: FriendRequestStatus
  createdAt: Date
  updatedAt: Date
}

const FriendRequestSchema = new Schema<IFriendRequest>(
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
    status: {
      type: String,
      enum: Object.values(FriendRequestStatus),
      default: FriendRequestStatus.PENDING
    }
  },
  { timestamps: true }
)

// Ensure unique friend requests
FriendRequestSchema.index({ sender: 1, recipient: 1 }, { unique: true })

const FriendRequest: Model<IFriendRequest> = mongoose.models.FriendRequest ||
  mongoose.model<IFriendRequest>("FriendRequest", FriendRequestSchema)

export default FriendRequest
