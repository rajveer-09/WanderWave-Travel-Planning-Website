import mongoose from "mongoose";

const MONGODB_URI =
  "mongodb+srv://auctionwars:auctionwars101@auction.wq0rp.mongodb.net/?retryWrites=true&w=majority&appName=Auction";

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

// Extend the NodeJS.Global interface to include mongoose
declare global {
  var mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

let cached =
  (global as typeof globalThis).mongoose ||
  ((global as typeof globalThis).mongoose = { conn: null, promise: null });

async function connectDB() {
  if (cached.conn) {
    let cached =
      global.mongoose || (global.mongoose = { conn: null, promise: null });
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongooseInstance) => {
        return mongooseInstance;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
