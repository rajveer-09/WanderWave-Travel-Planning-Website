import Razorpay from "razorpay";

// Use environment variables or fallback to hardcoded test values
const RAZORPAY_KEY_ID =
  process.env.RAZORPAY_KEY_ID || "rzp_test_hylrDzoeoSNVKm";
const RAZORPAY_KEY_SECRET =
  process.env.RAZORPAY_KEY_SECRET || "KJfN1SqGBozf5fRGCylIRwe7";

// Export key ID for client-side usage
export const RAZORPAY_CLIENT_KEY_ID = RAZORPAY_KEY_ID;

// Log which keys we're using (without revealing the full secret)
console.log(`Initializing Razorpay with key_id: ${RAZORPAY_KEY_ID}`);
console.log(
  `Using key_secret: ${
    RAZORPAY_KEY_SECRET
      ? "********" + RAZORPAY_KEY_SECRET.slice(-4)
      : "not provided"
  }`
);

let razorpayClient: any;

try {
  // Create Razorpay instance
  razorpayClient = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
  });

  // Log successful initialization
  console.log("Razorpay client initialized successfully");
} catch (error) {
  console.error("Failed to initialize Razorpay client:", error);

  // Create a fallback razorpay object that logs errors
  razorpayClient = {
    orders: {
      create: async () => {
        throw new Error(
          "Razorpay client initialization failed. Payment gateway is unavailable."
        );
      },
    },
    payments: {
      fetch: async (paymentId: string) => {
        throw new Error(
          "Razorpay client initialization failed. Payment gateway is unavailable."
        );
      },
    },
  };
}

export default razorpayClient;
