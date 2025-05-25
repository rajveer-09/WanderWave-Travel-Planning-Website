import Stripe from "stripe";

// Use environment variables or fallback to provided test values
const STRIPE_SECRET_KEY =
  process.env.STRIPE_SECRET_KEY ||
  "sk_test_51QnhT1RuPopRx4Z1PINEplI99hqtSiD6JD0K8dIVeLlITEdsABGNkiOvi1XCCUMGpL7teBHuMmZDNnbSkU38wc2R00k3IjseWj";
export const STRIPE_PUBLISHABLE_KEY =
  process.env.STRIPE_PUBLISHABLE_KEY ||
  "pk_test_51QnhT1RuPopRx4Z1z5YzCAOTE7qy5XQNJ91AYzkdg0u6umFUDWRSJ8dZ8rUslAGN5Y9y8IkhA3vdPXq2vwG4hhiT0089ftCMIZ";

// Log which keys we're using (without revealing the full secret)
console.log(
  `Initializing Stripe with publishable key: ${STRIPE_PUBLISHABLE_KEY}`
);
console.log(
  `Using secret key: ${
    STRIPE_SECRET_KEY
      ? "sk_********" + STRIPE_SECRET_KEY.slice(-4)
      : "not provided"
  }`
);

// Create a mock Stripe client for when initialization fails
const createMockStripeClient = (): Stripe => {
  const mockError = new Error("Stripe client not properly initialized");

  return {
    paymentIntents: {
      create: async () => {
        throw mockError;
      },
      retrieve: async () => {
        throw mockError;
      },
      update: async () => {
        throw mockError;
      },
      cancel: async () => {
        throw mockError;
      },
    },
    // Add other necessary mock methods/properties to satisfy the Stripe type
  } as unknown as Stripe;
};

// Initialize Stripe client
let stripeClient: Stripe;

try {
  // Create Stripe instance
  stripeClient = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: "2025-03-31.basil", // Use a stable API version
  });

  // Log successful initialization
  console.log("Stripe client initialized successfully");
} catch (error) {
  console.error("Failed to initialize Stripe client:", error);

  // Use mock client if initialization fails
  console.warn("Using mock Stripe client - payments will fail!");
  stripeClient = createMockStripeClient();
}

export default stripeClient;
