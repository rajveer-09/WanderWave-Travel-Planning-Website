import mongoose, { Schema, Document, Model } from "mongoose";
import { TripCategory } from "../constants/trip-categories";
import Expense from "./expense.model"; // Import Expense model to ensure it's registered

export enum MemberRole {
  AUTHOR = "author",
  CO_LEADER = "co_leader",
  PARTICIPANT = "participant",
}

export enum MemberStatus {
  INVITED = "invited",
  PENDING = "pending",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
  REQUESTED = "requested", // New status for when a user requests to join
}

export interface ITripMember {
  user: mongoose.Types.ObjectId;
  role: MemberRole;
  status: MemberStatus;
  addedBy: mongoose.Types.ObjectId;
}

export interface ITrip extends Document {
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  category: TripCategory;
  isPublic: boolean;
  thumbnail: string; // New field for trip thumbnail
  minMembers: number; // New field for minimum members required
  members: ITripMember[];
  expenses: mongoose.Types.ObjectId[];
  wallet: {
    balance: number;
    pendingWithdrawal: boolean;
    withdrawalApprovals: mongoose.Types.ObjectId[];
  };
}

const TripSchema = new Schema<ITrip>(
  {
    name: {
      type: String,
      required: [true, "Please provide a trip name"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Please provide a description"],
      trim: true,
    },
    startDate: {
      type: Date,
      required: [true, "Please provide a start date"],
    },
    endDate: {
      type: Date,
      required: [true, "Please provide an end date"],
    },
    category: {
      type: String,
      enum: Object.values(TripCategory),
      default: TripCategory.OTHER,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    thumbnail: {
      type: String,
      default: "/images/placeholder.jpg", // Default placeholder image
    },
    minMembers: {
      type: Number,
      default: 2, // Default minimum members
      min: 1, // At least 1 member (the author)
    },
    members: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        role: {
          type: String,
          enum: Object.values(MemberRole),
          default: MemberRole.PARTICIPANT,
        },
        status: {
          type: String,
          enum: Object.values(MemberStatus),
          default: MemberStatus.PENDING,
        },
        addedBy: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
      },
    ],
    expenses: [
      {
        type: Schema.Types.ObjectId,
        ref: Expense,
      },
    ],
    wallet: {
      balance: {
        type: Number,
        default: 0,
      },
      pendingWithdrawal: {
        type: Boolean,
        default: false,
      },
      withdrawalApprovals: [
        {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
      ],
    },
  },
  { timestamps: true }
);

const Trip: Model<ITrip> =
  mongoose.models.Trip || mongoose.model<ITrip>("Trip", TripSchema);

export default Trip;
